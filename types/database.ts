// Database Entity Types

export interface Organization {
  org_id: number;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
}

export interface Volunteer {
  volunteer_id: number;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  join_date: Date;
  status: 'active' | 'inactive' | 'suspended';
  role: 'admin' | 'volunteer';
  created_at: Date;
}

export interface Project {
  project_id: number;
  org_id: number;
  name: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  location?: string;
  max_volunteers: number;
  created_at: Date;
  // Computed fields (from joins)
  volunteer_count?: number;
  org_name?: string;
  is_joined?: number; // 1 if volunteer has joined, 0 otherwise
}

export interface Event {
  event_id: number;
  project_id: number;
  name: string;
  description?: string;
  event_date: Date;
  location?: string;
  max_participants: number;
  created_at: Date;
  // Computed fields
  project_name?: string;
  attendance_count?: number;
}

export interface VolunteerProject {
  volunteer_id: number;
  project_id: number;
  join_date: Date;
  role: string;
  created_at: Date;
  // Computed fields
  volunteer_name?: string;
  project_name?: string;
}

export interface EventAttendance {
  event_id: number;
  volunteer_id: number;
  marked_at: Date;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
  // Computed fields
  event_name?: string;
  volunteer_name?: string;
}

export interface Resource {
  resource_id: number;
  project_id: number;
  name: string;
  quantity: number;
  type?: string;
  description?: string;
  created_at: Date;
  // Computed fields
  project_name?: string;
}

// Dashboard Statistics Types
export interface AdminDashboardStats {
  total_volunteers: number;
  active_volunteers: number;
  total_projects: number;
  active_projects: number;
  total_events: number;
  upcoming_events: number;
  project_status_breakdown: {
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  volunteers_per_project: {
    project_id: number;
    project_name: string;
    volunteer_count: number;
  }[];
  attendance_stats: {
    total_attendances: number;
    average_attendance_per_event: number;
  };
}

export interface VolunteerDashboardStats {
  volunteer_id: number;
  MY_PROJECTS: number;
  EVENTS_ATTENDED: number;
  UPCOMING_EVENTS: number;
  projects: {
    project_id: number;
    project_name: string;
    join_date: Date;
    role: string;
  }[];
  recent_events: {
    event_id: number;
    event_name: string;
    event_date: Date;
    status: string;
  }[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface AuthUser {
  volunteer_id: number;
  name: string;
  email: string;
  role: 'admin' | 'volunteer';
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface JWTPayload {
  volunteer_id: number;
  email: string;
  role: 'admin' | 'volunteer';
  iat?: number;
  exp?: number;
}
