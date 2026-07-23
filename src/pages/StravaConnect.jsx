import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import StravaActivityCard from "../components/StravaActivityCard";
import Toast from "../components/Toast";
import { PR_LABELS } from "../utils/prCalculator";
import {
  getConnectionStatus,
  getAllConnections,
  getAuthorizationUrl,
  disconnectStrava,
  syncActivities,
  getActivities,
  getActivityStats,
  subscribeToWebhooks,
  viewWebhookSubscriptions,
} from "../services/stravaService";

/**
 * StravaConnect Component
 * Manages Strava connection and displays activities
 * Supports multiple Strava OAuth apps (e.g., primary and secondary accounts)
 */
function StravaConnect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [allConnections, setAllConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  // Activity state
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState("30days");
  const [activityType, setActivityType] = useState("all");
  const [useMetric, setUseMetric] = useState(false);
  const [toast, setToast] = useState(null);
  const [webhookActive, setWebhookActive] = useState(() => {
    // Load cached webhook status from localStorage
    const cached = localStorage.getItem("strava_webhook_active");
    return cached === "true";
  });
  const [enablingWebhook, setEnablingWebhook] = useState(false);

  useEffect(() => {
    loadConnection();
    checkWebhookStatus();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (connection) {
      loadActivities();
    }
  }, [connection, dateRange, activityType]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkWebhookStatus = async () => {
    try {
      // Check cache first - only query API once per hour
      const cacheKey = "strava_webhook_status_checked";
      const lastChecked = localStorage.getItem(cacheKey);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      if (lastChecked && parseInt(lastChecked) > oneHourAgo) {
        console.log("⏱️ Using cached webhook status");
        return;
      }

      const subscriptions = await viewWebhookSubscriptions();
      const isActive = subscriptions && subscriptions.length > 0;
      setWebhookActive(isActive);
      localStorage.setItem("strava_webhook_active", isActive.toString());
      localStorage.setItem(cacheKey, Date.now().toString());
    } catch (err) {
      console.error("Error checking webhook status:", err);
      // If rate limited, keep using cached status
      if (err.message?.includes("Rate Limit")) {
        console.log("⚠️ Rate limited, using cached webhook status");
      }
    }
  };

  const handleEnableWebhook = async () => {
    try {
      setEnablingWebhook(true);
      setError(null);

      const webhookUrl =
        "https://huqmjtxwlybjtmouwgaz.supabase.co/functions/v1/strava-webhook";
      await subscribeToWebhooks(webhookUrl);

      setWebhookActive(true);
      localStorage.setItem("strava_webhook_active", "true");
      localStorage.setItem(
        "strava_webhook_status_checked",
        Date.now().toString(),
      );

      setToast({
        message:
          "✅ Real-time sync enabled! New activities will appear automatically.",
        type: "success",
      });
    } catch (err) {
      console.error("Error enabling webhook:", err);
      const errorMsg = err.message?.includes("Rate Limit")
        ? "Rate limit exceeded. Please wait 15 minutes and try again."
        : "Failed to enable real-time sync: " + err.message;
      setError(errorMsg);
    } finally {
      setEnablingWebhook(false);
    }
  };

  const loadConnection = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [status, connections] = await Promise.all([
        getConnectionStatus(),
        getAllConnections(),
      ]);
      setConnection(status);
      setAllConnections(connections);
      console.log("📊 Loaded connections:", connections);
    } catch (err) {
      console.error("Error loading connection:", err);
      setError("Failed to load connection status");
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!user || !connection) return;

    try {
      // Calculate date range
      const now = new Date();
      let startDate = null;

      switch (dateRange) {
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "3months":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startDate = null;
          break;
      }

      const options = {
        startDate,
        limit: 100,
      };

      if (activityType !== "all") {
        options.type = activityType;
      }

      const [activitiesData, statsData] = await Promise.all([
        getActivities(user.id, options),
        getActivityStats(user.id, options),
      ]);

      setActivities(activitiesData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Failed to load activities: " + err.message);
    }
  };

  const handleConnect = async () => {
    try {
      const authUrl = await getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error getting authorization URL:", err);
      setError("Failed to connect to Strava: " + err.message);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect Strava? This will remove all synced activities.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await disconnectStrava(user.id);
      setConnection(null);
      setSyncResult(null);
      alert("Successfully disconnected from Strava");
    } catch (err) {
      console.error("Error disconnecting:", err);
      setError("Failed to disconnect: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const result = await syncActivities(user.id);
      setSyncResult(result);

      // Show PR notifications if any were set
      if (result.newPRs && result.newPRs.length > 0) {
        const prCount = result.newPRs.length;
        const prList = result.newPRs
          .map((pr) => PR_LABELS[pr.category])
          .join(", ");
        setToast({
          message: `🎉 New Personal Record${prCount > 1 ? "s" : ""}! ${prList}`,
          type: "success",
        });
      }

      // Reload connection and activities
      await loadConnection();
      await loadActivities();
    } catch (err) {
      console.error("❌ Error syncing activities:", err);
      setError("Failed to sync activities: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleFullResync = async () => {
    if (
      !confirm(
        "This will re-fetch and re-process ALL your Strava activities. This may take a minute. Continue?",
      )
    ) {
      return;
    }
    try {
      setSyncing(true);
      setError(null);
      const result = await syncActivities(user.id, { after: 0 });
      setSyncResult(result);

      // Show PR notifications if any were set
      if (result.newPRs && result.newPRs.length > 0) {
        const prCount = result.newPRs.length;
        const prList = result.newPRs
          .map((pr) => PR_LABELS[pr.category])
          .join(", ");
        setToast({
          message: `🎉 New Personal Record${prCount > 1 ? "s" : ""}! ${prList}`,
          type: "success",
        });
      }

      // Reload connection and activities
      await loadConnection();
      await loadActivities();
    } catch (err) {
      console.error("❌ Error during full resync:", err);
      setError("Failed to resync activities: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Please log in to connect your Strava account.
        </div>
      </div>
    );
  }

  // Get available activity types for filter
  const activityTypes = [...new Set(activities.map((a) => a.type))];

  return (
    <div className="container mt-4">
      {/* Header with Control Panel */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <h2>
            <i className="bi bi-bicycle me-2"></i>
            Strava Activities
          </h2>
          {connection && (
            <small className="text-muted">
              <i className="bi bi-person me-1"></i>
              {connection.athlete_data?.firstname}{" "}
              {connection.athlete_data?.lastname}
              {connection.last_sync && (
                <>
                  {" • "}
                  <i className="bi bi-clock me-1"></i>
                  Last sync: {new Date(connection.last_sync).toLocaleString()}
                </>
              )}
            </small>
          )}
        </div>
        <div className="col-lg-4">
          {/* Control Panel */}
          <div className="card border-primary">
            <div className="card-body p-3">
              <h6 className="card-subtitle mb-2 text-primary">
                <i className="bi bi-gear me-1"></i>
                Controls
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {connection ? (
                  <>
                    {!webhookActive && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={handleEnableWebhook}
                        disabled={enablingWebhook}
                        title="Enable real-time sync"
                      >
                        {enablingWebhook ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                        ) : (
                          <>
                            <i className="bi bi-lightning-fill me-1"></i>
                            Auto-Sync
                          </>
                        )}
                      </button>
                    )}
                    {webhookActive && (
                      <span
                        className="badge bg-success text-white py-2 px-3"
                        title="Real-time sync is active"
                      >
                        <i className="bi bi-lightning-fill me-1"></i>
                        Auto-Sync Active
                      </span>
                    )}
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleSync}
                      disabled={syncing}
                      title="Sync new activities"
                    >
                      {syncing ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                      ) : (
                        <i className="bi bi-arrow-repeat"></i>
                      )}
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={handleFullResync}
                      disabled={syncing}
                      title="Full resync (all activities)"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-info text-white"
                      onClick={() => navigate("/strava/analytics")}
                      title="View analytics"
                    >
                      <i className="bi bi-graph-up-arrow"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => navigate("/strava/records")}
                      title="View personal records"
                    >
                      <i className="bi bi-trophy-fill"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleDisconnect}
                      title="Disconnect Strava"
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-primary w-100"
                    onClick={handleConnect}
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>
                    Connect to Strava
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {syncResult && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <strong>Sync Complete!</strong> {syncResult.total} activities fetched,{" "}
          {syncResult.new} new
          <button
            type="button"
            className="btn-close"
            onClick={() => setSyncResult(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Account Management Link */}
      {connection && allConnections && allConnections.length > 0 && (
        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Manage Strava Accounts:</strong> You have{" "}
          {allConnections.length} Strava account
          {allConnections.length > 1 ? "s" : ""} connected. To switch accounts,
          add new accounts, or disconnect,{" "}
          <button
            className="btn btn-link p-0 align-baseline"
            onClick={() => navigate("/settings")}
          >
            go to Settings <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      )}

      {!connection ? (
        <div className="text-center py-5">
          <i
            className="bi bi-bicycle text-muted"
            style={{ fontSize: "4rem" }}
          ></i>
          <h3 className="mt-3">Connect Your Strava Account</h3>
          <p className="text-muted">
            Sync your activities from Strava to track your progress
          </p>
        </div>
      ) : (
        <>
          {/* Filters and Stats */}
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label small">Time Range</label>
              <select
                className="form-select form-select-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Activity Type</label>
              <select
                className="form-select form-select-sm"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="all">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Units</label>
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="metricToggle"
                  checked={useMetric}
                  onChange={(e) => setUseMetric(e.target.checked)}
                />
                <label
                  className="form-check-label small"
                  htmlFor="metricToggle"
                >
                  Use Metric (km/kmh)
                </label>
              </div>
            </div>
            <div className="col-md-3">
              {stats && (
                <div className="text-end">
                  <label className="form-label small">Summary</label>
                  <div className="small text-muted">
                    {stats.count} activities •{" "}
                    {(stats.totalDistance / 1000).toFixed(0)} km
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity List */}
          {activities.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-inbox text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <p className="text-muted mt-3">
                No activities found. Try syncing or adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="row">
              {activities.map((activity) => (
                <div key={activity.id} className="col-12">
                  <StravaActivityCard
                    activity={activity}
                    useMetric={useMetric}
                    onDelete={() => loadActivities()}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default StravaConnect;
