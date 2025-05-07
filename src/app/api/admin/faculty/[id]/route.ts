import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// DELETE a faculty member
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: Add admin role verification middleware
  try {
    const db = await getDb();
    const facultyUserId = params.id;

    if (!facultyUserId) {
      return NextResponse.json({ error: 'Faculty user ID is required' }, { status: 400 });
    }
    
    // Check if faculty exists
    const faculty = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', facultyUserId, 'faculty');
    if (!faculty) {
        return NextResponse.json({ error: 'Faculty member not found' }, { status: 404 });
    }

    // SQLite will cascade delete related faculty_status and consultations due to ON DELETE CASCADE
    const result = await db.run('DELETE FROM users WHERE id = ? AND role = ?', facultyUserId, 'faculty');

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Faculty member not found or no change made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Faculty member deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting faculty member:', error);
    // Check for foreign key constraints if ON DELETE CASCADE isn't fully handling or if there are other dependencies
    if (error instanceof Error && error.message.includes("SQLITE_CONSTRAINT")) {
        return NextResponse.json({ error: 'Cannot delete faculty. They may have dependent records (e.g., consultations not properly cascaded). Please check database schema or manually resolve dependencies.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
