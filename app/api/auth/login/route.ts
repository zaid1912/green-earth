// Login Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/schemas';
import { getVolunteerByEmail } from '@/lib/db/queries/volunteers';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Get volunteer by email
    const volunteer = await getVolunteerByEmail(email);
    if (!volunteer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (volunteer.STATUS !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is not active',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(
      password,
      volunteer.PASSWORD_HASH
    );
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken({
      volunteer_id: volunteer.VOLUNTEER_ID,
      email: volunteer.EMAIL,
      role: volunteer.ROLE,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          volunteerId: volunteer.VOLUNTEER_ID,
          name: volunteer.NAME,
          email: volunteer.EMAIL,
          role: volunteer.ROLE,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
