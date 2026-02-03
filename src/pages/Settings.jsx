import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { defaultSettingsService } from "../services/settingsService";

/**
 * Settings Page - Refactored for Testability
 *
 * Key improvements:
 * - Uses custom hook for business logic
 * - Dependency injection for database service
 * - Separated concerns (UI vs logic)
 * - Better error handling and validation
 * - Loading and saving states
 */
function Settings() {
  const [saved, setSaved] = useState(false);

  // Inject database service through custom hook
  const {
    settings,
    loading,
    saving,
    error,
    validationErrors,
    saveSettings,
    resetSettings,
    updateSetting,
  } = useSettings(defaultSettingsService);

  const handleSave = async () => {
    const result = await saveSettings(settings);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = async () => {
    const result = await resetSettings();

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleChange = (key, value) => {
    updateSetting(key, value);
  };

  const handleIncrement = (key, amount = 15) => {
    const currentValue = settings[key];
    const newValue = Math.min(300, currentValue + amount);
    updateSetting(key, newValue);
  };

  const handleDecrement = (key, amount = 15) => {
    const currentValue = settings[key];
    const newValue = Math.max(10, currentValue - amount);
    updateSetting(key, newValue);
  };

  const applyPreset = (preset) => {
    const presets = {
      quick: { shortRest: 45, defaultRest: 60, longRest: 90 },
      standard: { shortRest: 60, defaultRest: 90, longRest: 120 },
      strength: { shortRest: 90, defaultRest: 120, longRest: 180 },
    };

    const selected = presets[preset];
    if (selected) {
      Object.entries(selected).forEach(([key, value]) => {
        updateSetting(key, value);
      });
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading settings...</span>
          </div>
          <p className="text-muted mt-3">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Settings</h2>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          <strong>Validation Errors:</strong>
          <ul className="mb-0 mt-2">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="alert alert-success" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          Settings saved successfully!
        </div>
      )}

      {/* Rest Times Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-clock me-2"></i>
            Rest Timer Durations
          </h3>
        </div>
        <div className="card-body">
          <p className="text-muted small mb-4">
            Configure default rest times between sets. You can always skip or
            adjust during your workout.
          </p>

          {/* Short Rest */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              Short Rest
              <span className="text-muted fw-normal ms-2">
                (Isolation exercises)
              </span>
            </label>
            <div className="input-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleDecrement("shortRest")}
                aria-label="Decrease short rest time"
                disabled={saving}
              >
                <i className="bi bi-dash"></i>
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={settings.shortRest}
                onChange={(e) => handleChange("shortRest", e.target.value)}
                min="10"
                max="300"
                disabled={saving}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleIncrement("shortRest")}
                aria-label="Increase short rest time"
                disabled={saving}
              >
                <i className="bi bi-plus"></i>
              </button>
              <span className="input-group-text">seconds</span>
            </div>
            <small className="text-muted">Recommended: 45-60 seconds</small>
          </div>

          {/* Default Rest */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              Default Rest
              <span className="text-muted fw-normal ms-2">
                (Most exercises)
              </span>
            </label>
            <div className="input-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleDecrement("defaultRest")}
                aria-label="Decrease default rest time"
                disabled={saving}
              >
                <i className="bi bi-dash"></i>
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={settings.defaultRest}
                onChange={(e) => handleChange("defaultRest", e.target.value)}
                min="10"
                max="300"
                disabled={saving}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleIncrement("defaultRest")}
                aria-label="Increase default rest time"
                disabled={saving}
              >
                <i className="bi bi-plus"></i>
              </button>
              <span className="input-group-text">seconds</span>
            </div>
            <small className="text-muted">Recommended: 90 seconds</small>
          </div>

          {/* Long Rest */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Long Rest
              <span className="text-muted fw-normal ms-2">
                (Compound exercises)
              </span>
            </label>
            <div className="input-group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleDecrement("longRest")}
                aria-label="Decrease long rest time"
                disabled={saving}
              >
                <i className="bi bi-dash"></i>
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={settings.longRest}
                onChange={(e) => handleChange("longRest", e.target.value)}
                min="10"
                max="300"
                disabled={saving}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleIncrement("longRest")}
                aria-label="Increase long rest time"
                disabled={saving}
              >
                <i className="bi bi-plus"></i>
              </button>
              <span className="input-group-text">seconds</span>
            </div>
            <small className="text-muted">Recommended: 2-3 minutes</small>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-speedometer2 me-2"></i>
            Quick Presets
          </h3>
        </div>
        <div className="card-body">
          <div className="d-grid gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => applyPreset("quick")}
              disabled={saving}
            >
              <strong>Quick Workout</strong>
              <small className="d-block text-muted">45s / 60s / 90s</small>
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => applyPreset("standard")}
              disabled={saving}
            >
              <strong>Standard</strong>
              <small className="d-block text-muted">60s / 90s / 120s</small>
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => applyPreset("strength")}
              disabled={saving}
            >
              <strong>Strength Focus</strong>
              <small className="d-block text-muted">90s / 120s / 180s</small>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-grid gap-2 mb-4">
        <button
          className="btn btn-success btn-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Save Settings
            </>
          )}
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={handleReset}
          disabled={saving}
        >
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Reset to Defaults
        </button>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note:</strong> These rest times will be used as defaults in your
        workouts. You can always skip the rest timer during your session.
      </div>
    </div>
  );
}

export default Settings;
