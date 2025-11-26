// MongoDB Events Queries
import { getDB, COLLECTIONS } from '../connection';
import { Event } from '@/types/database';

/**
 * Get all events
 */
export async function getAllEvents(): Promise<Event[]> {
  const db = await getDB();

  const events = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $lookup: {
          from: COLLECTIONS.PROJECTS,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENT_ATTENDANCE,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'attendances',
        },
      },
      {
        $addFields: {
          project_name: { $arrayElemAt: ['$project.name', 0] },
          attendance_count: { $size: '$attendances' },
        },
      },
      {
        $project: {
          project: 0,
          attendances: 0,
        },
      },
      {
        $sort: { event_date: -1 },
      },
    ])
    .toArray();

  return events as any;
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: number): Promise<Event | null> {
  const db = await getDB();

  const events = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $match: { event_id: eventId },
      },
      {
        $lookup: {
          from: COLLECTIONS.PROJECTS,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENT_ATTENDANCE,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'attendances',
        },
      },
      {
        $addFields: {
          project_name: { $arrayElemAt: ['$project.name', 0] },
          attendance_count: { $size: '$attendances' },
        },
      },
      {
        $project: {
          project: 0,
          attendances: 0,
        },
      },
    ])
    .toArray();

  return events.length > 0 ? (events[0] as any) : null;
}

/**
 * Get events by project
 */
export async function getEventsByProject(projectId: number): Promise<Event[]> {
  const db = await getDB();

  const events = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $match: { project_id: projectId },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENT_ATTENDANCE,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'attendances',
        },
      },
      {
        $addFields: {
          attendance_count: { $size: '$attendances' },
        },
      },
      {
        $project: {
          attendances: 0,
        },
      },
      {
        $sort: { event_date: -1 },
      },
    ])
    .toArray();

  return events as any;
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const db = await getDB();

  const events = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $match: {
          event_date: { $gte: new Date() },
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.PROJECTS,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENT_ATTENDANCE,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'attendances',
        },
      },
      {
        $addFields: {
          project_name: { $arrayElemAt: ['$project.name', 0] },
          attendance_count: { $size: '$attendances' },
        },
      },
      {
        $project: {
          project: 0,
          attendances: 0,
        },
      },
      {
        $sort: { event_date: 1 },
      },
    ])
    .toArray();

  return events as any;
}

/**
 * Get events for a volunteer (in their joined projects)
 */
export async function getEventsForVolunteer(volunteerId: number): Promise<Event[]> {
  const db = await getDB();

  // First get the projects the volunteer has joined
  const volunteerProjects = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .find({ volunteer_id: volunteerId })
    .toArray();

  const projectIds = volunteerProjects.map((vp: any) => vp.project_id);

  // Then get events for those projects
  const events = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $match: {
          project_id: { $in: projectIds },
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.PROJECTS,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENT_ATTENDANCE,
          let: { eventId: '$event_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$event_id', '$$eventId'] },
                    { $eq: ['$volunteer_id', volunteerId] },
                  ],
                },
              },
            },
          ],
          as: 'my_attendance',
        },
      },
      {
        $addFields: {
          project_name: { $arrayElemAt: ['$project.name', 0] },
          attendance_status: { $arrayElemAt: ['$my_attendance.status', 0] },
        },
      },
      {
        $project: {
          project: 0,
          my_attendance: 0,
        },
      },
      {
        $sort: { event_date: -1 },
      },
    ])
    .toArray();

  return events as any;
}

/**
 * Create a new event
 */
export async function createEvent(
  projectId: number,
  name: string,
  description: string,
  eventDate: Date,
  location: string,
  maxParticipants: number
): Promise<number> {
  const db = await getDB();

  // Get the next event_id (auto-increment simulation)
  const lastEvent = await db
    .collection(COLLECTIONS.EVENTS)
    .find()
    .sort({ event_id: -1 })
    .limit(1)
    .toArray();

  const newEventId = lastEvent.length > 0 ? lastEvent[0].event_id + 1 : 1;

  const newEvent = {
    event_id: newEventId,
    project_id: projectId,
    name,
    description,
    event_date: eventDate,
    location,
    max_participants: maxParticipants,
    created_at: new Date(),
  };

  await db.collection(COLLECTIONS.EVENTS).insertOne(newEvent);

  return newEventId;
}

/**
 * Update an event
 */
export async function updateEvent(
  eventId: number,
  data: {
    name?: string;
    description?: string;
    eventDate?: Date;
    location?: string;
    maxParticipants?: number;
  }
): Promise<boolean> {
  const db = await getDB();

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.eventDate) updateData.event_date = data.eventDate;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.maxParticipants) updateData.max_participants = data.maxParticipants;

  if (Object.keys(updateData).length === 0) {
    return false;
  }

  const result = await db
    .collection(COLLECTIONS.EVENTS)
    .updateOne({ event_id: eventId }, { $set: updateData });

  return result.modifiedCount > 0;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: number): Promise<boolean> {
  const db = await getDB();

  const result = await db.collection(COLLECTIONS.EVENTS).deleteOne({ event_id: eventId });

  return result.deletedCount > 0;
}

/**
 * Count total events
 */
export async function countEvents(): Promise<{ total: number; upcoming: number }> {
  const db = await getDB();

  const result = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          upcoming: {
            $sum: {
              $cond: [{ $gte: ['$event_date', new Date()] }, 1, 0],
            },
          },
        },
      },
    ])
    .toArray();

  if (result.length === 0) {
    return { total: 0, upcoming: 0 };
  }

  return result[0] as any;
}
