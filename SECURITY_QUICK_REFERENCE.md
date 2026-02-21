# 🔒 Security Quick Reference

## Fastest Ways to Run Security Checks in VS Code

### Method 1: NPM Scripts (Terminal)

```bash
npm run security:check    # Run all checks
npm run precommit        # Quick pre-commit check
```

### Method 2: VS Code Command Palette (Easiest!)

1. Press **Ctrl+Shift+P** (Windows/Linux) or **Cmd+Shift+P** (Mac)
2. Type: `Tasks: Run Task`
3. Select: **🔒 Security: Full Check**

### Method 3: Keyboard Shortcut

- Press **Ctrl+Shift+B** to run default build task

---

## Individual Check Commands

| Command                    | What It Does                |
| -------------------------- | --------------------------- |
| `npm run security:scan`    | Check for hardcoded secrets |
| `npm run security:console` | Find console.log statements |
| `npm run security:audit`   | Check npm vulnerabilities   |
| `npm run security:check`   | Run all checks together     |

---

## Before Every Commit

✅ Run: `npm run precommit`

This will:

- ✔️ Scan for secrets (passwords, API keys, tokens)
- ✔️ Find debug console.log statements
- ✔️ Check npm packages for vulnerabilities

---

## If Issues Found

### Secrets detected:

```bash
git reset HEAD <file>    # Unstage the file
# Remove the secret, use environment variable instead
```

### Console.log found:

```bash
# Remove or comment out console.log statements
# Or use console.error for actual errors only
```

### Vulnerabilities:

```bash
npm audit fix           # Auto-fix
npm audit fix --force   # Force fix (may have breaking changes)
```

---

## Emergency: Secret Already Committed

1. **Immediately rotate the credential**
2. **Remove from Git:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (coordinate with team first!)

---

## VS Code Keyboard Shortcuts

| Shortcut         | Action                              |
| ---------------- | ----------------------------------- |
| **Ctrl+Shift+P** | Command Palette → Tasks: Run Task   |
| **Ctrl+Shift+B** | Run Build/Default Task              |
| **Ctrl+`**       | Open Terminal (to run npm commands) |
| **Ctrl+Shift+F** | Search across files (find secrets)  |

---

## Files to NEVER Commit

❌ `.env`
❌ `.env.local`
❌ `.env.production`
❌ `*-admin-*.sql` (in supabase-config/)
❌ Any file with real passwords, API keys, or user data

✅ **Safe:** `.env.example` (with placeholders only)

---

## Quick Security Checklist

Before staging files:

- [ ] No hardcoded credentials
- [ ] No console.log with sensitive data
- [ ] Environment variables used for config
- [ ] .env files not staged
- [ ] npm audit shows no critical issues

---

**Keep this file open** while coding for quick reference! 🎯
