import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  getActivityIcon,
  getActivityBadgeColor,
  getActivityStream,
  getActivityPRs,
  deleteActivity,
} from "../services/stravaService";
import { PR_LABELS } from "../utils/prCalculator";
import { saveActiveWellbeingSession } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";
import Toast from "./Toast";
import RouteMap from "./RouteMap";

/**
 * StravaActivityCard Component
 * Displays a single Strava activity with collapsible detailed view
 */
function StravaActivityCard({ activity, useMetric = false, onDelete }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [logging, setLogging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [activityPRs, setActivityPRs] = useState([]);

  // Load PRs for this activity
  useEffect(() => {
    loadPRs();
  }, [activity.id]);

  const loadPRs = async () => {
    try {
      const prs = await getActivityPRs(activity.id);
      // Filter for all-time PRs only for display
      const allTimePRs = prs.filter((pr) => pr.time_scope === "all_time");
      setActivityPRs(allTimePRs);
    } catch (error) {
      console.error("Failed to load activity PRs:", error);
    }
  };

  // Load route data when expanded
  useEffect(() => {
    if (expanded && !routeData && !loadingRoute) {
      loadRouteData();
    }
  }, [expanded]);

  const loadRouteData = async () => {
    setLoadingRoute(true);
    try {
      const coordinates = await getActivityStream(activity.strava_id);
      setRouteData(coordinates);
    } catch (error) {
      console.error("Failed to load route data:", error);
      setRouteData([]); // Empty array to indicate no data available
    } finally {
      setLoadingRoute(false);
    }
  };

  // Format date
  const activityDate = new Date(activity.start_date);
  const dateStr = activityDate.toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = activityDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get Strava URL
  const stravaUrl = `https://www.strava.com/activities/${activity.strava_id}`;

  // Convert activity to wellbeing session
  const logToWellbeing = async () => {
    setLogging(true);
    try {
      // Map activity type to machine and mode
      let machine, mode;

      if (activity.type === "Ride") {
        machine = "Cross cycle";
        mode = "Cardio";
      } else if (activity.type === "Walk" || activity.type === "Hike") {
        machine = "Outdoor Activity";
        mode = "Cardio";
      } else if (activity.type === "Run") {
        machine = "Outdoor Activity";
        mode = "Cardio";
      } else {
        machine = "Outdoor Activity";
        mode = "Stamina";
      }

      // Calculate score based on calories or distance
      let score = activity.calories || 0;
      if (!score && activity.distance) {
        // Fallback: 1 point per km
        score = Math.round((activity.distance / 1000) * 10);
      }
      if (!score) {
        score = Math.round(activity.moving_time / 60); // 1 point per minute
      }

      const sessionData = {
        machine,
        mode,
        score: Math.round(score),
        date: activity.start_date.split("T")[0], // Extract date part
      };

      await saveActiveWellbeingSession(sessionData);
      setToast({
        message: "Activity logged to Active Wellbeing!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to log activity to wellbeing:", error);
      setToast({
        message: "Failed to log activity. Please try again.",
        type: "error",
      });
    } finally {
      setLogging(false);
    }
  };

  // Delete activity
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${activity.name}"?\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await deleteActivity(user.id, activity.id);
      setToast({
        message: "Activity deleted successfully!",
        type: "success",
      });

      // Notify parent component to refresh the list
      if (onDelete) {
        onDelete(activity.id);
      }
    } catch (error) {
      console.error("Failed to delete activity:", error);
      setToast({
        message: "Failed to delete activity. Please try again.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">
              <i
                className={`bi ${getActivityIcon(activity.type)} fs-4 me-2`}
              ></i>
              {activity.name}
            </h5>
            <p className="text-muted small mb-0">
              {dateStr} at {timeStr}
            </p>
          </div>
          <div className="text-end">
            <span className={`badge ${getActivityBadgeColor(activity.type)}`}>
              <i className={`bi ${getActivityIcon(activity.type)} me-1`}></i>
              {activity.type}
            </span>
            {/* PR Badges */}
            {activityPRs.length > 0 && (
              <div className="mt-1">
                {activityPRs.map((pr) => (
                  <span
                    key={pr.pr_category}
                    className="badge bg-warning text-dark me-1 small"
                    title={PR_LABELS[pr.pr_category]}
                  >
                    <i className="bi bi-trophy-fill"></i> PR
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MVP Stats - Always Visible */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-signpost-2 text-primary"></i>
              <div className="fw-bold">
                {formatDistance(activity.distance, useMetric)}
              </div>
              <small className="text-muted">Distance</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-clock text-primary"></i>
              <div className="fw-bold">
                {formatDuration(activity.moving_time)}
              </div>
              <small className="text-muted">Duration</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-heart-pulse text-danger"></i>
              <div className="fw-bold">
                {activity.average_heartrate
                  ? `${Math.round(activity.average_heartrate)} bpm`
                  : "N/A"}
              </div>
              <small className="text-muted">Avg Heart Rate</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-fire text-warning"></i>
              <div className="fw-bold">
                {activity.calories ? Math.round(activity.calories) : "N/A"}
              </div>
              <small className="text-muted">Calories</small>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-top pt-3 mt-3">
            {/* Performance Metrics Grid */}
            <div className="row g-3 mb-3">
              {/* Speed Card */}
              <div className="col-md-6">
                <div className="card border-primary h-100">
                  <div className="card-body pb-2">
                    <h6 className="card-subtitle mb-3 text-primary">
                      <i className="bi bi-speedometer2 me-2"></i>Speed
                    </h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-arrow-right text-info me-2"></i>
                          <div>
                            <small className="text-muted d-block">
                              Average
                            </small>
                            <strong className="text-info">
                              {activity.average_speed
                                ? formatSpeed(activity.average_speed, useMetric)
                                : "N/A"}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-arrow-up-right text-success me-2"></i>
                          <div>
                            <small className="text-muted d-block">Max</small>
                            <strong className="text-success">
                              {activity.max_speed
                                ? formatSpeed(activity.max_speed, useMetric)
                                : "N/A"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elevation Card */}
              <div className="col-md-6">
                <div className="card border-success h-100">
                  <div className="card-body pb-2">
                    <h6 className="card-subtitle mb-3 text-success">
                      <i className="bi bi-graph-up-arrow me-2"></i>Elevation
                    </h6>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-triangle text-success me-2 fs-4"></i>
                      <div>
                        <small className="text-muted d-block">Total Gain</small>
                        <strong className="fs-5 text-success">
                          {activity.total_elevation_gain
                            ? `${Math.round(activity.total_elevation_gain)}m`
                            : "N/A"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Heart Rate Section */}
            {(activity.average_heartrate || activity.max_heartrate) && (
              <div className="card border-danger mb-3">
                <div className="card-body">
                  <h6 className="card-subtitle mb-3 text-danger">
                    <i className="bi bi-heart-pulse-fill me-2"></i>Heart Rate
                    Analysis
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <div className="flex-grow-1">
                          <small className="text-muted">Average</small>
                          <div className="d-flex align-items-center">
                            <strong className="text-danger me-2">
                              {activity.average_heartrate
                                ? `${Math.round(activity.average_heartrate)} bpm`
                                : "N/A"}
                            </strong>
                          </div>
                        </div>
                      </div>
                      {activity.average_heartrate && (
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${(activity.average_heartrate / 200) * 100}%`,
                            }}
                            aria-valuenow={activity.average_heartrate}
                            aria-valuemin="0"
                            aria-valuemax="200"
                            aria-label="Average heart rate progress"
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <div className="flex-grow-1">
                          <small className="text-muted">Maximum</small>
                          <div className="d-flex align-items-center">
                            <strong className="text-danger me-2">
                              {activity.max_heartrate
                                ? `${Math.round(activity.max_heartrate)} bpm`
                                : "N/A"}
                            </strong>
                          </div>
                        </div>
                      </div>
                      {activity.max_heartrate && (
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${(activity.max_heartrate / 200) * 100}%`,
                            }}
                            aria-valuenow={activity.max_heartrate}
                            aria-valuemin="0"
                            aria-valuemax="200"
                            aria-label="Maximum heart rate progress"
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Time Analysis */}
            <div className="card border-info mb-3">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-info">
                  <i className="bi bi-stopwatch-fill me-2"></i>Time Analysis
                </h6>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center">
                      <i className="bi bi-play-circle text-info fs-4"></i>
                      <div className="mt-2">
                        <small className="text-muted d-block">
                          Moving Time
                        </small>
                        <strong>{formatDuration(activity.moving_time)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <i className="bi bi-hourglass-split text-warning fs-4"></i>
                      <div className="mt-2">
                        <small className="text-muted d-block">
                          Elapsed Time
                        </small>
                        <strong>{formatDuration(activity.elapsed_time)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {activity.elapsed_time > activity.moving_time && (
                  <div className="mt-2 text-center">
                    <small className="text-muted">
                      <i className="bi bi-pause-circle me-1"></i>
                      Rest time:{" "}
                      {formatDuration(
                        activity.elapsed_time - activity.moving_time,
                      )}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Route Map */}
            <div className="card border-secondary mb-3">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-secondary">
                  <i className="bi bi-map me-2"></i>Route Map
                </h6>
                {loadingRoute ? (
                  <div className="text-center py-3">
                    <div
                      className="spinner-border spinner-border-sm text-secondary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading route...</span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">
                      Loading route data...
                    </p>
                  </div>
                ) : (
                  <RouteMap coordinates={routeData} height="350px" />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 flex-wrap">
              <a
                href={stravaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-box-arrow-up-right me-1"></i>
                View on Strava
              </a>
              <button
                onClick={logToWellbeing}
                disabled={logging}
                className="btn btn-sm btn-success"
              >
                <i className="bi bi-heart-pulse me-1"></i>
                {logging ? "Logging..." : "Log to Active Wellbeing"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-sm btn-outline-danger"
                title="Delete this activity"
              >
                <i className="bi bi-trash me-1"></i>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          className="btn btn-link btn-sm p-0 mt-2 text-decoration-none"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={`activity-details-${activity.id}`}
        >
          {expanded ? (
            <>
              <i className="bi bi-chevron-up me-1"></i>
              Show Less
            </>
          ) : (
            <>
              <i className="bi bi-chevron-down me-1"></i>
              Show More Details
            </>
          )}
        </button>
      </div>
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

StravaActivityCard.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    strava_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    start_date: PropTypes.string.isRequired,
    distance: PropTypes.number,
    moving_time: PropTypes.number,
    elapsed_time: PropTypes.number,
    total_elevation_gain: PropTypes.number,
    average_speed: PropTypes.number,
    max_speed: PropTypes.number,
    average_heartrate: PropTypes.number,
    max_heartrate: PropTypes.number,
    calories: PropTypes.number,
  }).isRequired,
  useMetric: PropTypes.bool,
  onDelete: PropTypes.func,
};

export default StravaActivityCard;
