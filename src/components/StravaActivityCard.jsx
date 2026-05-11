import { useState } from "react";
import PropTypes from "prop-types";
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  getActivityIcon,
} from "../services/stravaService";

/**
 * StravaActivityCard Component
 * Displays a single Strava activity with collapsible detailed view
 */
function StravaActivityCard({ activity, useMetric = false }) {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div className="card mb-3">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">
              <i className={`bi ${getActivityIcon(activity.type)} me-2`}></i>
              {activity.name}
            </h5>
            <p className="text-muted small mb-0">
              {dateStr} at {timeStr}
            </p>
          </div>
          <span className={`badge bg-${activity.type === "Ride" ? "primary" : activity.type === "Walk" ? "success" : "info"}`}>
            {activity.type}
          </span>
        </div>

        {/* MVP Stats - Always Visible */}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-signpost-2 text-primary"></i>
              <div className="fw-bold">{formatDistance(activity.distance, useMetric)}</div>
              <small className="text-muted">Distance</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-clock text-primary"></i>
              <div className="fw-bold">{formatDuration(activity.moving_time)}</div>
              <small className="text-muted">Duration</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center p-2 bg-light rounded">
              <i className="bi bi-heart-pulse text-danger"></i>
              <div className="fw-bold">
                {activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "N/A"}
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
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-graph-up me-2"></i>Performance
                </h6>
                <ul className="list-unstyled small">
                  <li className="mb-1">
                    <strong>Elevation Gain:</strong>{" "}
                    {activity.total_elevation_gain ? `${Math.round(activity.total_elevation_gain)}m` : "N/A"}
                  </li>
                  <li className="mb-1">
                    <strong>Average Speed:</strong>{" "}
                    {activity.average_speed ? formatSpeed(activity.average_speed, useMetric) : "N/A"}
                  </li>
                  <li className="mb-1">
                    <strong>Max Speed:</strong>{" "}
                    {activity.max_speed ? formatSpeed(activity.max_speed, useMetric) : "N/A"}
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-heart me-2"></i>Heart Rate
                </h6>
                <ul className="list-unstyled small">
                  <li className="mb-1">
                    <strong>Average HR:</strong>{" "}
                    {activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "N/A"}
                  </li>
                  <li className="mb-1">
                    <strong>Max HR:</strong>{" "}
                    {activity.max_heartrate ? `${Math.round(activity.max_heartrate)} bpm` : "N/A"}
                  </li>
                </ul>
                <h6 className="text-muted mb-2 mt-3">
                  <i className="bi bi-stopwatch me-2"></i>Time
                </h6>
                <ul className="list-unstyled small">
                  <li className="mb-1">
                    <strong>Moving Time:</strong> {formatDuration(activity.moving_time)}
                  </li>
                  <li className="mb-1">
                    <strong>Elapsed Time:</strong> {formatDuration(activity.elapsed_time)}
                  </li>
                </ul>
              </div>
            </div>

            {/* View on Strava */}
            <div className="mt-3">
              <a
                href={stravaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-box-arrow-up-right me-1"></i>
                View on Strava
              </a>
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
};

export default StravaActivityCard;
