'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || data.data.role !== 'admin') {
          router.push('/login');
          return;
        }
        setUser(data.data);
        return fetch('/api/dashboard/admin');
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
          <h1 className="text-2xl font-bold text-green-600">Admin Dashboard</h1>
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
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.TOTAL_VOLUNTEERS || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.ACTIVE_PROJECTS || 0}</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.TOTAL_ATTENDANCE || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-24 flex-col gap-2">
                <Link href="/admin/projects">
                  <span className="text-2xl">📁</span>
                  <span>Manage Projects</span>
                </Link>
              </Button>
              <Button asChild className="h-24 flex-col gap-2" variant="outline">
                <Link href="/admin/events">
                  <span className="text-2xl">📅</span>
                  <span>Manage Events</span>
                </Link>
              </Button>
              <Button asChild className="h-24 flex-col gap-2" variant="outline">
                <Link href="/admin/volunteers">
                  <span className="text-2xl">👥</span>
                  <span>View Volunteers</span>
                </Link>
              </Button>
              <Button asChild className="h-24 flex-col gap-2" variant="outline">
                <Link href="/admin/resources">
                  <span className="text-2xl">📦</span>
                  <span>Manage Resources</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
