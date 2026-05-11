import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getConnectionStatus,
  getAuthorizationUrl,
  disconnectStrava,
  syncActivities,
} from "../services/stravaService";

/**
 * StravaConnect Component
 * Manages Strava connection: connect, disconnect, sync status
 */
function StravaConnect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConnection();
  }, [user]);

  const loadConnection = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = await getConnectionStatus();
      setConnection(status);
    } catch (err) {
      console.error("Error loading connection:", err);
      setError("Failed to load connection status");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    const authUrl = getAuthorizationUrl();
    window.location.href = authUrl;
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
    console.log('🔄 Sync button clicked!');
    try {
      setSyncing(true);
      setError(null);
      console.log('🔄 Starting sync for user:', user.id);
      const result = await syncActivities(user.id);
      console.log('✅ Sync complete! Result:', result);
      setSyncResult(result);

      // Reload connection to update last_sync timestamp
      await loadConnection();
    } catch (err) {
      console.error("❌ Error syncing activities:", err);
      setError("Failed to sync activities: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleViewActivities = () => {
    navigate("/strava/activities");
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        <i className="bi bi-bicycle me-2"></i>
        Strava Integration
      </h2>

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

      {/* Connection Status Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-plug me-2"></i>
            Connection Status
          </h5>

          {connection ? (
            <>
              <div className="d-flex align-items-center mb-3">
                <i
                  className="bi bi-check-circle-fill text-success me-2"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <div>
                  <strong>Connected</strong>
                  <br />
                  <small className="text-muted">
                    Athlete: {connection.athlete_data?.firstname}{" "}
                    {connection.athlete_data?.lastname}
                  </small>
                </div>
              </div>

              {connection.last_sync && (
                <div className="mb-3">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Last synced:{" "}
                    {new Date(connection.last_sync).toLocaleString()}
                  </small>
                </div>
              )}

              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Sync Activities
                    </>
                  )}
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleViewActivities}
                >
                  <i className="bi bi-list-ul me-1"></i>
                  View Activities
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleDisconnect}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="d-flex align-items-center mb-3">
                <i
                  className="bi bi-x-circle text-muted me-2"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <div>
                  <strong>Not Connected</strong>
                  <br />
                  <small className="text-muted">
                    Connect your Strava account to sync activities
                  </small>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleConnect}>
                <i className="bi bi-box-arrow-up-right me-1"></i>
                Connect to Strava
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <strong>Sync Complete!</strong>
          <ul className="mb-0 mt-2">
            <li>Total activities fetched: {syncResult.total}</li>
            <li>New activities: {syncResult.new}</li>
            <li>Updated activities: {syncResult.updated}</li>
          </ul>
          
          {syncResult.debug && (
            <div className="mt-3 pt-3 border-top">
              <strong>Calorie Data Debug:</strong>
              <ul className="mb-0 mt-2">
                <li>✅ With Strava calories: {syncResult.debug.withCalories}</li>
                <li>⚡ With kilojoules (converted): {syncResult.debug.withKilojoules}</li>
                <li>🧮 Estimated (no Strava data): {syncResult.debug.withNoEnergy}</li>
              </ul>
              <small className="text-muted d-block mt-2">
                Note: Since Strava doesn't provide Garmin calorie data via API, we estimate
                calories based on heart rate, activity type, and duration.
              </small>
              {syncResult.debug.samples && syncResult.debug.samples.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">Sample calculations:</small>
                  <pre className="mt-1 p-2 bg-light small" style={{ fontSize: '0.75rem' }}>
                    {JSON.stringify(syncResult.debug.samples, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <button
            type="button"
            className="btn-close"
            onClick={() => setSyncResult(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Info Card */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-info-circle me-2"></i>
            About Strava Integration
          </h5>
          <p className="mb-2">
            Connect your Strava account to automatically track your activities:
          </p>
          <ul className="mb-3">
            <li>Mountain bike rides</li>
            <li>Dog walks</li>
            <li>Runs and other activities</li>
          </ul>
          <p className="text-muted small mb-0">
            <strong>Privacy:</strong> Your activities are stored securely and
            only you can see them. You can disconnect at any time to remove all
            synced data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StravaConnect;
