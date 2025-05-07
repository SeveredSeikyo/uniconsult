import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User, UserRole } from '@/lib/definitions';
// import bcrypt from 'bcryptjs'; // For password hashing in a real app

// GET all faculty members
export async function GET() {
  // TODO: Add admin role verification middleware in a real app
  try {
    const db = await getDb();
    const faculty = await db.all<User[]>('SELECT id, name, email, faculty_id, department FROM users WHERE role = ? ORDER BY name ASC', 'faculty');
    return NextResponse.json(faculty, { status: 200 });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to create a new faculty account
export async function POST(req: NextRequest) {
  // TODO: Add admin role verification middleware
  try {
    const db = await getDb();
    const { name, email, password, faculty_id, department } = await req.json() as Partial<User> & { password?: string };

    if (!name || !email || !password || !faculty_id || !department) {
      return NextResponse.json({ error: 'Missing required fields for faculty creation' }, { status: 400 });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ? OR faculty_id = ?', email, faculty_id);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or faculty ID already exists' }, { status: 409 });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // Placeholder

    const role: UserRole = 'faculty';
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, faculty_id, department) VALUES (?, ?, ?, ?, ?, ?)',
      name, email, hashedPassword, role, faculty_id, department
    );

    if (!result.lastID) {
        return NextResponse.json({ error: 'Failed to create faculty account' }, { status: 500 });
    }
    
    // Create initial faculty_status record
    await db.run(
        'INSERT INTO faculty_status (faculty_id, status, last_updated) VALUES (?, ?, ?)',
        result.lastID,
        'Offline', // Default status
        new Date().toISOString()
    );


    const newUser: Partial<User> = { id: result.lastID, name, email, role, faculty_id, department };
    return NextResponse.json({ message: 'Faculty account created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating faculty account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
