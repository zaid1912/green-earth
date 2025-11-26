// Admin Dashboard API
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as DashboardRepository from '@/lib/db/repository/dashboard.repository';

// GET /api/dashboard/admin - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const stats = await DashboardRepository.getAdminDashboardStats(dbType);

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}
