import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchByBarcode,
  searchByName,
  getNutritionalSummary,
  calculateDailyTotals,
} from "../services/nutritionService";

// Mock fetch globally
global.fetch = vi.fn();

describe("nutritionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchByBarcode", () => {
    it("returns parsed product data for valid barcode", async () => {
      const mockProduct = {
        code: "123456",
        product_name: "Test Product",
        brands: "Test Brand",
        serving_quantity: 100,
        serving_quantity_unit: "g",
        nutriments: {
          "energy-kcal_100g": 250,
          proteins_100g: 10,
          carbohydrates_100g: 30,
          fat_100g: 5,
          fiber_100g: 2,
          sodium_100g: 0.5,
          sugars_100g: 15,
        },
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ status: 1, product: mockProduct }),
      });

      const result = await searchByBarcode("123456");

      expect(result.barcode).toBe("123456");
      expect(result.productName).toBe("Test Product");
      expect(result.brand).toBe("Test Brand");
      expect(result.calories).toBe("250.00");
    });

    it("throws error for product not found", async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ status: 0 }),
      });

      await expect(searchByBarcode("invalid")).rejects.toThrow(
        "Product not found",
      );
    });

    it("uses UK-specific endpoint", async () => {
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ status: 1, product: { code: "123" } }),
      });

      await searchByBarcode("123456");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("uk.openfoodfacts.org"),
      );
    });
  });

  describe("searchByName", () => {
    it("returns array of products for valid search", async () => {
      const mockData = {
        count: 2,
        page: 1,
        page_size: 20,
        products: [
          {
            code: "123",
            product_name: "Product 1",
            nutriments: { "energy-kcal_100g": 100 },
          },
          {
            code: "456",
            product_name: "Product 2",
            nutriments: { "energy-kcal_100g": 200 },
          },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await searchByName("milk");

      expect(result.products).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.products[0].productName).toBe("Product 1");
    });

    it("returns empty array when no products found", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ count: 0, products: [] }),
      });

      const result = await searchByName("nonexistent");

      expect(result.products).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("handles malformed API response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: "data" }),
      });

      const result = await searchByName("test");

      expect(result.products).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("uses UK-specific endpoint for searches", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ count: 0, products: [] }),
      });

      await searchByName("milk");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("uk.openfoodfacts.org"),
      );
    });

    it("skips products that fail to parse", async () => {
      const mockData = {
        count: 2,
        products: [
          { code: "123", product_name: "Valid Product", nutriments: {} },
          null, // Invalid product
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await searchByName("test");

      // Should only have 1 product (the valid one)
      expect(result.products.length).toBeLessThanOrEqual(1);
    });
  });

  describe("getNutritionalSummary", () => {
    it("formats nutritional information", () => {
      const foodItem = {
        calories: 250,
        protein: 10,
        carbohydrates: 30,
        fat: 5,
      };

      const summary = getNutritionalSummary(foodItem);

      expect(summary).toContain("250 kcal");
      expect(summary).toContain("10g protein");
      expect(summary).toContain("30g carbs");
      expect(summary).toContain("5g fat");
    });

    it("handles zero values", () => {
      const foodItem = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
      };

      const summary = getNutritionalSummary(foodItem);

      expect(summary).toBe("No nutritional data");
    });

    it("omits missing nutrients", () => {
      const foodItem = {
        calories: 100,
      };

      const summary = getNutritionalSummary(foodItem);

      expect(summary).toBe("100 kcal");
    });
  });

  describe("calculateDailyTotals", () => {
    it("sums up all food log entries", () => {
      const foodLogs = [
        {
          calories: 200,
          protein: 10,
          carbohydrates: 30,
          fat: 5,
          fiber: 2,
          slimming_world_syns: 3,
          quantity: 1,
        },
        {
          calories: 150,
          protein: 5,
          carbohydrates: 20,
          fat: 3,
          fiber: 1,
          slimming_world_syns: 2,
          quantity: 2,
        },
      ];

      const totals = calculateDailyTotals(foodLogs);

      expect(totals.calories).toBe(500); // 200 + (150 * 2)
      expect(totals.protein).toBe(20); // 10 + (5 * 2)
      expect(totals.slimmingWorldSyns).toBe(7); // 3 + (2 * 2)
      expect(totals.items).toBe(2);
    });

    it("handles empty food logs", () => {
      const totals = calculateDailyTotals([]);

      expect(totals.calories).toBe(0);
      expect(totals.protein).toBe(0);
      expect(totals.items).toBe(0);
    });

    it("handles missing values", () => {
      const foodLogs = [
        {
          quantity: 1,
        },
      ];

      const totals = calculateDailyTotals(foodLogs);

      expect(totals.calories).toBe(0);
      expect(totals.items).toBe(1);
    });

    it("multiplies by quantity correctly", () => {
      const foodLogs = [
        {
          calories: 100,
          slimming_world_syns: 5,
          quantity: 3,
        },
      ];

      const totals = calculateDailyTotals(foodLogs);

      expect(totals.calories).toBe(300);
      expect(totals.slimmingWorldSyns).toBe(15);
    });
  });
});
