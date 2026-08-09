import { useState } from "react";
import {
  getCardioSessions,
  saveCardioSession,
  deleteCardioSession,
  updateCardioSession,
} from "../lib/database";
import Toast from "../components/Toast";
import { exportCardioSessions } from "../utils/exportUtils";
import { SkeletonListItem } from "../components/Skeleton";
import { FieldTooltip } from "../components/Tooltip";
import {
  useSessionManager,
  useEditableForm,
  useViewToggle,
  useFormFields,
} from "../hooks/useSessionManager";
import { LogHistoryToggle } from "../components/ViewToggle";

function CardioTracker() {
  const equipmentTypes = [
    { value: "Treadmill", icon: "bi-arrow-repeat", color: "primary" },
    { value: "Rowing Machine", icon: "bi-water", color: "info" },
    { value: "Cross Trainer", icon: "bi-arrow-repeat", color: "success" },
    { value: "Stationary Bike", icon: "bi-bicycle", color: "warning" },
    { value: "Elliptical", icon: "bi-arrow-repeat", color: "danger" },
    { value: "Stair Climber", icon: "bi-arrow-up", color: "secondary" },
  ];

  // Use session manager hook for CRUD operations
  const { sessions, loading, toast, setToast, saveSession, deleteSession } =
    useSessionManager({
      loadFn: getCardioSessions,
      saveFn: saveCardioSession,
      updateFn: updateCardioSession,
      deleteFn: deleteCardioSession,
    });

  // Use view toggle hook
  const { activeView, setActiveView } = useViewToggle("log");

  // Use form fields hook
  const initialFormFields = {
    equipmentType: "",
    durationMinutes: "",
    distanceKm: "",
    calories: "",
    avgHeartRate: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  };
  const { fields, updateField, resetFields, setFieldsFromSession } =
    useFormFields(initialFormFields);

  // Use editable form hook
  const { editingSession, startEdit, cancelEdit, resetAfterSubmit } =
    useEditableForm(resetFields, setActiveView);

  // Filter state
  const [filterEquipment, setFilterEquipment] = useState("all");

  // Helper to populate form from session
  const populateForm = (session) => {
    setFieldsFromSession(session, {
      equipmentType: "equipment_type",
      durationMinutes: "duration_minutes",
      distanceKm: "distance_km",
      calories: "calories",
      avgHeartRate: "avg_heart_rate",
      notes: "notes",
      date: "date",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fields.equipmentType || !fields.durationMinutes || !fields.date) {
      setToast({
        message: "Please fill in equipment type, duration, and date",
        type: "warning",
      });
      return;
    }

    const sessionData = {
      equipmentType: fields.equipmentType,
      durationMinutes: parseInt(fields.durationMinutes),
      distanceKm: fields.distanceKm ? parseFloat(fields.distanceKm) : null,
      calories: fields.calories ? parseInt(fields.calories) : null,
      avgHeartRate: fields.avgHeartRate ? parseInt(fields.avgHeartRate) : null,
      notes: fields.notes || null,
      date: new Date(fields.date).toISOString(),
    };

    const success = await saveSession(
      sessionData,
      !!editingSession,
      editingSession?.id,
    );
    if (success) {
      resetAfterSubmit();
    }
  };

  const handleEdit = (session) => {
    startEdit(session, populateForm);
  };

  const handleDelete = (id) => {
    deleteSession(id);
  };

  const getEquipmentIcon = (type) => {
    return equipmentTypes.find((e) => e.value === type)?.icon || "bi-activity";
  };

  const getEquipmentColor = (type) => {
    return equipmentTypes.find((e) => e.value === type)?.color || "secondary";
  };

  const filteredSessions =
    filterEquipment === "all"
      ? sessions
      : sessions.filter((s) => s.equipment_type === filterEquipment);

  const stats = {
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce((acc, s) => acc + s.duration_minutes, 0),
    totalDistance: sessions.reduce((acc, s) => acc + (s.distance_km || 0), 0),
    totalCalories: sessions.reduce((acc, s) => acc + (s.calories || 0), 0),
  };

  return (
    <div className="container mt-4 mb-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-4">
        <h2>
          <i className="bi bi-speedometer2 me-2"></i>
          Cardio Tracker
        </h2>
        <p className="text-muted">
          Track treadmill, rowing machine, cross trainer, and other cardio
          equipment
        </p>
      </div>

      {/* Stats Summary */}
      {sessions.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center py-3">
                <h3 className="mb-0">{stats.totalSessions}</h3>
                <small>Sessions</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center py-3">
                <h3 className="mb-0">{Math.round(stats.totalMinutes / 60)}h</h3>
                <small>{stats.totalMinutes % 60}m</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center py-3">
                <h3 className="mb-0">{stats.totalDistance.toFixed(1)}</h3>
                <small>km</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center py-3">
                <h3 className="mb-0">{stats.totalCalories}</h3>
                <small>calories</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <LogHistoryToggle
        activeView={activeView}
        onViewChange={setActiveView}
        rightContent={
          sessions.length > 0 && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => exportCardioSessions(sessions)}
              title="Export to CSV"
            >
              <i className="bi bi-download me-1"></i>
              Export
            </button>
          )
        }
      />

      {/* Log Session View */}
      {activeView === "log" && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">
              {editingSession ? "Edit Session" : "Log New Session"}
            </h5>
            <form onSubmit={handleSubmit}>
              {/* Equipment Type */}
              <div className="mb-3">
                <label htmlFor="equipmentType" className="form-label">
                  Equipment Type <span className="text-danger">*</span>
                </label>
                <select
                  id="equipmentType"
                  className="form-select"
                  value={fields.equipmentType}
                  onChange={(e) => updateField("equipmentType", e.target.value)}
                  required
                >
                  <option value="">Select equipment...</option>
                  {equipmentTypes.map((eq) => (
                    <option key={eq.value} value={eq.value}>
                      {eq.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="mb-3">
                <label htmlFor="duration" className="form-label">
                  Duration (minutes) <span className="text-danger">*</span>
                  <FieldTooltip content="Total workout time in minutes" />
                </label>
                <input
                  type="number"
                  id="duration"
                  className="form-control"
                  value={fields.durationMinutes}
                  onChange={(e) =>
                    updateField("durationMinutes", e.target.value)
                  }
                  min="1"
                  required
                />
              </div>

              {/* Distance */}
              <div className="mb-3">
                <label htmlFor="distance" className="form-label">
                  Distance (km) <span className="text-muted">(optional)</span>
                  <FieldTooltip content="Total distance covered during workout" />
                </label>
                <input
                  type="number"
                  id="distance"
                  className="form-control"
                  value={fields.distanceKm}
                  onChange={(e) => updateField("distanceKm", e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>

              {/* Row: Calories and Heart Rate */}
              <div className="row mb-3">
                <div className="col-6">
                  <label htmlFor="calories" className="form-label">
                    Calories <span className="text-muted">(optional)</span>
                    <FieldTooltip content="Calories burned from machine display" />
                  </label>
                  <input
                    type="number"
                    id="calories"
                    className="form-control"
                    value={fields.calories}
                    onChange={(e) => updateField("calories", e.target.value)}
                    min="0"
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="heartRate" className="form-label">
                    Avg HR <span className="text-muted">(bpm)</span>
                    <FieldTooltip content="Average heart rate during workout" />
                  </label>
                  <input
                    type="number"
                    id="heartRate"
                    className="form-control"
                    value={fields.avgHeartRate}
                    onChange={(e) =>
                      updateField("avgHeartRate", e.target.value)
                    }
                    min="0"
                    max="220"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Notes <span className="text-muted">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  className="form-control"
                  value={fields.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows="2"
                  placeholder="How did you feel? Any observations..."
                />
              </div>

              {/* Date */}
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  className="form-control"
                  value={fields.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  <i
                    className={`bi ${editingSession ? "bi-check-circle" : "bi-plus-circle"} me-2`}
                  ></i>
                  {editingSession ? "Update Session" : "Log Session"}
                </button>
                {editingSession && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelEdit}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === "history" && (
        <div>
          {/* Filter */}
          {sessions.length > 0 && (
            <div className="card mb-3">
              <div className="card-body">
                <label className="form-label small">Filter by Equipment</label>
                <select
                  className="form-select form-select-sm"
                  value={filterEquipment}
                  onChange={(e) => setFilterEquipment(e.target.value)}
                >
                  <option value="all">All Equipment</option>
                  {equipmentTypes.map((eq) => (
                    <option key={eq.value} value={eq.value}>
                      {eq.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Sessions List */}
          {loading ? (
            <div className="list-group">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                <p className="text-muted mb-3">
                  {filterEquipment === "all"
                    ? "No cardio sessions yet. Start logging!"
                    : `No ${filterEquipment} sessions found`}
                </p>
                {filterEquipment !== "all" && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setFilterEquipment("all")}
                  >
                    Show All Sessions
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {filteredSessions.map((session) => (
                <div key={session.id} className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title mb-1">
                            <i
                              className={`bi ${getEquipmentIcon(session.equipment_type)} text-${getEquipmentColor(session.equipment_type)} me-2`}
                            ></i>
                            {session.equipment_type}
                          </h5>
                          <small className="text-muted">
                            {new Date(session.date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </small>
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(session)}
                            aria-label="Edit session"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(session.id)}
                            aria-label="Delete session"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="row g-2 mt-2">
                        <div className="col-6 col-md-3">
                          <div className="text-center p-2 bg-light rounded">
                            <i className="bi bi-clock text-primary"></i>
                            <div className="fw-bold">
                              {session.duration_minutes}
                            </div>
                            <small className="text-muted">minutes</small>
                          </div>
                        </div>
                        {session.distance_km && (
                          <div className="col-6 col-md-3">
                            <div className="text-center p-2 bg-light rounded">
                              <i className="bi bi-rulers text-info"></i>
                              <div className="fw-bold">
                                {session.distance_km}
                              </div>
                              <small className="text-muted">km</small>
                            </div>
                          </div>
                        )}
                        {session.calories && (
                          <div className="col-6 col-md-3">
                            <div className="text-center p-2 bg-light rounded">
                              <i className="bi bi-fire text-warning"></i>
                              <div className="fw-bold">{session.calories}</div>
                              <small className="text-muted">calories</small>
                            </div>
                          </div>
                        )}
                        {session.avg_heart_rate && (
                          <div className="col-6 col-md-3">
                            <div className="text-center p-2 bg-light rounded">
                              <i className="bi bi-heart-pulse text-danger"></i>
                              <div className="fw-bold">
                                {session.avg_heart_rate}
                              </div>
                              <small className="text-muted">bpm</small>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {session.notes && (
                        <div className="mt-3">
                          <small className="text-muted">
                            <i className="bi bi-chat-left-text me-1"></i>
                            {session.notes}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CardioTracker;
