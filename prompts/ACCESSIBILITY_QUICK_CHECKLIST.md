# SW Syns Tracker - Quick Accessibility Test Checklist

**Print this page for rapid testing**

---

## 🎯 5-Minute Smoke Test

Essential checks before deeper testing:

- ☐ **Tab Navigation**: Can you Tab through all interactive elements?
- ☐ **Focus Visible**: Is there a clear focus indicator on all elements?
- ☐ **Skip Link**: Does "Skip to content" appear on first Tab?
- ☐ **Keyboard Activation**: Can you press Enter/Space on all buttons?
- ☐ **ARIA Labels**: Do screen readers announce meaningful names?
- ☐ **Zoom Test**: Can you read everything at 200% zoom?
- ☐ **Pattern Test**: Are patterns visible without color?
- ☐ **Page Title**: Does screen reader announce "SW Logs"?
- ☐ **Form Labels**: Are all inputs labeled clearly?
- ☐ **Modal Exit**: Can you press Escape to close dialogs?

**❌ If any item unchecked → Full testing required**

---

## ⌨️ Keyboard Navigation Checklist

### Basic Navigation

- ☐ **Tab** moves forward through interactive elements
- ☐ **Shift + Tab** moves backward
- ☐ **Enter** activates buttons and links
- ☐ **Space** toggles buttons and checkboxes
- ☐ **Escape** closes modals/dialogs
- ☐ **Arrow keys** work in date picker

### Expected Tab Order

1. ☐ Skip to content link
2. ☐ Navigation menu items
3. ☐ SW Logs link
4. ☐ Date input field
5. ☐ Scan Barcode button
6. ☐ Search Food Database button
7. ☐ Manual Entry button
8. ☐ Food log delete buttons
9. ☐ SP Day Info button (if visible)
10. ☐ Meal suggestion cards
11. ☐ Category filter buttons

### Focus Indicator Requirements

- ☐ **Visible** on all interactive elements
- ☐ **3px solid outline** or equivalent
- ☐ **High contrast** (≥3:1 ratio)
- ☐ **Not obscured** by other elements
- ☐ **3px offset** from element

---

## 🔊 Screen Reader Checklist

### Quick Test Announcements

#### Page Load

- ☐ "SW Logs, heading level 1"
- ☐ "Main, landmark"

#### Progress Bar

- ☐ "Syns. Progress bar"
- ☐ States current value and maximum
- ☐ Announces remaining or over amount
- ☐ States percentage

#### Food Log Items

- ☐ Announces food name
- ☐ States syn value or "Free food"
- ☐ Mentions "Speed food" if applicable
- ☐ Describes serving size and quantity

#### Buttons

- ☐ "Scan barcode to add food, button"
- ☐ "Search food database to add food, button"
- ☐ "Manually enter food details, button"
- ☐ "Delete [food name] from log, button"

#### Status Updates

- ☐ Live region announces "X items logged today"
- ☐ Updates are polite (not intrusive)

### Heading Navigation (Press H)

- ☐ H1: SW Logs
- ☐ H2: Today's Summary
- ☐ H2: Add Food
- ☐ H2: Food Log
- ☐ H2: Meal Suggestions
- ☐ All headings in logical order

### List Navigation (Press L)

- ☐ Food log identified as list
- ☐ Item count announced ("3 items")
- ☐ Each item navigable

---

## 👁️ Visual Accessibility Checklist

### Pattern Visibility Test

Use colorblind simulator or ask colorblind tester:

- ☐ **Green diagonal stripes** (╱╱╱) visible for free foods
- ☐ **Yellow dots** (●●●) visible for warnings
- ☐ **Red cross-hatch** (✖✖✖) visible for over limit
- ☐ **Blue horizontal lines** (≡≡≡) visible for info
- ☐ All patterns distinguishable from each other
- ☐ Patterns work in grayscale

### High Contrast Mode Test

Enable Windows High Contrast or macOS Increase Contrast:

- ☐ All text readable
- ☐ Borders visible and thicker (3px)
- ☐ Focus indicators prominent
- ☐ Buttons identifiable
- ☐ No content hidden
- ☐ Font weight bolder (700)

