/**
 * Skeleton Component
 * Reusable skeleton loader for various content types
 */

/**
 * Basic skeleton shape
 */
export function SkeletonBox({
  width = "100%",
  height = "20px",
  className = "",
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        backgroundColor: "#e0e0e0",
        borderRadius: "4px",
        animation: "skeleton-pulse 1.5s ease-in-out infinite",
      }}
    ></div>
  );
}

/**
 * Skeleton card for dashboard stats
 */
export function SkeletonStatsCard() {
  return (
    <div className="card">
      <div className="card-body text-center py-3">
        <SkeletonBox height="32px" width="60px" className="mx-auto mb-2" />
        <SkeletonBox height="14px" width="80px" className="mx-auto" />
      </div>
    </div>
  );
}

/**
 * Skeleton for activity/session list item
 */
export function SkeletonListItem() {
  return (
    <div className="list-group-item">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <SkeletonBox height="20px" width="60%" className="mb-2" />
          <SkeletonBox height="14px" width="40%" className="mb-1" />
          <SkeletonBox height="14px" width="30%" />
        </div>
        <div className="text-end ms-3" style={{ minWidth: "80px" }}>
          <SkeletonBox height="16px" width="60px" className="mb-1 ms-auto" />
          <SkeletonBox height="24px" width="80px" className="ms-auto" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for activity card (Strava)
 */
export function SkeletonActivityCard() {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <SkeletonBox height="24px" width="70%" className="mb-2" />
            <SkeletonBox height="16px" width="40%" />
          </div>
          <SkeletonBox height="32px" width="32px" />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-6">
            <SkeletonBox height="16px" width="90%" />
          </div>
          <div className="col-6">
            <SkeletonBox height="16px" width="80%" />
          </div>
          <div className="col-6">
            <SkeletonBox height="16px" width="85%" />
          </div>
          <div className="col-6">
            <SkeletonBox height="16px" width="75%" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for table row
 */
export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <SkeletonBox height="16px" width={i === 0 ? "70%" : "60%"} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for exercise list (Programme page)
 */
export function SkeletonExerciseList({ count = 3 }) {
  return (
    <div className="list-group list-group-flush">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="list-group-item">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <SkeletonBox height="18px" width="50%" className="mb-2" />
              <SkeletonBox height="20px" width="60px" className="mb-1" />
            </div>
            <div className="text-end">
              <SkeletonBox height="14px" width="60px" className="mb-1" />
              <SkeletonBox height="14px" width="70px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for dashboard overview
 */
export function SkeletonDashboard() {
  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="mb-4">
        <SkeletonBox height="32px" width="250px" className="mb-2" />
        <SkeletonBox height="18px" width="180px" />
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <SkeletonStatsCard />
        </div>
        <div className="col-6 col-md-3">
          <SkeletonStatsCard />
        </div>
        <div className="col-6 col-md-3">
          <SkeletonStatsCard />
        </div>
        <div className="col-6 col-md-3">
          <SkeletonStatsCard />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card mb-4">
        <div className="card-header">
          <SkeletonBox height="20px" width="150px" />
        </div>
        <div className="list-group list-group-flush">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>
      </div>
    </div>
  );
}

/**
 * CSS animation (add to index.css or App.css)
 */
export const skeletonStyles = `
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
`;

export default SkeletonBox;
