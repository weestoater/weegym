import { useEffect } from "react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info",
  }[type];

  const icon = {
    success: "bi-check-circle-fill",
    error: "bi-exclamation-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  }[type];

  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x mt-3"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`toast show ${bgColor} text-white shadow-lg`}
        role="alert"
        style={{ minWidth: "300px" }}
      >
        <div className="toast-body d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center">
            <i className={`bi ${icon} fs-5 me-2`}></i>
            <span>{message}</span>
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
