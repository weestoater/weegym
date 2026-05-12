import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActivities, formatDistance, formatDuration } from "../services/stravaService";
import { supabase } from "../lib/supabaseClient";

/**
 * StravaAnalytics Component
 * Displays analytics and insights for Strava activities
 */
function StravaAnalytics() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // week, month, year, all
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("Not authenticated");
      }

      const data = await getActivities(userData.user.id);
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities by time range
  const getFilteredActivities = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }

    let filtered = activities.filter(
      (a) => new Date(a.start_date) >= cutoffDate
    );

    if (selectedType !== "all") {
      filtered = filtered.filter((a) => a.type === selectedType);
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  // Calculate statistics
  const stats = {
    totalActivities: filteredActivities.length,
    totalDistance: filteredActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
    totalTime: filteredActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0),
    totalCalories: filteredActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
    totalElevation: filteredActivities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0),
  };

  // Activity type breakdown
  const typeBreakdown = {};
  filteredActivities.forEach((activity) => {
    const type = activity.type;
    if (!typeBreakdown[type]) {
      typeBreakdown[type] = {
        count: 0,
        distance: 0,
        time: 0,
        calories: 0,
      };
    }
    typeBreakdown[type].count++;
    typeBreakdown[type].distance += activity.distance || 0;
    typeBreakdown[type].time += activity.moving_time || 0;
    typeBreakdown[type].calories += activity.calories || 0;
  });

  // Get activity types for filter
  const activityTypes = [...new Set(activities.map((a) => a.type))];

  // Weekly breakdown (last 8 weeks)
  const getWeeklyData = () => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 7);

      const weekActivities = filteredActivities.filter((a) => {
        const date = new Date(a.start_date);
        return date >= weekStart && date < weekEnd;
      });

      weeks.push({
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        count: weekActivities.length,
        distance: weekActivities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000,
        calories: weekActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
      });
    }

    return weeks;
  };

  const weeklyData = getWeeklyData();
  const maxDistance = Math.max(...weeklyData.map((w) => w.distance));
  const maxCalories = Math.max(...weeklyData.map((w) => w.calories));

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-graph-up-arrow me-2"></i>
            Strava Analytics
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
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate("/strava/activities")}
            >
              <i className="bi bi-list-ul me-1"></i>
              Activities
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Time Range</label>
              <select
                className="form-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Activity Type</label>
              <select
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
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-primary h-100">
            <div className="card-body text-center">
              <i className="bi bi-trophy text-primary fs-1"></i>
              <h3 className="mt-2 mb-0">{stats.totalActivities}</h3>
              <small className="text-muted">Activities</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success h-100">
            <div className="card-body text-center">
              <i className="bi bi-signpost-2 text-success fs-1"></i>
              <h3 className="mt-2 mb-0">{formatDistance(stats.totalDistance)}</h3>
              <small className="text-muted">Total Distance</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info h-100">
            <div className="card-body text-center">
              <i className="bi bi-clock text-info fs-1"></i>
              <h3 className="mt-2 mb-0">{formatDuration(stats.totalTime)}</h3>
              <small className="text-muted">Total Time</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning h-100">
            <div className="card-body text-center">
              <i className="bi bi-fire text-warning fs-1"></i>
              <h3 className="mt-2 mb-0">{Math.round(stats.totalCalories)}</h3>
              <small className="text-muted">Total Calories</small>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4">
            <i className="bi bi-bar-chart me-2"></i>
            Weekly Progress (Last 8 Weeks)
          </h5>
          
          {/* Distance Chart */}
          <div className="mb-4">
            <h6 className="text-muted">Distance (km)</h6>
            <div className="d-flex align-items-end" style={{ height: "200px" }}>
              {weeklyData.map((week, index) => (
                <div key={index} className="flex-fill px-1">
                  <div className="d-flex flex-column align-items-center h-100">
                    <div className="flex-grow-1 d-flex align-items-end w-100">
                      <div
                        className="bg-success w-100"
                        style={{
                          height: `${(week.distance / maxDistance) * 100}%`,
                          minHeight: week.distance > 0 ? "5px" : "0",
                        }}
                        title={`${week.distance.toFixed(1)} km`}
                      ></div>
                    </div>
                    <small className="text-muted mt-2">{week.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calories Chart */}
          <div>
            <h6 className="text-muted">Calories Burned</h6>
            <div className="d-flex align-items-end" style={{ height: "200px" }}>
              {weeklyData.map((week, index) => (
                <div key={index} className="flex-fill px-1">
                  <div className="d-flex flex-column align-items-center h-100">
                    <div className="flex-grow-1 d-flex align-items-end w-100">
                      <div
                        className="bg-warning w-100"
                        style={{
                          height: `${(week.calories / maxCalories) * 100}%`,
                          minHeight: week.calories > 0 ? "5px" : "0",
                        }}
                        title={`${Math.round(week.calories)} cal`}
                      ></div>
                    </div>
                    <small className="text-muted mt-2">{week.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Type Breakdown */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-4">
            <i className="bi bi-pie-chart me-2"></i>
            Activity Type Breakdown
          </h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Count</th>
                  <th>Distance</th>
                  <th>Time</th>
                  <th>Calories</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(typeBreakdown)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([type, data]) => (
                    <tr key={type}>
                      <td>
                        <strong>{type}</strong>
                      </td>
                      <td>{data.count}</td>
                      <td>{formatDistance(data.distance)}</td>
                      <td>{formatDuration(data.time)}</td>
                      <td>{Math.round(data.calories)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      {stats.totalActivities > 0 && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-lightbulb me-2"></i>
              Insights
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="alert alert-info mb-0">
                  <strong>Average per Activity:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Distance: {formatDistance(stats.totalDistance / stats.totalActivities)}</li>
                    <li>Duration: {formatDuration(Math.round(stats.totalTime / stats.totalActivities))}</li>
                    <li>Calories: {Math.round(stats.totalCalories / stats.totalActivities)}</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-success mb-0">
                  <strong>Total Elevation Gained:</strong>
                  <h4 className="mt-2 mb-0">{Math.round(stats.totalElevation)}m</h4>
                  <small className="text-muted">
                    That's {(stats.totalElevation / 8848).toFixed(2)}x Mount Everest!
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StravaAnalytics;
