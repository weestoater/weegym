import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import History from "../pages/History";

// Mock the database module
vi.mock("../lib/database", () => ({
  getWorkouts: vi.fn(() =>
    Promise.resolve([
      { id: 1, name: "Day 1", date: "2026-02-01", duration: 45, exercises: [] },
      { id: 2, name: "Day 2", date: "2026-02-02", duration: 50, exercises: [] },
    ]),
  ),
  deleteWorkout: vi.fn(() => Promise.resolve()),
}));

describe("History Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders History page", async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Day 1/i)).toBeInTheDocument();
    });
  });

  it("displays workout list", async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Day 1")).toBeInTheDocument();
      expect(screen.getByText("Day 2")).toBeInTheDocument();
    });
  });

  it("shows empty state when no workouts", async () => {
    const { getWorkouts } = await import("../lib/database");
    getWorkouts.mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No workouts logged yet/i)).toBeInTheDocument();
    });
  });

  it("displays workout duration", async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/45/)).toBeInTheDocument();
    });
  });

  it("has view details buttons", async () => {
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>,
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
