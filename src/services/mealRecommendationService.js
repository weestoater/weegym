/**
 * Meal Recommendation Service
 *
 * Provides intelligent meal suggestions based on:
 * - Remaining daily syn allowance
 * - Time of day
 * - Previously logged meals
 * - Slimming World principles
 */

// Free Food Database - Foods with 0 or minimal syns
const FREE_FOODS = {
  breakfast: [
    {
      name: "Porridge with berries",
      syns: 0,
      speedFood: true,
      description: "Oats with fresh berries",
    },
    {
      name: "Scrambled eggs",
      syns: 0,
      speedFood: false,
      description: "Free range eggs",
    },
    {
      name: "Fruit salad",
      syns: 0,
      speedFood: true,
      description: "Mixed fresh fruits",
    },
    {
      name: "Fat-free yogurt with fruit",
      syns: 0,
      speedFood: true,
      description: "Natural yogurt with berries",
    },
    {
      name: "Mushroom omelette",
      syns: 0,
      speedFood: true,
      description: "Eggs with mushrooms and peppers",
    },
  ],
  lunch: [
    {
      name: "Chicken salad",
      syns: 0,
      speedFood: true,
      description: "Grilled chicken with mixed leaves",
    },
    {
      name: "Vegetable soup",
      syns: 0,
      speedFood: true,
      description: "Homemade vegetable soup",
    },
    {
      name: "Jacket potato with beans",
      syns: 0,
      speedFood: false,
      description: "Baked potato with baked beans",
    },
    {
      name: "Grilled fish with vegetables",
      syns: 0,
      speedFood: true,
      description: "White fish with steamed veg",
    },
    {
      name: "Pasta with tomato sauce",
      syns: 0,
      speedFood: true,
      description: "Wholemeal pasta with passata",
    },
  ],
  dinner: [
    {
      name: "Stir-fry vegetables with chicken",
      syns: 0,
      speedFood: true,
      description: "Mixed veg stir-fry",
    },
    {
      name: "Spaghetti Bolognese",
      syns: 0,
      speedFood: true,
      description: "Lean mince with pasta",
    },
    {
      name: "Roast chicken with vegetables",
      syns: 0,
      speedFood: true,
      description: "Skinless chicken with roasted veg",
    },
    {
      name: "Chilli con carne",
      syns: 0,
      speedFood: true,
      description: "Lean beef with kidney beans",
    },
    {
      name: "Curry with rice",
      syns: 0,
      speedFood: true,
      description: "Homemade curry with basmati rice",
    },
  ],
  snacks: [
    {
      name: "Fresh fruit",
      syns: 0,
      speedFood: true,
      description: "Apple, orange, or berries",
    },
    {
      name: "Carrot sticks",
      syns: 0,
      speedFood: true,
      description: "Raw carrot sticks",
    },
    {
      name: "Cherry tomatoes",
      syns: 0,
      speedFood: true,
      description: "Fresh cherry tomatoes",
    },
    {
      name: "Sugar-free jelly",
      syns: 0,
      speedFood: false,
      description: "Made with sugar-free jelly",
    },
    {
      name: "Fat-free yogurt",
      syns: 0,
      speedFood: false,
      description: "Natural fat-free yogurt",
    },
  ],
};

// Low-syn meal options (1-5 syns)
const LOW_SYN_MEALS = {
  breakfast: [
    {
      name: "Weetabix with milk",
      syns: 3.5,
      description: "2 Weetabix with semi-skimmed milk",
    },
    {
      name: "Toast with reduced sugar jam",
      syns: 4,
      description: "2 slices wholemeal toast",
    },
    {
      name: "Breakfast wrap",
      syns: 5,
      description: "Wholemeal wrap with eggs and ham",
    },
  ],
  lunch: [
    {
      name: "Sandwich with salad",
      syns: 5,
      description: "2 slices bread with protein and salad",
    },
    {
      name: "Baked potato with cheese",
      syns: 6,
      description: "Jacket potato with 30g reduced-fat cheese",
    },
    {
      name: "Soup with roll",
      syns: 5,
      description: "Vegetable soup with small wholemeal roll",
    },
  ],
  dinner: [
    {
      name: "Pizza (homemade)",
      syns: 6,
      description: "Thin base with reduced-fat cheese",
    },
    {
      name: "Fish and chips (SW style)",
      syns: 7,
      description: "Baked fish with oven chips",
    },
    {
      name: "Burger with salad",
      syns: 6,
      description: "Lean beef burger with salad",
    },
  ],
  snacks: [
    { name: "Alpen Light bar", syns: 3, description: "Cereal bar" },
    { name: "Popcorn (small bag)", syns: 4.5, description: "Light popcorn" },
    {
      name: "Chocolate (small)",
      syns: 5,
      description: "Small chocolate treat",
    },
  ],
};

