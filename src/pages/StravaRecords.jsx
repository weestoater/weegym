import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getPersonalRecordsByType,
  getActivityIcon,
  getActivityIconColor,
} from "../services/stravaService";
import { PR_LABELS, PR_ICONS, formatPRValue } from "../utils/prCalculator";
import { useAuth } from "../contexts/AuthContext";

function StravaRecords() {
  const { user } = useAuth();
  const [prs, setPrs] = useState({});
  const [timeScope, setTimeScope] = useState("all_time");
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [useMetric, setUseMetric] = useState(false);

  useEffect(() => {
    loadPRs();
  }, [timeScope]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPRs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const records = await getPersonalRecordsByType(user.id, timeScope);
      setPrs(records);
    } catch (error) {
      console.error("Error loading PRs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique activity types
  const activityTypes = Object.keys(prs);
  const filteredTypes =
    selectedType === "all"
      ? activityTypes
      : activityTypes.filter((type) => type === selectedType);

  // Time scope options
  const timeScopeOptions = [
    { value: "all_time", label: "All Time" },
    { value: "year", label: "This Year" },
    { value: "month", label: "This Month" },
  ];

  const getTimeScopeLabel = (scope) => {
    return timeScopeOptions.find((opt) => opt.value === scope)?.label || scope;
  };

  if (loading) {
    return (
      <div className="container mt-4">
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">
            <i className="bi bi-trophy-fill text-warning me-2"></i>
            Personal Records
          </h1>
          <p className="text-muted mb-0">Your best performances</p>
        </div>
        <Link to="/strava" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Time Scope */}
            <div className="col-md-4">
              <label htmlFor="timeScope" className="form-label small">
                Time Period
              </label>
              <select
                id="timeScope"
                className="form-select"
                value={timeScope}
                onChange={(e) => setTimeScope(e.target.value)}
              >
                {timeScopeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Type */}
            <div className="col-md-4">
              <label htmlFor="activityType" className="form-label small">
                Activity Type
              </label>
              <select
                id="activityType"
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Units Toggle */}
            <div className="col-md-4">
              <label className="form-label small">Units</label>
              <div className="form-check form-switch">
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
          </div>
        </div>
      </div>

      {/* PRs Display */}
      {activityTypes.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No personal records yet. Sync your activities to see your PRs!
        </div>
      ) : (
        filteredTypes.map((activityType) => (
          <div key={activityType} className="mb-4">
            <h3 className="h4 mb-3">
              <i
                className={`bi ${getActivityIcon(activityType)} ${getActivityIconColor(activityType)} fs-3 me-2`}
              ></i>
              {activityType}
            </h3>
            <div className="row g-3">
              {prs[activityType].map((pr) => (
                <div key={pr.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-warning shadow-sm">
                    <div className="card-body">
                      {/* PR Category with large icon */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="card-title mb-0">
                          {PR_LABELS[pr.pr_category]}
                        </h5>
                        <i
                          className={`${PR_ICONS[pr.pr_category]} text-warning fs-1`}
                        ></i>
                      </div>

                      {/* Record Value - Large and prominent */}
                      <h2 className="mb-3 text-primary fw-bold">
                        {formatPRValue(
                          pr.record_value,
                          pr.record_unit,
                          useMetric,
                        )}
                      </h2>

                      {/* Activity Info */}
                      <div className="border-top pt-2">
                        <p className="text-muted small mb-1">
                          <i
                            className={`bi ${getActivityIcon(activityType)} ${getActivityIconColor(activityType)} me-1`}
                          ></i>
                          <strong>{pr.activity_name}</strong>
                        </p>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(pr.activity_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      {/* Improvement */}
                      {pr.previous_record_value && (
                        <div className="alert alert-success py-1 px-2 small mb-0 mt-2">
                          <i className="bi bi-arrow-up-circle me-1"></i>
                          Beat previous:{" "}
                          {formatPRValue(
                            pr.previous_record_value,
                            pr.record_unit,
                            useMetric,
                          )}
                        </div>
                      )}

                      {/* Time Scope Badge */}
                      {pr.time_scope !== "all_time" && (
                        <span className="badge bg-secondary">
                          {getTimeScopeLabel(pr.time_scope)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Empty State for Filtered Results */}
      {filteredTypes.length === 0 && activityTypes.length > 0 && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No records found for the selected filters.
        </div>
      )}
    </div>
  );
}

export default StravaRecords;
