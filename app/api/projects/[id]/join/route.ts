// Join Project API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { joinProjectSchema } from '@/lib/validations/schemas';
import { joinProject } from '@/lib/db/queries/projects';

// POST /api/projects/[id]/join - Join a project (authenticated volunteers)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }
    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid project ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    // Validate input
    const validation = joinProjectSchema.safeParse(body);
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

    const { role } = validation.data;

    // Join project
    const success = await joinProject(user.volunteer_id, projectId, role);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to join project. It may be full or you are already a member.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined project',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Join project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
