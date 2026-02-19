import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  saveUserProfile,
  getAllUserProgrammes,
  createWorkoutProgramme,
  createProgrammeExercises,
  deleteProgrammeExercise,
  isAdmin,
} from "../services/userProfileService";
import { migrateCurrentUserProgramme } from "../utils/programMigration";
import Toast from "../components/Toast";
import UserList from "../components/UserList";
import EditUser from "../components/EditUser";

function UserProfileManager() {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isMigrating, setIsMigrating] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    instructorName: "",
    programmeStartDate: "",
    programmePhase: "Intro",
    programmeEndDate: "",
    fitnessGoal: "",
    experienceLevel: "Beginner",
    userMode: "programme",
    notes: "",
  });

  // New programme form state
  const [showNewProgramme, setShowNewProgramme] = useState(false);
  const [newProgrammeForm, setNewProgrammeForm] = useState({
    dayNumber: 1,
    name: "",
    description: "",
    targetAreas: "",
  });

  // Exercise form state
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    type: "Machine",
    sets: 3,
    reps: "10-12",
    restSeconds: 90,
    notes: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log("Loading user data...");

      const profileData = await getUserProfile();
      console.log("Profile data loaded:", profileData);

      const programmesData = await getAllUserProgrammes();
      console.log("Programmes data loaded:", programmesData);

      const adminStatus = await isAdmin();
      console.log("Admin status loaded:", adminStatus);

      setProgrammes(programmesData);
      setHasProfile(!!profileData);
      setIsAdminUser(adminStatus);

      if (profileData) {
        setProfileForm({
          displayName: profileData.display_name || "",
          instructorName: profileData.instructor_name || "",
          programmeStartDate: profileData.programme_start_date || "",
          programmePhase: profileData.programme_phase || "Intro",
          programmeEndDate: profileData.programme_end_date || "",
          fitnessGoal: profileData.fitness_goal || "",
          experienceLevel: profileData.experience_level || "Beginner",
          userMode: profileData.user_mode || "programme",
          notes: profileData.notes || "",
        });
      } else {
        console.log(
          "No profile found - user needs to create or migrate profile",
        );
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });
      setToast({
        message: `Failed to load user data: ${err.message || "Unknown error"}`,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      await saveUserProfile(profileForm);
      setHasProfile(true);
      setToast({
        message: "Profile saved successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to save profile:", err);
      setToast({
        message: "Failed to save profile",
        type: "danger",
      });
    }
  };

  const handleMigration = async () => {
    if (
      !confirm(
        "This will migrate your existing programme data (Ian Burrett, Day 1 and Day 2) to the database. Continue?",
      )
    ) {
      return;
    }

    try {
      setIsMigrating(true);
      const result = await migrateCurrentUserProgramme();

      if (result.success) {
        setToast({
          message:
            "Migration completed successfully! Your profile and programmes have been created.",
          type: "success",
        });
        // Reload data
        await loadUserData();
      } else {
        setToast({
          message: `Migration failed: ${result.error}`,
          type: "danger",
        });
      }
    } catch (err) {
      console.error("Migration error:", err);
      setToast({
        message: "Migration failed. Check console for details.",
        type: "danger",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCreateProgramme = async (e) => {
    e.preventDefault();

    try {
      const programme = await createWorkoutProgramme(newProgrammeForm);
      setProgrammes([...programmes, { ...programme, exercises: [] }]);
      setShowNewProgramme(false);
      setNewProgrammeForm({
        dayNumber: programmes.length + 1,
        name: "",
        description: "",
        targetAreas: "",
      });
      setToast({
        message: "Programme created successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to create programme:", err);
      setToast({
        message: "Failed to create programme",
        type: "danger",
      });
    }
  };

  const handleAddExercise = async (programmeId) => {
    try {
      const programme = programmes.find((p) => p.id === programmeId);
      const exerciseOrder = (programme?.exercises?.length || 0) + 1;

      const exercise = {
        ...newExerciseForm,
        exerciseOrder,
      };

      const createdExercise = await createProgrammeExercises(programmeId, [
        exercise,
      ]);

      // Update local state
      setProgrammes(
        programmes.map((p) =>
          p.id === programmeId
            ? { ...p, exercises: [...(p.exercises || []), createdExercise[0]] }
            : p,
        ),
      );

      setNewExerciseForm({
        name: "",
        type: "Machine",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
        notes: "",
      });

      setToast({
        message: "Exercise added successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to add exercise:", err);
      setToast({
        message: "Failed to add exercise",
        type: "danger",
      });
    }
  };

  const handleDeleteExercise = async (programmeId, exerciseId) => {
    if (!confirm("Are you sure you want to delete this exercise?")) {
      return;
    }

    try {
      await deleteProgrammeExercise(exerciseId);

      // Update local state
      setProgrammes(
        programmes.map((p) =>
          p.id === programmeId
            ? {
                ...p,
                exercises: p.exercises.filter((e) => e.id !== exerciseId),
              }
            : p,
        ),
      );

      setToast({
        message: "Exercise deleted successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to delete exercise:", err);
      setToast({
        message: "Failed to delete exercise",
        type: "danger",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">User Profile & Programme Manager</h1>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-user")}
          >
            <i className="bi bi-person-plus me-2"></i>
            Add New User
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/programme")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Programme
          </button>
        </div>
      </div>

      {/* Migration Banner */}
      {!hasProfile && (
        <div className="alert alert-info mb-4" role="alert">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="alert-heading mb-2">
                <i className="bi bi-download me-2"></i>
                Migrate Your Existing Programme
              </h4>
              <p className="mb-0">
                Click the button to migrate your current programme (Ian Burrett
                with Day 1 and Day 2) into the database. This will create your
                profile and both programme days with all exercises.
              </p>
            </div>
            <button
              className="btn btn-primary ms-3"
              onClick={handleMigration}
              disabled={isMigrating}
            >
              {isMigrating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Migrating...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Migrate Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="bi bi-person me-2"></i>
            Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "programmes" ? "active" : ""}`}
            onClick={() => setActiveTab("programmes")}
          >
            <i className="bi bi-calendar-week me-2"></i>
            Programmes
          </button>
        </li>
        {isAdminUser && (
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("users");
                setSelectedUser(null);
              }}
            >
              <i className="bi bi-people me-2"></i>
              Manage Users
              <span className="badge bg-danger ms-2">Admin</span>
            </button>
          </li>
        )}
      </ul>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card">
          <div className="card-header">
            <h2 className="h5 mb-0">User Profile Information</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Display Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.displayName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        displayName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Instructor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.instructorName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        instructorName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Programme Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={profileForm.programmeStartDate}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        programmeStartDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Programme Phase</label>
                  <select
                    className="form-select"
                    value={profileForm.programmePhase}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        programmePhase: e.target.value,
                      })
                    }
                  >
                    <option value="Intro">Intro</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Strength">Strength</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Experience Level</label>
                  <select
                    className="form-select"
                    value={profileForm.experienceLevel}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        experienceLevel: e.target.value,
                      })
                    }
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">User Mode *</label>
                  <select
                    className="form-select"
                    value={profileForm.userMode}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        userMode: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="programme">
                      Programme Mode - Full workout programme with machines
                    </option>
                    <option value="wellbeing_only">
                      Wellbeing Only - Just track wellbeing activities
                    </option>
                  </select>
                  <div className="form-text">
                    Choose whether you want a structured programme or just track
                    wellbeing activities
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Fitness Goal</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.fitnessGoal}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fitnessGoal: e.target.value,
                      })
                    }
                    placeholder="e.g., Build strength, Lose weight, Improve endurance"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={profileForm.notes}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, notes: e.target.value })
                    }
                    placeholder="Any injuries, preferences, or special considerations"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-save me-2"></i>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Programmes Tab */}
      {activeTab === "programmes" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Workout Programmes</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewProgramme(true)}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Programme Day
            </button>
          </div>

          {/* New Programme Form */}
          {showNewProgramme && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="h6 mb-0">New Programme Day</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateProgramme}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label">Day Number</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProgrammeForm.dayNumber}
                        onChange={(e) =>
                          setNewProgrammeForm({
                            ...newProgrammeForm,
                            dayNumber: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="col-md-9">
                      <label className="form-label">Programme Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProgrammeForm.name}
                        onChange={(e) =>
                          setNewProgrammeForm({
                            ...newProgrammeForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Day 1 - Upper Body"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProgrammeForm.description}
                        onChange={(e) =>
                          setNewProgrammeForm({
                            ...newProgrammeForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="e.g., Push Focus: Chest, Shoulders, Triceps"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Target Areas</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProgrammeForm.targetAreas}
                        onChange={(e) =>
                          setNewProgrammeForm({
                            ...newProgrammeForm,
                            targetAreas: e.target.value,
                          })
                        }
                        placeholder="e.g., Chest • Shoulders • Arms"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <button type="submit" className="btn btn-success me-2">
                      Create Programme
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewProgramme(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Programmes List */}
          {programmes.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No programmes created yet. Click "Add Programme Day" to get
              started.
            </div>
          ) : (
            programmes.map((programme) => (
              <div key={programme.id} className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="h6 mb-0">{programme.name}</h3>
                      {programme.description && (
                        <small className="opacity-75">
                          {programme.description}
                        </small>
                      )}
                    </div>
                    <span className="badge bg-light text-dark">
                      Day {programme.day_number}
                    </span>
                  </div>
                  {programme.target_areas && (
                    <small className="opacity-75 d-block mt-1">
                      <i className="bi bi-bullseye me-1"></i>
                      {programme.target_areas}
                    </small>
                  )}
                </div>

                <div className="card-body">
                  {/* Exercises List */}
                  {programme.exercises && programme.exercises.length > 0 ? (
                    <div className="list-group mb-3">
                      {programme.exercises.map((exercise) => (
                        <div key={exercise.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h4 className="h6 mb-1">{exercise.name}</h4>
                              <span className="badge bg-secondary me-2">
                                {exercise.type}
                              </span>
                              <span className="text-muted small">
                                {exercise.sets} × {exercise.reps} • Rest:{" "}
                                {exercise.rest_seconds}s
                              </span>
                              {exercise.notes && (
                                <p className="mb-0 text-muted small mt-1">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDeleteExercise(programme.id, exercise.id)
                              }
                              aria-label="Delete exercise"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-3">No exercises added yet.</p>
                  )}

                  {/* Add Exercise Form */}
                  {selectedProgramme === programme.id ? (
                    <div className="border rounded p-3 bg-light">
                      <h5 className="h6 mb-3">Add Exercise</h5>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Exercise name"
                            value={newExerciseForm.name}
                            onChange={(e) =>
                              setNewExerciseForm({
                                ...newExerciseForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <select
                            className="form-select form-select-sm"
                            value={newExerciseForm.type}
                            onChange={(e) =>
                              setNewExerciseForm({
                                ...newExerciseForm,
                                type: e.target.value,
                              })
                            }
                          >
                            <option value="Machine">Machine</option>
                            <option value="Free-weights">Free-weights</option>
                            <option value="Cable">Cable</option>
                            <option value="Bodyweight">Bodyweight</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Sets"
                            value={newExerciseForm.sets}
                            onChange={(e) =>
                              setNewExerciseForm({
                                ...newExerciseForm,
                                sets: parseInt(e.target.value),
                              })
                            }
                            min="1"
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Reps (e.g., 10-12)"
                            value={newExerciseForm.reps}
                            onChange={(e) =>
                              setNewExerciseForm({
                                ...newExerciseForm,
                                reps: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Rest (seconds)"
                            value={newExerciseForm.restSeconds}
                            onChange={(e) =>
                              setNewExerciseForm({
                                ...newExerciseForm,
                                restSeconds: parseInt(e.target.value),
                              })
                            }
                            min="0"
                          />
                        </div>
                        <div className="col-md-4">
                          <button
                            className="btn btn-success btn-sm w-100"
                            onClick={() => handleAddExercise(programme.id)}
                            disabled={!newExerciseForm.name}
                          >
                            <i className="bi bi-plus-lg me-1"></i>
                            Add
                          </button>
                        </div>
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Notes (optional)"
                            value={newExerciseForm.notes}
                            onChange={(e) =>
                              setNewExerciseForm({
                                ...newExerciseForm,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="btn btn-outline-secondary btn-sm mt-2"
                        onClick={() => setSelectedProgramme(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setSelectedProgramme(programme.id)}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Exercise
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Manage Users Tab (Admin Only) */}
      {activeTab === "users" && isAdminUser && (
        <div className="card">
          <div className="card-header">
            <h2 className="h5 mb-0">Manage All Users</h2>
          </div>
          <div className="card-body">
            {selectedUser ? (
              <EditUser
                user={selectedUser}
                onBack={() => setSelectedUser(null)}
                onSave={() => {
                  setSelectedUser(null);
                  setToast({
                    message: "User profile updated successfully!",
                    type: "success",
                  });
                }}
              />
            ) : (
              <UserList onSelectUser={(user) => setSelectedUser(user)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfileManager;
