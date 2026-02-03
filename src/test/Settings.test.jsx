import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Settings from "../pages/Settings";

// Mock the custom hook
vi.mock("../hooks/useSettings", () => ({
  useSettings: vi.fn(() => ({
    settings: { shortRest: 60, defaultRest: 90, longRest: 120 },
    loading: false,
    saving: false,
    error: null,
    validationErrors: [],
    saveSettings: vi.fn(() => Promise.resolve({ success: true })),
    resetSettings: vi.fn(() => Promise.resolve({ success: true })),
    updateSetting: vi.fn(),
  })),
}));

// Mock the service
vi.mock("../services/settingsService", () => ({
  defaultSettingsService: {
    getUserSettings: vi.fn(),
    saveUserSettings: vi.fn(),
  },
}));

describe("Settings Component - Refactored", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Settings page", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("displays rest time inputs", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBe(3); // short, default, long
  });

  it("shows current values", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs[0].value).toBe("60");
    expect(inputs[1].value).toBe("90");
    expect(inputs[2].value).toBe("120");
  });

  it("has save button", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    const saveButton = screen.getByText(/Save Settings/i);
    expect(saveButton).toBeInTheDocument();
  });

  it("has reset button", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    const resetButton = screen.getByText(/Reset to Defaults/i);
    expect(resetButton).toBeInTheDocument();
  });

  it("displays quick presets", async () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Quick Workout/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard/i)).toBeInTheDocument();
    expect(screen.getByText(/Strength Focus/i)).toBeInTheDocument();
  });

  it("shows loading state", async () => {
    const { useSettings } = await import("../hooks/useSettings");
    useSettings.mockReturnValue({
      settings: { shortRest: 60, defaultRest: 90, longRest: 120 },
      loading: true,
      saving: false,
      error: null,
      validationErrors: [],
      saveSettings: vi.fn(),
      resetSettings: vi.fn(),
      updateSetting: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    expect(screen.getByText("Loading your settings...")).toBeInTheDocument();
  });

  it("shows error message when present", async () => {
    const { useSettings } = await import("../hooks/useSettings");
    useSettings.mockReturnValue({
      settings: { shortRest: 60, defaultRest: 90, longRest: 120 },
      loading: false,
      saving: false,
      error: "Failed to load settings",
      validationErrors: [],
      saveSettings: vi.fn(),
      resetSettings: vi.fn(),
      updateSetting: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Failed to load settings/i)).toBeInTheDocument();
  });

  it("shows validation errors", async () => {
    const { useSettings } = await import("../hooks/useSettings");
    useSettings.mockReturnValue({
      settings: { shortRest: 60, defaultRest: 90, longRest: 120 },
      loading: false,
      saving: false,
      error: null,
      validationErrors: ["Short rest must be less than default rest"],
      saveSettings: vi.fn(),
      resetSettings: vi.fn(),
      updateSetting: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Validation Errors/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Short rest must be less than default rest/i),
    ).toBeInTheDocument();
  });

  it("disables inputs while saving", async () => {
    const { useSettings } = await import("../hooks/useSettings");
    useSettings.mockReturnValue({
      settings: { shortRest: 60, defaultRest: 90, longRest: 120 },
      loading: false,
      saving: true,
      error: null,
      validationErrors: [],
      saveSettings: vi.fn(),
      resetSettings: vi.fn(),
      updateSetting: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>,
    );

    const inputs = screen.getAllByRole("spinbutton");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
