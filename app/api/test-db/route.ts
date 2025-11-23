// Test Database Connection API Route
import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db/connection';
import { getAllVolunteers } from '@/lib/db/queries/volunteers';
import { getAllProjects } from '@/lib/db/queries/projects';

export async function GET() {
  try {
    // Test basic connection
    const connectionOk = await testConnection();

    if (!connectionOk) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Test queries
    const volunteers = await getAllVolunteers();
    const projects = await getAllProjects();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        connection: 'OK',
        volunteers_count: volunteers.length,
        projects_count: projects.length,
        sample_volunteer: volunteers[0]?.name || 'No volunteers found',
        sample_project: projects[0]?.name || 'No projects found',
      },
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Database test failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
