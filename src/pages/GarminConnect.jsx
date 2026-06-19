import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";
import {
  getConnection,
  getAuthorizationUrl,
  syncDailySteps,
  disconnectGarmin,
  getTodaySteps,
  getRecentWeeklySummaries,
  isMockMode,
} from "../services/garminService";
import {
  formatNumber,
  getProgressPercentage,
  getProgressColor,
} from "../utils/stepCalculator";

/**
 * GarminConnect Component
 * Manages Garmin connection and displays step tracking status
 * Supports MOCK DATA mode for development without API credentials
 */
function GarminConnect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Step data
  const [todaySteps, setTodaySteps] = useState(null);
  const [weeklySummaries, setWeeklySummaries] = useState([]);

  useEffect(() => {
    if (user) {
      loadConnection();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (connection) {
      loadStepData();
    }
  }, [connection]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConnection = async () => {
    try {
      setLoading(true);
      const conn = await getConnection(user.id);
      setConnection(conn);
    } catch (err) {
      console.error("Error loading connection:", err);
      setError("Failed to load connection status");
    } finally {
      setLoading(false);
    }
  };

  const loadStepData = async () => {
    try {
      const today = await getTodaySteps(user.id);
      setTodaySteps(today);

      const summaries = await getRecentWeeklySummaries(user.id, 4);
      setWeeklySummaries(summaries);
    } catch (err) {
      console.error("Error loading step data:", err);
    }
  };

  const handleConnect = async () => {
    try {
      if (isMockMode) {
        // Mock mode - simulate connection
        setToast({
          message:
            "🔧 MOCK MODE: Simulating Garmin connection. Real OAuth will be available once API credentials are received.",
          type: "info",
        });

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Exchange mock tokens
        const { exchangeTokens } = await import("../services/garminService");
        await exchangeTokens("mock_token", "mock_verifier");

        // Reload connection
        await loadConnection();

        // Auto-sync initial data
        await handleSync();
      } else {
        // Real OAuth flow
        const authUrl = await getAuthorizationUrl();
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error("Error connecting to Garmin:", err);
      setError("Failed to connect to Garmin: " + err.message);
    }
  };

  const handleSync = async (fullResync = false) => {
    try {
      setSyncing(true);
      setError(null);

      const options = fullResync ? { after: 0, daysBack: 90 } : {};
      const result = await syncDailySteps(user.id, options);

      setToast({
        message: `✅ Sync complete! ${result.records} days processed.`,
        type: "success",
      });

      // Reload data
      await loadStepData();
    } catch (err) {
      console.error("Error syncing data:", err);
      setError("Failed to sync data: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect Garmin? All step data will be deleted.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await disconnectGarmin(user.id);
      setConnection(null);
      setTodaySteps(null);
      setWeeklySummaries([]);

      setToast({
        message: "Garmin disconnected successfully",
        type: "info",
      });
    } catch (err) {
      console.error("Error disconnecting:", err);
      setError("Failed to disconnect: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-smartwatch me-2"></i>
          Garmin Connect
        </h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/steps")}
        >
          <i className="bi bi-footprints me-2"></i>
          View Steps
        </button>
      </div>

      {/* Mock Mode Banner */}
      {isMockMode && (
        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Development Mode:</strong> Using mock data. Once you receive
          Garmin API credentials, update the environment variables to enable
          real data syncing.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close error message"
          ></button>
        </div>
      )}

      {/* Not Connected */}
      {!connection && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card text-center">
              <div className="card-body p-5">
                <i
                  className="bi bi-smartwatch text-primary"
                  style={{ fontSize: "4rem" }}
                ></i>
                <h2 className="mt-3 mb-3">Connect to Garmin</h2>
                <p className="text-muted mb-4">
                  Track your daily steps, monitor your activity, and stay
                  motivated with Garmin step tracking integration.
                </p>

                <div className="row text-start mb-4">
                  <div className="col-md-6">
                    <h5>
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Features
                    </h5>
                    <ul>
                      <li>Daily step tracking</li>
                      <li>Weekly summaries</li>
                      <li>Progress tracking</li>
                      <li>Streak monitoring</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h5>
                      <i className="bi bi-shield-check text-success me-2"></i>
                      Privacy
                    </h5>
                    <ul>
                      <li>Your data stays private</li>
                      <li>Disconnect anytime</li>
                      <li>No data sharing</li>
                      <li>Secure OAuth connection</li>
                    </ul>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleConnect}
                >
                  <i className="bi bi-link-45deg me-2"></i>
                  Connect to Garmin
                </button>

                {isMockMode && (
                  <p className="text-muted small mt-3">
                    <i className="bi bi-info-circle me-1"></i>
                    This will create a mock connection with sample data
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected */}
      {connection && (
        <div>
          {/* Connection Status Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="card-title">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Connected to Garmin
                  </h5>
                  <p className="text-muted mb-0">
                    Connected on{" "}
                    {new Date(connection.created_at).toLocaleDateString()}
                  </p>
                  {connection.last_sync && (
                    <p className="text-muted small mb-0">
                      Last synced:{" "}
                      {new Date(connection.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => handleSync(false)}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Sync New
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleDisconnect}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Steps */}
          {todaySteps && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-footprints me-2"></i>
                  Today's Steps
                </h5>
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h1 className="display-4 mb-0">
                      {formatNumber(todaySteps.total_steps)}
                    </h1>
                    <p className="text-muted">
                      of {formatNumber(todaySteps.goal_steps)} goal
                    </p>
                  </div>
                  <div className="col-md-6">
                    <div className="progress" style={{ height: "30px" }}>
                      <div
                        className={`progress-bar ${getProgressColor(todaySteps.total_steps, todaySteps.goal_steps)}`}
                        role="progressbar"
                        aria-label="Today's step progress"
                        aria-valuenow={getProgressPercentage(
                          todaySteps.total_steps,
                          todaySteps.goal_steps,
                        )}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{
                          width: `${getProgressPercentage(todaySteps.total_steps, todaySteps.goal_steps)}%`,
                        }}
                      >
                        {getProgressPercentage(
                          todaySteps.total_steps,
                          todaySteps.goal_steps,
                        )}
                        %
                      </div>
                    </div>
                    <div className="mt-2 d-flex justify-content-between text-muted small">
                      <span>
                        <i className="bi bi-rulers me-1"></i>
                        {(todaySteps.distance_meters / 1000).toFixed(2)} km
                      </span>
                      <span>
                        <i className="bi bi-fire me-1"></i>
                        {todaySteps.calories_burned} cal
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i>
                        {todaySteps.active_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Summaries */}
          {weeklySummaries.length > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-calendar-week me-2"></i>
                  Recent Weeks
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Total Steps</th>
                        <th>Daily Average</th>
                        <th>Goals Met</th>
                        <th>Best Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySummaries.map((week) => (
                        <tr key={week.week_start}>
                          <td>
                            {new Date(week.week_start).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td>{formatNumber(week.total_steps)}</td>
                          <td>{formatNumber(week.avg_daily_steps)}</td>
                          <td>
                            <span
                              className={`badge ${week.days_goal_met >= 5 ? "bg-success" : "bg-warning"}`}
                            >
                              {week.days_goal_met}/7
                            </span>
                          </td>
                          <td>
                            {formatNumber(week.best_day_steps)}
                            <br />
                            <small className="text-muted">
                              {new Date(week.best_day_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Full Resync Option */}
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-arrow-repeat me-2"></i>
                Full Resync
              </h6>
              <p className="card-text small text-muted mb-2">
                Reprocess all historical data (last 90 days). Use this if you've
                updated step goals or need to refresh all data.
              </p>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleSync(true)}
                disabled={syncing}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Full Resync
              </button>
            </div>
          </div>
        </div>
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

export default GarminConnect;
