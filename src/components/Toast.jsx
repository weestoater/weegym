import { useEffect } from "react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Normalize type to support both 'error' and 'danger'
  const normalizedType = type === "danger" ? "error" : type;

  const bgColor = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info",
  }[normalizedType] || "bg-danger"; // Default to danger if type unknown

  const icon = {
    success: "bi-check-circle-fill",
    error: "bi-exclamation-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  }[normalizedType] || "bi-exclamation-circle-fill";

  // Use white text for all types to ensure contrast
  const textColor = "text-white";

  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x mt-3"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`toast show ${bgColor} ${textColor} shadow-lg`}
        role="alert"
        style={{ minWidth: "300px", fontWeight: "500" }}
      >
        <div className="toast-body d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center">
            <i className={`bi ${icon} fs-5 me-2`}></i>
            <span style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
              {message}
            </span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
