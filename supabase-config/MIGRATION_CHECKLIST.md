# Migration Checklist

Use this checklist to ensure a smooth migration of your WeeGym data to your new CMS.

## ✅ Pre-Migration Checklist

### 1. Verify Current Setup

- [ ] WeeGym app is running and accessible
- [ ] You can see your existing workouts and sessions
- [ ] You know your current Supabase project URL and keys
- [ ] You have access to your Supabase dashboard

### 2. Backup Current Data (Optional but Recommended)

- [ ] Export data from Supabase dashboard (Settings > API > Export)
- [ ] Or use the migration script: `node supabase-config/migrate-data.js export`

### 3. Prepare New CMS Environment

- [ ] New Supabase project created (or existing database ready)
- [ ] Note down new Supabase URL and anon key
- [ ] Verify you can access the new Supabase dashboard

## ✅ Setup Checklist

### 4. Copy Supabase Config Package

```bash
# Option 1: Copy to new project
[ ] cp -r supabase-config /path/to/new-cms/

# Option 2: Use as local package
[ ] npm install file:/path/to/weegym/supabase-config
```

### 5. Install Dependencies

```bash
[ ] cd /path/to/new-cms
[ ] npm install @supabase/supabase-js
# or
[ ] yarn add @supabase/supabase-js
```

### 6. Set Up Database Schema

- [ ] Open new Supabase project dashboard
- [ ] Go to SQL Editor
- [ ] Open `supabase-config/schema.sql`
- [ ] Copy the entire SQL script
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify no errors in execution
- [ ] Check that tables are created (Database > Tables)

### 7. Verify Table Creation

In Supabase Dashboard > Database > Tables, verify these tables exist:

- [ ] `workouts`
- [ ] `active_wellbeing_sessions`
- [ ] `user_settings`

## ✅ Export Phase

### 8. Configure Source Environment

Create `.env.weegym` in supabase-config directory:

```bash
[ ] cd supabase-config
[ ] touch .env.weegym
```

Add your WeeGym Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-weegym-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-weegym-anon-key
```

### 9. Run Export

```bash
[ ] cd supabase-config
[ ] export $(cat .env.weegym | xargs)
[ ] node migrate-data.js export
[ ] Verify `weegym-data-export.json` was created
```

### 10. Verify Export

Open `weegym-data-export.json` and check:

- [ ] File contains `metadata` section
- [ ] File contains `data.workouts` array
- [ ] File contains `data.sessions` array
- [ ] File contains `data.settings` object
- [ ] Numbers in `stats` section match your expectations

Example verification:

```bash
[ ] cat weegym-data-export.json | grep "totalWorkouts"
[ ] cat weegym-data-export.json | grep "totalSessions"
```

## ✅ Import Phase

### 11. Configure Destination Environment

Create `.env.cms` in supabase-config directory:

```bash
[ ] cd supabase-config
[ ] touch .env.cms
```

Add your CMS Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-cms-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-cms-anon-key
```

### 12. Authentication Setup (if required)

If your database requires authentication:

- [ ] Create a user account in new Supabase (Authentication > Users > Add user)
- [ ] Add credentials to `.env.cms`:
  ```env
  USER_EMAIL=your-email@example.com
  USER_PASSWORD=your-password
  ```

### 13. Run Import

```bash
[ ] cd supabase-config
[ ] export $(cat .env.cms | xargs)
[ ] node migrate-data.js import
[ ] Wait for import to complete (may take a while for large datasets)
```

### 14. Verify Import

In new Supabase Dashboard > Database > Table Editor:

- [ ] Open `workouts` table - verify data is present
- [ ] Open `active_wellbeing_sessions` table - verify data is present
- [ ] Open `user_settings` table - verify settings are present
- [ ] Check row counts match your export

Or use the compare command:

```bash
[ ] node migrate-data.js compare
```

## ✅ Integration Phase

### 15. Integrate with CMS

In your CMS project:

```javascript
// Import the package
[ ] import { getSupabaseClient, createDatabaseService } from './supabase-config/index.js';

// Create instances
[ ] const supabase = getSupabaseClient();
[ ] const db = createDatabaseService(supabase);

// Test retrieval
[ ] const workouts = await db.getWorkouts();
[ ] console.log(`Found ${workouts.length} workouts`);
```

