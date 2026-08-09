/**
 * ErrorMessage Component
 * User-friendly error display with optional retry action
 */

/**
 * Generic error alert with retry option
 */
export function ErrorAlert({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry = null,
  onDismiss = null,
  type = "error", // error, warning, info
}) {
  const bgClass =
    type === "warning"
      ? "alert-warning"
      : type === "info"
        ? "alert-info"
        : "alert-danger";
  const icon =
    type === "warning"
      ? "bi-exclamation-triangle"
      : type === "info"
        ? "bi-info-circle"
        : "bi-x-circle";

  return (
    <div
      className={`alert ${bgClass} alert-dismissible fade show`}
      role="alert"
    >
      <div className="d-flex align-items-start">
        <i className={`bi ${icon} me-3 fs-5`}></i>
        <div className="flex-grow-1">
          <h5 className="alert-heading mb-2">{title}</h5>
          <p className="mb-2">{message}</p>
          {onRetry && (
            <button
              className="btn btn-sm btn-outline-dark mt-2"
              onClick={onRetry}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Try Again
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        )}
      </div>
    </div>
  );
}

/**
 * Network error (no connection)
 */
export function NetworkError({ onRetry }) {
  return (
    <ErrorAlert
      title="No Internet Connection"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      type="warning"
    />
  );
}

/**
 * Authentication error
 */
export function AuthError({
  message = "You need to be logged in to view this content.",
}) {
  return (
    <div className="card">
      <div className="card-body text-center py-5">
        <i
          className="bi bi-shield-lock text-warning"
          style={{ fontSize: "4rem" }}
        ></i>
        <h3 className="mt-3">Authentication Required</h3>
        <p className="text-muted mb-4">{message}</p>
        <a href="/login" className="btn btn-primary">
          <i className="bi bi-box-arrow-in-right me-2"></i>
          Log In
        </a>
      </div>
    </div>
  );
}

/**
 * Not found error (404)
 */
export function NotFoundError({
  title = "Not Found",
  message = "The item you're looking for doesn't exist or has been removed.",
  actionLabel = "Go Back",
  onAction = () => window.history.back(),
}) {
  return (
    <div className="card">
      <div className="card-body text-center py-5">
        <i className="bi bi-search text-muted" style={{ fontSize: "4rem" }}></i>
        <h3 className="mt-3">{title}</h3>
        <p className="text-muted mb-4">{message}</p>
        <button className="btn btn-secondary" onClick={onAction}>
          <i className="bi bi-arrow-left me-2"></i>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Empty state (no data)
 */
export function EmptyState({
  icon = "bi-inbox",
  title = "No Data Yet",
  message = "Start adding items to see them here!",
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="card">
      <div className="card-body text-center py-5">
        <i className={`bi ${icon} text-muted`} style={{ fontSize: "4rem" }}></i>
        <h3 className="mt-3">{title}</h3>
        <p className="text-muted mb-4">{message}</p>
        {actionLabel && onAction && (
          <button className="btn btn-primary" onClick={onAction}>
            <i className="bi bi-plus-circle me-2"></i>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Form validation error summary
 */
export function ValidationErrors({ errors = [] }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="alert alert-danger" role="alert">
      <div className="d-flex align-items-start">
        <i className="bi bi-exclamation-circle me-2"></i>
        <div>
          <strong>Please fix the following errors:</strong>
          <ul className="mb-0 mt-2 ps-3">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * API error with details
 */
export function ApiError({ error, onRetry }) {
  // Parse error message
  let title = "Request Failed";
  let message = "An error occurred while communicating with the server.";
  let details = null;

  if (error) {
    if (error.message) {
      message = error.message;
    }
    if (error.status === 401) {
      title = "Unauthorized";
      message = "Your session has expired. Please log in again.";
    } else if (error.status === 403) {
      title = "Access Denied";
      message = "You don't have permission to access this resource.";
    } else if (error.status === 404) {
      title = "Not Found";
      message = "The requested resource could not be found.";
    } else if (error.status === 429) {
      title = "Rate Limit Exceeded";
      message = "Too many requests. Please wait a moment and try again.";
    } else if (error.status >= 500) {
      title = "Server Error";
      message = "The server encountered an error. Please try again later.";
    }

    if (error.details) {
      details = error.details;
    }
  }

  return (
    <div className="alert alert-danger" role="alert">
      <div className="d-flex align-items-start">
        <i className="bi bi-exclamation-triangle me-3 fs-5"></i>
        <div className="flex-grow-1">
          <h5 className="alert-heading mb-2">{title}</h5>
          <p className="mb-1">{message}</p>
          {details && (
            <small className="text-muted d-block mt-2">
              <strong>Details:</strong> {details}
            </small>
          )}
          {onRetry && (
            <button
              className="btn btn-sm btn-outline-danger mt-2"
              onClick={onRetry}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Success message component
 */
export function SuccessMessage({
  message = "Action completed successfully!",
  onDismiss = null,
}) {
  return (
    <div
      className={`alert alert-success ${onDismiss ? "alert-dismissible" : ""} fade show`}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i className="bi bi-check-circle me-2"></i>
        <div className="flex-grow-1">{message}</div>
        {onDismiss && (
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;
