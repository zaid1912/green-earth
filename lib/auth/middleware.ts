// Authentication Middleware for API Routes
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { JWTPayload } from '@/types/database';
import { cookies } from 'next/headers';

/**
 * Get the current user from the request
 */
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // Verify and decode token
    const user = verifyToken(token);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication for an API route
 * Returns the user or throws a NextResponse error
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload | NextResponse> {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return user;
}

/**
 * Require admin role for an API route
 * Returns the user or throws a NextResponse error
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload | NextResponse> {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Set auth cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
