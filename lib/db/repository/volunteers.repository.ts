// Volunteers Repository - Database Abstraction Layer
import { DatabaseType } from '../db-config';
import { Volunteer } from '@/types/database';

// Import Oracle queries
import * as OracleVolunteerQueries from '../queries/volunteers';

// Import MongoDB queries
import * as MongoVolunteerQueries from '../mongodb/queries/volunteers';

/**
 * Volunteers Repository Interface
 */
interface IVolunteerRepository {
  getAllVolunteers(): Promise<Volunteer[]>;
  getVolunteerById(volunteerId: number): Promise<Volunteer | null>;
  getVolunteerByEmail(email: string): Promise<Volunteer | null>;
  createVolunteer(
    name: string,
    email: string,
    passwordHash: string,
    phone?: string,
    role?: 'admin' | 'volunteer'
  ): Promise<number>;
  updateVolunteer(
    volunteerId: number,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      status?: 'active' | 'inactive' | 'suspended';
    }
  ): Promise<boolean>;
  deleteVolunteer(volunteerId: number): Promise<boolean>;
  getVolunteersByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<Volunteer[]>;
  countVolunteersByStatus(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  }>;
  emailExists(email: string, excludeVolunteerId?: number): Promise<boolean>;
}

/**
 * Get the appropriate repository based on database type
 */
export function getVolunteerRepository(dbType: DatabaseType): IVolunteerRepository {
  if (dbType === 'mongodb') {
    return MongoVolunteerQueries as IVolunteerRepository;
  }

  // Default to Oracle
  return OracleVolunteerQueries as IVolunteerRepository;
}

/**
 * Convenience functions that use the repository
 */
export async function getAllVolunteers(dbType: DatabaseType): Promise<Volunteer[]> {
  const repo = getVolunteerRepository(dbType);
  return repo.getAllVolunteers();
}

export async function getVolunteerById(dbType: DatabaseType, volunteerId: number): Promise<Volunteer | null> {
  const repo = getVolunteerRepository(dbType);
  return repo.getVolunteerById(volunteerId);
}

export async function getVolunteerByEmail(dbType: DatabaseType, email: string): Promise<Volunteer | null> {
  const repo = getVolunteerRepository(dbType);
  return repo.getVolunteerByEmail(email);
}

export async function createVolunteer(
  dbType: DatabaseType,
  name: string,
  email: string,
  passwordHash: string,
  phone?: string,
  role?: 'admin' | 'volunteer'
): Promise<number> {
  const repo = getVolunteerRepository(dbType);
  return repo.createVolunteer(name, email, passwordHash, phone, role);
}

export async function updateVolunteer(
  dbType: DatabaseType,
  volunteerId: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'suspended';
  }
): Promise<boolean> {
  const repo = getVolunteerRepository(dbType);
  return repo.updateVolunteer(volunteerId, data);
}

export async function deleteVolunteer(dbType: DatabaseType, volunteerId: number): Promise<boolean> {
  const repo = getVolunteerRepository(dbType);
  return repo.deleteVolunteer(volunteerId);
}

export async function getVolunteersByStatus(
  dbType: DatabaseType,
  status: 'active' | 'inactive' | 'suspended'
): Promise<Volunteer[]> {
  const repo = getVolunteerRepository(dbType);
  return repo.getVolunteersByStatus(status);
}

export async function countVolunteersByStatus(dbType: DatabaseType): Promise<{
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}> {
  const repo = getVolunteerRepository(dbType);
  return repo.countVolunteersByStatus();
}

export async function emailExists(
  dbType: DatabaseType,
  email: string,
  excludeVolunteerId?: number
): Promise<boolean> {
  const repo = getVolunteerRepository(dbType);
  return repo.emailExists(email, excludeVolunteerId);
}
