// Projects API - List All & Create
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, getCurrentUser } from '@/lib/auth/middleware';
import { createProjectSchema } from '@/lib/validations/schemas';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as ProjectRepository from '@/lib/db/repository/projects.repository';

// GET /api/projects - Get all projects (or filter by status/volunteer)
export async function GET(request: NextRequest) {
  try {
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'planned' | 'active' | 'completed' | 'cancelled' | null;
    const volunteerId = searchParams.get('volunteerId');

    let projects;
    if (volunteerId) {
      projects = await ProjectRepository.getProjectsByVolunteer(dbType, parseInt(volunteerId));
    } else if (status) {
      projects = await ProjectRepository.getProjectsByStatus(dbType, status);
    } else {
      // Check if user is authenticated to include join status
      const user = await getCurrentUser(request);
      if (user) {
        projects = await ProjectRepository.getAllProjectsWithJoinStatus(dbType, user.volunteer_id);
      } else {
        projects = await ProjectRepository.getAllProjects(dbType);
      }
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
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

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
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { orgId, name, description, startDate, endDate, status, location, maxVolunteers } = validation.data;

    // Create project
    const projectId = await ProjectRepository.createProject(
      dbType,
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
