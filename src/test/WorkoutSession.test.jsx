import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WorkoutSession from "../pages/WorkoutSession";

// Mock the database module
vi.mock("../lib/database", () => ({
  saveWorkout: vi.fn(() => Promise.resolve()),
  getUserSettings: vi.fn(() =>
    Promise.resolve({ shortRest: 30, defaultRest: 60, longRest: 90 }),
  ),
}));

describe("WorkoutSession Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders WorkoutSession page", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=1"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/CHOOSE NEXT EXERCISE/i)).toBeInTheDocument();
    });
  });

  it("displays exercise list", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=1"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Chest Press")).toBeInTheDocument();
      expect(screen.getByText("Lat Pulldown")).toBeInTheDocument();
    });
  });

  it("shows progress tracking", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=1"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/exercises completed/i)).toBeInTheDocument();
    });
  });

  it("loads day 2 workout", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=2"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Leg Press")).toBeInTheDocument();
    });
  });

  it("shows exercise details", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=1"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const repsText = screen.getAllByText(/3 sets/i);
      expect(repsText.length).toBeGreaterThan(0);
    });
  });

  it("has exercise selection buttons", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=1"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("shows exercise type indicators", async () => {
    render(
      <MemoryRouter initialEntries={["/?day=1"]}>
        <WorkoutSession />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const machineText = screen.getAllByText(/Machine/i);
      expect(machineText.length).toBeGreaterThan(0);
    });
  });
});
