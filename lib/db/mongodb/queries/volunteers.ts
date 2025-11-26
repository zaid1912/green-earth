// MongoDB Volunteers Queries
import { getDB, COLLECTIONS } from '../connection';
import { Volunteer } from '@/types/database';

/**
 * Get all volunteers
 */
export async function getAllVolunteers(): Promise<Volunteer[]> {
  const db = await getDB();

  const volunteers = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .find({}, { projection: { password_hash: 0 } })
    .sort({ created_at: -1 })
    .toArray();

  return volunteers as any;
}

/**
 * Get volunteer by ID
 */
export async function getVolunteerById(volunteerId: number): Promise<Volunteer | null> {
  const db = await getDB();

  const volunteer = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .findOne({ volunteer_id: volunteerId }, { projection: { password_hash: 0 } });

  return volunteer as any;
}

/**
 * Get volunteer by email (for authentication)
 */
export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
  const db = await getDB();

  const volunteer = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .findOne({ email: email.toLowerCase() });

  return volunteer as any;
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
  const db = await getDB();

  // Get the next volunteer_id (auto-increment simulation)
  const lastVolunteer = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .find()
    .sort({ volunteer_id: -1 })
    .limit(1)
    .toArray();

  const newVolunteerId = lastVolunteer.length > 0 ? lastVolunteer[0].volunteer_id + 1 : 1;

  const newVolunteer = {
    volunteer_id: newVolunteerId,
    name,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    phone: phone || null,
    join_date: new Date(),
    status: 'active',
    role,
    created_at: new Date(),
  };

  await db.collection(COLLECTIONS.VOLUNTEERS).insertOne(newVolunteer);

  return newVolunteerId;
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
  const db = await getDB();

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.status) updateData.status = data.status;

  if (Object.keys(updateData).length === 0) {
    return false;
  }

  const result = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .updateOne({ volunteer_id: volunteerId }, { $set: updateData });

  return result.modifiedCount > 0;
}

/**
 * Delete a volunteer
 */
export async function deleteVolunteer(volunteerId: number): Promise<boolean> {
  const db = await getDB();

  const result = await db.collection(COLLECTIONS.VOLUNTEERS).deleteOne({ volunteer_id: volunteerId });

  return result.deletedCount > 0;
}

/**
 * Get volunteers by status
 */
export async function getVolunteersByStatus(
  status: 'active' | 'inactive' | 'suspended'
): Promise<Volunteer[]> {
  const db = await getDB();

  const volunteers = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .find({ status }, { projection: { password_hash: 0 } })
    .sort({ name: 1 })
    .toArray();

  return volunteers as any;
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
  const db = await getDB();

  const result = await db
    .collection(COLLECTIONS.VOLUNTEERS)
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] },
          },
          suspended: {
            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] },
          },
        },
      },
    ])
    .toArray();

  if (result.length === 0) {
    return { total: 0, active: 0, inactive: 0, suspended: 0 };
  }

  return result[0] as any;
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string, excludeVolunteerId?: number): Promise<boolean> {
  const db = await getDB();

  const query: any = { email: email.toLowerCase() };

  if (excludeVolunteerId) {
    query.volunteer_id = { $ne: excludeVolunteerId };
  }

  const count = await db.collection(COLLECTIONS.VOLUNTEERS).countDocuments(query);

  return count > 0;
}
