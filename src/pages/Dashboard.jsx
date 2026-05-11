import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWorkouts, getActiveWellbeingSessions } from "../lib/database";
import { getUserProfile } from "../services/userProfileService";
import {
  getConnectionStatus,
  getActivities,
  getActivityStats,
} from "../services/stravaService";

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [streak, setStreak] = useState(0);
  const [wellbeingSessions, setWellbeingSessions] = useState(0);
  const [lastWellbeing, setLastWellbeing] = useState(null);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaStats, setStravaStats] = useState(null);
  const [lastStravaActivity, setLastStravaActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const profile = await getUserProfile();
      setUserProfile(profile);

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

      // Check Strava connection status
      try {
        const stravaStatus = await getConnectionStatus();
        setStravaConnected(stravaStatus.connected);

        // If connected, load Strava activity stats
        if (stravaStatus.connected && stravaStatus.user_id) {
          const stats = await getActivityStats(stravaStatus.user_id);
          setStravaStats(stats);

          // Get the most recent activity
          const activities = await getActivities(stravaStatus.user_id, {
            limit: 1,
          });
          if (activities && activities.length > 0) {
            setLastStravaActivity(activities[0]);
          }
        }
      } catch (err) {
        // Strava not connected or error - that's okay
        setStravaConnected(false);
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

  const userMode = userProfile?.user_mode || "programme";
  const displayName = userProfile?.display_name || "there";
  const isProgrammeMode = userMode === "programme";

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
              <h2 className="h5 mb-1">Welcome back, {displayName}!</h2>
              <p className="mb-0 opacity-75">
                {isProgrammeMode
                  ? "Ready to crush your workout?"
                  : "Ready to log your wellbeing activity?"}
              </p>
            </div>
          </div>

          {/* Stats Row - Different for each mode */}
          {isProgrammeMode ? (
            // Programme Mode: Show workouts and wellbeing stats
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
                        ? new Date(lastWorkout.date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )
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
              {stravaConnected && (
                <>
                  <div className="col-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-bicycle text-danger fs-1"></i>
                        <h3 className="h2 mb-0">
                          {lastStravaActivity
                            ? new Date(
                                lastStravaActivity.start_date,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "--"}
                        </h3>
                        <p className="text-muted small mb-0">Last Activity</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-lightning-charge text-warning fs-1"></i>
                        <h3 className="h2 mb-0">
                          {stravaStats?.totalCalories
                            ? Math.round(stravaStats.totalCalories).toLocaleString()
                            : "--"}
                        </h3>
                        <p className="text-muted small mb-0">
                          Strava Calories
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Wellbeing Only Mode: Focus on wellbeing stats
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-activity text-primary fs-1"></i>
                    <h3 className="h2 mb-0">{wellbeingSessions}</h3>
                    <p className="text-muted small mb-0">Total Sessions</p>
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
              <div className="col-6">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-calendar-check text-success fs-1"></i>
                    <h3 className="h2 mb-0">
                      {lastWellbeing
                        ? new Date(lastWellbeing.date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )
                        : "--"}
                    </h3>
                    <p className="text-muted small mb-0">Last Session</p>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-star text-info fs-1"></i>
                    <h3 className="h2 mb-0">
                      {lastWellbeing ? lastWellbeing.machine : "--"}
                    </h3>
                    <p className="text-muted small mb-0">Last Machine</p>
                  </div>
                </div>
              </div>
              {stravaConnected && (
                <>
                  <div className="col-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-bicycle text-danger fs-1"></i>
                        <h3 className="h2 mb-0">
                          {lastStravaActivity
                            ? new Date(
                                lastStravaActivity.start_date,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "--"}
                        </h3>
                        <p className="text-muted small mb-0">Last Activity</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-lightning-charge text-warning fs-1"></i>
                        <h3 className="h2 mb-0">
                          {stravaStats?.totalCalories
                            ? Math.round(stravaStats.totalCalories).toLocaleString()
                            : "--"}
                        </h3>
                        <p className="text-muted small mb-0">
                          Strava Calories
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Access Features */}
          <h3 className="h6 text-muted mb-3">QUICK ACCESS</h3>
          
          <div className="row g-3 mb-4">
            {/* Workout Cards - Only in Programme Mode */}
            {isProgrammeMode && (
              <>
                <div className="col-md-6">
                  <Link
                    to="/workout?day=1"
                    className="card h-100 text-decoration-none hover-lift"
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 p-3"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <i className="bi bi-play-circle text-primary fs-4"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h5 className="card-title mb-1">Day 1 Workout</h5>
                          <p className="card-text text-muted small mb-0">
                            Chest • Shoulders • Arms
                          </p>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link
                    to="/workout?day=2"
                    className="card h-100 text-decoration-none hover-lift"
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 p-3"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <i className="bi bi-play-circle text-primary fs-4"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h5 className="card-title mb-1">Day 2 Workout</h5>
                          <p className="card-text text-muted small mb-0">
                            Legs • Shoulders • Core
                          </p>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}

            {/* Slimming World Food Tracking */}
            <div className="col-md-6">
              <Link
                to="/calories"
                className="card h-100 text-decoration-none hover-lift"
              >
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-warning bg-opacity-10 p-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="bi bi-star-fill text-warning fs-4"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="card-title mb-1">Slimming World</h5>
                      <p className="card-text text-muted small mb-0">
                        Track meals & syns
                      </p>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* Strava Integration */}
            <div className="col-md-6">
              <Link
                to={stravaConnected ? "/strava/activities" : "/strava"}
                className="card h-100 text-decoration-none hover-lift"
              >
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-danger bg-opacity-10 p-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="bi bi-bicycle text-danger fs-4"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="card-title mb-1">
                        Strava Activities
                        {stravaConnected && (
                          <i className="bi bi-check-circle-fill text-success ms-2 small"></i>
                        )}
                      </h5>
                      <p className="card-text text-muted small mb-0">
                        {stravaConnected
                          ? "View your activities"
                          : "Connect your account"}
                      </p>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* Active Wellbeing */}
            <div className="col-md-6">
              <Link
                to="/wellbeing"
                className="card h-100 text-decoration-none hover-lift"
              >
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-success bg-opacity-10 p-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="bi bi-activity text-success fs-4"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="card-title mb-1">Active Wellbeing</h5>
                      <p className="card-text text-muted small mb-0">
                        {wellbeingSessions > 0
                          ? `${wellbeingSessions} sessions logged`
                          : "Log your activities"}
                      </p>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* History */}
            <div className="col-md-6">
              <Link
                to="/history"
                className="card h-100 text-decoration-none hover-lift"
              >
                <div className="card-body">
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                      <div
                        className="rounded-circle bg-info bg-opacity-10 p-3"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="bi bi-clock-history text-info fs-4"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5 className="card-title mb-1">History</h5>
                      <p className="card-text text-muted small mb-0">
                        {isProgrammeMode
                          ? `${streak} workouts completed`
                          : "View your progress"}
                      </p>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>
              </Link>
            </div>

            {/* Programme - Only in Programme Mode */}
            {isProgrammeMode && (
              <div className="col-md-6">
                <Link
                  to="/programme"
                  className="card h-100 text-decoration-none hover-lift"
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle bg-secondary bg-opacity-10 p-3"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <i className="bi bi-journal-text text-secondary fs-4"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <h5 className="card-title mb-1">Programme</h5>
                        <p className="card-text text-muted small mb-0">
                          View full programme
                        </p>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Last Workout Summary - Only for Programme Mode */}
          {isProgrammeMode && lastWorkout && (
            <>
              <h3 className="h6 text-muted mt-4 mb-3">LAST WORKOUT</h3>
              <div className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
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

                  {/* Display all exercises/machines worked on */}
                  {lastWorkout.exercises &&
                    lastWorkout.exercises.length > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <p className="text-muted small mb-2">
                          <strong>Machines & Exercises:</strong>
                        </p>
                        <div className="row g-2">
                          {[
                            ...new Set(
                              lastWorkout.exercises.map(
                                (ex) => ex.exerciseName,
                              ),
                            ),
                          ].map((exerciseName, index) => {
                            const exerciseSets = lastWorkout.exercises.filter(
                              (ex) => ex.exerciseName === exerciseName,
                            );
                            const totalSets = exerciseSets.length;
                            return (
                              <div key={index} className="col-12">
                                <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                  <span className="small">
                                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                                    {exerciseName}
                                  </span>
                                  <span className="badge bg-secondary">
                                    {totalSets} sets
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}

          {/* Last Wellbeing Summary - Only for Wellbeing Only Mode */}
          {!isProgrammeMode && lastWellbeing && (
            <>
              <h3 className="h6 text-muted mt-4 mb-3">
                LAST WELLBEING SESSION
              </h3>
              <div className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="h6 mb-1">{lastWellbeing.machine}</h4>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(lastWellbeing.date).toLocaleDateString(
                          "en-GB",
                        )}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-muted small">Score</p>
                      <p className="h6 mb-0">{lastWellbeing.score}</p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Mode:</span>
                    <span className="badge bg-primary">
                      {lastWellbeing.mode}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tips - Different for each mode */}
          <div className="alert alert-info mt-4" role="alert">
            <i className="bi bi-lightbulb me-2"></i>
            <strong>Tip:</strong>{" "}
            {isProgrammeMode
              ? "Remember to maintain 2 seconds up, 2 seconds down tempo for maximum muscle growth."
              : "Consistency is key! Try to log your wellbeing activities regularly to track your progress."}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
