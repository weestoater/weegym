import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.jsx";

// Import both themes - they'll be in the bundle
import "./styles-solar.scss";

// Apply theme class on initial load
const settings = JSON.parse(localStorage.getItem("gymSettings") || "{}");
const theme = settings.theme || "solar";
document.documentElement.setAttribute("data-theme", theme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
