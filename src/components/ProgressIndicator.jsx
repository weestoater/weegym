import PropTypes from "prop-types";
import "../styles/accessibility.css";

/**
 * ProgressIndicator Component
 *
 * Accessible progress indicator with patterns for colorblind users
 * and proper ARIA labels for screen readers
 */
function ProgressIndicator({ current, total, label, showPercentage = true }) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const remaining = Math.max(total - current, 0);
  const isOver = current > total;

  // Determine status and styling
  let status, className, icon, patternClass, message;

  if (isOver) {
    status = "over";
    className = "progress-over";
    patternClass = "pattern-danger";
    icon = "bi-exclamation-triangle-fill";
    message = `Over limit by ${(current - total).toFixed(1)}`;
  } else if (percentage >= 90) {
    status = "caution";
    className = "progress-caution";
    patternClass = "pattern-warning";
    icon = "bi-exclamation-circle-fill";
    message = `${remaining.toFixed(1)} remaining`;
  } else if (percentage >= 70) {
    status = "warning";
    className = "progress-caution";
    patternClass = "pattern-warning";
    icon = "bi-info-circle-fill";
    message = `${remaining.toFixed(1)} remaining`;
  } else {
    status = "good";
    className = "progress-good";
    patternClass = "pattern-success";
    icon = "bi-check-circle-fill";
    message = `${remaining.toFixed(1)} remaining`;
  }

  const percentageRounded = Math.round(percentage);

  return (
    <div
      className="progress-indicator"
      role="progressbar"
      aria-label={label}
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext={`${current.toFixed(1)} of ${total} ${label}. ${message}`}
    >
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">
            <i className={`bi ${icon} me-2`} aria-hidden="true"></i>
            {label}
          </span>
          <span
            className={`badge-accessible ${status === "good" ? "indicator-success" : status === "over" ? "indicator-danger" : "indicator-warning"} pattern`}
            aria-label={message}
          >
            <i className={`bi ${icon}`} aria-hidden="true"></i>
            {message}
          </span>
        </div>

        <div className="progress-bar-patterned">
          <div
            className={`progress-bar-fill ${className}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <span className="position-relative" style={{ zIndex: 1 }}>
              {showPercentage && (
                <>
                  <span className="fw-bold">{current.toFixed(1)}</span>
                  <span className="mx-1">/</span>
                  <span>{total}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {showPercentage && (
          <div className="text-center mt-1">
            <small className="text-muted">
              {percentageRounded}% used
              <span className="visually-hidden">
                . {isOver ? "Over limit" : remaining.toFixed(1) + " remaining"}
              </span>
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

ProgressIndicator.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  showPercentage: PropTypes.bool,
};

export default ProgressIndicator;
