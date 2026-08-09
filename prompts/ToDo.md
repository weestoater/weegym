# WeeGym Project Roadmap - Next Stages

**Last Updated:** May 21, 2026  
**Status:** Active Development - Production Ready! 🚀  
**Current Version:** 1.1.1

---

## 🎉 Recently Completed (August 9, 2026)

### ✅ Q2: Quick Wins UX Improvements - COMPLETE

**Status:** ✅ Complete | Deployed

**Completed:**

1. ✅ **Exercise Library Enhancement (Option A)**
   - Added formTips (4 coaching cues) and muscleGroups to all 14 exercises
   - Form tips displayed prominently during workout execution
   - Muscle groups shown as badges on exercise cards
   - Enhanced demo links with better visual hierarchy

2. ✅ **Enhanced Data Export (CSV)**
   - Created centralized export utility (`src/utils/exportUtils.js`)
   - Export buttons added to: Strava Activities, Cardio Tracker, Active Wellbeing, Programme History
   - CSV includes all relevant fields (dates, stats, notes)
   - Automatic filename with current date

3. ✅ **Navigation Menu Enhancements**
   - Added visual dividers grouping menu items into sections (Training, Activity Tracking, Nutrition, Settings)
   - Added descriptive subtitles to menu items
   - Improved visual hierarchy with section headers

4. ✅ **Page Subtitles**
   - Dashboard: "Your fitness overview and quick actions"
   - Active Wellbeing: "Track your gym circuit machines with score-based performance"
   - Cardio Tracker: "Track treadmill, rowing machine, cross trainer, and other cardio equipment"

5. ✅ **Dashboard Enhancements**
   - Added cardio sessions summary card with "View All →" link
   - Made Wellbeing stats card clickable with "View All →" link
   - Integrated cardio data loading in dashboard

6. ✅ **Bug Fix: Active Wellbeing Edit Functionality**
   - Added `updateActiveWellbeingSession()` to database.js
   - Implemented edit workflow (edit button, form population, update vs create)
   - Added "Cancel Edit" button when editing
   - Dynamic submit button label and icon

**Files Modified:**

- `src/App.jsx` - Navigation dividers and subtitles
- `src/lib/database.js` - Added updateActiveWellbeingSession function
- `src/pages/ActiveWellbeing.jsx` - Edit functionality
- `src/pages/Dashboard.jsx` - Cardio integration and View All links
- `src/pages/CardioTracker.jsx` - Page subtitle

**Documentation:**

- Created `docs/QUICK_WINS_IMPLEMENTATION.md`
- Updated CHANGELOG.md with all improvements

**See:** `docs/QUICK_WINS_IMPLEMENTATION.md` for implementation details

---

## 🎉 Recently Completed (May 21, 2026)

### ✅ P1: Strava Webhooks for Real-Time Sync - DEPLOYED & VERIFIED

- Supabase Edge Function deployed with `--no-verify-jwt` flag
- Webhook verification & event processing working
- Database migration executed in production
- Service methods tested (subscribe, view, unsubscribe)
- UI controls added with rate limit protection (localStorage caching)
- Comprehensive documentation completed
- **Real-world testing:** New walk activity synced successfully in real-time ✅
- **Status:** Production Ready & Operational ✅

### ✅ Documentation Overhaul - COMPLETE

- README.md replaced boilerplate with comprehensive documentation
- DEPLOY.md modernized with production deployment guide
- CONTRIBUTING.md created with team workflow and conventions
- .instructions.md updated with AI assistant guidance
- .env.example enhanced with all required variables
- **Status:** Production-ready documentation ✅

### ✅ Q4: App Icon & PWA Enhancement - COMPLETE

- All PWA icons generated (192x192, 512x512, favicons)
- manifest.json updated with correct paths
- index.html updated with proper meta tags
- Professional appearance on mobile home screens
- **Status:** Working ✅

### ✅ Bug Fixes & Code Quality - COMPLETE

- Fixed blank screen on startup (import error in stravaService.js)
- Removed unused imports causing lint errors
- Version corrected from 1.0.1 to 1.1.0 (semantic-release)
- Security hardening (.env.development in .gitignore)
- Rate limiting protection for Strava API
- **Status:** All critical issues resolved ✅

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

**Value:** Medium | **Effort:** 4-5 hours | **Status:** ✅ Partially Complete

**Completed (August 9, 2026):**

- ✅ Added cardio sessions integration
- ✅ Clickable stats cards with "View All →" links
- ✅ Improved Quick Access section

