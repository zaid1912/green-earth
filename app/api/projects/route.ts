// Projects API - List All & Create
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth/middleware';
import { createProjectSchema } from '@/lib/validations/schemas';
import { getAllProjects, createProject, getProjectsByStatus } from '@/lib/db/queries/projects';

// GET /api/projects - Get all projects (or filter by status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'planned' | 'active' | 'completed' | 'cancelled' | null;

    let projects;
    if (status) {
      projects = await getProjectsByStatus(status);
    } else {
      projects = await getAllProjects();
    }

    return NextResponse.json(
      {
        success: true,
        data: projects,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();

    // Validate input
    const validation = createProjectSchema.safeParse(body);
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

    const { orgId, name, description, startDate, endDate, status, location, maxVolunteers } = validation.data;

    // Create project
    const projectId = await createProject(
      orgId,
      name,
      description,
      new Date(startDate),
      endDate ? new Date(endDate) : null,
      status,
      location,
      maxVolunteers
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: { projectId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
