import { useState, useEffect } from "react";
import {
  getWorkouts,
  deleteWorkout as deleteWorkoutFromDb,
  updateWorkout,
} from "../lib/database";
import Toast from "../components/Toast";

function Programme() {
  // History state management
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingDate, setEditingDate] = useState(false);
  const [editedDate, setEditedDate] = useState("");
  const [editingDuration, setEditingDuration] = useState(false);
  const [editedDuration, setEditedDuration] = useState("");

  // Load workouts on mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to load workouts from Supabase:", error);
      // Fallback to localStorage
      const storedWorkouts = JSON.parse(
        localStorage.getItem("workouts") || "[]",
      );
      setWorkouts(storedWorkouts.reverse());
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await deleteWorkoutFromDb(id);
      await loadWorkouts();
      setSelectedWorkout(null);
      setToast({ message: "Workout deleted successfully", type: "success" });
    } catch (error) {
      console.error("Failed to delete workout:", error);
      setToast({
        message: "Failed to delete workout. Please try again.",
        type: "error",
      });
    }
  };

  const handleEditDate = () => {
    const currentDate = new Date(selectedWorkout.date);
    const formattedDate = currentDate.toISOString().split("T")[0];
    setEditedDate(formattedDate);
    setEditingDate(true);
  };

  const handleSaveDate = async () => {
    try {
      const newDate = new Date(editedDate).toISOString();

      try {
        await updateWorkout(selectedWorkout.id, { date: newDate });
      } catch (dbError) {
        console.log("Supabase update failed, updating localStorage:", dbError);
        const storedWorkouts = JSON.parse(
          localStorage.getItem("workouts") || "[]",
        );
        const updatedWorkouts = storedWorkouts.map((w) =>
          w.id === selectedWorkout.id ? { ...w, date: newDate } : w,
        );
        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
      }

      const updatedWorkout = { ...selectedWorkout, date: newDate };
      setSelectedWorkout(updatedWorkout);
      setEditingDate(false);
      await loadWorkouts();

      setToast({
        message: "Workout date updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update workout date:", error);
      setToast({
        message: "Failed to update workout date. Please try again.",
        type: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingDate(false);
    setEditedDate("");
  };

  const handleEditDuration = () => {
    setEditedDuration(selectedWorkout.duration.toString());
    setEditingDuration(true);
  };

  const handleSaveDuration = async () => {
    try {
      const newDuration = parseInt(editedDuration);

      if (isNaN(newDuration) || newDuration <= 0) {
        setToast({
          message: "Please enter a valid duration in minutes",
          type: "error",
        });
        return;
      }

      try {
        await updateWorkout(selectedWorkout.id, { duration: newDuration });
      } catch (dbError) {
        console.log("Supabase update failed, updating localStorage:", dbError);
        const storedWorkouts = JSON.parse(
          localStorage.getItem("workouts") || "[]",
        );
        const updatedWorkouts = storedWorkouts.map((w) =>
          w.id === selectedWorkout.id ? { ...w, duration: newDuration } : w,
        );
        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
      }

      const updatedWorkout = { ...selectedWorkout, duration: newDuration };
      setSelectedWorkout(updatedWorkout);
      setEditingDuration(false);
      await loadWorkouts();

      setToast({
        message: "Workout duration updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update workout duration:", error);
      setToast({
        message: "Failed to update workout duration. Please try again.",
        type: "error",
      });
    }
  };

  const handleCancelDurationEdit = () => {
    setEditingDuration(false);
    setEditedDuration("");
  };

  const programmeData = {
    client: {
      name: "Ian Burrett",
      instructor: "Adam",
      date: "31/01/26",
      review: "Intro",
    },
    day1: {
      name: "Day 1 - Upper Body",
      description: "Push Focus: Chest, Shoulders, Triceps",
      target: "Chest • Shoulders • Arms • Back",
      exercises: [
        {
          name: "Chest Press",
          type: "Machine",
          sets: 3,
          reps: "6-8",
          rest: "90s",
          demoUrl:
            "https://exrx.net/WeightExercises/PectoralSternal/LVChestPress",
        },
        {
          name: "Lat Pulldown",
          type: "Machine",
          sets: 3,
          reps: "8-10",
          rest: "90s",
          demoUrl:
            "https://exrx.net/WeightExercises/LatissimusDorsi/LVFrontPulldown",
        },
        {
          name: "Cable Row",
          type: "Machine",
          sets: 3,
          reps: "8-10",
          rest: "90s",
          demoUrl: "https://exrx.net/WeightExercises/BackGeneral/CBSeatedRow",
        },
        {
          name: "Face Pulls",
          type: "Machine",
          sets: 3,
          reps: "12-15",
          rest: "60s",
          demoUrl:
            "https://exrx.net/WeightExercises/DeltoidPosterior/CBStandingRearDeltRowRope",
        },
        {
          name: "Leg Extension",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
          demoUrl: "https://exrx.net/WeightExercises/Quadriceps/LVLegExtension",
        },
        {
          name: "Alternating Lateral Raised",
          type: "Free-weights",
          sets: 2,
          reps: "10-12",
          rest: "60s",
          demoUrl:
            "https://exrx.net/WeightExercises/DeltoidLateral/DBLateralRaise",
        },
        {
          name: "Tricep Pushdown (Rope)",
          type: "Machine",
          sets: 2,
          reps: "10-12",
          rest: "60s",
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
          name: "Seated Row",
          type: "Machine",
          sets: 3,
          reps: "6-8",
          rest: "90s",
          demoUrl: "https://exrx.net/WeightExercises/BackGeneral/LVSeatedRow",
        },
        {
          name: "T-Bar Row",
          type: "Machine",
          sets: 3,
          reps: "8-10",
          rest: "90s",
          demoUrl: "https://exrx.net/WeightExercises/BackGeneral/LVTBarRow",
        },
        {
          name: "Single-Arm Dumbbell Row",
          type: "Free-weights",
          sets: 3,
          reps: "10-12",
          rest: "60s",
          demoUrl: "https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow",
        },
        {
          name: "Leg Curl",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
          demoUrl: "https://exrx.net/WeightExercises/Hamstrings/LVLyingLegCurl",
        },
        {
          name: "Shoulder Press",
          type: "Machine",
          sets: 3,
          reps: "8-10",
          rest: "90s",
          demoUrl:
            "https://exrx.net/WeightExercises/DeltoidAnterior/LVShoulderPress",
        },
        {
          name: "Dumbell Hammer Curl",
          type: "Free-weights",
          sets: 2,
          reps: "10-12",
          rest: "60s",
          demoUrl:
            "https://exrx.net/WeightExercises/Brachioradialis/DBHammerCurl",
        },
        {
          name: "Overhead Tricep Extensions (V-Bar)",
          type: "Machine",
          sets: 2,
          reps: "10-12",
          rest: "60s",
          demoUrl: "https://exrx.net/WeightExercises/Triceps/CBTriExt",
        },
      ],
    },
  };

  // If viewing a specific workout, show workout details
  if (selectedWorkout) {
    return (
      <div className="container mt-4">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <button
          className="btn btn-link text-decoration-none mb-3 p-0"
          onClick={() => setSelectedWorkout(null)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Programme
        </button>

        <div className="card mb-3">
          <div className="card-body">
            <h2 className="h5 mb-3">{selectedWorkout.name}</h2>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <p className="text-muted small mb-1">Date</p>
                {editingDate ? (
                  <div>
                    <input
                      type="date"
                      className="form-control form-control-sm mb-2"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveDate}
                      >
                        <i className="bi bi-check-lg me-1"></i>
                        Save
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <p className="mb-0">
                      {new Date(selectedWorkout.date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                    <button
                      className="btn btn-link btn-sm p-0"
                      onClick={handleEditDate}
                      title="Edit date"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
                )}
              </div>
              <div className="col-6">
                <p className="text-muted small mb-1">Duration</p>
                {editingDuration ? (
                  <div>
                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editedDuration}
                        onChange={(e) => setEditedDuration(e.target.value)}
                        placeholder="Minutes"
                        min="1"
                      />
                      <span className="input-group-text">min</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveDuration}
                      >
                        <i className="bi bi-check-lg me-1"></i>
                        Save
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancelDurationEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <p className="mb-0">{selectedWorkout.duration} minutes</p>
                    <button
                      className="btn btn-link btn-sm p-0"
                      onClick={handleEditDuration}
                      title="Edit duration"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => deleteWorkout(selectedWorkout.id)}
            >
              <i className="bi bi-trash me-2"></i>
              Delete Workout
            </button>
          </div>
        </div>

        {/* Group exercises */}
        {Object.entries(
          selectedWorkout.exercises.reduce((acc, exercise) => {
            if (!acc[exercise.exerciseName]) {
              acc[exercise.exerciseName] = [];
            }
            acc[exercise.exerciseName].push(exercise);
            return acc;
          }, {}),
        ).map(([exerciseName, sets]) => (
          <div key={exerciseName} className="card mb-3">
            <div className="card-header">
              <h3 className="h6 mb-0">{exerciseName}</h3>
            </div>
            <div className="list-group list-group-flush">
              {sets.map((set, index) => (
                <div
                  key={index}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>Set {set.set}</span>
                  <span className="fw-bold">
                    {set.weight}kg × {set.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Info */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">Programme Details</h2>
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">Client:</span>
              <p className="mb-0 fw-bold">{programmeData.client.name}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Instructor:</span>
              <p className="mb-0 fw-bold">{programmeData.client.instructor}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Start Date:</span>
              <p className="mb-0 fw-bold">{programmeData.client.date}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Phase:</span>
              <p className="mb-0 fw-bold">{programmeData.client.review}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-lightbulb me-2"></i>
            Key Concepts
          </h3>
        </div>
        <div className="card-body">
          <h4 className="h6 fw-bold">Progressive Overload</h4>
          <p className="small mb-3">
            Gradually increase intensity over time. Once you hit the top of the
            rep range, increase the weight slightly.
          </p>
          <h4 className="h6 fw-bold">Time Under Tension</h4>
          <p className="small mb-0">
            Maintain control: 2 seconds up (concentric), 2 seconds down
            (eccentric). This maximizes muscle growth.
          </p>
        </div>
      </div>

      {/* Day 1 Accordion */}
      <div className="accordion mb-4" id="day1Accordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed bg-primary text-white"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseDay1"
              aria-expanded="false"
              aria-controls="collapseDay1"
            >
              <div>
                <div className="fw-bold">{programmeData.day1.name}</div>
                <small className="opacity-75">{programmeData.day1.target}</small>
              </div>
            </button>
          </h2>
          <div
            id="collapseDay1"
            className="accordion-collapse collapse"
            data-bs-parent="#day1Accordion"
          >
            <div className="accordion-body p-0">
              <div className="list-group list-group-flush">
                {programmeData.day1.exercises.map((exercise, index) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="h6 mb-1">{exercise.name}</h4>
                        <span className="badge bg-secondary small">
                          {exercise.type}
                        </span>
                        {exercise.demoUrl && (
                          <a
                            href={exercise.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-block mt-1 small text-primary"
                          >
                            <i className="bi bi-play-circle me-1"></i>Watch demo
                          </a>
                        )}
                      </div>
                      <div className="text-end">
                        <p className="mb-0 small">
                          {exercise.sets} × {exercise.reps}
                        </p>
                        <p className="mb-0 text-muted small">Rest: {exercise.rest}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day 2 Accordion */}
      <div className="accordion mb-4" id="day2Accordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed bg-success text-white"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseDay2"
              aria-expanded="false"
              aria-controls="collapseDay2"
            >
              <div>
                <div className="fw-bold">{programmeData.day2.name}</div>
                <small className="opacity-75">{programmeData.day2.target}</small>
              </div>
            </button>
          </h2>
          <div
            id="collapseDay2"
            className="accordion-collapse collapse"
            data-bs-parent="#day2Accordion"
          >
            <div className="accordion-body p-0">
              <div className="list-group list-group-flush">
                {programmeData.day2.exercises.map((exercise, index) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="h6 mb-1">{exercise.name}</h4>
                        <span className="badge bg-secondary small">
                          {exercise.type}
                        </span>
                        {exercise.demoUrl && (
                          <a
                            href={exercise.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="d-block mt-1 small text-primary"
                          >
                            <i className="bi bi-play-circle me-1"></i>Watch demo
                          </a>
                        )}
                      </div>
                      <div className="text-end">
                        <p className="mb-0 small">
                          {exercise.sets} × {exercise.reps}
                        </p>
                        <p className="mb-0 text-muted small">Rest: {exercise.rest}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout History Accordion */}
      <div className="accordion mb-4" id="historyAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseHistory"
              aria-expanded="false"
              aria-controls="collapseHistory"
            >
              <i className="bi bi-clock-history me-2"></i>
              Workout History
              {workouts.length > 0 && (
                <span className="badge bg-primary ms-2">{workouts.length}</span>
              )}
            </button>
          </h2>
          <div
            id="collapseHistory"
            className="accordion-collapse collapse"
            data-bs-parent="#historyAccordion"
          >
            <div className="accordion-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2 small">Loading workouts...</p>
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-4">
                  <i
                    className="bi bi-clock-history text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="text-muted mt-3">No workouts logged yet</p>
                  <p className="text-muted small">
                    Start your first workout to see it here!
                  </p>
                </div>
              ) : (
                <div className="list-group">
                  {workouts.map((workout) => (
                    <button
                      key={workout.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h3 className="h6 mb-1">{workout.name}</h3>
                          <p className="text-muted small mb-0">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(workout.date).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 small text-muted">Duration</p>
                          <p className="mb-0 fw-bold">{workout.duration} min</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="alert alert-info" role="alert">
        <h4 className="h6 fw-bold mb-2">
          <i className="bi bi-info-circle me-2"></i>
          Important Notes
        </h4>
        <ul className="mb-0 small">
          <li>Follow this plan for ~1 month to build a foundation</li>
          <li>Take rest days between sessions</li>
          <li>Complete sessions 2-4 times per week</li>
          <li>Do cardio at the END of your session</li>
          <li>Always warm up and cool down</li>
        </ul>
      </div>
    </div>
  );
}

export default Programme;
