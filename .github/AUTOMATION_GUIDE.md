# GitHub Automation Setup Guide

## 🎉 What's Been Configured

Your WeeGym project now has comprehensive GitHub automation in place!

## ✅ Phase 1: CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

**Runs automatically on:**

- Every push to `main`
- Every pull request

**What it does:**

- ✅ Runs ESLint
- ✅ Runs all tests with coverage
- ✅ Checks for console.log statements
- ✅ Runs security audit
- ✅ Validates build succeeds

**Result:** PRs cannot be merged if CI fails!

---

## ✅ Phase 2: Issue & PR Templates

**Files:**

- `.github/ISSUE_TEMPLATE/01-feature.yml`
- `.github/ISSUE_TEMPLATE/02-bug.yml`
- `.github/ISSUE_TEMPLATE/03-enhancement.yml`
- `.github/ISSUE_TEMPLATE/04-tech-debt.yml`
- `.github/pull_request_template.md`

**How to use:**

1. Click "New Issue" on GitHub
2. Select template type
3. Fill in the structured form
4. Labels are auto-applied!

**Recommended Labels to Create:**

```
# Type Labels
feature         - New functionality
bug             - Something isn't working
enhancement     - Improvement to existing feature
tech-debt       - Code quality improvements
docs            - Documentation
research        - Investigation needed

# Priority Labels
p0-critical     - Urgent, blocking
p1-high         - Important, plan soon
p2-medium       - Normal priority
p3-low          - Nice to have

# Status Labels
blocked         - Cannot proceed
needs-review    - Ready for review
in-progress     - Currently working
good-first-issue - Easy starter task
```

---

## ✅ Phase 3: Automated Releases

**Files:**

- `.github/workflows/release.yml`
- `.releaserc.json`
- `commitlint.config.js`

**How it works:**

### 1. Use Conventional Commits

When committing, use this format:

```bash
type(scope): subject

body (optional)

footer (optional)
```

**Examples:**

```bash
# New feature (bumps minor version: 1.2.0 → 1.3.0)
feat: add Strava webhook support
feat(strava): implement real-time activity sync

# Bug fix (bumps patch version: 1.2.0 → 1.2.1)
fix: prevent duplicate activity sync
fix(calorie): correct estimation formula

# Breaking change (bumps major version: 1.2.0 → 2.0.0)
feat!: redesign authentication flow

BREAKING CHANGE: Users must re-authenticate

# No release
docs: update README with new features
chore: update dependencies
test: add tests for calorie estimator
```

**Commit Types:**

| Type       | Description             | Release?      |
| ---------- | ----------------------- | ------------- |
| `feat`     | New feature             | Minor (1.x.0) |
| `fix`      | Bug fix                 | Patch (1.0.x) |
| `perf`     | Performance improvement | Patch         |
| `refactor` | Code refactoring        | Patch         |
| `docs`     | Documentation           | No            |
| `style`    | Code formatting         | No            |
| `test`     | Tests                   | No            |
| `build`    | Build changes           | No            |
| `ci`       | CI changes              | No            |
| `chore`    | Maintenance             | No            |

### 2. Automated Release Process

When you push to `main` with conventional commits:

1. **semantic-release analyzes commits**
2. **Determines version bump** (major/minor/patch)
3. **Generates CHANGELOG.md** automatically
4. **Updates package.json version**
5. **Creates GitHub Release** with notes
6. **Commits changes back** (with `[skip ci]`)

**Result:** No more manual `npm run version:bump`! 🎉

### 3. What Gets Created

- **CHANGELOG.md** - Auto-generated from commits
- **GitHub Releases** - With categorized changes
- **Git Tags** - Semantic versioning tags
- **Release Comments** - On related issues/PRs

---

## 📋 Recommended Workflow

### For Solo Development

**1. Create an Issue**

```
Go to GitHub → Issues → New Issue → Select template
```

**2. Create a Branch**

```bash
git checkout -b feature/42-oauth-login
# or
git checkout -b fix/43-activity-sync-bug
```

