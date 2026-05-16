# Conventional Commits Reference

**Quick Reference:** Always use this format when committing code.

## Basic Format

```
type(scope): subject
```

## Common Types

| Type | When to Use | Version Bump | Examples |
|------|-------------|--------------|----------|
| `feat` | New feature | Minor (1.x.0) | `feat: add Strava webhooks` |
| `fix` | Bug fix | Patch (1.0.x) | `fix: prevent duplicate sync` |
| `refactor` | Code improvement | Patch | `refactor: simplify auth flow` |
| `perf` | Performance | Patch | `perf: optimize query` |
| `docs` | Documentation | None | `docs: update README` |
| `test` | Tests | None | `test: add sync tests` |
| `chore` | Maintenance | None | `chore: update deps` |

## Real Examples from WeeGym

```bash
# Strava features
feat(strava): add webhook support
feat(strava): implement real-time activity sync
fix(strava): resolve activity duplication
refactor(strava): extract API client

# Calorie tracking
feat(calorie): add barcode scanner
fix(calorie): correct estimation formula
perf(calorie): optimize food database query

# Authentication
feat(auth): add OAuth login
fix(auth): resolve session timeout
refactor(auth): simplify login flow

# UI improvements
feat(ui): add dark mode
fix(ui): resolve mobile layout issues
style(ui): update color scheme

# Documentation
docs: add webhook setup guide
docs(api): update Strava API documentation

# Testing
test(strava): add webhook handler tests
test(calorie): add estimation tests

# Maintenance
chore: update dependencies
chore(deps): bump react to 19.2.0
```

## With Scope (Recommended)

Scopes help organize changes:
- `strava` - Strava integration
- `calorie` - Calorie tracking
- `syns` - Slimming World syns
- `auth` - Authentication
- `ui` - User interface
- `api` - API changes
- `db` - Database changes

## Breaking Changes

```bash
feat!: redesign settings API

BREAKING CHANGE: Settings structure changed from flat to nested.
See docs/migration.md for upgrade guide.
```

## Multi-line Commits

```bash
git commit -m "feat: add Strava webhook support" -m "
Implements real-time activity sync using Strava webhooks.
This eliminates the need for manual sync and reduces API calls.

- Add webhook endpoint handler
- Implement subscription management
- Add event processing logic

Closes #42
"
```

## Quick Tips

1. **Use present tense:** "add feature" not "added feature"
2. **Be specific:** "fix: resolve activity sync bug" not "fix: bug"
3. **No period at end:** "feat: add login" not "feat: add login."
4. **Keep subject short:** Under 50 characters
5. **Separate body:** Blank line between subject and body

## Setting Up Git Template

To make this easier, set up the commit message template:

```bash
git config --global commit.template .gitmessage
```

Now when you run `git commit` (without `-m`), you'll see the template!

## VS Code Integration

The `.instructions.md` file at the root tells GitHub Copilot to always suggest conventional commit messages.

When writing commit messages in VS Code, Copilot will:
- Suggest conventional format
- Pick the right type based on your changes
- Add relevant scope
- Write descriptive subjects
