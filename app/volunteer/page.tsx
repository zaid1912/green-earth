'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VolunteerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push('/login');
          return;
        }
        setUser(data.data);
        return fetch('/api/dashboard/volunteer');
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.success) {
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-green-600">My Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                My Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.MY_PROJECTS || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Events Attended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.EVENTS_ATTENDED || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.UPCOMING_EVENTS || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Button asChild className="h-24 flex-col gap-2">
                <Link href="/volunteer/projects">
                  <span className="text-2xl">🔍</span>
                  <span>Browse Projects</span>
                </Link>
              </Button>
              <Button asChild className="h-24 flex-col gap-2" variant="outline">
                <Link href="/volunteer/my-projects">
                  <span className="text-2xl">📁</span>
                  <span>My Projects</span>
                </Link>
              </Button>
              <Button asChild className="h-24 flex-col gap-2" variant="outline">
                <Link href="/volunteer/events">
                  <span className="text-2xl">📅</span>
                  <span>My Events</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Environmental Volunteer Platform</CardTitle>
            <CardDescription>
              Start making a difference by joining environmental projects and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Browse available projects, join ones that interest you, and track your attendance
              at events. Together, we can make a positive impact on our environment.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
