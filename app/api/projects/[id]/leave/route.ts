// Leave Project API
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { leaveProject } from '@/lib/db/queries/projects';

// POST /api/projects/[id]/leave - Leave a project (authenticated volunteers)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }
    const projectId = parseInt(params.id);

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
    const success = await leaveProject(user.volunteer_id, projectId);

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
