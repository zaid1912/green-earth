// Volunteers API - Individual Volunteer Operations
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { deleteVolunteer, getVolunteerById } from '@/lib/db/queries/volunteers';

// GET /api/volunteers/[id] - Get single volunteer (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const volunteerId = parseInt(params.id);
    if (isNaN(volunteerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid volunteer ID' },
        { status: 400 }
      );
    }

    const volunteer = await getVolunteerById(volunteerId);

    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: volunteer }, { status: 200 });
  } catch (error: any) {
    console.error('Get volunteer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch volunteer', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/volunteers/[id] - Delete volunteer (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const volunteerId = parseInt(params.id);
    if (isNaN(volunteerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid volunteer ID' },
        { status: 400 }
      );
    }

    const success = await deleteVolunteer(volunteerId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Volunteer deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete volunteer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete volunteer', details: error.message },
      { status: 500 }
    );
  }
}
