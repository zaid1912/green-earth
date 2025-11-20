// Dashboard Statistics Queries
import { executeQuery, executeQuerySingle } from '../connection';
import { AdminDashboardStats, VolunteerDashboardStats } from '@/types/database';

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  // Total and active volunteers
  const volunteerStatsQuery = `
    SELECT
      COUNT(*) as total_volunteers,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_volunteers
    FROM VOLUNTEERS
  `;
  const volunteerStats = await executeQuerySingle<any>(volunteerStatsQuery);

  // Total and active projects
  const projectStatsQuery = `
    SELECT
      COUNT(*) as total_projects,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects
    FROM PROJECTS
  `;
  const projectStats = await executeQuerySingle<any>(projectStatsQuery);

  // Total and upcoming events
  const eventStatsQuery = `
    SELECT
      COUNT(*) as total_events,
      SUM(CASE WHEN event_date >= SYSTIMESTAMP THEN 1 ELSE 0 END) as upcoming_events
    FROM EVENTS
  `;
  const eventStats = await executeQuerySingle<any>(eventStatsQuery);

  // Project status breakdown
  const projectStatusQuery = `
    SELECT
      SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
    FROM PROJECTS
  `;
  const projectStatusBreakdown = await executeQuerySingle<any>(projectStatusQuery);

  // Volunteers per project
  const volunteersPerProjectQuery = `
    SELECT
      p.project_id,
      p.name as project_name,
      COUNT(vp.volunteer_id) as volunteer_count
    FROM PROJECTS p
    LEFT JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    GROUP BY p.project_id, p.name
    ORDER BY volunteer_count DESC
  `;
  const volunteersPerProject = await executeQuery<any>(volunteersPerProjectQuery);

  // Attendance statistics
  const attendanceStatsQuery = `
    SELECT
      COUNT(*) as total_attendances,
      COUNT(DISTINCT event_id) as events_with_attendance,
      CASE
        WHEN COUNT(DISTINCT event_id) > 0
        THEN ROUND(COUNT(*) / COUNT(DISTINCT event_id), 2)
        ELSE 0
      END as average_attendance_per_event
    FROM EVENT_ATTENDANCE
    WHERE status = 'present'
  `;
  const attendanceStats = await executeQuerySingle<any>(attendanceStatsQuery);

  return {
    total_volunteers: volunteerStats?.TOTAL_VOLUNTEERS || 0,
    active_volunteers: volunteerStats?.ACTIVE_VOLUNTEERS || 0,
    total_projects: projectStats?.TOTAL_PROJECTS || 0,
    active_projects: projectStats?.ACTIVE_PROJECTS || 0,
    total_events: eventStats?.TOTAL_EVENTS || 0,
    upcoming_events: eventStats?.UPCOMING_EVENTS || 0,
    project_status_breakdown: {
      planned: projectStatusBreakdown?.PLANNED || 0,
      active: projectStatusBreakdown?.ACTIVE || 0,
      completed: projectStatusBreakdown?.COMPLETED || 0,
      cancelled: projectStatusBreakdown?.CANCELLED || 0,
    },
    volunteers_per_project: volunteersPerProject.map((row) => ({
      project_id: row.PROJECT_ID,
      project_name: row.PROJECT_NAME,
      volunteer_count: row.VOLUNTEER_COUNT || 0,
    })),
    attendance_stats: {
      total_attendances: attendanceStats?.TOTAL_ATTENDANCES || 0,
      average_attendance_per_event: attendanceStats?.AVERAGE_ATTENDANCE_PER_EVENT || 0,
    },
  };
}

/**
 * Get volunteer dashboard statistics
 */
