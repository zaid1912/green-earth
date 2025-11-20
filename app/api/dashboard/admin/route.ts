// Admin Dashboard API
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getAdminDashboardStats } from '@/lib/db/queries/dashboard';

// GET /api/dashboard/admin - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const stats = await getAdminDashboardStats();

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
