/**
 * Nutrition Service - Open Food Facts API Integration
 *
 * This service provides methods to interact with the Open Food Facts API
 * for retrieving nutritional information about food products.
 *
 * API Documentation: https://wiki.openfoodfacts.org/API
 */

const OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v0";

/**
 * Search for a product by barcode
 * @param {string} barcode - Product barcode (UPC, EAN, etc.)
 * @returns {Promise<Object>} Product information including nutritional data
 */
export async function searchByBarcode(barcode) {
  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_API}/product/${barcode}.json`,
    );
    const data = await response.json();

    if (data.status === 0) {
      throw new Error("Product not found");
    }

    return parseProductData(data.product);
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    throw error;
  }
}

/**
 * Search for products by name
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Results per page (default: 20)
 * @returns {Promise<Object>} Search results with products array
 */
export async function searchByName(query, page = 1, pageSize = 20) {
  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_API}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&json=true`,
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Handle case where no products are found or data structure is unexpected
    if (!data || !Array.isArray(data.products)) {
      return {
        count: 0,
        page: page,
        pageSize: pageSize,
        products: [],
      };
    }

    return {
      count: data.count || 0,
      page: data.page || page,
      pageSize: data.page_size || pageSize,
      products: data.products.map(parseProductData),
    };
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

/**
 * Parse product data from Open Food Facts format to our app format
 * @param {Object} product - Raw product data from API
 * @returns {Object} Parsed product data
 */
function parseProductData(product) {
  // Get nutriments (per 100g by default)
  const nutriments = product.nutriments || {};

  // Calculate serving size nutrients if serving size is available
  const servingSize = product.serving_quantity || 100;
  const servingUnit = product.serving_quantity_unit || "g";
  const servingSizeText = `${servingSize}${servingUnit}`;

  // Nutrient values per 100g
  const per100g = {
    calories: nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0,
    protein: nutriments.proteins_100g || nutriments.proteins || 0,
    carbohydrates:
      nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
    fat: nutriments.fat_100g || nutriments.fat || 0,
    fiber: nutriments.fiber_100g || nutriments.fiber || 0,
    sodium: nutriments.sodium_100g || nutriments.sodium || 0,
    sugar: nutriments.sugars_100g || nutriments.sugars || 0,
  };

  // Calculate per serving (if serving size is provided)
  const multiplier = servingSize / 100;
  const perServing = {
    calories: (per100g.calories * multiplier).toFixed(2),
    protein: (per100g.protein * multiplier).toFixed(2),
    carbohydrates: (per100g.carbohydrates * multiplier).toFixed(2),
    fat: (per100g.fat * multiplier).toFixed(2),
    fiber: (per100g.fiber * multiplier).toFixed(2),
    sodium: (per100g.sodium * multiplier).toFixed(2),
    sugar: (per100g.sugar * multiplier).toFixed(2),
  };

  return {
    barcode: product.code || product._id,
    productName: product.product_name || "Unknown Product",
    brand: product.brands || "",
    servingSize: servingSizeText,
    imageUrl: product.image_url || product.image_front_url,
    imageThumbnail: product.image_thumb_url || product.image_small_url,
    categories: product.categories || "",
    ingredients: product.ingredients_text || "",

    // Nutritional values per serving
    ...perServing,

    // Additional data
    nutriScore: product.nutriscore_grade,
    novaGroup: product.nova_group,
    ecoscore: product.ecoscore_grade,

    // Store full data for reference
    rawData: product,
  };
}

/**
 * Get nutritional summary for a food item
 * @param {Object} foodItem - Food item data
 * @returns {string} Human-readable summary
 */
export function getNutritionalSummary(foodItem) {
  const parts = [];

  if (foodItem.calories > 0) {
    parts.push(`${foodItem.calories} kcal`);
  }
  if (foodItem.protein > 0) {
    parts.push(`${foodItem.protein}g protein`);
  }
  if (foodItem.carbohydrates > 0) {
    parts.push(`${foodItem.carbohydrates}g carbs`);
  }
  if (foodItem.fat > 0) {
    parts.push(`${foodItem.fat}g fat`);
  }

  return parts.join(" • ") || "No nutritional data";
}

/**
 * Calculate daily totals from food logs
 * @param {Array} foodLogs - Array of food log entries
 * @returns {Object} Daily nutritional totals
 */
export function calculateDailyTotals(foodLogs) {
  return foodLogs.reduce(
    (totals, log) => {
      const quantity = parseFloat(log.quantity) || 1;

      return {
        calories: totals.calories + (parseFloat(log.calories) || 0) * quantity,
        protein: totals.protein + (parseFloat(log.protein) || 0) * quantity,
        carbohydrates:
          totals.carbohydrates +
          (parseFloat(log.carbohydrates) || 0) * quantity,
        fat: totals.fat + (parseFloat(log.fat) || 0) * quantity,
        fiber: totals.fiber + (parseFloat(log.fiber) || 0) * quantity,
        slimmingWorldSyns:
          totals.slimmingWorldSyns +
          (parseFloat(log.slimming_world_syns) || 0) * quantity,
        items: totals.items + 1,
      };
    },
    {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      slimmingWorldSyns: 0,
      items: 0,
    },
  );
}
