import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Toast from "../components/Toast";

describe("Toast Component", () => {
  it("renders with success message", () => {
    const onClose = () => {};
    render(
      <Toast message="Test success message" type="success" onClose={onClose} />,
    );

    expect(screen.getByText("Test success message")).toBeInTheDocument();
  });

  it("renders with error message", () => {
    const onClose = () => {};
    render(
      <Toast message="Test error message" type="error" onClose={onClose} />,
    );

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders with warning message", () => {
    const onClose = () => {};
    render(
      <Toast message="Test warning message" type="warning" onClose={onClose} />,
    );

    expect(screen.getByText("Test warning message")).toBeInTheDocument();
  });

  it("has correct background color for success", () => {
    const onClose = () => {};
    const { container } = render(
      <Toast message="Success" type="success" onClose={onClose} />,
    );

    const toast = container.querySelector(".toast");
    expect(toast).toHaveClass("bg-success");
  });

  it("has correct background color for error", () => {
    const onClose = () => {};
    const { container } = render(
      <Toast message="Error" type="error" onClose={onClose} />,
    );

    const toast = container.querySelector(".toast");
    expect(toast).toHaveClass("bg-danger");
  });
});
