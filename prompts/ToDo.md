# WeeGym Project Roadmap - Next Stages

**Last Updated:** May 19, 2026  
**Status:** Active Development - P1 & Q4 Complete! ✅

---

## 🎉 Recently Completed (May 19, 2026)

### ✅ Q4: App Icon & PWA Enhancement - COMPLETE

- All PWA icons generated (192x192, 512x512, favicons)
- manifest.json updated with correct paths
- index.html updated with proper meta tags
- Professional appearance on mobile home screens
- **Status:** Working ✅

### ✅ P1: Strava Webhooks for Real-Time Sync - IMPLEMENTATION COMPLETE

- Supabase Edge Function created and ready to deploy
- Webhook verification & event processing implemented
- Database migration prepared
- Service methods added (subscribe, view, unsubscribe)
- Comprehensive setup documentation created
- **Status:** Ready for deployment 🚀
- **Next:** Deploy to Supabase (see `docs/STRAVA_WEBHOOKS_SETUP.md`)

---

## 📋 Quick Status Overview

### ✅ Completed Major Features

- **Slimming World Syns Tracker** (Phases 1-5) - Full implementation with accessibility
- **Strava Integration** (Phases 1-6) - Complete with PR tracking & analytics
- **Multi-User System** - Authentication, profiles, and custom programmes
- **Active Wellbeing Tracker** - Gym sessions & machine tracking
- **Calorie/Food Tracker** - Barcode scanning & Open Food Facts integration

### 🎯 Current Focus Areas

1. **System Refinement** - Bug fixes, performance optimization
2. **User Experience** - Polish existing features based on usage
3. **Feature Enhancement** - Extend completed systems with advanced capabilities

---

## 🚀 Priority Enhancements (High Value, Near-Term)

### P1: Strava Webhooks for Real-Time Sync - COMPLETE

**Status:** Implementation Complete ✅ | Ready for Deployment 🚀

**Completed:**

- ✅ Supabase Edge Function created (`supabase/functions/strava-webhook/index.ts`)
- ✅ Webhook verification handling (GET endpoint)
- ✅ Event processing (create, update, delete activities)
- ✅ Automatic token refresh
- ✅ Database migration (`supabase-config/add-strava-webhooks.sql`)
- ✅ Service methods (subscribe, view, unsubscribe webhooks)
- ✅ Complete setup documentation (`docs/STRAVA_WEBHOOKS_SETUP.md`)

**Next Steps:**

1. Install Supabase CLI
2. Deploy Edge Function
3. Run database migration
4. Subscribe to webhooks
5. Test with real Strava activities

**See:** `docs/STRAVA_WEBHOOKS_SETUP.md` for deployment instructions

---

### P2: Exercise Video/Image Library 📹

**Value:** High | **Effort:** 8-12 hours | **Status:** Not Started

**Why:** Help users with proper form, reduce injury risk

**What:**

- Video demonstrations for common exercises
- Form tips and cues
- Alternative exercises for different equipment
- Muscle group animations
- Integration with workout programme exercises

**Implementation Options:**

#### Option A: External Links

- Link to YouTube/fitness sites (Quick: 2 hours)
- Curated list of trusted sources
- Simple database field for video URL

#### Option B: Embedded Content

- Host videos in Supabase Storage (Medium: 6-8 hours)
- Embed player in exercise details
- Requires storage space and CDN considerations

#### Option C: Full Library

- Custom video library with search (Complex: 12+ hours)
- Tag by muscle group, equipment, difficulty
- User favorites and history

**Recommended:** Start with Option A, expand to B based on usage

**Database Changes:**

```sql
ALTER TABLE programme_exercises
ADD COLUMN video_url TEXT,
ADD COLUMN form_tips TEXT,
ADD COLUMN muscle_groups TEXT[];
```

---

### P3: Programme Templates Library 📚

**Value:** High | **Effort:** 6-8 hours | **Status:** Not Started

**Why:** Help new users get started quickly, share proven programmes

**What:**

- Pre-built workout programmes for common goals
- Beginner, Intermediate, Advanced templates
- Specific goals: Strength, Hypertrophy, Endurance, Fat Loss
- One-click programme cloning to user's account
- Community-submitted templates (future)

**Templates to Create:**

- 5x5 Strength Builder (3 days)
- Upper/Lower Split (4 days)
- Push/Pull/Legs (3-6 days)
- Full Body Beginner (3 days)
- Bodyweight Circuit (3 days)

**Database Schema:**

