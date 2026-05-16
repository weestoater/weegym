# Editor Prompts Setup

## What's Been Created

✅ **`.instructions.md`** (root) - GitHub Copilot reads this automatically  
✅ **`.gitmessage`** (root) - Git commit message template  
✅ **`prompts/conventional-commits.md`** - Quick reference guide

---

## 🚀 Quick Setup (2 minutes)

### 1. Enable Git Commit Template

Run this command in your terminal:

```bash
cd d:\git\aws\weegym
git config commit.template .gitmessage
```

Now when you run `git commit` (without `-m`), you'll see the template with helpful reminders!

**Try it:**
```bash
git add .
git commit
# Your editor opens with the template showing format examples
```

### 2. GitHub Copilot Integration (Automatic)

The `.instructions.md` file is **already active**! GitHub Copilot will now:

- ✅ Suggest conventional commit messages
- ✅ Pick the right commit type based on your changes
- ✅ Remind you about project conventions
- ✅ Offer to rewrite non-conventional commits

**Example in VS Code:**
```
You type: "git commit -m 'fixed bug'"
Copilot suggests: "Use: git commit -m 'fix: resolve activity sync bug'"
```

### 3. Quick Reference (Always Available)

Open [`prompts/conventional-commits.md`](../prompts/conventional-commits.md) anytime you need to check:
- Commit types
- Real examples from WeeGym
- Multi-line commit format
- Breaking change syntax

---

## 🎯 How to Use

### Option 1: Quick Commits (with template reminder)

```bash
git add .
git commit
# Template appears in your editor
# Write: feat: add Strava webhook support
```

### Option 2: One-line Commits (as before)

```bash
git add .
git commit -m "feat: add Strava webhook support"
```

### Option 3: Let Copilot Help

In VS Code:
1. Stage your changes
2. Click the commit message box in Source Control
3. Type what you did (natural language)
4. Copilot will suggest conventional format
5. Accept the suggestion!

---

## 💡 Pro Tips

### Copilot Chat Integration

You can also ask Copilot to write commit messages:

```
You: @workspace write a commit message for these changes

Copilot: Based on your changes to stravaService.js:
feat(strava): add webhook support

Implements real-time activity sync using Strava webhooks.
This eliminates manual sync and reduces API calls.

Closes #42
```

### Custom Keyboard Shortcut (Optional)

Add to VS Code `keybindings.json`:

```json
{
  "key": "ctrl+shift+c",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "git commit\n" }
}
```

Now `Ctrl+Shift+C` opens commit with template!

---

## 📚 Files Created

| File | Purpose | Auto-Used? |
|------|---------|-----------|
| `.instructions.md` | Copilot project guidelines | ✅ Yes |
| `.gitmessage` | Git commit template | After git config |
| `prompts/conventional-commits.md` | Reference guide | Manual |

---

## ✅ What's Already Working

1. **GitHub Copilot** now knows to use conventional commits
2. **CI/CD** validates commit format on merge
3. **Semantic-release** reads commits and creates releases
4. **Templates** are ready (just need `git config`)

---

## 🆘 Test It Works

Try this:

```bash
# 1. Make a test change
echo "test" > test.txt
git add test.txt

# 2. Commit with template
git commit
# Template appears! Write: feat: test commit message template

# 3. Or one-liner
git commit -m "feat: test conventional commits"

# 4. Check it worked
git log -1
# Should show: feat: test...
```

---

**Next:** Commit these new files with conventional format! 🚀

```bash
git add .
git commit -m "feat: add editor prompts for conventional commits

- Add .instructions.md for GitHub Copilot integration
- Add .gitmessage template for guided commits
- Add prompts/conventional-commits.md reference guide
- Update prompts/README.md"
```
