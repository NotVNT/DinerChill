import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import FilterBox from '../components/FilterBox';
import RestaurantCard from '../components/RestaurantCard';
import { useApp } from '../context/AppContext';
import { restaurantAPI } from '../services/api';
import { mockdata, useMockData } from '../components/mockData';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate(); // Giữ lại navigate
  const [showPasswordBanner, setShowPasswordBanner] = useState(true);
  const [filters, setFilters] = useState({
    area: '',
    priceRange: '',
    mainDish: '',
    occasion: '',
    promotion: '',
    privateRoom: '',
    dailyMeal: '',
    companyEvent: '',
    privateArea: '',
    familyEvent: '',
    serviceStyle: '',
    cuisineStyle: '',
  });

  const {
    hotRestaurants,
    hotProducts,
    partyRestaurants,
    famousLocations,
    seafoodRestaurants,
    chineseRestaurants,
    popularCuisines,
    monthlyFavorites,
    amenitiesRestaurants,
    luxuryRestaurants,
    trustedRestaurants,
    touristRestaurants,
    lunchSuggestions,
    newOnDinerChill,
    newsAndBlog,
    recentlyViewed,
    clearRecentlyViewed,
    loading,
    error,
  } = useApp();

  const filterRef = useRef(null);
  const [allRestaurants, setAllRestaurants] = useState([]);

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
    const isBannerDismissed = localStorage.getItem('passwordBannerDismissed');
    if (isBannerDismissed === 'true') {
      setShowPasswordBanner(false);
    }

    const fetchRestaurants = async () => {
      try {
        let data;
        if (useMockData) {
          data = mockdata;
          if (!data || data.length === 0) {
            throw new Error('Không có dữ liệu mẫu nào.');
          }
        } else {
          data = await restaurantAPI.getAll();
          if (!data || data.length === 0) {
            throw new Error('Không có dữ liệu từ API.');
          }
        }
        setAllRestaurants(data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhà hàng:', err);
        setAllRestaurants([]);
      }
    };

    fetchRestaurants();
  }, []);

  const handleDismissBanner = () => {
    setShowPasswordBanner(false);
    localStorage.setItem('passwordBannerDismissed', 'true');
  };

  const areas = ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Phú Nhuận'];
  const priceRanges = ['Dưới 100k', '100k-200k', '200k-300k', '300k-500k', 'Trên 500k'];
  const mainDishes = ['Lẩu', 'Nướng', 'Món Á', 'Món Âu', 'Món Nhật', 'Món Hàn'];
  const occasions = ['Hội nghị', 'Truyền thống', 'Hiện đại', 'Tiệc sinh nhật'];
  const promotions = ['Ưu đãi', 'Độc quyền'];
  const privateRooms = ['10-20 người', '20-50 người', '50-100 người'];
  const dailyMeals = ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Đêm', 'Khuya'];
  const companyEvents = ['Tiệc nhỏ', 'Tiệc lớn', 'Tiệc buffet', 'Tiệc công ty ngoài trời'];
  const privateAreas = ['Nhóm nhỏ (dưới 20)', 'Nhóm vừa (20-50)', 'Nhóm lớn (50-100)'];
  const familyEvents = ['Tiệc nhỏ', 'Tiệc ấm cúng', 'Tiệc ngoài trời', 'Tiệc đông người'];
  const serviceStyles = ['Tại bàn', 'Buffet', 'Gọi món', 'Tự phục vụ'];
  const cuisineStyles = ['Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Thái Lan', 'Âu'];

  const cuisines = [
    { name: 'Buffet', path: '/cuisines?cuisineStyle=Buffet', icon: 'fa-utensils' },
    { name: 'Lẩu', path: '/cuisines?cuisineStyle=Lẩu', icon: 'fa-hot-tub' },
    { name: 'Nướng', path: '/cuisines?cuisineStyle=Nướng', icon: 'fa-fire' },
    { name: 'Hải sản', path: '/cuisines?cuisineStyle=Hải sản', icon: 'fa-fish' },
    { name: 'Quán nhậu', path: '/cuisines?cuisineStyle=Quán nhậu', icon: 'fa-beer-mug-empty' },
    { name: 'Món Nhẹ', path: '/cuisines?cuisineStyle=Món Nhẹ', icon: 'fa-leaf' },
    { name: 'Món Việt', path: '/cuisines?cuisineStyle=Việt Nam', icon: 'fa-bowl-rice' },
    { name: 'Món Hàn', path: '/cuisines?cuisineStyle=Hàn Quốc', icon: 'fa-pepper-hot' },
    { name: 'Món chay', path: '/cuisines?cuisineStyle=Món chay', icon: 'fa-carrot' },
    { name: 'Món khác', path: '/cuisines?cuisineStyle=Món khác', icon: 'fa-utensil-spoon' },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    // Tạo query string từ filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    // Điều hướng đến trang /restaurants với bộ lọc
    navigate(`/restaurants?${queryParams.toString()}`);
  };

  const scrollFiltersLeft = () => {
    if (filterRef.current) {
      filterRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollFiltersRight = () => {
    if (filterRef.current) {
      filterRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleLoadMore = (category, dataList) => {
    setDisplayCounts(prev => ({
      ...prev,
      [category]: prev[category] + 4,
    }));
  };

  const renderSection = (title, subtitle, link, queryParams, dataList, className, category) => {
    const displayedData = dataList.slice(0, displayCounts[category]);
    const hasMoreData = dataList.length > displayedData.length;

    return (
      <div className={`section-wrapper ${className}`}>
        <div className="section-header">
          <div className="section-title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link to={`${link}${queryParams ? `?${queryParams}` : ''}`} className="view-all">
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
            onClick={() => handleLoadMore(category, dataList)}
            className="load-more-btn"
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
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

  if (loading && !hotRestaurants.length && !allRestaurants.length) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="home-page">
      {showPasswordBanner && (
        <div className="password-notification-banner">
          <div className="password-notification-content">
            <span className="password-notification-icon">🔒</span>
            <div className="password-notification-text">
              <p>
                Để bảo mật tài khoản, hãy cập nhật mật khẩu của bạn thường xuyên.{' '}
                <Link to="/update-password">Cập nhật ngay</Link>
              </p>
            </div>
            <button className="password-notification-dismiss" onClick={handleDismissBanner}>
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="search-container">
        <SearchBar location="Hồ Chí Minh" supportPhone="1900 6005" />
      </div>
      <div className="filter-container">
        <div className="top-filters-wrapper">
          <button className="scroll-arrow scroll-left" onClick={scrollFiltersLeft}>
            ←
          </button>
          <div className="top-filters" ref={filterRef}>
            <select name="area" value={filters.area} onChange={handleFilterChange}>
              <option value="">Khu vực</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <select name="mainDish" value={filters.mainDish} onChange={handleFilterChange}>
              <option value="">Nhà hàng</option>
              {mainDishes.map((dish) => (
                <option key={dish} value={dish}>{dish}</option>
              ))}
            </select>
            <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
              <option value="">Giá trung bình</option>
              {priceRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            <select name="occasion" value={filters.occasion} onChange={handleFilterChange}>
              <option value="">Đồ ăn chính</option>
              {occasions.map((occasion) => (
                <option key={occasion} value={occasion}>{occasion}</option>
              ))}
            </select>
            <select name="promotion" value={filters.promotion} onChange={handleFilterChange}>
              <option value="">Phù hợp</option>
              {promotions.map((promo) => (
                <option key={promo} value={promo}>{promo}</option>
              ))}
            </select>
            <select name="privateRoom" value={filters.privateRoom} onChange={handleFilterChange}>
              <option value="">Phòng riêng</option>
              {privateRooms.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <select name="dailyMeal" value={filters.dailyMeal} onChange={handleFilterChange}>
              <option value="">Bữa ăn hàng ngày</option>
              {dailyMeals.map((meal) => (
                <option key={meal} value={meal}>{meal}</option>
              ))}
            </select>
            <select name="companyEvent" value={filters.companyEvent} onChange={handleFilterChange}>
              <option value="">Đặt tiệc công ty</option>
              {companyEvents.map((event) => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
            <select name="privateArea" value={filters.privateArea} onChange={handleFilterChange}>
              <option value="">Khu riêng</option>
              {privateAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <select name="familyEvent" value={filters.familyEvent} onChange={handleFilterChange}>
              <option value="">Đặt tiệc gia đình</option>
              {familyEvents.map((event) => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
            <select name="serviceStyle" value={filters.serviceStyle} onChange={handleFilterChange}>
              <option value="">Kiểu phục vụ</option>
              {serviceStyles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <select name="cuisineStyle" value={filters.cuisineStyle} onChange={handleFilterChange}>
              <option value="">Phong cách ẩm thực</option>
              {cuisineStyles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
          <button className="scroll-arrow scroll-right" onClick={scrollFiltersRight}>
            →
          </button>
          <button className="apply-filter-button" onClick={applyFilters}>
            Tìm kiếm
          </button>
        </div>
        <div className="cuisine-filter">
          {cuisines.map((cuisine) => (
            <Link key={cuisine.name} to={cuisine.path} className="cuisine-button">
              <div className="cuisine-top">
                <i className={`fas ${cuisine.icon} cuisine-icon`}></i>
              </div>
              <div className="cuisine-content">
                <h3 className="cuisine-headline">{cuisine.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="container">
        <FilterBox />
      </div>

      {renderSection(
        'Ưu đãi Hot',
        'Khám phá các nhà hàng và sản phẩm đang có ưu đãi hấp dẫn ngay',
        '/deals',
        'promotion=Ưu đãi',
        [...hotRestaurants, ...hotProducts].filter(item => item.promotions?.length > 0),
        'hot-deals-section',
        'hotDeals'
      )}

      {renderSection(
        'Nhà hàng hải sản ngon nhất',
        'Tham khảo ngay các nhà hàng hải sản được yêu thích!',
        '/restaurants',
        'cuisine=Hải sản&minRating=4',
        seafoodRestaurants.length > 0
          ? seafoodRestaurants
          : allRestaurants.filter(r => r.cuisine?.toLowerCase() === 'hải sản' && r.rating >= 4),
        'seafood-restaurants-section',
        'seafoodRestaurants'
      )}

      {renderSection(
        'Ăn món Trung ngon ở đâu?',
        'Top quán Trung ngon được DinerChill lựa chọn!',
        '/restaurants',
        'cuisine=Trung Hoa&minRating=4',
        chineseRestaurants.length > 0
          ? chineseRestaurants
          : allRestaurants.filter(r => r.cuisine?.toLowerCase() === 'trung hoa' && r.rating >= 4),
        'chinese-restaurants-section',
        'chineseRestaurants'
      )}

      {renderSection(
        'Phong cách ẩm thực phổ biến',
        'Khám phá các loại ẩm thực đa dạng với ưu đãi hấp dẫn',
        '/restaurants',
        'minRating=4.5&cuisines=Việt Nam,Trung Hoa,Nhật Bản,Quốc tế',
        popularCuisines.length > 0
          ? popularCuisines
          : allRestaurants
              .filter(r => r.rating >= 4.5 && ['Việt Nam', 'Trung Hoa', 'Nhật Bản', 'Quốc tế'].includes(r.cuisine))
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5),
        'popular-cuisines-section',
        'popularCuisines'
      )}

      {renderSection(
        'Nhà hàng phù hợp đặt tiệc',
        'Ưu đãi đa dạng giúp bạn dễ dàng lựa chọn địa điểm tiệc',
        '/restaurants',
        'suitableFor=tiệc&minCapacity=50',
        partyRestaurants.length > 0
          ? partyRestaurants
          : allRestaurants.filter(r => r.suitableFor?.toLowerCase().includes('tiệc') && r.capacity >= 50),
        'party-restaurants-section',
        'partyRestaurants'
      )}

      {renderSection(
        'Địa danh nổi tiếng',
        'Khám phá các địa điểm ẩm thực nổi bật tại Tp.HCM',
        '/restaurants',
        'area=Quận 1&minRating=4.5',
        famousLocations.length > 0
          ? famousLocations
          : allRestaurants
              .filter(r => r.address?.toLowerCase().includes('quận 1') && r.rating >= 4.5)
              .sort((a, b) => b.rating - a.rating),
        'famous-locations-section',
        'famousLocations'
      )}

      {renderSection(
        'Dành cho du khách',
        'Thưởng thức đặc sản Sài Gòn tại các nhà hàng nổi bật',
        '/restaurants',
        'suitableFor=khách du lịch&minRating=4',
        touristRestaurants.length > 0
          ? touristRestaurants
          : allRestaurants.filter(r => r.suitableFor?.toLowerCase().includes('khách du lịch') && r.rating >= 4),
        'tourist-restaurants-section',
        'touristRestaurants'
      )}

      {renderSection(
        'Trưa nay ăn gì?',
        'Lựa chọn nhanh các sản phẩm ăn trưa qua DinerChill',
        '/restaurants',
        'suitableFor=nhân viên văn phòng&openTime=11:00',
        lunchSuggestions.length > 0
          ? lunchSuggestions
          : allRestaurants.filter(r => r.suitableFor?.toLowerCase().includes('nhân viên văn phòng') && r.openingHours?.includes('11:00')),
        'lunch-suggestions-section',
        'lunchSuggestions'
      )}

      {renderSection(
        'Top nhà hàng cao cấp',
        'Khám phá không gian sang trọng với ưu đãi tốt',
        '/restaurants',
        'minPriceRange=500000&ambiance=sang trọng',
        luxuryRestaurants.length > 0
          ? luxuryRestaurants
          : allRestaurants.filter(r => r.priceRange?.toLowerCase().includes('trên 500k') && r.ambiance?.toLowerCase().includes('sang trọng')),
        'luxury-restaurants-section',
        'luxuryRestaurants'
      )}

      {renderSection(
        'Đặt chỗ uy tín',
        'Gợi ý nhà hàng ngon, chất lượng qua DinerChill',
        '/restaurants',
        'minRating=4.5&minReviews=100',
        trustedRestaurants.length > 0
          ? trustedRestaurants
          : allRestaurants
              .filter(r => r.rating >= 4.5 && r.reviewCount >= 100)
              .sort((a, b) => b.rating - a.rating),
        'trusted-restaurants-section',
        'trustedRestaurants'
      )}

      {renderSection(
        'Yêu thích nhất hàng tháng',
        'Nhà hàng được đặt chỗ nhiều nhất trong tháng',
        '/restaurants',
        'minRating=4&minReviews=50',
        monthlyFavorites.length > 0
          ? monthlyFavorites
          : allRestaurants
              .filter(r => r.rating >= 4 && r.reviewCount >= 50)
              .sort((a, b) => b.reviewCount - a.reviewCount)
              .slice(0, 5),
        'monthly-favorites-section',
        'monthlyFavorites'
      )}

      {renderSection(
        'Tìm nhà hàng theo tiện ích',
        'Lựa chọn nhà hàng dựa trên các tiện ích đặc biệt',
        '/restaurants',
        'amenities=wifi,airConditioning',
        amenitiesRestaurants.length > 0
          ? amenitiesRestaurants
          : allRestaurants.filter(r => r.amenities?.wifi && r.amenities?.airConditioning),
        'amenities-restaurants-section',
        'amenitiesRestaurants'
      )}

      {renderSection(
        'Mới nhất trên DinerChill',
        'Khám phá các nhà hàng mới nhất trên nền tảng',
        '/restaurants',
        'sortBy=createdAt&order=desc',
        newOnDinerChill.length > 0
          ? newOnDinerChill
          : allRestaurants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        'new-on-DinerChill-section',
        'newOnDinerChill'
      )}

      {renderSection(
        'Tin tức & Blog',
        'Cập nhật thông tin hữu ích về ẩm thực và mẹo vặt',
        '/blog',
        '',
        newsAndBlog,
        'news-and-blog-section',
        'newsAndBlog'
      )}

      {renderRecentlyViewed()}
    </div>
  );
}

export default HomePage;