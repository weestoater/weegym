import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Programme from "../pages/Programme";

describe("Programme Component", () => {
  it("renders Programme page", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    expect(screen.getByText("Programme Details")).toBeInTheDocument();
  });

  it("displays workout days", () => {
    render(
      <BrowserRouter>
        <Programme />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Day 1 - Upper Body/i)).toBeInTheDocument();
    expect(screen.getByText(/Day 2 - Lower Body/i)).toBeInTheDocument();
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
});
