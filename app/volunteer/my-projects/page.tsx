'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MyProject {
  project_id: number;
  org_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date?: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  location: string;
  max_volunteers: number;
  created_at: Date;
  org_name?: string;
  join_date: Date;
  volunteer_role: string;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<MyProject | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
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
      fetchMyProjects(data.data.volunteer_id);
    } catch {
      router.push('/login');
    }
  };

  const fetchMyProjects = async (volunteerId: number) => {
    try {
      const res = await fetch(`/api/projects?volunteerId=${volunteerId}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!selectedProject || !user) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.project_id}/leave`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setShowLeaveDialog(false);
        setSelectedProject(null);
        fetchMyProjects(user.volunteer_id);
      } else {
        alert(data.error || 'Failed to leave project');
      }
    } catch (error) {
      alert('Failed to leave project');
    }
  };

  const openLeaveDialog = (project: MyProject) => {
    setSelectedProject(project);
    setShowLeaveDialog(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'planned':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'destructive';
    }
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
          <h1 className="text-2xl font-bold text-green-600">My Projects</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/volunteer">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Projects You've Joined</h2>
          <p className="text-sm text-gray-600">
            View and manage your environmental project involvement
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
                    <span className="font-medium">Your Role:</span>
                    <Badge variant="outline" className="text-xs">
                      {project.volunteer_role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Location:</span>
                    <span className="text-gray-600">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Joined:</span>
                    <span className="text-gray-600">
                      {project.join_date ? new Date(project.join_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Start Date:</span>
                    <span className="text-gray-600">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => openLeaveDialog(project)}
                  >
                    Leave Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">You haven't joined any projects yet.</p>
              <Button asChild>
                <Link href="/volunteer/projects">Browse Projects</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Leave Project Confirmation Dialog */}
        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave "{selectedProject?.name}"? You can always rejoin later if there's
                space available.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLeaveProject}>
                Leave Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
