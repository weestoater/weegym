/**
 * Example: Updated WorkoutSession.jsx using Database
 *
 * This file shows how to update your WorkoutSession component
 * to load programme data from the database instead of hardcoded values.
 *
 * Key changes:
 * 1. Loads programme from database based on day parameter
 * 2. Dynamically uses programme exercises
 * 3. Handles loading and error states
 * 4. Maintains all existing workout tracking functionality
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveWorkout as saveWorkoutToDb } from "../lib/database";
import { getFullProgrammeByDay } from "../services/userProfileService";
import Toast from "../components/Toast";

function WorkoutSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const day = searchParams.get("day") || "1";

  // Programme data from database
  const [programmeData, setProgrammeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Workout state (existing)
  const [workout, setWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [startTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultRestTime: 90,
    shortRestTime: 60,
    longRestTime: 120,
  });

  // Load programme from database
  useEffect(() => {
    loadProgramme();
  }, [day]);

  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem("gymSettings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  // Initialize workout when programme loads
  useEffect(() => {
    if (programmeData && programmeData.exercises) {
      initializeWorkout();
    }
  }, [programmeData, settings]);

  const loadProgramme = async () => {
    try {
      setLoading(true);
      const programme = await getFullProgrammeByDay(parseInt(day));

      if (!programme) {
        setToast({
          message: `No programme found for Day ${day}. Please create one first.`,
          type: "warning",
        });
        setLoading(false);
        return;
      }

      // Convert database format to component format
      const formattedProgramme = {
        name: programme.name,
        description: programme.description,
        target: programme.target_areas,
        exercises: programme.exercises.map((exercise) => ({
          id: `d${day}e${exercise.id}`,
          name: exercise.name,
          type: exercise.type.charAt(0), // "Machine" -> "M"
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.rest_seconds,
          notes: exercise.notes,
        })),
      };

      setProgrammeData(formattedProgramme);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load programme:", err);
      setToast({
        message: "Failed to load workout programme",
        type: "danger",
      });
      setLoading(false);
    }
  };

  const initializeWorkout = () => {
    // Update rest times based on settings
    const workoutWithSettings = {
      ...programmeData,
      exercises: programmeData.exercises.map((exercise) => {
        let restTime = settings.defaultRestTime;

        // Determine rest time based on exercise characteristics
        if (exercise.restSeconds >= 120) {
          restTime = settings.longRestTime;
        } else if (exercise.restSeconds <= 60) {
          restTime = settings.shortRestTime;
        } else {
          restTime = settings.defaultRestTime;
        }

        return {
          ...exercise,
          restSeconds: restTime,
        };
      }),
    };

    setWorkout(workoutWithSettings);
  };

  // Rest of your existing workout logic...
  // (All the timer, exercise completion, and save functions remain the same)

  const startExercise = (index) => {
    setCurrentExerciseIndex(index);
    setCurrentSet(1);
    setWeight("");
    setReps("");
    setIsResting(false);
  };

  const completeSet = () => {
    if (!weight || !reps) {
      setToast({
        message: "Please enter weight and reps",
        type: "warning",
      });
      return;
    }

    const currentExercise = workout.exercises[currentExerciseIndex];

    // Add to log
    const logEntry = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      set: currentSet,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      timestamp: new Date().toISOString(),
    };

    setWorkoutLog([...workoutLog, logEntry]);

    // Check if all sets completed
    if (currentSet >= currentExercise.sets) {
      setCompletedExercises([...completedExercises, currentExercise.id]);
      setCurrentExerciseIndex(null);
      setToast({
        message: `${currentExercise.name} completed!`,
        type: "success",
      });
    } else {
      // Start rest timer
      setIsResting(true);
      setRestTimeLeft(currentExercise.restSeconds);
      setCurrentSet(currentSet + 1);
      setWeight("");
      setReps("");
    }
  };

  const finishWorkout = async () => {
    if (workoutLog.length === 0) {
      setToast({
        message: "No exercises logged",
        type: "warning",
      });
      return;
    }

    try {
      setIsSaving(true);

      const duration = Math.floor((new Date() - startTime) / 1000);

      // Group log by exercise
      const exercisesData = {};
      workoutLog.forEach((entry) => {
        if (!exercisesData[entry.exerciseId]) {
          exercisesData[entry.exerciseId] = {
            name: entry.exerciseName,
            sets: [],
          };
        }
        exercisesData[entry.exerciseId].sets.push({
          weight: entry.weight,
          reps: entry.reps,
        });
      });

      const workoutData = {
        date: startTime.toISOString(),
        name: workout.name,
        duration,
        exercises: Object.values(exercisesData),
      };

      await saveWorkoutToDb(workoutData);

      setToast({
        message: "Workout saved successfully!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/history");
      }, 1500);
    } catch (err) {
      console.error("Failed to save workout:", err);
      setToast({
        message: "Failed to save workout",
        type: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Rest timer effect
  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      const timer = setTimeout(() => {
        setRestTimeLeft(restTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
      setToast({
        message: "Rest complete! Ready for next set.",
        type: "info",
      });
    }
  }, [isResting, restTimeLeft]);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading workout...</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4 className="alert-heading">No Programme Available</h4>
          <p>Day {day} programme not found. Please create it first.</p>
          <hr />
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile-manager")}
          >
            Create Programme
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5 pb-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 mb-2">{workout.name}</h2>
          {workout.description && (
            <p className="text-muted small mb-2">{workout.description}</p>
          )}
          {workout.target && (
            <p className="small mb-0">
              <i className="bi bi-bullseye me-1"></i>
              <strong>Target:</strong> {workout.target}
            </p>
          )}
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="alert alert-info text-center">
          <h3 className="h4 mb-2">Rest Time</h3>
          <div className="display-1">{restTimeLeft}s</div>
          <button
            className="btn btn-sm btn-outline-primary mt-2"
            onClick={() => {
              setIsResting(false);
              setRestTimeLeft(0);
            }}
          >
            Skip Rest
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="mb-3">
        <h3 className="h6 mb-3">Exercises</h3>
        {workout.exercises.map((exercise, index) => {
          const isActive = currentExerciseIndex === index;
          const isCompleted = completedExercises.includes(exercise.id);

          return (
            <div
              key={exercise.id}
              className={`card mb-3 ${isActive ? "border-primary" : ""} ${
                isCompleted ? "bg-light" : ""
              }`}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h4 className="h6 mb-1">
                      {isCompleted && (
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                      )}
                      {exercise.name}
                    </h4>
                    <span className="badge bg-secondary me-2">
                      {exercise.type}
                    </span>
                    <span className="small text-muted">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                  {!isCompleted && !isActive && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => startExercise(index)}
                      disabled={isResting}
                    >
                      Start
                    </button>
                  )}
                </div>

                {exercise.notes && (
                  <p className="small text-muted mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    {exercise.notes}
                  </p>
                )}

                {/* Active Exercise Input */}
                {isActive && !isResting && (
                  <div className="border-top pt-3 mt-2">
                    <div className="alert alert-primary py-2 mb-2">
                      <strong>
                        Set {currentSet} of {exercise.sets}
                      </strong>
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small">Weight (kg)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="0"
                          step="0.5"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small">Reps</label>
                        <input
                          type="number"
                          className="form-control"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-success w-100"
                          onClick={completeSet}
                          disabled={!weight || !reps}
                        >
                          Complete Set
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show logged sets */}
                {workoutLog.filter((log) => log.exerciseId === exercise.id)
                  .length > 0 && (
                  <div className="border-top pt-2 mt-2">
                    <small className="text-muted">Completed sets:</small>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {workoutLog
                        .filter((log) => log.exerciseId === exercise.id)
                        .map((log, idx) => (
                          <span key={idx} className="badge bg-success">
                            Set {log.set}: {log.weight}kg × {log.reps}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Workout Button */}
      {workoutLog.length > 0 && (
        <div className="card border-success">
          <div className="card-body text-center">
            <h3 className="h6 mb-3">
              {completedExercises.length} of {workout.exercises.length}{" "}
              exercises completed
            </h3>
            <button
              className="btn btn-success btn-lg"
              onClick={finishWorkout}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Finish Workout
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutSession;
