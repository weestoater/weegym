import { useState, useEffect } from "react";
import {
  getActiveWellbeingSessions,
  saveActiveWellbeingSession,
  deleteActiveWellbeingSession,
} from "../lib/database";
import Toast from "../components/Toast";

function ActiveWellbeing() {
  const availableModes = ["Cardio", "Strength", "Stamina"];

  const machineNames = [
    "Cross cycle",
    "Chest & Legs",
    "Seated Climber",
    "Tricep dip & leg curl",
    "AB pullover",
    "Flys & Thighs",
    "Side bend stepper",
  ];

  // Build machines array with shared modes
  const machines = machineNames.map((name) => ({
    name,
    modes: availableModes,
  }));

  const [activeView, setActiveView] = useState("log"); // 'log' or 'history'
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessions, setSessions] = useState([]);
  const [filterMachine, setFilterMachine] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getActiveWellbeingSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions from Supabase:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("activeWellbeingSessions");
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMachine || !selectedMode || !score || !date) {
      setToast({ message: "Please fill in all fields", type: "warning" });
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
      await loadSessions();
      setScore("");
      setToast({ message: "Session logged successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to save session:", error);
      setToast({
        message: "Failed to save session. Please try again.",
        type: "error",
      });
    }
  };

  const deleteSession = async (id) => {
    try {
      await deleteActiveWellbeingSession(id);
      await loadSessions();
      setToast({ message: "Session deleted successfully", type: "success" });
    } catch (error) {
      console.error("Failed to delete session:", error);
      setToast({
        message: "Failed to delete session. Please try again.",
        type: "error",
      });
    }
  };

  const getFilteredSessions = () => {
    return sessions.filter((s) => {
      if (filterMachine !== "all" && s.machine !== filterMachine) return false;
      if (filterMode !== "all" && s.mode !== filterMode) return false;
      return true;
    });
  };

  const getBestScore = (machine, mode) => {
    const relevant = sessions.filter(
      (s) => s.machine === machine && s.mode === mode,
    );
    if (relevant.length === 0) return null;
    return Math.max(...relevant.map((s) => s.score));
  };

  const getAverageScore = (machine, mode) => {
    const relevant = sessions.filter(
      (s) => s.machine === machine && s.mode === mode,
    );
    if (relevant.length === 0) return null;
    return Math.round(
      relevant.reduce((sum, s) => sum + s.score, 0) / relevant.length,
    );
  };

  const getLatestScore = (machine, mode) => {
    const relevant = sessions
      .filter((s) => s.machine === machine && s.mode === mode)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return relevant.length > 0 ? relevant[0].score : null;
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "Cardio":
        return "bi-heart-pulse";
      case "Strength":
        return "bi-lightning-charge";
      case "Stamina":
        return "bi-speedometer2";
      default:
        return "bi-circle";
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case "Cardio":
        return "danger";
      case "Strength":
        return "primary";
      case "Stamina":
        return "success";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2 className="mb-4">
          <i className="bi bi-activity me-2"></i>
          Active Wellbeing
        </h2>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading sessions...</p>
        </div>
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

      <h2 className="mb-4">
        <i className="bi bi-activity me-2"></i>
        Active Wellbeing
      </h2>

      {/* View Toggle */}
      <div className="btn-group w-100 mb-4" role="group">
        <button
          type="button"
          className={`btn ${activeView === "log" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveView("log")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Log Session
        </button>
        <button
          type="button"
          className={`btn ${activeView === "history" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveView("history")}
        >
          <i className="bi bi-clock-history me-2"></i>
          History
        </button>
        <button
          type="button"
          className={`btn ${activeView === "summary" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveView("summary")}
        >
          <i className="bi bi-bar-chart me-2"></i>
          Summary
        </button>
      </div>

      {/* Log Session View */}
      {activeView === "log" && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">Log New Session</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Machine</label>
                <select
                  className="form-select"
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  required
                >
                  <option value="">Select a machine...</option>
                  {machines.map((machine) => (
                    <option key={machine.name} value={machine.name}>
                      {machine.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Mode</label>
                <div className="btn-group w-100" role="group">
                  {["Cardio", "Strength", "Stamina"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`btn ${selectedMode === mode ? `btn-${getModeColor(mode)}` : `btn-outline-${getModeColor(mode)}`}`}
                      onClick={() => setSelectedMode(mode)}
                    >
                      <i className={`${getModeIcon(mode)} me-1`}></i>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Score</label>
                <input
                  type="number"
                  className="form-control"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter your score"
                  min="0"
                  max="999"
                  required
                />
                {selectedMachine && selectedMode && (
                  <div className="form-text">
                    Best: {getBestScore(selectedMachine, selectedMode) || "N/A"}{" "}
                    | Avg:{" "}
                    {getAverageScore(selectedMachine, selectedMode) || "N/A"} |
                    Last:{" "}
                    {getLatestScore(selectedMachine, selectedMode) || "N/A"}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-check-circle me-2"></i>
                Log Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === "history" && (
        <div>
          {/* Filters */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <select
                    className="form-select form-select-sm"
                    value={filterMachine}
                    onChange={(e) => setFilterMachine(e.target.value)}
                  >
                    <option value="all">All Machines</option>
                    {machines.map((machine) => (
                      <option key={machine.name} value={machine.name}>
                        {machine.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <select
                    className="form-select form-select-sm"
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                  >
                    <option value="all">All Modes</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Stamina">Stamina</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          {getFilteredSessions().length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No sessions logged yet. Start tracking your Active Wellbeing
              sessions!
            </div>
          ) : (
            <div className="list-group">
              {getFilteredSessions().map((session) => (
                <div key={session.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{session.machine}</h6>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className={`badge bg-${getModeColor(session.mode)}`}
                        >
                          <i
                            className={`${getModeIcon(session.mode)} me-1`}
                          ></i>
                          {session.mode}
                        </span>
                        <span className="badge bg-secondary">
                          Score: {session.score}
                        </span>
                      </div>
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(session.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </small>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteSession(session.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary View */}
      {activeView === "summary" && (
        <div>
          {sessions.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No sessions logged yet. Start tracking to see your progress!
            </div>
          ) : (
            <div className="row g-3">
              {machines.map((machine) => {
                const hasSessions = sessions.some(
                  (s) => s.machine === machine.name,
                );
                if (!hasSessions) return null;

                return (
                  <div key={machine.name} className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">{machine.name}</h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          {machine.modes.map((mode) => {
                            const best = getBestScore(machine.name, mode);
                            const avg = getAverageScore(machine.name, mode);
                            const latest = getLatestScore(machine.name, mode);

                            if (best === null) return null;

                            return (
                              <div key={mode} className="col-4">
                                <div
                                  className={`text-center p-2 rounded bg-${getModeColor(mode)} bg-opacity-10`}
                                >
                                  <div
                                    className={`text-${getModeColor(mode)} mb-1`}
                                  >
                                    <i
                                      className={`${getModeIcon(mode)} fs-5`}
                                    ></i>
                                  </div>
                                  <div className="small fw-bold">{mode}</div>
                                  <div className="small text-muted">
                                    Best: {best}
                                  </div>
                                  <div className="small text-muted">
                                    Avg: {avg}
                                  </div>
                                  <div className="small text-muted">
                                    Last: {latest}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActiveWellbeing;
