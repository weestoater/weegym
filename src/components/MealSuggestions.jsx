import { useState } from "react";
import PropTypes from "prop-types";
import {
  getMealRecommendations,
  getSPDayGuidance,
  getFreeFoodsByCategory,
} from "../services/mealRecommendationService";
import "../styles/accessibility.css";

/**
 * MealSuggestions Component
 *
 * Displays intelligent meal recommendations based on remaining syns,
 * time of day, and eating patterns. Fully accessible with ARIA labels.
 */
function MealSuggestions({ remainingSyns, dailySyns, foodLogs, userProfile }) {
  const [showSPDay, setShowSPDay] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Don't show if user doesn't have profile set up
  if (!userProfile?.slimming_world_daily_syns) {
    return null;
  }

  const recommendations = getMealRecommendations({
    remainingSyns,
    dailySyns: userProfile.slimming_world_daily_syns,
    foodLogs,
  });

  const spDayInfo = getSPDayGuidance();

  // Determine alert level for styling
  const getAlertClass = () => {
    if (recommendations.strategy === "low")
      return "alert-warning pattern-warning";
    if (recommendations.strategy === "caution")
      return "alert-info pattern-info";
    return "alert-success pattern-success";
  };

  const getIconClass = () => {
    if (recommendations.strategy === "low")
      return "bi-exclamation-triangle-fill";
    if (recommendations.strategy === "caution") return "bi-info-circle-fill";
    return "bi-lightbulb-fill";
  };

  return (
    <div className="card mb-3" role="region" aria-label="Meal suggestions">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-lightbulb me-2"></i>
          Meal Suggestions
        </h5>
        {recommendations.spDayOption && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowSPDay(!showSPDay)}
            aria-expanded={showSPDay}
            aria-controls="sp-day-guidance"
          >
            <i className="bi bi-star me-1"></i>
            {showSPDay ? "Hide" : "SP Day Info"}
          </button>
        )}
      </div>
      <div className="card-body">
        {/* Primary Message */}
        <div
          className={`alert ${getAlertClass()}`}
          role="alert"
          aria-live="polite"
        >
          <i className={`bi ${getIconClass()} me-2`}></i>
          <strong>{recommendations.primaryMessage}</strong>
          {recommendations.strategy === "low" && (
            <div className="mt-2">
              <small>
                You have <strong>{remainingSyns}</strong> syns remaining (
                {recommendations.percentageUsed}% used today)
              </small>
            </div>
          )}
        </div>

        {/* Missing Meals Alert */}
        {recommendations.missingMeals?.length > 0 && (
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            You haven't logged{" "}
            {recommendations.missingMeals.map((meal, idx) => (
              <span key={meal}>
                {idx > 0 && " or "}
                <strong>{meal}</strong>
              </span>
            ))}{" "}
            yet today.
          </div>
        )}

        {/* SP Day Guidance */}
        {showSPDay && (
          <div
            id="sp-day-guidance"
            className="alert alert-primary mb-3"
            role="region"
            aria-labelledby="sp-day-title"
          >
            <h6 id="sp-day-title" className="alert-heading">
              <i className="bi bi-star-fill me-2"></i>
              {spDayInfo.title}
            </h6>
            <p>{spDayInfo.description}</p>
            <hr />
            <h6>Benefits:</h6>
            <ul className="mb-2" role="list">
              {spDayInfo.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
            <h6>Example Meals:</h6>
            <ul className="mb-0" role="list">
              {spDayInfo.examples.map((example, idx) => (
                <li key={idx}>{example}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meal Suggestions */}
        <div className="row g-2" role="list" aria-label="Meal suggestions list">
          {recommendations.suggestions.map((suggestion, idx) => (
            <div key={idx} className="col-12 col-md-6" role="listitem">
              <div
                className={`card h-100 ${suggestion.speedFood ? "border-success" : ""}`}
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                aria-label={`${suggestion.name}, ${suggestion.syns} syns. ${suggestion.speedFood ? "Speed food. " : ""}${suggestion.description}`}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    // Could add to quick-add functionality here
                  }
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="mb-0" style={{ fontSize: "0.9rem" }}>
                      {suggestion.name}
                    </h6>
                    <span
                      className={`badge ${suggestion.syns === 0 ? "bg-success pattern-success" : "bg-primary"}`}
                      aria-label={`${suggestion.syns} syns`}
                    >
                      {suggestion.syns === 0
                        ? "Free"
                        : `${suggestion.syns} syns`}
                    </span>
                  </div>
                  <small className="text-muted d-block">
                    {suggestion.description}
                  </small>
                  {suggestion.speedFood && (
                    <small className="text-success d-block mt-1">
                      <i
                        className="bi bi-star-fill me-1"
                        aria-hidden="true"
                      ></i>
                      <span className="visually-hidden">Speed food</span>
                      Speed Food
                    </small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Browse by Category */}
        <div className="mt-3">
          <h6>Browse Free Foods by Meal:</h6>
          <div
            className="btn-group w-100"
            role="group"
            aria-label="Meal category selection"
          >
            {["breakfast", "lunch", "dinner", "snacks"].map((category) => (
              <button
                key={category}
                type="button"
                className={`btn btn-sm ${selectedCategory === category ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category,
                  )
                }
                aria-pressed={selectedCategory === category}
                aria-label={`Show ${category} options`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Foods */}
          {selectedCategory && (
            <div
              className="mt-3"
              role="region"
              aria-label={`${selectedCategory} free food options`}
            >
              <div className="list-group">
                {getFreeFoodsByCategory(selectedCategory).map((food, idx) => (
                  <div
                    key={idx}
                    className="list-group-item list-group-item-action"
                    tabIndex={0}
                    role="button"
                    aria-label={`${food.name}. ${food.speedFood ? "Speed food. " : ""}${food.description}`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{food.name}</strong>
                        {food.speedFood && (
                          <i
                            className="bi bi-star-fill text-success ms-2"
                            aria-label="Speed food"
                            title="Speed Food"
                          ></i>
                        )}
                        <br />
                        <small className="text-muted">{food.description}</small>
                      </div>
                      <span
                        className="badge bg-success pattern-success"
                        aria-label="Free food, 0 syns"
                      >
                        Free
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Helpful Tip */}
        <div className="alert alert-light mt-3 mb-0" role="note">
          <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
          <small>
            <strong>Tip:</strong> Free Foods can be eaten without counting syns.
            Speed Foods (marked with{" "}
            <i
              className="bi bi-star-fill text-success"
              aria-label="star icon"
            ></i>
            ) are especially good for weight loss.
          </small>
        </div>
      </div>
    </div>
  );
}

MealSuggestions.propTypes = {
  remainingSyns: PropTypes.number.isRequired,
  dailySyns: PropTypes.number.isRequired,
  foodLogs: PropTypes.array,
  userProfile: PropTypes.object,
};

MealSuggestions.defaultProps = {
  foodLogs: [],
  userProfile: null,
};

export default MealSuggestions;
