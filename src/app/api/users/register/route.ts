import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User, UserRole } from '@/lib/definitions';
// In a real app, use a library like bcrypt for password hashing
// import bcrypt from 'bcryptjs'; 

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const { name, email, password, role, student_id, faculty_id, department } = await req.json() as Partial<User> & { password?: string};

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['student', 'faculty'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role for self-registration. Admins must create faculty accounts.' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // In a real app, hash the password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // Placeholder for actual hashing

    const result = await db.run(
      'INSERT INTO users (name, email, password, role, student_id, faculty_id, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      name,
      email,
      hashedPassword,
      role,
      role === 'student' ? student_id : null,
      role === 'faculty' ? faculty_id : null, // Faculty ID typically assigned by admin or system
      role === 'faculty' ? department : null
    );

    const newUser: User = {
      id: result.lastID!,
      name,
      email,
      role: role as UserRole,
      student_id: role === 'student' ? student_id : undefined,
      faculty_id: role === 'faculty' ? faculty_id : undefined,
      department: role === 'faculty' ? department : undefined,
    };
    
    // If a faculty member registers, create an initial faculty_status record
    if (role === 'faculty' && result.lastID) {
        await db.run(
            'INSERT INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)',
            result.lastID,
            'Offline', // Default status
            new Date().toISOString()
        );
    }


    return NextResponse.json({ message: 'User registered successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
