import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Toast from "../components/Toast";

function AddUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    instructorName: "",
    programmeStartDate: new Date().toISOString().split("T")[0],
    programmePhase: "Foundation",
    experienceLevel: "Beginner",
    fitnessGoal: "",
    notes: "",
    createStarterProgramme: true,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.displayName) {
      newErrors.displayName = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({
        message: "Please fix the errors in the form",
        type: "danger",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.displayName,
          },
        },
      });

      if (authError) throw authError;

      if (!authData?.user) {
        throw new Error("User creation failed");
      }

      // Step 2: Create user profile
      // Note: We need to use the Supabase Admin API or a server function for this
      // For now, we'll create a temporary session to create the profile

      const userId = authData.user.id;

      // Create profile using service account or admin
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([
          {
            user_id: userId,
            email: formData.email, // Cache email for display
            display_name: formData.displayName,
            instructor_name: formData.instructorName,
            programme_start_date: formData.programmeStartDate,
            programme_phase: formData.programmePhase,
            experience_level: formData.experienceLevel,
            fitness_goal: formData.fitnessGoal,
            notes: formData.notes,
            is_active: true,
          },
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Continue anyway as the user can set this up later
      }

      // Step 3: Create starter programme if requested
      if (formData.createStarterProgramme) {
        // This would need to be done by the user themselves after they log in
        // Or through a server-side function with service role key
        console.log("Starter programme will need to be created by the user");
      }

      setToast({
        message: `User ${formData.displayName} created successfully! They can now log in with their credentials.`,
        type: "success",
      });

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        instructorName: "",
        programmeStartDate: new Date().toISOString().split("T")[0],
        programmePhase: "Foundation",
        experienceLevel: "Beginner",
        fitnessGoal: "",
        notes: "",
        createStarterProgramme: true,
      });

      setTimeout(() => {
        navigate("/profile-manager");
      }, 3000);
    } catch (err) {
      console.error("Failed to create user:", err);
      setToast({
        message: err.message || "Failed to create user",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Add New User</h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/profile-manager")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h2 className="h5 mb-0">
                <i className="bi bi-person-plus me-2"></i>
                Create New Gym Member
              </h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Account Credentials */}
                <div className="mb-4">
                  <h3 className="h6 text-primary mb-3">
                    <i className="bi bi-shield-lock me-2"></i>
                    Account Credentials
                  </h3>

                  <div className="mb-3">
                    <label className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="user@example.com"
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        placeholder="Minimum 6 characters"
                        disabled={loading}
                      />
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        placeholder="Re-enter password"
                        disabled={loading}
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Personal Information */}
                <div className="mb-4">
                  <h3 className="h6 text-primary mb-3">
                    <i className="bi bi-person me-2"></i>
                    Personal Information
                  </h3>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.displayName ? "is-invalid" : ""}`}
                        value={formData.displayName}
                        onChange={(e) =>
                          handleChange("displayName", e.target.value)
                        }
                        placeholder="John Doe"
                        disabled={loading}
                      />
                      {errors.displayName && (
                        <div className="invalid-feedback">
                          {errors.displayName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Instructor/Coach</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.instructorName}
                        onChange={(e) =>
                          handleChange("instructorName", e.target.value)
                        }
                        placeholder="Coach name"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <hr />

                {/* Programme Details */}
                <div className="mb-4">
                  <h3 className="h6 text-primary mb-3">
                    <i className="bi bi-calendar-week me-2"></i>
                    Programme Details
                  </h3>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.programmeStartDate}
                        onChange={(e) =>
                          handleChange("programmeStartDate", e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Programme Phase</label>
                      <select
                        className="form-select"
                        value={formData.programmePhase}
                        onChange={(e) =>
                          handleChange("programmePhase", e.target.value)
                        }
                        disabled={loading}
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
                        value={formData.experienceLevel}
                        onChange={(e) =>
                          handleChange("experienceLevel", e.target.value)
                        }
                        disabled={loading}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label">Fitness Goal</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.fitnessGoal}
                      onChange={(e) =>
                        handleChange("fitnessGoal", e.target.value)
                      }
                      placeholder="e.g., Build strength, Lose weight, Improve endurance"
                      disabled={loading}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Any injuries, preferences, or special considerations"
                      disabled={loading}
                    />
                  </div>
                </div>

                <hr />

                {/* Options */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="createStarter"
                      checked={formData.createStarterProgramme}
                      onChange={(e) =>
                        handleChange("createStarterProgramme", e.target.checked)
                      }
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="createStarter">
                      Create starter programme (user can customize later)
                    </label>
                  </div>
                </div>

                {/* Alert */}
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Note:</strong> The new user will receive a
                  confirmation email and can log in immediately with their
                  credentials. They will need to verify their email to use all
                  features.
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating User...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUser;
