import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import BarcodeScanner from "../components/BarcodeScanner";
import {
  searchByBarcode,
  searchByName,
  calculateDailyTotals,
  getNutritionalSummary,
} from "../services/nutritionService";

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

  useEffect(() => {
    loadFoodLogs();
  }, [loadFoodLogs]);

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
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Product not found. Please try manual entry or search by name.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearchResults([]); // Clear previous results
      const results = await searchByName(searchQuery);
      setSearchResults(results.products || []);
      setLastSearchQuery(searchQuery); // Track what we just searched for
    } catch (error) {
      console.error("Error searching products:", error);
      alert(
        `Search failed: ${error.message}. Please check your internet connection and try again.`,
      );
    } finally {
      setSearching(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowSearch(false);
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

  // Always render something - never just show spinner indefinitely
  if (!user) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Please log in to access the calorie tracker.
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Calorie Tracker
        </h2>
      </div>

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
            detailed instructions.
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
      {dailyTotals && (
        <div className="card mb-3 bg-primary text-white">
          <div className="card-body">
            <h5 className="card-title mb-3">Today's Summary</h5>
            <div className="row text-center">
              <div className="col-6 col-md-3 mb-2">
                <div className="fs-3 fw-bold">
                  {Math.round(dailyTotals.calories)}
                </div>
                <small>Calories</small>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="fs-3 fw-bold">
                  {formatNumber(dailyTotals.protein)}g
                </div>
                <small>Protein</small>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="fs-3 fw-bold">
                  {formatNumber(dailyTotals.carbohydrates)}g
                </div>
                <small>Carbs</small>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="fs-3 fw-bold">
                  {formatNumber(dailyTotals.fat)}g
                </div>
                <small>Fat</small>
              </div>
            </div>
            {dailyTotals.slimmingWorldSyns > 0 && (
              <div className="row text-center mt-3 pt-3 border-top border-white">
                <div className="col-12">
                  <div className="fs-4 fw-bold">
                    <i className="bi bi-star-fill me-2"></i>
                    {formatNumber(dailyTotals.slimmingWorldSyns)} Syns
                  </div>
                  <small>Slimming World</small>
                </div>
              </div>
            )}
            <div className="text-center mt-2">
              <small>{dailyTotals.items} items logged today</small>
            </div>
          </div>
        </div>
      )}

      {/* Add Food Buttons */}
      {!showScanner && !showSearch && !showManual && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title mb-3">Add Food</h5>
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowScanner(true)}
              >
                <i className="bi bi-upc-scan me-2"></i>
                Scan Barcode
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowSearch(true)}
              >
                <i className="bi bi-search me-2"></i>
                Search Food Database
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowManual(true)}
              >
                <i className="bi bi-pencil me-2"></i>
                Manual Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="card mb-3">
        <div className="card-body">
          <label className="form-label fw-bold">Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

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
                }}
                aria-label="Close search"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSearch} className="mb-3">
              <div className="input-group">
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

            {searchResults.length > 0 ? (
              <div className="list-group">
                {searchResults.map((product, index) => (
                  <button
                    key={index}
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
            />
          </div>
        </div>
      )}

      {/* Food Log List */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">Food Log</h5>

          {foodLogs.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>No food logged for this date</p>
            </div>
          ) : (
            <div className="list-group">
              {foodLogs.map((log) => (
                <div key={log.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{log.product_name}</h6>
                      {log.brand && (
                        <small className="text-muted d-block">
                          {log.brand}
                        </small>
                      )}
                      <small className="text-muted">
                        {log.serving_size} × {log.quantity} ={" "}
                        {Math.round(log.calories * log.quantity)} cal
                        {log.slimming_world_syns > 0 && (
                          <>
                            {" • "}
                            <i className="bi bi-star-fill text-warning"></i>{" "}
                            {formatNumber(
                              log.slimming_world_syns * log.quantity,
                            )}{" "}
                            syns
                          </>
                        )}
                      </small>
                      {log.meal_type && (
                        <span className="badge bg-secondary ms-2">
                          {log.meal_type}
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteLog(log.id)}
                      aria-label="Delete food entry"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  {log.notes && (
                    <small className="text-muted d-block mt-2">
                      <i className="bi bi-chat-left-text me-1"></i>
                      {log.notes}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Food Entry Form Component
function FoodEntryForm({ initialData, onSubmit, onCancel }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        <div className="col-md-6 mb-3">
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
        <div className="col-md-6 mb-3">
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
        <div className="col-md-6 mb-3">
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
        <div className="col-md-6 mb-3">
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
        <div className="col-md-6 mb-3">
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
        <div className="col-md-6 mb-3">
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
        <div className="col-md-6 mb-3">
          <label className="form-label">
            <i className="bi bi-star-fill text-warning me-1"></i>
            Slimming World Syns
          </label>
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
          <small className="text-muted">For Slimming World tracking</small>
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
};

export default CalorieTracker;
