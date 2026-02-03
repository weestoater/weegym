import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveWorkout as saveWorkoutToDb } from "../lib/database";
import Toast from "../components/Toast";

// Sample programme data - will be moved to a data file later
const PROGRAMME = {
  day1: {
    name: "Day 1",
    description: "Upper Body - Push (Chest, Shoulders, Triceps)",
    target: "Chest • Shoulders • Arms",
    exercises: [
      {
        id: "d1e1",
        name: "Chest Press",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
      },
      {
        id: "d1e2",
        name: "Lat Pulldown",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
      },
      {
        id: "d1e3",
        name: "Shoulder Press",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
      },
      {
        id: "d1e4",
        name: "Bicep Curls",
        type: "F",
        sets: 3,
        reps: "10-12",
        restSeconds: 60,
      },
      {
        id: "d1e5",
        name: "Tricep Extensions",
        type: "F",
        sets: 3,
        reps: "10-12",
        restSeconds: 60,
      },
    ],
  },
  day2: {
    name: "Day 2",
    description: "Lower Body & Core (Legs, Glutes, Abs)",
    target: "Legs • Glutes • Core",
    exercises: [
      {
        id: "d2e1",
        name: "Leg Press",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 120,
      },
      {
        id: "d2e2",
        name: "Leg Curl",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
      },
      {
        id: "d2e3",
        name: "Leg Extension",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
      },
      {
        id: "d2e4",
        name: "Calf Raises",
        type: "M",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
      },
      {
        id: "d2e5",
        name: "Plank",
        type: "F",
        sets: 3,
        reps: "30-60s",
        restSeconds: 60,
      },
    ],
  },
};

function WorkoutSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const day = searchParams.get("day") || "1";

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
  const [settings, setSettings] = useState({
    defaultRestTime: 90,
    shortRestTime: 60,
    longRestTime: 120,
  });

  useEffect(() => {
    // Load settings
    const storedSettings = localStorage.getItem("gymSettings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  useEffect(() => {
    // Initialize workout with dynamic rest times
    const programmeData = day === "1" ? PROGRAMME.day1 : PROGRAMME.day2;

    // Update rest times based on exercise type and settings
    const workoutWithSettings = {
      ...programmeData,
      exercises: programmeData.exercises.map((exercise) => {
        let restTime = settings.defaultRestTime;

        // Determine rest time based on exercise characteristics
        if (exercise.restSeconds >= 120) {
          restTime = settings.longRestTime; // Compound/heavy exercises
        } else if (exercise.restSeconds <= 60) {
          restTime = settings.shortRestTime; // Isolation exercises
        } else {
          restTime = settings.defaultRestTime; // Standard exercises
        }

        return { ...exercise, restSeconds: restTime };
      }),
    };

    setWorkout(workoutWithSettings);
  }, [day, settings]);

  useEffect(() => {
    // Rest timer
    let interval;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  if (!workout) return null;

  // If no exercise selected, show exercise selection screen
  if (currentExerciseIndex === null) {
    const availableExercises = workout.exercises.filter(
      (_, index) => !completedExercises.includes(index),
    );

    return (
      <div className="container mt-4">
        {/* Workout Info Banner */}
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <h2 className="h5 mb-1">
              <i className="bi bi-list-check me-2"></i>
              {workout.name}
            </h2>
            <p className="text-muted small mb-0">
              <i className="bi bi-bullseye me-1"></i>
              {workout.target}
            </p>
          </div>
        </div>

        <h3 className="h6 text-muted mb-3">CHOOSE NEXT EXERCISE</h3>

        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Select which exercise you want to do next. This lets you work around
          busy equipment.
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between text-muted small mb-2">
            <span>
              {completedExercises.length} of {workout.exercises.length}{" "}
              exercises completed
            </span>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${(completedExercises.length / workout.exercises.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {availableExercises.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-check-circle text-success fs-1 mb-3"></i>
              <h3>All exercises completed!</h3>
              <button
                className="btn btn-success btn-lg mt-3"
                onClick={saveWorkout}
              >
                <i className="bi bi-check-circle me-2"></i>
                Complete Workout
              </button>
            </div>
          </div>
        ) : (
          <div className="list-group">
            {workout.exercises.map((exercise, index) => {
              const isCompleted = completedExercises.includes(index);
              const setsCompleted = workoutLog.filter(
                (log) => log.exerciseId === exercise.id,
              ).length;

              return (
                <button
                  key={exercise.id}
                  className={`list-group-item list-group-item-action ${isCompleted ? "list-group-item-success" : ""}`}
                  onClick={() => {
                    if (!isCompleted) {
                      setCurrentExerciseIndex(index);
                      setCurrentSet(1);
                    }
                  }}
                  disabled={isCompleted}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {isCompleted && (
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                        )}
                        {exercise.name}
                      </h5>
                      <small className="text-muted">
                        {exercise.sets} sets × {exercise.reps} reps
                        <span className="ms-2">
                          <i className="bi bi-circle-fill me-1"></i>
                          {exercise.type === "M" ? "Machine" : "Free Weights"}
                        </span>
                      </small>
                    </div>
                    <div className="text-end">
                      {isCompleted ? (
                        <span className="badge bg-success">Complete</span>
                      ) : setsCompleted > 0 ? (
                        <span className="badge bg-warning text-dark">
                          {setsCompleted}/{exercise.sets} sets
                        </span>
                      ) : (
                        <i className="bi bi-chevron-right"></i>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastSet = currentSet === currentExercise.sets;
  const isLastExercise =
    completedExercises.length === workout.exercises.length - 1;

  const handleBackToSelection = () => {
    setCurrentExerciseIndex(null);
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleLogSet = () => {
    if (!weight || !reps) {
      setToast({ message: "Please enter weight and reps", type: "warning" });
      return;
    }

    // Log the set
    const setLog = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      set: currentSet,
      weight: parseFloat(weight),
      reps: parseInt(reps),
    };
    setWorkoutLog([...workoutLog, setLog]);

    // Move to next set or exercise
    if (isLastSet) {
      if (isLastExercise) {
        // All exercises completed - but mark this one complete first
        setCompletedExercises([...completedExercises, currentExerciseIndex]);
        setCurrentExerciseIndex(null);
      } else {
        // Exercise complete - go back to selection screen
        setCompletedExercises([...completedExercises, currentExerciseIndex]);
        setCurrentExerciseIndex(null);
        setWeight("");
        setReps("");
      }
    } else {
      // Next set - start rest timer
      setCurrentSet((prev) => prev + 1);
      setIsResting(true);
      setRestTimeLeft(currentExercise.restSeconds);
      setWeight("");
      setReps("");
    }
  };

  const saveWorkout = async () => {
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes

    const workoutData = {
      date: startTime.toISOString(),
      name: workout.name,
      duration,
      exercises: workoutLog,
    };

    try {
      await saveWorkoutToDb(workoutData);
      setToast({ message: "Workout saved! Great job! 💪", type: "success" });
      navigate("/");
    } catch (error) {
      console.error("Failed to save workout:", error);
      // Fallback to localStorage if Supabase fails
      const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
      workouts.push({ id: Date.now(), ...workoutData });
      localStorage.setItem("workouts", JSON.stringify(workouts));
      setToast({
        message: "Workout saved locally! Great job! 💪",
        type: "success",
      });
      navigate("/");
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  return (
    <div className="container mt-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header with back button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleBackToSelection}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Choose Different Exercise
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>
            {completedExercises.length + 1} of {workout.exercises.length}{" "}
            exercises
          </span>
          <span>
            Set {currentSet} of {currentExercise.sets}
          </span>
        </div>
        <div className="progress" style={{ height: "8px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Workout progress"
            aria-valuenow={Math.round(
              ((completedExercises.length * 3 + currentSet) /
                (workout.exercises.length * 3)) *
                100,
            )}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
              width: `${((completedExercises.length * 3 + currentSet) / (workout.exercises.length * 3)) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="card bg-warning text-dark mb-4">
          <div className="card-body text-center">
            <h3 className="display-4 mb-2">{restTimeLeft}s</h3>
            <p className="mb-2">Rest time remaining</p>
            <button className="btn btn-dark btn-sm" onClick={skipRest}>
              Skip Rest
            </button>
          </div>
        </div>
      )}

      {/* Current Exercise */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="h4 mb-1">{currentExercise.name}</h2>
              <span className="badge bg-secondary">
                {currentExercise.type === "M" ? "Machine" : "Free Weights"}
              </span>
            </div>
            <span className="badge bg-primary fs-6">
              Set {currentSet}/{currentExercise.sets}
            </span>
          </div>
          <p className="text-muted mb-0">
            <i className="bi bi-arrow-repeat me-2"></i>
            Target: {currentExercise.reps} reps
          </p>
        </div>
      </div>

      {/* Input Form */}
      {!isResting && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-bold">Weight (kg)</label>
              <input
                type="number"
                className="form-control form-control-lg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 20"
                inputMode="decimal"
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Reps</label>
              <input
                type="number"
                className="form-control form-control-lg"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="e.g. 12"
                inputMode="numeric"
              />
            </div>
            <button
              className="btn btn-success btn-lg w-100 btn-touch"
              onClick={handleLogSet}
              disabled={!weight || !reps}
            >
              <i className="bi bi-check-circle me-2"></i>
              {isLastSet && isLastExercise ? "Complete Workout" : "Log Set"}
            </button>
          </div>
        </div>
      )}

      {/* Previous Sets */}
      {workoutLog.filter((log) => log.exerciseId === currentExercise.id)
        .length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="h6 mb-0">Previous Sets</h3>
          </div>
          <div className="list-group list-group-flush">
            {workoutLog
              .filter((log) => log.exerciseId === currentExercise.id)
              .map((log, index) => (
                <div
                  key={index}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>Set {log.set}</span>
                  <span className="fw-bold">
                    {log.weight}kg × {log.reps}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutSession;
