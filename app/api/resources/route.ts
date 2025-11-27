// Resources API
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { createResourceSchema } from '@/lib/validations/schemas';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as ResourceRepository from '@/lib/db/repository/resources.repository';

// GET /api/resources
export async function GET(request: NextRequest) {
  try {
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let resources;
    if (projectId) {
      resources = await ResourceRepository.getResourcesByProject(dbType, parseInt(projectId));
    } else {
      resources = await ResourceRepository.getAllResources(dbType);
    }

    return NextResponse.json({ success: true, data: resources }, { status: 200 });
  } catch (error: any) {
    console.error('Get resources error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create new resource (admin only)
export async function POST(request: NextRequest) {
  try {
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const validation = createResourceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { projectId, name, type, quantity, description } = validation.data;

    const resourceId = await ResourceRepository.createResource(
      dbType,
      projectId,
      name,
      quantity,
      type || '',
      description
    );

    return NextResponse.json(
      { success: true, message: 'Resource created successfully', data: { resourceId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource', details: error.message },
      { status: 500 }
    );
  }
}
