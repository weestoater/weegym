/**
 * GarminUpload Component
 * Allows users to upload Garmin FIT files for parsing and import
 * Supports both activity files (workouts) and monitoring files (daily steps)
 */

import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  importFitFile,
  importMultipleFitFiles,
  validateFitFile,
} from "../services/fitParser";

function GarminUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Add files with validation
  const addFiles = (files) => {
    const fitFiles = files.filter((f) => {
      const validation = validateFitFile(f);
      if (!validation.valid) {
        console.warn(`Invalid file ${f.name}:`, validation.errors);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...fitFiles]);
    setError(null);
    setResults(null);
  };

  // Remove a file from selection
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setSelectedFiles([]);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Import single or multiple files
  const handleImport = async () => {
    if (selectedFiles.length === 0) return;

    setImporting(true);
    setError(null);
    setResults(null);

    try {
      let result;

      if (selectedFiles.length === 1) {
        // Single file import
        result = await importFitFile(user.id, selectedFiles[0]);
        result = {
          total: 1,
          successful: 1,
          failed: 0,
          activities: result.type === "activity" ? 1 : 0,
          monitoring: result.type === "monitoring" ? result.count || 0 : 0,
          details: [
            {
              filename: selectedFiles[0].name,
              success: true,
              type: result.type,
              message: result.message,
            },
          ],
        };
      } else {
        // Batch import
        result = await importMultipleFitFiles(user.id, selectedFiles);
      }

      setResults(result);

      // Clear files on success
      if (result.successful > 0) {
        setTimeout(() => {
          setSelectedFiles([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Import error:", err);
      setError(err.message || "Failed to import files");
    } finally {
      setImporting(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Please log in to upload Garmin FIT files.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
            Import Garmin FIT Files
          </h2>
          <p className="text-muted">
            Upload activity or monitoring files from your Garmin device
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card bg-light border-0">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                How to get your FIT files
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <p className="small mb-2">
                    <strong>From Garmin Connect:</strong>
                  </p>
                  <ol className="small mb-0">
                    <li>Log in to connect.garmin.com</li>
                    <li>Select an activity</li>
                    <li>Click gear icon → "Export Original"</li>
                    <li>Downloads .fit file</li>
                  </ol>
                </div>
                <div className="col-md-6">
                  <p className="small mb-2">
                    <strong>From Device:</strong>
                  </p>
                  <ol className="small mb-0">
                    <li>Connect via USB</li>
                    <li>Navigate to /GARMIN/Activity/</li>
                    <li>Copy .fit files</li>
                  </ol>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge bg-primary me-2">Activity Files</span>
                <span className="badge bg-success">Monitoring Files</span>
                <span className="small text-muted ms-2">
                  Both types are supported!
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-primary">
            <div className="card-body text-center">
              <div className="display-4 mb-0">
                <i
                  className="bi bi-smartwatch text-primary"
                  aria-hidden="true"
                ></i>
                <span className="visually-hidden">
                  Garmin device compatible
                </span>
              </div>
              <p className="small text-muted mb-0">
                Works with all Garmin devices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div
            className={`card ${dragOver ? "border-primary" : "border-secondary"} border-2`}
            style={{
              borderStyle: "dashed",
              backgroundColor: dragOver ? "#f0f8ff" : "white",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="card-body text-center py-5">
              <i
                className={`bi bi-cloud-upload ${dragOver ? "text-primary" : "text-secondary"}`}
                style={{ fontSize: "4rem" }}
              ></i>
              <h4 className="mt-3">
                {dragOver ? "Drop files here" : "Drag & drop FIT files"}
              </h4>
              <p className="text-muted mb-3">or</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fit"
                multiple
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="fitFileInput"
              />
              <label htmlFor="fitFileInput" className="btn btn-primary">
                <i className="bi bi-folder-open me-2"></i>
                Browse Files
              </label>
              <p className="small text-muted mt-3 mb-0">
                Accepts .fit files only (max 50MB each)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Selected Files ({selectedFiles.length})
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearFiles}
                  disabled={importing}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear All
                </button>
              </div>
              <div className="list-group list-group-flush">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-file-earmark-binary text-primary me-2"></i>
                        <div>
                          <div className="fw-medium">{file.name}</div>
                          <small className="text-muted">
                            {formatFileSize(file.size)}
                          </small>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFile(index)}
                      disabled={importing}
                      aria-label={`Remove ${file.name}`}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-success"
                  onClick={handleImport}
                  disabled={importing || selectedFiles.length === 0}
                >
                  {importing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      Import {selectedFiles.length} File
                      {selectedFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="row mb-4">
          <div className="col-lg-8">
            <div
              className={`alert ${results.failed > 0 ? "alert-warning" : "alert-success"}`}
            >
              <h5 className="alert-heading">
                <i className="bi bi-check-circle-fill me-2"></i>
                Import Complete
              </h5>
              <div className="row mb-2">
                <div className="col-6">
                  <strong>Total:</strong> {results.total} file(s)
                </div>
                <div className="col-6">
                  <strong>Successful:</strong> {results.successful}
                </div>
              </div>
              {results.activities > 0 && (
                <div className="mb-2">
                  <i className="bi bi-bicycle me-2"></i>
                  <strong>Activities imported:</strong> {results.activities}
                </div>
              )}
              {results.monitoring > 0 && (
                <div className="mb-2">
                  <i className="bi bi-graph-up me-2"></i>
                  <strong>Days of step data:</strong> {results.monitoring}
                </div>
              )}
              {results.failed > 0 && (
                <div className="text-danger">
                  <strong>Failed:</strong> {results.failed}
                </div>
              )}

              <hr />

              {/* Detailed Results */}
              <div className="small">
                {results.details.map((detail, idx) => (
                  <div key={idx} className="mb-1">
                    {detail.success ? (
                      <span className="text-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {detail.filename}: {detail.message}
                      </span>
                    ) : (
                      <span className="text-danger">
                        <i className="bi bi-x-circle-fill me-2"></i>
                        {detail.filename}: {detail.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <hr />

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate("/strava")}
                >
                  <i className="bi bi-bicycle me-1"></i>
                  View Activities
                </button>
                {results.monitoring > 0 && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => navigate("/step-tracker")}
                  >
                    <i className="bi bi-graph-up me-1"></i>
                    View Step Data
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setResults(null)}
                >
                  Import More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Quick Links</h6>
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate("/strava")}
                >
                  <i className="bi bi-bicycle me-1"></i>
                  Activities
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => navigate("/step-tracker")}
                >
                  <i className="bi bi-graph-up me-1"></i>
                  Step Tracker
                </button>
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarminUpload;
