import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Sample programme data - will be moved to a data file later
const PROGRAMME = {
  day1: {
    name: "Day 1",
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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [startTime] = useState(new Date());
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

  const currentExercise = workout.exercises[currentExerciseIndex];
  const isLastSet = currentSet === currentExercise.sets;
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;

  const handleLogSet = () => {
    if (!weight || !reps) {
      alert("Please enter weight and reps");
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
        // Workout complete
        saveWorkout();
      } else {
        // Next exercise
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
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

  const saveWorkout = () => {
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes

    const workoutData = {
      id: Date.now(),
      date: startTime.toISOString(),
      name: workout.name,
      duration,
      exercises: workoutLog,
    };

    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    workouts.push(workoutData);
    localStorage.setItem("workouts", JSON.stringify(workouts));

    alert("Workout saved! Great job! 💪");
    navigate("/");
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  return (
    <div className="container mt-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </span>
          <span>
            Set {currentSet} of {currentExercise.sets}
          </span>
        </div>
        <div className="progress" style={{ height: "8px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Set progress"
            aria-valuenow={Math.round(
              ((currentExerciseIndex * currentExercise.sets + currentSet) /
                (workout.exercises.length * 3)) *
                100,
            )}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
              width: `${((currentExerciseIndex * currentExercise.sets + currentSet) / (workout.exercises.length * 3)) * 100}%`,
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
