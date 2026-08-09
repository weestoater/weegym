# Refactoring and Bug Fixes - August 9, 2026

## 🎯 Priority: Refactoring & Bug Fixes

### Phase 1: Create Reusable Components ✅ COMPLETE

Created 4 new reusable utilities to eliminate code duplication:

1. **`src/hooks/useSessionManager.js`** - Unified CRUD operations hook
   - `useSessionManager` - Load, save, update, delete with toast notifications
   - `useEditableForm` - Edit workflow management
   - `useViewToggle` - View state management (log/history)
   - `useFormFields` - Form field state with reset

2. **`src/components/StatCard.jsx`** - Stat display components
   - `StatCard` - Single stat card with icon, value, label
   - `StatCardGrid` - Responsive grid of stats
   - `InlineStat` - Compact inline stats
   - `StatBadge` - Badge-style stats
   - `ProgressStat` - Progress bar stats
   - `ComparisonStat` - Compare current vs previous

3. **`src/components/ViewToggle.jsx`** - View switching components
   - `ViewToggle` - Generic button group toggle
   - `LogHistoryToggle` - Pre-configured log/history toggle
   - `TabNav` - Tab navigation style
   - `PillNav` - Pill navigation style

4. **`src/components/ConfirmDialog.jsx`** - User-friendly confirmations
   - `ConfirmDialog` - Modal confirmation dialog
   - `useConfirmDialog` - Hook for managing dialog state
   - `useDeleteConfirm` - Pre-configured delete confirmation

### Phase 2: Identified Bugs 🐛

#### Bug #1: Poor Error Handling in CalorieTracker Barcode Scanner

**Location:** `src/pages/CalorieTracker.jsx` line ~121

**Issue:**

```javascript
catch (error) {
  alert("Product not found. Please try manual entry or search by name.");
}
```

**Problems:**

- Uses browser `alert()` which is not user-friendly
- Blocks UI interaction
- Doesn't provide retry option
- Generic error message regardless of actual error
- Inconsistent with rest of app (uses Toast elsewhere)

**Fix:**

- Replace `alert()` with Toast component
- Use `formatErrorMessage` from errorUtils
- Provide specific guidance based on error type
- Add "Try Again" button
- Show barcode that failed for reference

#### Bug #2: Unused userId Parameter in Strava Token Refresh

**Location:** `src/services/stravaService.js` line ~529

**Issue:**

```javascript
async function getValidAccessToken(userId, appName = null) {
  const connection = await getConnectionStatus(appName);
  // userId parameter is received but never used!
}
```

**Problems:**

- `getValidAccessToken` receives `userId` but doesn't use it
- `getConnectionStatus` internally fetches userId from session
- Could cause issues if userId doesn't match current session
- Misleading function signature

**Fix:** Two options:

1. Remove userId parameter (if always using current session)
2. Pass userId to getConnectionStatus and modify query

**Recommendation:** Option 1 - Remove parameter since all callers use current session

#### Bug #3: Search Error Uses alert() in CalorieTracker

**Location:** `src/pages/CalorieTracker.jsx` line ~144

**Issue:**

```javascript
catch (error) {
  alert(`Search failed: ${error.message}. Please check...`);
}
```

**Same problems as Bug #1**

**Fix:** Replace with Toast

### Phase 3: Apply Refactoring to CardioTracker 🔧

**Before:** ~500 lines with duplicated patterns

**After:** ~350 lines using reusable hooks

**Changes:**

1. Replace manual CRUD with `useSessionManager` hook
2. Replace view toggle buttons with `LogHistoryToggle` component
3. Replace `window.confirm()` with `useConfirmDialog` hook
4. Extract form state management to `useFormFields`
5. Reduce code duplication by ~30%

**Benefits:**

- ✅ Less code to maintain
- ✅ Consistent patterns across pages
- ✅ Better error handling with retry
- ✅ User-friendly confirmations
- ✅ Easier to test

### Phase 4: Apply Same Refactoring to ActiveWellbeing

ActiveWellbeing has nearly identical patterns, so refactoring will be quick:

- Same hooks: `useSessionManager`, `useEditableForm`, `useViewToggle`
- Same components: `LogHistoryToggle`, `useConfirmDialog`
- Similar form management patterns

### Phase 5: Fix All alert() Usages

**Search Results:**

```
src/pages/CalorieTracker.jsx:
  - Line 121: Barcode error alert
  - Line 144: Search error alert
  - Line 221: Delete confirmation (should use ConfirmDialog)
```

**Fix All:**

- Replace alerts with Toast for errors
- Replace confirms with ConfirmDialog
- Use ErrorAlert for recoverable errors with retry

### Phase 6: Dashboard StatCard Refactoring (Optional)

Replace custom stat cards in Dashboard with reusable `StatCard` components:

**Before:**

```jsx
<div className="col-6 col-md-3">
  <div className="card">
    <div className="card-body text-center">
      <i className="bi bi-trophy text-warning fs-1 mb-2"></i>
      <h3 className="mb-0">{completedWorkouts}</h3>
      <p className="text-muted mb-0 small">Completed Workouts</p>
    </div>
  </div>
</div>
```

**After:**

```jsx
<StatCard
  icon="bi-trophy"
  value={completedWorkouts}
  label="Completed Workouts"
  color="warning"
/>
```

## Implementation Order

1. ✅ Create reusable hooks and components (COMPLETE)
2. 🔄 Fix Bug #1 & #3 (alert → Toast in CalorieTracker)
3. 🔄 Refactor CardioTracker to use new hooks/components
4. 🔄 Refactor ActiveWellbeing to use new hooks/components
5. ⏳ Fix Bug #2 (Strava token refresh userId)
6. ⏳ Refactor Dashboard stat cards (optional)
7. ⏳ Apply to other pages as needed

## Metrics

### Code Reduction Estimate

- CardioTracker: 500 → 350 lines (-30%)
- ActiveWellbeing: 550 → 380 lines (-31%)
- Total reduction: ~320 lines of duplicate code removed

### Reusability

- 4 new hooks used across 2+ pages
- 10+ new components used across 3+ pages
- Consistent patterns reduce cognitive load

### Maintainability

- Bug fixes in one place update all pages
- New features easier to add
- Testing is simpler with isolated hooks

## Next Steps

1. Test refactored CardioTracker thoroughly
2. Apply learnings to ActiveWellbeing
3. Create unit tests for new hooks
4. Document new patterns in codebase guide
5. Monitor for regressions

---

## Testing Checklist

- [ ] CardioTracker CRUD operations work
- [ ] Edit workflow works correctly
- [ ] Delete confirmation shows proper dialog
- [ ] Toast notifications appear for all actions
- [ ] View toggle switches correctly
- [ ] CalorieTracker barcode errors show Toast
- [ ] All pages have no console errors
- [ ] Accessibility maintained (keyboard navigation)
