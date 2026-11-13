import { useState } from "react";
import { THEMES, getStoredTheme, setTheme } from "../utils/themes";

function ThemeSelector() {
  const [theme, setCurrentTheme] = useState(getStoredTheme);
  const [loading, setLoading] = useState(false);

  const handleChange = async (event) => {
    const next = event.target.value;
    setCurrentTheme(next);
    setLoading(true);
    try {
      await setTheme(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center ms-auto me-2">
      <label htmlFor="theme-select" className="visually-hidden">
        Theme
      </label>
      <i className="bi bi-palette me-2" aria-hidden="true"></i>
      <select
        id="theme-select"
        className="form-select form-select-sm w-auto"
        value={theme}
        onChange={handleChange}
        aria-busy={loading}
      >
        {THEMES.map(({ name, label }) => (
          <option key={name} value={name}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ThemeSelector;