```sql
CREATE TABLE programme_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT, -- 'strength', 'hypertrophy', 'endurance'
  level TEXT, -- 'beginner', 'intermediate', 'advanced'
  days_per_week INTEGER,
  template_data JSONB, -- Full programme structure
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI Components:**

- Template browser page (`/templates`)
- Preview template details
- "Use This Template" button
- Customization before saving

---

## 🎨 Quality of Life Improvements (Medium Priority)

### Q4: App Icon & PWA Enhancement - COMPLETE

**Status:** Complete ✅ | Working in Production

**Completed:**

- ✅ Generated all required icon sizes (16x16 to 512x512)
- ✅ Created favicon.ico with multiple sizes embedded
- ✅ Updated manifest.json with correct icon references
- ✅ Added proper meta tags to index.html
- ✅ iOS and Android PWA support configured

**Files Created:**

- `public/favicon.ico`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/apple-touch-icon.png`

**Testing:**

- Desktop browser: ✅ Favicon appears in tabs
- iOS: Add to Home Screen (test on device)
- Android: Add to Home Screen (test on device)

---

### Q1: Enhanced Data Export 📊

**Value:** Medium | **Effort:** 3-4 hours | **Status:** Not Started

**What:**

- Export Strava activities to CSV
- Export workout logs to PDF
- Export syns tracker data to spreadsheet
- Export programme templates for sharing
- Date range selection for exports

**Features:**

- CSV export with customizable columns
- PDF reports with charts/graphs
- Email delivery option
- Scheduled weekly/monthly reports

---

### Q2: Dashboard Enhancements 🏠

**Value:** Medium | **Effort:** 4-5 hours | **Status:** Not Started

**What:**

- Unified activity dashboard showing all fitness activities
- Weekly overview: Strava + Gym + Active Wellbeing + Syns
- Weekly calorie burn summary across all sources
- Activity streak tracking (consecutive active days)
- Quick stats widgets

**Dashboard Sections:**

- This Week Summary (distance, workouts, syns, calories)
- Recent Activities (last 5 across all types)
- Progress Towards Goals
- Upcoming Planned Workouts
- Personal Records Highlights

---

### Q3: Workout Programme Calendar 📅

**Value:** Medium | **Effort:** 5-6 hours | **Status:** Not Started

**What:**

- Calendar view of scheduled workouts
- Drag-and-drop programme scheduling
- Rest day planning
- Deload week scheduling
- Reminder notifications
- Integration with workout history

**Features:**

- Monthly/weekly calendar views
- Color-coded by workout type
- Click date to schedule workout
- Mark as completed
- Reschedule missed workouts
- Training block planning (4-8 week cycles)

---

### Q4: App Icon & PWA Enhancement 📱

**Status:** ✅ COMPLETED - See "Recently Completed" section above

---

## 🔬 Advanced Features (Lower Priority)

### A1: Advanced Strava Analytics 📈

**Value:** Low-Medium | **Effort:** 6-8 hours | **Status:** Not Started

**What:**

- Year-over-year comparisons
- Performance trends (getting faster/stronger)
- Heatmap calendar (activity frequency)
- Best day/time of week analysis
- Gear tracking and mileage
- Heart rate zone analysis
- Training load monitoring (CTL/ATL/TSB)

---

### A2: Training Goals & Plans 🎯

**Value:** Medium | **Effort:** 8-10 hours | **Status:** Not Started

**What:**

- Set distance/time/calorie goals (weekly/monthly)
- Training plan templates (Couch to 5K, Half Marathon, etc.)
- Goal progress tracking with visual indicators
- Fitness level estimation based on trends
- Recovery recommendations based on activity intensity
- Training periodization support

---

### A3: Meal Planning Features 🍽️

**Value:** Low-Medium | **Effort:** 8-12 hours | **Status:** Not Started

**What:**

- Weekly meal planning interface
- Recipe builder with syn calculations
- Meal prep suggestions
- Shopping list generation from meal plan
- Favorite meals quick-add
- Meal templates by day
- Export meal plans to PDF

**Integration:**

- Links to existing syns tracker
- Auto-calculate daily syn totals
- Suggest low-syn alternatives
- Free food meal ideas

---

### A4: Progress Photos & Body Measurements 📸

**Value:** Medium | **Effort:** 6-8 hours | **Status:** Not Started

**What:**

- Upload progress photos by date
- Body measurement tracking (weight, measurements)
- Before/After comparison view
- Timeline view of progress
- Private storage in Supabase
- Chart visualization of measurements over time

**Measurements to Track:**

- Weight
- Body fat % (optional)
- Chest, waist, hips, arms, legs
- Custom measurements
- Notes for each entry

---

### A5: Social Features 👥

**Value:** Low | **Effort:** 12-16 hours | **Status:** Not Started

