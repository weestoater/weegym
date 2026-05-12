import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import WorkoutSession from "./pages/WorkoutSession";
import History from "./pages/History";
import Programme from "./pages/Programme";
import ActiveWellbeing from "./pages/ActiveWellbeing";
import CalorieTracker from "./pages/CalorieTracker";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import UserProfileManager from "./pages/UserProfileManager";
import AddUser from "./pages/AddUser";
import StravaConnect from "./pages/StravaConnect";
import StravaActivities from "./pages/StravaActivities";
import StravaAnalytics from "./pages/StravaAnalytics";
import StravaCallback from "./pages/StravaCallback";

function NavigationBar() {
  const location = useLocation();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Don't show navigation on login page or if not authenticated
  if (!user || location.pathname === "/login") {
    return null;
  }

  const navItems = [
    { path: "/", icon: "bi-house-door", label: "Home" },
    { path: "/workout", icon: "bi-play-circle", label: "Workout" },
    { path: "/wellbeing", icon: "bi-activity", label: "Active Wellbeing" },
    { path: "/calories", icon: "bi-star-fill", label: "Slimming World" },
    { path: "/strava", icon: "bi-bicycle", label: "Strava" },
    { path: "/history", icon: "bi-clock-history", label: "History" },
    { path: "/programme", icon: "bi-journal-text", label: "Programme" },
    { path: "/settings", icon: "bi-gear", label: "Settings" },
  ];

  const handleNavClick = () => {
    setShowMenu(false);
  };

  return (
    <>
      {/* Navigation Menu Popup */}
      {showMenu && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
          onClick={() => setShowMenu(false)}
        >
          <div
            className="bg-white rounded-top shadow-lg"
            style={{
              width: "80%",
              maxWidth: "250px",
              maxHeight: "70vh",
              overflowY: "auto",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>
                Navigation
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
              ></button>
            </div>
            <div className="list-group list-group-flush">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={handleNavClick}
                >
                  <i className={`${item.icon} fs-4 me-3`}></i>
                  <span className="fw-semibold">{item.label}</span>
                  {location.pathname === item.path && (
                    <i className="bi bi-check2 ms-auto fs-5"></i>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer with Menu Button */}
      <nav className="navbar navbar-light bg-light border-top fixed-bottom">
        <div className="container-fluid">
          <div className="d-flex justify-content-center w-100">
            <button
              className="btn btn-primary btn-lg d-flex align-items-center gap-2"
              onClick={() => setShowMenu(true)}
              aria-label="Open navigation menu"
            >
              <i className="bi bi-list fs-4"></i>
              <span>Menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide Up Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();
  const location = useLocation();
  const appVersion =
    typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0";

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check for version updates every 5 minutes
    const checkForUpdates = () => {
      // Force reload from server if service worker updates
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }
    };

    // Check immediately and then every 5 minutes
    checkForUpdates();
    const intervalId = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  const showHeader = user && location.pathname !== "/login";

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      {showHeader && (
        <header className="bg-primary text-white py-3 shadow-sm">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h4 mb-0">
                <i className="bi bi-heart-pulse me-2"></i>
                WeeGym Tracker
                <small
                  className="ms-2 opacity-50"
                  style={{ fontSize: "0.6em" }}
                >
                  v{appVersion}
                </small>
              </h1>
              {!isOnline && (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-wifi-off me-1"></i>
                  Offline
                </span>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow-1 pb-5 mb-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout"
            element={
              <ProtectedRoute>
                <WorkoutSession />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wellbeing"
            element={
              <ProtectedRoute>
                <ActiveWellbeing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calories"
            element={
              <ProtectedRoute>
                <CalorieTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programme"
            element={
              <ProtectedRoute>
                <Programme />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-manager"
            element={
              <ProtectedRoute>
                <UserProfileManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-user"
            element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strava"
            element={
              <ProtectedRoute>
                <StravaConnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strava/activities"
            element={
              <ProtectedRoute>
                <StravaActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strava/analytics"
            element={
              <ProtectedRoute>
                <StravaAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strava/callback"
            element={
              <ProtectedRoute>
                <StravaCallback />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
}

function App() {
  return (
    <Router basename="/weegym">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