### Zoom Test

Test at 100%, 125%, 150%, 200%, 400%:

- ☐ No horizontal scrolling at 200%
- ☐ Text reflows correctly
- ☐ No overlapping elements
- ☐ All functionality accessible
- ☐ Touch targets remain adequate

---

## 📱 Touch Target Checklist

Measure with DevTools or test on device:

| Element             | Min Size     | Spacing | Status |
| ------------------- | ------------ | ------- | ------ |
| Scan Barcode button | ≥44×44px     | ≥8px    | ☐      |
| Search button       | ≥44×44px     | ≥8px    | ☐      |
| Manual Entry button | ≥44×44px     | ≥8px    | ☐      |
| Delete buttons      | ≥44×44px     | ≥8px    | ☐      |
| SP Day Info button  | ≥44×44px     | ≥8px    | ☐      |
| Category buttons    | ≥44×44px     | ≥8px    | ☐      |
| Date picker         | ≥44px height | N/A     | ☐      |

### Physical Device Test

- ☐ Easy to tap with thumb
- ☐ No accidental activations
- ☐ Works one-handed

---

## 🎨 Color Contrast Checklist

**Tool:** WebAIM Contrast Checker or DevTools

### Text Contrast (4.5:1 minimum)

- ☐ Body text vs white background
- ☐ Button text vs button background
- ☐ Badge text vs badge background
- ☐ Link text vs white background
- ☐ Muted text vs white background

### Large Text Contrast (3:1 minimum)

- ☐ H1 heading vs background
- ☐ H2 heading vs background

### UI Component Contrast (3:1 minimum)

- ☐ Button borders vs background
- ☐ Input borders vs background
- ☐ Focus indicators vs background
- ☐ Progress bar vs background
- ☐ Card borders vs background

### Common Bootstrap 5 Colors (Reference)

