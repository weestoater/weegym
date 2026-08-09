/**
 * StatCard Component
 * Reusable stat card for displaying metrics with icon, value, and label
 */

/**
 * Single stat card component
 * Used for dashboard stats, summary metrics, etc.
 *
 * @param {Object} props
 * @param {string} props.icon - Bootstrap icon class (e.g., "bi-trophy")
 * @param {string|number} props.value - Main stat value to display
 * @param {string} props.label - Label describing the stat
 * @param {string} props.color - Bootstrap color (primary, success, info, etc.)
 * @param {string} props.variant - Card variant: "default", "compact", "large"
 * @param {Function} props.onClick - Optional click handler (makes card clickable)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.subtitle - Optional subtitle below value
 */
export function StatCard({
  icon,
  value,
  label,
  color = "primary",
  variant = "default",
  onClick = null,
  className = "",
  subtitle = null,
}) {
  const isClickable = !!onClick;
  const variantClasses = {
    default: "",
    compact: "p-2",
    large: "p-4",
  };

  return (
    <div
      className={`card ${isClickable ? "cursor-pointer" : ""} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      style={isClickable ? { cursor: "pointer" } : {}}
    >
      <div className="card-body text-center">
        {icon && <i className={`bi ${icon} text-${color} fs-4 mb-2`}></i>}
        <div className={`fw-bold ${variant === "large" ? "fs-2" : "fs-4"}`}>
          {value || "—"}
        </div>
        <div className={`text-muted ${variant === "compact" ? "small" : ""}`}>
          {label}
        </div>
        {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

/**
 * Grid of stat cards
 * Responsive grid layout for multiple stats
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects {icon, value, label, color}
 * @param {number} props.columns - Number of columns (2, 3, 4, 6)
 * @param {string} props.variant - Variant to apply to all cards
 * @param {string} props.className - Additional CSS classes
 */
export function StatCardGrid({
  stats,
  columns = 4,
  variant = "default",
  className = "",
}) {
  const responsiveClass = columns > 2 ? `col-md-${12 / columns}` : "";

  return (
    <div className={`row g-3 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className={`col-6 ${responsiveClass}`}>
          <StatCard {...stat} variant={variant} />
        </div>
      ))}
    </div>
  );
}

/**
 * Inline stat (for use in lists or compact spaces)
 *
 * @param {Object} props
 * @param {string} props.icon - Bootstrap icon class
 * @param {string|number} props.value - Stat value
 * @param {string} props.color - Bootstrap color
 * @param {string} props.className - Additional CSS classes
 */
export function InlineStat({ icon, value, color = "muted", className = "" }) {
  return (
    <span className={`d-inline-flex align-items-center ${className}`}>
      {icon && <i className={`bi ${icon} text-${color} me-1`}></i>}
      <span className={`text-${color}`}>{value || "—"}</span>
    </span>
  );
}

/**
 * Stat badge (for small inline stats)
 *
 * @param {Object} props
 * @param {string} props.icon - Bootstrap icon class
 * @param {string|number} props.value - Stat value
 * @param {string} props.color - Badge color (primary, success, etc.)
 * @param {string} props.className - Additional CSS classes
 */
export function StatBadge({
  icon,
  value,
  color = "secondary",
  className = "",
}) {
  return (
    <span className={`badge bg-${color} ${className}`}>
      {icon && <i className={`bi ${icon} me-1`}></i>}
      {value}
    </span>
  );
}

/**
 * Progress stat (shows progress bar with value)
 *
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {number} props.value - Current value
 * @param {number} props.max - Maximum value
 * @param {string} props.color - Progress bar color
 * @param {boolean} props.showPercentage - Show percentage instead of value
 * @param {string} props.className - Additional CSS classes
 */
export function ProgressStat({
  label,
  value,
  max,
  color = "primary",
  showPercentage = false,
  className = "",
}) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const displayValue = showPercentage ? `${percentage}%` : `${value} / ${max}`;

  return (
    <div className={className}>
      <div className="d-flex justify-content-between mb-1">
        <span className="small text-muted">{label}</span>
        <span className="small fw-bold">{displayValue}</span>
      </div>
      <div
        className="progress"
        style={{ height: "8px" }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
      >
        <div
          className={`progress-bar bg-${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Comparison stat (shows current vs previous with trend)
 *
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {number} props.current - Current value
 * @param {number} props.previous - Previous value
 * @param {string} props.unit - Unit suffix (e.g., "km", "min")
 * @param {boolean} props.higherIsBetter - Whether increase is positive
 * @param {string} props.className - Additional CSS classes
 */
export function ComparisonStat({
  label,
  current,
  previous,
  unit = "",
  higherIsBetter = true,
  className = "",
}) {
  const diff = current - previous;
  const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;
  const isIncrease = diff > 0;
  const isPositive = higherIsBetter ? isIncrease : !isIncrease;
  const color = isPositive ? "success" : "danger";
  const icon = isIncrease ? "bi-arrow-up" : "bi-arrow-down";

  return (
    <div
      className={`d-flex justify-content-between align-items-center ${className}`}
    >
      <div>
        <div className="text-muted small">{label}</div>
        <div className="fw-bold fs-5">
          {current}
          {unit && <span className="text-muted small ms-1">{unit}</span>}
        </div>
      </div>
      {diff !== 0 && (
        <div className={`text-${color} small`}>
          <i className={`bi ${icon}`}></i> {Math.abs(percentChange)}%
        </div>
      )}
    </div>
  );
}

export default StatCard;