**What:**

- Share workout programmes with friends
- Activity feed (optional, privacy-controlled)
- Leaderboards (PRs, weekly distance, etc.)
- Workout challenges
- Exercise form tips community sharing
- Programme reviews/ratings

**Privacy Controls:**

- Private, Friends, or Public settings per user
- Opt-in for all social features
- Control what data is visible

---

## 🐛 Known Issues & Refinements

### Bug Fixes

- [ ] **Strava:** Test token refresh flow with expired token
- [ ] **Active Wellbeing:** Add edit session functionality (currently delete + re-add)
- [ ] **Syns Tracker:** Improve barcode scanner error handling
- [ ] **Programmes:** Add reorder exercises via drag-and-drop

### Performance Optimizations

- [ ] **Caching:** Implement better client-side caching for frequently accessed data
- [ ] **Images:** Lazy load images in activity feeds
- [ ] **API Calls:** Batch multiple reads where possible
- [ ] **Bundle Size:** Code splitting for Strava/Syns/Programmes modules

### UX Improvements

- [ ] **Loading States:** Add skeleton screens for better perceived performance
- [ ] **Error Messages:** Make error messages more user-friendly
- [ ] **Onboarding:** Create first-time user walkthrough
- [ ] **Tooltips:** Add contextual help throughout the app
- [ ] **Mobile:** Improve responsive design on smaller screens

---

## 🔐 Security & Maintenance

### Security Enhancements

- [ ] **Token Encryption:** Encrypt Strava tokens at rest (optional enhancement)
- [ ] **Rate Limiting:** Implement rate limiting on API endpoints
- [ ] **Audit Logging:** Track sensitive operations (deletions, exports)
- [ ] **Session Management:** Improve session timeout handling
- [ ] **Input Validation:** Comprehensive validation on all forms

### Maintenance Tasks

- [ ] **Dependencies:** Regular update of npm packages
- [ ] **Database:** Optimize indexes based on query patterns
- [ ] **Monitoring:** Set up error tracking (Sentry, etc.)
- [ ] **Backups:** Automated database backup strategy
- [ ] **Documentation:** Keep all docs updated with new features

---

## 📊 Phase Recommendations

### Immediate (Completed - May 19, 2026)

1. ✅ **P1: Strava Webhooks** - Implementation complete, ready for deployment
2. ✅ **Q4: App Icon & PWA** - Complete and working
3. 🚀 **Next:** Deploy webhooks to Supabase (see `docs/STRAVA_WEBHOOKS_SETUP.md`)

### Immediate (Next 1-2 Weeks)

1. **Bug Fixes** - Address known issues
   - Token refresh testing
   - Edit session functionality
   - Barcode scanner error handling
2. **Q1: UX Polish** - Improve loading states, error messages
3. **Webhook UI** - Add controls to enable/disable webhooks from app

### Short-Term (1-2 Months)

1. **P2: Exercise Library** - High value for programme users
2. **P3: Programme Templates** - Accelerate new user onboarding
3. **Q2: Dashboard Enhancements** - Better overview of all activities

### Medium-Term (2-4 Months)

1. **Q3: Workout Calendar** - Better planning and scheduling
2. **A1: Advanced Analytics** - Deeper insights for data-driven users
3. **Q1: Enhanced Exports** - Data portability and reporting

### Long-Term (4+ Months)

1. **A2: Training Goals** - Comprehensive goal tracking
2. **A3: Meal Planning** - Extend syns tracker capabilities
3. **A4: Progress Photos** - Visual progress tracking
4. **A5: Social Features** - Community engagement (if multi-user grows)

---

## 💡 Implementation Notes

### Before Starting New Features

1. **Review existing code** - Ensure understanding of current architecture
2. **Database planning** - Design schema changes before coding
3. **RLS policies** - Always implement Row Level Security
4. **Mobile responsive** - Test on mobile devices throughout
5. **Error handling** - Implement comprehensive error handling
6. **Testing** - Manual testing checklist for each feature
7. **Documentation** - Update relevant docs in `/docs` folder

### Best Practices

- **Start small:** MVP first, iterate based on usage
- **User feedback:** Get feedback before building complex features
- **Incremental:** Deploy small, testable changes
- **Backward compatible:** Don't break existing functionality
- **Security first:** Never compromise on security for convenience

---

## 📝 Notes

- This roadmap is a living document - priorities may shift based on user needs
- Effort estimates are approximate and for planning purposes
- Some features may be combined or split during implementation
- User feedback will guide which features get built next

---

**For questions or suggestions, update this document or create discussion notes in `/docs`**
