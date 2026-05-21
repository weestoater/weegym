import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Programme from "../pages/Programme";

// Mock the database module
vi.mock("../lib/database", () => ({
  getWorkouts: vi.fn(() =>
    Promise.resolve([
      { id: 1, name: "Day 1", date: "2026-02-01", duration: 45, exercises: [] },
      { id: 2, name: "Day 2", date: "2026-02-02", duration: 50, exercises: [] },
    ]),
  ),
  deleteWorkout: vi.fn(() => Promise.resolve()),
  updateWorkout: vi.fn(() => Promise.resolve()),
}));

describe("Programme Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Programme page", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    expect(screen.getByText("Programme Details")).toBeInTheDocument();
  });

  it("displays workout days in accordions", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Day 1 - Upper Body/i)).toBeInTheDocument();
    expect(screen.getByText(/Day 2 - Mixed Areas/i)).toBeInTheDocument();
  });

  it("shows key concepts", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Progressive Overload/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Under Tension/i)).toBeInTheDocument();
  });

  it("displays workout history accordion", async () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Workout History/i)).toBeInTheDocument();
    });
  });

  it("shows workout history count badge", async () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // Should show badge with count of 2 workouts
      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("displays workout list in history section", async () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
      expect(screen.getByText("Day 2")).toBeInTheDocument();
    });
  });

  it("shows empty state when no workouts in history", async () => {
    const { getWorkouts } = await import("../lib/database");
    getWorkouts.mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No workouts logged yet/i)).toBeInTheDocument();
    });
  });

  it("displays workout duration in history", async () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/45/)).toBeInTheDocument();
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });
  });

  it("has accordion structure for Day 1 exercises", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    // Check for accordion button attributes
    const buttons = screen.getAllByRole("button");
    const day1Button = buttons.find(btn => btn.textContent.includes("Day 1"));
    expect(day1Button).toHaveAttribute("data-bs-toggle", "collapse");
  });

  it("has accordion structure for Day 2 exercises", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    const buttons = screen.getAllByRole("button");
    const day2Button = buttons.find(btn => btn.textContent.includes("Day 2"));
    expect(day2Button).toHaveAttribute("data-bs-toggle", "collapse");
  });

  it("has accordion structure for workout history", async () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const historyButton = buttons.find(btn => btn.textContent.includes("Workout History"));
      expect(historyButton).toHaveAttribute("data-bs-toggle", "collapse");
    });
  });

  it("displays important notes section", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Important Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Follow this plan for ~1 month/i)).toBeInTheDocument();
  });
});