**Remaining:**

- [ ] Unified activity feed showing all fitness activities across types
- [ ] Weekly overview: Strava + Gym + Active Wellbeing + Cardio + Syns
- [ ] Activity streak tracking (consecutive active days)
- [ ] Progress Towards Goals section
- [ ] Personal Records Highlights

**Dashboard Sections (Planned):**

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

## � Infrastructure & Monitoring (Low Priority)

### M1: GitHub App Token Format Migration 🔐

**Value:** Low | **Effort:** 30 minutes | **Status:** Monitor  
**Deadline:** Before deprecation (TBA in coming weeks)

**Why:** GitHub is rolling out new JWT-format installation tokens (ghs\_ prefix, ~520 chars) replacing opaque tokens.

**WeeGym Impact Assessment (May 21, 2026):**

- ✅ **Minimal risk** - Only uses `GITHUB_TOKEN` in semantic-release workflow
- ✅ No token storage, validation, or length checks in codebase
- ✅ Token passed as env variable to third-party action (semantic-release)
- ✅ Semantic-release will auto-support new format

**Action Required:**

- Monitor for deprecation announcement
- Test one release after rollout reaches WeeGym
- Verify semantic-release still creates releases successfully

**Reference:** [GitHub Changelog (May 15, 2026)](https://github.blog/changelog/2026-05-15-github-app-installation-tokens-per-request-override-header/)

**Note:** Priority downgraded from P2 (Medium/2-4 hours) after codebase review confirmed no custom token handling. See CHANGELOG.md for details.

---

## �🔬 Advanced Features (Lower Priority)

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

- [ ] **Strava:** Test token refresh flow with expired token (High Priority)
- [x] **Active Wellbeing:** Add edit session functionality ✅ (Completed August 9, 2026)
- [ ] **Syns Tracker:** Improve barcode scanner error handling
- [ ] **Programmes:** Add reorder exercises via drag-and-drop
- [x] **Strava:** Fix blank screen on startup ✅ (Completed May 21)
- [x] **Strava:** Remove unused imports causing lint errors ✅ (Completed May 21)
- [x] **Strava:** Deploy webhooks for real-time sync ✅ (Completed May 21)
- [x] **Security:** Protect .env.development in .gitignore ✅ (Completed May 21)

### Performance Optimizations

- [ ] **Caching:** Implement better client-side caching for frequently accessed data
- [ ] **Images:** Lazy load images in activity feeds
- [ ] **API Calls:** Batch multiple reads where possible
- [ ] **Bundle Size:** Code splitting for Strava/Syns/Programmes modules

### UX Improvements

- [x] **Navigation Menu:** Add visual dividers and subtitles ✅ (Completed August 9)
- [x] **Page Context:** Add page subtitles for better context ✅ (Completed August 9)
- [x] **Dashboard Links:** Add "View All" links to stat cards ✅ (Completed August 9)
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

### ✅ Completed (August 9, 2026)

1. ✅ **Q2: Quick Wins UX Improvements** - Navigation polish, page subtitles, dashboard enhancements
2. ✅ **Bug Fix: Active Wellbeing Edit** - Full edit functionality implemented
3. ✅ **Documentation:** Quick Wins Implementation Guide created

### ✅ Completed (May 21, 2026)

1. ✅ **P1: Strava Webhooks** - Deployed and operational
2. ✅ **Q4: App Icon & PWA** - Complete and working
3. ✅ **Documentation Overhaul** - Professional documentation suite
4. ✅ **Bug Fixes** - Critical issues resolved
5. ✅ **Security Hardening** - .env files protected, security checks passing

### 🎯 Immediate Next (Current Week)

1. ✅ **Test Strava Webhooks** - VERIFIED: Walk activity synced in real-time successfully!
2. ✅ **Q2: Quick Wins UX** - COMPLETE: Navigation, subtitles, dashboard improvements
3. **Q1: UX Polish (Remaining)**
   - Add loading states/skeleton screens
   - Improve error messages throughout app
   - Add tooltips for complex features
4. **Bug Fixes**
   - Test Strava token refresh flow with expired token
   - Improve barcode scanner error handling

### Short-Term (1-2 Weeks)

1. **P2: Exercise Library** - High value for programme users (Start with Option A: External Links)
2. **Q1: Enhanced Exports** - CSV/PDF exports for Strava activities and workout logs
3. **Q2: Dashboard Enhancements** - Unified activity dashboard showing all fitness activities

### Medium-Term (1-2 Months)

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
