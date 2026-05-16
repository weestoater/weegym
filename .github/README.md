# .github Configuration

This directory contains all GitHub-specific configuration for the WeeGym project.

## 📁 Directory Structure

```
.github/
├── workflows/           # GitHub Actions workflows
│   ├── ci.yml          # Continuous Integration pipeline
│   ├── deploy.yml      # GitHub Pages deployment
│   └── release.yml     # Automated semantic releases
├── ISSUE_TEMPLATE/     # Issue templates
│   ├── 01-feature.yml
│   ├── 02-bug.yml
│   ├── 03-enhancement.yml
│   ├── 04-tech-debt.yml
│   └── config.yml
├── pull_request_template.md  # PR template
├── AUTOMATION_GUIDE.md       # Complete automation guide
├── COMMIT_CONVENTION.md      # Commit message reference
└── LABELS.md                  # Recommended labels
```

## 🚀 Quick Links

- **[Automation Guide](./AUTOMATION_GUIDE.md)** - Complete setup and usage guide
- **[Commit Convention](./COMMIT_CONVENTION.md)** - Quick reference for conventional commits
- **[Labels Guide](./LABELS.md)** - Recommended labels and how to create them

## ⚡ What's Automated

### ✅ Continuous Integration (ci.yml)

Runs on every push and PR:

- Linting (ESLint)
- Tests with coverage
- Security checks
- Build validation

### 🚀 Automated Releases (release.yml)

Runs on push to main:

- Analyzes conventional commits
- Determines version bump
- Generates changelog
- Creates GitHub release
- Updates package.json

### 🌐 Deployment (deploy.yml)

Runs on push to main:

- Builds project
- Deploys to GitHub Pages

## 📝 Issue & PR Templates

### Issue Templates

Four structured templates for different types of work:

1. **Feature Request** - New functionality
2. **Bug Report** - Something broken
3. **Enhancement** - Improve existing feature
4. **Technical Debt** - Code quality improvements

### Pull Request Template

Standardized PR format including:

- Description and related issue
- Type of change
- Testing checklist
- Screenshots
- Code quality checks

## 🎯 Getting Started

1. **Read the [Automation Guide](./AUTOMATION_GUIDE.md)**
2. **Create labels** using [Labels Guide](./LABELS.md)
3. **Start using conventional commits** - see [Commit Convention](./COMMIT_CONVENTION.md)
4. **Create your first issue** using templates
5. **Open a PR** and watch CI run!

## 🔧 Configuration Files (Project Root)

These files in the project root work with the GitHub automation:

- `.releaserc.json` - semantic-release configuration
- `commitlint.config.js` - Commit message validation

## 💡 Tips

- Use **Issues** for committed work you plan to do
- Use **Discussions** for ideas and questions
- Create **Milestones** for grouping related issues (v2.0, v2.1, etc.)
- Set up **Branch Protection** on main to require CI passing

## 🆘 Need Help?

- Check the [Automation Guide](./AUTOMATION_GUIDE.md) for troubleshooting
- Look at [Commit Convention](./COMMIT_CONVENTION.md) for commit message help
- Review workflow files in `workflows/` for details on what runs when

---

**Last Updated:** May 16, 2026  
**Phases Completed:** 1-3 (CI/CD, Templates, Releases)
