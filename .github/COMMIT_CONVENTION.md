# Conventional Commits Quick Reference

## Format

```
type(scope): subject

body

footer
```

## Common Types

| Type       | When to Use      | Example                             | Version Bump  |
| ---------- | ---------------- | ----------------------------------- | ------------- |
| `feat`     | New feature      | `feat: add Strava webhooks`         | Minor (1.x.0) |
| `fix`      | Bug fix          | `fix: prevent duplicate sync`       | Patch (1.0.x) |
| `refactor` | Code improvement | `refactor: simplify auth flow`      | Patch         |
| `perf`     | Performance      | `perf: optimize activity query`     | Patch         |
| `docs`     | Documentation    | `docs: update README`               | None          |
| `test`     | Tests            | `test: add calorie estimator tests` | None          |
| `chore`    | Maintenance      | `chore: update dependencies`        | None          |

## With Scope (Optional)

```bash
feat(strava): add webhook support
fix(calorie): correct calculation
refactor(auth): simplify login
```

## Breaking Changes

```bash
feat!: redesign settings API

BREAKING CHANGE: Settings now use nested structure
```

Result: **Major version bump** (x.0.0)

## Quick Examples

### ✅ Good

```bash
feat: add OAuth login
fix: resolve activity duplication
refactor: extract common utilities
docs: add API documentation
test: add tests for sync service
```

### ❌ Bad

```bash
fixed stuff
updates
WIP
...
```

## Tips

1. **Be specific**: `fix: prevent null error in activity sync` > `fix: bug`
2. **Use present tense**: "add feature" not "added feature"
3. **Lowercase subject**: `feat: add login` not `Feat: Add Login`
4. **No period at end**: `fix: resolve bug` not `fix: resolve bug.`
5. **Body is optional**: Only needed for complex changes
6. **Reference issues**: Add `Closes #42` in body or footer

## In Your Editor

Set up a commit message template:

```bash
# ~/.gitmessage
type(scope): subject max 50 chars

# Why is this change necessary?
# Body: 72 chars per line

# Issue references, breaking changes
```

Then:

```bash
git config --global commit.template ~/.gitmessage
```
