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
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function NavigationBar() {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show navigation on login page or if not authenticated
  if (!user || location.pathname === "/login") {
    return null;
  }

  const navItems = [
    { path: "/", icon: "bi-house-door", label: "Home" },
    { path: "/workout", icon: "bi-play-circle", label: "Workout" },
    { path: "/wellbeing", icon: "bi-activity", label: "AW" },
    { path: "/history", icon: "bi-clock-history", label: "History" },
    { path: "/programme", icon: "bi-journal-text", label: "Programme" },
    { path: "/settings", icon: "bi-gear", label: "Settings" },
  ];

  return (
    <nav className="navbar navbar-light bg-light border-top fixed-bottom">
      <div className="container-fluid">
        <div className="d-flex justify-content-around w-100">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link text-center ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-secondary"
              }`}
              style={{ flex: 1 }}
            >
              <i className={`${item.icon} fs-4 d-block`}></i>
              <small>{item.label}</small>
            </Link>
          ))}
        </div>
      </div>
    </nav>
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
