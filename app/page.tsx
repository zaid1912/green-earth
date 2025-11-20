'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          // Redirect based on role
          if (data.data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/volunteer');
          }
        }
      })
      .catch(() => {
        // User not logged in, stay on home page
      });
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Environmental Volunteer
            <span className="text-green-600"> Management System</span>
          </h1>
          <p className="text-xl text-gray-600">
            Join our community of environmental volunteers and make a real difference.
            Manage projects, track attendance, and collaborate on conservation efforts.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-8 sm:grid-cols-3 max-w-5xl">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-3 text-4xl">🌱</div>
            <h3 className="mb-2 text-lg font-semibold">Join Projects</h3>
            <p className="text-sm text-gray-600">
              Browse and join environmental conservation projects in your area
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-3 text-4xl">📅</div>
            <h3 className="mb-2 text-lg font-semibold">Track Events</h3>
            <p className="text-sm text-gray-600">
              RSVP for events and mark your attendance with ease
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-3 text-4xl">📊</div>
            <h3 className="mb-2 text-lg font-semibold">View Impact</h3>
            <p className="text-sm text-gray-600">
              Track your contributions and see the collective impact
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-600">
        <p>&copy; 2025 Environmental Volunteer Management System</p>
      </footer>
    </div>
  );
}
