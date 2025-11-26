// Login Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/schemas';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as VolunteerRepository from '@/lib/db/repository/volunteers.repository';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Get volunteer by email
    const volunteer = await VolunteerRepository.getVolunteerByEmail(dbType, email);
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
    if (volunteer.status !== 'active') {
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
      volunteer.password_hash
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
      volunteer_id: volunteer.volunteer_id,
      email: volunteer.email,
      role: volunteer.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          volunteerId: volunteer.volunteer_id,
          name: volunteer.name,
          email: volunteer.email,
          role: volunteer.role,
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
