// Projects Repository - Database Abstraction Layer
import { DatabaseType } from '../db-config';
import { Project } from '@/types/database';

// Import Oracle queries
import * as OracleProjectQueries from '../queries/projects';

// Import MongoDB queries
import * as MongoProjectQueries from '../mongodb/queries/projects';

/**
 * Projects Repository Interface
 * This ensures both Oracle and MongoDB implementations have the same methods
 */
interface IProjectRepository {
  getAllProjects(): Promise<Project[]>;
  getAllProjectsWithJoinStatus(volunteerId: number): Promise<Project[]>;
  getProjectById(projectId: number): Promise<Project | null>;
  createProject(
    orgId: number,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date | null,
    status: 'planned' | 'active' | 'completed' | 'cancelled',
    location: string,
    maxVolunteers: number
  ): Promise<number>;
  updateProject(
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
  ): Promise<boolean>;
  deleteProject(projectId: number): Promise<boolean>;
  getProjectsByStatus(status: 'planned' | 'active' | 'completed' | 'cancelled'): Promise<Project[]>;
  getProjectsByVolunteer(volunteerId: number): Promise<Project[]>;
  joinProject(volunteerId: number, projectId: number, role?: string): Promise<boolean>;
  leaveProject(volunteerId: number, projectId: number): Promise<boolean>;
  countProjectsByStatus(): Promise<{
    total: number;
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
  }>;
}

/**
 * Get the appropriate repository based on database type
 */
export function getProjectRepository(dbType: DatabaseType): IProjectRepository {
  if (dbType === 'mongodb') {
    return MongoProjectQueries as IProjectRepository;
  }

  // Default to Oracle
  return OracleProjectQueries as IProjectRepository;
}

/**
 * Convenience functions that use the repository
 * These are what your API routes will call
 */
export async function getAllProjects(dbType: DatabaseType): Promise<Project[]> {
  const repo = getProjectRepository(dbType);
  return repo.getAllProjects();
}

export async function getAllProjectsWithJoinStatus(
  dbType: DatabaseType,
  volunteerId: number
): Promise<Project[]> {
  const repo = getProjectRepository(dbType);
  return repo.getAllProjectsWithJoinStatus(volunteerId);
}

export async function getProjectById(dbType: DatabaseType, projectId: number): Promise<Project | null> {
  const repo = getProjectRepository(dbType);
  return repo.getProjectById(projectId);
}

export async function createProject(
  dbType: DatabaseType,
  orgId: number,
  name: string,
  description: string,
  startDate: Date,
  endDate: Date | null,
  status: 'planned' | 'active' | 'completed' | 'cancelled',
  location: string,
  maxVolunteers: number
): Promise<number> {
  const repo = getProjectRepository(dbType);
  return repo.createProject(orgId, name, description, startDate, endDate, status, location, maxVolunteers);
}

export async function updateProject(
  dbType: DatabaseType,
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
  const repo = getProjectRepository(dbType);
  return repo.updateProject(projectId, data);
}

export async function deleteProject(dbType: DatabaseType, projectId: number): Promise<boolean> {
  const repo = getProjectRepository(dbType);
  return repo.deleteProject(projectId);
}

export async function getProjectsByStatus(
  dbType: DatabaseType,
  status: 'planned' | 'active' | 'completed' | 'cancelled'
): Promise<Project[]> {
  const repo = getProjectRepository(dbType);
  return repo.getProjectsByStatus(status);
}

export async function getProjectsByVolunteer(dbType: DatabaseType, volunteerId: number): Promise<Project[]> {
  const repo = getProjectRepository(dbType);
  return repo.getProjectsByVolunteer(volunteerId);
}

export async function joinProject(
  dbType: DatabaseType,
  volunteerId: number,
  projectId: number,
  role?: string
): Promise<boolean> {
  const repo = getProjectRepository(dbType);
  return repo.joinProject(volunteerId, projectId, role);
}

export async function leaveProject(
  dbType: DatabaseType,
  volunteerId: number,
  projectId: number
): Promise<boolean> {
  const repo = getProjectRepository(dbType);
  return repo.leaveProject(volunteerId, projectId);
}

export async function countProjectsByStatus(dbType: DatabaseType): Promise<{
  total: number;
  planned: number;
  active: number;
  completed: number;
  cancelled: number;
}> {
  const repo = getProjectRepository(dbType);
  return repo.countProjectsByStatus();
}
