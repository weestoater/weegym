# WeeGym Project Roadmap - Next Stages

**Last Updated:** May 13, 2026  
**Status:** Active Planning & Future Enhancements

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

### P1: Strava Webhooks for Real-Time Sync ⭐

**Value:** High | **Effort:** 4-6 hours | **Status:** Not Started

**Why:** Eliminate manual sync, provide instant activity updates

**What:**

- Subscribe to Strava webhooks for real-time activity events
- Auto-sync new activities immediately upon upload to Strava
- Handle activity updates and deletions automatically
- Reduce API calls and improve user experience

**Requirements:**

- Public webhook endpoint (backend/edge function)
- Webhook verification handling
- Event processing logic (create/update/delete)
- Store webhook subscription ID

**Files to Create:**

- `/api/strava-webhook` (backend endpoint)
- Update `stravaService.js` with webhook management
- Add webhook config to environment variables

**Considerations:**

- Requires publicly accessible endpoint
- Need SSL/TLS for security
- Handle rate limiting on webhook events
- Implement retry logic for failed events

**References:**

- [Strava Webhook Events API](https://developers.strava.com/docs/webhooks/)

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

**Option A: External Links**

- Link to YouTube/fitness sites (Quick: 2 hours)
- Curated list of trusted sources
- Simple database field for video URL

**Option B: Embedded Content**

- Host videos in Supabase Storage (Medium: 6-8 hours)
- Embed player in exercise details
- Requires storage space and CDN considerations

**Option C: Full Library**

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

**Value:** Medium | **Effort:** 2-3 hours | **Status:** Not Started

**Why:** Professional appearance when users add app to home screen on iPhone/iPad/Android

**What:**

- Design custom WeeGym app icon
- Create multiple icon sizes for different devices (PWA manifest)
- Add web app manifest for "Add to Home Screen" functionality
- Configure apple-touch-icon for iOS devices
- Add splash screens for iOS
- Set app theme colors and display mode

**Icon Specifications:**

- **iOS:** 180x180px (apple-touch-icon)
- **Android/PWA:** 192x192px, 512x512px (manifest icons)
- **Favicon:** 32x32px, 16x16px for browsers
- **Format:** PNG with transparent or solid background
- **Design:** Should represent fitness/gym theme, recognizable at small sizes

**Icon Design Tools (Recommended):**

- **[Canva](https://www.canva.com)** - Free, easy-to-use, lots of templates
  - Search for "app icon" templates
  - Export as PNG at required sizes
- **[Figma](https://www.figma.com)** - Free for individuals, professional design tool
- **[Adobe Express](https://www.adobe.com/express/)** - Free tier available
- **[App Icon Generator](https://www.appicon.co/)** - Upload one image, generates all sizes
- **[RealFaviconGenerator](https://realfavicongenerator.net/)** - Complete favicon/icon package

**Design Considerations:**

- **Simple & Bold:** Must be recognizable at 60x60px or smaller
- **Avoid Text:** Small text becomes unreadable at icon size
- **Strong Contrast:** Works on both light and dark backgrounds
- **Consistent Branding:** Match app's color scheme (e.g., Bootstrap primary color)
- **Unique:** Distinguishable from other fitness apps

**Implementation:**

1. **Create Icon Design:**
   - Base size: 1024x1024px (scales down better than up)
   - Consider dumbbell, gym equipment, or "W" monogram
   - Use WeeGym brand colors

2. **Generate All Sizes:**
   - Use App Icon Generator or manual resize
   - Export as optimized PNGs

3. **File Structure:**

   ```
   public/
   ├── favicon.ico              # Browser tab icon
   ├── favicon-16x16.png
   ├── favicon-32x32.png
   ├── apple-touch-icon.png     # 180x180 for iOS
   ├── android-chrome-192x192.png
   ├── android-chrome-512x512.png
   └── manifest.json            # PWA manifest
   ```

4. **Update index.html:**

   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico" />
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#0d6efd" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="default" />
   <meta name="apple-mobile-web-app-title" content="WeeGym" />
   ```

5. **Create manifest.json:**
   ```json
   {
     "name": "WeeGym Tracker",
     "short_name": "WeeGym",
     "description": "Complete fitness tracking app",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#0d6efd",
     "icons": [
       {
         "src": "/android-chrome-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/android-chrome-512x512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

**Testing:**

- iOS Safari: Tap Share → Add to Home Screen
- Android Chrome: Tap Menu → Add to Home Screen
- Desktop: Check browser tab for favicon
- Verify icon appears correctly on home screen

**Design Ideas:**

- 💪 Dumbbell silhouette with "W" overlay
- 🏋️ Stylized gym equipment icon
- 📊 Fitness graph with upward trend
- ⚡ Lightning bolt for energy/activity
- 🎯 Target with checkmark for goals

**References:**

- [PWA Manifest Generator](https://app-manifest.firebaseapp.com/)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [PWA Icon Best Practices](https://web.dev/add-manifest/)

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

### Immediate (Next 2-4 Weeks)

1. **P1: Strava Webhooks** - Biggest UX improvement for Strava users
2. **Q4: App Icon & PWA** - Quick win for professional appearance (2-3 hours)
3. **Q1: Bug Fixes** - Address known issues
4. **Q2: UX Polish** - Improve loading states, error messages

### Short-Term (1-2 Months)

5. **P2: Exercise Library** - High value for programme users
6. **P3: Programme Templates** - Accelerate new user onboarding
7. **Q2: Dashboard Enhancements** - Better overview of all activities

### Medium-Term (2-4 Months)

8. **Q3: Workout Calendar** - Better planning and scheduling
9. **A1: Advanced Analytics** - Deeper insights for data-driven users
10. **Q1: Enhanced Exports** - Data portability and reporting

### Long-Term (4+ Months)

11. **A2: Training Goals** - Comprehensive goal tracking
12. **A3: Meal Planning** - Extend syns tracker capabilities
13. **A4: Progress Photos** - Visual progress tracking
14. **A5: Social Features** - Community engagement (if multi-user grows)

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
