import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import StravaActivityCard from "../components/StravaActivityCard";
import {
  getActivities,
  getActivityStats,
  isConnected,
  syncActivities,
} from "../services/stravaService";

/**
 * StravaActivities Component
 * Displays list of Strava activities with filtering options
 */
function StravaActivities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [dateRange, setDateRange] = useState("30days"); // 30days, 3months, year, all
  const [activityType, setActivityType] = useState("all"); // all, Ride, Walk, Run, etc.
  const [useMetric, setUseMetric] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [user]);

  useEffect(() => {
    if (connected) {
      loadActivities();
    }
  }, [connected, dateRange, activityType]);

  const checkConnection = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const connectionStatus = await isConnected();
      setConnected(connectionStatus);

      if (!connectionStatus) {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

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

      // Build query options
      const options = {
        startDate,
        limit: 100,
      };

      if (activityType !== "all") {
        options.type = activityType;
      }

      // Fetch activities and stats
      const [activitiesData, statsData] = await Promise.all([
        getActivities(user.id, options),
        getActivityStats(user.id, options),
      ]);

      setActivities(activitiesData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Failed to load activities: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      await syncActivities(user.id);
      await loadActivities();
      alert("Activities synced successfully!");
    } catch (err) {
      console.error("Error syncing:", err);
      setError("Failed to sync activities: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleGoToConnect = () => {
    navigate("/strava");
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading activities...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Please log in to view your Strava activities.
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="container mt-4">
        <div className="card">
          <div className="card-body text-center py-5">
            <i
              className="bi bi-bicycle"
              style={{ fontSize: "4rem", color: "#FC4C02" }}
            ></i>
            <h3 className="mt-3">Not Connected to Strava</h3>
            <p className="text-muted">
              Connect your Strava account to view your activities here.
            </p>
            <button className="btn btn-primary" onClick={handleGoToConnect}>
              <i className="bi bi-box-arrow-up-right me-1"></i>
              Connect to Strava
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-activity me-2"></i>
            Strava Activities
          </h2>
          <div className="btn-group mt-2" role="group">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => navigate("/strava")}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back
            </button>
            <button
              className="btn btn-sm btn-outline-info"
              onClick={() => navigate("/strava/analytics")}
            >
              <i className="bi bi-graph-up-arrow me-1"></i>
              Analytics
            </button>
          </div>
        </div>
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
              Sync
            </>
          )}
        </button>
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

      {/* Stats Summary */}
      {stats && stats.totalActivities > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Summary</h5>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="text-center">
                  <i className="bi bi-list-ol text-primary"></i>
                  <div className="h4 mb-0">{stats.totalActivities}</div>
                  <small className="text-muted">Activities</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-center">
                  <i className="bi bi-signpost-2 text-primary"></i>
                  <div className="h4 mb-0">
                    {useMetric
                      ? `${(stats.totalDistance / 1000).toFixed(1)} km`
                      : `${(stats.totalDistance / 1609.34).toFixed(1)} mi`}
                  </div>
                  <small className="text-muted">Total Distance</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-center">
                  <i className="bi bi-clock text-primary"></i>
                  <div className="h4 mb-0">
                    {Math.floor(stats.totalMovingTime / 3600)}h{" "}
                    {Math.floor((stats.totalMovingTime % 3600) / 60)}m
                  </div>
                  <small className="text-muted">Total Time</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-center">
                  <i className="bi bi-fire text-warning"></i>
                  <div className="h4 mb-0">
                    {Math.round(stats.totalCalories)}
                  </div>
                  <small className="text-muted">Total Calories</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="dateRange" className="form-label">
                Date Range
              </label>
              <select
                id="dateRange"
                className="form-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="activityType" className="form-label">
                Activity Type
              </label>
              <select
                id="activityType"
                className="form-select"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="Ride">Rides</option>
                <option value="Walk">Walks</option>
                <option value="Run">Runs</option>
                <option value="Hike">Hikes</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="units" className="form-label">
                Units
              </label>
              <select
                id="units"
                className="form-select"
                value={useMetric ? "metric" : "imperial"}
                onChange={(e) => setUseMetric(e.target.value === "metric")}
              >
                <option value="metric">Metric (km, m)</option>
                <option value="imperial">Imperial (mi, ft)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i
              className="bi bi-inbox text-muted"
              style={{ fontSize: "3rem" }}
            ></i>
            <h4 className="mt-3">No Activities Found</h4>
            <p className="text-muted">
              {dateRange !== "all" || activityType !== "all"
                ? "Try adjusting your filters or sync your activities."
                : "Sync your Strava activities to see them here."}
            </p>
            <button
              className="btn btn-primary"
              onClick={handleSync}
              disabled={syncing}
            >
              <i className="bi bi-arrow-repeat me-1"></i>
              Sync Activities
            </button>
          </div>
        </div>
      ) : (
        <div>
          {activities.map((activity) => (
            <StravaActivityCard
              key={activity.id}
              activity={activity}
              useMetric={useMetric}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default StravaActivities;
