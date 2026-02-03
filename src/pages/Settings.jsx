import { useState, useEffect } from "react";

function Settings() {
  const [saved, setSaved] = useState(false);

  // Initialize settings from localStorage
  const [settings, setSettings] = useState(() => {
    const storedSettings = localStorage.getItem("gymSettings");
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return {
      defaultRestTime: 90,
      shortRestTime: 60,
      longRestTime: 120,
    };
  });

  const handleSave = () => {
    localStorage.setItem("gymSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const handleReset = () => {
    const defaultSettings = {
      defaultRestTime: 90,
      shortRestTime: 60,
      longRestTime: 120,
    };
    setSettings(defaultSettings);
    localStorage.setItem("gymSettings", JSON.stringify(defaultSettings));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  return (
    <div className="container mt-4">
      <h2 className="h5 mb-4">Settings</h2>

      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-clock me-2"></i>
            Rest Times
          </h3>
        </div>
        <div className="card-body">
          <p className="text-muted small mb-3">
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
                onClick={() =>
                  setSettings({
                    ...settings,
                    shortRestTime: Math.max(30, settings.shortRestTime - 15),
                  })
                }
                aria-label="Decrease short rest time"
              >
                <i className="bi bi-dash"></i>
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={settings.shortRestTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shortRestTime: parseInt(e.target.value) || 60,
                  })
                }
                min="30"
                max="180"
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setSettings({
                    ...settings,
                    shortRestTime: Math.min(180, settings.shortRestTime + 15),
                  })
                }
                aria-label="Increase short rest time"
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
                onClick={() =>
                  setSettings({
                    ...settings,
                    defaultRestTime: Math.max(
                      30,
                      settings.defaultRestTime - 15,
                    ),
                  })
                }
                aria-label="Decrease default rest time"
              >
                <i className="bi bi-dash"></i>
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={settings.defaultRestTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultRestTime: parseInt(e.target.value) || 90,
                  })
                }
                min="30"
                max="180"
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setSettings({
                    ...settings,
                    defaultRestTime: Math.min(
                      180,
                      settings.defaultRestTime + 15,
                    ),
                  })
                }
                aria-label="Increase default rest time"
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
                onClick={() =>
                  setSettings({
                    ...settings,
                    longRestTime: Math.max(30, settings.longRestTime - 15),
                  })
                }
                aria-label="Decrease long rest time"
              >
                <i className="bi bi-dash"></i>
              </button>
              <input
                type="number"
                className="form-control text-center"
                value={settings.longRestTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    longRestTime: parseInt(e.target.value) || 120,
                  })
                }
                min="30"
                max="240"
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setSettings({
                    ...settings,
                    longRestTime: Math.min(240, settings.longRestTime + 15),
                  })
                }
                aria-label="Increase long rest time"
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
              onClick={() =>
                setSettings({
                  ...settings,
                  shortRestTime: 45,
                  defaultRestTime: 60,
                  longRestTime: 90,
                })
              }
            >
              <strong>Quick Workout</strong>
              <small className="d-block text-muted">45s / 60s / 90s</small>
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() =>
                setSettings({
                  ...settings,
                  shortRestTime: 60,
                  defaultRestTime: 90,
                  longRestTime: 120,
                })
              }
            >
              <strong>Standard</strong>
              <small className="d-block text-muted">60s / 90s / 120s</small>
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() =>
                setSettings({
                  ...settings,
                  shortRestTime: 90,
                  defaultRestTime: 120,
                  longRestTime: 180,
                })
              }
            >
              <strong>Strength Focus</strong>
              <small className="d-block text-muted">90s / 120s / 180s</small>
            </button>
          </div>
        </div>
      </div>

      {/* Save/Reset Buttons */}
      <div className="d-grid gap-2 mb-4">
        <button
          className="btn btn-success btn-lg btn-touch"
          onClick={handleSave}
        >
          <i className="bi bi-check-circle me-2"></i>
          Save Settings
        </button>
        <button className="btn btn-outline-secondary" onClick={handleReset}>
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Reset to Defaults
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="alert alert-success" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          Settings saved successfully!
        </div>
      )}

      {/* Info */}
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note:</strong> These rest times will be used as defaults in your
        workouts. You can always skip the rest timer during your session.
      </div>
    </div>
  );
}

export default Settings;
