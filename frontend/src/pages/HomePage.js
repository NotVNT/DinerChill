import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import FilterBox from "../components/FilterBox";
import RestaurantCard from "../components/RestaurantCard";
import SearchBar from "../components/SearchBar";
import { useApp } from "../context/AppContext";
import { restaurantsAPI } from "../services/api";
import "../styles/HomePage.css";

function HomePage() {
  const [showPasswordBanner, setShowPasswordBanner] = useState(true);
  // Filters state - may be used in future implementation
  // const [filters, setFilters] = useState({
  //   area: '',
  //   priceRange: '',
  //   mainDish: '',
  //   occasion: '',
  //   promotion: '',
  //   privateRoom: '',
  //   dailyMeal: '',
  //   companyEvent: '',
  //   privateArea: '',
  //   familyEvent: '',
  //   serviceStyle: '',
  //   cuisineStyle: '',
  // });

  const { recentlyViewed, clearRecentlyViewed } = useApp();

  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotDeals, setHotDeals] = useState([]);
  const [seafoodRestaurants, setSeafoodRestaurants] = useState([]);
  const [partyRestaurants, setPartyRestaurants] = useState([]);

  const [displayCounts, setDisplayCounts] = useState({
    hotDeals: 4,
    seafoodRestaurants: 4,
    chineseRestaurants: 4,
    popularCuisines: 4,
    partyRestaurants: 4,
    famousLocations: 4,
    touristRestaurants: 4,
    lunchSuggestions: 4,
    luxuryRestaurants: 4,
    trustedRestaurants: 4,
    monthlyFavorites: 4,
    amenitiesRestaurants: 4,
    newOnDinerChill: 4,
    newsAndBlog: 4,
  });

  useEffect(() => {
    const isBannerDismissed = localStorage.getItem("passwordBannerDismissed");
    if (isBannerDismissed === "true") {
      setShowPasswordBanner(false);
    }

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantsAPI.getAll();
        if (!data || data.length === 0) {
          throw new Error("Không có dữ liệu từ API.");
        }
        console.log("Fetched restaurants from API:", data);

        setAllRestaurants(data);

        // Phân loại nhà hàng
        const dealsData = data.filter((item) => item.promotions?.length > 0);
        setHotDeals(dealsData);

        const seafoodData = data.filter(
          (r) =>
            r.cuisineType?.toLowerCase().includes("hải sản") ||
            r.description?.toLowerCase().includes("hải sản")
        );
        setSeafoodRestaurants(seafoodData);

        const partyData = data.filter(
          (r) =>
            r.description?.toLowerCase().includes("tiệc") ||
            r.name?.toLowerCase().includes("tiệc")
        );
        setPartyRestaurants(partyData);

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhà hàng:", err);
        setError(err.message || "Lỗi khi tải dữ liệu");
        setAllRestaurants([]);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleDismissBanner = () => {
    setShowPasswordBanner(false);
    localStorage.setItem("passwordBannerDismissed", "true");
  };

  const handleLoadMore = (category, dataList) => {
    setDisplayCounts((prev) => ({
      ...prev,
      [category]: prev[category] + 4,
    }));
  };

  const renderSection = (
    title,
    subtitle,
    link,
    queryParams,
    dataList,
    className,
    category
  ) => {
    // Fallback to allRestaurants if the specific category list is empty
    const finalDataList =
      dataList && dataList.length > 0 ? dataList : allRestaurants;
    const displayedData = finalDataList.slice(0, displayCounts[category]);
    const hasMoreData = finalDataList.length > displayedData.length;

    return (
      <div className={`section-wrapper ${className}`}>
        <div className="section-header">
          <div className="section-title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link
            to={`${link}${queryParams ? `?${queryParams}` : ""}`}
            className="view-all"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="restaurant-grid">
          {displayedData.length > 0 ? (
            displayedData.map((item) => (
              <RestaurantCard key={item.id} restaurant={item} />
            ))
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}
        </div>
        {hasMoreData && (
          <button
            onClick={() => handleLoadMore(category, finalDataList)}
            className="load-more-btn"
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải thêm"}
          </button>
        )}
      </div>
    );
  };

  const renderRecentlyViewed = () => {
    const allRecentlyViewed = Object.values(recentlyViewed).flat();
    if (allRecentlyViewed.length === 0) return null;

    return (
      <div className="section-wrapper recently-viewed-section">
        <div className="section-header">
          <div className="section-title">
            <h2>Đã xem gần đây</h2>
            <p>Xem lại những nhà hàng bạn đã quan tâm</p>
          </div>
          <button onClick={clearRecentlyViewed} className="clear-all-btn">
            Xóa tất cả
          </button>
        </div>
        <div className="restaurant-grid">
          {allRecentlyViewed.slice(0, 4).map((item) => (
            <RestaurantCard key={item.id} restaurant={item} />
          ))}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu nhà hàng...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>Lỗi: {error}</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );

  return (
    <div className="home-page">
      <SearchBar />
      {showPasswordBanner && (
        <div className="password-notification-banner">
          <div className="password-notification-content">
            <span className="password-notification-icon">🔒</span>
            <div className="password-notification-text">
              <p>
                Để bảo mật tài khoản, hãy cập nhật mật khẩu của bạn thường
                xuyên. <Link to="/change-password">Cập nhật ngay</Link>
              </p>
            </div>
            <button
              className="password-notification-dismiss"
              onClick={handleDismissBanner}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <FilterBox />
      </div>

      {renderSection(
        "Nhà hàng",
        "Khám phá tất cả các nhà hàng trên DinerChill",
        "/restaurants",
        "",
        allRestaurants,
        "all-restaurants-section",
        "hotDeals"
      )}

      {allRestaurants.length > 0 && (
        <>
          {hotDeals.length > 0 &&
            renderSection(
              "Ưu đãi Hot",
              "Khám phá các nhà hàng và sản phẩm đang có ưu đãi hấp dẫn ngay",
              "/deals",
              "promotion=Ưu đãi",
              hotDeals,
              "hot-deals-section",
              "hotDeals"
            )}

          {seafoodRestaurants.length > 0 &&
            renderSection(
              "Nhà hàng hải sản ngon nhất",
              "Tham khảo ngay các nhà hàng hải sản được yêu thích!",
              "/restaurants",
              "cuisine=Hải sản&minRating=4",
              seafoodRestaurants,
              "seafood-restaurants-section",
              "seafoodRestaurants"
            )}

          {partyRestaurants.length > 0 &&
            renderSection(
              "Nhà hàng phù hợp đặt tiệc",
              "Ưu đãi đa dạng giúp bạn dễ dàng lựa chọn địa điểm tiệc",
              "/restaurants",
              "suitableFor=tiệc&minCapacity=50",
              partyRestaurants,
              "party-restaurants-section",
              "partyRestaurants"
            )}
        </>
      )}

      {renderRecentlyViewed()}
    </div>
  );
}

export default HomePage;
