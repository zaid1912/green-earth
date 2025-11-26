// Events API - Individual Event Operations
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { updateEventSchema } from '@/lib/validations/schemas';
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as EventRepository from '@/lib/db/repository/events.repository';

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await EventRepository.getEventById(dbType, eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event }, { status: 200 });
  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (validation.data.name) updateData.name = validation.data.name;
    if (validation.data.description) updateData.description = validation.data.description;
    if (validation.data.eventDate) updateData.eventDate = new Date(validation.data.eventDate);
    if (validation.data.location) updateData.location = validation.data.location;
    if (validation.data.maxParticipants) updateData.maxParticipants = validation.data.maxParticipants;

    const success = await EventRepository.updateEvent(dbType, eventId, updateData);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Event not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Event updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    // Get the selected database type from cookies
    const dbType = getSelectedDatabaseFromRequest(request);

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const success = await EventRepository.deleteEvent(dbType, eventId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event', details: error.message },
      { status: 500 }
    );
  }
}
