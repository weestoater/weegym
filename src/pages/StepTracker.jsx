import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getConnection,
  getDailySteps,
  getTodaySteps,
  calculateStreak,
  getAchievements,
  isMockMode,
} from "../services/garminService";
import {
  formatNumber,
  getProgressPercentage,
  getProgressColor,
  getStepLevel,
  stepsToKilometers,
  getRelativeDate,
  getShortDayName,
  getStreakEmoji,
  getStreakMessage,
} from "../utils/stepCalculator";

/**
 * StepTracker Component
 * Detailed step tracking view with daily breakdown and statistics
 */
function StepTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todaySteps, setTodaySteps] = useState(null);
  const [dailySteps, setDailySteps] = useState([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState(null);
  const [dateRange, setDateRange] = useState("7days");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Check connection
      const conn = await getConnection(user.id);
      if (!conn) {
        setConnection(null);
        setLoading(false);
        return;
      }
      setConnection(conn);

      // Get today's steps
      const today = await getTodaySteps(user.id);
      setTodaySteps(today);

      // Get date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case "7days":
          startDate.setDate(startDate.getDate() - 6);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 29);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 89);
          break;
      }

      // Get daily steps
      const steps = await getDailySteps(user.id, { startDate, endDate });
      setDailySteps(steps);

      // Calculate streak
      const currentStreak = await calculateStreak(user.id);
      setStreak(currentStreak);

      // Get achievements
      const achievementData = await getAchievements(user.id);
      setAchievements(achievementData);
    } catch (err) {
      console.error("Error loading data:", err);
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

  if (!connection) {
    return (
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-body p-5">
            <i
              className="bi bi-smartwatch text-muted"
              style={{ fontSize: "4rem" }}
            ></i>
            <h2 className="mt-3 mb-3">Garmin Not Connected</h2>
            <p className="text-muted mb-4">
              Connect your Garmin account to start tracking your daily steps.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/garmin")}
            >
              <i className="bi bi-link-45deg me-2"></i>
              Connect Garmin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-footprints me-2"></i>
          Step Tracker
        </h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/garmin")}
        >
          <i className="bi bi-gear me-2"></i>
          Manage Connection
        </button>
      </div>

      {/* Mock Mode Banner */}
      {isMockMode && (
        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Development Mode:</strong> Showing mock data for
          demonstration.
        </div>
      )}

      {/* Today's Stats - Large Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i
                className="bi bi-footprints text-primary"
                style={{ fontSize: "3rem" }}
              ></i>
              <h2 className="display-4 mt-3 mb-0">
                {todaySteps ? formatNumber(todaySteps.total_steps) : "--"}
              </h2>
              <p className="text-muted mb-3">Steps Today</p>
              {todaySteps && (
                <>
                  <div className="progress mb-2" style={{ height: "20px" }}>
                    <div
                      className={`progress-bar ${getProgressColor(todaySteps.total_steps, todaySteps.goal_steps)}`}
                      role="progressbar"
                      aria-label="Daily step goal progress"
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
                  <small className="text-muted">
                    Goal: {formatNumber(todaySteps.goal_steps)}
                  </small>
                  <br />
                  <span
                    className={`badge bg-${getStepLevel(todaySteps.total_steps, todaySteps.goal_steps).color} mt-2`}
                  >
                    {
                      getStepLevel(
                        todaySteps.total_steps,
                        todaySteps.goal_steps,
                      ).label
                    }
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <i
                className="bi bi-fire text-danger"
                style={{ fontSize: "3rem" }}
              ></i>
              <h2 className="display-4 mt-3 mb-0">
                {streak} {getStreakEmoji(streak)}
              </h2>
              <p className="text-muted mb-3">Day Streak</p>
              <p className="text-success fw-bold">{getStreakMessage(streak)}</p>
              <small className="text-muted">
                Consecutive days meeting your goal
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-center text-muted mb-3">
                Quick Stats
              </h6>
              {achievements && (
                <>
                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <i className="bi bi-trophy me-2"></i>Best Day
                    </span>
                    <strong>
                      {formatNumber(achievements.bestDay?.total_steps || 0)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <i className="bi bi-graph-up me-2"></i>Average
                    </span>
                    <strong>
                      {formatNumber(achievements.averageSteps || 0)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <i className="bi bi-calendar-check me-2"></i>Days Tracked
                    </span>
                    <strong>{achievements.totalDays}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <i className="bi bi-check-circle me-2"></i>Goals Met
                    </span>
                    <strong>{achievements.daysGoalMet}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>
                      <i className="bi bi-footprints me-2"></i>Total Steps
                    </span>
                    <strong>
                      {formatNumber(achievements.totalSteps || 0)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="bi bi-calendar3 me-2"></i>
              Daily Breakdown
            </h5>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${dateRange === "7days" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDateRange("7days")}
              >
                7 Days
              </button>
              <button
                className={`btn btn-sm ${dateRange === "30days" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDateRange("30days")}
              >
                30 Days
              </button>
              <button
                className={`btn btn-sm ${dateRange === "90days" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setDateRange("90days")}
              >
                90 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Steps Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Steps</th>
                  <th>Goal</th>
                  <th>Progress</th>
                  <th>Distance</th>
                  <th>Calories</th>
                </tr>
              </thead>
              <tbody>
                {dailySteps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No data available for this period
                    </td>
                  </tr>
                ) : (
                  dailySteps.map((day) => {
                    const progress = getProgressPercentage(
                      day.total_steps,
                      day.goal_steps,
                    );
                    const distance = stepsToKilometers(day.total_steps);

                    return (
                      <tr key={day.date}>
                        <td>{getRelativeDate(day.date)}</td>
                        <td>
                          <span className="text-muted">
                            {getShortDayName(day.date)}
                          </span>
                        </td>
                        <td>
                          <strong>{formatNumber(day.total_steps)}</strong>
                        </td>
                        <td>{formatNumber(day.goal_steps)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="progress flex-grow-1 me-2"
                              style={{ height: "20px", minWidth: "100px" }}
                            >
                              <div
                                className={`progress-bar ${getProgressColor(day.total_steps, day.goal_steps)}`}
                                role="progressbar"
                                aria-label={`Progress for ${getRelativeDate(day.date)}`}
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              >
                                {progress}%
                              </div>
                            </div>
                            {day.total_steps >= day.goal_steps && (
                              <i className="bi bi-check-circle-fill text-success"></i>
                            )}
                          </div>
                        </td>
                        <td>{distance} km</td>
                        <td>{day.calories_burned} cal</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="card bg-light mt-4">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-lightbulb me-2"></i>
            Tips for Success
          </h6>
          <ul className="mb-0 small">
            <li>Take Buster for regular walks to boost your step count! 🐕</li>
            <li>Park further away from your destination for extra steps</li>
            <li>Take the stairs instead of the elevator</li>
            <li>Set hourly movement reminders on your Garmin device</li>
            <li>Walk during phone calls when possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StepTracker;
