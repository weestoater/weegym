/**
 * Example: Updated Programme.jsx using Database
 *
 * This file shows how to update your Programme component
 * to load data from the database instead of hardcoded values.
 *
 * Replace the existing Programme.jsx with this code.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUserProfile,
  getAllUserProgrammes,
} from "../services/userProfileService";

function Programme() {
  const [profile, setProfile] = useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProgrammeData();
  }, []);

  const loadProgrammeData = async () => {
    try {
      setLoading(true);
      const [profileData, programmesData] = await Promise.all([
        getUserProfile(),
        getAllUserProgrammes(),
      ]);

      setProfile(profileData);
      setProgrammes(programmesData);
      setError(null);
    } catch (err) {
      console.error("Failed to load programme data:", err);
      setError("Failed to load your programme. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your programme...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadProgrammeData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile || programmes.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">
            <i className="bi bi-info-circle me-2"></i>
            No Programme Found
          </h4>
          <p>
            You don't have a workout programme set up yet. Would you like to
            create one?
          </p>
          <hr />
          <Link to="/profile-manager" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Create Your Programme
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="container mt-4">
      {/* Header Info */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h2 className="h5 mb-0">Programme Details</h2>
            <Link
              to="/profile-manager"
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-pencil me-1"></i>
              Edit
            </Link>
          </div>
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">Client:</span>
              <p className="mb-0 fw-bold">{profile.display_name}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Instructor:</span>
              <p className="mb-0 fw-bold">
                {profile.instructor_name || "Not assigned"}
              </p>
            </div>
            <div className="col-6">
              <span className="text-muted">Start Date:</span>
              <p className="mb-0 fw-bold">
                {formatDate(profile.programme_start_date)}
              </p>
            </div>
            <div className="col-6">
              <span className="text-muted">Phase:</span>
              <p className="mb-0 fw-bold">{profile.programme_phase}</p>
            </div>
            {profile.experience_level && (
              <div className="col-6">
                <span className="text-muted">Level:</span>
                <p className="mb-0 fw-bold">{profile.experience_level}</p>
              </div>
            )}
            {profile.fitness_goal && (
              <div className="col-6">
                <span className="text-muted">Goal:</span>
                <p className="mb-0 fw-bold">{profile.fitness_goal}</p>
              </div>
            )}
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

      {/* Programme Days */}
      {programmes.map((programme, index) => {
        const colors = ["primary", "success", "info", "warning", "danger"];
        const color = colors[index % colors.length];

        return (
          <div key={programme.id} className="card mb-4">
            <div className={`card-header bg-${color} text-white`}>
              <h3 className="h6 mb-0">{programme.name}</h3>
              {programme.target_areas && (
                <small className="opacity-75">{programme.target_areas}</small>
              )}
              {programme.description && (
                <small className="d-block opacity-75">
                  {programme.description}
                </small>
              )}
            </div>
            <div className="list-group list-group-flush">
              {programme.exercises && programme.exercises.length > 0 ? (
                programme.exercises.map((exercise) => (
                  <div key={exercise.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="h6 mb-1">{exercise.name}</h4>
                        <span className="badge bg-secondary small">
                          {exercise.type}
                        </span>
                        {exercise.notes && (
                          <p className="mb-0 text-muted small mt-1">
                            <i className="bi bi-info-circle me-1"></i>
                            {exercise.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-end">
                        <p className="mb-0 small">
                          {exercise.sets} × {exercise.reps}
                        </p>
                        <p className="mb-0 text-muted small">
                          Rest: {exercise.rest_seconds}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="list-group-item text-center text-muted">
                  <p className="mb-2">No exercises added yet</p>
                  <Link
                    to="/profile-manager"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Add Exercises
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Important Notes */}
      <div className="alert alert-info" role="alert">
        <h4 className="h6 fw-bold mb-2">
          <i className="bi bi-info-circle me-2"></i>
          Important Notes
        </h4>
        <ul className="mb-0 small">
          <li>Follow this plan as prescribed by your instructor</li>
          <li>Take rest days between sessions</li>
          <li>Complete sessions 2-4 times per week</li>
          <li>Do cardio at the END of your session</li>
          <li>Always warm up and cool down</li>
          {profile.notes && <li className="fw-bold">{profile.notes}</li>}
        </ul>
      </div>
    </div>
  );
}

export default Programme;
