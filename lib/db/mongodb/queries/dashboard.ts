// MongoDB Dashboard Statistics Queries
import { getDB, COLLECTIONS } from '../connection';
import { AdminDashboardStats, VolunteerDashboardStats } from '@/types/database';

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = await getDB();

  // Total and active volunteers
  const volunteerStats = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .aggregate([
      {
        $group: {
          _id: null,
          total_volunteers: { $sum: 1 },
          active_volunteers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
    ])
    .toArray();

  // Total and active projects
  const projectStats = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $group: {
          _id: null,
          total_projects: { $sum: 1 },
          active_projects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
    ])
    .toArray();

  // Total and upcoming events
  const eventStats = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $group: {
          _id: null,
          total_events: { $sum: 1 },
          upcoming_events: {
            $sum: {
              $cond: [{ $gte: ['$event_date', new Date()] }, 1, 0],
            },
          },
        },
      },
    ])
    .toArray();

  // Project status breakdown
  const projectStatusBreakdown = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $group: {
          _id: null,
          planned: {
            $sum: { $cond: [{ $eq: ['$status', 'planned'] }, 1, 0] },
          },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
    ])
    .toArray();

  // Volunteers per project
  const volunteersPerProject = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $lookup: {
          from: COLLECTIONS.VOLUNTEER_PROJECT,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'volunteers',
        },
      },
      {
        $project: {
          project_id: 1,
          project_name: '$name',
          volunteer_count: { $size: '$volunteers' },
        },
      },
      {
        $sort: { volunteer_count: -1 },
      },
    ])
    .toArray();

  // Attendance statistics
  const attendanceStats = await db
    .collection(COLLECTIONS.EVENT_ATTENDANCE)
    .aggregate([
      {
        $match: { status: 'present' },
      },
      {
        $group: {
          _id: null,
          total_attendances: { $sum: 1 },
          unique_events: { $addToSet: '$event_id' },
        },
      },
      {
        $project: {
          total_attendances: 1,
          events_with_attendance: { $size: '$unique_events' },
          average_attendance_per_event: {
            $cond: [
              { $gt: [{ $size: '$unique_events' }, 0] },
              {
                $divide: ['$total_attendances', { $size: '$unique_events' }],
              },
              0,
            ],
          },
        },
      },
    ])
    .toArray();

  return {
    total_volunteers: volunteerStats[0]?.total_volunteers || 0,
    active_volunteers: volunteerStats[0]?.active_volunteers || 0,
    total_projects: projectStats[0]?.total_projects || 0,
    active_projects: projectStats[0]?.active_projects || 0,
    total_events: eventStats[0]?.total_events || 0,
    upcoming_events: eventStats[0]?.upcoming_events || 0,
    project_status_breakdown: {
      planned: projectStatusBreakdown[0]?.planned || 0,
      active: projectStatusBreakdown[0]?.active || 0,
      completed: projectStatusBreakdown[0]?.completed || 0,
      cancelled: projectStatusBreakdown[0]?.cancelled || 0,
    },
    volunteers_per_project: volunteersPerProject.map((row: any) => ({
      project_id: row.project_id,
      project_name: row.project_name,
      volunteer_count: row.volunteer_count || 0,
    })),
    attendance_stats: {
      total_attendances: attendanceStats[0]?.total_attendances || 0,
      average_attendance_per_event: Math.round((attendanceStats[0]?.average_attendance_per_event || 0) * 100) / 100,
    },
  };
}

/**
 * Get volunteer dashboard statistics
 */
