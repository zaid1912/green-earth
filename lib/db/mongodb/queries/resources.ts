// MongoDB Resources Queries

import { getDB, COLLECTIONS } from '../connection';
import { Resource } from '@/types/database';

/**
 * Get all resources with project information
 */
export async function getAllResources(): Promise<Resource[]> {
  const db = await getDB();

  const resources = await db
    .collection(COLLECTIONS.RESOURCES)
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
        $addFields: {
          project_name: { $arrayElemAt: ['$project.name', 0] },
        },
      },
      {
        $project: {
          project: 0,
        },
      },
      {
        $sort: { created_at: -1 },
      },
    ])
    .toArray();

  return resources as any;
}

/**
 * Get resource by ID
 */
export async function getResourceById(resourceId: number): Promise<Resource | null> {
  const db = await getDB();

  const resource = await db
    .collection(COLLECTIONS.RESOURCES)
    .aggregate([
      {
        $match: { resource_id: resourceId },
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
        $addFields: {
          project_name: { $arrayElemAt: ['$project.name', 0] },
        },
      },
      {
        $project: {
          project: 0,
        },
      },
    ])
    .toArray();

  return resource.length > 0 ? (resource[0] as any) : null;
}

/**
 * Get resources by project
 */
export async function getResourcesByProject(projectId: number): Promise<Resource[]> {
  const db = await getDB();

  const resources = await db
    .collection(COLLECTIONS.RESOURCES)
    .find({ project_id: projectId })
    .sort({ name: 1 })
    .toArray();

  return resources as any;
}

/**
 * Create a new resource
 */
export async function createResource(
  projectId: number,
  name: string,
  quantity: number,
  type: string,
  description?: string
): Promise<number> {
  const db = await getDB();

  // Get the next resource_id (auto-increment simulation)
  const lastResource = await db
    .collection(COLLECTIONS.RESOURCES)
    .find()
    .sort({ resource_id: -1 })
    .limit(1)
    .toArray();

  const resourceId = lastResource.length > 0 ? (lastResource[0] as any).resource_id + 1 : 1;

  await db.collection(COLLECTIONS.RESOURCES).insertOne({
    resource_id: resourceId,
    project_id: projectId,
    name,
    quantity,
    type: type || null,
    description: description || null,
    created_at: new Date(),
  });

  return resourceId;
}

/**
 * Update a resource
 */
export async function updateResource(
  resourceId: number,
  data: {
    name?: string;
    quantity?: number;
    type?: string;
    description?: string;
  }
): Promise<boolean> {
  const db = await getDB();

  const updates: any = {};

  if (data.name !== undefined) {
    updates.name = data.name;
  }
  if (data.quantity !== undefined) {
    updates.quantity = data.quantity;
  }
  if (data.type !== undefined) {
    updates.type = data.type || null;
  }
  if (data.description !== undefined) {
    updates.description = data.description || null;
  }

  if (Object.keys(updates).length === 0) {
    return false;
  }

  const result = await db
    .collection(COLLECTIONS.RESOURCES)
    .updateOne({ resource_id: resourceId }, { $set: updates });

  return result.modifiedCount > 0;
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId: number): Promise<boolean> {
  const db = await getDB();

  const result = await db
    .collection(COLLECTIONS.RESOURCES)
    .deleteOne({ resource_id: resourceId });

  return result.deletedCount > 0;
}

/**
 * Get resource count by project
 */
export async function getResourceCountByProject(projectId: number): Promise<number> {
  const db = await getDB();

  const count = await db
    .collection(COLLECTIONS.RESOURCES)
    .countDocuments({ project_id: projectId });

  return count;
}
