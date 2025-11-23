// Attendance Database Queries
import { executeQuery, executeQuerySingle, executeUpdate } from '../connection';
import { EventAttendance } from '@/types/database';

/**
 * Get attendance for an event
 */
export async function getAttendanceByEvent(eventId: number): Promise<EventAttendance[]> {
  const query = `
    SELECT
      ea.event_id,
      ea.volunteer_id,
      ea.marked_at,
      ea.status,
      ea.notes,
      v.name as volunteer_name,
      e.name as event_name
    FROM EVENT_ATTENDANCE ea
    JOIN VOLUNTEERS v ON ea.volunteer_id = v.volunteer_id
    JOIN EVENTS e ON ea.event_id = e.event_id
    WHERE ea.event_id = :1
    ORDER BY v.name
  `;
  return executeQuery<EventAttendance>(query, [eventId]);
}

/**
 * Get attendance for a volunteer
 */
export async function getAttendanceByVolunteer(volunteerId: number): Promise<EventAttendance[]> {
  const query = `
    SELECT
      ea.event_id,
      ea.volunteer_id,
      ea.marked_at,
      ea.status,
      ea.notes,
      e.name as event_name,
      e.event_date,
      p.name as project_name
    FROM EVENT_ATTENDANCE ea
    JOIN EVENTS e ON ea.event_id = e.event_id
    JOIN PROJECTS p ON e.project_id = p.project_id
    WHERE ea.volunteer_id = :1
    ORDER BY e.event_date DESC
  `;
  return executeQuery<EventAttendance>(query, [volunteerId]);
}

/**
 * Mark attendance
 */
export async function markAttendance(
  eventId: number,
  volunteerId: number,
  status: 'present' | 'absent' | 'excused' = 'present',
  notes?: string
): Promise<boolean> {
  // Check if attendance already marked
  const checkQuery = `
    SELECT COUNT(*) as count
    FROM EVENT_ATTENDANCE
    WHERE event_id = :1 AND volunteer_id = :2
  `;
  const existing = await executeQuerySingle<any>(checkQuery, [eventId, volunteerId]);

  if ((existing?.count || 0) > 0) {
    // Update existing attendance
    const updateQuery = `
      UPDATE EVENT_ATTENDANCE
      SET status = :1, notes = :2, marked_at = SYSTIMESTAMP
      WHERE event_id = :3 AND volunteer_id = :4
    `;
    const rowsAffected = await executeUpdate(updateQuery, [status, notes || null, eventId, volunteerId]);
    return rowsAffected > 0;
  }

  // Insert new attendance record
  const query = `
    INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status, notes)
    VALUES (:1, :2, :3, :4)
  `;
  const rowsAffected = await executeUpdate(query, [eventId, volunteerId, status, notes || null]);
  return rowsAffected > 0;
}

/**
 * Delete attendance record
 */
export async function deleteAttendance(eventId: number, volunteerId: number): Promise<boolean> {
  const query = `
    DELETE FROM EVENT_ATTENDANCE
    WHERE event_id = :1 AND volunteer_id = :2
  `;
  const rowsAffected = await executeUpdate(query, [eventId, volunteerId]);
  return rowsAffected > 0;
}

/**
 * Get attendance statistics
 */
export async function getAttendanceStats(): Promise<{
  total: number;
  present: number;
  absent: number;
  excused: number;
  averagePerEvent: number;
}> {
  const query = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
    FROM EVENT_ATTENDANCE
  `;
  const result = await executeQuerySingle<any>(query);

  // Calculate average attendance per event
  const avgQuery = `
    SELECT
      COUNT(*) / NULLIF((SELECT COUNT(DISTINCT event_id) FROM EVENT_ATTENDANCE), 0) as avg_per_event
    FROM EVENT_ATTENDANCE
    WHERE status = 'present'
  `;
  const avgResult = await executeQuerySingle<any>(avgQuery);

  return {
    total: result?.total || 0,
    present: result?.present || 0,
    absent: result?.absent || 0,
    excused: result?.excused || 0,
    averagePerEvent: avgResult?.avg_per_event || 0,
  };
}

/**
 * Check if volunteer has marked attendance for event
 */
export async function hasMarkedAttendance(eventId: number, volunteerId: number): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count
    FROM EVENT_ATTENDANCE
    WHERE event_id = :1 AND volunteer_id = :2
  `;
  const result = await executeQuerySingle<any>(query, [eventId, volunteerId]);
  return (result?.count || 0) > 0;
}
