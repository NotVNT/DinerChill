import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import FilterBox from '../components/FilterBox';
import RestaurantCard from '../components/RestaurantCard';
import { useApp } from '../context/AppContext';
import { restaurantsAPI } from '../api';
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
    recentlyViewed,
    clearRecentlyViewed,
  } = useApp();

  const filterRef = useRef(null);
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
    const isBannerDismissed = localStorage.getItem('passwordBannerDismissed');
    if (isBannerDismissed === 'true') {
      setShowPasswordBanner(false);
    }

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantsAPI.getAll();
        if (!data || data.length === 0) {
          throw new Error('Không có dữ liệu từ API.');
        }
        console.log('Fetched restaurants from API:', data);
        
        setAllRestaurants(data);
        
        // Phân loại nhà hàng
        const dealsData = data.filter(item => item.promotions?.length > 0);
        setHotDeals(dealsData);
        
        const seafoodData = data.filter(r => 
          r.cuisineType?.toLowerCase().includes('hải sản') || 
          r.description?.toLowerCase().includes('hải sản')
        );
        setSeafoodRestaurants(seafoodData);
        
        const partyData = data.filter(r => 
          r.description?.toLowerCase().includes('tiệc') || 
          r.name?.toLowerCase().includes('tiệc')
        );
        setPartyRestaurants(partyData);
        
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhà hàng:', err);
        setError(err.message || 'Lỗi khi tải dữ liệu');
        setAllRestaurants([]);
        setLoading(false);
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
    // Fallback to allRestaurants if the specific category list is empty
    const finalDataList = dataList && dataList.length > 0 ? dataList : allRestaurants;
    const displayedData = finalDataList.slice(0, displayCounts[category]);
    const hasMoreData = finalDataList.length > displayedData.length;

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
            onClick={() => handleLoadMore(category, finalDataList)}
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

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Đang tải dữ liệu nhà hàng...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>Lỗi: {error}</p>
      <button className="btn" onClick={() => window.location.reload()}>Thử lại</button>
    </div>
  );

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
        'Nhà hàng',
        'Khám phá tất cả các nhà hàng trên DinerChill',
        '/restaurants',
        '',
        allRestaurants,
        'all-restaurants-section',
        'hotDeals'
      )}

      {allRestaurants.length > 0 && (
        <>
          {hotDeals.length > 0 && renderSection(
            'Ưu đãi Hot',
            'Khám phá các nhà hàng và sản phẩm đang có ưu đãi hấp dẫn ngay',
            '/deals',
            'promotion=Ưu đãi',
            hotDeals,
            'hot-deals-section',
            'hotDeals'
          )}

          {seafoodRestaurants.length > 0 && renderSection(
            'Nhà hàng hải sản ngon nhất',
            'Tham khảo ngay các nhà hàng hải sản được yêu thích!',
            '/restaurants',
            'cuisine=Hải sản&minRating=4',
            seafoodRestaurants,
            'seafood-restaurants-section',
            'seafoodRestaurants'
          )}

          {partyRestaurants.length > 0 && renderSection(
            'Nhà hàng phù hợp đặt tiệc',
            'Ưu đãi đa dạng giúp bạn dễ dàng lựa chọn địa điểm tiệc',
            '/restaurants',
            'suitableFor=tiệc&minCapacity=50',
            partyRestaurants,
            'party-restaurants-section',
            'partyRestaurants'
          )}
        </>
      )}

      {renderRecentlyViewed()}
    </div>
  );
}

export default HomePage;