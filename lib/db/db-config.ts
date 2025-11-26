// Database Configuration and Selection Utilities
import { cookies } from 'next/headers';

export type DatabaseType = 'oracle' | 'mongodb';

/**
 * Get the selected database type from cookies (server-side)
 * Defaults to Oracle if not set
 */
export async function getSelectedDatabase(): Promise<DatabaseType> {
  const cookieStore = await cookies();
  const dbType = cookieStore.get('db_type')?.value as DatabaseType;
  return dbType || 'oracle'; // Default to Oracle
}

/**
 * Get the selected database type from request cookies (for API routes)
 */
export function getSelectedDatabaseFromRequest(request: Request): DatabaseType {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return (cookies['db_type'] as DatabaseType) || 'oracle';
}

/**
 * Get database display name
 */
export function getDatabaseDisplayName(dbType: DatabaseType): string {
  return dbType === 'oracle' ? 'Oracle Cloud Database' : 'MongoDB';
}
