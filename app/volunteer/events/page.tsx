'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VolunteerEvent {
  event_id: number;
  project_id: number;
  name: string;
  description?: string;
  event_date: Date;
  location?: string;
  max_participants: number;
  created_at: Date;
  project_name?: string;
  attendance_status?: string;
}

export default function VolunteerEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<VolunteerEvent[]>([]);
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
      fetchMyEvents(data.data.volunteer_id);
    } catch {
      router.push('/login');
    }
  };

  const fetchMyEvents = async (volunteerId: number) => {
    try {
      const res = await fetch(`/api/events?volunteerId=${volunteerId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (eventId: number) => {
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'present' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Attendance marked successfully!');
        if (user) {
          fetchMyEvents(user.volunteer_id);
        }
      } else {
        alert(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  const isEventUpcoming = (eventDate: Date) => {
    return new Date(eventDate) > new Date();
  };

  const isEventPast = (eventDate: Date) => {
    return new Date(eventDate) < new Date();
  };

  const getAttendanceBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Not Marked</Badge>;
    switch (status) {
      case 'present':
        return <Badge variant="default">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'excused':
        return <Badge variant="secondary">Excused</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const upcomingEvents = events.filter((e) => isEventUpcoming(e.event_date));
  const pastEvents = events.filter((e) => isEventPast(e.event_date));

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
          <h1 className="text-2xl font-bold text-green-600">My Events</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/volunteer">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Upcoming Events */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <p className="text-sm text-gray-600">
              Events in projects you've joined
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event.event_id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="space-y-2 text-sm flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Project:</span>
                      <span className="text-gray-600">{event.project_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Date:</span>
                      <span className="text-gray-600">
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Time:</span>
                      <span className="text-gray-600">
                        {new Date(event.event_date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Location:</span>
                      <span className="text-gray-600">{event.location || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Attendance:</span>
                      {getAttendanceBadge(event.attendance_status)}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      className="w-full"
                      onClick={() => handleMarkAttendance(event.event_id)}
                      disabled={!!event.attendance_status}
                    >
                      {event.attendance_status ? 'Attendance Marked' : 'Mark Attendance'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">No upcoming events in your projects.</p>
                <Button asChild>
                  <Link href="/volunteer/projects">Browse Projects</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Past Events</h2>
              <p className="text-sm text-gray-600">
                Your event attendance history
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Card key={event.event_id} className="flex flex-col opacity-75">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="space-y-2 text-sm flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Project:</span>
                        <span className="text-gray-600">{event.project_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Date:</span>
                        <span className="text-gray-600">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Location:</span>
                        <span className="text-gray-600">{event.location || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Attendance:</span>
                        {getAttendanceBadge(event.attendance_status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
