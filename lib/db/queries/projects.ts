// Project Database Queries
import oracledb from 'oracledb';
import { executeQuery, executeQuerySingle, executeUpdate, executeInsertReturning } from '../connection';
import { Project } from '@/types/database';

/**
 * Get all projects with volunteer count
 */
export async function getAllProjects(): Promise<Project[]> {
  const query = `
    SELECT
      p.project_id,
      p.org_id,
      p.name,
      TO_CHAR(p.description) as description,
      p.start_date,
      p.end_date,
      p.status,
      p.location,
      p.max_volunteers,
      p.created_at,
      o.name as org_name,
      COUNT(DISTINCT vp.volunteer_id) as volunteer_count
    FROM PROJECTS p
    LEFT JOIN ORGANIZATIONS o ON p.org_id = o.org_id
    LEFT JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    GROUP BY p.project_id, p.org_id, p.name, TO_CHAR(p.description), p.start_date,
             p.end_date, p.status, p.location, p.max_volunteers, p.created_at, o.name
    ORDER BY p.created_at DESC
  `;
  return executeQuery<Project>(query);
}

/**
 * Get all projects with volunteer count and join status for a specific volunteer
 */
export async function getAllProjectsWithJoinStatus(volunteerId: number): Promise<Project[]> {
  const query = `
    SELECT
      p.project_id,
      p.org_id,
      p.name,
      TO_CHAR(p.description) as description,
      p.start_date,
      p.end_date,
      p.status,
      p.location,
      p.max_volunteers,
      p.created_at,
      o.name as org_name,
      COUNT(DISTINCT vp_all.volunteer_id) as volunteer_count,
      CASE WHEN vp_user.volunteer_id IS NOT NULL THEN 1 ELSE 0 END as is_joined
    FROM PROJECTS p
    LEFT JOIN ORGANIZATIONS o ON p.org_id = o.org_id
    LEFT JOIN VOLUNTEER_PROJECT vp_all ON p.project_id = vp_all.project_id
    LEFT JOIN VOLUNTEER_PROJECT vp_user ON p.project_id = vp_user.project_id AND vp_user.volunteer_id = :1
    GROUP BY p.project_id, p.org_id, p.name, TO_CHAR(p.description), p.start_date,
             p.end_date, p.status, p.location, p.max_volunteers, p.created_at, o.name,
             vp_user.volunteer_id
    ORDER BY p.created_at DESC
  `;
  return executeQuery<Project>(query, [volunteerId]);
}

/**
 * Get project by ID with details
 */
export async function getProjectById(projectId: number): Promise<Project | null> {
  const query = `
    SELECT
      p.project_id,
      p.org_id,
      p.name,
      TO_CHAR(p.description) as description,
      p.start_date,
      p.end_date,
      p.status,
      p.location,
      p.max_volunteers,
      p.created_at,
      o.name as org_name,
      COUNT(DISTINCT vp.volunteer_id) as volunteer_count
    FROM PROJECTS p
    LEFT JOIN ORGANIZATIONS o ON p.org_id = o.org_id
    LEFT JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    WHERE p.project_id = :1
    GROUP BY p.project_id, p.org_id, p.name, TO_CHAR(p.description), p.start_date,
             p.end_date, p.status, p.location, p.max_volunteers, p.created_at, o.name
  `;
  return executeQuerySingle<Project>(query, [projectId]);
}

/**
 * Create a new project
 */
