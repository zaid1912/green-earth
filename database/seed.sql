-- Environmental Volunteer Management System - Seed Data
-- Oracle Database

-- Note: Password hashes are for 'password123' (bcrypt hash)
-- In production, use the registration API to create properly hashed passwords

-- Insert Organizations
INSERT INTO ORGANIZATIONS (name, description, email, phone, address)
VALUES (
    'Green Earth Alliance',
    'A dedicated environmental NGO focused on conservation, reforestation, and community education about sustainable practices.',
    'contact@greenearth.org',
    '+1-555-0100',
    '123 Eco Street, Green City, GC 12345'
);

-- Insert Volunteers (including 1 admin and 4 regular volunteers)
-- Password for all: 'password123'
-- Hash: $2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ
INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
VALUES (
    'Admin User',
    'admin@greenearth.org',
    '$2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ',
    '+1-555-0101',
    'admin',
    'active'
);

INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
VALUES (
    'Sarah Johnson',
    'sarah.j@email.com',
    '$2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ',
    '+1-555-0102',
    'volunteer',
    'active'
);

INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
VALUES (
    'Michael Chen',
    'michael.c@email.com',
    '$2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ',
    '+1-555-0103',
    'volunteer',
    'active'
);

INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
VALUES (
    'Emily Rodriguez',
    'emily.r@email.com',
    '$2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ',
    '+1-555-0104',
    'volunteer',
    'active'
);

INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
VALUES (
    'David Kim',
    'david.k@email.com',
    '$2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ',
    '+1-555-0105',
    'volunteer',
    'active'
);

INSERT INTO VOLUNTEERS (name, email, password_hash, phone, role, status)
VALUES (
    'Lisa Martinez',
    'lisa.m@email.com',
    '$2b$10$rKvFr0pVXzSVOKWZz7YxmOJ5jPzqZ9qKvFr0pVXzSVOKWZz7YxmOJ',
    '+1-555-0106',
    'volunteer',
    'active'
);

-- Insert Projects
INSERT INTO PROJECTS (org_id, name, description, start_date, end_date, status, location, max_volunteers)
VALUES (
    1,
    'Urban Tree Planting Initiative',
    'Plant 10,000 trees across the city to improve air quality and create green spaces in urban areas.',
    TO_DATE('2024-03-01', 'YYYY-MM-DD'),
    TO_DATE('2024-12-31', 'YYYY-MM-DD'),
    'active',
    'Downtown Green City',
    100
);

INSERT INTO PROJECTS (org_id, name, description, start_date, end_date, status, location, max_volunteers)
VALUES (
    1,
    'River Cleanup Campaign',
    'Monthly cleanup activities along the Green River to remove plastic waste and restore natural habitats.',
    TO_DATE('2024-01-15', 'YYYY-MM-DD'),
    TO_DATE('2024-11-15', 'YYYY-MM-DD'),
    'active',
    'Green River Park',
    50
);

INSERT INTO PROJECTS (org_id, name, description, start_date, end_date, status, location, max_volunteers)
VALUES (
    1,
    'Community Composting Education',
    'Educational workshops teaching residents about composting and sustainable waste management.',
    TO_DATE('2024-06-01', 'YYYY-MM-DD'),
    NULL,
    'planned',
    'Community Center',
    30
);

INSERT INTO PROJECTS (org_id, name, description, start_date, end_date, status, location, max_volunteers)
VALUES (
    1,
    'Wildlife Habitat Restoration',
    'Restore degraded wildlife habitats by removing invasive species and planting native vegetation.',
    TO_DATE('2023-09-01', 'YYYY-MM-DD'),
    TO_DATE('2024-02-28', 'YYYY-MM-DD'),
    'completed',
    'Green Valley Nature Reserve',
    40
);

