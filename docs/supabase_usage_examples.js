// Example: How to update WorkoutSession.jsx to use Supabase

import { saveWorkout } from "../lib/database";

// In your saveWorkout function, replace localStorage with:

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
    // Save to Supabase instead of localStorage
    await saveWorkout(workoutData);

    alert("Workout saved! Great job! 💪");
    navigate("/");
  } catch (error) {
    console.error("Failed to save workout:", error);
    alert("Failed to save workout. Please try again.");
  }
};

// Example: How to update History.jsx to use Supabase

import { getWorkouts, deleteWorkout } from "../lib/database";

function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Failed to load workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      try {
        await deleteWorkout(id);
        // Refresh the list
        await loadWorkouts();
      } catch (error) {
        console.error("Failed to delete workout:", error);
        alert("Failed to delete workout. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Rest of your component...
}

// Example: How to update ActiveWellbeing.jsx to use Supabase

import {
  saveActiveWellbeingSession,
  getActiveWellbeingSessions,
  deleteActiveWellbeingSession,
} from "../lib/database";

function ActiveWellbeing() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getActiveWellbeingSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMachine || !selectedMode || !score || !date) {
      alert("Please fill in all fields");
      return;
    }

    const sessionData = {
      machine: selectedMachine,
      mode: selectedMode,
      score: parseInt(score),
      date: date,
    };

    try {
      await saveActiveWellbeingSession(sessionData);

      // Refresh the list
      await loadSessions();

      // Reset form
      setScore("");
      alert("Session logged successfully!");
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to save session. Please try again.");
    }
  };

  const handleDeleteSession = async (id) => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteActiveWellbeingSession(id);
        await loadSessions();
      } catch (error) {
        console.error("Failed to delete session:", error);
        alert("Failed to delete session. Please try again.");
      }
    }
  };

  // Rest of your component...
}
