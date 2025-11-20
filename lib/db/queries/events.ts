// Event Database Queries
import { executeQuery, executeQuerySingle, executeUpdate } from '../connection';
import { Event } from '@/types/database';

/**
 * Get all events
 */
export async function getAllEvents(): Promise<Event[]> {
  const query = `
    SELECT
      e.event_id,
      e.project_id,
      e.name,
      TO_CHAR(e.description) as description,
      e.event_date,
      e.location,
      e.max_participants,
      e.created_at,
      p.name as project_name,
      COUNT(DISTINCT ea.volunteer_id) as attendance_count
    FROM EVENTS e
    LEFT JOIN PROJECTS p ON e.project_id = p.project_id
    LEFT JOIN EVENT_ATTENDANCE ea ON e.event_id = ea.event_id
    GROUP BY e.event_id, e.project_id, e.name, TO_CHAR(e.description), e.event_date,
             e.location, e.max_participants, e.created_at, p.name
    ORDER BY e.event_date DESC
  `;
  return executeQuery<Event>(query);
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: number): Promise<Event | null> {
  const query = `
    SELECT
      e.event_id,
      e.project_id,
      e.name,
      TO_CHAR(e.description) as description,
      e.event_date,
      e.location,
      e.max_participants,
      e.created_at,
      p.name as project_name,
      COUNT(DISTINCT ea.volunteer_id) as attendance_count
    FROM EVENTS e
    LEFT JOIN PROJECTS p ON e.project_id = p.project_id
    LEFT JOIN EVENT_ATTENDANCE ea ON e.event_id = ea.event_id
    WHERE e.event_id = :1
    GROUP BY e.event_id, e.project_id, e.name, TO_CHAR(e.description), e.event_date,
             e.location, e.max_participants, e.created_at, p.name
  `;
  return executeQuerySingle<Event>(query, [eventId]);
}

/**
 * Get events by project
 */
export async function getEventsByProject(projectId: number): Promise<Event[]> {
  const query = `
    SELECT
      e.event_id,
      e.project_id,
      e.name,
      TO_CHAR(e.description) as description,
      e.event_date,
      e.location,
      e.max_participants,
      e.created_at,
      COUNT(DISTINCT ea.volunteer_id) as attendance_count
    FROM EVENTS e
    LEFT JOIN EVENT_ATTENDANCE ea ON e.event_id = ea.event_id
    WHERE e.project_id = :1
    GROUP BY e.event_id, e.project_id, e.name, TO_CHAR(e.description), e.event_date,
             e.location, e.max_participants, e.created_at
    ORDER BY e.event_date DESC
  `;
  return executeQuery<Event>(query, [projectId]);
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const query = `
    SELECT
      e.event_id,
      e.project_id,
      e.name,
      e.description,
      e.event_date,
      e.location,
      e.max_participants,
      e.created_at,
      p.name as project_name,
      COUNT(DISTINCT ea.volunteer_id) as attendance_count
    FROM EVENTS e
    LEFT JOIN PROJECTS p ON e.project_id = p.project_id
    LEFT JOIN EVENT_ATTENDANCE ea ON e.event_id = ea.event_id
    WHERE e.event_date >= SYSTIMESTAMP
    GROUP BY e.event_id, e.project_id, e.name, e.description, e.event_date,
             e.location, e.max_participants, e.created_at, p.name
    ORDER BY e.event_date ASC
  `;
  return executeQuery<Event>(query);
}

/**
 * Get events for a volunteer (in their joined projects)
 */
export async function getEventsForVolunteer(volunteerId: number): Promise<Event[]> {
  const query = `
    SELECT DISTINCT
      e.event_id,
      e.project_id,
      e.name,
      e.description,
      e.event_date,
      e.location,
      e.max_participants,
      e.created_at,
      p.name as project_name,
      ea.status as attendance_status
    FROM EVENTS e
    JOIN PROJECTS p ON e.project_id = p.project_id
    JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    LEFT JOIN EVENT_ATTENDANCE ea ON e.event_id = ea.event_id AND ea.volunteer_id = :1
    WHERE vp.volunteer_id = :1
    ORDER BY e.event_date DESC
  `;
  return executeQuery<Event>(query, [volunteerId]);
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
  const query = `
    INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
    VALUES (:1, :2, :3, :4, :5, :6)
    RETURNING event_id INTO :7
  `;

  const params = {
    1: projectId,
    2: name,
    3: description,
    4: eventDate,
    5: location,
    6: maxParticipants,
    7: { dir: 3003, type: 2002 }, // OUT parameter
  };

  const result = await executeQuery(query, params);
  return result[0] as any as number;
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
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name) {
    updates.push(`name = :${paramIndex++}`);
    params.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = :${paramIndex++}`);
    params.push(data.description);
  }
  if (data.eventDate) {
    updates.push(`event_date = :${paramIndex++}`);
    params.push(data.eventDate);
  }
  if (data.location !== undefined) {
    updates.push(`location = :${paramIndex++}`);
    params.push(data.location);
  }
  if (data.maxParticipants) {
    updates.push(`max_participants = :${paramIndex++}`);
    params.push(data.maxParticipants);
  }

  if (updates.length === 0) {
    return false;
  }

  params.push(eventId);
  const query = `
    UPDATE EVENTS
    SET ${updates.join(', ')}
    WHERE event_id = :${paramIndex}
  `;

  const rowsAffected = await executeUpdate(query, params);
  return rowsAffected > 0;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: number): Promise<boolean> {
  const query = 'DELETE FROM EVENTS WHERE event_id = :1';
  const rowsAffected = await executeUpdate(query, [eventId]);
  return rowsAffected > 0;
}

/**
 * Count total events
 */
export async function countEvents(): Promise<{ total: number; upcoming: number }> {
  const query = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN event_date >= SYSTIMESTAMP THEN 1 ELSE 0 END) as upcoming
    FROM EVENTS
  `;
  const result = await executeQuerySingle<any>(query);
  return {
    total: result?.TOTAL || 0,
    upcoming: result?.UPCOMING || 0,
  };
}
