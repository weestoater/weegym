import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.jsx";

// Import the United theme
import "./styles-united.scss";

// Apply theme class on initial load
const settings = JSON.parse(localStorage.getItem("gymSettings") || "{}");
const theme = settings.theme || "united";
document.documentElement.setAttribute("data-theme", theme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
