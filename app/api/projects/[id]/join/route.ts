// Join Project API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { joinProjectSchema } from '@/lib/validations/schemas';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as ProjectRepository from '@/lib/db/repository/projects.repository';

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

    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

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
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { role } = validation.data;

    // Join project
    const success = await ProjectRepository.joinProject(dbType, user.volunteer_id, projectId, role);

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
