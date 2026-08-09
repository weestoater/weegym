import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveWorkout as saveWorkoutToDb } from "../lib/database";
import Toast from "../components/Toast";

// Sample programme data - will be moved to a data file later
const PROGRAMME = {
  day1: {
    name: "Day 1 - Upper Body",
    description: "Push Focus: Chest, Shoulders, Triceps",
    target: "Chest • Shoulders • Arms • Back",
    exercises: [
      {
        id: "d1e1",
        name: "Chest Press",
        type: "M",
        sets: 3,
        reps: "6-8",
        restSeconds: 90,
        muscleGroups: ["Chest", "Triceps", "Front Shoulders"],
        formTips: [
          "Keep feet flat on floor",
          "Press shoulder blades into the pad",
          "Push straight forward, not up",
          "Full extension without locking elbows",
        ],
        demoUrl:
          "https://exrx.net/WeightExercises/PectoralSternal/LVChestPress",
      },
      {
        id: "d1e2",
        name: "Lat Pulldown",
        type: "M",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        muscleGroups: ["Lats", "Upper Back", "Biceps"],
        formTips: [
          "Lean back slightly (15-20 degrees)",
          "Pull bar to upper chest",
          "Lead with elbows, not hands",
          "Squeeze shoulder blades together at bottom",
        ],
        demoUrl:
          "https://exrx.net/WeightExercises/LatissimusDorsi/LVFrontPulldown",
      },
      {
        id: "d1e3",
        name: "Cable Row",
        type: "M",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        muscleGroups: ["Mid Back", "Lats", "Rear Shoulders"],
        formTips: [
          "Sit upright with chest proud",
          "Pull handle to lower chest/upper abs",
          "Keep elbows close to body",
          "Squeeze shoulder blades at the back",
        ],
        demoUrl: "https://exrx.net/WeightExercises/BackGeneral/CBSeatedRow",
      },
      {
        id: "d1e4",
        name: "Face Pulls",
        type: "M",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        muscleGroups: ["Rear Shoulders", "Upper Back", "Rotator Cuff"],
        formTips: [
          "Pull rope towards face/forehead level",
          "Separate rope ends as you pull",
          "Externally rotate shoulders at peak",
          "Focus on rear delt squeeze",
        ],
        demoUrl:
          "https://exrx.net/WeightExercises/DeltoidPosterior/CBStandingRearDeltRowRope",
      },
      {
        id: "d1e5",
        name: "Leg Extension",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
        muscleGroups: ["Quadriceps"],
        formTips: [
          "Adjust seat so knees align with pivot point",
          "Grip handles for stability",
          "Extend legs fully, pause at top",
          "Control the weight down slowly",
        ],
        demoUrl: "https://exrx.net/WeightExercises/Quadriceps/LVLegExtension",
      },
      {
        id: "d1e6",
        name: "Alternating Lateral Raised",
        type: "F",
        sets: 2,
        reps: "10-12",
        restSeconds: 60,
        muscleGroups: ["Side Shoulders"],
        formTips: [
          "Stand with slight knee bend",
          "Raise one arm to shoulder height",
          "Lead with elbow, slight bend in arm",
          "Pour the pitcher at top (thumb down)",
        ],
        demoUrl:
          "https://exrx.net/WeightExercises/DeltoidLateral/DBLateralRaise",
      },
      {
        id: "d1e7",
        name: "Tricep Pushdown (Rope)",
        type: "M",
        sets: 2,
        reps: "10-12",
        restSeconds: 60,
        muscleGroups: ["Triceps"],
        formTips: [
          "Keep elbows pinned to sides",
          "Start with rope at chest height",
          "Push down and slightly apart at bottom",
          "Fully extend arms, squeeze triceps",
        ],
        demoUrl: "https://exrx.net/WeightExercises/Triceps/CBPushdown",
      },
    ],
  },
  day2: {
    name: "Day 2 - Mixed Areas",
    description: "Legs, Shoulders & Core Strength",
    target: "Legs • Shoulders • Core • Back",
    exercises: [
      {
        id: "d2e1",
        name: "Seated Row",
        type: "M",
        sets: 3,
        reps: "6-8",
        restSeconds: 90,
        muscleGroups: ["Mid Back", "Lats", "Biceps"],
        formTips: [
          "Sit tall with chest up",
          "Pull handles to lower chest",
          "Squeeze shoulder blades together",
          "Keep core tight throughout",
        ],
        demoUrl: "https://exrx.net/WeightExercises/BackGeneral/LVSeatedRow",
      },
      {
        id: "d2e2",
        name: "T-Bar Row",
        type: "M",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        muscleGroups: ["Lats", "Mid Back", "Traps"],
        formTips: [
          "Hinge at hips, flat back",
          "Pull weight to chest",
          "Lead with elbows",
          "Control the negative",
        ],
        demoUrl: "https://exrx.net/WeightExercises/BackGeneral/LVTBarRow",
      },
      {
        id: "d2e3",
        name: "Single-Arm Dumbbell Row",
        type: "F",
        sets: 3,
        reps: "10-12",
        restSeconds: 60,
        muscleGroups: ["Lats", "Mid Back", "Biceps"],
        formTips: [
          "Support yourself on bench",
          "Pull dumbbell to hip",
          "Keep back flat, don't rotate",
          "Feel the lat stretch at bottom",
        ],
        demoUrl: "https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow",
      },
      {
        id: "d2e4",
        name: "Leg Curl",
        type: "M",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
        muscleGroups: ["Hamstrings"],
        formTips: [
          "Lie flat, align knees with machine pivot",
          "Curl heels towards glutes",
          "Squeeze hamstrings at top",
          "Don't lift hips off pad",
        ],
        demoUrl: "https://exrx.net/WeightExercises/Hamstrings/LVLyingLegCurl",
      },
      {
        id: "d2e5",
        name: "Shoulder Press",
        type: "M",
        sets: 3,
        reps: "8-10",
        restSeconds: 90,
        muscleGroups: ["Front Shoulders", "Side Shoulders", "Triceps"],
        formTips: [
          "Sit upright, core engaged",
          "Press straight overhead",
          "Don't lock elbows at top",
          "Lower with control to ear level",
        ],
        demoUrl:
          "https://exrx.net/WeightExercises/DeltoidAnterior/LVShoulderPress",
      },
      {
        id: "d2e6",
        name: "Dumbell Hammer Curl",
        type: "F",
        sets: 2,
        reps: "10-12",
        restSeconds: 60,
        muscleGroups: ["Biceps", "Forearms"],
        formTips: [
          "Stand with neutral grip (thumbs up)",
          "Keep elbows at sides",
          "Curl to shoulder height",
          "No swinging or momentum",
        ],
        demoUrl:
          "https://exrx.net/WeightExercises/Brachioradialis/DBHammerCurl",
      },
      {
        id: "d2e7",
        name: "Overhead Tricep Extensions (V-Bar)",
        type: "M",
        sets: 2,
        reps: "10-12",
        restSeconds: 60,
        muscleGroups: ["Triceps"],
        formTips: [
          "Extend arms overhead",
          "Keep elbows close to head",
          "Lower behind head with control",
          "Press up to full extension",
        ],
        demoUrl: "https://exrx.net/WeightExercises/Triceps/CBTriExt",
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
  const [isSaving, setIsSaving] = useState(false);
  const [settings] = useState(() => {
    const storedSettings = localStorage.getItem("gymSettings");
    return storedSettings
      ? JSON.parse(storedSettings)
      : { defaultRestTime: 90, shortRestTime: 60, longRestTime: 120 };
  });

  useEffect(() => {
    // Initialize workout with dynamic rest times based on settings.
    // workout is mutable state during a session (sets completed, weights logged)
    // so useMemo is not appropriate here.
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Function to save workout
  const saveWorkout = async () => {
    if (isSaving) return; // Prevent double-clicks

    setIsSaving(true);
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes

    const workoutData = {
      date: startTime.toISOString(),
      name: workout.name,
      duration,
      exercises: workoutLog,
    };

    try {
      console.log("Saving workout:", workoutData);
      await saveWorkoutToDb(workoutData);
      console.log("Workout saved successfully!");
      setToast({ message: "Workout saved! Great job! 💪", type: "success" });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Failed to save workout:", error);

      // Fallback to localStorage if Supabase fails
      try {
        const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
        workouts.push({ id: Date.now(), ...workoutData });
        localStorage.setItem("workouts", JSON.stringify(workouts));
        setToast({
          message: "Workout saved locally! Great job! 💪",
          type: "success",
        });
        setTimeout(() => navigate("/"), 1500);
      } catch (localError) {
        console.error("Failed to save to localStorage:", localError);
        setToast({
          message: "Failed to save workout. Please try again.",
          type: "error",
        });
        setIsSaving(false);
      }
    }
  };

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
      exerciseId: workout?.exercises[currentExerciseIndex]?.id,
      exerciseName: workout?.exercises[currentExerciseIndex]?.name,
      set: currentSet,
      weight: parseFloat(weight),
      reps: parseInt(reps),
    };
    setWorkoutLog([...workoutLog, setLog]);

    const currentExercise = workout.exercises[currentExerciseIndex];
    const isLastSet = currentSet === currentExercise.sets;
    const isLastExercise =
      completedExercises.length === workout.exercises.length - 1;

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

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  if (!workout) return null;

  // If no exercise selected, show exercise selection screen
  if (currentExerciseIndex === null) {
    const availableExercises = workout.exercises.filter(
      (_, index) => !completedExercises.includes(index),
    );

    return (
      <div className="container mt-4">
        {/* Day Selection Tabs */}
        <div className="mb-4">
          <h2>
            <i className="bi bi-play-circle me-2"></i>
            Workout
          </h2>
          <p className="text-muted">Choose your workout day and exercise</p>
        </div>

        <div className="btn-group w-100 mb-4" role="group">
          <button
            type="button"
            className={`btn ${
              day === "1" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => navigate("/workout?day=1")}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Day 1 - Upper Body
          </button>
          <button
            type="button"
            className={`btn ${
              day === "2" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => navigate("/workout?day=2")}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Day 2 - Mixed Areas
          </button>
        </div>

        {/* Workout Info Banner */}
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <h3 className="h6 mb-1">{workout.name}</h3>
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
              aria-label="Workout progress"
              aria-valuenow={completedExercises.length}
              aria-valuemin="0"
              aria-valuemax={workout.exercises.length}
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Complete Workout
                  </>
                )}
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
                    <div className="flex-grow-1">
                      <h5 className="mb-1">
                        {isCompleted && (
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                        )}
                        {exercise.name}
                      </h5>
                      <div className="d-flex flex-wrap gap-1 mb-1">
                        {exercise.muscleGroups &&
                          exercise.muscleGroups.map((muscle, idx) => (
                            <span
                              key={idx}
                              className="badge bg-light text-dark"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {muscle}
                            </span>
                          ))}
                      </div>
                      <small className="text-muted d-block">
                        {exercise.sets} sets × {exercise.reps} reps
                        <span className="ms-2">
                          <i className="bi bi-circle-fill me-1"></i>
                          {exercise.type === "M" ? "Machine" : "Free Weights"}
                        </span>
                      </small>
                      {exercise.demoUrl && (
                        <a
                          href={exercise.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-block mt-1 small text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="bi bi-play-circle me-1"></i>Watch demo
                        </a>
                      )}
                    </div>
                    <div className="text-end ms-2">
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

  return (
    <div className="container mt-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Day Selection Tabs */}
      <div className="btn-group w-100 mb-3" role="group">
        <button
          type="button"
          className={`btn btn-sm ${
            day === "1" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => navigate("/workout?day=1")}
        >
          <i className="bi bi-calendar-check me-1"></i>
          Day 1
        </button>
        <button
          type="button"
          className={`btn btn-sm ${
            day === "2" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => navigate("/workout?day=2")}
        >
          <i className="bi bi-calendar-check me-1"></i>
          Day 2
        </button>
      </div>

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
            <div className="flex-grow-1">
              <h2 className="h4 mb-2">{currentExercise.name}</h2>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <span className="badge bg-secondary">
                  {currentExercise.type === "M" ? "Machine" : "Free Weights"}
                </span>
                {currentExercise.muscleGroups &&
                  currentExercise.muscleGroups.map((muscle, idx) => (
                    <span key={idx} className="badge bg-info">
                      {muscle}
                    </span>
                  ))}
              </div>
              {currentExercise.demoUrl && (
                <a
                  href={currentExercise.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary mt-2"
                >
                  <i className="bi bi-play-circle me-1"></i>Watch Demo Video
                </a>
              )}
            </div>
            <span className="badge bg-primary fs-6">
              Set {currentSet}/{currentExercise.sets}
            </span>
          </div>

          <div className="mb-3">
            <p className="text-muted mb-2">
              <i className="bi bi-arrow-repeat me-2"></i>
              Target: {currentExercise.reps} reps
            </p>
          </div>

          {/* Form Tips */}
          {currentExercise.formTips && currentExercise.formTips.length > 0 && (
            <div className="alert alert-light border-start border-primary border-4 mb-0">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-info-circle text-primary me-2"></i>
                <strong className="text-primary">Form Guide</strong>
              </div>
              <ul className="mb-0 ps-3" style={{ fontSize: "0.9rem" }}>
                {currentExercise.formTips.map((tip, idx) => (
                  <li key={idx} className="mb-1">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      {!isResting && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Weight (kg)
                <FieldTooltip content="Enter the weight used for this set" />
              </label>
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
              <label className="form-label fw-bold">
                Reps
                <FieldTooltip content="How many repetitions did you complete?" />
              </label>
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
