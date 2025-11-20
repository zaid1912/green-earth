// Volunteers API - Admin Management
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getAllVolunteers, countVolunteersByStatus } from '@/lib/db/queries/volunteers';

// GET /api/volunteers - Get all volunteers (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'count') {
      const counts = await countVolunteersByStatus();
      return NextResponse.json({ success: true, data: counts }, { status: 200 });
    }

    const volunteers = await getAllVolunteers();

    return NextResponse.json({ success: true, data: volunteers }, { status: 200 });
  } catch (error: any) {
    console.error('Get volunteers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch volunteers', details: error.message },
      { status: 500 }
    );
  }
}
