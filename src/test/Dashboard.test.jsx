import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

// Mock the database module
vi.mock("../lib/database", () => ({
  getWorkouts: vi.fn(() =>
    Promise.resolve([
      {
        id: 1,
        name: "Day 1",
        date: "2026-02-01",
        duration: 45,
        exercises: [],
      },
    ]),
  ),
  getActiveWellbeingSessions: vi.fn(() =>
    Promise.resolve([
      {
        id: 1,
        machine: "Cross cycle",
        mode: "Cardio",
        score: 150,
        date: "2026-02-01",
      },
    ]),
  ),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome message", async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Ian!/i)).toBeInTheDocument();
    });
  });

  it("displays workout stats", async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Workouts")).toBeInTheDocument();
      expect(screen.getByText("Wellbeing")).toBeInTheDocument();
    });
  });

  it("shows quick action buttons", async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Start Day 1 Workout/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Day 2 Workout/i)).toBeInTheDocument();
      expect(screen.getByText(/Log Active Wellbeing/i)).toBeInTheDocument();
    });
  });

  it("displays workout target descriptions", async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Chest • Shoulders • Arms/i)).toBeInTheDocument();
      expect(screen.getByText(/Legs • Glutes • Core/i)).toBeInTheDocument();
    });
  });
});
