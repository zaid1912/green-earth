"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || data.data.role !== "admin") {
          router.push("/login");
          return;
        }
        setUser(data.data);
        return fetch("/api/dashboard/admin");
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.success) {
          console.log("Dashboard stats:", data.data);
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Dashboard error:", error);
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Environmental Volunteer Management System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Volunteers Card */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-full bg-white/20 p-3">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  Active: {stats?.active_volunteers || 0}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium opacity-90">Total Users</p>
                <p className="text-4xl font-bold mt-1">
                  {stats?.total_volunteers || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Active Projects Card */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-full bg-white/20 p-3">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  Total: {stats?.total_projects || 0}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium opacity-90">
                  Active Projects
                </p>
                <p className="text-4xl font-bold mt-1">
                  {stats?.active_projects || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Upcoming Events Card */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-full bg-white/20 p-3">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  Total: {stats?.total_events || 0}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium opacity-90">
                  Upcoming Events
                </p>
                <p className="text-4xl font-bold mt-1">
                  {stats?.upcoming_events || 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Attendance Card */}
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-full bg-white/20 p-3">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  Avg:{" "}
                  {stats?.attendance_stats?.average_attendance_per_event?.toFixed(
                    1
                  ) || 0}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium opacity-90">
                  Total Attendance
                </p>
                <p className="text-4xl font-bold mt-1">
                  {stats?.attendance_stats?.total_attendances || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Project Status Breakdown */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Project Status Overview</CardTitle>
              <CardDescription>
                Current status of all environmental projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Planned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-100 w-48">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{
                          width: `${
                            (stats?.project_status_breakdown?.planned /
                              stats?.total_projects) *
                              100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">
                      {stats?.project_status_breakdown?.planned || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-100 w-48">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${
                            (stats?.project_status_breakdown?.active /
                              stats?.total_projects) *
                              100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">
                      {stats?.project_status_breakdown?.active || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-100 w-48">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${
                            (stats?.project_status_breakdown?.completed /
                              stats?.total_projects) *
                              100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">
                      {stats?.project_status_breakdown?.completed || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Cancelled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-100 w-48">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{
                          width: `${
                            (stats?.project_status_breakdown?.cancelled /
                              stats?.total_projects) *
                              100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8 text-right">
                      {stats?.project_status_breakdown?.cancelled || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Projects */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Top Projects</CardTitle>
              <CardDescription>By volunteer participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.volunteers_per_project
                  ?.slice(0, 5)
                  .map((project: any, index: number) => (
                    <div
                      key={project.project_id}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-600"
                            : "bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {project.project_name || "Unnamed Project"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.volunteer_count} volunteers
                        </p>
                      </div>
                    </div>
                  )) || (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No projects yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Manage your environmental volunteer system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/projects" className="group">
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8 transition-all hover:border-green-500 hover:bg-green-50">
                  <div className="rounded-full bg-green-100 p-4 group-hover:bg-green-500 transition-colors">
                    <svg
                      className="h-8 w-8 text-green-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-green-600">
                    Manage Projects
                  </span>
                </div>
              </Link>
              <Link href="/admin/events" className="group">
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8 transition-all hover:border-purple-500 hover:bg-purple-50">
                  <div className="rounded-full bg-purple-100 p-4 group-hover:bg-purple-500 transition-colors">
                    <svg
                      className="h-8 w-8 text-purple-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-purple-600">
                    Manage Events
                  </span>
                </div>
              </Link>
              <Link href="/admin/volunteers" className="group">
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8 transition-all hover:border-blue-500 hover:bg-blue-50">
                  <div className="rounded-full bg-blue-100 p-4 group-hover:bg-blue-500 transition-colors">
                    <svg
                      className="h-8 w-8 text-blue-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-blue-600">
                    View Users
                  </span>
                </div>
              </Link>
              <Link href="/admin/resources" className="group">
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-8 transition-all hover:border-orange-500 hover:bg-orange-50">
                  <div className="rounded-full bg-orange-100 p-4 group-hover:bg-orange-500 transition-colors">
                    <svg
                      className="h-8 w-8 text-orange-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-orange-600">
                    Manage Resources
                  </span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
