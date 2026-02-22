import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CalorieTracker from "../pages/CalorieTracker";

// Mock AuthContext
vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    user: { id: "test-user-id", email: "test@example.com" },
  })),
}));

// Mock supabaseClient
vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

// Mock userProfileService
vi.mock("../services/userProfileService", () => ({
  getUserProfile: vi.fn(() =>
    Promise.resolve({
      on_slimming_world: true,
      slimming_world_daily_syns: 15,
    }),
  ),
}));

// Mock nutritionService
vi.mock("../services/nutritionService", () => ({
  searchByBarcode: vi.fn(() =>
    Promise.resolve({
      barcode: "123456",
      productName: "Test Product",
      brand: "Test Brand",
      calories: 250,
      protein: 10,
      carbohydrates: 30,
      fat: 5,
      slimmingWorldSyns: 5,
    }),
  ),
  searchByName: vi.fn(() =>
    Promise.resolve({
      count: 2,
      products: [
        {
          productName: "Milk",
          brand: "Test Brand",
          calories: 100,
          protein: 3,
        },
        {
          productName: "Bread",
          brand: "Test Brand",
          calories: 200,
          protein: 5,
        },
      ],
    }),
  ),
  calculateDailyTotals: vi.fn(() => ({
    calories: 500,
    protein: 25,
    carbohydrates: 60,
    fat: 15,
    fiber: 5,
    slimmingWorldSyns: 10,
    items: 3,
  })),
  getNutritionalSummary: vi.fn(() => "250 kcal • 10g protein"),
}));

describe("CalorieTracker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Calorie Tracker page", async () => {
    render(
      <BrowserRouter>
        <CalorieTracker />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Calorie Tracker")).toBeInTheDocument();
    });
  });

  it("displays date selector", async () => {
    render(
      <BrowserRouter>
        <CalorieTracker />
      </BrowserRouter>,
    );

    await waitFor(() => {
      const dateInput = screen.getByDisplayValue(
        new Date().toISOString().split("T")[0],
      );
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });
  });

  it("shows add food buttons", async () => {
    render(
      <BrowserRouter>
        <CalorieTracker />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Scan Barcode")).toBeInTheDocument();
      expect(screen.getByText("Search Food Database")).toBeInTheDocument();
      expect(screen.getByText("Manual Entry")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("opens search panel when clicking search button", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      const searchButton = await screen.findByText("Search Food Database");
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search for food..."),
        ).toBeInTheDocument();
      });
    });

    it("displays clear search button when search has text", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      const searchButton = await screen.findByText("Search Food Database");
      fireEvent.click(searchButton);

      const searchInput =
        await screen.findByPlaceholderText("Search for food...");
      fireEvent.change(searchInput, { target: { value: "milk" } });

      await waitFor(() => {
        expect(screen.getByText("Clear search")).toBeInTheDocument();
      });
    });
  });

  describe("UK Food Database", () => {
    it("has search functionality available", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      const searchButton = await screen.findByText("Search Food Database");
      fireEvent.click(searchButton);

      const searchInput =
        await screen.findByPlaceholderText("Search for food...");

      // Verify search input exists and accepts input
      fireEvent.change(searchInput, { target: { value: "bread" } });

      await waitFor(() => {
        expect(searchInput).toHaveValue("bread");
      });
    });
  });

  describe("Food Entry Form", () => {
    it("opens manual entry form", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      const manualButton = await screen.findByText("Manual Entry");
      fireEvent.click(manualButton);

      await waitFor(() => {
        expect(
          screen.getByText("✓ Auto-calculating Syns from nutrition info"),
        ).toBeInTheDocument();
      });
    });

    it("has required input fields", async () => {
      const { container } = render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      const manualButton = await screen.findByText("Manual Entry");
      fireEvent.click(manualButton);

      await waitFor(() => {
        expect(
          container.querySelector('select[name="mealType"]'),
        ).toBeInTheDocument();
        expect(
          container.querySelector('input[name="quantity"]'),
        ).toBeInTheDocument();
        expect(
          container.querySelector('input[name="slimmingWorldSyns"]'),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Daily Totals", () => {
    it("displays today's summary card", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Today's Summary")).toBeInTheDocument();
      });
    });

    it("shows calorie and nutrient totals", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Calories")).toBeInTheDocument();
        expect(screen.getByText("Protein")).toBeInTheDocument();
        expect(screen.getByText("Carbs")).toBeInTheDocument();
        expect(screen.getByText("Fat")).toBeInTheDocument();
      });
    });
  });

  describe("Food Log", () => {
    it("displays food log section", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Food Log")).toBeInTheDocument();
      });
    });

    it("shows empty state when no foods logged", async () => {
      render(
        <BrowserRouter>
          <CalorieTracker />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("No food logged for this date"),
        ).toBeInTheDocument();
      });
    });
  });
});
