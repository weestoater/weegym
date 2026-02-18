import { useState, useEffect } from "react";
import {
  getWorkouts,
  deleteWorkout as deleteWorkoutFromDb,
  updateWorkout,
} from "../lib/database";
import Toast from "../components/Toast";

function History() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingDate, setEditingDate] = useState(false);
  const [editedDate, setEditedDate] = useState("");
  const [editingDuration, setEditingDuration] = useState(false);
  const [editedDuration, setEditedDuration] = useState("");

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
    // Set the current date in YYYY-MM-DD format for the input
    const currentDate = new Date(selectedWorkout.date);
    const formattedDate = currentDate.toISOString().split("T")[0];
    setEditedDate(formattedDate);
    setEditingDate(true);
  };

  const handleSaveDate = async () => {
    try {
      // Create a new date in ISO format
      const newDate = new Date(editedDate).toISOString();

      try {
        // Try to update in Supabase
        await updateWorkout(selectedWorkout.id, { date: newDate });
      } catch (dbError) {
        // Fallback to localStorage
        console.log("Supabase update failed, updating localStorage:", dbError);
        const storedWorkouts = JSON.parse(
          localStorage.getItem("workouts") || "[]",
        );
        const updatedWorkouts = storedWorkouts.map((w) =>
          w.id === selectedWorkout.id ? { ...w, date: newDate } : w,
        );
        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
      }

      // Update the local state
      const updatedWorkout = { ...selectedWorkout, date: newDate };
      setSelectedWorkout(updatedWorkout);
      setEditingDate(false);

      // Reload workouts to reflect the change
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
        // Try to update in Supabase
        await updateWorkout(selectedWorkout.id, { duration: newDuration });
      } catch (dbError) {
        // Fallback to localStorage
        console.log("Supabase update failed, updating localStorage:", dbError);
        const storedWorkouts = JSON.parse(
          localStorage.getItem("workouts") || "[]",
        );
        const updatedWorkouts = storedWorkouts.map((w) =>
          w.id === selectedWorkout.id ? { ...w, duration: newDuration } : w,
        );
        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
      }

      // Update the local state
      const updatedWorkout = { ...selectedWorkout, duration: newDuration };
      setSelectedWorkout(updatedWorkout);
      setEditingDuration(false);

      // Reload workouts to reflect the change
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
