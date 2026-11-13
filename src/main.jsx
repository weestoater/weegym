import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App.jsx";
import { applyTheme, getStoredTheme } from "./utils/themes";

// Load the saved theme before first render to avoid a flash of unstyled content
applyTheme(getStoredTheme())
  .catch((error) => console.error("Failed to load theme", error))
  .finally(() => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
