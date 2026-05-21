# WeeGym 💪

**Version:** 1.1.1  
**A comprehensive fitness and workout tracking Progressive Web Application**

WeeGym is a modern fitness tracking application that integrates with Strava, provides intelligent calorie tracking, manages workout programmes, and tracks Active Wellbeing machine sessions. Built with React and powered by Supabase, it offers a seamless multi-user experience with real-time activity synchronization.

---

## ✨ Key Features

### 🏃 Strava Integration
- **OAuth Authentication** - Secure connection to your Strava account
- **Activity Synchronization** - Manual sync and automatic real-time webhook updates
- **Personal Records (PR) Tracking** - Automatically detect and highlight PRs across multiple categories:
  - Fastest 1km, 5km, 10km, Half Marathon, Marathon
  - Longest distance rides
  - Highest elevation gains
  - Maximum speeds
- **Calorie Estimation** - Advanced estimation using heart rate data and MET values when API data unavailable
- **Interactive Route Maps** - GPS-enabled activities display with Leaflet mapping
- **Rich Activity Cards** - Colored metrics, progress bars, and detailed statistics

### 📊 Calorie & Nutrition Tracking
- Activity-based calorie tracking from Strava activities
- Manual calorie entry and management
- Slimming World syns tracking integration
- Daily calorie goals and progress visualization

### 💪 Active Wellbeing Integration
- Log Strava activities as Active Wellbeing sessions with one click
- Intelligent activity mapping (rides → Cross cycle, runs → Outdoor Activity)
- Smart scoring algorithm (calories, distance, or time-based)
- Track machine-based workout sessions

### 🏋️ Workout Programme Management
- Multi-user workout programme system
- Create, edit, and manage custom fitness programmes
- Exercise library with detailed instructions
- Programme sharing and collaboration
- Progress tracking and workout history

### 🔐 Security & Authentication
- Multi-user authentication via Supabase Auth
- Row Level Security (RLS) for data protection
- Secure environment variable management
- Automated security scanning (secrets, console logs, npm audit)
- Pre-commit security checks

### 📱 Progressive Web App (PWA)
- Install to device (mobile and desktop)
- Offline support
- App-like experience
- Push notifications ready

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite 7.3.3** - Lightning-fast build tool and dev server
- **Bootstrap 5** - Responsive UI framework
- **Bootstrap Icons** - Comprehensive icon library
- **Leaflet** - Interactive mapping for GPS routes
- **React Router** - Client-side routing

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **Supabase Edge Functions** - Serverless Deno functions for webhooks
- **Strava API v3** - Third-party fitness data integration

