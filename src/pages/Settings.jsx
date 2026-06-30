import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";
import { defaultSettingsService } from "../services/settingsService";
import { useAuth } from "../contexts/AuthContext";
import {
  getConnectionStatus,
  getAllConnections,
  getAvailableApps,
  getAuthorizationUrl,
  disconnectStrava,
  switchActiveConnection,
} from "../services/stravaService";
import Toast from "../components/Toast";

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Strava connection state
  const [stravaConnection, setStravaConnection] = useState(null);
  const [allConnections, setAllConnections] = useState([]);
  const [availableApps, setAvailableApps] = useState([]);
  const [stravaLoading, setStravaLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  // Load Strava connections on mount
  useEffect(() => {
    if (user) {
      loadStravaConnections();
    }
  }, [user]);

  const loadStravaConnections = async () => {
    try {
      setStravaLoading(true);
      const [status, connections, apps] = await Promise.all([
        getConnectionStatus(),
        getAllConnections(),
        Promise.resolve(getAvailableApps()),
      ]);
      setStravaConnection(status);
      setAllConnections(connections);
      setAvailableApps(apps);
    } catch (err) {
      console.error("Error loading Strava connections:", err);
    } finally {
      setStravaLoading(false);
    }
  };

  const handleStravaConnect = (appName = "primary") => {
    const authUrl = getAuthorizationUrl(appName);
    window.location.href = authUrl;
  };

  const handleStravaSwitch = async (appName) => {
    try {
      setStravaLoading(true);
      await switchActiveConnection(appName);
      await loadStravaConnections();
      setToast({
        message: `✅ Switched to ${appName} account`,
        type: "success",
      });
    } catch (err) {
      console.error("Error switching connection:", err);
      setToast({
        message: "Failed to switch connection: " + err.message,
        type: "error",
      });
    } finally {
      setStravaLoading(false);
    }
  };

  const handleStravaDisconnect = async (appName) => {
    if (
      !window.confirm(
        `Disconnect ${appName} account? This will remove all activities from this account.`,
      )
    ) {
      return;
    }

    try {
      setStravaLoading(true);
      await disconnectStrava(user.id, appName);
      await loadStravaConnections();
      setToast({
        message: `${appName} account disconnected`,
        type: "success",
      });
    } catch (err) {
      console.error("Error disconnecting:", err);
      setToast({
        message: "Failed to disconnect: " + err.message,
        type: "error",
      });
    } finally {
      setStravaLoading(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
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

      {/* Account Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-person-circle me-2"></i>
            Account
          </h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="mb-1">
                <strong>{user?.user_metadata?.name || "User"}</strong>
              </p>
              <p className="text-muted small mb-0">{user?.email}</p>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => navigate("/profile-manager")}
            >
              <i className="bi bi-person-gear me-1"></i>
              Manage Profile
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Connected Services Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-plug me-2"></i>
            Connected Services
          </h3>
        </div>
        <div className="card-body">
          {stravaLoading ? (
            <div className="text-center py-3">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <h6 className="text-muted mb-3">
                <i className="bi bi-bicycle me-1"></i>
                Strava
              </h6>

              {allConnections && allConnections.length > 0 ? (
                <>
                  <div className="list-group mb-3">
                    {allConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className={`list-group-item ${
                          conn.is_active ? "list-group-item-primary" : ""
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>
                              {conn.app_name === "primary"
                                ? "🔵 Primary Account"
                                : "🟢 Secondary Account"}
                            </strong>
                            {conn.is_active && (
                              <span className="badge bg-success ms-2">
                                Active
                              </span>
                            )}
                            <div className="small text-muted">
                              {conn.athlete_data?.firstname}{" "}
                              {conn.athlete_data?.lastname}
                              {" • "}
                              Connected{" "}
                              {new Date(conn.connected_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="btn-group">
                            {!conn.is_active && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleStravaSwitch(conn.app_name)
                                }
                                disabled={stravaLoading}
                                title="Switch to this account"
                              >
                                Switch
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleStravaDisconnect(conn.app_name)
                              }
                              disabled={stravaLoading}
                              title="Disconnect this account"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Another Account */}
                  {availableApps &&
                    availableApps.length > allConnections.length && (
                      <div className="d-grid gap-2">
                        {availableApps
                          .filter(
                            (app) =>
                              !allConnections.find(
                                (c) => c.app_name === app.name,
                              ),
                          )
                          .map((app) => (
                            <button
                              key={app.name}
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleStravaConnect(app.name)}
                              disabled={stravaLoading}
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Connect {app.label}
                            </button>
                          ))}
                      </div>
                    )}
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-2">
                    No Strava accounts connected
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStravaConnect("primary")}
                    disabled={stravaLoading}
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>
                    Connect Strava Account
                  </button>
                </div>
              )}

              <div className="mt-3">
                <button
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => navigate("/strava")}
                >
                  <i className="bi bi-bicycle me-1"></i>
                  View Strava Activities
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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
