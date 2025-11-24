// Resources API - Individual Resource Operations
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { updateResourceSchema } from '@/lib/validations/schemas';
import { getResourceById, updateResource, deleteResource } from '@/lib/db/queries/resources';

// GET /api/resources/[id] - Get single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resourceId = parseInt(id);
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    const resource = await getResourceById(resourceId);

    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: resource }, { status: 200 });
  } catch (error: any) {
    console.error('Get resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resource', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[id] - Update resource (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const resourceId = parseInt(id);
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateResourceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (validation.data.name) updateData.name = validation.data.name;
    if (validation.data.type !== undefined) updateData.type = validation.data.type;
    if (validation.data.quantity !== undefined) updateData.quantity = validation.data.quantity;
    if (validation.data.description !== undefined) updateData.description = validation.data.description;

    const success = await updateResource(resourceId, updateData);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Resource not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Resource updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resource', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Delete resource (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const resourceId = parseInt(id);
    if (isNaN(resourceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    const success = await deleteResource(resourceId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Resource deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete resource error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource', details: error.message },
      { status: 500 }
    );
  }
}
