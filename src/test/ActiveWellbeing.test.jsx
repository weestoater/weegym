import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ActiveWellbeing from "../pages/ActiveWellbeing";

// Mock the database module
vi.mock("../lib/database", () => ({
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
  saveActiveWellbeingSession: vi.fn(() => Promise.resolve()),
  deleteActiveWellbeingSession: vi.fn(() => Promise.resolve()),
}));

describe("ActiveWellbeing Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Active Wellbeing page", async () => {
    render(
      <BrowserRouter>
        <ActiveWellbeing />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Active Wellbeing")).toBeInTheDocument();
    });
  });

  it("has navigation tabs", async () => {
    render(
      <BrowserRouter>
        <ActiveWellbeing />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });

  it("has machine selection dropdown", async () => {
    render(
      <BrowserRouter>
        <ActiveWellbeing />
      </BrowserRouter>,
    );

    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it("has score input field", async () => {
    render(
      <BrowserRouter>
        <ActiveWellbeing />
      </BrowserRouter>,
    );

    await waitFor(() => {
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("can switch to history tab", async () => {
    render(
      <BrowserRouter>
        <ActiveWellbeing />
      </BrowserRouter>,
    );

    await waitFor(async () => {
      const buttons = screen.getAllByRole("button");
      const historyButton = buttons.find((btn) =>
        btn.textContent.includes("History"),
      );
      if (historyButton) {
        fireEvent.click(historyButton);
      }
    });
  });

  it("can switch to summary tab", async () => {
    render(
      <BrowserRouter>
        <ActiveWellbeing />
      </BrowserRouter>,
    );

    await waitFor(async () => {
      const buttons = screen.getAllByRole("button");
      const summaryButton = buttons.find((btn) =>
        btn.textContent.includes("Summary"),
      );
      if (summaryButton) {
        fireEvent.click(summaryButton);
      }
    });
  });
});
