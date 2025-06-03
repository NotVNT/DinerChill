import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import FilterBox from "../components/FilterBox";
import { useApp } from "../context/AppContext";
import { restaurantsAPI, amenitiesAPI } from "../services/api";
import "../styles/FilterResultsPage.css";

function FilterResultsPage() {
  const location = useLocation();
  const { filters } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amenityName, setAmenityName] = useState(""); // Store the amenity name for display

  // Parse filter parameters from URL if present
  const query = new URLSearchParams(location.search);
  const locationParam = query.get("location") || filters.location || "";
  const amenityIdParam = query.get("amenityId") || filters.amenities || "";
  const priceParam = query.get("price") || filters.price || "all";
  const ratingParam = query.get("rating") || filters.rating || "all";
  const operatingHoursParam =
    query.get("operatingHours") || filters.operatingHours || "all";
  const cuisineParam = query.get("cuisine") || filters.cuisine || "all";

  // Fetch amenity name if amenityId is provided
  useEffect(() => {
    const fetchAmenityName = async () => {
      if (amenityIdParam) {
        try {
          const amenities = await amenitiesAPI.getAll();
          const amenity = amenities.find(
            (a) => a.id.toString() === amenityIdParam.toString()
          );
          if (amenity) {
            setAmenityName(amenity.name);
          }
        } catch (error) {
          console.error("Error fetching amenity name:", error);
        }
      }
    };

    fetchAmenityName();
  }, [amenityIdParam]);

  // Fetch filtered results from database
  useEffect(() => {
    const fetchFilteredResults = async () => {
      try {
        setLoading(true);

        let filteredResults = [];

        // If amenity filter is applied, use the dedicated API endpoint
        if (amenityIdParam) {
          filteredResults = await restaurantsAPI.getAll({
            amenityId: amenityIdParam,
          });
        } else {
          // Get all restaurants from API
          filteredResults = await restaurantsAPI.getAll();
        }

        // Filter by location
        if (locationParam && locationParam !== "") {
          filteredResults = filteredResults.filter(
            (restaurant) =>
              restaurant.address?.includes(locationParam) ||
              restaurant.location?.includes(locationParam)
          );
        }

        // Filter by price
        if (priceParam !== "all") {
          filteredResults = filteredResults.filter((restaurant) => {
            const priceRange = restaurant.priceRange || "";
            if (!priceRange) return false;

            // Extract numeric values from priceRange (format: "200.000đ - 500.000đ")
            const priceValues = priceRange
              .split("-")
              .map((p) => parseInt(p.replace(/\D/g, ""), 10));

            // Use the first number as min price and second as max price
            const minPrice = priceValues[0] || 0;
            const maxPrice = priceValues[1] || minPrice;

            return priceParam === "low"
              ? minPrice < 100000
              : priceParam === "medium"
              ? minPrice >= 100000 && maxPrice < 300000
              : priceParam === "high"
              ? minPrice >= 300000 && maxPrice < 500000
              : priceParam === "luxury"
              ? minPrice >= 500000
              : true;
          });
        }

        // Filter by rating
        if (ratingParam !== "all") {
          filteredResults = filteredResults.filter((restaurant) => {
            const rating = restaurant.rating || 0;
            return ratingParam === "above4"
              ? rating >= 4
              : ratingParam === "above3"
              ? rating >= 3
              : true;
          });
        }

        // Filter by operating hours
        if (operatingHoursParam !== "all") {
          filteredResults = filteredResults.filter((restaurant) => {
            // Convert time strings to hours and minutes (format: "11:00:00" or "11:00")
            const openingTime = restaurant.openingTime || "";
            const closingTime = restaurant.closingTime || "";

            if (!openingTime || !closingTime) return false;

            // Extract hours and minutes from time strings
            const [openHour, openMinute] = openingTime.split(":").map(Number);
            const [closeHour, closeMinute] = closingTime.split(":").map(Number);

            // Convert to minutes for easier comparison
            const openTimeInMinutes = openHour * 60 + (openMinute || 0);
            const closeTimeInMinutes = closeHour * 60 + (closeMinute || 0);

            // Define time ranges in minutes for filtering
            const timeRanges = {
              morning: { start: 6 * 60, end: 11 * 60 }, // 6:00 - 11:00
              lunch: { start: 11 * 60, end: 14 * 60 }, // 11:00 - 14:00
              evening: { start: 17 * 60, end: 22 * 60 }, // 17:00 - 22:00
              latenight: { start: 22 * 60, end: 2 * 60 }, // 22:00 - 2:00
              "24h": { start: 0, end: 24 * 60 }, // 24h
            };

            const selectedRange = timeRanges[operatingHoursParam];
            if (!selectedRange) return true;

            // Check if restaurant is open during the entire selected time range
            // For overnight ranges like latenight
            if (selectedRange.end < selectedRange.start) {
              // Overnight case (e.g., 22:00 - 2:00)
              if (closeTimeInMinutes < openTimeInMinutes) {
                // Restaurant also operates overnight
                return (
                  openTimeInMinutes <= selectedRange.start ||
                  closeTimeInMinutes >= selectedRange.end
                );
              } else {
                // Restaurant closes on the same day
                return (
                  openTimeInMinutes <= selectedRange.start &&
                  closeTimeInMinutes >= 24 * 60
                );
              }
            } else {
              // Normal case (e.g., 11:00 - 14:00)
              // Check if restaurant is open during the entire selected time range
              return (
                openTimeInMinutes <= selectedRange.start &&
                (closeTimeInMinutes >= selectedRange.end ||
                  closeTimeInMinutes < openTimeInMinutes)
              ); // handles overnight hours
            }
          });
        }

        // Filter by cuisine type
        if (cuisineParam !== "all") {
          filteredResults = filteredResults.filter((restaurant) =>
            restaurant.cuisineType
              ?.toLowerCase()
              .includes(cuisineParam.toLowerCase())
          );
        }

        // Apply default sorting - keeping the most relevant first
        filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setResults(filteredResults);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching filtered results:", err);
        setError("Không thể tải dữ liệu nhà hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchFilteredResults();
  }, [
    locationParam,
    amenityIdParam,
    priceParam,
    ratingParam,
    operatingHoursParam,
    cuisineParam,
  ]);

  // Render filter information
  const renderFilterInfo = () => {
    const activeFilters = [];

    if (locationParam) activeFilters.push(`Khu vực: ${locationParam}`);

    if (amenityIdParam && amenityName) {
      activeFilters.push(`Tiện ích: ${amenityName}`);
    }

    if (priceParam !== "all") {
      const priceLabels = {
        low: "Dưới 100.000đ",
        medium: "100.000đ - 300.000đ",
        high: "300.000đ - 500.000đ",
        luxury: "Trên 500.000đ",
      };
      activeFilters.push(`Giá: ${priceLabels[priceParam] || priceParam}`);
    }

    if (ratingParam !== "all") {
      const ratingLabels = {
        above4: "Trên 4 sao",
        above3: "Trên 3 sao",
      };
      activeFilters.push(
        `Đánh giá: ${ratingLabels[ratingParam] || ratingParam}`
      );
    }

    if (operatingHoursParam !== "all") {
      const hoursLabels = {
        morning: "Buổi sáng (6:00 - 11:00)",
        lunch: "Buổi trưa (11:00 - 14:00)",
        evening: "Buổi tối (17:00 - 22:00)",
        latenight: "Khuya (22:00 - 2:00)",
        "24h": "Mở cửa 24h",
      };
      activeFilters.push(
        `Giờ mở cửa: ${hoursLabels[operatingHoursParam] || operatingHoursParam}`
      );
    }

    if (cuisineParam !== "all") {
      activeFilters.push(`Loại: ${cuisineParam}`);
    }

    return activeFilters.join(" • ");
  };

  if (loading) {
    return (
      <div className="filter-results-page">
        <FilterBox />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu nhà hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="filter-results-page">
        <FilterBox />
        <div className="error-container">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="filter-results-page">
      <FilterBox />

      <div className="filter-results-container">
        <div className="filter-results-header">
          <div className="filter-results-info">
            <h1>Kết quả lọc</h1>
            {renderFilterInfo() && (
              <p className="filter-info">{renderFilterInfo()}</p>
            )}
            <p className="results-count">Tìm thấy {results.length} nhà hàng</p>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="filter-results-grid">
            {results.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h2>Không tìm thấy kết quả phù hợp</h2>
            <p>
              Vui lòng thử lại với các bộ lọc khác hoặc mở rộng tiêu chí tìm
              kiếm của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterResultsPage;
