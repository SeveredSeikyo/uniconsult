import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/definitions';

// GET all users
export async function GET(req: NextRequest) {
  // TODO: Add admin role verification middleware in a real app
  // For now, we assume if this endpoint is hit, the role check passed on client/guard
  try {
    const db = await getDb();
    // Exclude passwords from the response
    const users = await db.all<Omit<User, 'password'>[]>('SELECT id, name, email, role, student_id, faculty_id, department FROM users ORDER BY role, name ASC');
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
