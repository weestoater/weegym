# Comprehensive Accessibility Testing Guide

## SW Syns Tracker - WCAG 2.1 AA Validation

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Testing Setup](#pre-testing-setup)
3. [Keyboard Accessibility Testing](#keyboard-accessibility-testing)
4. [Screen Reader Testing](#screen-reader-testing)
5. [Visual Accessibility Testing](#visual-accessibility-testing)
6. [Touch Target Validation](#touch-target-validation)
7. [Color Contrast Validation](#color-contrast-validation)
8. [User Preference Testing](#user-preference-testing)
9. [WCAG 2.1 AA Compliance Checklist](#wcag-21-aa-compliance-checklist)
10. [Testing Report Template](#testing-report-template)

---

## Overview

This guide provides step-by-step instructions for validating the accessibility of the SW Syns Tracker application. All tests should be performed to ensure WCAG 2.1 Level AA compliance.

**Testing Environment Requirements:**

- Windows 10/11 with NVDA or JAWS
- macOS with VoiceOver
- iOS device with VoiceOver
- Android device with TalkBack
- Chrome, Firefox, Safari, and Edge browsers
- Color contrast analyzer tool
- Browser developer tools

---

## Pre-Testing Setup

### Install Required Tools

#### 1. Screen Readers

- **NVDA (Windows)** - Free: https://www.nvaccess.org/download/
- **JAWS (Windows)** - Trial: https://www.freedomscientific.com/downloads/jaws/
- **VoiceOver (macOS/iOS)** - Built-in to Apple devices
- **TalkBack (Android)** - Built-in: Settings → Accessibility → TalkBack

#### 2. Browser Extensions

- **axe DevTools** - https://www.deque.com/axe/devtools/
- **WAVE** - https://wave.webaim.org/extension/
- **Lighthouse** (Built into Chrome DevTools)

#### 3. Color Contrast Tools

- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser** - https://www.tpgi.com/color-contrast-checker/

#### 4. Browser Developer Tools

- **Chrome DevTools**: F12 or Ctrl+Shift+I
- **Firefox Developer Tools**: F12 or Ctrl+Shift+I

### Enable Testing Features

#### Windows High Contrast Mode

1. Press `Left Alt + Left Shift + Print Screen`
2. Confirm the dialog
3. Test the app in this mode

#### Reduced Motion

**Windows:**

1. Settings → Ease of Access → Display
2. Turn on "Show animations in Windows"

**macOS:**

1. System Preferences → Accessibility → Display
2. Check "Reduce motion"

**Browser:**

```css
/* Test by adding to DevTools */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
```

---

## Keyboard Accessibility Testing

### Test Objective

Verify all functionality is accessible via keyboard without requiring a mouse.

### Test Procedure

#### 1. **Tab Order Test**

**Steps:**

1. Open SW Logs page
2. Click in the browser address bar
3. Press `Tab` repeatedly
4. Document each focused element

**Expected Tab Order:**

```
1. Skip to content link (appears on first Tab)
2. Navigation items (Home, Programme, etc.)
3. SW Logs navigation item
4. Date input field
5. Scan Barcode button
6. Search Food Database button
7. Manual Entry button
8. Each food log item's delete button
9. (If meal suggestions visible) SP Day Info button
10. Meal suggestion cards
11. Category filter buttons
```

**Pass Criteria:**

- ✅ All interactive elements receive focus
- ✅ Focus order is logical and predictable
- ✅ No elements are skipped
- ✅ Focus doesn't trap in any section

#### 2. **Focus Indicator Test**

**Steps:**

1. Tab through all interactive elements
2. Verify visible focus indicator on each

**Expected Behavior:**

- 3px solid outline around focused element
- High contrast color (blue or appropriate)
- 3px offset from element
- Visible against all backgrounds

**Pass Criteria:**

- ✅ Focus indicator visible on ALL interactive elements
- ✅ Contrast ratio of focus indicator meets 3:1
- ✅ Focus indicator not obscured by other elements

#### 3. **Keyboard Operation Test**

Test each interactive element with keyboard only:

| Element               | Key         | Expected Action       | Pass/Fail |
| --------------------- | ----------- | --------------------- | --------- |
| Skip to content link  | Enter       | Jumps to main content | ☐         |
| Scan Barcode button   | Enter/Space | Opens barcode scanner | ☐         |
| Search button         | Enter/Space | Opens search dialog   | ☐         |
| Manual Entry button   | Enter/Space | Opens form            | ☐         |
| Date picker           | Arrow keys  | Changes date          | ☐         |
| Delete button         | Enter/Space | Deletes food item     | ☐         |
| SP Day Info button    | Enter/Space | Toggles info panel    | ☐         |
| Category buttons      | Enter/Space | Filters category      | ☐         |
| Meal suggestion cards | Enter/Space | (Future: quick add)   | ☐         |

#### 4. **Skip to Content Link Test**

**Steps:**

1. Load SW Logs page
2. Press `Tab` once
3. Verify "Skip to content" link appears
4. Press `Enter`
5. Verify focus moves to main content area

**Pass Criteria:**

- ✅ Link appears on first Tab
- ✅ Link is visible (not hidden)
- ✅ Pressing Enter skips navigation
- ✅ Focus lands on main content

#### 5. **Keyboard Trap Test**

**Steps:**

1. Tab through entire page
2. Verify you can Tab forward and Shift+Tab backward
3. Test each dialog/modal
4. Ensure Escape closes modals

**Pass Criteria:**

- ✅ No keyboard traps anywhere
- ✅ Can always move forward/backward
- ✅ Modals can be closed with Escape
- ✅ Focus returns to trigger element after modal closes

---

## Screen Reader Testing

### VoiceOver Testing (macOS/iOS)

#### Enable VoiceOver

**macOS:** `Cmd + F5`
**iOS:** Settings → Accessibility → VoiceOver → On

#### VoiceOver Commands (macOS)

- **Navigate:** `Ctrl + Option + Arrow Keys`
- **Interact:** `Ctrl + Option + Shift + Down`
- **Stop Interacting:** `Ctrl + Option + Shift + Up`
- **Activate:** `Ctrl + Option + Space`
- **Read Next:** `Ctrl + Option + Right Arrow`

#### Test Cases

##### 1. Page Title and Heading Announcement

**Steps:**

1. Navigate to SW Logs page
2. Let VoiceOver announce the page

**Expected Announcements:**

```
"SW Logs, heading level 1"
"Main, landmark"
"Today's Summary, heading level 2"
```

**Pass Criteria:**

- ✅ Page title announced correctly
- ✅ Main landmark identified
- ✅ All headings announce with correct level

##### 2. Progress Indicator Announcement

**Navigate to daily summary section**

**Expected Announcement:**

```
"Syns. Progress bar. 15 of 30. 15 remaining. 50% used."
```

**Alternative if over limit:**

```
"Syns. Progress bar. 32 of 30. Over limit by 2. 107% used."
```

**Pass Criteria:**

- ✅ Announces as progress bar
- ✅ States current value and maximum
- ✅ Announces remaining or over amount
- ✅ Percentage is announced

##### 3. Food Log Item Announcement

**Navigate to a food log item**

**Expected Announcement:**

```
"List, 3 items"
"Banana. Free food, zero syns. Speed food. Listitem."
"100g × 1. Breakfast."
"Delete Banana from log, button"
```

**Pass Criteria:**

- ✅ List identified with item count
- ✅ Food name announced
- ✅ Syn value or "Free food" announced
- ✅ Speed food status announced if applicable
- ✅ Serving size and meal type announced
- ✅ Delete button purpose is clear

##### 4. Button Announcement

**Navigate through action buttons**

**Expected Announcements:**

```
"Scan barcode to add food, button"
"Search food database to add food, button"
"Manually enter food details, button"
```

**Pass Criteria:**

- ✅ Button role announced
- ✅ Purpose clearly described
- ✅ State announced if applicable (expanded/collapsed)

##### 5. Form Input Announcement

**Navigate to date picker**

**Expected Announcement:**

```
"Date. Edit text. 2026-05-02"
"Select a date to view or add food logs"
```

**Pass Criteria:**

- ✅ Label announced
- ✅ Input type announced
- ✅ Current value announced
- ✅ Help text announced

##### 6. Alert/Status Announcement

**Add a food item (triggers status update)**

**Expected Behavior:**

- Live region announces update: "8 items logged today"

**Pass Criteria:**

- ✅ Status updates announced automatically
- ✅ Not intrusive (uses aria-live="polite")
- ✅ Provides meaningful information

##### 7. Meal Suggestions Announcement

**Navigate to meal suggestions section**

**Expected Announcements:**

```
"Meal suggestions, region"
"Meal Suggestions, heading level 2"
"You have plenty of syns remaining! Here are some ideas, alert"
"Meal suggestions list"
"Chicken Salad, 0 syns. Speed food. Grilled chicken with mixed leaves, button"
```

**Pass Criteria:**

- ✅ Section identified as region
- ✅ Alert level announced
- ✅ List structure clear
- ✅ Each suggestion provides full context

### TalkBack Testing (Android)

#### Enable TalkBack

Settings → Accessibility → TalkBack → Turn on

#### TalkBack Gestures

- **Navigate:** Swipe right (next), swipe left (previous)
- **Activate:** Double-tap
- **Context Menu:** Swipe up then right
- **Read from Top:** Swipe down then right

#### Test Cases

Same test cases as VoiceOver, but verify:

- ✅ Gestures work smoothly
- ✅ Announcements are clear
- ✅ Headings are navigable
- ✅ Lists are properly identified
- ✅ Buttons describe their purpose

### NVDA Testing (Windows)

#### Enable NVDA

Download from https://www.nvaccess.org/ and run

#### NVDA Commands

- **Start/Stop:** `Ctrl + Alt + N`
- **Next Element:** `Down Arrow`
- **Previous Element:** `Up Arrow`
- **Next Heading:** `H`
- **Next Button:** `B`
- **Next Form Field:** `F`
- **Next List:** `L`

#### Test Cases

Run all VoiceOver test cases with NVDA, verifying:

- ✅ All elements announced correctly
- ✅ Navigation shortcuts work (H for headings, B for buttons)
- ✅ Forms mode activates for inputs
- ✅ ARIA labels read correctly

---

## Visual Accessibility Testing

### Pattern Visibility Test

**Objective:** Verify patterns are visible for colorblind users

#### Test Procedure

1. **Install Colorblind Simulator:**
   - Chrome: "Colorblindly" extension
   - Firefox: Developer Tools → Accessibility → Simulate

2. **Test Each Pattern:**

| Pattern                | Location         | Protanopia | Deuteranopia | Tritanopia | Achromatopsia |
| ---------------------- | ---------------- | ---------- | ------------ | ---------- | ------------- |
| Green diagonal stripes | Free food badges | ☐ Visible  | ☐ Visible    | ☐ Visible  | ☐ Visible     |
| Yellow dots            | Warning badges   | ☐ Visible  | ☐ Visible    | ☐ Visible  | ☐ Visible     |
| Red cross-hatch        | Danger badges    | ☐ Visible  | ☐ Visible    | ☐ Visible  | ☐ Visible     |
| Blue horizontal lines  | Info alerts      | ☐ Visible  | ☐ Visible    | ☐ Visible  | ☐ Visible     |

**Pass Criteria:**

- ✅ All patterns visible in all colorblind modes
- ✅ Patterns distinguishable from each other
- ✅ Text remains readable over patterns

### High-Contrast Mode Test

**Windows High Contrast:**

1. Enable: `Left Alt + Left Shift + Print Screen`
2. Navigate through SW Logs
3. Check all elements

**Expected Behavior:**

- Text becomes bolder (700 weight)
- Borders become thicker (3px)
- Shadows become stronger
- Focus indicators more visible

**Pass Criteria:**

- ✅ All text readable
- ✅ All borders visible
- ✅ Focus indicators prominent
- ✅ No content hidden

### Zoom Test

**Test at Multiple Zoom Levels:**

- 100% (baseline)
- 125%
- 150%
- 200%
- 400%

**Steps:**

1. Zoom browser: `Ctrl + Plus` (Windows) or `Cmd + Plus` (Mac)
2. Navigate through page
3. Verify layout adapts

**Pass Criteria:**

- ✅ No horizontal scrolling at 200% zoom
- ✅ Text reflows appropriately
- ✅ No overlapping elements
- ✅ All functionality accessible
- ✅ Touch targets remain adequate

---

## Touch Target Validation

### Measurement Tool Setup

**Chrome DevTools Method:**

1. Open DevTools (F12)
2. Click "Select Element" (Ctrl+Shift+C)
3. Hover over element
4. Check dimensions in tooltip

### Test Procedure

Measure each interactive element:

| Element                 | Expected Size   | Actual Size | Pass/Fail |
| ----------------------- | --------------- | ----------- | --------- |
| Scan Barcode button     | ≥44×44px        | ***×***px   | ☐         |
| Search button           | ≥44×44px        | ***×***px   | ☐         |
| Manual Entry button     | ≥44×44px        | ***×***px   | ☐         |
| Delete button           | ≥44×44px        | ***×***px   | ☐         |
| SP Day Info button      | ≥44×44px        | ***×***px   | ☐         |
| Category filter buttons | ≥44×44px        | ***×***px   | ☐         |
| Meal suggestion cards   | ≥44×44px        | ***×***px   | ☐         |
| Date picker input       | ≥44×44px height | ***×***px   | ☐         |

**Pass Criteria:**

- ✅ All interactive elements ≥44×44px
- ✅ Adequate spacing between targets (≥8px)
- ✅ Touch targets don't overlap

### Mobile Touch Test

**Physical Device Test:**

1. Open app on actual mobile device
2. Tap each button with finger
3. Note any missed taps or wrong targets

**Pass Criteria:**

- ✅ All buttons easy to tap
- ✅ No accidental activations
- ✅ Can use with thumb one-handed

---

## Color Contrast Validation

### Tools

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Inspect element → Styles → Color picker shows contrast ratio

### WCAG Requirements

- **Normal Text (< 24px)**: 4.5:1 minimum
- **Large Text (≥ 24px)**: 3:1 minimum
- **UI Components**: 3:1 minimum

### Elements to Test

#### Text Contrast

| Element               | Foreground | Background | Ratio    | Requirement | Pass/Fail |
| --------------------- | ---------- | ---------- | -------- | ----------- | --------- |
| Body text             | #212529    | #FFFFFF    | 16.1:1   | 4.5:1       | ☐         |
| Page heading (H1)     | #212529    | #FFFFFF    | 16.1:1   | 3:1         | ☐         |
| Section headings (H2) | #212529    | #FFFFFF    | 16.1:1   | 3:1         | ☐         |
| Button text (primary) | #FFFFFF    | #0d6efd    | \_\_\_:1 | 4.5:1       | ☐         |
| Button text (outline) | #0d6efd    | #FFFFFF    | \_\_\_:1 | 4.5:1       | ☐         |
| Badge text (success)  | #FFFFFF    | #198754    | \_\_\_:1 | 4.5:1       | ☐         |
| Badge text (warning)  | #000000    | #ffc107    | \_\_\_:1 | 4.5:1       | ☐         |
| Badge text (danger)   | #FFFFFF    | #dc3545    | \_\_\_:1 | 4.5:1       | ☐         |
| Link text             | #0d6efd    | #FFFFFF    | \_\_\_:1 | 4.5:1       | ☐         |
| Muted text            | #6c757d    | #FFFFFF    | \_\_\_:1 | 4.5:1       | ☐         |

#### UI Component Contrast

| Element           | Border/Icon Color | Background | Ratio    | Requirement | Pass/Fail |
| ----------------- | ----------------- | ---------- | -------- | ----------- | --------- |
| Button borders    | **\_**            | **\_**     | \_\_\_:1 | 3:1         | ☐         |
| Input borders     | **\_**            | **\_**     | \_\_\_:1 | 3:1         | ☐         |
| Focus indicator   | #0d6efd           | various    | \_\_\_:1 | 3:1         | ☐         |
| Progress bar fill | **\_**            | **\_**     | \_\_\_:1 | 3:1         | ☐         |
| Card borders      | #dee2e6           | #FFFFFF    | \_\_\_:1 | 3:1         | ☐         |

#### Pattern Contrast

Test pattern visibility:

| Pattern                    | Pattern Color         | Base Color | Visible? | Pass/Fail |
| -------------------------- | --------------------- | ---------- | -------- | --------- |
| Diagonal stripes (success) | rgba(255,255,255,0.2) | #198754    | **\_**   | ☐         |
| Dots (warning)             | rgba(255,255,255,0.2) | #ffc107    | **\_**   | ☐         |
| Cross-hatch (danger)       | rgba(255,255,255,0.2) | #dc3545    | **\_**   | ☐         |
| Horizontal lines (info)    | rgba(255,255,255,0.2) | #0dcaf0    | **\_**   | ☐         |

**Pass Criteria:**

- ✅ All text meets 4.5:1 ratio (or 3:1 for large text)
- ✅ All UI components meet 3:1 ratio
- ✅ Focus indicators meet 3:1 ratio against all backgrounds
- ✅ Patterns visible without relying on color alone

---

## User Preference Testing

### Reduced Motion Test

#### Enable Reduced Motion

**Windows:**

```
Settings → Ease of Access → Display → Show animations in Windows (OFF)
```

**macOS:**

```
System Preferences → Accessibility → Display → Reduce motion (ON)
```

**Browser DevTools (Chrome/Firefox):**

1. Open DevTools
2. Command Palette (Ctrl+Shift+P)
3. Type "Show Rendering"
4. Check "Emulate CSS media feature prefers-reduced-motion"

#### Test Procedure

1. Enable reduced motion
2. Navigate to SW Logs
3. Perform actions:
   - Add food item
   - Delete food item
   - Toggle SP Day info
   - Filter meal categories
   - Open/close modals

**Expected Behavior:**

- No animations play
- Transitions are instant
- State changes are immediate
- No sliding, fading, or spinning

**Pass Criteria:**

- ✅ All animations disabled
- ✅ No vestibular motion triggers
- ✅ Functionality still works
- ✅ Visual feedback still present (just instant)

### High Contrast Test

**Windows High Contrast Themes:**

1. High Contrast Black
2. High Contrast White
3. High Contrast #1
4. High Contrast #2

**Test Each Theme:**

| Element              | HC Black | HC White | HC #1 | HC #2 | Pass/Fail |
| -------------------- | -------- | -------- | ----- | ----- | --------- |
| Text readable        | ☐        | ☐        | ☐     | ☐     | ☐         |
| Borders visible      | ☐        | ☐        | ☐     | ☐     | ☐         |
| Buttons identifiable | ☐        | ☐        | ☐     | ☐     | ☐         |
| Focus indicators     | ☐        | ☐        | ☐     | ☐     | ☐         |
| Patterns visible     | ☐        | ☐        | ☐     | ☐     | ☐         |

**Pass Criteria:**

- ✅ All content visible in all themes
- ✅ Borders and focus indicators enhanced
- ✅ No content hidden or illegible
- ✅ Interactive elements identifiable

### Increased Contrast Test (macOS)

**Enable:**

```
System Preferences → Accessibility → Display → Increase contrast
```

**Pass Criteria:**

- ✅ Borders become more prominent
- ✅ Text becomes bolder
- ✅ Shadows more defined

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable

#### 1.1 Text Alternatives

- ☐ **1.1.1 Non-text Content (A):** All icons have aria-label or aria-hidden
  - Icons marked aria-hidden="true"
  - Text alternatives provided for meaningful icons
  - Decorative icons properly hidden

#### 1.3 Adaptable

- ☐ **1.3.1 Info and Relationships (A):** Semantic HTML used
  - Proper heading hierarchy (H1 → H2 → H3)
  - Lists use ul/li elements
  - Forms use label elements
  - ARIA roles supplement HTML semantics

- ☐ **1.3.2 Meaningful Sequence (A):** Reading order is logical
  - Tab order matches visual order
  - Screen reader reading order makes sense
  - Skip link allows bypassing navigation

- ☐ **1.3.3 Sensory Characteristics (A):** Not relying on shape/color/position alone
  - Icons supplement color
  - Patterns supplement color
  - Text labels always present

- ☐ **1.3.4 Orientation (AA):** Works in both orientations
  - Portrait mode functional
  - Landscape mode functional

- ☐ **1.3.5 Identify Input Purpose (AA):** Input purposes identified
  - Date input has proper type="date"
  - Autocomplete attributes where applicable

#### 1.4 Distinguishable

- ☐ **1.4.1 Use of Color (A):** Color not sole means of conveying information
  - Patterns supplement colors
  - Icons supplement colors
  - Text labels always present

- ☐ **1.4.3 Contrast (Minimum) (AA):** 4.5:1 for text, 3:1 for UI
  - All text meets 4.5:1 (normal) or 3:1 (large)
  - Focus indicators meet 3:1
  - UI components meet 3:1

- ☐ **1.4.4 Resize Text (AA):** Text can be resized to 200%
  - No loss of content at 200% zoom
  - No horizontal scrolling at 200% zoom
  - Layout adapts appropriately

- ☐ **1.4.5 Images of Text (AA):** No images of text used
  - All text is actual text, not images
  - Icons are icon fonts or SVG

- ☐ **1.4.10 Reflow (AA):** Content reflows at 320px width
  - Mobile layout functional
  - No horizontal scrolling required
  - All content accessible

- ☐ **1.4.11 Non-text Contrast (AA):** UI components have 3:1 contrast
  - Buttons borders visible
  - Form controls borders visible
  - Focus indicators visible

- ☐ **1.4.12 Text Spacing (AA):** Text can be spaced without loss
  - Line height 1.5× font size
  - Paragraph spacing 2× font size
  - Letter spacing 0.12× font size
  - Word spacing 0.16× font size

- ☐ **1.4.13 Content on Hover or Focus (AA):** Hover content is dismissible
  - Tooltips can be dismissed
  - Content doesn't obscure other content
  - Content remains visible on hover

### Operable

#### 2.1 Keyboard Accessible

- ☐ **2.1.1 Keyboard (A):** All functionality via keyboard
  - All buttons accessible
  - All forms accessible
  - All interactive elements accessible
  - No keyboard traps

- ☐ **2.1.2 No Keyboard Trap (A):** Focus not trapped
  - Can navigate forward with Tab
  - Can navigate backward with Shift+Tab
  - Modals can be closed with Escape

- ☐ **2.1.4 Character Key Shortcuts (A):** Shortcuts don't interfere
  - No single-character shortcuts
  - Or shortcuts can be turned off/remapped

#### 2.2 Enough Time

- ☐ **2.2.1 Timing Adjustable (A):** No time limits or adjustable
  - No session timeouts during data entry
  - Or user can extend/disable timeout

- ☐ **2.2.2 Pause, Stop, Hide (A):** Moving content can be paused
  - No auto-playing content
  - Or can be paused/stopped

#### 2.3 Seizures and Physical Reactions

- ☐ **2.3.1 Three Flashes or Below Threshold (A):** No flashing content
  - No content flashes more than 3× per second
  - Or flashes are below threshold

#### 2.4 Navigable

- ☐ **2.4.1 Bypass Blocks (A):** Skip navigation mechanism
  - Skip to content link present
  - Works correctly

- ☐ **2.4.2 Page Titled (A):** Page has descriptive title
  - Page title is "SW Logs"
  - Title is meaningful

- ☐ **2.4.3 Focus Order (A):** Focus order is logical
  - Tab order matches visual order
  - No unexpected focus jumps

- ☐ **2.4.4 Link Purpose (In Context) (A):** Link purpose clear
  - All links have descriptive text
  - Or aria-label provides context

- ☐ **2.4.5 Multiple Ways (AA):** Multiple ways to find pages
  - Navigation menu
  - Direct URL access

- ☐ **2.4.6 Headings and Labels (AA):** Descriptive headings/labels
  - All headings are descriptive
  - All form labels are clear

- ☐ **2.4.7 Focus Visible (AA):** Focus indicator always visible
  - 3px outline on all focused elements
  - High contrast
  - Never obscured

#### 2.5 Input Modalities

- ☐ **2.5.1 Pointer Gestures (A):** No complex gestures required
  - All functions single-click/tap
  - No multi-finger gestures

- ☐ **2.5.2 Pointer Cancellation (A):** Activation on up-event
  - Buttons activate on click release
  - Can cancel by moving away

- ☐ **2.5.3 Label in Name (A):** Visible label matches accessible name
  - Button text matches aria-label
  - Or aria-label includes button text

- ☐ **2.5.4 Motion Actuation (A):** No motion-based input required
  - No shake to undo
  - Or alternative input method available

### Understandable

#### 3.1 Readable

- ☐ **3.1.1 Language of Page (A):** Page language identified
  - html lang="en" attribute set

- ☐ **3.1.2 Language of Parts (AA):** Language changes marked
  - Foreign language terms marked
  - Or all content in same language

#### 3.2 Predictable

- ☐ **3.2.1 On Focus (A):** Focus doesn't trigger context change
  - No automatic navigation on focus
  - No automatic form submission

- ☐ **3.2.2 On Input (A):** Input doesn't trigger unexpected change
  - No automatic form submission
  - Or user warned beforehand

- ☐ **3.2.3 Consistent Navigation (AA):** Navigation is consistent
  - Navigation menu consistent across pages
  - Same order on all pages

- ☐ **3.2.4 Consistent Identification (AA):** Components identified consistently
  - Same icons for same functions
  - Same labels for same functions

#### 3.3 Input Assistance

- ☐ **3.3.1 Error Identification (A):** Errors identified clearly
  - Form validation messages clear
  - Error location identified

- ☐ **3.3.2 Labels or Instructions (A):** Labels provided
  - All form inputs have labels
  - Required fields marked

- ☐ **3.3.3 Error Suggestion (AA):** Suggestions provided for errors
  - Validation suggests corrections
  - Examples provided

- ☐ **3.3.4 Error Prevention (Legal, Financial, Data) (AA):** Confirmations for important actions
  - Delete confirmations
  - Or actions are reversible

### Robust

#### 4.1 Compatible

- ☐ **4.1.1 Parsing (A):** HTML is valid
  - No duplicate IDs
  - Elements properly nested
  - All tags closed

- ☐ **4.1.2 Name, Role, Value (A):** ARIA used correctly
  - All custom components have roles
  - States announced correctly
  - Values announced correctly

- ☐ **4.1.3 Status Messages (AA):** Status messages identified
  - aria-live regions used
  - Polite announcements
  - Updates announced automatically

---

## Testing Report Template

### Test Session Information

**Date:** ******\_\_\_******  
**Tester:** ******\_\_\_******  
**Environment:**

- OS: ******\_\_\_******
- Browser: ******\_\_\_******
- Screen Reader: ******\_\_\_******
- Assistive Tech: ******\_\_\_******

### Summary

**Overall WCAG Level:** ☐ A ☐ AA ☐ AAA ☐ Non-compliant

**Severity Breakdown:**

- Critical Issues: \_\_\_
- Major Issues: \_\_\_
- Minor Issues: \_\_\_
- Suggestions: \_\_\_

### Test Results

#### Keyboard Accessibility

- **Status:** ☐ Pass ☐ Fail ☐ Partial
- **Issues Found:** \_\_\_
- **Notes:**

#### Screen Reader Compatibility

- **Status:** ☐ Pass ☐ Fail ☐ Partial
- **Issues Found:** \_\_\_
- **Notes:**

#### Visual Accessibility

- **Status:** ☐ Pass ☐ Fail ☐ Partial
- **Issues Found:** \_\_\_
- **Notes:**

#### Touch Targets

- **Status:** ☐ Pass ☐ Fail ☐ Partial
- **Issues Found:** \_\_\_
- **Notes:**

#### Color Contrast

- **Status:** ☐ Pass ☐ Fail ☐ Partial
- **Issues Found:** \_\_\_
- **Notes:**

#### User Preferences

- **Status:** ☐ Pass ☐ Fail ☐ Partial
- **Issues Found:** \_\_\_
- **Notes:**

### Issues Log

#### Issue #1

- **Severity:** ☐ Critical ☐ Major ☐ Minor ☐ Suggestion
- **WCAG Criterion:** ******\_\_\_******
- **Description:**
- **Location:**
- **Steps to Reproduce:**
- **Suggested Fix:**
- **Screenshot/Video:**

#### Issue #2

- **Severity:** ☐ Critical ☐ Major ☐ Minor ☐ Suggestion
- **WCAG Criterion:** ******\_\_\_******
- **Description:**
- **Location:**
- **Steps to Reproduce:**
- **Suggested Fix:**
- **Screenshot/Video:**

_(Continue for all issues)_

### Recommendations

1. **Priority 1 (Fix Immediately):**
   -

2. **Priority 2 (Fix Soon):**
   -

3. **Priority 3 (Nice to Have):**
   -

### Compliance Statement

**This application:**

- ☐ Fully complies with WCAG 2.1 Level AA
- ☐ Substantially complies with WCAG 2.1 Level AA
- ☐ Partially complies with WCAG 2.1 Level AA
- ☐ Does not comply with WCAG 2.1 Level AA

**Known Limitations:**

-

**Contact Information:**
For accessibility support, contact: ******\_\_\_******

---

## Quick Test Checklist

Use this for rapid validation:

### 5-Minute Smoke Test

- ☐ Can you Tab through all interactive elements?
- ☐ Is there a visible focus indicator?
- ☐ Does the skip link work?
- ☐ Can you activate buttons with Enter/Space?
- ☐ Are all images/icons labeled or hidden?
- ☐ Can you read all text at 200% zoom?
- ☐ Do patterns show without color?
- ☐ Does screen reader announce page title?
- ☐ Are form labels present and clear?
- ☐ Can you close modals with Escape?

**If any ☐ is unchecked, deeper testing required.**

---

## Automated Testing Tools

### axe DevTools

1. Install Chrome/Firefox extension
2. Open DevTools → axe DevTools tab
3. Click "Scan ALL of my page"
4. Review issues

### Lighthouse

1. Open Chrome DevTools
2. Lighthouse tab
3. Check "Accessibility"
4. Run report

### WAVE

1. Install browser extension
2. Click WAVE icon
3. Review errors/warnings

**Note:** Automated tools catch ~30% of issues. Manual testing is essential!

---

## Next Steps After Testing

1. **Document all issues** in Issues Log
2. **Prioritize fixes** by severity
3. **Create tickets** for development team
4. **Retest after fixes**
5. **Update compliance statement**
6. **Publish accessibility statement** on website

---

**Remember:** Accessibility is not a checkbox—it's an ongoing commitment to inclusive design. Test early, test often, and involve users with disabilities in your testing process when possible.
