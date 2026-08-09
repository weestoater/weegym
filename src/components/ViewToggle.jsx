/**
 * ViewToggle Component
 * Reusable button group for switching between views (e.g., log vs history)
 */

/**
 * ViewToggle button group
 *
 * @param {Object} props
 * @param {string} props.activeView - Currently active view
 * @param {Function} props.onViewChange - Callback when view changes
 * @param {Array} props.views - Array of view objects: [{value, label, icon}]
 * @param {React.ReactNode} props.rightContent - Optional content on the right (e.g., export button)
 * @param {string} props.className - Additional CSS classes
 */
export function ViewToggle({
  activeView,
  onViewChange,
  views,
  rightContent = null,
  className = "",
}) {
  return (
    <div
      className={`d-flex justify-content-between align-items-center ${className}`}
    >
      <div className="btn-group" role="group" aria-label="View toggle">
        {views.map((view) => (
          <button
            key={view.value}
            type="button"
            className={`btn btn-outline-primary ${activeView === view.value ? "active" : ""}`}
            onClick={() => onViewChange(view.value)}
            aria-pressed={activeView === view.value}
          >
            {view.icon && <i className={`bi ${view.icon} me-2`}></i>}
            {view.label}
          </button>
        ))}
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}

/**
 * Common log/history view toggle
 * Pre-configured for log vs history pattern
 *
 * @param {Object} props
 * @param {string} props.activeView - Currently active view
 * @param {Function} props.onViewChange - Callback when view changes
 * @param {React.ReactNode} props.rightContent - Optional content on the right
 * @param {Object} props.labels - Custom labels {log, history}
 * @param {string} props.className - Additional CSS classes
 */
export function LogHistoryToggle({
  activeView,
  onViewChange,
  rightContent = null,
  labels = { log: "Log Session", history: "History" },
  className = "",
}) {
  const views = [
    { value: "log", label: labels.log, icon: "bi-plus-circle" },
    { value: "history", label: labels.history, icon: "bi-clock-history" },
  ];

  return (
    <ViewToggle
      activeView={activeView}
      onViewChange={onViewChange}
      views={views}
      rightContent={rightContent}
      className={className}
    />
  );
}

/**
 * Tab navigation (alternative style)
 *
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Callback when tab changes
 * @param {Array} props.tabs - Array of tab objects: [{id, label, icon, badge}]
 * @param {string} props.className - Additional CSS classes
 */
export function TabNav({ activeTab, onTabChange, tabs, className = "" }) {
  return (
    <ul className={`nav nav-tabs ${className}`}>
      {tabs.map((tab) => (
        <li className="nav-item" key={tab.id}>
          <button
            className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.icon && <i className={`bi ${tab.icon} me-2`}></i>}
            {tab.label}
            {tab.badge && (
              <span className="badge bg-primary ms-2">{tab.badge}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Pill navigation (alternative style)
 *
 * @param {Object} props
 * @param {string} props.activePill - Currently active pill
 * @param {Function} props.onPillChange - Callback when pill changes
 * @param {Array} props.pills - Array of pill objects: [{id, label, icon}]
 * @param {string} props.className - Additional CSS classes
 */
export function PillNav({ activePill, onPillChange, pills, className = "" }) {
  return (
    <ul className={`nav nav-pills ${className}`}>
      {pills.map((pill) => (
        <li className="nav-item" key={pill.id}>
          <button
            className={`nav-link ${activePill === pill.id ? "active" : ""}`}
            onClick={() => onPillChange(pill.id)}
            type="button"
          >
            {pill.icon && <i className={`bi ${pill.icon} me-2`}></i>}
            {pill.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ViewToggle;
