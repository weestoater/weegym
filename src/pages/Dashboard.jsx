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
        const isConnected = !!stravaStatus;
        setStravaConnected(isConnected);

        // If connected, load Strava activity stats
        if (isConnected && stravaStatus.user_id) {
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
              <div className="col-6 col-md-4">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-fire text-danger fs-1"></i>
                    <h3 className="h2 mb-0">{streak}</h3>
                    <p className="text-muted small mb-0">Workouts</p>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
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
              <div className="col-6 col-md-4">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-activity text-primary fs-1"></i>
                    <h3 className="h2 mb-0">{wellbeingSessions}</h3>
                    <p className="text-muted small mb-0">Wellbeing</p>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
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
                  <div className="col-6 col-md-4">
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
                  <div className="col-6 col-md-4">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-lightning-charge text-warning fs-1"></i>
                        <h3 className="h2 mb-0">
                          {stravaStats?.totalCalories
                            ? Math.round(
                                stravaStats.totalCalories,
                              ).toLocaleString()
                            : "--"}
                        </h3>
                        <p className="text-muted small mb-0">Strava Calories</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Wellbeing Only Mode: Focus on wellbeing stats
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-4">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-activity text-primary fs-1"></i>
                    <h3 className="h2 mb-0">{wellbeingSessions}</h3>
                    <p className="text-muted small mb-0">Total Sessions</p>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
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
              <div className="col-6 col-md-4">
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
              <div className="col-6 col-md-4">
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
                  <div className="col-6 col-md-4">
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
                  <div className="col-6 col-md-4">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-lightning-charge text-warning fs-1"></i>
                        <h3 className="h2 mb-0">
                          {stravaStats?.totalCalories
                            ? Math.round(
                                stravaStats.totalCalories,
                              ).toLocaleString()
                            : "--"}
                        </h3>
                        <p className="text-muted small mb-0">Strava Calories</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Access Features - Accordion */}
          <div className="accordion mb-4" id="quickAccessAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseQuickAccess"
                  aria-expanded="false"
                  aria-controls="collapseQuickAccess"
                >
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  Quick Access
                </button>
              </h2>
              <div
                id="collapseQuickAccess"
                className="accordion-collapse collapse"
                data-bs-parent="#quickAccessAccordion"
              >
                <div className="accordion-body py-2">
                  <div className="list-group list-group-flush">
                    {/* Workout Links - Only in Programme Mode */}
                    {isProgrammeMode && (
                      <>
                        <Link
                          to="/workout?day=1"
                          className="list-group-item list-group-item-action d-flex align-items-center py-2"
                        >
                          <i className="bi bi-play-circle text-primary me-3 fs-5"></i>
                          <div className="flex-grow-1">
                            <div className="fw-medium small">Day 1 Workout</div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Chest • Shoulders • Arms
                            </div>
                          </div>
                          <i className="bi bi-chevron-right text-muted"></i>
                        </Link>
                        <Link
                          to="/workout?day=2"
                          className="list-group-item list-group-item-action d-flex align-items-center py-2"
                        >
                          <i className="bi bi-play-circle text-primary me-3 fs-5"></i>
                          <div className="flex-grow-1">
                            <div className="fw-medium small">Day 2 Workout</div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Legs • Shoulders • Core
                            </div>
                          </div>
                          <i className="bi bi-chevron-right text-muted"></i>
                        </Link>
                      </>
                    )}

                    {/* Slimming World */}
                    <Link
                      to="/calories"
                      className="list-group-item list-group-item-action d-flex align-items-center py-2"
                    >
                      <i className="bi bi-star-fill text-warning me-3 fs-5"></i>
                      <div className="flex-grow-1">
                        <div className="fw-medium small">Slimming World</div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Track meals & syns
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    {/* Strava */}
                    <Link
                      to={stravaConnected ? "/strava/activities" : "/strava"}
                      className="list-group-item list-group-item-action d-flex align-items-center py-2"
                    >
                      <i className="bi bi-bicycle text-danger me-3 fs-5"></i>
                      <div className="flex-grow-1">
                        <div className="fw-medium small">
                          Strava Activities
                          {stravaConnected && (
                            <i
                              className="bi bi-check-circle-fill text-success ms-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                          )}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {stravaConnected
                            ? "View your activities"
                            : "Connect your account"}
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    {/* Active Wellbeing */}
                    <Link
                      to="/wellbeing"
                      className="list-group-item list-group-item-action d-flex align-items-center py-2"
                    >
                      <i className="bi bi-activity text-success me-3 fs-5"></i>
                      <div className="flex-grow-1">
                        <div className="fw-medium small">Active Wellbeing</div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {wellbeingSessions > 0
                            ? `${wellbeingSessions} sessions logged`
                            : "Log your activities"}
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    {/* History */}
                    <Link
                      to="/history"
                      className="list-group-item list-group-item-action d-flex align-items-center py-2"
                    >
                      <i className="bi bi-clock-history text-info me-3 fs-5"></i>
                      <div className="flex-grow-1">
                        <div className="fw-medium small">History</div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {isProgrammeMode
                            ? `${streak} workouts completed`
                            : "View your progress"}
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </Link>

                    {/* Programme - Only in Programme Mode */}
                    {isProgrammeMode && (
                      <Link
                        to="/programme"
                        className="list-group-item list-group-item-action d-flex align-items-center py-2"
                      >
                        <i className="bi bi-journal-text text-secondary me-3 fs-5"></i>
                        <div className="flex-grow-1">
                          <div className="fw-medium small">Programme</div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            View full programme
                          </div>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Workout Summary - Only for Programme Mode */}
          {isProgrammeMode && lastWorkout && (
            <div className="accordion mb-3" id="lastWorkoutAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseLastWorkout"
                    aria-expanded="false"
                    aria-controls="collapseLastWorkout"
                  >
                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                      <div>
                        <i className="bi bi-clipboard-check me-2"></i>
                        <span className="fw-semibold">{lastWorkout.name}</span>
                        <span className="text-muted ms-2 small">
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(lastWorkout.date).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-primary">
                          {lastWorkout.duration || "--"} min
                        </span>
                      </div>
                    </div>
                  </button>
                </h2>
                <div
                  id="collapseLastWorkout"
                  className="accordion-collapse collapse"
                  data-bs-parent="#lastWorkoutAccordion"
                >
                  <div className="accordion-body">
                    {/* Display all exercises/machines worked on */}
                    {lastWorkout.exercises &&
                      lastWorkout.exercises.length > 0 && (
                        <>
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
                        </>
                      )}
                  </div>
                </div>
              </div>
            </div>
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