/**
 * Get current time period
 * @returns {string} - breakfast, lunch, dinner, or snacks
 */
export function getCurrentMealTime() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snacks";
  if (hour >= 17 && hour < 22) return "dinner";
  return "snacks";
}

/**
 * Get meal type from logged meals
 * @param {Array} foodLogs - Array of food log entries
 * @returns {Object} - Counts of each meal type
 */
export function getMealTypeBreakdown(foodLogs) {
  const breakdown = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };

  foodLogs.forEach((log) => {
    if (log.meal_type && breakdown[log.meal_type] !== undefined) {
      breakdown[log.meal_type]++;
    }
  });

  return breakdown;
}

/**
 * Generate meal recommendations
 * @param {Object} options - Configuration options
 * @param {number} options.remainingSyns - Remaining daily syn allowance
 * @param {number} options.dailySyns - Total daily syn allowance
 * @param {Array} options.foodLogs - Today's food logs
 * @returns {Object} - Meal recommendations
 */
export function getMealRecommendations({
  remainingSyns,
  dailySyns,
  foodLogs = [],
}) {
  const currentMealTime = getCurrentMealTime();
  const mealBreakdown = getMealTypeBreakdown(foodLogs);
  const percentageUsed =
    dailySyns > 0 ? ((dailySyns - remainingSyns) / dailySyns) * 100 : 0;

  // Determine recommendation strategy
  let strategy = "normal";
  if (remainingSyns <= 5) {
    strategy = "low";
  } else if (percentageUsed >= 80) {
    strategy = "caution";
  } else if (remainingSyns >= dailySyns * 0.7) {
    strategy = "plenty";
  }

  const recommendations = {
    strategy,
    currentMealTime,
    remainingSyns,
    percentageUsed: Math.round(percentageUsed),
    primaryMessage: "",
    suggestions: [],
    spDayOption: false,
  };

  // Generate primary message
  switch (strategy) {
    case "low":
      recommendations.primaryMessage =
        "You're running low on syns! Here are some Free Food options:";
      recommendations.suggestions =
        FREE_FOODS[currentMealTime] || FREE_FOODS.snacks;
      recommendations.spDayOption = true;
      break;

    case "caution":
      recommendations.primaryMessage =
        "You've used most of your syns. Consider these options:";
      recommendations.suggestions = [
        ...FREE_FOODS[currentMealTime].slice(0, 3),
        ...LOW_SYN_MEALS[currentMealTime]
          .filter((m) => m.syns <= remainingSyns)
          .slice(0, 2),
      ];
      recommendations.spDayOption = true;
      break;

    case "plenty":
      recommendations.primaryMessage =
        "You have plenty of syns left! Here are some suggestions:";
      recommendations.suggestions = [
        ...LOW_SYN_MEALS[currentMealTime].slice(0, 2),
        ...FREE_FOODS[currentMealTime].slice(0, 2),
      ];
      break;

    default:
      recommendations.primaryMessage =
        "Here are some meal suggestions for you:";
      recommendations.suggestions = [
        ...FREE_FOODS[currentMealTime].slice(0, 2),
        ...LOW_SYN_MEALS[currentMealTime].slice(0, 3),
      ];
  }

  // Check for missing meal types
  const missingMeals = [];
  if (mealBreakdown.breakfast === 0 && currentMealTime !== "breakfast") {
    missingMeals.push("breakfast");
  }
  if (
    mealBreakdown.lunch === 0 &&
    ["dinner", "snacks"].includes(currentMealTime)
  ) {
    missingMeals.push("lunch");
  }

  recommendations.missingMeals = missingMeals;

  return recommendations;
}

/**
 * Get SP (Speed Foods) Day guidance
 * @returns {Object} - SP day information
 */
export function getSPDayGuidance() {
  return {
    title: "Consider an SP Day",
    description:
      "Fill at least half your plate with Speed Foods (fruits and vegetables) at every meal.",
    benefits: [
      "Boost your weight loss",
      "No need to count syns as strictly",
      "Naturally filling and nutritious",
    ],
    examples: [
      "Breakfast: Fruit salad with fat-free yogurt",
      "Lunch: Large mixed salad with grilled chicken",
      "Dinner: Stir-fry with lots of vegetables",
      "Snacks: Fresh fruit, carrot sticks, cherry tomatoes",
    ],
  };
}

/**
 * Get free food suggestions by category
 * @param {string} category - breakfast, lunch, dinner, or snacks
 * @returns {Array} - List of free food suggestions
 */
export function getFreeFoodsByCategory(category = "snacks") {
  return FREE_FOODS[category] || FREE_FOODS.snacks;
}
