import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import BarcodeScanner from "../components/BarcodeScanner";
import MealSuggestions from "../components/MealSuggestions";
import ProgressIndicator from "../components/ProgressIndicator";
import { getUserProfile } from "../services/userProfileService";
import {
  searchByBarcode,
  searchByName,
  calculateDailyTotals,
  getNutritionalSummary,
} from "../services/nutritionService";
import "../styles/accessibility.css";

function CalorieTracker() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [foodLogs, setFoodLogs] = useState([]);
  const [dailyTotals, setDailyTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState(""); // Track last searched term
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tableNotFound, setTableNotFound] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const loadFoodLogs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", selectedDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFoodLogs(data || []);
    } catch (error) {
      console.error("Error loading food logs:", error);
      // Check if table doesn't exist
      if (
        error.message.includes("relation") ||
        error.message.includes("does not exist") ||
        error.code === "42P01"
      ) {
        console.warn(
          "Food logs table not found. Please run the database migration.",
        );
        setTableNotFound(true);
      } else {
        alert("Failed to load food logs: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate]);

  // Load user profile for Slimming World settings
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    loadFoodLogs();
  }, [loadFoodLogs]);

  useEffect(() => {
    if (foodLogs.length > 0) {
      const totals = calculateDailyTotals(foodLogs);
      setDailyTotals(totals);
    } else {
      setDailyTotals({
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        slimmingWorldSyns: 0,
        items: 0,
      });
    }
  }, [foodLogs]);

  const handleBarcodeScanned = async (barcode) => {
    try {
      setShowScanner(false);
      setLoading(true);
      const product = await searchByBarcode(barcode);
      setSelectedProduct(product);
      setShowManual(true);
      // Clear search state when barcode scanned (different entry method)
      setShowSearch(false);
      setSearchQuery("");
      setLastSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Product not found. Please try manual entry or search by name.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // console.log("🔍 Search triggered with query:", searchQuery);
    if (!searchQuery.trim()) {
      // console.log("❌ Search query is empty");
      return;
    }

    try {
      setSearching(true);
      setSearchResults([]); // Clear previous results
      // console.log("📡 Calling searchByName API...");
      const results = await searchByName(searchQuery);
      // console.log("✅ Search results received:", results);
      setSearchResults(results.products || []);
      setLastSearchQuery(searchQuery); // Track what we just searched for
    } catch (error) {
      console.error("❌ Error searching products:", error);
      alert(
        `Search failed: ${error.message}. Please check your internet connection and try again.`,
      );
    } finally {
      setSearching(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    // Keep search panel open so user can clear search or select another item
    setShowManual(true);
  };

  const handleAddFoodLog = async (foodData) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("food_logs").insert([
        {
          user_id: user.id,
          date: selectedDate,
          product_name: foodData.productName,
          barcode: foodData.barcode || null,
          brand: foodData.brand || null,
          serving_size: foodData.servingSize || null,
          calories: foodData.calories || 0,
          protein: foodData.protein || 0,
          carbohydrates: foodData.carbohydrates || 0,
          fat: foodData.fat || 0,
          fiber: foodData.fiber || 0,
          sodium: foodData.sodium || 0,
          sugar: foodData.sugar || 0,
          slimming_world_syns: foodData.slimmingWorldSyns || 0,
          quantity: foodData.quantity || 1,
          meal_type: foodData.mealType || "snack",
          notes: foodData.notes || null,
          product_data: foodData.rawData || null,
        },
      ]);

      if (error) throw error;

      setShowManual(false);
      setSelectedProduct(null);
      loadFoodLogs();
    } catch (error) {
      console.error("Error adding food log:", error);
      alert("Failed to add food log: " + error.message);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!user || !confirm("Delete this food entry?")) return;

    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", logId)
        .eq("user_id", user.id);

      if (error) throw error;
      loadFoodLogs();
    } catch (error) {
      console.error("Error deleting food log:", error);
      alert("Failed to delete food log: " + error.message);
    }
  };

  const formatNumber = (num) => {
    return parseFloat(num || 0).toFixed(1);
  };

  // Get syns indicator (color and icon) based on value
  const getSynsIndicator = (synsValue) => {
    const syns = parseFloat(synsValue) || 0;
    if (syns < 4) {
      return {
        badge: "badge bg-success pattern-success",
        icon: "bi-check-circle-fill",
      };
    } else if (syns <= 9) {
      return {
        badge: "badge bg-warning text-dark pattern-warning",
        icon: "bi-question-circle-fill",
      };
    } else {
      return {
        badge: "badge bg-danger pattern-danger",
        icon: "bi-exclamation-triangle-fill",
      };
    }
  };

  // Always render something - never just show spinner indefinitely
  if (!user) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Please log in to access SW logs.
        </div>
      </div>
    );
  }

  if (loading && foodLogs.length === 0 && !tableNotFound) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading food logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ paddingBottom: "80px" }}>
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="heading-primary mb-0">
          <i
            className="bi bi-star-fill text-warning me-2"
            aria-hidden="true"
          ></i>
          <span>SW Logs</span>
        </h1>
      </header>

      {/* Database Setup Required Alert */}
      {tableNotFound && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          <h5 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Database Setup Required
          </h5>
          <p className="mb-2">
            The food logs table hasn't been created yet. Please run the database
            migration:
          </p>
          <ol className="mb-2">
            <li>Open your Supabase Dashboard</li>
            <li>Go to SQL Editor</li>
            <li>
              Run the script from:{" "}
              <code>supabase-config/food_logs_schema.sql</code>
            </li>
          </ol>
          <p className="mb-0 small">
            See <strong>docs/QUICK_START_CALORIE_TRACKER.md</strong> for
            detailed instructions. The syns tracker uses the same database
            table.
          </p>
          <button
            type="button"
            className="btn-close"
            onClick={() => setTableNotFound(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Daily Summary */}
      <main id="main-content" role="main">
        {dailyTotals && userProfile?.slimming_world_daily_syns && (
          <section className="card mb-3" aria-labelledby="summary-heading">
            <div className="card-body">
              <h2 id="summary-heading" className="heading-secondary">
                <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
                Today's Summary
              </h2>

              {/* Progress Indicator with Pattern */}
              <ProgressIndicator
                current={dailyTotals.slimmingWorldSyns}
                total={userProfile.slimming_world_daily_syns}
                label="Syns"
                showPercentage={true}
              />

              <div
                className="text-center mt-3 p-3 bg-light rounded"
                role="status"
                aria-live="polite"
              >
                <i className="bi bi-list-check me-2" aria-hidden="true"></i>
                <strong>{dailyTotals.items}</strong>
                <span className="visually-hidden">You have logged</span>{" "}
                {dailyTotals.items === 1 ? "item" : "items"} logged today
              </div>
            </div>
          </section>
        )}

        {/* No daily allowance set */}
        {dailyTotals && !userProfile?.slimming_world_daily_syns && (
          <div className="alert alert-info" role="alert">
            <h2 className="alert-heading heading-tertiary">
              <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
              Set Your Daily Syn Allowance
            </h2>
            <p className="mb-2">
              To see your progress and get personalized meal suggestions, please
              set your daily syn allowance in your profile.
            </p>
            <a href="/profile-manager" className="btn btn-primary">
              <i className="bi bi-gear me-2" aria-hidden="true"></i>
              Go to Profile Settings
            </a>
          </div>
        )}

        {/* Meal Suggestions */}
        {userProfile?.slimming_world_daily_syns && dailyTotals && (
          <MealSuggestions
            remainingSyns={
              userProfile.slimming_world_daily_syns -
              dailyTotals.slimmingWorldSyns
            }
            dailySyns={userProfile.slimming_world_daily_syns}
            foodLogs={foodLogs}
            userProfile={userProfile}
          />
        )}

        {/* Add Food Buttons */}
        {!showScanner && !showSearch && !showManual && (
          <section className="card mb-3" aria-labelledby="add-food-heading">
            <div className="card-body">
              <h2 id="add-food-heading" className="heading-secondary">
                <i className="bi bi-plus-circle me-2" aria-hidden="true"></i>
                Add Food
              </h2>
              <div
                className="d-grid gap-2"
                role="group"
                aria-label="Food entry options"
              >
                <button
                  className="btn btn-primary"
                  onClick={() => setShowScanner(true)}
                  aria-label="Scan barcode to add food"
                >
                  <i className="bi bi-upc-scan me-2" aria-hidden="true"></i>
                  Scan Barcode
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowSearch(true)}
                  aria-label="Search food database to add food"
                >
                  <i className="bi bi-search me-2" aria-hidden="true"></i>
                  Search Food Database
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowManual(true)}
                  aria-label="Manually enter food details"
                >
                  <i className="bi bi-pencil me-2" aria-hidden="true"></i>
                  Manual Entry
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Date Selector */}
        <section className="card mb-3" aria-labelledby="date-selector-heading">
          <div className="card-body">
            <label
              id="date-selector-heading"
              htmlFor="date-input"
              className="form-label fw-bold heading-tertiary"
            >
              <i className="bi bi-calendar3 me-2" aria-hidden="true"></i>
              Date
            </label>
            <input
              id="date-input"
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              aria-describedby="date-help"
            />
            <small id="date-help" className="form-text text-muted">
              Select a date to view or add food logs
            </small>
          </div>
        </section>
        {/* Scanner Modal */}
        {showScanner && (
          <div className="mb-3">
            <BarcodeScanner
              onScan={handleBarcodeScanned}
              onClose={() => setShowScanner(false)}
            />
          </div>
        )}

        {/* Search Interface */}
        {showSearch && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Search Food</h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchResults([]);
                    setSearchQuery("");
                    setLastSearchQuery("");
                    setSelectedProduct(null);
                    setShowManual(false);
                  }}
                  aria-label="Close search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSearch} className="mb-2">
                <div className="input-group" style={{ maxWidth: "400px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                  >
                    {searching ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </button>
                </div>
              </form>

              {searchQuery && (
                <div className="d-flex justify-content-between mb-3">
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setLastSearchQuery("");
                      setSearchResults([]);
                      setSelectedProduct(null);
                      setShowManual(false);
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear search
                  </button>
                  {selectedProduct && (
                    <button
                      className="btn btn-info btn-sm"
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setShowManual(false);
                      }}
                    >
                      <i className="bi bi-card-list me-1"></i>
                      Show results
                    </button>
                  )}
                </div>
              )}

              {/* Only show search results if no product is currently selected */}
              {!selectedProduct && (
                <>
                  {searchResults.length > 0 ? (
                    <div className="list-group">
                      {searchResults.map((product, index) => (
                        <button
                          key={index}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{product.productName}</h6>
                              {product.brand && (
                                <small className="text-muted d-block">
                                  {product.brand}
                                </small>
                              )}
                              <small className="text-muted">
                                {getNutritionalSummary(product)}
                              </small>
                            </div>
                            {product.imageThumbnail && (
                              <img
                                src={product.imageThumbnail}
                                alt={product.productName}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                                className="rounded"
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    !searching &&
                    lastSearchQuery &&
                    searchQuery === lastSearchQuery && (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        No results found for "{lastSearchQuery}". Try different
                        keywords or{" "}
                        <button
                          className="btn btn-link p-0"
                          onClick={() => {
                            setShowSearch(false);
                            setShowManual(true);
                          }}
                        >
                          use manual entry
                        </button>
                        .
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry / Product Details Modal */}
        {showManual && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">
                  {selectedProduct ? "Add to Log" : "Manual Entry"}
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setShowManual(false);
                    setSelectedProduct(null);
                  }}
                  aria-label="Close entry form"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <FoodEntryForm
                initialData={selectedProduct}
                onSubmit={handleAddFoodLog}
                onCancel={() => {
                  setShowManual(false);
                  setSelectedProduct(null);
                }}
                userProfile={userProfile}
              />
            </div>
          </div>
        )}

        {/* Food Log List */}
        <section className="card" aria-labelledby="food-log-heading">
          <div className="card-body">
            <h2 id="food-log-heading" className="heading-secondary">
              <i className="bi bi-list-ul me-2" aria-hidden="true"></i>
              Food Log
              <span className="visually-hidden">
                {foodLogs.length === 0
                  ? ". No items logged yet"
                  : `. ${foodLogs.length} ${foodLogs.length === 1 ? "item" : "items"} logged`}
              </span>
            </h2>

            {foodLogs.length === 0 ? (
              <div
                className="text-center text-muted py-4"
                role="status"
                aria-label="No food entries"
              >
                <i
                  className="bi bi-inbox fs-1 d-block mb-2"
                  aria-hidden="true"
                ></i>
                <p>No food logged for this date</p>
              </div>
            ) : (
              <ul
                className="list-group"
                role="list"
                aria-label="Food entries for selected date"
              >
                {foodLogs.map((log) => {
                  const synsValue = log.slimming_world_syns * log.quantity;
                  const synsIndicator = getSynsIndicator(synsValue);
                  const isFreeFood = log.slimming_world_syns === 0;

                  return (
                    <li
                      key={log.id}
                      className="list-group-item"
                      role="listitem"
                    >
                      <article className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h3 className="h6 mb-1">{log.product_name}</h3>
                          {log.brand && (
                            <small className="text-muted d-block">
                              {log.brand}
                            </small>
                          )}
                          <small className="text-muted">
                            <span className="visually-hidden">
                              Serving size:
                            </span>
                            {log.serving_size} × {log.quantity}
                            {!isFreeFood ? (
                              <>
                                {" = "}
                                <span className={synsIndicator.badge}>
                                  <i
                                    className={`bi ${synsIndicator.icon} me-1`}
                                    aria-hidden="true"
                                  ></i>
                                  <span
                                    aria-label={`${formatNumber(synsValue)} syns`}
                                  >
                                    {formatNumber(synsValue)} syns
                                  </span>
                                </span>
                              </>
                            ) : (
                              <span
                                className="badge bg-success ms-2"
                                aria-label="Free food, zero syns"
                              >
                                <i
                                  className="bi bi-check-circle-fill me-1"
                                  aria-hidden="true"
                                ></i>
                                Free Food
                              </span>
                            )}
                          </small>
                          {log.meal_type && (
                            <span
                              className="badge bg-secondary ms-2"
                              aria-label={`Meal type: ${log.meal_type}`}
                            >
                              {log.meal_type}
                            </span>
                          )}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteLog(log.id)}
                          aria-label={`Delete ${log.product_name} from log`}
                        >
                          <i className="bi bi-trash" aria-hidden="true"></i>
                          <span className="visually-hidden">Delete</span>
                        </button>
                      </article>
                      {log.notes && (
                        <div className="mt-2">
                          <small className="text-muted d-block">
                            <i
                              className="bi bi-chat-left-text me-1"
                              aria-hidden="true"
                            ></i>
                            <span className="visually-hidden">Notes: </span>
                            {log.notes}
                          </small>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Food Entry Form Component
function FoodEntryForm({ initialData, onSubmit, onCancel, userProfile }) {
  const [formData, setFormData] = useState({
    productName: initialData?.productName || "",
    brand: initialData?.brand || "",
    barcode: initialData?.barcode || "",
    servingSize: initialData?.servingSize || "",
    calories: initialData?.calories || "",
    protein: initialData?.protein || "",
    carbohydrates: initialData?.carbohydrates || "",
    fat: initialData?.fat || "",
    fiber: initialData?.fiber || "",
    sugar: initialData?.sugar || "",
    sodium: initialData?.sodium || "",
    slimmingWorldSyns: initialData?.slimmingWorldSyns || "",
    quantity: 1,
    mealType: "snack",
    notes: "",
    rawData: initialData?.rawData || null,
  });

  // Get syns indicator (color and icon) based on value
  const getSynsIndicator = (synsValue) => {
    const syns = parseFloat(synsValue) || 0;
    if (syns < 4) {
      return {
        badge: "badge bg-success pattern-success",
        icon: "bi-check-circle-fill",
        label: "Low Syns - Great choice!",
      };
    } else if (syns <= 9) {
      return {
        badge: "badge bg-warning text-dark pattern-warning",
        icon: "bi-question-circle-fill",
        label: "Moderate Syns",
      };
    } else {
      return {
        badge: "badge bg-danger pattern-danger",
        icon: "bi-exclamation-triangle-fill",
        label: "High Syns - Be mindful",
      };
    }
  };

  // Update form data when initialData changes (new product selected)
  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData?.productName || "",
        brand: initialData?.brand || "",
        barcode: initialData?.barcode || "",
        servingSize: initialData?.servingSize || "",
        calories: initialData?.calories || "",
        protein: initialData?.protein || "",
        carbohydrates: initialData?.carbohydrates || "",
        fat: initialData?.fat || "",
        fiber: initialData?.fiber || "",
        sugar: initialData?.sugar || "",
        sodium: initialData?.sodium || "",
        slimmingWorldSyns: initialData?.slimmingWorldSyns || "",
        quantity: 1,
        mealType: "snack",
        notes: "",
        rawData: initialData?.rawData || null,
      });
    }
  }, [initialData]);

  // Auto-calculate Syns when nutrition values change if user is on Slimming World
  useEffect(() => {
    if (userProfile?.on_slimming_world) {
      const calories = parseFloat(formData.calories) || 0;
      const fat = parseFloat(formData.fat) || 0;
      const sugar = parseFloat(formData.sugar) || 0;
      const protein = parseFloat(formData.protein) || 0;

      // Only auto-calculate if we have at least calories
      if (calories > 0) {
        const syns = Math.max(
          0,
          calories / 20 + fat / 4 + sugar / 5 - protein / 10,
        );
        setFormData((prev) => ({
          ...prev,
          slimmingWorldSyns: syns.toFixed(1),
        }));
      }
    }
  }, [
    formData.calories,
    formData.fat,
    formData.sugar,
    formData.protein,
    userProfile,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateSyns = () => {
    const calories = parseFloat(formData.calories) || 0;
    const fat = parseFloat(formData.fat) || 0;
    const sugar = parseFloat(formData.sugar) || 0;
    const protein = parseFloat(formData.protein) || 0;

    // Slimming World Syns formula (approximation)
    // Syns = (Calories ÷ 20) + (Fat ÷ 4) + (Sugar ÷ 5) - (Protein ÷ 10)
    const syns = Math.max(
      0,
      calories / 20 + fat / 4 + sugar / 5 - protein / 10,
    );

    setFormData((prev) => ({
      ...prev,
      slimmingWorldSyns: syns.toFixed(1),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      alert("Please enter a product name");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Product Name *</label>
        <input
          type="text"
          className="form-control"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Brand</label>
        <input
          type="text"
          className="form-control"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        />
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label">Serving Size</label>
          <input
            type="text"
            className="form-control"
            name="servingSize"
            value={formData.servingSize}
            onChange={handleChange}
            placeholder="e.g., 100g, 1 cup"
          />
        </div>
        <div className="col-6 mb-3">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            className="form-control"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0.1"
            step="0.1"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label">Calories (kcal)</label>
          <input
            type="number"
            className="form-control"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </div>
        <div className="col-6 mb-3">
          <label className="form-label">Protein (g)</label>
          <input
            type="number"
            className="form-control"
            name="protein"
            value={formData.protein}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label">Carbohydrates (g)</label>
          <input
            type="number"
            className="form-control"
            name="carbohydrates"
            value={formData.carbohydrates}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </div>
        <div className="col-6 mb-3">
          <label className="form-label">Fat (g)</label>
          <input
            type="number"
            className="form-control"
            name="fat"
            value={formData.fat}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label">Sugar (g)</label>
          <input
            type="number"
            className="form-control"
            name="sugar"
            value={formData.sugar}
            onChange={handleChange}
            min="0"
            step="0.1"
            placeholder="For Syns calculation"
          />
        </div>
        <div className="col-6 mb-3">
          <label className="form-label">Fiber (g)</label>
          <input
            type="number"
            className="form-control"
            name="fiber"
            value={formData.fiber}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-3">
          <label className="form-label">
            <i className="bi bi-star-fill text-warning me-1"></i>
            Slimming World Syns
          </label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              name="slimmingWorldSyns"
              value={formData.slimmingWorldSyns}
              onChange={handleChange}
              min="0"
              step="0.5"
              placeholder="Optional"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={calculateSyns}
              title="Auto-calculate Syns from nutrition data"
              disabled={userProfile?.on_slimming_world}
            >
              <i className="bi bi-calculator"></i>
            </button>
          </div>
          <div className="mt-2 mb-3">
            {formData.slimmingWorldSyns > 0 &&
              (() => {
                const indicator = getSynsIndicator(formData.slimmingWorldSyns);
                return (
                  <div className="mb-2">
                    <span className={indicator.badge}>
                      <i className={`bi ${indicator.icon} me-1`}></i>
                      {indicator.label}
                    </span>
                  </div>
                );
              })()}
            <small className="text-muted">
              {userProfile?.on_slimming_world
                ? "✓ Auto-calculating Syns from nutrition info"
                : "Click calculator to calculate Syns from nutrition info"}
            </small>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Meal Type</label>
        <select
          className="form-select"
          name="mealType"
          value={formData.mealType}
          onChange={handleChange}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Notes</label>
        <textarea
          className="form-control"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="2"
        ></textarea>
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add to Log
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

FoodEntryForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  userProfile: PropTypes.object,
};

export default CalorieTracker;