export async function getVolunteerDashboardStats(
  volunteerId: number
): Promise<VolunteerDashboardStats> {
  // Projects joined count
  const projectsCountQuery = `
    SELECT COUNT(*) as count
    FROM VOLUNTEER_PROJECT
    WHERE volunteer_id = :1
  `;
  const projectsCount = await executeQuerySingle<any>(projectsCountQuery, [volunteerId]);

  // Events attended count
  const eventsCountQuery = `
    SELECT COUNT(*) as count
    FROM EVENT_ATTENDANCE
    WHERE volunteer_id = :1 AND status = 'present'
  `;
  const eventsCount = await executeQuerySingle<any>(eventsCountQuery, [volunteerId]);

  // Projects list with details
  const projectsQuery = `
    SELECT
      p.project_id,
      p.name as project_name,
      vp.join_date,
      vp.role
    FROM VOLUNTEER_PROJECT vp
    JOIN PROJECTS p ON vp.project_id = p.project_id
    WHERE vp.volunteer_id = :1
    ORDER BY vp.join_date DESC
  `;
  const projects = await executeQuery<any>(projectsQuery, [volunteerId]);

  // Recent events attended
  const recentEventsQuery = `
    SELECT
      e.event_id,
      e.name as event_name,
      e.event_date,
      ea.status
    FROM EVENT_ATTENDANCE ea
    JOIN EVENTS e ON ea.event_id = e.event_id
    WHERE ea.volunteer_id = :1
    ORDER BY e.event_date DESC
    FETCH FIRST 10 ROWS ONLY
  `;
  const recentEvents = await executeQuery<any>(recentEventsQuery, [volunteerId]);

  return {
    volunteer_id: volunteerId,
    projects_joined: projectsCount?.COUNT || 0,
    events_attended: eventsCount?.COUNT || 0,
    projects: projects.map((row) => ({
      project_id: row.PROJECT_ID,
      project_name: row.PROJECT_NAME,
      join_date: row.JOIN_DATE,
      role: row.ROLE,
    })),
    recent_events: recentEvents.map((row) => ({
      event_id: row.EVENT_ID,
      event_name: row.EVENT_NAME,
      event_date: row.EVENT_DATE,
      status: row.STATUS,
    })),
  };
}

/**
 * Get project statistics
 */
export async function getProjectStats(projectId: number): Promise<{
  volunteer_count: number;
  event_count: number;
  resource_count: number;
  total_attendance: number;
}> {
  const query = `
    SELECT
      COUNT(DISTINCT vp.volunteer_id) as volunteer_count,
      COUNT(DISTINCT e.event_id) as event_count,
      COUNT(DISTINCT r.resource_id) as resource_count,
      COUNT(DISTINCT ea.volunteer_id) as total_attendance
    FROM PROJECTS p
    LEFT JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    LEFT JOIN EVENTS e ON p.project_id = e.project_id
    LEFT JOIN RESOURCES r ON p.project_id = r.project_id
    LEFT JOIN EVENT_ATTENDANCE ea ON e.event_id = ea.event_id AND ea.status = 'present'
    WHERE p.project_id = :1
    GROUP BY p.project_id
  `;

  const result = await executeQuerySingle<any>(query, [projectId]);

  return {
    volunteer_count: result?.VOLUNTEER_COUNT || 0,
    event_count: result?.EVENT_COUNT || 0,
    resource_count: result?.RESOURCE_COUNT || 0,
    total_attendance: result?.TOTAL_ATTENDANCE || 0,
  };
}

/**
 * Get recent activity (for homepage/dashboard)
 */
export async function getRecentActivity(limit: number = 10): Promise<any[]> {
  const query = `
    SELECT * FROM (
      SELECT
        'volunteer_joined' as activity_type,
        v.name || ' joined project ' || p.name as description,
        vp.join_date as activity_date
      FROM VOLUNTEER_PROJECT vp
      JOIN VOLUNTEERS v ON vp.volunteer_id = v.volunteer_id
      JOIN PROJECTS p ON vp.project_id = p.project_id

      UNION ALL

      SELECT
        'attendance_marked' as activity_type,
        v.name || ' attended ' || e.name as description,
        ea.marked_at as activity_date
      FROM EVENT_ATTENDANCE ea
      JOIN VOLUNTEERS v ON ea.volunteer_id = v.volunteer_id
      JOIN EVENTS e ON ea.event_id = e.event_id
      WHERE ea.status = 'present'

      UNION ALL

      SELECT
        'event_created' as activity_type,
        'New event: ' || e.name as description,
        e.created_at as activity_date
      FROM EVENTS e
    )
    ORDER BY activity_date DESC
    FETCH FIRST :1 ROWS ONLY
  `;

  return executeQuery<any>(query, [limit]);
}
