# WeeGym Project Prompts

## 📁 Folder Organization

### Current Files

- **[ToDo.md](./ToDo.md)** - 🎯 Active roadmap with next stages planning and future enhancements
- **[conventional-commits.md](./conventional-commits.md)** - 📝 Quick reference for conventional commit format (required for releases)
- **[README.md](./README.md)** - This file, navigation and overview

### Archive

- **[Done/](./Done/)** - ✅ Completed prompts and implementation summaries (Slimming World Syns Tracker Phases 1-5)

---

## 🚀 Quick Links

**Planning a new feature?** → Start with [ToDo.md](./ToDo.md) to see the roadmap

**Looking for completed work?** → Check the [Done/](./Done/) folder

**Implementation details?** → See [guides/COMPLETE_IMPLEMENTATION_OVERVIEW.md](../guides/COMPLETE_IMPLEMENTATION_OVERVIEW.md)

---

## ✅ Major Completed Features (All in Done/ folder)

### Slimming World Syns Tracker (May 2026)

- Core functionality with configurable syn allowances
- Meal recommendation system with free foods
- Full accessibility (WCAG 2.1 AA) with screen reader support
- Smart guidance and error prevention
- Comprehensive testing framework

**Details:** All 5 prompts completed, files moved to [Done/](./Done/) subfolder

---

## 🎯 Active Planning

See **[ToDo.md](./ToDo.md)** for complete roadmap including:

### High Priority

- Strava webhooks for real-time sync
- Exercise video/image library
- Programme templates library

### Quality of Life

- Enhanced data export (CSV/PDF)
- Unified activity dashboard
- Workout calendar with scheduling

### Advanced Features

- Advanced Strava analytics
- Training goals and plans
- Meal planning features
- Progress photos & measurements

---

## 📝 Project Status Summary

| Feature Area        | Status      | Notes                    |
| ------------------- | ----------- | ------------------------ |
| Syns Tracker        | ✅ Complete | Phases 1-5 done          |
| Strava Integration  | ✅ Complete | Phases 1-6 with PRs      |
| Multi-User System   | ✅ Complete | Auth & custom programmes |
| Active Wellbeing    | ✅ Complete | Session tracking         |
| Calorie Tracker     | ✅ Complete | Barcode scanning         |
| Exercise Library    | 🎯 Planned  | P2 in ToDo.md            |
| Programme Templates | 🎯 Planned  | P3 in ToDo.md            |
| Webhooks            | 🎯 Planned  | P1 in ToDo.md            |
| Meal Planning       | 🔮 Future   | A3 in ToDo.md            |

---

## 📖 Documentation Structure

```
prompts/
├── ToDo.md              # Current roadmap & planning
├── README.md            # This file - navigation
└── Done/                # Completed prompt files
    ├── 01-core-functionality-update.md
    ├── 02-meal-recommendation-system.md
    ├── 03-accessibility-visual-design.md
    ├── 04-smart-guidance-error-prevention.md
    ├── 05-testing-validation.md
    └── IMPLEMENTATION_SUMMARY_PROMPT*.md

docs/                    # Detailed technical documentation
guides/                  # User guides and overviews
```

---

## 💡 How to Use This Folder

### When starting a new feature:

1. Check [ToDo.md](./ToDo.md) to see if it's already planned
2. Review priority and effort estimates
3. Check related docs in `/docs` folder
4. Implement with reference to best practices in ToDo.md

### When completing a feature:

1. Update relevant sections in [ToDo.md](./ToDo.md)
2. Move any design docs to appropriate location
3. Update project documentation in `/docs` or `/guides`
4. Mark items as complete with ✅

### When reviewing project status:

1. Start with [ToDo.md](./ToDo.md) for future plans
2. Check [Done/](./Done/) for completed implementation details
3. See [guides/](../guides/) for user-facing documentation

---

## 🏗️ Context - Slimming World Syns Tracker (Historical)

This folder originally contained implementation prompts for converting WeeGym's calorie tracker to a Slimming World syns tracker with full accessibility support.

### What Was Delivered (May 2026)

- Core syn tracking with configurable allowances
- Meal recommendation system with 20 free foods and SP Day guidance
- WCAG 2.1 AA accessibility compliance
- Screen reader support (VoiceOver/TalkBack/NVDA)
- Color-coding with patterns for colorblind users
- Smart guidance and error prevention
- Comprehensive testing framework and documentation

### Archive Location

All 5 completed prompts and implementation summaries moved to **[Done/](./Done/)** subfolder.

**Full details:** [guides/COMPLETE_IMPLEMENTATION_OVERVIEW.md](../guides/COMPLETE_IMPLEMENTATION_OVERVIEW.md)

---

**Last Updated:** May 13, 2026  
**Active Roadmap:** [ToDo.md](./ToDo.md)
