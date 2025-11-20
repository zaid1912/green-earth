// Logout Endpoint
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/middleware';

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Logout successful',
    },
    { status: 200 }
  );

  // Clear auth cookie
  clearAuthCookie(response);

  return response;
}