-- Insert Events
INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
VALUES (
    1,
    'Spring Tree Planting Day',
    'Join us for a day of planting oak and maple trees in the downtown park area.',
    TO_TIMESTAMP('2024-03-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    'Central Park',
    50
);

INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
VALUES (
    1,
    'Summer Planting Event',
    'Plant drought-resistant trees and shrubs in the western district.',
    TO_TIMESTAMP('2024-06-20 08:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    'West District Park',
    60
);

INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
VALUES (
    2,
    'March River Cleanup',
    'Monthly cleanup session focusing on the northern riverbank.',
    TO_TIMESTAMP('2024-03-10 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    'Green River North',
    30
);

INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
VALUES (
    2,
    'April River Cleanup',
    'Cleanup and wildlife monitoring along the southern riverbank.',
    TO_TIMESTAMP('2024-04-14 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    'Green River South',
    35
);

INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
VALUES (
    3,
    'Introduction to Composting Workshop',
    'Learn the basics of home composting and sustainable waste practices.',
    TO_TIMESTAMP('2024-06-05 14:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    'Community Center Room A',
    25
);

INSERT INTO EVENTS (project_id, name, description, event_date, location, max_participants)
VALUES (
    4,
    'Final Habitat Assessment',
    'Complete final assessment and documentation of restoration efforts.',
    TO_TIMESTAMP('2024-02-20 09:00:00', 'YYYY-MM-DD HH24:MI:SS'),
    'Green Valley Reserve',
    20
);

-- Insert Volunteer-Project relationships
-- Volunteer 2 (Sarah) - Projects 1, 2
INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (2, 1, 'team_leader', TO_DATE('2024-03-01', 'YYYY-MM-DD'));

INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (2, 2, 'participant', TO_DATE('2024-01-20', 'YYYY-MM-DD'));

-- Volunteer 3 (Michael) - Projects 1, 3
INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (3, 1, 'participant', TO_DATE('2024-03-05', 'YYYY-MM-DD'));

INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (3, 3, 'coordinator', TO_DATE('2024-02-15', 'YYYY-MM-DD'));

-- Volunteer 4 (Emily) - Projects 2, 4
INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (4, 2, 'participant', TO_DATE('2024-01-15', 'YYYY-MM-DD'));

INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (4, 4, 'participant', TO_DATE('2023-09-10', 'YYYY-MM-DD'));

-- Volunteer 5 (David) - Project 1
INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (5, 1, 'participant', TO_DATE('2024-03-08', 'YYYY-MM-DD'));

-- Volunteer 6 (Lisa) - Projects 2, 3
INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (6, 2, 'team_leader', TO_DATE('2024-01-15', 'YYYY-MM-DD'));

INSERT INTO VOLUNTEER_PROJECT (volunteer_id, project_id, role, join_date)
VALUES (6, 3, 'participant', TO_DATE('2024-02-20', 'YYYY-MM-DD'));

-- Insert Event Attendance records
-- Event 1 (Spring Tree Planting)
INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (1, 2, 'present');

INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (1, 3, 'present');

INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (1, 5, 'present');

-- Event 3 (March River Cleanup)
INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (3, 2, 'present');

INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (3, 4, 'present');

INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (3, 6, 'present');

-- Event 4 (April River Cleanup)
INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (4, 4, 'present');

INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (4, 6, 'present');

-- Event 6 (Final Habitat Assessment)
INSERT INTO EVENT_ATTENDANCE (event_id, volunteer_id, status)
VALUES (6, 4, 'present');

-- Insert Resources
INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    1,
    'Tree Saplings',
    500,
    'Plant Material',
    'Various species of native tree saplings for urban planting'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    1,
    'Shovels',
    25,
    'Tools',
    'Professional-grade digging shovels'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    1,
    'Work Gloves',
    100,
    'Safety Equipment',
    'Heavy-duty work gloves for volunteers'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    2,
    'Trash Bags',
    200,
    'Supplies',
    'Heavy-duty trash bags for river cleanup'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    2,
    'Grabber Tools',
    30,
    'Tools',
    'Long-handled litter grabbers'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    3,
    'Compost Bins',
    15,
    'Equipment',
    'Educational compost bins for demonstrations'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    3,
    'Educational Materials',
    50,
    'Supplies',
    'Printed guides and brochures on composting'
);

INSERT INTO RESOURCES (project_id, name, quantity, type, description)
VALUES (
    4,
    'Native Plant Seeds',
    1000,
    'Plant Material',
    'Seeds for native vegetation restoration'
);

COMMIT;

-- Verify data insertion
SELECT 'Organizations: ' || COUNT(*) as count FROM ORGANIZATIONS;
SELECT 'Volunteers: ' || COUNT(*) as count FROM VOLUNTEERS;
SELECT 'Projects: ' || COUNT(*) as count FROM PROJECTS;
SELECT 'Events: ' || COUNT(*) as count FROM EVENTS;
SELECT 'Volunteer-Project: ' || COUNT(*) as count FROM VOLUNTEER_PROJECT;
SELECT 'Event Attendance: ' || COUNT(*) as count FROM EVENT_ATTENDANCE;
SELECT 'Resources: ' || COUNT(*) as count FROM RESOURCES;
