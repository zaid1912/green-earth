'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Volunteer } from '@/types/database';

export default function AdminVolunteersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    checkAuth();
    fetchVolunteers();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.success || data.data.role !== 'admin') {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await fetch('/api/volunteers');
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVolunteer) return;
    try {
      const res = await fetch(`/api/volunteers/${selectedVolunteer.volunteer_id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setShowDeleteDialog(false);
        setSelectedVolunteer(null);
        fetchVolunteers();
      } else {
        alert(data.error || 'Failed to delete volunteer');
      }
    } catch (error) {
      alert('Failed to delete volunteer');
    }
  };

  const openDeleteDialog = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDeleteDialog(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'outline';
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
          <h1 className="text-2xl font-bold text-green-600">Manage Volunteers</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Volunteers</CardTitle>
            <CardDescription>View and manage volunteer accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((volunteer) => (
                  <TableRow key={volunteer.volunteer_id}>
                    <TableCell className="font-medium">{volunteer.name}</TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(volunteer.role) as any}>
                        {volunteer.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(volunteer.status) as any}>
                        {volunteer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {volunteer.join_date ? new Date(volunteer.join_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(volunteer)}
                        disabled={volunteer.role === 'admin'}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {volunteers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No volunteers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Volunteer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedVolunteer?.name}"? This action cannot be undone and will
                remove all associated records.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
