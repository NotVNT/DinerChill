import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import RestaurantCard from "./RestaurantCard";
import { useApp } from "../context/AppContext"; // Import useApp để lấy dữ liệu từ AppContext
import "../styles/RestaurantList.css";

function RestaurantList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedLocation = queryParams.get("location") || "Hồ Chí Minh"; // Lấy khu vực từ URL

  const { restaurants } = useApp(); // Lấy dữ liệu restaurants từ AppContext
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filter, setFilter] = useState("all"); // Lọc chính: all, reputable, hot-deals, latest
  const [category, setCategory] = useState("all"); // Lọc phụ: loại hình nhà hàng

  // Lọc nhà hàng theo khu vực, tiêu chí chính và loại hình
  useEffect(() => {
    let filtered = [...restaurants];

    // Lọc theo khu vực từ URL (selectedLocation)
    if (selectedLocation) {
      filtered = filtered.filter(
        (restaurant) => restaurant.location === selectedLocation
      );
    }

    // Lọc chính (filter)
    if (filter === "reputable") {
      filtered = filtered.filter((r) => r.rating >= 4.5); // Nhà hàng uy tín: rating >= 4.5
    } else if (filter === "hot-deals") {
      filtered = filtered.filter((r) => r.discount); // Ưu đãi hot: có discount
    } else if (filter === "latest") {
      // Use default sorting based on creation date
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    // Lọc phụ theo loại hình (category)
    if (category !== "all") {
      filtered = filtered.filter((r) => r.cuisine === category);
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedLocation, filter, category]);

  // Các loại hình nhà hàng (dùng cho nút lọc phụ)
  const categories = [
    "all",
    "Nhà hàng",
    "Lẩu",
    "Buffet",
    "Hải sản",
    "Lẩu & Nướng",
    "Quán Nhậu",
    "Món chay",
    "Đặt tiệc",
    "Hàn Quốc",
    "Nhật Bản",
    "Món Âu",
    "Món Việt",
    "Món Thái",
    "Món Trung",
    "Món Hoa",
    "Tiệc cưới",
  ];

  return (
    <div className="restaurant-list">
      <h2>Danh sách nhà hàng tại {selectedLocation}</h2>

      {/* Nút lọc chính */}
      <div className="main-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={filter === "reputable" ? "active" : ""}
          onClick={() => setFilter("reputable")}
        >
          Nhà hàng uy tín
        </button>
        <button
          className={filter === "hot-deals" ? "active" : ""}
          onClick={() => setFilter("hot-deals")}
        >
          Ưu đãi hot
        </button>
        <button
          className={filter === "latest" ? "active" : ""}
          onClick={() => setFilter("latest")}
        >
          Mới nhất
        </button>
      </div>

      {/* Nút lọc phụ (loại hình nhà hàng) */}
      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat === "all" ? "Tất cả loại hình" : cat}
          </button>
        ))}
      </div>

      {/* Danh sách nhà hàng */}
      <div className="restaurant-grid">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <p>Không tìm thấy nhà hàng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
}

export default RestaurantList;
