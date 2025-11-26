// Leave Project API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as ProjectRepository from '@/lib/db/repository/projects.repository';

// POST /api/projects/[id]/leave - Leave a project (authenticated volunteers)
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

    // Leave project
    const success = await ProjectRepository.leaveProject(dbType, user.volunteer_id, projectId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to leave project. You may not be a member.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully left project',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Leave project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to leave project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
