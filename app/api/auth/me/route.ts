// Get Current User
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getVolunteerById } from '@/lib/db/queries/volunteers';

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const authUser = await getCurrentUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Get full volunteer details from database
    const volunteer = await getVolunteerById(authUser.volunteer_id);

    if (!volunteer) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          volunteer_id: volunteer.volunteer_id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          role: volunteer.role,
          status: volunteer.status,
          join_date: volunteer.join_date,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
