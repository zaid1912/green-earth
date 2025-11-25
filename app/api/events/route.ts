// Events API - List All & Create
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { createEventSchema } from '@/lib/validations/schemas';
import { getAllEvents, getEventsByProject, getEventsForVolunteer, createEvent } from '@/lib/db/queries/events';

// GET /api/events - Get all events (or filter by project/volunteer)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const volunteerId = searchParams.get('volunteerId');

    let events;
    if (volunteerId) {
      events = await getEventsForVolunteer(parseInt(volunteerId));
    } else if (projectId) {
      events = await getEventsByProject(parseInt(projectId));
    } else {
      events = await getAllEvents();
    }

    return NextResponse.json(
      {
        success: true,
        data: events,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();

    // Validate input
    const validation = createEventSchema.safeParse(body);
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

    const { projectId, name, description, eventDate, location, maxParticipants } = validation.data;

    // Create event
    const eventId = await createEvent(
      projectId,
      name,
      description,
      new Date(eventDate),
      location,
      maxParticipants
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Event created successfully',
        data: { eventId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
