import { useState, useEffect } from "react";
import {
  getWorkouts,
  deleteWorkout as deleteWorkoutFromDb,
} from "../lib/database";
import Toast from "../components/Toast";

function History() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading workouts...</p>
        </div>
      </div>
    );
  }

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
          Back to History
        </button>

        <div className="card mb-3">
          <div className="card-body">
            <h2 className="h5 mb-3">{selectedWorkout.name}</h2>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <p className="text-muted small mb-0">Date</p>
                <p className="mb-0">
                  {new Date(selectedWorkout.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="col-6">
                <p className="text-muted small mb-0">Duration</p>
                <p className="mb-0">{selectedWorkout.duration} minutes</p>
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

      <h2 className="h5 mb-4">Workout History</h2>

      {workouts.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-clock-history text-muted"
            style={{ fontSize: "4rem" }}
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
  );
}

export default History;
