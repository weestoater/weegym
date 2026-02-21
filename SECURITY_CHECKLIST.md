# Security Checklist for Code Commits

## Overview

This checklist must be completed before committing any code to ensure no sensitive information or security vulnerabilities are introduced.

## Pre-Commit Security Checks

### ✅ 1. Credentials & Secrets

- [ ] No hardcoded passwords, API keys, or tokens
- [ ] No database credentials in code
- [ ] No private keys or certificates
- [ ] All sensitive values use environment variables
- [ ] `.env` and `.env.local` files are in `.gitignore`
- [ ] No secrets in comments or TODO notes

### ✅ 2. Environment Variables

- [ ] All sensitive config uses `import.meta.env.*` or `process.env.*`
- [ ] `.env.example` exists with placeholder values (no real secrets)
- [ ] Environment variables are properly validated before use
- [ ] No environment variable values logged to console

### ✅ 3. Database Security

- [ ] Row Level Security (RLS) policies enabled on all tables
- [ ] RLS policies test `auth.uid()` for user isolation
- [ ] No direct SQL queries with string concatenation
- [ ] Using Supabase query builder or parameterized queries
- [ ] Foreign key constraints properly defined
- [ ] Sensitive columns (like passwords) are never sent to client

### ✅ 4. Input Validation

- [ ] All user inputs are validated and sanitized
- [ ] File uploads are restricted by type and size
- [ ] URLs are validated before using them
- [ ] SQL injection prevention (use query builders)
- [ ] XSS prevention (React escapes by default, but verify)

### ✅ 5. Authentication & Authorization

- [ ] Protected routes check authentication before rendering
- [ ] API calls include user authentication
- [ ] User ID from auth context, never from user input
- [ ] No bypassing auth checks in production code

### ✅ 6. Logging & Debugging

- [ ] No `console.log` of sensitive data (passwords, tokens, user details)
- [ ] Remove or comment debug logging before commit
- [ ] Error messages don't expose system internals
- [ ] Stack traces sanitized in production
- [ ] No logging of complete user objects

### ✅ 7. Third-Party Dependencies

- [ ] Dependencies from trusted sources only
- [ ] Run `npm audit` to check for vulnerabilities
- [ ] Update packages with known security issues
- [ ] Review package permissions and data access

### ✅ 8. API Endpoints

- [ ] Public APIs don't expose user data
- [ ] Rate limiting considered for public endpoints
- [ ] CORS properly configured
- [ ] No API keys sent in URLs (use headers)

### ✅ 9. Client-Side Security

- [ ] No sensitive business logic in client code
- [ ] No hardcoded admin credentials
- [ ] Local storage doesn't contain sensitive unencrypted data
- [ ] Session tokens handled securely

### ✅ 10. File & Path Security

- [ ] No absolute file paths that expose system structure
- [ ] No sensitive file names or directory structures
- [ ] Upload directories not executable
- [ ] File access properly restricted

## Pre-Commit Commands

### Quick NPM Scripts (Recommended)

The following shortcuts have been added to package.json:

```bash
# Run all security checks at once
npm run security:check

# Scan staged files for secrets
npm run security:scan

# Find console.log statements
npm run security:console

# Run npm audit for vulnerabilities
npm run security:audit

# Pre-commit check (runs all checks)
npm run precommit
```

### VS Code Tasks (Even Easier!)

Press **Ctrl+Shift+P** (or **Cmd+Shift+P** on Mac) and type "Tasks: Run Task", then select:

- 🔒 **Security: Full Check** - Run all security checks
- 🔍 **Security: Scan for Secrets** - Check for credentials
- 🐛 **Security: Find Console Logs** - Find debug statements
- 🛡️ **Security: NPM Audit** - Check dependencies
- ✅ **Pre-Commit Check** - Quick pre-commit validation

**Keyboard Shortcut**: You can also press **Ctrl+Shift+B** to run the default task.

### Shell Scripts

For more detailed output, run the shell scripts directly:

**On Windows:**

```bash
scripts\security-check.bat
```

**On Mac/Linux:**

```bash
bash scripts/security-check.sh
```

### Original Manual Commands

### 1. Scan for potential secrets

```bash
# Search for common secret patterns
git diff --cached | grep -E "(password|secret|api_key|private_key|token|credential).*=.*['\"]"

# Check for hardcoded URLs with auth
git diff --cached | grep -E "https?://[^:]+:[^@]+@"
```

### 2. Check for debug code

```bash
# Find console.log statements
git grep -n "console\.log"

# Find debugger statements
git grep -n "debugger"
```

### 3. Verify .gitignore

```bash
# Make sure .env files are ignored
git check-ignore .env .env.local .env.production

# List all ignored files
git status --ignored
```

### 4. Run security audit

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix
```

## Specific to WeeGym Project

### Environment Variables to NEVER commit:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Any Supabase service role keys
- Any admin passwords or test credentials

### Files to NEVER commit:

- `.env`
- `.env.local`
- `.env.production`
- `supabase-config/*-admin-*.sql` (may contain user emails/IDs)
- Any backup files with real user data

### Safe to Commit:

- `.env.example` (with placeholder values)
- Schema files without user data
- Public documentation
- Test files with mock data only

## Emergency: If Secrets Were Committed

### Immediate Actions:

1. **Rotate the compromised credentials immediately**
2. **Remove from Git history:**

   ```bash
   # Remove file from history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (WARNING: coordinate with team)
   git push origin --force --all
   ```

3. **Update `.gitignore` to prevent recurrence**
4. **Notify your team**
5. **Monitor for unauthorized access**

## Review Frequency

- ✅ Before every commit
- ✅ During code reviews
- ✅ Before production deployments
- ✅ After adding new dependencies
- ✅ Monthly security audits

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## Sign-off

Before committing, verify:

- [ ] I have reviewed all changes for security issues
- [ ] No sensitive information is included
- [ ] All tests pass
- [ ] Code follows security best practices
- [ ] `.gitignore` is properly configured

---

**Remember**: It's easier to prevent secrets from being committed than to remove them from Git history!
