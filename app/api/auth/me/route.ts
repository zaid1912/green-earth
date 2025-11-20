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
          volunteerId: volunteer.VOLUNTEER_ID,
          name: volunteer.NAME,
          email: volunteer.EMAIL,
          phone: volunteer.PHONE,
          role: volunteer.ROLE,
          status: volunteer.STATUS,
          joinDate: volunteer.JOIN_DATE,
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