**3. Make Changes & Commit**

```bash
git add .
git commit -m "feat: add OAuth login support"
git commit -m "fix: prevent activity duplication"
```

**4. Push & Create PR**

```bash
git push -u origin feature/42-oauth-login
```

Then create PR on GitHub with "Closes #42"

**5. Wait for CI**

- All checks must pass ✅
- Review your own diff (catches mistakes!)

**6. Merge PR**

- Squash and merge (recommended)
- Delete branch after merge

**7. Automatic Release**

- Release workflow runs automatically
- Version bumped based on commits
- CHANGELOG updated
- GitHub Release created

---

## 🚀 Quick Start Guide

### Your First Automated Release

1. **Make a change:**

```bash
git checkout -b feat/test-automation
echo "# Automation Test" >> test.txt
git add test.txt
git commit -m "feat: test automated release system"
git push -u origin feat/test-automation
```

2. **Create PR and merge**

3. **Watch the magic!**

- Go to Actions tab on GitHub
- See "Release" workflow run
- Check Releases page for new version

---

## 🔧 Configuration Files

### `.releaserc.json`

- Controls semantic-release behavior
- Defines what goes in release notes
- Configures changelog generation

### `commitlint.config.js`

- Validates commit message format
- Can be integrated with git hooks (optional)

### `.github/workflows/ci.yml`

- Runs on every push/PR
- Ensures code quality

### `.github/workflows/release.yml`

- Runs on push to main
- Creates releases automatically

---

## 💡 Pro Tips

### 1. Use Meaningful Commit Messages

❌ Bad:

```
git commit -m "fixed stuff"
git commit -m "updates"
```

✅ Good:

```
git commit -m "fix: resolve activity duplication in sync"
git commit -m "feat: add calorie goal settings"
```

### 2. Scope Your Commits

```bash
feat(strava): add webhook support
fix(calorie): correct estimation algorithm
refactor(auth): simplify login flow
```

### 3. Breaking Changes

When making breaking changes:

```bash
git commit -m "feat!: redesign settings API

BREAKING CHANGE: Settings structure changed from flat to nested.
Migration guide in docs/migration.md"
```

### 4. Skip CI When Needed

```bash
git commit -m "docs: fix typo [skip ci]"
```

### 5. Link Issues in Commits

```bash
git commit -m "fix: resolve activity sync issue

Closes #42
Related to #38"
```

---

## 🎯 Next Steps

### Immediate (Do Now)

1. ✅ **Create labels** on GitHub (use list above)
2. ✅ **Set up branch protection** for `main`:
   - Require PR before merge
   - Require status checks (CI) to pass
   - Require up-to-date branches
3. ✅ **Enable GitHub Discussions** (for ideas vs. committed work)

### Soon (This Week)

1. 📋 **Migrate `prompts/ToDo.md`** → GitHub Issues
2. 🎯 **Create Milestones** (v2.0, v2.1, etc.)
3. 📊 **Set up GitHub Project** (Kanban board)

### Later (When Needed)

1. 🤖 **Add Dependabot** (Phase 4)
2. 📚 **Create Decision Log** (Phase 7)
3. ⚙️ **Advanced automations** (Phase 8)

---

## 🆘 Troubleshooting

### CI Fails on First Run

**Problem:** Missing environment secrets

**Solution:**

1. Go to Settings → Secrets and variables → Actions
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Release Doesn't Trigger

**Problem:** No conventional commits since last release

**Solution:**

- Make sure commits follow format: `type: subject`
- Use `feat:` or `fix:` for releases
- Check Actions tab for errors

### Merge Conflicts in CHANGELOG.md

**Problem:** Multiple PRs merged quickly

**Solution:**

- Accept both changes
- semantic-release will regenerate on next release

---

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release](https://semantic-release.gitbook.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Commitlint](https://commitlint.js.org/)

---

**Questions?** Open a GitHub Discussion or create an issue! 🚀
