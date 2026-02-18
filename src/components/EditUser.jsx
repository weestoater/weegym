import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getUserProfileById,
  updateUserProfileById,
  getUserProgrammesById,
} from "../services/userProfileService";

function EditUser({ user, onBack, onSave }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    instructorName: "",
    programmeStartDate: "",
    programmePhase: "Intro",
    programmeEndDate: "",
    fitnessGoal: "",
    experienceLevel: "Beginner",
    notes: "",
    isActive: true,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [profileData, programmesData] = await Promise.all([
          getUserProfileById(user.user_id),
          getUserProgrammesById(user.user_id),
        ]);

        if (profileData) {
          setProfileForm({
            displayName: profileData.display_name || "",
            instructorName: profileData.instructor_name || "",
            programmeStartDate: profileData.programme_start_date || "",
            programmePhase: profileData.programme_phase || "Intro",
            programmeEndDate: profileData.programme_end_date || "",
            fitnessGoal: profileData.fitness_goal || "",
            experienceLevel: profileData.experience_level || "Beginner",
            notes: profileData.notes || "",
            isActive: profileData.is_active !== false,
          });
        }

        setProgrammes(programmesData);
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateUserProfileById(user.user_id, profileForm);
      onSave?.();
    } catch (err) {
      console.error("Failed to update user profile:", err);
      alert("Failed to update user profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading user data...</span>
        </div>
        <p className="mt-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 mb-0">
          <i className="bi bi-person-gear me-2"></i>
          Edit User: {user.display_name}
        </h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          <i className="bi bi-arrow-left me-1"></i>
          Back to List
        </button>
      </div>

      {/* User Info Banner */}
      <div className="alert alert-info mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <strong>Email:</strong> {user.email}
            <br />
            <strong>User ID:</strong>{" "}
            <small className="font-monospace">{user.user_id}</small>
          </div>
          {user.is_admin && (
            <span className="badge bg-danger">Admin User</span>
          )}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h4 className="h6 mb-0">Profile Information</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="displayName" className="form-label">
                  Display Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="displayName"
                  value={profileForm.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="instructorName" className="form-label">
                  Instructor Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="instructorName"
                  value={profileForm.instructorName}
                  onChange={(e) =>
                    handleChange("instructorName", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="programmeStartDate" className="form-label">
                  Programme Start Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="programmeStartDate"
                  value={profileForm.programmeStartDate}
                  onChange={(e) =>
                    handleChange("programmeStartDate", e.target.value)
                  }
                />
              </div>

              <div className="col-md-4 mb-3">
                <label htmlFor="programmePhase" className="form-label">
                  Programme Phase
                </label>
                <select
                  className="form-select"
                  id="programmePhase"
                  value={profileForm.programmePhase}
                  onChange={(e) =>
                    handleChange("programmePhase", e.target.value)
                  }
                >
                  <option value="Intro">Intro</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Progressive">Progressive</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label htmlFor="programmeEndDate" className="form-label">
                  Programme End Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="programmeEndDate"
                  value={profileForm.programmeEndDate}
                  onChange={(e) =>
                    handleChange("programmeEndDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="experienceLevel" className="form-label">
                  Experience Level
                </label>
                <select
                  className="form-select"
                  id="experienceLevel"
                  value={profileForm.experienceLevel}
                  onChange={(e) =>
                    handleChange("experienceLevel", e.target.value)
                  }
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="fitnessGoal" className="form-label">
                  Fitness Goal
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fitnessGoal"
                  value={profileForm.fitnessGoal}
                  onChange={(e) => handleChange("fitnessGoal", e.target.value)}
                  placeholder="e.g., Build strength, Improve endurance"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                className="form-control"
                id="notes"
                rows="3"
                value={profileForm.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional notes about this user..."
              ></textarea>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                checked={profileForm.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isActive">
                Active User
              </label>
              <small className="form-text text-muted d-block">
                Inactive users will not be able to log workouts
              </small>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onBack}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Programmes Summary */}
      {programmes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h4 className="h6 mb-0">
              <i className="bi bi-calendar-week me-2"></i>
              Workout Programmes ({programmes.length})
            </h4>
          </div>
          <div className="card-body">
            <div className="list-group">
              {programmes.map((prog) => (
                <div key={prog.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        <span className="badge bg-primary me-2">
                          Day {prog.day_number}
                        </span>
                        {prog.name}
                      </h6>
                      <p className="mb-0 text-muted small">
                        {prog.description}
                      </p>
                      {prog.target_areas && (
                        <small className="text-muted">
                          <i className="bi bi-bullseye me-1"></i>
                          {prog.target_areas}
                        </small>
                      )}
                    </div>
                    {prog.is_active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted small mt-3 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              To edit programmes and exercises, the user should use the Profile
              Manager while logged in to their account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

EditUser.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user_id: PropTypes.string.isRequired,
    display_name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    is_admin: PropTypes.bool,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default EditUser;
