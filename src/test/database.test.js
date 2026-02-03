import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock supabase client before importing database
vi.mock("../lib/supabaseClient", () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
  };

  return {
    default: {
      from: vi.fn(() => mockChain),
      auth: {
        getUser: vi.fn(() =>
          Promise.resolve({
            data: { user: { id: "test-user" } },
            error: null,
          }),
        ),
      },
    },
  };
});

describe("Database Module", () => {
  let database;

  beforeAll(async () => {
    database = await import("../lib/database");
  });

  it("has saveWorkout function", () => {
    expect(typeof database.saveWorkout).toBe("function");
  });

  it("has getWorkouts function", () => {
    expect(typeof database.getWorkouts).toBe("function");
  });

  it("has deleteWorkout function", () => {
    expect(typeof database.deleteWorkout).toBe("function");
  });

  it("has saveActiveWellbeingSession function", () => {
    expect(typeof database.saveActiveWellbeingSession).toBe("function");
  });

  it("has getActiveWellbeingSessions function", () => {
    expect(typeof database.getActiveWellbeingSessions).toBe("function");
  });

  it("has deleteActiveWellbeingSession function", () => {
    expect(typeof database.deleteActiveWellbeingSession).toBe("function");
  });

  it("has getUserSettings function", () => {
    expect(typeof database.getUserSettings).toBe("function");
  });

  it("has saveUserSettings function", () => {
    expect(typeof database.saveUserSettings).toBe("function");
  });

  it.skip("can call getWorkouts", async () => {
    const result = await database.getWorkouts();
    expect(Array.isArray(result)).toBe(true);
  });

  it.skip("can call getActiveWellbeingSessions", async () => {
    const result = await database.getActiveWellbeingSessions();
    expect(Array.isArray(result)).toBe(true);
  });
});