### 16. Test Basic Operations

Test each operation:

- [ ] Get workouts: `db.getWorkouts()`
- [ ] Get sessions: `db.getActiveWellbeingSessions()`
- [ ] Get settings: `db.getUserSettings()`
- [ ] Save a test workout: `db.saveWorkout({...})`
- [ ] Delete test workout: `db.deleteWorkout(id)`

### 17. Test Authentication (if using)

```javascript
[ ] import createAuthService from './supabase-config/auth.js';
[ ] const auth = createAuthService(supabase);
[ ] const user = await auth.signIn('email', 'password');
[ ] console.log('Signed in as:', user.email);
```

## ✅ Post-Migration Verification

### 18. Data Integrity Check

Compare original vs migrated data:

- [ ] Count workouts: Original vs New
- [ ] Sample random workouts: Verify exercise data matches
- [ ] Check date ranges: Verify oldest and newest records
- [ ] Verify settings values match

### 19. Feature Testing

Test your CMS features:

- [ ] Create new workout - verify it saves
- [ ] Edit workout - verify changes persist
- [ ] Delete workout - verify it's removed
- [ ] View workout history - verify correct display
- [ ] Test any filters/searches

### 20. Performance Check

- [ ] Test query performance with full dataset
- [ ] Check loading times for workout list
- [ ] Verify pagination works (if implemented)
- [ ] Test search/filter responsiveness

## ✅ Cleanup & Documentation

### 21. Clean Up

- [ ] Remove test data created during integration testing
- [ ] Delete temporary `.env.weegym` and `.env.cms` files (keep backups!)
- [ ] Archive `weegym-data-export.json` in a secure location
- [ ] Document any schema modifications you made

### 22. Update Documentation

- [ ] Document your CMS Supabase URL for team
- [ ] Update any environment setup guides
- [ ] Note any custom modifications to schema
- [ ] Document any new database operations added

### 23. Set Up Monitoring (Optional)

- [ ] Set up Supabase dashboard alerts
- [ ] Configure backup schedules
- [ ] Set up error logging
- [ ] Configure usage monitoring

## ✅ Rollback Plan (Just in Case)

### 24. Prepare Rollback Strategy

In case something goes wrong:

- [ ] Keep WeeGym original database active during testing
- [ ] Keep `weegym-data-export.json` backup
- [ ] Document steps to restore from backup
- [ ] Test rollback procedure before decommissioning original

## 📊 Migration Success Criteria

Your migration is successful when:

- ✅ All data imported without errors
- ✅ Row counts match between source and destination
- ✅ Sample data verification shows correct values
- ✅ All CRUD operations work in CMS
- ✅ Authentication works (if applicable)
- ✅ Performance is acceptable
- ✅ Team can access and use the new system

## 🆘 Troubleshooting

### Common Issues

**"No user is currently authenticated"**

- Solution: Create user in Supabase Auth, sign in before importing

**"Invalid API key"**

- Solution: Verify environment variables are correct and loaded

**"Row Level Security policy violation"**

- Solution: Ensure you're signed in, or temporarily disable RLS for import

**Import is slow**

- Solution: Normal for large datasets. Consider batch imports for 10k+ records

**Data looks wrong after import**

- Solution: Check `weegym-data-export.json` for data integrity

## 📞 Getting Help

If you encounter issues:

1. Check [README.md](supabase-config/README.md) for API documentation
2. Review [MIGRATION_GUIDE.md](supabase-config/MIGRATION_GUIDE.md) for detailed steps
3. Look at [EXAMPLES.md](supabase-config/EXAMPLES.md) for code examples
4. Check Supabase dashboard logs for errors
5. Review browser console for client-side errors

## 🎉 Post-Migration

Once everything is working:

- [ ] Celebrate! 🎉
- [ ] Gradually transition users to new CMS
- [ ] Keep WeeGym running in parallel initially (if possible)
- [ ] Monitor for any issues during transition period
- [ ] Collect feedback from users
- [ ] Plan for eventual decommissioning of WeeGym (if applicable)

---

**Remember:** Take your time with each step. It's better to verify thoroughly than to rush and miss issues!
