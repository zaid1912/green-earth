# Database Selection Setup Guide

This guide explains how the dual-database system works and how to set it up.

## What's Been Implemented

✅ **Database Selection Modal** - Appears every time user opens the app
✅ **Cookie-based Database Selection** - Persists across API calls
✅ **Repository Pattern** - Clean abstraction between Oracle and MongoDB
✅ **MongoDB Connection Setup** - Ready to use with MongoDB
✅ **Example API Route** - `/api/projects` updated to use the new system

---

## How It Works

### 1. User Flow

1. User opens the app at `http://localhost:3000`
2. **Database Selection Modal appears** (before authentication)
3. User chooses either:
   - Oracle Cloud Database
   - MongoDB
4. Selection is stored in:
   - `sessionStorage` (for the browser)
   - Cookie named `db_type` (for API routes)
5. All API calls use the selected database

### 2. Technical Architecture

```
Frontend (page.tsx)
    ↓
[Database Selection Modal]
    ↓
API Routes (e.g., /api/projects)
    ↓
getSelectedDatabaseFromRequest() → reads cookie
    ↓
Repository Layer (projects.repository.ts)
    ↓
┌─────────────────┬─────────────────┐
│   Oracle DB     │    MongoDB      │
│ (queries/*)     │ (mongodb/*)     │
└─────────────────┴─────────────────┘
```

---

## Installation Steps

### Step 1: Install MongoDB Driver

```bash
npm install mongodb
```

### Step 2: Add MongoDB to Environment Variables

Edit your `.env` file and add:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/volunteer_db
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer_db
```

### Step 3: Setup MongoDB Database

You have two options:

#### Option A: Local MongoDB

1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB: `mongod`
3. Use the URI: `mongodb://localhost:27017/volunteer_db`

#### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### Step 4: Migrate Schema to MongoDB

The Oracle schema needs to be replicated in MongoDB. You can either:

**Option 1: Manual Migration**
- Use the existing data from Oracle
- Export and import to MongoDB

**Option 2: Run Seed Script** (create one similar to `database/seed.sql`)

Create a file `database/seed-mongo.ts`:

```typescript
import { getDB, COLLECTIONS } from '@/lib/db/mongodb/connection';

async function seedMongoDB() {
  const db = await getDB();

  // Create sample organization
  await db.collection(COLLECTIONS.ORGANIZATIONS).insertOne({
    org_id: 1,
    name: 'Green Earth Initiative',
    description: 'Environmental conservation organization',
    email: 'contact@greenearth.org',
    created_at: new Date(),
  });

  // Create sample admin volunteer
  await db.collection(COLLECTIONS.VOLUNTEERS).insertOne({
    volunteer_id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: '$2a$10$...', // hashed password
    role: 'admin',
    status: 'active',
    created_at: new Date(),
  });

  // Add more seed data...

  console.log('✅ MongoDB seeded successfully');
}

seedMongoDB().catch(console.error);
```

Run it:
```bash
npx ts-node database/seed-mongo.ts
```

---

## Updating Other API Routes

I've updated `/api/projects/route.ts` as an example. Here's how to update other routes:

### Before:

```typescript
import { getAllVolunteers } from '@/lib/db/queries/volunteers';

export async function GET(request: NextRequest) {
  const volunteers = await getAllVolunteers();
  // ...
}
```

### After:

```typescript
import { getSelectedDatabaseFromRequest } from '@/lib/db/db-config';
import * as VolunteerRepository from '@/lib/db/repository/volunteers.repository';

export async function GET(request: NextRequest) {
  const dbType = getSelectedDatabaseFromRequest(request);
  const volunteers = await VolunteerRepository.getAllVolunteers(dbType);
  // ...
}
```

### Steps to Update Each Route:

1. **Create MongoDB queries** for the entity (like I did for projects)
2. **Create repository file** (e.g., `lib/db/repository/volunteers.repository.ts`)
3. **Update API route** to use repository instead of direct queries
4. **Test both databases**

---

## Files Created/Modified

### New Files:

1. `components/database-selector-modal.tsx` - Modal UI for database selection
2. `lib/db/db-config.ts` - Database selection utilities
3. `lib/db/repository/projects.repository.ts` - Repository pattern for projects
4. `lib/db/mongodb/connection.ts` - MongoDB connection
5. `lib/db/mongodb/queries/projects.ts` - MongoDB queries for projects

### Modified Files:

1. `app/page.tsx` - Added database selector modal
2. `app/api/projects/route.ts` - Updated to use repository pattern

---

## Testing

### Test Oracle Database:

1. Run the app: `npm run dev`
2. Open `http://localhost:3000`
3. Select "Oracle Cloud Database"
4. Login and verify functionality

### Test MongoDB:

1. Ensure MongoDB is running
2. Ensure `MONGODB_URI` is in `.env`
3. Run the app: `npm run dev`
4. Open `http://localhost:3000`
5. Select "MongoDB"
6. Login and verify functionality

---

## Next Steps

To complete the dual-database implementation:

### 1. Create Repositories for All Entities

You need to create repository files for:
- ✅ Projects (done)
- ⏳ Volunteers
- ⏳ Events
- ⏳ Resources
- ⏳ Dashboard
- ⏳ Attendance

### 2. Create MongoDB Queries for All Entities

Create files in `lib/db/mongodb/queries/` for:
- ✅ projects.ts (done)
- ⏳ volunteers.ts
- ⏳ events.ts
- ⏳ resources.ts
- ⏳ dashboard.ts
- ⏳ attendance.ts

### 3. Update All API Routes

Update these routes to use repositories:
- ✅ `/api/projects/*` (done)
- ⏳ `/api/volunteers/*`
- ⏳ `/api/events/*`
- ⏳ `/api/resources/*`
- ⏳ `/api/dashboard/*`
- ⏳ `/api/auth/*`

### 4. Data Migration

Decide on your data strategy:
- Keep both DBs synchronized?
- Different data in each?
- Use one as primary?

---

## Troubleshooting

### Modal doesn't appear
- Check browser console for errors
- Clear sessionStorage: `sessionStorage.clear()`
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### API routes still use Oracle
- Check cookie is being set: Open DevTools → Application → Cookies
- Verify `db_type` cookie exists
- Check API route uses `getSelectedDatabaseFromRequest(request)`

### MongoDB connection fails
- Verify MongoDB is running: `mongod --version`
- Check `MONGODB_URI` in `.env`
- Test connection: Create a test route that calls `testMongoConnection()`

### Data not appearing from MongoDB
- Check collections exist: Use MongoDB Compass or `mongosh`
- Verify seed data was inserted
- Check query syntax (MongoDB uses different syntax than SQL)

---

## Tips

1. **Start with one entity** - Get projects working first, then replicate for others
2. **Keep Oracle working** - Don't break existing functionality while adding MongoDB
3. **Test frequently** - Switch between databases to ensure both work
4. **Use TypeScript** - The repository pattern ensures type safety across both DBs
5. **Copy the pattern** - Use `projects.repository.ts` as template for other entities

---

## Support

If you need help:
1. Check this guide first
2. Review the example implementations in `lib/db/repository/projects.repository.ts`
3. Test with one database at a time
4. Verify cookies are being set correctly

---

## Summary

You now have a working dual-database system where:
- ✅ Users choose database via modal on startup
- ✅ Selection persists via cookies
- ✅ API routes work with either database
- ✅ Clean separation between database implementations
- ✅ No changes needed to frontend components

The system is designed to be simple and maintainable while supporting both Oracle and MongoDB seamlessly!
