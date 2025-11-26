// Register New Volunteer
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/schemas';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as VolunteerRepository from '@/lib/db/repository/volunteers.repository';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    const { name, email, password, phone } = validation.data;

    // Check if email already exists
    const exists = await VolunteerRepository.emailExists(dbType, email);
    if (exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create volunteer (default role is 'volunteer')
    const volunteerId = await VolunteerRepository.createVolunteer(
      dbType,
      name,
      email,
      passwordHash,
      phone
    );

    // Generate JWT token
    const token = signToken({
      volunteer_id: volunteerId,
      email,
      role: 'volunteer',
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          volunteerId,
          name,
          email,
          role: 'volunteer',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
