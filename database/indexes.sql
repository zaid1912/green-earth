-- Environmental Volunteer Management System - Database Indexes
-- Oracle Database

-- Indexes for VOLUNTEERS table
CREATE INDEX idx_volunteers_email ON VOLUNTEERS(email);
CREATE INDEX idx_volunteers_status ON VOLUNTEERS(status);
CREATE INDEX idx_volunteers_role ON VOLUNTEERS(role);
CREATE INDEX idx_volunteers_join_date ON VOLUNTEERS(join_date);

-- Indexes for PROJECTS table
CREATE INDEX idx_projects_org_id ON PROJECTS(org_id);
CREATE INDEX idx_projects_status ON PROJECTS(status);
CREATE INDEX idx_projects_start_date ON PROJECTS(start_date);
CREATE INDEX idx_projects_end_date ON PROJECTS(end_date);
CREATE INDEX idx_projects_name ON PROJECTS(name);

-- Indexes for EVENTS table
CREATE INDEX idx_events_project_id ON EVENTS(project_id);
CREATE INDEX idx_events_date ON EVENTS(event_date);
CREATE INDEX idx_events_name ON EVENTS(name);

-- Indexes for VOLUNTEER_PROJECT table
CREATE INDEX idx_vp_volunteer_id ON VOLUNTEER_PROJECT(volunteer_id);
CREATE INDEX idx_vp_project_id ON VOLUNTEER_PROJECT(project_id);
CREATE INDEX idx_vp_join_date ON VOLUNTEER_PROJECT(join_date);

-- Indexes for EVENT_ATTENDANCE table
CREATE INDEX idx_ea_event_id ON EVENT_ATTENDANCE(event_id);
CREATE INDEX idx_ea_volunteer_id ON EVENT_ATTENDANCE(volunteer_id);
CREATE INDEX idx_ea_status ON EVENT_ATTENDANCE(status);
CREATE INDEX idx_ea_marked_at ON EVENT_ATTENDANCE(marked_at);

-- Indexes for RESOURCES table
CREATE INDEX idx_resources_project_id ON RESOURCES(project_id);
CREATE INDEX idx_resources_type ON RESOURCES(type);

-- Composite indexes for common queries
CREATE INDEX idx_projects_org_status ON PROJECTS(org_id, status);
CREATE INDEX idx_events_project_date ON EVENTS(project_id, event_date);
CREATE INDEX idx_vp_composite ON VOLUNTEER_PROJECT(project_id, volunteer_id);

COMMIT;
