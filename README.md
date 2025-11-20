# Environmental Volunteer Management System

A comprehensive web application for environmental NGOs to manage volunteers, projects, events, and track attendance. Built with Next.js 14, TypeScript, Oracle Database, and shadcn/ui.

## Progress Summary

**What's been completed:**
- ✅ Next.js 14 project initialized with TypeScript & Tailwind CSS
- ✅ shadcn/ui components installed
- ✅ All dependencies installed (oracledb, JWT, bcrypt, Zod)
- ✅ Complete database schema (7 tables) with sequences & triggers
- ✅ Database indexes for performance
- ✅ Seed data with sample volunteers, projects & events
- ✅ Oracle connection pool utility
- ✅ Database query functions for all entities
- ✅ JWT authentication utilities
- ✅ Password hashing with bcrypt
- ✅ Authentication middleware

**What's next:**
- API routes (auth, volunteers, projects, events, attendance, resources, dashboard)
- UI pages (auth, admin dashboard, volunteer dashboard)
- Form validation with Zod
- Testing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Oracle Autonomous Database (Cloud)
- **Authentication**: JWT with bcrypt password hashing
- **Database**: Oracle Database 21c (Always Free Tier)

## Features

### Admin Features
- Create/update/delete projects
- Create/update/delete events
- Manage volunteers and resources
- Comprehensive dashboard with statistics

### Volunteer Features
- Sign up & login
- Browse and join projects
- View events & mark attendance
- Personal dashboard

## Oracle Cloud Setup (Required First)

### Step 1: Create Oracle Cloud Account

1. Go to: https://www.oracle.com/cloud/free/
2. Sign up for free tier (no charges)
3. Verify email and add payment method (verification only)

### Step 2: Create Autonomous Database

1. Login to Oracle Cloud Console
2. **Menu** → **Oracle Database** → **Autonomous Database**
3. Click **"Create Autonomous Database"**
4. Configure:
   - Display name: `VolunteerDB`
   - Database name: `VOLUNTEERDB`
   - Workload: **Transaction Processing**
   - ✅ **Always Free: ON** (important!)
   - Admin password: Create strong password (remember this!)
5. Click **"Create"** (wait 2-3 min)

### Step 3: Download Wallet

1. Click your database name
2. **"Database connection"** → **"Download wallet"**
3. Set wallet password
4. Extract ZIP:
   ```bash
   mkdir -p ~/oracle-wallet
   unzip ~/Downloads/Wallet_VOLUNTEERDB.zip -d ~/oracle-wallet
   ```

### Step 4: Execute SQL Scripts

**Using SQL Developer Web (Easiest):**

1. Database page → **"Database actions"** → **"SQL"**
2. Login: `ADMIN` / your-password
3. Copy/paste and run each file:
   - `database/schema.sql`
   - `database/indexes.sql`
   - `database/seed.sql`

### Step 5: Get Connection String

In the wallet folder, look at `tnsnames.ora` or use the one from Oracle Cloud Console (e.g., `volunteerdb_high`)

## Local Setup

### 1. Install Oracle Instant Client (macOS)

**For M1/M2 Mac:**
- Download from: https://www.oracle.com/database/technologies/instant-client/macos-arm64-downloads.html
- Install the DMG
- Add to `~/.zshrc`:
  ```bash
  export DYLD_LIBRARY_PATH=~/Downloads/instantclient_19_8
  ```

**For Intel Mac:**
- Download from: https://www.oracle.com/database/technologies/instant-client/macos-intel-x86-downloads.html

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
ORACLE_CONNECTION_STRING=volunteerdb_high
ORACLE_USER=ADMIN
ORACLE_PASSWORD=YourAdminPassword123!
ORACLE_WALLET_PATH=/Users/yourusername/oracle-wallet

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

**Admin:**
- Email: `admin@greenearth.org`
- Password: `password123`

**Volunteer:**
- Email: `sarah.j@email.com`
- Password: `password123`

⚠️ Change in production!

## Project Structure

```
/app                 # Next.js 14 App Router
  /(auth)            # Login/Register
  /admin             # Admin pages
  /volunteer         # Volunteer pages
  /api               # API routes
/lib
  /db                # Database queries
  /auth              # JWT & auth
/database            # SQL scripts
```

## Database Schema

7 tables: Organizations, Volunteers, Projects, Events, Volunteer_Project, Event_Attendance, Resources

## Troubleshooting

**Oracle connection error:**
- Verify wallet path is correct
- Check connection string matches TNS name
- Ensure Instant Client is installed

**DPI-1047 error:**
- Install Oracle Instant Client
- Set `DYLD_LIBRARY_PATH`

## Next Steps

1. Follow Oracle Cloud setup above
2. Run SQL scripts in order
3. Configure `.env.local`
4. Install Oracle Instant Client
5. Run `npm run dev`
6. Login with default credentials

I'm continuing to build the API routes and UI. Let me know when your Oracle database is ready!
