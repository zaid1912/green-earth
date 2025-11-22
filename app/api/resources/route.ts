// Resources API
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { createResourceSchema } from '@/lib/validations/schemas';
import { getAllResources, getResourcesByProject, createResource } from '@/lib/db/queries/resources';

// GET /api/resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let resources;
    if (projectId) {
      resources = await getResourcesByProject(parseInt(projectId));
    } else {
      resources = await getAllResources();
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

    const resourceId = await createResource(
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
