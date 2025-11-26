// Events Repository - Database Abstraction Layer
import { DatabaseType } from '../db-config';
import { Event } from '@/types/database';

// Import Oracle queries
import * as OracleEventQueries from '../queries/events';

// Import MongoDB queries
import * as MongoEventQueries from '../mongodb/queries/events';

/**
 * Events Repository Interface
 */
interface IEventRepository {
  getAllEvents(): Promise<Event[]>;
  getEventById(eventId: number): Promise<Event | null>;
  getEventsByProject(projectId: number): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  getEventsForVolunteer(volunteerId: number): Promise<Event[]>;
  createEvent(
    projectId: number,
    name: string,
    description: string,
    eventDate: Date,
    location: string,
    maxParticipants: number
  ): Promise<number>;
  updateEvent(
    eventId: number,
    data: {
      name?: string;
      description?: string;
      eventDate?: Date;
      location?: string;
      maxParticipants?: number;
    }
  ): Promise<boolean>;
  deleteEvent(eventId: number): Promise<boolean>;
  countEvents(): Promise<{ total: number; upcoming: number }>;
}

/**
 * Get the appropriate repository based on database type
 */
export function getEventRepository(dbType: DatabaseType): IEventRepository {
  if (dbType === 'mongodb') {
    return MongoEventQueries as IEventRepository;
  }

  // Default to Oracle
  return OracleEventQueries as IEventRepository;
}

/**
 * Convenience functions that use the repository
 */
export async function getAllEvents(dbType: DatabaseType): Promise<Event[]> {
  const repo = getEventRepository(dbType);
  return repo.getAllEvents();
}

export async function getEventById(dbType: DatabaseType, eventId: number): Promise<Event | null> {
  const repo = getEventRepository(dbType);
  return repo.getEventById(eventId);
}

export async function getEventsByProject(dbType: DatabaseType, projectId: number): Promise<Event[]> {
  const repo = getEventRepository(dbType);
  return repo.getEventsByProject(projectId);
}

export async function getUpcomingEvents(dbType: DatabaseType): Promise<Event[]> {
  const repo = getEventRepository(dbType);
  return repo.getUpcomingEvents();
}

export async function getEventsForVolunteer(dbType: DatabaseType, volunteerId: number): Promise<Event[]> {
  const repo = getEventRepository(dbType);
  return repo.getEventsForVolunteer(volunteerId);
}

export async function createEvent(
  dbType: DatabaseType,
  projectId: number,
  name: string,
  description: string,
  eventDate: Date,
  location: string,
  maxParticipants: number
): Promise<number> {
  const repo = getEventRepository(dbType);
  return repo.createEvent(projectId, name, description, eventDate, location, maxParticipants);
}

export async function updateEvent(
  dbType: DatabaseType,
  eventId: number,
  data: {
    name?: string;
    description?: string;
    eventDate?: Date;
    location?: string;
    maxParticipants?: number;
  }
): Promise<boolean> {
  const repo = getEventRepository(dbType);
  return repo.updateEvent(eventId, data);
}

export async function deleteEvent(dbType: DatabaseType, eventId: number): Promise<boolean> {
  const repo = getEventRepository(dbType);
  return repo.deleteEvent(eventId);
}

export async function countEvents(dbType: DatabaseType): Promise<{ total: number; upcoming: number }> {
  const repo = getEventRepository(dbType);
  return repo.countEvents();
}
