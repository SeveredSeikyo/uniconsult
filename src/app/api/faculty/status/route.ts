import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { FacultyStatus, FacultyStatusOption, User } from '@/lib/definitions';

// GET all faculty statuses
export async function GET() {
  try {
    const db = await getDb();
    const statuses = await db.all<FacultyStatus[]>(`
      SELECT fs.id, fs.faculty_id, u.name as faculty_name, fs.status, fs.last_updated 
      FROM faculty_status fs
      JOIN users u ON fs.faculty_id = u.id
      WHERE u.role = 'faculty'
    `);
    return NextResponse.json(statuses, { status: 200 });
  } catch (error) {
    console.error('Error fetching faculty statuses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to update a faculty member's status
export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const { faculty_id, status } = await req.json() as { faculty_id: number; status: FacultyStatusOption };

    if (!faculty_id || !status) {
      return NextResponse.json({ error: 'Faculty ID and status are required' }, { status: 400 });
    }

    if (!['Available', 'In Class', 'Offline'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    
    // Verify faculty_id corresponds to a faculty user
    const facultyUser = await db.get<User>('SELECT id FROM users WHERE id = ? AND role = ?', faculty_id, 'faculty');
    if (!facultyUser) {
        return NextResponse.json({ error: 'Invalid faculty ID or user is not faculty' }, { status: 404 });
    }

    const last_updated = new Date().toISOString();
    
    // Use INSERT OR REPLACE (UPSERT) to handle both new and existing faculty status entries
    // This is useful if a faculty member might not have a status entry yet.
    const result = await db.run(
      'INSERT OR REPLACE INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)',
      faculty_id,
      status,
      last_updated
    );
    
    if (result.changes === 0) {
        // This case should ideally not be hit with INSERT OR REPLACE unless faculty_id doesn't exist in users table, which is checked above.
        return NextResponse.json({ error: 'Faculty status not found or no change made' }, { status: 404 });
    }

    const updatedStatus : FacultyStatus = {
        id: result.lastID ?? faculty_id, // For REPLACE, lastID is not updated, faculty_id is the key
        faculty_id,
        status,
        last_updated
    }

    return NextResponse.json({ message: 'Faculty status updated successfully', status: updatedStatus }, { status: 200 });
  } catch (error) {
    console.error('Error updating faculty status:', error);
    if (error instanceof Error && error.message.includes("SQLITE_CONSTRAINT_FOREIGNKEY")) {
        return NextResponse.json({ error: 'Invalid faculty ID: Does not exist in users table.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
