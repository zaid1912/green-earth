// Projects API - Individual Project Operations
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth/middleware';
import { updateProjectSchema } from '@/lib/validations/schemas';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries/projects';

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
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

    const body = await request.json();

    // Validate input
    const validation = updateProjectSchema.safeParse(body);
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

    // Prepare update data
    const updateData: any = {};
    if (validation.data.name) updateData.name = validation.data.name;
    if (validation.data.description) updateData.description = validation.data.description;
    if (validation.data.startDate) updateData.startDate = new Date(validation.data.startDate);
    if (validation.data.endDate !== undefined) {
      updateData.endDate = validation.data.endDate ? new Date(validation.data.endDate) : null;
    }
    if (validation.data.status) updateData.status = validation.data.status;
    if (validation.data.location) updateData.location = validation.data.location;
    if (validation.data.maxVolunteers) updateData.maxVolunteers = validation.data.maxVolunteers;

    const success = await updateProject(projectId, updateData);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found or no changes made',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Project updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
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

    const success = await deleteProject(projectId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Project deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
