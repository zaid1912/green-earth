// Resources Repository - Database Abstraction Layer
import { DatabaseType } from '../db-config';
import { Resource } from '@/types/database';

// Import Oracle queries
import * as OracleResourceQueries from '../queries/resources';

// Import MongoDB queries
import * as MongoResourceQueries from '../mongodb/queries/resources';

/**
 * Resources Repository Interface
 * This ensures both Oracle and MongoDB implementations have the same methods
 */
interface IResourceRepository {
  getAllResources(): Promise<Resource[]>;
  getResourceById(resourceId: number): Promise<Resource | null>;
  getResourcesByProject(projectId: number): Promise<Resource[]>;
  createResource(
    projectId: number,
    name: string,
    quantity: number,
    type: string,
    description?: string
  ): Promise<number>;
  updateResource(
    resourceId: number,
    data: {
      name?: string;
      quantity?: number;
      type?: string;
      description?: string;
    }
  ): Promise<boolean>;
  deleteResource(resourceId: number): Promise<boolean>;
  getResourceCountByProject(projectId: number): Promise<number>;
}

/**
 * Get the appropriate repository based on database type
 */
export function getResourceRepository(dbType: DatabaseType): IResourceRepository {
  if (dbType === 'mongodb') {
    return MongoResourceQueries as IResourceRepository;
  }

  // Default to Oracle
  return OracleResourceQueries as IResourceRepository;
}

/**
 * Convenience functions that use the repository
 * These are what your API routes will call
 */
export async function getAllResources(dbType: DatabaseType): Promise<Resource[]> {
  const repo = getResourceRepository(dbType);
  return repo.getAllResources();
}

export async function getResourceById(dbType: DatabaseType, resourceId: number): Promise<Resource | null> {
  const repo = getResourceRepository(dbType);
  return repo.getResourceById(resourceId);
}

export async function getResourcesByProject(dbType: DatabaseType, projectId: number): Promise<Resource[]> {
  const repo = getResourceRepository(dbType);
  return repo.getResourcesByProject(projectId);
}

export async function createResource(
  dbType: DatabaseType,
  projectId: number,
  name: string,
  quantity: number,
  type: string,
  description?: string
): Promise<number> {
  const repo = getResourceRepository(dbType);
  return repo.createResource(projectId, name, quantity, type, description);
}

export async function updateResource(
  dbType: DatabaseType,
  resourceId: number,
  data: {
    name?: string;
    quantity?: number;
    type?: string;
    description?: string;
  }
): Promise<boolean> {
  const repo = getResourceRepository(dbType);
  return repo.updateResource(resourceId, data);
}

export async function deleteResource(dbType: DatabaseType, resourceId: number): Promise<boolean> {
  const repo = getResourceRepository(dbType);
  return repo.deleteResource(resourceId);
}

export async function getResourceCountByProject(dbType: DatabaseType, projectId: number): Promise<number> {
  const repo = getResourceRepository(dbType);
  return repo.getResourceCountByProject(projectId);
}
