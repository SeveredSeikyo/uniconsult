import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Consultation, User } from '@/lib/definitions';

// GET consultations (can be filtered by student_id or faculty_id via query params)
export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    const facultyId = searchParams.get('faculty_id');
    const all = searchParams.get('all'); // For admin to get all

    let query = `
      SELECT 
        c.id, c.student_id, s.name as student_name, 
        c.faculty_id, f.name as faculty_name,
        c.datetime, c.status, c.reason
      FROM consultations c
      JOIN users s ON c.student_id = s.id
      JOIN users f ON c.faculty_id = f.id
    `;
    const queryParams: (string | number)[] = [];

    if (studentId) {
      query += ' WHERE c.student_id = ?';
      queryParams.push(studentId);
    } else if (facultyId) {
      query += ' WHERE c.faculty_id = ?';
      queryParams.push(facultyId);
    } else if (!all) {
      // If no specific ID and not 'all', this implies an issue or a need for role-based default
      return NextResponse.json({ error: 'student_id or faculty_id required, or specify all=true for admin access' }, { status: 400 });
    }
    
    query += ' ORDER BY c.datetime DESC';

    const consultations = await db.all<Consultation[]>(query, ...queryParams);
    return NextResponse.json(consultations, { status: 200 });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to create a new consultation
export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const { student_id, faculty_id, datetime } = await req.json() as { student_id: number; faculty_id: number; datetime: string };

    if (!student_id || !faculty_id || !datetime) {
      return NextResponse.json({ error: 'Student ID, Faculty ID, and datetime are required' }, { status: 400 });
    }

    // Basic validation for datetime (should be in future, etc. - can be enhanced)
    if (new Date(datetime) <= new Date()) {
      return NextResponse.json({ error: 'Consultation date and time must be in the future.' }, { status: 400 });
    }

    // Check if faculty is available (this is a simplified check; real app might check faculty_status table or specific time slots)
    const facultyUser = await db.get<User>('SELECT role FROM users WHERE id = ?', faculty_id);
    if (!facultyUser || facultyUser.role !== 'faculty') {
        return NextResponse.json({ error: 'Invalid faculty ID or user is not faculty.' }, { status: 400 });
    }

    // Check for existing consultation at the same time for the faculty
    const existingConsultation = await db.get(
      'SELECT id FROM consultations WHERE faculty_id = ? AND datetime = ? AND status = "Scheduled"',
      faculty_id, datetime
    );
    if (existingConsultation) {
      return NextResponse.json({ error: 'Faculty already has a consultation scheduled at this time.' }, { status: 409 });
    }

    const status = 'Scheduled';
    const result = await db.run(
      'INSERT INTO consultations (student_id, faculty_id, datetime, status) VALUES (?, ?, ?, ?)',
      student_id, faculty_id, datetime, status
    );
    
    const newConsultation: Partial<Consultation> = {
        id: result.lastID!,
        student_id,
        faculty_id,
        datetime,
        status: 'Scheduled'
    }

    return NextResponse.json({ message: 'Consultation booked successfully', consultation: newConsultation }, { status: 201 });
  } catch (error) {
    console.error('Error booking consultation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
