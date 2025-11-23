// Resources Database Queries
import { executeQuery, executeQuerySingle, executeUpdate } from '../connection';
import { Resource } from '@/types/database';

/**
 * Get all resources
 */
export async function getAllResources(): Promise<Resource[]> {
  const query = `
    SELECT
      r.resource_id,
      r.project_id,
      r.name,
      r.quantity,
      r.type,
      r.description,
      r.created_at,
      p.name as project_name
    FROM RESOURCES r
    LEFT JOIN PROJECTS p ON r.project_id = p.project_id
    ORDER BY r.created_at DESC
  `;
  return executeQuery<Resource>(query);
}

/**
 * Get resource by ID
 */
export async function getResourceById(resourceId: number): Promise<Resource | null> {
  const query = `
    SELECT
      r.resource_id,
      r.project_id,
      r.name,
      r.quantity,
      r.type,
      r.description,
      r.created_at,
      p.name as project_name
    FROM RESOURCES r
    LEFT JOIN PROJECTS p ON r.project_id = p.project_id
    WHERE r.resource_id = :1
  `;
  return executeQuerySingle<Resource>(query, [resourceId]);
}

/**
 * Get resources by project
 */
export async function getResourcesByProject(projectId: number): Promise<Resource[]> {
  const query = `
    SELECT
      resource_id,
      project_id,
      name,
      quantity,
      type,
      description,
      created_at
    FROM RESOURCES
    WHERE project_id = :1
    ORDER BY name
  `;
  return executeQuery<Resource>(query, [projectId]);
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
  const query = `
    INSERT INTO RESOURCES (project_id, name, quantity, type, description)
    VALUES (:1, :2, :3, :4, :5)
    RETURNING resource_id INTO :6
  `;

  const params = {
    1: projectId,
    2: name,
    3: quantity,
    4: type,
    5: description || null,
    6: { dir: 3003, type: 2002 }, // OUT parameter
  };

  const result = await executeQuery(query, params);
  return result[0] as any as number;
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
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name) {
    updates.push(`name = :${paramIndex++}`);
    params.push(data.name);
  }
  if (data.quantity !== undefined) {
    updates.push(`quantity = :${paramIndex++}`);
    params.push(data.quantity);
  }
  if (data.type !== undefined) {
    updates.push(`type = :${paramIndex++}`);
    params.push(data.type);
  }
  if (data.description !== undefined) {
    updates.push(`description = :${paramIndex++}`);
    params.push(data.description || null);
  }

  if (updates.length === 0) {
    return false;
  }

  params.push(resourceId);
  const query = `
    UPDATE RESOURCES
    SET ${updates.join(', ')}
    WHERE resource_id = :${paramIndex}
  `;

  const rowsAffected = await executeUpdate(query, params);
  return rowsAffected > 0;
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId: number): Promise<boolean> {
  const query = 'DELETE FROM RESOURCES WHERE resource_id = :1';
  const rowsAffected = await executeUpdate(query, [resourceId]);
  return rowsAffected > 0;
}

/**
 * Get resource count by project
 */
export async function getResourceCountByProject(projectId: number): Promise<number> {
  const query = `
    SELECT COUNT(*) as count
    FROM RESOURCES
    WHERE project_id = :1
  `;
  const result = await executeQuerySingle<any>(query, [projectId]);
  return result?.count || 0;
}
