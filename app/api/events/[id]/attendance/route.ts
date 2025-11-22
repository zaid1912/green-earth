// Event Attendance API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { markAttendanceSchema } from '@/lib/validations/schemas';
import { getAttendanceByEvent, markAttendance } from '@/lib/db/queries/attendance';

// GET /api/events/[id]/attendance - Get attendance list for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const attendance = await getAttendanceByEvent(eventId);

    return NextResponse.json({ success: true, data: attendance }, { status: 200 });
  } catch (error: any) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/attendance - Mark attendance (authenticated volunteers)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;
    const eventId = parseInt(params.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = markAttendanceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { status, notes } = validation.data;

    const success = await markAttendance(
      eventId,
      user.volunteer_id,
      status,
      notes
    );

    return NextResponse.json(
      { success: true, message: 'Attendance marked successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark attendance', details: error.message },
      { status: 500 }
    );
  }
}
