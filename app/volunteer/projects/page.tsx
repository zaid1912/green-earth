'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/database';

export default function VolunteerProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.success) {
        router.push('/login');
        return;
      }
      setUser(data.data);
    } catch {
      router.push('/login');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        // Filter to show only active and planned projects
        const availableProjects = data.data.filter(
          (p: Project) => p.status === 'active' || p.status === 'planned'
        );
        setProjects(availableProjects);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setLoading(false);
    }
  };

  const handleJoinProject = async (projectId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'participant' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Successfully joined the project!');
        fetchProjects();
      } else {
        alert(data.error || 'Failed to join project');
      }
    } catch (error) {
      alert('Failed to join project');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const isProjectFull = (project: Project) => {
    return (project.volunteer_count || 0) >= project.max_volunteers;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-green-600">Browse Projects</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/volunteer">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Available Environmental Projects</h2>
          <p className="text-sm text-gray-600">
            Join projects that interest you and make a difference!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.project_id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(project.status) as any}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="space-y-2 text-sm flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Location:</span>
                    <span className="text-gray-600">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Start Date:</span>
                    <span className="text-gray-600">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Volunteers:</span>
                    <span className="text-gray-600">
                      {project.volunteer_count || 0} / {project.max_volunteers}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => handleJoinProject(project.project_id)}
                    disabled={isProjectFull(project)}
                  >
                    {isProjectFull(project) ? 'Project Full' : 'Join Project'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No projects available at this time.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
