# Active Wellbeing Machines Configuration

## Overview

This document describes how to configure the list of machines available in the Active Wellbeing feature of WeeGym.

## Configuration Location

The machines are configured in the `ActiveWellbeing` component:

- **File**: `src/pages/ActiveWellbeing.jsx`
- **Lines**: 4-17 (approximately)

## Configuration Structure

The configuration uses an efficient, DRY approach where training modes are defined once and shared across all machines:

```javascript
const availableModes = ["Cardio", "Strength", "Stamina"];

const machineNames = [
  "Cross cycle",
  "Chest & Legs",
  // ... more machines
];

// Machines array is built dynamically
const machines = machineNames.map((name) => ({ name, modes: availableModes }));
```

### Available Modes

The application currently supports three training modes:

- **Cardio** - Cardiovascular training (Red badge with heart-pulse icon)
- **Strength** - Strength training (Blue badge with lightning icon)
- **Stamina** - Stamina/endurance training (Green badge with speedometer icon)

These modes are defined in the `availableModes` array and automatically applied to all machines.

## Current Configuration

As of the current version, the following machines are configured:

```javascript
const availableModes = ["Cardio", "Strength", "Stamina"];

const machineNames = [
  "Cross cycle",
  "Chest & Legs",
  "Seated Climber",
  "Tricep dip & leg curl",
  "AB pullover",
  "Flys & Thighs",
  "Side bend stepper",
];

const machines = machineNames.map((name) => ({ name, modes: availableModes }));
```

## How to Add New Machines

Since all machines share the same training modes, adding new machines is simple:

1. Open `src/pages/ActiveWellbeing.jsx`
2. Locate the `machineNames` array (around line 6)
3. Add the new machine name as a string to the array
4. Save the file

### Example: Adding New Machines

To add "Rowing Machine" and "Leg Press", simply update the `machineNames` array:

```javascript
const machineNames = [
  "Cross cycle",
  "Chest & Legs",
  "Seated Climber",
  "Tricep dip & leg curl",
  "AB pullover",
  "Flys & Thighs",
  "Side bend stepper",
  "Rowing Machine", // ← New machine
  "Leg Press", // ← New machine
];
```

That's it! The machine will automatically have all available modes assigned to it.

## Advanced Configuration

### Changing Available Modes for All Machines

To modify the training modes available to all machines, update the `availableModes` array:

```javascript
// Add a new mode for all machines
const availableModes = ["Cardio", "Strength", "Stamina", "Recovery"];

// Or reduce modes
const availableModes = ["Cardio", "Strength"];
```

### Customizing Modes for Specific Machines

If you need a specific machine to have different modes, you can manually modify it after the array is built:

```javascript
const machines = machineNames.map((name) => ({ name, modes: availableModes }));

// Override modes for a specific machine
const rowingMachineIndex = machines.findIndex(
  (m) => m.name === "Rowing Machine",
);
if (rowingMachineIndex !== -1) {
  machines[rowingMachineIndex].modes = ["Cardio", "Stamina"];
}
```

Or add a machine manually:

```javascript
machines.push({ name: "Bench Press", modes: ["Strength"] });
```

## Important Notes

- **Order**: Machines appear in the dropdown in the order they are listed in the array
- **Client-side only**: This configuration is stored in the component code, not in a database
- **No restart needed**: Changes take effect on the next page reload (Vite hot-reload applies during development)
- **Case-sensitive**: Mode names must match exactly: "Cardio", "Strength", "Stamina"
- **Existing data**: Adding or removing machines doesn't affect previously logged sessions in localStorage

## Data Storage

Session data for Active Wellbeing is stored in the browser's localStorage under the key `activeWellbeingSessions`. Each session records:

- Machine name
- Training mode
- Score
- Date
- Timestamp

Historical data remains intact when machines are added or removed from the configuration.
