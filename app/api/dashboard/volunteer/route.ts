// Volunteer Dashboard API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getVolunteerDashboardStats } from '@/lib/db/queries/dashboard';

// GET /api/dashboard/volunteer - Get volunteer dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const stats = await getVolunteerDashboardStats(user.volunteer_id);

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get volunteer dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
