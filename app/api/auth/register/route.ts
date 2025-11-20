// Register New Volunteer
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/schemas';
import { createVolunteer, emailExists } from '@/lib/db/queries/volunteers';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
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
    const exists = await emailExists(email);
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
    const volunteerId = await createVolunteer(
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
