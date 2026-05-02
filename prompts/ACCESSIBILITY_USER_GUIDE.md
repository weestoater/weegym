# Accessibility Features Guide

## Overview

Your SW tracking app now includes comprehensive accessibility features designed for all users, including those with visual impairments, colorblindness, and users who rely on assistive technologies like screen readers.

## Key Accessibility Features

### 1. **Pattern-Based Design (Colorblind Friendly)**

We use **patterns + colors** together, so you can identify status even if you can't see the colors clearly:

#### Pattern Guide:

- **Diagonal Stripes (╱╱╱)** = Good/Success ✅
  - Free foods
  - Low syns (< 4)
  - Under your daily budget

- **Dots (●●●)** = Warning/Caution ⚠️
  - Moderate syns (4-9)
  - Approaching your limit (70-90% used)

- **Cross-hatch (✖✖✖)** = Alert/Over ❌
  - High syns (> 9)
  - Over your daily limit

- **Horizontal Lines (≡≡≡)** = Information ℹ️
  - General messages
  - SP Day guidance

This means even if you have:

- Red-green colorblindness
- Blue-yellow colorblindness
- Total colorblindness

You can still tell the difference between free foods, warnings, and over-limit alerts!

### 2. **Progress Bar with Patterns**

The new daily summary shows a visual progress bar with your syn usage:

- **Green with diagonal stripes**: You're doing great! Plenty of syns left
- **Yellow/orange with dots**: Getting close to your limit
- **Red with cross-hatch**: Over your daily allowance

**Example:**

```
Syns ━━━━━━━━━━░░░░░░░░░░ 15/30 syns
     ╱╱╱╱╱╱╱╱╱╱                50% used
```

### 3. **Screen Reader Support**

#### Compatible with:

- **VoiceOver** (iPhone/iPad)
- **TalkBack** (Android)
- **NVDA** (Windows)
- **JAWS** (Windows)

#### What Screen Readers Announce:

- **Progress:** "Syns. 15 of 30. 15 remaining. 50% used"
- **Food Items:** "Banana, Free food, zero syns. Speed food"
- **Buttons:** "Scan barcode to add food. Button"
- **Status:** "You have 8 items logged today"

All critical information is announced clearly without needing to see the screen.

### 4. **Keyboard Navigation**

You can use the app entirely with a keyboard:

#### Shortcuts:

- **Tab**: Move to next element
- **Shift + Tab**: Move to previous element
- **Enter** or **Space**: Activate button
- **Escape**: Close dialogs

#### Special Feature: Skip to Content

Press **Tab** immediately after page loads to reveal a "Skip to main content" link. This lets you jump past navigation directly to your food log.

### 5. **High-Contrast Mode**

If you use Windows High Contrast mode or similar:

- Text becomes bolder (700 font weight)
- Borders become thicker (3px)
- Shadows become stronger
- Focus indicators are more visible

### 6. **Touch-Friendly**

All buttons and interactive elements are **at least 44x44 pixels** - easy to tap even with larger fingers or motor difficulties.

### 7. **Focus Indicators**

When tabbing through the page, each focused element shows a **3px solid outline** so you always know where you are.

### 8. **Reduced Motion Support**

If you've enabled "Reduce motion" in your device settings:

- Animations are disabled
- Transitions are instant
- No distracting movements

This helps users with:

- Vestibular disorders
- Motion sensitivity
- Epilepsy or seizure disorders

### 9. **Semantic HTML Structure**

The page is organized with proper landmarks:

- **Header**: Page title and navigation
- **Main**: Primary content area
- **Sections**: Daily summary, add food, food log
- **Articles**: Individual food log entries

This makes navigation with assistive tech much easier.

### 10. **Clear Headings**

Content is organized with proper heading levels:

- **H1**: SW Logs (page title)
- **H2**: Today's Summary, Add Food, Food Log (main sections)
- **H3**: Food item names (details)

Screen readers can jump between headings using shortcuts.

## Using the Progress Indicator

The new progress bar shows your syn usage at a glance:

### Visual Design:

```
┌─────────────────────────────────────────┐
│ ⭐ Syns                  ✅ 15 remaining │
├─────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ╱╱╱╱╱╱╱╱╱╱     15 / 30                 │
│                                          │
│             50% used                     │
└─────────────────────────────────────────┘
```

### Status Icons:

- ✅ **Check mark**: Under 70% (good)
- ℹ️ **Info circle**: 70-90% (approaching)
- ⚠️ **Warning triangle**: 90-100% (caution)
- ❌ **Exclamation triangle**: Over 100% (over limit)

### Screen Reader Announcement:

"Syns. Progress bar. 15 of 30. 15 remaining. 50% used."

## Tips for Best Experience

### For Screen Reader Users:

1. Use heading navigation to jump between sections
2. Use the "Skip to content" link to bypass navigation
3. Food log items are in a list - use list navigation
4. Progress updates use `aria-live="polite"` so they announce automatically

### For Keyboard Users:

1. Tab through interactive elements in logical order
2. Use Enter or Space to activate buttons
3. Focus indicators show your current position
4. Skip link available at top of page

### For Colorblind Users:

1. Look for patterns, not just colors
2. Icons supplement color (check marks, warning triangles)
3. Text labels are always present ("Free", "15 syns")

### For Low Vision Users:

1. Zoom up to 200% - layout stays readable
2. Enable high-contrast mode in OS settings
3. Large touch targets for easier interaction
4. Clear focus indicators

### For Users with Motion Sensitivity:

1. Enable "Reduce motion" in your device settings
2. App will automatically disable animations

## Testing Your Setup

### Test Screen Reader:

1. **iOS**: Settings → Accessibility → VoiceOver → On
2. **Android**: Settings → Accessibility → TalkBack → On
3. **Windows**: Download NVDA (free)
4. Navigate to SW Logs and try reading the page

### Test Keyboard Navigation:

1. Click in the browser address bar
2. Press Tab repeatedly
3. First tab should show "Skip to main content"
4. Continue tabbing to each button and input

### Test High Contrast:

1. **Windows**: Alt + Shift + PrtScn
2. App should adapt with stronger borders and bolder text

### Test Zoom:

1. **Browser**: Ctrl + Plus (Windows) or Cmd + Plus (Mac)
2. Zoom to 200%
3. Layout should remain usable

## Feedback

If you encounter any accessibility issues:

- Focus indicators not visible
- Screen reader announcements unclear
- Keyboard navigation problems
- Patterns not visible for colorblindness

Please report them so we can improve!

## Standards Met

This app follows:

- **WCAG 2.1 Level AA**: Web Content Accessibility Guidelines
- **ARIA 1.2**: Accessible Rich Internet Applications
- **Section 508**: U.S. federal accessibility standards

## Resources

Learn more about accessibility:

- [WebAIM: Screen Reader Users](https://webaim.org/articles/screenreader_testing/)
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Keyboard Navigation Guide](https://webaim.org/articles/keyboard/)

---

**Your privacy and independence matter.** These accessibility features ensure everyone can track their syns confidently, regardless of ability or assistive technology used.
