import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { useApp } from '../context/AppContext';
import '../styles/RestaurantPage.css';

// Dữ liệu tĩnh cuisines
const cuisines = [
  'Tất cả',
  'Lẩu',
  'Buffet',
  'Hải sản',
  'Nướng',
  'Quán Nhậu',
  'Chay',
  'Đồ tiệc',
  'Hàn Quốc',
  'Nhật Bản',
  'Món Âu',
  'Việt Nam',
  'Món Thái',
  'Trung Hoa',
  'Tiệc cưới',
  'Đồ uống',
];

// Dữ liệu tĩnh cho dropdown lọc
const sortFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'reputable', label: 'Nhà hàng uy tín' },
  { value: 'hot-deals', label: 'Ưu đãi hot' },
  { value: 'latest', label: 'Mới nhất' },
];

// Mapping giữa cuisine và nguồn dữ liệu từ useApp
const cuisineDataMapping = {
  'Lẩu': 'hotRestaurants',
  'Buffet': 'hotRestaurants',
  'Hải sản': 'seafoodRestaurants',
  'Nướng': 'hotRestaurants',
  'Quán Nhậu': 'hotRestaurants',
  'Chay': 'hotRestaurants',
  'Đồ tiệc': 'partyRestaurants',
  'Hàn Quốc': 'hotRestaurants',
  'Nhật Bản': 'hotRestaurants',
  'Món Âu': 'hotRestaurants',
  'Việt Nam': 'hotRestaurants',
  'Món Thái': 'hotRestaurants',
  'Trung Hoa': 'chineseRestaurants',
  'Tiệc cưới': 'hotRestaurants',
  'Đồ uống': 'hotRestaurants',
};

function RestaurantPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: 'Hồ Chí Minh',
    cuisine: 'Tất cả',
    distance: 'all',
    rating: 'all',
    sort: 'all',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const { cuisineName } = useParams();
  const {
    hotRestaurants,
    seafoodRestaurants,
    chineseRestaurants,
    partyRestaurants,
    nearbyRestaurants,
    recentlyViewed,
    locations,
    loading,
    error,
    useMockData,
  } = useApp();

  const cuisineFromQuery = new URLSearchParams(location.search).get('cuisine') || cuisineName || 'Lẩu';

  // Lấy danh sách nhà hàng theo cuisine
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const path = location.pathname.split('/')[2] || '';
        let cuisineFilter = cuisines.includes(cuisineFromQuery) ? cuisineFromQuery : 'Lẩu';
        let restaurantList = [];

        // Xử lý nguồn dữ liệu từ context
        const dataSources = {
          hot: hotRestaurants,
          nearby: nearbyRestaurants,
        };
        const defaultSource = hotRestaurants;

        if (path in dataSources && dataSources[path]) {
          restaurantList = dataSources[path];
        } else {
          const dataSource = cuisineDataMapping[cuisineFilter] || 'hotRestaurants';
          restaurantList = (useMockData ? { hotRestaurants, seafoodRestaurants, chineseRestaurants, partyRestaurants } : { hotRestaurants, seafoodRestaurants, chineseRestaurants, partyRestaurants })[dataSource] || defaultSource || [];
        }

        // Kiểm tra nếu restaurantList là undefined hoặc rỗng
        if (!Array.isArray(restaurantList) || restaurantList.length === 0) {
          restaurantList = hotRestaurants || [];
        }

        // Lọc theo cuisine nếu không phải là "Tất cả"
        const filteredByCuisine = cuisineFilter !== 'Tất cả'
          ? restaurantList.filter(restaurant => restaurant?.cuisine === cuisineFilter)
          : restaurantList;

        setRestaurants(filteredByCuisine);

        // Cập nhật bộ lọc từ query
        const search = query.get('search') || '';
        const loc = query.get('location') || 'Hồ Chí Minh';
        setSearchTerm(search);
        setFilters(prev => ({
          ...prev,
          location: loc,
          cuisine: cuisineFilter,
        }));
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err.message);
        setRestaurants([]);
      }
    };

    fetchData();
  }, [
    location,
    cuisineFromQuery,
    hotRestaurants,
    seafoodRestaurants,
    chineseRestaurants,
    partyRestaurants,
    nearbyRestaurants,
    useMockData,
  ]);

  // Hàm lọc nhà hàng
  const filterRestaurants = (restaurants, filters) => {
    let filtered = [...restaurants];

    if (filters.location !== 'Hồ Chí Minh') {
      filtered = filtered.filter(r => r.location === filters.location);
    }

    if (filters.cuisine !== 'Tất cả') {
      filtered = filtered.filter(r => r.cuisine === filters.cuisine);
    }

    if (filters.distance !== 'all') {
      filtered = filtered.filter(r => {
        const distance = r.distance || 0;
        if (filters.distance === 'near') return distance <= 2;
        if (filters.distance === 'under5km') return distance <= 5;
        if (filters.distance === 'under10km') return distance <= 10;
        return true;
      });
    }

    if (filters.rating !== 'all') {
      filtered = filtered.filter(r => {
        const rating = r.rating || 0;
        if (filters.rating === 'above4') return rating >= 4;
        if (filters.rating === 'above3') return rating >= 3;
        return true;
      });
    }

    if (filters.sort === 'reputable') {
      filtered = filtered.filter(r => r.rating >= 4.5);
    } else if (filters.sort === 'hot-deals') {
      filtered = filtered.filter(r => r.discount);
    } else if (filters.sort === 'latest') {
      filtered = filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // Sắp xếp giảm dần
      });
    }

    return filtered;
  };

  // Memo hóa kết quả lọc
  const filteredRestaurants = useMemo(() => filterRestaurants(restaurants, filters), [restaurants, filters]);

  // Gợi ý tìm kiếm
  const memoizedSuggestions = useMemo(() => {
    if (!searchTerm) return { suggestions: [], suggestedItems: [] };

    const itemNameSuggestions = restaurants
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => item.name);

    const cuisineSuggestions = cuisines
      .filter(cuisine => cuisine.toLowerCase().includes(searchTerm.toLowerCase()));

    const allSuggestions = [...new Set([...cuisineSuggestions, ...itemNameSuggestions])].slice(0, 5);

    const matchingItems = restaurants
      .filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cuisine && item.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .slice(0, 3);

    return { suggestions: allSuggestions, suggestedItems: matchingItems };
  }, [searchTerm, restaurants]);

  useEffect(() => {
    setSuggestions(memoizedSuggestions.suggestions);
    setSuggestedItems(memoizedSuggestions.suggestedItems);
  }, [memoizedSuggestions]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleRestaurantSuggestionClick = (itemId) => {
    setShowSuggestions(false);
    navigate(`/restaurant/${itemId}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      location: 'Hồ Chí Minh',
      cuisine: 'Tất cả',
      distance: 'all',
      rating: 'all',
      sort: 'all',
    });
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    navigate(`/nha-hang?search=${encodeURIComponent(term)}&location=${encodeURIComponent(filters.location)}`);
  };

  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);
  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[2] || '';
    if (path === 'hot') return 'Top nhà hàng ưu đãi Hot';
    if (path === 'nearby') return 'Nhà hàng gần bạn';
    if (filters.cuisine === 'Tất cả') return `Tất cả nhà hàng - ${filters.location}`;
    return `Ẩm thực "${filters.cuisine}" - ${filters.location}`;
  };

  const getFilterSummary = () => {
    const summary = [];
    if (filters.location !== 'Hồ Chí Minh') summary.push(`Khu vực: ${filters.location}`);
    if (filters.cuisine !== 'Tất cả') summary.push(`Loại ẩm thực: ${filters.cuisine}`);
    if (filters.distance !== 'all') {
      if (filters.distance === 'near') summary.push('Khoảng cách: Dưới 2km');
      if (filters.distance === 'under5km') summary.push('Khoảng cách: Dưới 5km');
      if (filters.distance === 'under10km') summary.push('Khoảng cách: Dưới 10km');
    }
    if (filters.rating !== 'all') {
      if (filters.rating === 'above4') summary.push('Xếp hạng: Trên 4 sao');
      if (filters.rating === 'above3') summary.push('Xếp hạng: Trên 3 sao');
    }
    if (filters.sort !== 'all') {
      if (filters.sort === 'reputable') summary.push('Nhà hàng uy tín');
      if (filters.sort === 'hot-deals') summary.push('Ưu đãi hot');
      if (filters.sort === 'latest') summary.push('Mới nhất');
    }
    return summary.length > 0 ? `Đang lọc: ${summary.join(', ')}` : '';
  };

  const renderRecentlyViewedRestaurants = () => {
    const allViewedRestaurants = Object.values(recentlyViewed || {}).flat();

    if (allViewedRestaurants.length === 0) {
      return <div className="no-results">Bạn chưa xem nhà hàng nào.</div>;
    }

    return (
      <div className="restaurants-grid">
        {allViewedRestaurants.map(restaurant => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    );
  };

  return (
    <div className="restaurant-page">
      <div className="page-header">
        <h1>{getPageTitle()}</h1>
        <p>Khám phá danh sách nhà hàng phù hợp với bạn nhất.</p>
      </div>

      <div className="search-filter-section">
        <div className="search-section">
          <div className="search-wrapper">
            <div className="location-select-wrapper">
              <span className="location-icon">📍</span>
              <select
                className="location-select"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                {locations.map(location => (
                  <option key={location.LocationID} value={location.LocationName}>
                    {location.LocationName}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Bạn muốn đặt chỗ đi đâu"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchTerm);
                  }
                }}
                onFocus={() => setShowSuggestions(suggestions.length > 0 || suggestedItems.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && (suggestions.length > 0 || suggestedItems.length > 0) && (
                <div className="suggestions-dropdown">
                  {suggestions.length > 0 && (
                    <div className="suggestions-section">
                      <h4>TỪ KHÓA</h4>
                      <ul className="keyword-suggestions">
                        {suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestedItems.length > 0 && (
                    <div className="suggestions-section">
                      <h4>GỢI Ý</h4>
                      <ul className="restaurant-suggestions">
                        {suggestedItems.map(item => (
                          <li
                            key={item.id}
                            className="restaurant-suggestion-item"
                            onClick={() => handleRestaurantSuggestionClick(item.id)}
                          >
                            <img
                              src={item.image || '/images/placeholder.jpg'}
                              alt={item.name}
                              className="restaurant-suggestion-image"
                              onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                            />
                            <div className="restaurant-suggestion-details">
                              <h5>{item.name}</h5>
                              <div className="restaurant-suggestion-meta">
                                {typeof item.rating !== 'undefined' && !isNaN(parseFloat(item.rating)) && (
                                  <>
                                    <span className="stars">
                                      {'★'.repeat(Math.round(parseFloat(item.rating))) +
                                        '☆'.repeat(5 - Math.round(parseFloat(item.rating)))}
                                    </span>
                                    <span className="rating-value">{parseFloat(item.rating).toFixed(1)}</span>
                                  </>
                                )}
                                {item.cuisine && <span className="cuisine">{item.cuisine}</span>}
                                {item.distance && <span className="distance">{item.distance} km</span>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="search-button" onClick={() => handleSearch(searchTerm)}>
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="filter-section">
          <select
            className="filter-select"
            value={filters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
          >
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filters.distance}
            onChange={(e) => handleFilterChange('distance', e.target.value)}
          >
            <option value="all">Tất cả khoảng cách</option>
            <option value="near">Gần tôi (dưới 2km)</option>
            <option value="under5km">Dưới 5km</option>
            <option value="under10km">Dưới 10km</option>
          </select>
          <select
            className="filter-select"
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="all">Tất cả xếp hạng</option>
            <option value="above4">Trên 4 sao</option>
            <option value="above3">Trên 3 sao</option>
          </select>
          <select
            className="filter-select"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            {sortFilters.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="reset-button" onClick={handleResetFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="results-info">
        Tìm thấy {filteredRestaurants.length} nhà hàng phù hợp
      </div>
      {getFilterSummary() && (
        <div className="filter-summary">
          {getFilterSummary()}
        </div>
      )}

      {loading && <div className="loading">Đang tải danh sách nhà hàng...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
        <div className="restaurant-list">
          {currentRestaurants.length > 0 ? (
            currentRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))
          ) : (
            <p>Không tìm thấy nhà hàng nào.</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="nav-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>
          {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map(page => (
            <button
              key={page}
              className={`page-button ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="nav-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Trang sau
          </button>
        </div>
      )}

      <div className="recently-viewed">
        <h2>Đã xem gần đây</h2>
        {renderRecentlyViewedRestaurants()}
      </div>
    </div>
  );
}

export default RestaurantPage;