export async function createProject(
  orgId: number,
  name: string,
  description: string,
  startDate: Date,
  endDate: Date | null,
  status: 'planned' | 'active' | 'completed' | 'cancelled',
  location: string,
  maxVolunteers: number
): Promise<number> {
  const query = `
    INSERT INTO PROJECTS (org_id, name, description, start_date, end_date, status, location, max_volunteers)
    VALUES (:orgId, :name, :description, :startDate, :endDate, :status, :location, :maxVolunteers)
    RETURNING project_id INTO :projectId
  `;

  const params = {
    orgId: orgId,
    name: name,
    description: description,
    startDate: startDate,
    endDate: endDate,
    status: status,
    location: location,
    maxVolunteers: maxVolunteers,
    projectId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }, // OUT parameter for numeric project_id
  };

  const projectId = await executeInsertReturning(query, params, 'projectId');
  return projectId;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: number,
  data: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date | null;
    status?: 'planned' | 'active' | 'completed' | 'cancelled';
    location?: string;
    maxVolunteers?: number;
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
  if (data.startDate) {
    updates.push(`start_date = :${paramIndex++}`);
    params.push(data.startDate);
  }
  if (data.endDate !== undefined) {
    updates.push(`end_date = :${paramIndex++}`);
    params.push(data.endDate);
  }
  if (data.status) {
    updates.push(`status = :${paramIndex++}`);
    params.push(data.status);
  }
  if (data.location !== undefined) {
    updates.push(`location = :${paramIndex++}`);
    params.push(data.location);
  }
  if (data.maxVolunteers) {
    updates.push(`max_volunteers = :${paramIndex++}`);
    params.push(data.maxVolunteers);
  }

  if (updates.length === 0) {
    return false;
  }

  params.push(projectId);
  const query = `
    UPDATE PROJECTS
    SET ${updates.join(', ')}
    WHERE project_id = :${paramIndex}
  `;

  const rowsAffected = await executeUpdate(query, params);
  return rowsAffected > 0;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: number): Promise<boolean> {
  const query = 'DELETE FROM PROJECTS WHERE project_id = :1';
  const rowsAffected = await executeUpdate(query, [projectId]);
  return rowsAffected > 0;
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  status: 'planned' | 'active' | 'completed' | 'cancelled'
): Promise<Project[]> {
  const query = `
    SELECT
      p.project_id,
      p.org_id,
      p.name,
      TO_CHAR(p.description) as description,
      p.start_date,
      p.end_date,
      p.status,
      p.location,
      p.max_volunteers,
      p.created_at,
      o.name as org_name,
      COUNT(DISTINCT vp.volunteer_id) as volunteer_count
    FROM PROJECTS p
    LEFT JOIN ORGANIZATIONS o ON p.org_id = o.org_id
    LEFT JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    WHERE p.status = :1
    GROUP BY p.project_id, p.org_id, p.name, TO_CHAR(p.description), p.start_date,
             p.end_date, p.status, p.location, p.max_volunteers, p.created_at, o.name
    ORDER BY p.start_date DESC
  `;
  return executeQuery<Project>(query, [status]);
}

/**
 * Get projects for a volunteer
 */
export async function getProjectsByVolunteer(volunteerId: number): Promise<Project[]> {
  const query = `
    SELECT
      p.project_id,
      p.org_id,
      p.name,
      TO_CHAR(p.description) as description,
      p.start_date,
      p.end_date,
      p.status,
      p.location,
      p.max_volunteers,
      p.created_at,
      o.name as org_name,
      vp.join_date,
      vp.role as volunteer_role
    FROM PROJECTS p
    JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    LEFT JOIN ORGANIZATIONS o ON p.org_id = o.org_id
    WHERE vp.volunteer_id = :1
    ORDER BY vp.join_date DESC
  `;
  return executeQuery<Project>(query, [volunteerId]);
}

/**
 * Join a project (add volunteer to project)
 */
export async function joinProject(
  volunteerId: number,
  projectId: number,
  role: string = 'participant'
): Promise<boolean> {
  // First check if already joined
  const checkQuery = `
    SELECT COUNT(*) as count
    FROM VOLUNTEER_PROJECT
    WHERE volunteer_id = :1 AND project_id = :2
  `;
  const existing = await executeQuerySingle<any>(checkQuery, [volunteerId, projectId]);

  if ((existing?.count || 0) > 0) {
    throw new Error('Volunteer already joined this project');
  }

  // Check capacity
  const capacityQuery = `
    SELECT
      p.max_volunteers,
      COUNT(vp.volunteer_id) as current_count
    FROM PROJECTS p
    LEFT JOIN VOLUNTEER_PROJECT vp ON p.project_id = vp.project_id
    WHERE p.project_id = :1
    GROUP BY p.max_volunteers
  `;
  const capacity = await executeQuerySingle<any>(capacityQuery, [projectId]);

  if (capacity && capacity.current_count >= capacity.max_volunteers) {
    throw new Error('Project has reached maximum volunteer capacity');
  }

  // Join project
  const query = `
    INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role)
    VALUES (:1, :2, :3)
  `;
  const rowsAffected = await executeUpdate(query, [volunteerId, projectId, role]);
  return rowsAffected > 0;
}

/**
 * Leave a project (remove volunteer from project)
 */
export async function leaveProject(volunteerId: number, projectId: number): Promise<boolean> {
  const query = `
    DELETE FROM VOLUNTEER_PROJECT
    WHERE volunteer_id = :1 AND project_id = :2
  `;
  const rowsAffected = await executeUpdate(query, [volunteerId, projectId]);
  return rowsAffected > 0;
}

/**
 * Count projects by status
 */
export async function countProjectsByStatus(): Promise<{
  total: number;
  planned: number;
  active: number;
  completed: number;
  cancelled: number;
}> {
  const query = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
    FROM PROJECTS
  `;
  const result = await executeQuerySingle<any>(query);
  return {
    total: result?.total || 0,
    planned: result?.planned || 0,
    active: result?.active || 0,
    completed: result?.completed || 0,
    cancelled: result?.cancelled || 0,
  };
}
