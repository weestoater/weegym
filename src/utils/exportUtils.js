/**
 * Export Utilities
 * Functions for exporting data to CSV and other formats
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Array of column definitions { key, label }
 * @returns {string} CSV string
 */
export function arrayToCSV(data, columns) {
  if (!data || data.length === 0) {
    return "";
  }

  // Header row
  const headers = columns.map((col) => col.label || col.key).join(",");

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let value = row[col.key];

        // Handle nested properties (e.g., 'user.name')
        if (col.key.includes(".")) {
          const keys = col.key.split(".");
          value = keys.reduce((obj, key) => obj?.[key], row);
        }

        // Apply custom formatter if provided
        if (col.format && value !== null && value !== undefined) {
          value = col.format(value);
        }

        // Handle null/undefined
        if (value === null || value === undefined) {
          return "";
        }

        // Escape and quote if needed
        value = String(value);
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Download CSV file
 * @param {string} csv - CSV content
 * @param {string} filename - File name (without .csv extension)
 */
export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date for CSV export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateForCSV(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Format duration in seconds to HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format distance in meters to km
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance in km
 */
export function formatDistance(meters) {
  if (!meters) return "0";
  return (meters / 1000).toFixed(2);
}

/**
 * Export Strava activities to CSV
 * @param {Array} activities - Array of Strava activities
 */
export function exportStravaActivities(activities) {
  const columns = [
    { key: "start_date", label: "Date", format: formatDateForCSV },
    { key: "name", label: "Activity Name" },
    { key: "type", label: "Type" },
    { key: "distance", label: "Distance (km)", format: formatDistance },
    { key: "moving_time", label: "Duration", format: formatDuration },
    { key: "elapsed_time", label: "Elapsed Time", format: formatDuration },
    { key: "total_elevation_gain", label: "Elevation Gain (m)" },
    { key: "average_speed", label: "Avg Speed (m/s)" },
    { key: "max_speed", label: "Max Speed (m/s)" },
    { key: "average_heartrate", label: "Avg Heart Rate" },
    { key: "max_heartrate", label: "Max Heart Rate" },
    { key: "calories", label: "Calories" },
    { key: "kilojoules", label: "Kilojoules" },
    { key: "average_cadence", label: "Avg Cadence" },
    { key: "average_watts", label: "Avg Power (W)" },
  ];

  const csv = arrayToCSV(activities, columns);
  const filename = `strava-activities-${new Date().toISOString().split("T")[0]}`;
  downloadCSV(csv, filename);
}

/**
 * Export workout logs to CSV
 * @param {Array} workouts - Array of workouts
 */
export function exportWorkouts(workouts) {
  // Flatten workout exercises into rows
  const rows = [];
  workouts.forEach((workout) => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach((exercise) => {
        rows.push({
          workoutDate: workout.date,
          workoutName: workout.name,
          duration: workout.duration,
          exerciseName: exercise.exerciseName || exercise.name,
          set: exercise.set,
          weight: exercise.weight,
          reps: exercise.reps,
        });
      });
    }
  });

  const columns = [
    { key: "workoutDate", label: "Workout Date", format: formatDateForCSV },
    { key: "workoutName", label: "Workout Name" },
    { key: "duration", label: "Duration (min)" },
    { key: "exerciseName", label: "Exercise" },
    { key: "set", label: "Set" },
    { key: "weight", label: "Weight (kg)" },
    { key: "reps", label: "Reps" },
  ];

  const csv = arrayToCSV(rows, columns);
  const filename = `workout-logs-${new Date().toISOString().split("T")[0]}`;
  downloadCSV(csv, filename);
}

/**
 * Export cardio sessions to CSV
 * @param {Array} sessions - Array of cardio sessions
 */
export function exportCardioSessions(sessions) {
  const columns = [
    { key: "date", label: "Date", format: formatDateForCSV },
    { key: "equipment_type", label: "Equipment" },
    { key: "duration_minutes", label: "Duration (min)" },
    { key: "distance_km", label: "Distance (km)" },
    { key: "calories", label: "Calories" },
    { key: "avg_heart_rate", label: "Avg Heart Rate" },
    { key: "notes", label: "Notes" },
  ];

  const csv = arrayToCSV(sessions, columns);
  const filename = `cardio-sessions-${new Date().toISOString().split("T")[0]}`;
  downloadCSV(csv, filename);
}

/**
 * Export Active Wellbeing sessions to CSV
 * @param {Array} sessions - Array of wellbeing sessions
 */
export function exportWellbeingSessions(sessions) {
  const columns = [
    { key: "date", label: "Date", format: formatDateForCSV },
    { key: "machine", label: "Machine" },
    { key: "mode", label: "Mode" },
    { key: "score", label: "Score" },
  ];

  const csv = arrayToCSV(sessions, columns);
  const filename = `wellbeing-sessions-${new Date().toISOString().split("T")[0]}`;
  downloadCSV(csv, filename);
}

/**
 * Export Slimming World syns to CSV
 * @param {Array} meals - Array of meals/syns
 */
export function exportSlimmingWorldData(meals) {
  const columns = [
    {
      key: "date",
      label: "Date",
      format: (d) => new Date(d).toISOString().split("T")[0],
    },
    { key: "meal", label: "Meal" },
    { key: "food", label: "Food" },
    { key: "syns", label: "Syns" },
    { key: "calories", label: "Calories" },
    { key: "protein", label: "Protein (g)" },
    { key: "carbs", label: "Carbs (g)" },
    { key: "fat", label: "Fat (g)" },
  ];

  const csv = arrayToCSV(meals, columns);
  const filename = `slimming-world-${new Date().toISOString().split("T")[0]}`;
  downloadCSV(csv, filename);
}
