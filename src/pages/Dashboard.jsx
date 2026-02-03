import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWorkouts, getActiveWellbeingSessions } from "../lib/database";

function Dashboard() {
  const [lastWorkout, setLastWorkout] = useState(null);
  const [streak, setStreak] = useState(0);
  const [wellbeingSessions, setWellbeingSessions] = useState(0);
  const [lastWellbeing, setLastWellbeing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load workouts from Supabase
      const workouts = await getWorkouts();
      if (workouts && workouts.length > 0) {
        const sorted = workouts.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setLastWorkout(sorted[0]);
        setStreak(workouts.length);
      }

      // Load Active Wellbeing data from Supabase
      const wellbeing = await getActiveWellbeingSessions();
      if (wellbeing && wellbeing.length > 0) {
        setWellbeingSessions(wellbeing.length);
        const sorted = wellbeing.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setLastWellbeing(sorted[0]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to localStorage if Supabase fails
      const localWorkouts = JSON.parse(
        localStorage.getItem("workouts") || "[]",
      );
      if (localWorkouts.length > 0) {
        setLastWorkout(localWorkouts[localWorkouts.length - 1]);
        setStreak(localWorkouts.length);
      }

      const localWellbeing = JSON.parse(
        localStorage.getItem("activeWellbeingSessions") || "[]",
      );
      setWellbeingSessions(localWellbeing.length);
      if (localWellbeing.length > 0) {
        const sorted = localWellbeing.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setLastWellbeing(sorted[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="card mb-4 bg-primary text-white">
            <div className="card-body">
              <h2 className="h5 mb-1">Welcome back, Ian!</h2>
              <p className="mb-0 opacity-75">Ready to crush your workout?</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-fire text-danger fs-1"></i>
                  <h3 className="h2 mb-0">{streak}</h3>
                  <p className="text-muted small mb-0">Workouts</p>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-calendar-check text-success fs-1"></i>
                  <h3 className="h2 mb-0">
                    {lastWorkout
                      ? new Date(lastWorkout.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "--"}
                  </h3>
                  <p className="text-muted small mb-0">Last Workout</p>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-activity text-primary fs-1"></i>
                  <h3 className="h2 mb-0">{wellbeingSessions}</h3>
                  <p className="text-muted small mb-0">Wellbeing</p>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card text-center">
                <div className="card-body">
                  <i className="bi bi-trophy text-warning fs-1"></i>
                  <h3 className="h2 mb-0">
                    {lastWellbeing ? lastWellbeing.score : "--"}
                  </h3>
                  <p className="text-muted small mb-0">Last Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="h6 text-muted mb-3">QUICK ACTIONS</h3>
          <div className="d-grid gap-3">
            <Link
              to="/workout?day=1"
              className="btn btn-primary btn-lg btn-touch d-flex align-items-center justify-content-between"
            >
              <div className="text-start">
                <div>
                  <i className="bi bi-play-circle me-2"></i>
                  Start Day 1 Workout
                </div>
                <div className="small opacity-75 mt-1">
                  Chest • Shoulders • Arms
                </div>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
            <Link
              to="/workout?day=2"
              className="btn btn-primary btn-lg btn-touch d-flex align-items-center justify-content-between"
            >
              <div className="text-start">
                <div>
                  <i className="bi bi-play-circle me-2"></i>
                  Start Day 2 Workout
                </div>
                <div className="small opacity-75 mt-1">
                  Legs • Glutes • Core
                </div>
              </div>
              <i className="bi bi-chevron-right"></i>
            </Link>
            <Link
              to="/wellbeing"
              className="btn btn-success btn-lg btn-touch d-flex align-items-center justify-content-between"
            >
              <span>
                <i className="bi bi-activity me-2"></i>
                Log Active Wellbeing
              </span>
              <i className="bi bi-chevron-right"></i>
            </Link>
            <Link
              to="/programme"
              className="btn btn-outline-primary btn-lg btn-touch d-flex align-items-center justify-content-between"
            >
              <span>
                <i className="bi bi-journal-text me-2"></i>
                View Programme
              </span>
              <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          {/* Last Workout Summary */}
          {lastWorkout && (
            <>
              <h3 className="h6 text-muted mt-4 mb-3">LAST WORKOUT</h3>
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="h6 mb-1">{lastWorkout.name}</h4>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(lastWorkout.date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-muted small">Duration</p>
                      <p className="h6 mb-0">
                        {lastWorkout.duration || "--"} min
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tips */}
          <div className="alert alert-info mt-4" role="alert">
            <i className="bi bi-lightbulb me-2"></i>
            <strong>Tip:</strong> Remember to maintain 2 seconds up, 2 seconds
            down tempo for maximum muscle growth.
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
