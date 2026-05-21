# WeeGym Deployment Guide

**Version:** 1.1.1  
**Last Updated:** May 21, 2026

This guide covers deployment procedures for WeeGym across different platforms.

---

## 📋 Pre-Deployment Checklist

### 1. Code Quality & Security

```bash
# Run all security checks
npm run security:check

# Run linting
npm run lint

# Run tests with coverage
npm run test:coverage
```

**Requirements:**
- ✅ No lint errors (warnings acceptable)
- ✅ Line coverage >70%, branch coverage >60%
- ✅ No secrets in staged files
- ✅ No console.log in src/ directory
- ✅ npm audit shows no critical vulnerabilities

### 2. Version Management

WeeGym uses **semantic-release** for automated versioning:

- Versions are auto-bumped based on conventional commits
- CHANGELOG.md is auto-generated
- Git tags are created automatically

**Manual version bump** (if needed):
```bash
# Trigger version bump with empty commit
git commit --allow-empty -m "feat: release new version"
git push
```

### 3. Environment Configuration

Verify environment variables are set correctly for target environment.

**Development** (`.env.development`):
```env
VITE_BASE_PATH=/
```

**Production** (`.env` or platform environment):
```env
VITE_BASE_PATH=/weegym/  # GitHub Pages
# or
VITE_BASE_PATH=/         # Root domain deployments
```

---

## 🚀 Deployment Options

### Option 1: GitHub Pages (Current Production)

**Automatic Deployment via GitHub Actions:**

1. Push to `main` branch
2. GitHub Actions automatically runs:
   - Builds the application
   - Runs security checks
   - Deploys to `gh-pages` branch
   - Available at: `https://weestoater.github.io/weegym/`

**Manual Deployment:**

```bash
# Build and deploy
npm run deploy

# Or step-by-step
npm run build
npx gh-pages -d dist
```

**Configuration:**
- Base path: `/weegym/`
- Configured in `vite.config.js` via `VITE_BASE_PATH`
- 404 handling via `public/404.html`

**Post-Deployment Verification:**
1. Visit `https://weestoater.github.io/weegym/`
2. Test PWA installation
3. Verify Strava OAuth redirect works
4. Check console for errors

---

### Option 2: Vercel

**Initial Setup:**

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`

**Deploy:**

```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

**Environment Variables (Vercel Dashboard):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRAVA_CLIENT_ID`
- `VITE_STRAVA_CLIENT_SECRET`
- `VITE_STRAVA_REDIRECT_URI` (update for Vercel domain)
- `VITE_BASE_PATH=/`

**Strava OAuth Update:**
- Update redirect URI in Strava API settings to match Vercel domain
- Example: `https://weegym.vercel.app/strava-callback`

---

### Option 3: Netlify

**Deploy via Git:**

1. Connect GitHub repository in Netlify dashboard
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18+

**Environment Variables (Netlify Dashboard):**
- Add all `VITE_*` variables from `.env.example`
- Set `VITE_BASE_PATH=/`

**Deploy via CLI:**

```bash
# Install CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

### Option 4: Custom Server / VPS

**Build for Production:**

```bash
npm run build
```

**Output:** `dist/` directory contains all static files.

**Nginx Configuration Example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/weegym/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

**Apache Configuration Example:**

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/weegym/dist
    
    <Directory /var/www/weegym/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA fallback
        FallbackResource /index.html
    </Directory>
</VirtualHost>
```

---

## 🔧 Supabase Edge Functions Deployment

WeeGym uses Supabase Edge Functions for Strava webhooks.

**Prerequisites:**
- Supabase CLI installed and authenticated
- Project linked: `supabase link --project-ref huqmjtxwlybjtmouwgaz`

**Deploy Webhook Function:**

```bash
# Set environment secrets
supabase secrets set STRAVA_CLIENT_SECRET=your_secret
supabase secrets set STRAVA_VERIFY_TOKEN=your_token

# Deploy function (IMPORTANT: use --no-verify-jwt for webhooks)
supabase functions deploy strava-webhook --no-verify-jwt
```

**Verify Deployment:**

```bash
# Test webhook endpoint
curl "https://huqmjtxwlybjtmouwgaz.supabase.co/functions/v1/strava-webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=your_token"

# Should return: {"hub.challenge":"test123"}
```

