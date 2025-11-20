// Volunteer Database Queries
import { executeQuery, executeQuerySingle, executeUpdate } from '../connection';
import { Volunteer } from '@/types/database';

/**
 * Get all volunteers
 */
export async function getAllVolunteers(): Promise<Volunteer[]> {
  const query = `
    SELECT volunteer_id, name, email, phone, join_date, status, role, created_at
    FROM VOLUNTEERS
    ORDER BY created_at DESC
  `;
  return executeQuery<Volunteer>(query);
}

/**
 * Get volunteer by ID
 */
export async function getVolunteerById(volunteerId: number): Promise<Volunteer | null> {
  const query = `
    SELECT volunteer_id, name, email, phone, join_date, status, role, created_at
    FROM VOLUNTEERS
    WHERE volunteer_id = :1
  `;
  return executeQuerySingle<Volunteer>(query, [volunteerId]);
}

/**
 * Get volunteer by email (for authentication)
 */
export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
  const query = `
    SELECT volunteer_id, name, email, password_hash, phone, join_date, status, role, created_at
    FROM VOLUNTEERS
    WHERE LOWER(email) = LOWER(:1)
  `;
  return executeQuerySingle<Volunteer>(query, [email]);
}

/**
 * Create a new volunteer
 */
export async function createVolunteer(
  name: string,
  email: string,
  passwordHash: string,
  phone?: string,
  role: 'admin' | 'volunteer' = 'volunteer'
): Promise<number> {
  // Use a simpler approach without RETURNING clause for better compatibility
  const insertQuery = `
    INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
    VALUES (:1, :2, :3, :4, :5, 'active')
  `;

  await executeUpdate(insertQuery, [name, email, passwordHash, phone || null, role]);

  // Get the volunteer_id by email
  const selectQuery = `
    SELECT volunteer_id FROM VOLUNTEERS WHERE LOWER(email) = LOWER(:1)
  `;
  const result = await executeQuery<any>(selectQuery, [email]);
  return result[0].VOLUNTEER_ID;
}

/**
 * Update volunteer information
 */
export async function updateVolunteer(
  volunteerId: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'suspended';
  }
): Promise<boolean> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (data.name) {
    updates.push(`name = :${paramIndex++}`);
    params.push(data.name);
  }
  if (data.email) {
    updates.push(`email = :${paramIndex++}`);
    params.push(data.email);
  }
  if (data.phone !== undefined) {
    updates.push(`phone = :${paramIndex++}`);
    params.push(data.phone || null);
  }
  if (data.status) {
    updates.push(`status = :${paramIndex++}`);
    params.push(data.status);
  }

  if (updates.length === 0) {
    return false;
  }

  params.push(volunteerId);
  const query = `
    UPDATE VOLUNTEERS
    SET ${updates.join(', ')}
    WHERE volunteer_id = :${paramIndex}
  `;

  const rowsAffected = await executeUpdate(query, params);
  return rowsAffected > 0;
}

/**
 * Delete a volunteer
 */
export async function deleteVolunteer(volunteerId: number): Promise<boolean> {
  const query = 'DELETE FROM VOLUNTEERS WHERE volunteer_id = :1';
  const rowsAffected = await executeUpdate(query, [volunteerId]);
  return rowsAffected > 0;
}

/**
 * Get volunteers by status
 */
export async function getVolunteersByStatus(
  status: 'active' | 'inactive' | 'suspended'
): Promise<Volunteer[]> {
  const query = `
    SELECT volunteer_id, name, email, phone, join_date, status, role, created_at
    FROM VOLUNTEERS
    WHERE status = :1
    ORDER BY name
  `;
  return executeQuery<Volunteer>(query, [status]);
}

/**
 * Count volunteers by status
 */
export async function countVolunteersByStatus(): Promise<{
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}> {
  const query = `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
    FROM VOLUNTEERS
  `;
  const result = await executeQuerySingle<any>(query);
  return {
    total: result?.TOTAL || 0,
    active: result?.ACTIVE || 0,
    inactive: result?.INACTIVE || 0,
    suspended: result?.SUSPENDED || 0,
  };
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string, excludeVolunteerId?: number): Promise<boolean> {
  let query = `
    SELECT COUNT(*) as count
    FROM VOLUNTEERS
    WHERE LOWER(email) = LOWER(:1)
  `;
  const params: any[] = [email];

  if (excludeVolunteerId) {
    query += ' AND volunteer_id != :2';
    params.push(excludeVolunteerId);
  }

  const result = await executeQuerySingle<any>(query, params);
  return (result?.COUNT || 0) > 0;
}
