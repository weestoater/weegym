/**
 * Tooltip Component
 * Contextual help tooltips for complex features
 */
import { useState } from "react";

/**
 * Basic tooltip with hover behavior
 */
export function Tooltip({
  content,
  children,
  placement = "top", // top, bottom, left, right
  className = "",
}) {
  const [show, setShow] = useState(false);

  const placementClasses = {
    top: "bottom-100 start-50 translate-middle-x mb-2",
    bottom: "top-100 start-50 translate-middle-x mt-2",
    left: "end-100 top-50 translate-middle-y me-2",
    right: "start-100 top-50 translate-middle-y ms-2",
  };

  return (
    <div
      className={`position-relative d-inline-block ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`position-absolute ${placementClasses[placement]} tooltip-custom`}
          style={{
            zIndex: 1070,
            maxWidth: "200px",
            padding: "0.5rem 0.75rem",
            backgroundColor: "#212529",
            color: "#fff",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            whiteSpace: "normal",
            boxShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.2)",
          }}
          role="tooltip"
        >
          {content}
          <div
            className={`position-absolute ${
              placement === "top"
                ? "top-100 start-50 translate-middle-x"
                : placement === "bottom"
                  ? "bottom-100 start-50 translate-middle-x"
                  : placement === "left"
                    ? "start-100 top-50 translate-middle-y"
                    : "end-100 top-50 translate-middle-y"
            }`}
            style={{
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth:
                placement === "top" || placement === "bottom"
                  ? "5px 5px 0 5px"
                  : "5px 0 5px 5px",
              borderColor:
                placement === "top"
                  ? "#212529 transparent transparent transparent"
                  : placement === "bottom"
                    ? "transparent transparent #212529 transparent"
                    : placement === "left"
                      ? "transparent transparent transparent #212529"
                      : "transparent #212529 transparent transparent",
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Info icon with tooltip
 */
export function InfoTooltip({ content, placement = "top" }) {
  return (
    <Tooltip content={content} placement={placement}>
      <i
        className="bi bi-info-circle text-muted"
        style={{ cursor: "help" }}
        aria-hidden="true"
      ></i>
    </Tooltip>
  );
}

/**
 * Help icon with tooltip
 */
export function HelpTooltip({ content, placement = "top" }) {
  return (
    <Tooltip content={content} placement={placement}>
      <i
        className="bi bi-question-circle text-primary"
        style={{ cursor: "help" }}
        aria-hidden="true"
      ></i>
    </Tooltip>
  );
}

/**
 * Form field tooltip (appears next to label)
 */
export function FieldTooltip({ content, placement = "top" }) {
  return (
    <Tooltip content={content} placement={placement}>
      <i
        className="bi bi-question-circle text-muted ms-1"
        style={{ cursor: "help", fontSize: "0.875rem" }}
        aria-hidden="true"
      ></i>
    </Tooltip>
  );
}

/**
 * Feature badge with tooltip
 */
export function BadgeTooltip({
  badge,
  content,
  badgeColor = "primary",
  placement = "top",
}) {
  return (
    <Tooltip content={content} placement={placement}>
      <span
        className={`badge bg-${badgeColor}`}
        style={{ cursor: "help" }}
        tabIndex={0}
      >
        {badge}
      </span>
    </Tooltip>
  );
}

export default Tooltip;
