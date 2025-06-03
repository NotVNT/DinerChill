import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { categoriesAPI } from "../../services/api";
import RestaurantCard from "../../components/RestaurantCard";
import FilterBox from "../../components/FilterBox";
import { useApp } from "../../context/AppContext";
import "../../styles/pages/CategoryPage.css";

/**
 * Template for category pages that uses the filter system
 * To create a new category page, import and use this template:
 *
 * Example:
 * import CategoryTemplate from './CategoryTemplate';
 *
 * const MonChay = () => {
 *   return <CategoryTemplate categoryName="Món chay" categoryId="mon-chay" />;
 * };
 *
 * export default MonChay;
 */
const CategoryTemplate = ({ categoryName, categoryId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilters } = useApp();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse filter parameters from URL
  const query = new URLSearchParams(location.search);
  const locationParam = query.get("location") || "";
  const distanceParam = query.get("distance") || "all";
  const priceParam = query.get("price") || "all";
  const ratingParam = query.get("rating") || "all";
  const operatingHoursParam = query.get("operatingHours") || "all";

  // Set the cuisine filter to this category
  useEffect(() => {
    if (setFilters && categoryId) {
      setFilters((prev) => ({
        ...prev,
        cuisine: categoryId,
      }));
    }
  }, [categoryId, setFilters]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        // Get restaurants by category name
        let data = await categoriesAPI.getRestaurantsByCategoryName(
          categoryName
        );

        // Process each restaurant to ensure images are properly formatted
        data = data.map((restaurant) => {
          // Create a copy of the restaurant to avoid mutating the original
          const processedRestaurant = { ...restaurant };

          // Process image paths to ensure they're properly formatted
          if (
            processedRestaurant.images &&
            Array.isArray(processedRestaurant.images)
          ) {
            processedRestaurant.images = processedRestaurant.images.map(
              (img) => {
                if (typeof img === "object" && img.image_path) {
                  return img;
                } else if (typeof img === "string") {
                  return { image_path: img };
                }
                return img;
              }
            );
          } else if (
            !processedRestaurant.images ||
            !Array.isArray(processedRestaurant.images)
          ) {
            // If no images array or it's not an array, initialize as empty array
            processedRestaurant.images = [];
          }

          return processedRestaurant;
        });

        // Apply additional filters
        if (locationParam) {
          data = data.filter(
            (restaurant) =>
              restaurant.address?.includes(locationParam) ||
              restaurant.location?.includes(locationParam)
          );
        }

        if (distanceParam !== "all") {
          data = data.filter((restaurant) => {
            const distance = restaurant.distance || 0;
            return distanceParam === "near"
              ? distance <= 2
              : distanceParam === "under5km"
              ? distance <= 5
              : distanceParam === "under10km"
              ? distance <= 10
              : true;
          });
        }

        // Filter by price
        if (priceParam !== "all") {
          data = data.filter((restaurant) => {
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
          data = data.filter((restaurant) => {
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
          data = data.filter((restaurant) => {
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
                  closeTimeInMinutes < openTimeInMinutes) // handles overnight hours
              );
            }
          });
        }

        // Apply default sorting by rating
        data.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setRestaurants(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Không thể tải nhà hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [
    categoryName,
    locationParam,
    distanceParam,
    priceParam,
    ratingParam,
    operatingHoursParam,
  ]);

  if (loading)
    return (
      <div className="category-page">
        <FilterBox />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải nhà hàng...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="category-page">
        <FilterBox />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate("/")}>Quay lại trang chủ</button>
        </div>
      </div>
    );

  return (
    <div className="category-page">
      <FilterBox />

      <div className="category-content">
        <div className="category-header">
          <div className="category-info">
            <h1>Nhà hàng {categoryName}</h1>
            <p>
              Tìm thấy {restaurants.length} nhà hàng{" "}
              {categoryName.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="restaurant-grid">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))
          ) : (
            <p className="no-restaurants">
              Không tìm thấy nhà hàng nào thuộc danh mục này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryTemplate;
