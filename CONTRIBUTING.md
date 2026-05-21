# Contributing to WeeGym

Thank you for contributing to WeeGym! This guide will help you understand our workflow and standards.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Security Guidelines](#security-guidelines)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ and npm v9+
- Git
- Supabase CLI v2+
- Strava API credentials (for Strava features)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/weestoater/weegym.git
   cd weegym
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   cp .env.example .env.development
   ```
   
   Edit `.env` with your actual credentials.

4. **Link Supabase project:**
   ```bash
   supabase login
   supabase link --project-ref huqmjtxwlybjtmouwgaz
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

See [README.md](README.md) for detailed setup instructions.

---

## 🔄 Development Workflow

### Branch Naming Conventions

```
feat/feature-name       # New features
fix/bug-description     # Bug fixes
docs/doc-update         # Documentation updates
refactor/component-name # Code refactoring
test/test-description   # Test additions/updates
chore/maintenance-task  # Maintenance tasks
```

**Examples:**
- `feat/strava-webhook-sync`
- `fix/activity-duplication`
- `docs/update-deployment-guide`
- `refactor/auth-service`

### Development Process

1. **Create a branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following code standards

3. **Test your changes:**
   ```bash
   npm run lint
   npm run test
   npm run security:check
   ```

4. **Commit with conventional commits** (see below)

5. **Push your branch:**
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

---

## 💬 Commit Message Guidelines

**WeeGym uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning.**

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types & Version Impact

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat:` | New feature | MINOR (1.1.0 → 1.2.0) |
| `fix:` | Bug fix | PATCH (1.1.0 → 1.1.1) |
| `refactor:` | Code refactoring (behavior/structure changes) | PATCH |
| `perf:` | Performance improvement | PATCH |
| `docs:` | Documentation only | None |
| `test:` | Test changes | None |
| `chore:` | Maintenance tasks | None |
| `style:` | Pure formatting (whitespace, indentation only) | None |
| `ci:` | CI/CD changes | None |

### Rules (Priority Order)

1. **(Required)** Type must be from the list above
2. **(Required)** Subject must be lowercase and under 50 characters
3. **(Required)** Use present tense ("add" not "added")
4. **(Required)** No period at end of subject
5. **(Preferred)** Include scope for module-specific changes
6. **(Preferred)** Be specific and descriptive

### Examples

#### Good Commits ✅

```bash
feat: add Strava webhook real-time sync
fix: resolve activity sync duplication
refactor(auth): simplify user login flow
docs: update deployment guide with Vercel instructions
test: add calorie estimator unit tests
perf(api): optimize Supabase query performance
style: format import statements to single line
```

#### Bad Commits ❌

```bash
update stuff                    # Too vague, no type
Fix: bug fixed                  # Wrong: capital F, past tense, vague
feat add feature.               # Missing colon, has period
WIP                             # Not descriptive
feat: Added new strava feature  # Wrong: capital A, past tense
```

### Breaking Changes

For breaking changes, add `!` after type:

```bash
feat!: redesign settings API

BREAKING CHANGE: Settings now use nested structure. 
Clients must update their API calls to use the new format.
```

This triggers a MAJOR version bump (1.x.x → 2.0.0).

### Scope Examples

Common scopes in WeeGym:
- `(strava)` - Strava integration
- `(auth)` - Authentication system
- `(ui)` - User interface components
- `(db)` - Database/Supabase
- `(api)` - API services
- `(pwa)` - PWA features
- `(test)` - Testing infrastructure

---

## 📝 Code Standards

### General Principles

**Priority Order (when rules conflict):**
1. Security
2. Testing
3. Code Quality

**Example:** Never use `console.log` even in test files under `src/`.

### JavaScript/React

- **ES6+ syntax:** Use modern JavaScript features
- **Functional components:** With React hooks
- **PropTypes:** Define prop types for all components
- **Naming:** 
  - Components: `PascalCase` (e.g., `StravaActivityCard`)
  - Functions/variables: `camelCase` (e.g., `fetchActivities`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### File Organization

- **One component per file**
- **Named exports for utilities**, default for components
- **Group imports:** React → Third-party → Local
  ```javascript
  import React, { useState } from 'react';
  import { supabase } from '../lib/supabaseClient';
  import { formatDistance } from '../utils/formatters';
  ```

### Project-Specific Conventions

#### Strava Integration
- All API calls go through `src/services/stravaService.js`
- Use incremental sync by default
- **Error Handling:** On rate limit (HTTP 429), implement exponential backoff starting at 1 second, max 3 retries, using `retryWithBackoff` utility in `src/utils/retry.js`
- Log rate limit events with `console.warn` only outside `src/`

#### Supabase
- All queries use Supabase client from `src/lib/supabase.js`
- Enable RLS policies for all tables
- Use typed queries where possible

#### React Components
- Keep components focused and reusable
- Extract business logic to custom hooks
- Use context for global state (Auth, Theme)

---

## 🧪 Testing Requirements

### Coverage Requirements

- **Line coverage:** >70% (as reported by `npm run test:coverage`)
- **Branch coverage:** >60%

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- Test files: `*.test.js` or `*.test.jsx`
- Location: Co-locate with source files or in `src/test/`
- Framework: Vitest
- Testing Library: React Testing Library

**Example:**
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test for New Features

- Unit tests for utilities and services
- Component tests for UI components
- Integration tests for complex workflows

---

## 🔍 Pull Request Process

### Before Submitting

1. **Run all checks:**
   ```bash
   npm run lint          # ESLint - must pass
   npm run test:run      # Tests - must pass
   npm run security:check # Security - must pass
   ```

2. **Ensure commits follow conventional format**

3. **Update documentation** if needed

4. **Test manually** in browser

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (fix:)
- [ ] New feature (feat:)
- [ ] Breaking change (feat!: or fix!:)
- [ ] Documentation update (docs:)
- [ ] Refactoring (refactor:)
- [ ] Other (specify)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested in multiple browsers

## Checklist
- [ ] Code follows project conventions
- [ ] Lint passes (npm run lint)
- [ ] Tests pass (npm run test:run)
- [ ] Security checks pass (npm run security:check)
- [ ] Documentation updated
- [ ] Commit messages follow conventional commits
```

### Review Process

1. **Automated checks** must pass (GitHub Actions)
2. **Code review** by maintainer
3. **Approval required** before merge
4. **Squash and merge** to keep history clean

### After Merge

- `semantic-release` automatically:
  - Bumps version based on commit types
  - Updates CHANGELOG.md
  - Creates Git tag
  - Triggers deployment

---

## 🔒 Security Guidelines

### Critical Rules

1. **Never commit secrets:**
   - API keys, passwords, tokens
   - `.env`, `.env.development`, `.env.local`
   - Protected by `.gitignore` ✅

2. **No console.log in production code:**
   - Pre-commit hook checks for this
   - Allowed in scripts/ directory only
   - Use proper logging service for production

3. **Run security checks:**
   ```bash
   npm run security:scan    # Check for secrets in staged files
   npm run security:console # Find console.log statements
   npm run security:audit   # NPM vulnerability audit
   ```

### Handling Sensitive Data

- **Environment variables:** Use `VITE_` prefix for client-side
- **Service Role Key:** Server-side only (Edge Functions)
- **Anon Key:** Safe for client-side
- **Strava Client Secret:** Environment variable only

### Reporting Security Issues

**Do not create public GitHub issues for security vulnerabilities.**

Contact: [Repository Owner]

---

## 🎨 Code Style

### ESLint Configuration

Project uses ESLint with React plugin:
- Configuration: `eslint.config.js`
- Run: `npm run lint`

### Formatting

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line length:** ~80-100 characters (soft limit)

### Comments

```javascript
// Good: Explain WHY, not WHAT
// Strava API returns kilojoules instead of calories for some devices
const calories = activity.kilojoules * 0.239;

// Bad: Comment explains obvious code
// Multiply kilojoules by 0.239
const calories = activity.kilojoules * 0.239;
```

---

## 📚 Additional Resources

- [README.md](README.md) - Setup and overview
- [DEPLOY.md](DEPLOY.md) - Deployment guide
- [docs/](docs/) - Detailed documentation
- [Conventional Commits](https://www.conventionalcommits.org/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Strava API Documentation](https://developers.strava.com/)

---

## 💡 Tips

- **Small commits:** Easier to review and revert
- **Descriptive messages:** Help future maintainers
- **Test thoroughly:** Prevent regressions
- **Ask questions:** Better to clarify than assume
- **Be consistent:** Follow existing patterns

---

**Thank you for contributing to WeeGym! 🎉**
