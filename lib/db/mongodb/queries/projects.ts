// MongoDB Projects Queries
// This is a template - you'll need to install mongodb: npm install mongodb

import { getDB, COLLECTIONS } from '../connection';
import { Project } from '@/types/database';
import { ObjectId } from 'mongodb';

/**
 * Get all projects with volunteer count
 */
export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();

  const projects = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $lookup: {
          from: COLLECTIONS.ORGANIZATIONS,
          localField: 'org_id',
          foreignField: 'org_id',
          as: 'organization',
        },
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
        $addFields: {
          org_name: { $arrayElemAt: ['$organization.name', 0] },
          volunteer_count: { $size: '$volunteers' },
        },
      },
      {
        $project: {
          organization: 0,
          volunteers: 0,
        },
      },
      {
        $sort: { created_at: -1 },
      },
    ])
    .toArray();

  return projects as any;
}

/**
 * Get all projects with volunteer count and join status for a specific volunteer
 */
export async function getAllProjectsWithJoinStatus(volunteerId: number): Promise<Project[]> {
  const db = await getDB();

  const projects = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $lookup: {
          from: COLLECTIONS.ORGANIZATIONS,
          localField: 'org_id',
          foreignField: 'org_id',
          as: 'organization',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.VOLUNTEER_PROJECT,
          localField: 'project_id',
          foreignField: 'project_id',
          as: 'all_volunteers',
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.VOLUNTEER_PROJECT,
          let: { projectId: '$project_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$project_id', '$$projectId'] },
                    { $eq: ['$volunteer_id', volunteerId] },
                  ],
                },
              },
            },
          ],
          as: 'user_volunteer',
        },
      },
      {
        $addFields: {
          org_name: { $arrayElemAt: ['$organization.name', 0] },
          volunteer_count: { $size: '$all_volunteers' },
          is_joined: { $cond: [{ $gt: [{ $size: '$user_volunteer' }, 0] }, 1, 0] },
        },
      },
      {
        $project: {
          organization: 0,
          all_volunteers: 0,
          user_volunteer: 0,
        },
      },
      {
        $sort: { created_at: -1 },
      },
    ])
    .toArray();

  return projects as any;
}

/**
 * Get project by ID with details
 */
export async function getProjectById(projectId: number): Promise<Project | null> {
  const db = await getDB();

  const projects = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $match: { project_id: projectId },
      },
      {
        $lookup: {
          from: COLLECTIONS.ORGANIZATIONS,
          localField: 'org_id',
          foreignField: 'org_id',
          as: 'organization',
        },
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
        $addFields: {
          org_name: { $arrayElemAt: ['$organization.name', 0] },
          volunteer_count: { $size: '$volunteers' },
        },
      },
      {
        $project: {
          organization: 0,
          volunteers: 0,
        },
      },
    ])
    .toArray();

  return projects.length > 0 ? (projects[0] as any) : null;
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
  const db = await getDB();

  // Get the next project_id (auto-increment simulation)
  const lastProject = await db
    .collection(COLLECTIONS.PROJECTS)
    .find()
    .sort({ project_id: -1 })
    .limit(1)
    .toArray();

  const newProjectId = lastProject.length > 0 ? lastProject[0].project_id + 1 : 1;

  const newProject = {
    project_id: newProjectId,
    org_id: orgId,
    name,
    description,
    start_date: startDate,
    end_date: endDate,
    status,
    location,
    max_volunteers: maxVolunteers,
    created_at: new Date(),
  };

  await db.collection(COLLECTIONS.PROJECTS).insertOne(newProject);

  return newProjectId;
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
  const db = await getDB();

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate) updateData.start_date = data.startDate;
  if (data.endDate !== undefined) updateData.end_date = data.endDate;
  if (data.status) updateData.status = data.status;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.maxVolunteers) updateData.max_volunteers = data.maxVolunteers;

  if (Object.keys(updateData).length === 0) {
    return false;
  }

  const result = await db
    .collection(COLLECTIONS.PROJECTS)
    .updateOne({ project_id: projectId }, { $set: updateData });

  return result.modifiedCount > 0;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: number): Promise<boolean> {
  const db = await getDB();

  const result = await db.collection(COLLECTIONS.PROJECTS).deleteOne({ project_id: projectId });

  return result.deletedCount > 0;
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  status: 'planned' | 'active' | 'completed' | 'cancelled'
): Promise<Project[]> {
  const db = await getDB();

  const projects = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $match: { status },
      },
      {
        $lookup: {
          from: COLLECTIONS.ORGANIZATIONS,
          localField: 'org_id',
          foreignField: 'org_id',
          as: 'organization',
        },
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
        $addFields: {
          org_name: { $arrayElemAt: ['$organization.name', 0] },
          volunteer_count: { $size: '$volunteers' },
        },
      },
      {
        $project: {
          organization: 0,
          volunteers: 0,
        },
      },
      {
        $sort: { start_date: -1 },
      },
    ])
    .toArray();

  return projects as any;
}

/**
 * Get projects for a volunteer
 */
export async function getProjectsByVolunteer(volunteerId: number): Promise<Project[]> {
  const db = await getDB();

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
        $lookup: {
          from: COLLECTIONS.ORGANIZATIONS,
          localField: 'project.org_id',
          foreignField: 'org_id',
          as: 'organization',
        },
      },
      {
        $addFields: {
          'project.org_name': { $arrayElemAt: ['$organization.name', 0] },
          'project.volunteer_role': '$role',
        },
      },
      {
        $replaceRoot: { newRoot: '$project' },
      },
      {
        $sort: { created_at: -1 },
      },
    ])
    .toArray();

  return projects as any;
}

/**
 * Join a project (add volunteer to project)
 */
export async function joinProject(
  volunteerId: number,
  projectId: number,
  role: string = 'participant'
): Promise<boolean> {
  const db = await getDB();

  // Check if already joined
  const existing = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .findOne({ volunteer_id: volunteerId, project_id: projectId });

  if (existing) {
    throw new Error('Volunteer already joined this project');
  }

  // Check capacity
  const project = await db.collection(COLLECTIONS.PROJECTS).findOne({ project_id: projectId });
  const currentCount = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .countDocuments({ project_id: projectId });

  if (project && currentCount >= project.max_volunteers) {
    throw new Error('Project has reached maximum volunteer capacity');
  }

  // Join project
  await db.collection(COLLECTIONS.VOLUNTEER_PROJECT).insertOne({
    volunteer_id: volunteerId,
    project_id: projectId,
    join_date: new Date(),
    role,
    created_at: new Date(),
  });

  return true;
}

/**
 * Leave a project (remove volunteer from project)
 */
export async function leaveProject(volunteerId: number, projectId: number): Promise<boolean> {
  const db = await getDB();

  const result = await db
    .collection(COLLECTIONS.VOLUNTEER_PROJECT)
    .deleteOne({ volunteer_id: volunteerId, project_id: projectId });

  return result.deletedCount > 0;
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
  const db = await getDB();

  const result = await db
    .collection(COLLECTIONS.PROJECTS)
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
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

  if (result.length === 0) {
    return { total: 0, planned: 0, active: 0, completed: 0, cancelled: 0 };
  }

  return result[0] as any;
}
