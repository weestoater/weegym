import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import WorkoutSession from "./pages/WorkoutSession";
import History from "./pages/History";
import Programme from "./pages/Programme";
import ActiveWellbeing from "./pages/ActiveWellbeing";
import Settings from "./pages/Settings";

function NavigationBar() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: "bi-house-door", label: "Home" },
    { path: "/workout", icon: "bi-play-circle", label: "Workout" },
    { path: "/wellbeing", icon: "bi-activity", label: "Wellbeing" },
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

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Router basename="/weegym">
      <div className="d-flex flex-column min-vh-100">
        {/* Header */}
        <header className="bg-primary text-white py-3 shadow-sm">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h4 mb-0">
                <i className="bi bi-heart-pulse me-2"></i>
                WeeGym Tracker
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

        {/* Main Content */}
        <main className="flex-grow-1 pb-5 mb-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutSession />} />
            <Route path="/wellbeing" element={<ActiveWellbeing />} />
            <Route path="/history" element={<History />} />
            <Route path="/programme" element={<Programme />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <NavigationBar />
      </div>
    </Router>
  );
}

export default App;
