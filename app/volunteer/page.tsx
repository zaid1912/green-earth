'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VolunteerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-lg shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
              <p className="text-xs text-gray-500">Ready to make a difference today?</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Hero Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {/* My Projects Card */}
          <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100 mb-1">My Projects</p>
                  <p className="text-4xl font-bold">{stats?.MY_PROJECTS || 0}</p>
                  <p className="text-xs text-green-100 mt-2">Active enrollments</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Attended Card */}
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100 mb-1">Events Attended</p>
                  <p className="text-4xl font-bold">{stats?.EVENTS_ATTENDED || 0}</p>
                  <p className="text-xs text-blue-100 mt-2">Total participation</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events Card */}
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100 mb-1">Upcoming Events</p>
                  <p className="text-4xl font-bold">{stats?.UPCOMING_EVENTS || 0}</p>
                  <p className="text-xs text-purple-100 mt-2">Events to attend</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </CardTitle>
            <CardDescription>Jump right into what matters most</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/volunteer/projects" className="group">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 mb-4">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Browse Projects</h3>
                  <p className="text-xs text-gray-500 text-center">Discover new environmental initiatives</p>
                </div>
              </Link>

              <Link href="/volunteer/my-projects" className="group">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 mb-4">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">My Projects</h3>
                  <p className="text-xs text-gray-500 text-center">View your active projects</p>
                </div>
              </Link>

              <Link href="/volunteer/events" className="group">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 mb-4">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">My Events</h3>
                  <p className="text-xs text-gray-500 text-center">Check upcoming events</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects Section */}
        {stats?.projects && stats.projects.length > 0 && (
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Your Recent Projects
              </CardTitle>
              <CardDescription>Projects you're currently involved in</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats.projects.slice(0, 3).map((project: any, index: number) => (
                  <div
                    key={project.project_id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{project.project_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.role}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Joined {new Date(project.join_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href="/volunteer/my-projects">
                      <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600">
                        View Details
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              {stats.projects.length > 3 && (
                <div className="mt-4 text-center">
                  <Link href="/volunteer/my-projects">
                    <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-600 hover:border-green-300">
                      View All {stats.projects.length} Projects
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Welcome Message / Impact Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Make an Impact Today! 🌍</h2>
                <p className="text-green-50 mb-4 max-w-2xl">
                  Every action counts in our mission to protect the environment. Join projects, attend events,
                  and collaborate with fellow volunteers to create lasting positive change.
                </p>
                <div className="flex gap-3">
                  <Link href="/volunteer/projects">
                    <Button variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                      Explore Projects
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="h-32 w-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats?.MY_PROJECTS || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Projects Joined</div>
              </div>
              <div className="p-4 border-l border-r border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{stats?.EVENTS_ATTENDED || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Events Completed</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats?.UPCOMING_EVENTS || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Events Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
