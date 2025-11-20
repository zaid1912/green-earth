// Zod Validation Schemas for API Routes
import { z } from 'zod';

// Authentication Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address').max(200),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Volunteer Schemas
export const updateVolunteerSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(20).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100),
});

// Project Schemas
export const createProjectSchema = z.object({
  orgId: z.number().int().positive(),
  name: z.string().min(2).max(200),
  description: z.string().max(4000),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).nullable().optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']),
  location: z.string().max(500),
  maxVolunteers: z.number().int().positive(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(4000).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).nullable().optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
  location: z.string().max(500).optional(),
  maxVolunteers: z.number().int().positive().optional(),
});

export const joinProjectSchema = z.object({
  role: z.string().max(100).default('volunteer'),
});

// Event Schemas
export const createEventSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string().min(2).max(200),
  description: z.string().max(4000),
  eventDate: z.string().datetime().or(z.date()),
  location: z.string().max(500),
  maxParticipants: z.number().int().positive(),
});

export const updateEventSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(4000).optional(),
  eventDate: z.string().datetime().or(z.date()).optional(),
  location: z.string().max(500).optional(),
  maxParticipants: z.number().int().positive().optional(),
});

// Attendance Schemas
export const markAttendanceSchema = z.object({
  status: z.enum(['registered', 'attended', 'absent', 'cancelled']),
  notes: z.string().max(1000).optional(),
});

// Resource Schemas
export const createResourceSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string().min(2).max(200),
  type: z.string().max(100),
  quantity: z.number().int().positive(),
  unit: z.string().max(50),
  status: z.enum(['available', 'in_use', 'depleted', 'ordered']),
  notes: z.string().max(1000).optional(),
});

export const updateResourceSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  type: z.string().max(100).optional(),
  quantity: z.number().int().positive().optional(),
  unit: z.string().max(50).optional(),
  status: z.enum(['available', 'in_use', 'depleted', 'ordered']).optional(),
  notes: z.string().max(1000).optional(),
});

// Types inferred from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type JoinProjectInput = z.infer<typeof joinProjectSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