### Development & Quality
- **Vitest** - Unit testing framework
- **ESLint** - Code linting and quality enforcement
- **semantic-release** - Automated versioning and changelog generation
- **Conventional Commits** - Standardized commit messages
- **GitHub Actions** - CI/CD pipeline

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase CLI** v2.x or higher ([Installation Guide](https://supabase.com/docs/guides/cli))
- **Supabase Account** ([Sign Up](https://supabase.com/))
- **Strava Account** (for Strava integration features)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/weestoater/weegym.git
cd weegym
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create your environment files:

```bash
# Development environment (root /)
cp .env.example .env.development

# Production environment
cp .env.example .env
```

#### Required Environment Variables

**`.env`** (contains sensitive keys):
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Strava API Configuration
VITE_STRAVA_CLIENT_ID=your-client-id
VITE_STRAVA_CLIENT_SECRET=your-client-secret
VITE_STRAVA_REDIRECT_URI=http://localhost:5173/strava-callback

# Strava Webhook Configuration
STRAVA_VERIFY_TOKEN=your-random-verify-token
```

**`.env.development`** (local development settings):
```env
# Base path for local development (root)
VITE_BASE_PATH=/
```

> ⚠️ **Security Note:** Both `.env` and `.env.development` are in `.gitignore` to protect your secrets.

### 4. Supabase Setup

#### Link to Your Supabase Project

```bash
supabase login
supabase link --project-ref your-project-id
```

#### Run Database Migrations

Execute the SQL migrations in your Supabase dashboard (SQL Editor):

1. Navigate to your Supabase project → SQL Editor
2. Run migrations in order:
   - `supabase-config/schema-multi-user.sql` - User profiles and programmes
   - `supabase-config/add-strava-tables.sql` - Strava integration tables
   - `supabase-config/add-strava-webhooks.sql` - Webhook tracking
   - Other configuration files as needed

#### Deploy Edge Functions (for Strava Webhooks)

```bash
# Set environment secrets
supabase secrets set STRAVA_CLIENT_SECRET=your-secret
supabase secrets set STRAVA_VERIFY_TOKEN=your-token

# Deploy webhook handler (without JWT verification for Strava)
supabase functions deploy strava-webhook --no-verify-jwt
```

### 5. Strava API Setup

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application or use existing
3. Set Authorization Callback Domain to `localhost` (dev) or your production domain
4. Copy Client ID and Client Secret to your `.env` file

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📦 Available Scripts

### Development
```bash
npm run dev          # Start Vite dev server (hot reload enabled)
npm run preview      # Preview production build locally
```

### Building
```bash
npm run build        # Build for production (outputs to /dist)
npm run predeploy    # Alias for build (used in deployment)
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with Vitest UI
npm run test:run     # Run tests once (CI mode)
npm run test:coverage # Generate coverage report
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

### Security
```bash
npm run security:scan    # Scan staged files for secrets
npm run security:console # Find console.log statements
npm run security:audit   # Run npm audit
npm run security:check   # Run all security checks
npm run precommit        # Full security check (runs pre-commit)
```

### Release Management
```bash
npm run semantic-release # Automated version bump and changelog
```

### Deployment
```bash
npm run deploy       # Deploy to GitHub Pages (uses gh-pages)
```

---

## 🏗️ Project Structure

```
weegym/
├── docs/                          # Comprehensive documentation
│   ├── QUICK_START_MULTI_USER.md # Multi-user setup guide
│   ├── QUICK_START_CALORIE_TRACKER.md
│   ├── STRAVA_WEBHOOKS_SETUP.md  # Webhook configuration
│   ├── SECURITY_CHECKLIST.md     # Security best practices
│   └── ...
├── public/                        # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # App icons
├── src/
│   ├── components/               # Reusable React components
│   │   ├── StravaActivityCard.jsx
│   │   ├── Navigation.jsx
│   │   └── ...
│   ├── contexts/                 # React contexts (Auth, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Third-party integrations
│   │   └── supabaseClient.js
│   ├── pages/                    # Route components
│   │   ├── StravaConnect.jsx
│   │   ├── StravaActivities.jsx
│   │   └── ...
│   ├── services/                 # API integration services
│   │   ├── stravaService.js
│   │   └── ...
│   ├── utils/                    # Helper functions
│   │   ├── calorieEstimator.js
│   │   ├── prCalculator.js
│   │   └── ...
│   ├── styles/                   # Global styles
│   ├── App.jsx                   # Root component
│   └── main.jsx                  # Entry point
├── supabase/
│   └── functions/                # Edge Functions
│       └── strava-webhook/       # Strava webhook handler
├── supabase-config/              # Database migrations
├── scripts/                      # Utility scripts
├── .env.example                  # Environment template
├── vite.config.js               # Vite configuration
├── vitest.config.js             # Testing configuration
└── package.json                  # Dependencies and scripts
```

---

## 📚 Documentation

Comprehensive guides are available in the `/docs` directory:

### Getting Started
- [Quick Start - Multi-User System](docs/QUICK_START_MULTI_USER.md)
- [Quick Start - Calorie Tracker](docs/QUICK_START_CALORIE_TRACKER.md)
- [Quick Setup Guide](docs/guides/QUICK_SETUP.md)

### Integration Guides
- [Supabase Setup](docs/supabase_setup.md)
- [Strava Integration Plan](docs/strava_integration_plan.md)
- [Strava Webhooks Setup](docs/STRAVA_WEBHOOKS_SETUP.md)
- [Strava PR Tracking Design](docs/strava_pr_tracking_design.md)

### Feature Documentation
- [Multi-User Authentication Setup](docs/multi_user_auth_setup.md)
- [Multi-User Programme System](docs/multi_user_programme_system.md)
- [Calorie Tracker](docs/calorie_tracker.md)
- [Active Wellbeing Machines](docs/active_wellbeing_machines.md)
- [Fitness Programme Documentation](docs/fitness_programme_documentation.md)

### Security & Best Practices
- [Security Checklist](docs/SECURITY_CHECKLIST.md)
- [Security Quick Reference](docs/SECURITY_QUICK_REFERENCE.md)
- [Password Management](docs/password_management.md)

### Technical Guides
- [Environment Troubleshooting](docs/env_troubleshooting.md)
- [HTTPS Setup](docs/HTTPS_SETUP.md)
- [Testing Supabase](docs/testing_supabase.md)

### Implementation Summaries
- [Phase 5 Enhancements](docs/PHASE5_ENHANCEMENTS.md)
- [Implementation Summary 2026-05-19](docs/IMPLEMENTATION_SUMMARY_2026-05-19.md)

---

## 🚢 Deployment

### GitHub Pages (Current Method)

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

The app will be deployed to: `https://yourusername.github.io/weegym/`

### Vercel / Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in the platform dashboard
5. Deploy!

### Important: Base Path Configuration

- **GitHub Pages:** Set `VITE_BASE_PATH=/weegym/` in your production environment
- **Root Domain:** Set `VITE_BASE_PATH=/` in `.env.development`
- The app automatically configures routing based on this variable

---

## 🔒 Security

This project implements multiple security layers:

### Environment Protection
- `.gitignore` protects `.env` and `.env.development` files
- Supabase secrets managed via CLI (never committed)
- Environment variables validated at runtime

### Automated Security Checks
- **Pre-commit hooks** run `npm run precommit`
- **Secret scanning** detects passwords/API keys in staged files
- **Console log detection** finds debugging statements
- **Dependency auditing** via `npm audit`

### Database Security
- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only access their own data
- **Service role** restricted to Edge Functions only

### API Security
- Strava OAuth 2.0 with PKCE
- Webhook signature verification
- Rate limiting on external API calls

> 📖 For detailed security guidelines, see [SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md)

---

## 🤝 Contributing

We follow [Conventional Commits](https://www.conventionalcommits.org/) for version management:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat:** New feature (triggers MINOR version bump)
- **fix:** Bug fix (triggers PATCH version bump)
- **docs:** Documentation only
- **style:** Code formatting (no functional changes)
- **refactor:** Code refactoring (triggers PATCH version bump)
- **perf:** Performance improvements (triggers PATCH version bump)
- **test:** Adding tests
- **chore:** Maintenance tasks (no version bump)

### Examples
```bash
git commit -m "feat: add Strava webhook real-time sync"
git commit -m "fix: resolve blank screen on app startup"
git commit -m "docs: update README with deployment instructions"
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to your branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request
6. Ensure all CI checks pass (linting, tests, security)

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🆘 Support & Contact

### Issues
If you encounter any bugs or have feature requests, please [open an issue](https://github.com/weestoater/weegym/issues).

### Documentation
For detailed setup and usage instructions, refer to the `/docs` directory.

### Project Maintainer
**GitHub:** [@weestoater](https://github.com/weestoater)

---

## 📅 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and release notes.

**Current Version:** 1.1.1
- ✅ Strava real-time webhook sync
- ✅ PWA support with offline capabilities
- ✅ Personal record (PR) tracking
- ✅ Interactive route mapping
- ✅ Enhanced activity cards with colored metrics
- ✅ Active Wellbeing integration

---

## 🎯 Roadmap

- [ ] **Workout Plan Templates** - Pre-built programmes for common goals
- [ ] **Social Features** - Share workouts and compete with friends
- [ ] **Advanced Analytics** - Trends, insights, and predictive metrics
- [ ] **Wearable Integration** - Direct sync with Garmin, Fitbit, Apple Watch
- [ ] **Meal Planning** - Nutrition plans integrated with calorie tracking
- [ ] **Mobile Apps** - Native iOS and Android applications

---

<div align="center">

**Built with ❤️ using React, Vite, and Supabase**

[⬆ Back to Top](#weegym-)

</div>