- Primary (#0d6efd) vs White: ~7:1 ✅
- Success (#198754) vs White: ~4.5:1 ✅
- Warning (#ffc107) with dark text: ~9:1 ✅
- Danger (#dc3545) vs White: ~4.5:1 ✅
- Muted (#6c757d) vs White: ~4.6:1 ✅

---

## ⚙️ User Preference Checklist

### Reduced Motion Test

Enable in OS settings or browser DevTools:

- ☐ No animations play
- ☐ Transitions are instant
- ☐ No sliding/fading/spinning
- ☐ Functionality still works
- ☐ Visual feedback present (just instant)

**Test Actions:**

- ☐ Add food item
- ☐ Delete food item
- ☐ Toggle SP Day info
- ☐ Filter categories

### High Contrast Preference

- ☐ Text enhanced (bolder)
- ☐ Borders enhanced (thicker)
- ☐ Shadows more defined
- ☐ All content visible

---

## 📋 WCAG 2.1 AA Quick Checklist

### Level A (Must Pass)

- ☐ **1.1.1** All images/icons have alt text or aria-label
- ☐ **1.3.1** Semantic HTML (headings, lists, labels)
- ☐ **1.3.2** Reading order is logical
- ☐ **1.3.3** Not relying on color alone
- ☐ **1.4.1** Color + pattern + icon for status
- ☐ **2.1.1** All functionality via keyboard
- ☐ **2.1.2** No keyboard traps
- ☐ **2.4.1** Skip to content link
- ☐ **2.4.2** Page has descriptive title
- ☐ **2.4.3** Tab order is logical
- ☐ **3.1.1** Language of page set (lang="en")
- ☐ **3.2.1** Focus doesn't trigger unexpected changes
- ☐ **3.3.1** Errors identified clearly
- ☐ **3.3.2** All inputs have labels
- ☐ **4.1.2** ARIA used correctly

### Level AA (Should Pass)

- ☐ **1.3.4** Works in portrait and landscape
- ☐ **1.4.3** Text contrast ≥4.5:1 (normal), ≥3:1 (large)
- ☐ **1.4.4** Text can be resized to 200%
- ☐ **1.4.10** Content reflows at 320px width
- ☐ **1.4.11** UI components contrast ≥3:1
- ☐ **1.4.13** Hover content is dismissible
- ☐ **2.4.5** Multiple ways to find pages
- ☐ **2.4.6** Headings and labels descriptive
- ☐ **2.4.7** Focus indicator always visible
- ☐ **2.5.5** Touch targets ≥44×44px
- ☐ **3.3.3** Error suggestions provided
- ☐ **3.3.4** Confirmations for important actions
- ☐ **4.1.3** Status messages announced

---

## 🔧 Automated Tools Checklist

### Run These Tools

- ☐ **axe DevTools** (Chrome/Firefox extension)
  - Scan entire page
  - Review violations

- ☐ **Lighthouse** (Chrome DevTools)
  - Run accessibility audit
  - Target: ≥90 score

- ☐ **WAVE** (Browser extension)
  - Check for errors
  - Review alerts

### Common Issues to Look For

- ☐ Missing alt text
- ☐ Empty links/buttons
- ☐ Low contrast
- ☐ Missing form labels
- ☐ Incorrect ARIA usage
- ☐ Empty headings
- ☐ Missing document language

---

## ✅ Pass/Fail Criteria

### Must Pass (Critical)

All checkboxes in these sections:

- ✅ Keyboard Navigation
- ✅ Focus Indicators
- ✅ Screen Reader Announcements
- ✅ WCAG Level A criteria
- ✅ Touch Targets ≥44×44px
- ✅ Text Contrast ≥4.5:1

### Should Pass (Major)

- ✅ WCAG Level AA criteria
- ✅ Pattern visibility
- ✅ High contrast mode support
- ✅ Zoom to 200%
- ✅ Reduced motion support

### Nice to Have (Minor)

- ✅ Zoom to 400%
- ✅ All automated tool suggestions
- ✅ Enhanced error messaging

---

## 🚦 Quick Decision Tree

**Found a critical issue?**

```
├─ Can't use keyboard? → ❌ FAIL - Fix immediately
├─ Screen reader can't announce? → ❌ FAIL - Fix immediately
├─ Focus not visible? → ❌ FAIL - Fix immediately
├─ Contrast below 4.5:1? → ❌ FAIL - Fix immediately
├─ Touch targets < 44px? → ⚠️ MAJOR - Fix soon
├─ Zoom breaks layout? → ⚠️ MAJOR - Fix soon
├─ Pattern not visible? → ⚠️ MAJOR - Fix soon
├─ Minor ARIA issue? → ℹ️ MINOR - Fix when possible
└─ Enhancement suggestion? → 💡 NICE TO HAVE
```

---

## 📊 Testing Scorecard

| Category         | Items Tested | Items Passed | Pass Rate |
| ---------------- | ------------ | ------------ | --------- |
| Keyboard         | \_\_\_       | \_\_\_       | \_\_\_%   |
| Screen Reader    | \_\_\_       | \_\_\_       | \_\_\_%   |
| Visual           | \_\_\_       | \_\_\_       | \_\_\_%   |
| Touch Targets    | \_\_\_       | \_\_\_       | \_\_\_%   |
| Color Contrast   | \_\_\_       | \_\_\_       | \_\_\_%   |
| User Preferences | \_\_\_       | \_\_\_       | \_\_\_%   |
| **TOTAL**        | \_\_\_       | \_\_\_       | \_\_\_%   |

**Overall Grade:**

- 100% = ⭐⭐⭐⭐⭐ Excellent
- 90-99% = ⭐⭐⭐⭐ Very Good
- 80-89% = ⭐⭐⭐ Good
- 70-79% = ⭐⭐ Needs Work
- <70% = ⭐ Major Issues

---

## 📝 Quick Notes

**Issues Found:**

1. ***
2. ***
3. ***

**Tested By:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Time:** ******\_\_\_******

---

## 🔗 Quick Resources

- **WCAG Quick Ref:** https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Contrast:** https://webaim.org/resources/contrastchecker/
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/extension/

---

**🎯 Goal: 100% pass rate on critical items, 90%+ overall**

**Remember:** Automated tools catch ~30% of issues. Manual testing is essential!
