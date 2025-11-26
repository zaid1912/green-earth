// Dashboard Repository - Database Abstraction Layer
import { DatabaseType } from '../db-config';
import { AdminDashboardStats, VolunteerDashboardStats } from '@/types/database';

// Import Oracle queries
import * as OracleDashboardQueries from '../queries/dashboard';

// Import MongoDB queries
import * as MongoDashboardQueries from '../mongodb/queries/dashboard';

/**
 * Dashboard Repository Interface
 */
interface IDashboardRepository {
  getAdminDashboardStats(): Promise<AdminDashboardStats>;
  getVolunteerDashboardStats(volunteerId: number): Promise<VolunteerDashboardStats>;
  getProjectStats(projectId: number): Promise<{
    volunteer_count: number;
    event_count: number;
    resource_count: number;
    total_attendance: number;
  }>;
  getRecentActivity(limit?: number): Promise<any[]>;
}

/**
 * Get the appropriate repository based on database type
 */
export function getDashboardRepository(dbType: DatabaseType): IDashboardRepository {
  if (dbType === 'mongodb') {
    return MongoDashboardQueries as IDashboardRepository;
  }

  // Default to Oracle
  return OracleDashboardQueries as IDashboardRepository;
}

/**
 * Convenience functions that use the repository
 */
export async function getAdminDashboardStats(dbType: DatabaseType): Promise<AdminDashboardStats> {
  const repo = getDashboardRepository(dbType);
  return repo.getAdminDashboardStats();
}

export async function getVolunteerDashboardStats(
  dbType: DatabaseType,
  volunteerId: number
): Promise<VolunteerDashboardStats> {
  const repo = getDashboardRepository(dbType);
  return repo.getVolunteerDashboardStats(volunteerId);
}

export async function getProjectStats(
  dbType: DatabaseType,
  projectId: number
): Promise<{
  volunteer_count: number;
  event_count: number;
  resource_count: number;
  total_attendance: number;
}> {
  const repo = getDashboardRepository(dbType);
  return repo.getProjectStats(projectId);
}

export async function getRecentActivity(dbType: DatabaseType, limit?: number): Promise<any[]> {
  const repo = getDashboardRepository(dbType);
  return repo.getRecentActivity(limit);
}
