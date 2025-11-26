// MongoDB Connection
// Install: npm install mongodb
// Add to .env: MONGODB_URI=mongodb://localhost:27017/volunteer_db

import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Get MongoDB connection URI from environment
 */
function getMongoURI(): string {
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_db';
}

/**
 * Connect to MongoDB and return database instance
 */
export async function connectToMongoDB(): Promise<Db> {
  try {
    if (db) {
      return db;
    }

    const uri = getMongoURI();
    client = new MongoClient(uri);
    await client.connect();

    db = client.db();
    console.log('✅ MongoDB connection established successfully');
    return db;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
}

/**
 * Get the database instance (connects if not already connected)
 */
export async function getDB(): Promise<Db> {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDB(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    throw error;
  }
}

/**
 * Test MongoDB connection
 */
export async function testMongoConnection(): Promise<boolean> {
  try {
    const database = await getDB();
    await database.command({ ping: 1 });
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  }
}

// Collection names (constants for consistency)
export const COLLECTIONS = {
  ORGANIZATIONS: 'organizations',
  VOLUNTEERS: 'volunteers',
  PROJECTS: 'projects',
  EVENTS: 'events',
  VOLUNTEER_PROJECT: 'volunteer_project',
  EVENT_ATTENDANCE: 'event_attendance',
  RESOURCES: 'resources',
} as const;
