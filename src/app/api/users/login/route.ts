import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/definitions';
// In a real app, use a library like bcrypt for password comparison
// import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.get<User>('SELECT id, name, email, password, role, student_id, faculty_id, department FROM users WHERE email = ?', email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // In a real app, compare hashed passwords
    // const isPasswordValid = await bcrypt.compare(password, user.password!);
    const isPasswordValid = user.password === password; // Placeholder for actual comparison

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