export async function getVolunteerDashboardStats(
  volunteerId: number
): Promise<VolunteerDashboardStats> {
  const db = await getDB();

  // Projects joined count
  const projectsCount = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .countDocuments({ volunteer_id: volunteerId });

  // Events attended count
  const eventsCount = await db
    .collection(COLLECTIONS.EVENT_ATTENDANCE)
    .countDocuments({ volunteer_id: volunteerId, status: 'present' });

  // Upcoming events count
  const upcomingEvents = await db
    .collection(COLLECTIONS.EVENT_ATTENDANCE)
    .aggregate([
      {
        $match: { volunteer_id: volunteerId },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENTS,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $match: {
          'event.event_date': { $gte: new Date() },
        },
      },
      {
        $count: 'count',
      },
    ])
    .toArray();

  const upcomingEventsCount = upcomingEvents[0]?.count || 0;

  // Projects list with details
  const projects = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .aggregate([
      {
        $match: { volunteer_id: volunteerId },
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
        $unwind: '$project',
      },
      {
        $project: {
          project_id: '$project.project_id',
          project_name: '$project.name',
          join_date: '$join_date',
          role: '$role',
        },
      },
      {
        $sort: { join_date: -1 },
      },
    ])
    .toArray();

  // Recent events attended
  const recentEvents = await db
    .collection(COLLECTIONS.EVENT_ATTENDANCE)
    .aggregate([
      {
        $match: { volunteer_id: volunteerId },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENTS,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'event',
        },
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          event_id: '$event.event_id',
          event_name: '$event.name',
          event_date: '$event.event_date',
          status: '$status',
        },
      },
      {
        $sort: { event_date: -1 },
      },
      {
        $limit: 10,
      },
    ])
    .toArray();

  return {
    volunteer_id: volunteerId,
    MY_PROJECTS: projectsCount,
    EVENTS_ATTENDED: eventsCount,
    UPCOMING_EVENTS: upcomingEventsCount,
    projects: projects as any,
    recent_events: recentEvents as any,
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
  const db = await getDB();

  const stats = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $match: { project_id: projectId },
      },
      {
        $lookup: {
          from: COLLECTIONS.VOLUNTEER_PROJECT,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'volunteers',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENTS,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'events',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.RESOURCES,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'resources',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENT_ATTENDANCE,
          let: { eventIds: '$events.event_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$event_id', '$$eventIds'] },
                    { $eq: ['$status', 'present'] },
                  ],
                },
              },
            },
          ],
          as: 'attendances',
        },
      },
      {
        $project: {
          volunteer_count: { $size: '$volunteers' },
          event_count: { $size: '$events' },
          resource_count: { $size: '$resources' },
          total_attendance: { $size: '$attendances' },
        },
      },
    ])
    .toArray();

  if (stats.length === 0) {
    return {
      volunteer_count: 0,
      event_count: 0,
      resource_count: 0,
      total_attendance: 0,
    };
  }

  return stats[0] as any;
}

/**
 * Get recent activity (for homepage/dashboard)
 */
export async function getRecentActivity(limit: number = 10): Promise<any[]> {
  const db = await getDB();

  // Get volunteer joined activities
  const volunteerJoined = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .aggregate([
      {
        $lookup: {
          from: COLLECTIONS.VOLUNTEERS,
          localField: 'volunteer_id',
          foreignField: 'volunteer_id',
          as: 'volunteer',
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
        $unwind: '$volunteer',
      },
      {
        $unwind: '$project',
      },
      {
        $project: {
          activity_type: { $literal: 'volunteer_joined' },
          description: {
            $concat: ['$volunteer.name', ' joined project ', '$project.name'],
          },
          activity_date: '$join_date',
        },
      },
    ])
    .toArray();

  // Get attendance marked activities
  const attendanceMarked = await db
    .collection(COLLECTIONS.EVENT_ATTENDANCE)
    .aggregate([
      {
        $match: { status: 'present' },
      },
      {
        $lookup: {
          from: COLLECTIONS.VOLUNTEERS,
          localField: 'volunteer_id',
          foreignField: 'volunteer_id',
          as: 'volunteer',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.EVENTS,
          localField: 'event_id',
          foreignField: 'event_id',
          as: 'event',
        },
      },
      {
        $unwind: '$volunteer',
      },
      {
        $unwind: '$event',
      },
      {
        $project: {
          activity_type: { $literal: 'attendance_marked' },
          description: {
            $concat: ['$volunteer.name', ' attended ', '$event.name'],
          },
          activity_date: '$marked_at',
        },
      },
    ])
    .toArray();

  // Get event created activities
  const eventCreated = await db
    .collection(COLLECTIONS.EVENTS)
    .aggregate([
      {
        $project: {
          activity_type: { $literal: 'event_created' },
          description: {
            $concat: ['New event: ', '$name'],
          },
          activity_date: '$created_at',
        },
      },
    ])
    .toArray();

  // Combine all activities
  const allActivities = [...volunteerJoined, ...attendanceMarked, ...eventCreated];

  // Sort by date and limit
  allActivities.sort((a, b) => {
    const dateA = new Date(a.activity_date).getTime();
    const dateB = new Date(b.activity_date).getTime();
    return dateB - dateA;
  });

  return allActivities.slice(0, limit);
}
