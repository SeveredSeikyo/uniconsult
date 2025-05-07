import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const consultationId = params.id;
    const { reason, cancelled_by_role } = await req.json() as { reason: string; cancelled_by_role: 'student' | 'faculty' }; // cancelled_by_user_id can also be passed for auth checks

    if (!consultationId || !reason || !cancelled_by_role) {
      return NextResponse.json({ error: 'Consultation ID, reason and canceller role are required' }, { status: 400 });
    }

    // Add authorization logic here: check if the logged-in user (student or faculty involved, or admin) is allowed to cancel
    // For this example, we'll assume the frontend has validated this based on logged-in user.
    // A real app would pass a user token and verify it here.

    const result = await db.run(
      "UPDATE consultations SET status = 'Cancelled', reason = ? WHERE id = ? AND status = 'Scheduled'",
      reason,
      consultationId
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Consultation not found, already cancelled/completed, or no change made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Consultation cancelled successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error cancelling consultation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