**Update Strava Webhook Subscription:**

After deploying, update the webhook callback URL in your application:
- URL: `https://huqmjtxwlybjtmouwgaz.supabase.co/functions/v1/strava-webhook`
- This is handled automatically by the app's Strava Connect page

---

## 🗄️ Database Migrations

**Run Migrations in Supabase Dashboard:**

1. Navigate to SQL Editor in Supabase
2. Execute migrations in order:
   - `supabase-config/schema-multi-user.sql`
   - `supabase-config/add-strava-tables.sql`
   - `supabase-config/add-strava-webhooks.sql`
   - Any other SQL files as needed

**Verify Tables:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 🔐 Security Considerations

### Environment Secrets

**Never commit:**
- `.env`
- `.env.development`
- `.env.local`
- `.env.production`

**Protected by `.gitignore`:** ✅

### Strava API Keys

- Client Secret should be in environment variables only
- Rotate keys if accidentally exposed
- Update in both `.env` and Supabase secrets

### Supabase Keys

- Service Role Key: Server-side only (Edge Functions)
- Anon Key: Safe for client-side
- Never expose Service Role Key in frontend code

---

## 🧪 Testing Production Build

**Local Testing:**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Test on:** `http://localhost:4173`

**Validation Checklist:**
- [ ] App loads without errors
- [ ] PWA installation works
- [ ] Strava OAuth flow completes
- [ ] Database queries work (if connected to production Supabase)
- [ ] Offline mode functions correctly
- [ ] Theme switching works
- [ ] All routes accessible
- [ ] No console errors

---

## 🚨 Rollback Procedures

### GitHub Pages Rollback

```bash
# Checkout previous version
git checkout v1.1.0  # Replace with desired version tag

# Redeploy
npm run deploy

# Or revert the commit
git revert HEAD
git push
```

### Vercel Rollback

- Use Vercel dashboard to rollback to previous deployment
- Or: `vercel rollback <deployment-url>`

### Supabase Edge Function Rollback

```bash
# Checkout previous function version
git checkout <commit-hash> -- supabase/functions/strava-webhook/

# Redeploy
supabase functions deploy strava-webhook --no-verify-jwt
```

---

## 📊 Post-Deployment Monitoring

### Check Application Health

1. **Frontend:** Visit deployment URL, check console
2. **API:** Test Strava sync functionality
3. **Database:** Verify queries in Supabase Dashboard
4. **Webhooks:** Check Edge Function logs in Supabase

### Monitor for Issues

- **GitHub Actions:** Check workflow runs for failures
- **Supabase Logs:** Monitor Edge Function logs for errors
- **Browser Console:** Check for JavaScript errors
- **Strava API:** Monitor rate limits (100 req/15min)

### Key Metrics

- **Performance:** Lighthouse score >90
- **Uptime:** GitHub Pages typically 99.9%+
- **Error Rate:** <1% of requests
- **API Rate Limits:** Stay under Strava limits

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "404 on page refresh"
- **Solution:** Ensure `public/404.html` exists and redirects to `index.html`

**Issue:** "Strava OAuth fails after deployment"
- **Solution:** Update `VITE_STRAVA_REDIRECT_URI` to match new domain

**Issue:** "Webhook subscription fails"
- **Solution:** Verify Edge Function deployed with `--no-verify-jwt` flag

**Issue:** "Environment variables not working"
- **Solution:** Ensure variables are prefixed with `VITE_` for client-side access

### Need Help?

- Check [docs/](docs/) for detailed documentation
- Review [CHANGELOG.md](CHANGELOG.md) for recent changes
- See [README.md](README.md) for setup instructions

---

## 🎯 Deployment URLs

- **Production (GitHub Pages):** `https://weestoater.github.io/weegym/`
- **Supabase Edge Functions:** `https://huqmjtxwlybjtmouwgaz.supabase.co/functions/v1/`
- **Supabase Dashboard:** `https://app.supabase.com/project/huqmjtxwlybjtmouwgaz`

---

**Last Deployed:** Check [GitHub Actions](https://github.com/weestoater/weegym/actions) for latest deployment  
**Current Version:** See [package.json](package.json) or [CHANGELOG.md](CHANGELOG.md)
