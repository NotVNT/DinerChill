import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { useApp } from '../context/AppContext';
import '../styles/RestaurantPage.css';

function RestaurantPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: 'Hồ Chí Minh',
    cuisine: 'all',
    distance: 'all',
    rating: 'all',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const {
    hotRestaurants,
    recommendedRestaurants,
    locations,
    restaurants: nearbyRestaurants,
  } = useApp();

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
    'Việt Nam',
    'Món Thái',
    'Trung Hoa',
    'Tiệc cưới',
    'Đồ uống',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const path = location.pathname.split('/')[2];
        let cuisineFilter = '';
        let restaurantList = [];

        if (location.pathname.includes('/lau')) {
          cuisineFilter = 'Lẩu';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/buffet')) {
          cuisineFilter = 'Buffet';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/hai-san')) {
          cuisineFilter = 'Hải sản';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/lau-nuong')) {
          cuisineFilter = 'Nướng';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/quan-nhau')) {
          cuisineFilter = 'Quán Nhậu';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/mon-chay')) {
          cuisineFilter = 'Chay';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/do-tiec')) {
          cuisineFilter = 'Đồ tiệc';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/han-quoc')) {
          cuisineFilter = 'Hàn Quốc';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/nhat-ban')) {
          cuisineFilter = 'Nhật Bản';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/mon-viet')) {
          cuisineFilter = 'Việt Nam';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/mon-thai')) {
          cuisineFilter = 'Món Thái';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/mon-trung-hoa')) {
          cuisineFilter = 'Trung Hoa';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/tiec-cuoi')) {
          cuisineFilter = 'Tiệc cưới';
          restaurantList = hotRestaurants;
        } else if (location.pathname.includes('/do-uong')) {
          cuisineFilter = 'Đồ uống';
          restaurantList = hotRestaurants;
        } else if (path === 'hot') {
          restaurantList = hotRestaurants;
        } else if (path === 'nearby') {
          restaurantList = nearbyRestaurants;
        } else if (path === 'recommended') {
          restaurantList = recommendedRestaurants;
        } else {
          restaurantList = hotRestaurants;
        }

        const filteredByCuisine = cuisineFilter
          ? restaurantList.filter(restaurant => restaurant.cuisine === cuisineFilter)
          : restaurantList;

        setRestaurants(filteredByCuisine);

        const query = new URLSearchParams(location.search);
        const search = query.get('search') || '';
        const loc = query.get('location') || 'Hồ Chí Minh';
        setSearchTerm(search);
        setSelectedFilters(prev => ({
          ...prev,
          location: loc,
        }));
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchData();
  }, [location, hotRestaurants, recommendedRestaurants, nearbyRestaurants]);

  useEffect(() => {
    let filtered = [...restaurants];

    if (selectedFilters.location !== 'Hồ Chí Minh') {
      filtered = filtered.filter(r => r.location === selectedFilters.location);
    }

    if (selectedFilters.cuisine !== 'Tất cả') {
      filtered = filtered.filter(r => r.cuisine === selectedFilters.cuisine);
    }

    if (selectedFilters.distance !== 'all') {
      filtered = filtered.filter(r => {
        const distance = r.distance || 0;
        if (selectedFilters.distance === 'near') return distance <= 2;
        if (selectedFilters.distance === 'under5km') return distance <= 5;
        if (selectedFilters.distance === 'under10km') return distance <= 10;
        return true;
      });
    }

    if (selectedFilters.rating !== 'all') {
      filtered = filtered.filter(r => {
        const rating = r.rating || 0;
        if (selectedFilters.rating === 'above4') return rating >= 4;
        if (selectedFilters.rating === 'above3') return rating >= 3;
        return true;
      });
    }

    if (filter === 'reputable') {
      filtered = filtered.filter(r => r.rating >= 4.5);
    } else if (filter === 'hot-deals') {
      filtered = filtered.filter(r => r.discount);
    } else if (filter === 'latest') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredRestaurants(filtered);
    setCurrentPage(1);
  }, [restaurants, filter, selectedFilters]);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      setSuggestedItems([]);
      setShowSuggestions(false);
      return;
    }

    const itemNameSuggestions = restaurants
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => item.name);

    const allSuggestions = [...new Set(itemNameSuggestions)].slice(0, 5);

    const matchingItems = restaurants
      .filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cuisine && item.cuisine.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .slice(0, 3);

    setSuggestions(allSuggestions);
    setSuggestedItems(matchingItems);
    setShowSuggestions(allSuggestions.length > 0 || matchingItems.length > 0);
  }, [searchTerm, restaurants]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleRestaurantSuggestionClick = (itemId) => {
    setShowSuggestions(false);
    navigate(`/restaurant/${itemId}`);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      location: 'Hồ Chí Minh',
      cuisine: 'all',
      distance: 'all',
      rating: 'all',
    });
    setFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    navigate(`/nha-hang?search=${encodeURIComponent(term)}&location=${encodeURIComponent(selectedFilters.location)}`);
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
    window.scrollTo(0, 0);
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[2];
    if (path === 'hot') return 'Top nhà hàng ưu đãi Hot';
    if (path === 'nearby') return 'Nhà hàng gần bạn';
    if (path === 'recommended') return 'Nhà hàng nổi bật';
    if (location.pathname.includes('/lau')) return 'Nhà hàng Lẩu';
    if (location.pathname.includes('/buffet')) return 'Nhà hàng Buffet';
    if (location.pathname.includes('/hai-san')) return 'Nhà hàng Hải sản';
    if (location.pathname.includes('/lau-nuong')) return 'Nhà hàng Lẩu Nướng';
    if (location.pathname.includes('/quan-nhau')) return 'Quán Nhậu';
    if (location.pathname.includes('/mon-chay')) return 'Nhà hàng Món Chay';
    if (location.pathname.includes('/do-tiec')) return 'Nhà hàng Đồ Tiệc';
    if (location.pathname.includes('/han-quoc')) return 'Nhà hàng Hàn Quốc';
    if (location.pathname.includes('/nhat-ban')) return 'Nhà hàng Nhật Bản';
    if (location.pathname.includes('/mon-viet')) return 'Nhà hàng Món Việt';
    if (location.pathname.includes('/mon-thai')) return 'Nhà hàng Món Thái';
    if (location.pathname.includes('/mon-trung-hoa')) return 'Nhà hàng Trung Hoa';
    if (location.pathname.includes('/tiec-cuoi')) return 'Nhà hàng Tiệc Cưới';
    if (location.pathname.includes('/do-uong')) return 'Nhà hàng Đồ Uống';
    return 'Nhà hàng';
  };

  const getFilterSummary = () => {
    const filters = [];
    if (selectedFilters.location !== 'Hồ Chí Minh') filters.push(`Khu vực: ${selectedFilters.location}`);
    if (selectedFilters.cuisine !== 'Tất cả') filters.push(`Loại ẩm thực: ${selectedFilters.cuisine}`);
    if (selectedFilters.distance !== 'all') {
      if (selectedFilters.distance === 'near') filters.push('Khoảng cách: Dưới 2km');
      if (selectedFilters.distance === 'under5km') filters.push('Khoảng cách: Dưới 5km');
      if (selectedFilters.distance === 'under10km') filters.push('Khoảng cách: Dưới 10km');
    }
    if (selectedFilters.rating !== 'all') {
      if (selectedFilters.rating === 'above4') filters.push('Xếp hạng: Trên 4 sao');
      if (selectedFilters.rating === 'above3') filters.push('Xếp hạng: Trên 3 sao');
    }
    if (filter !== 'all') {
      if (filter === 'reputable') filters.push('Nhà hàng uy tín');
      if (filter === 'hot-deals') filters.push('Ưu đãi hot');
      if (filter === 'latest') filters.push('Mới nhất');
    }
    return filters.length > 0 ? `Đang lọc: ${filters.join(', ')}` : '';
  };

  return (
    <>
      <style>{`
        .restaurant-page {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .page-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }
        .page-header p {
          font-size: 14px;
          color: #666;
        }
        .search-filter-section {
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #e31837;
        }
        .search-section {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .search-wrapper {
          display: flex;
          align-items: stretch;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 25px;
          overflow: hidden;
          width: 100%;
          max-width: 800px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          height: 44px;
        }
        .location-select-wrapper {
          display: flex;
          align-items: center;
          padding: 0 10px;
          border-right: 1px solid #ddd;
          background-color: #fff;
          border-top-left-radius: 25px;
          border-bottom-left-radius: 25px;
        }
        .location-icon {
          margin-right: 5px;
          font-size: 16px;
          color: #e31837;
        }
        .location-select {
          border: none;
          background: none;
          padding: 10px 5px;
          font-size: 16px;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          cursor: pointer;
          background: url('data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 5px center;
          background-size: 12px;
          padding-right: 25px;
          height: 100%;
          line-height: normal;
        }
        .location-select:focus {
          outline: none;
        }
        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-input-wrapper input {
          width: 100%;
          border: none;
          padding: 0 10px;
          font-size: 16px;
          outline: none;
          height: 100%;
          line-height: normal;
          color: #333;
        }
        .search-input-wrapper input::placeholder {
          color: #999;
        }
        .search-button {
          background-color: #e31837;
          color: white;
          border: none;
          padding: 0 20px;
          font-size: 16px;
          cursor: pointer;
          border-radius: 0 25px 25px 0;
          transition: background-color 0.2s;
          height: 100%;
          line-height: normal;
          display: flex;
          align-items: center;
        }
        .search-button:hover {
          background-color: #c91632;
        }
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }
        .suggestions-section {
          padding: 10px;
        }
        .suggestions-section h4 {
          margin: 0 0 5px;
          font-size: 14px;
          color: #666;
        }
        .keyword-suggestions,
        .restaurant-suggestions {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .suggestion-item {
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
        }
        .suggestion-item:hover {
          background-color: #f0f0f0;
        }
        .restaurant-suggestion-item {
          display: flex;
          align-items: center;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
        }
        .restaurant-suggestion-item:hover {
          background-color: #f0f0f0;
        }
        .restaurant-suggestion-image {
          width: 40px;
          height: 40px;
          border-radius: 5px;
          margin-right: 10px;
        }
        .restaurant-suggestion-details {
          flex: 1;
        }
        .restaurant-suggestion-details h5 {
          margin: 0;
          font-size: 14px;
          color: #333;
        }
        .restaurant-suggestion-meta {
          display: flex;
          gap: 10px;
          font-size: 12px;
          color: #666;
        }
        .stars {
          color: #f5a623;
        }
        .rating-value {
          margin-left: 5px;
        }
        .cuisine {
          margin-left: 5px;
        }
        .distance {
          margin-left: 5px;
        }
        .filter-section {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
          margin-top: 15px;
        }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          background: #fff;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background: url('data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 5px center;
          background-size: 12px;
          padding-right: 25px;
          min-width: 150px;
        }
        .filter-button, .reset-button {
          padding: 8px 20px;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .filter-button {
          background-color: #e31837;
          color: white;
        }
        .filter-button:hover {
          background-color: #c91632;
        }
        .reset-button {
          background-color: #666;
          color: white;
          margin-left: 10px;
        }
        .reset-button:hover {
          background-color: #555;
        }
        .filter-box {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .filter-tab {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background-color: #f5f5f5;
          border-radius: 20px;
          transition: background-color 0.2s;
        }
        .filter-tab:hover {
          background-color: #e0e0e0;
        }
        .filter-tab.active {
          background-color: #e31837;
          color: white;
        }
        .results-info {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          text-align: center;
        }
        .filter-summary {
          font-size: 14px;
          color: #e31837;
          margin-bottom: 20px;
          text-align: center;
        }
        .restaurant-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pagination {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        .page-button, .nav-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #fff;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .page-button:hover, .nav-button:hover {
          background-color: #f0f0f0;
        }
        .page-button.active {
          background-color: #e31837;
          color: white;
          border-color: #e31837;
        }
        .nav-button:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          color: #999;
        }
      `}</style>

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
                  value={selectedFilters.location}
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
                                        {'★'.repeat(Math.round(parseFloat(item.rating))) + '☆'.repeat(5 - Math.round(parseFloat(item.rating)))}
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
              value={selectedFilters.cuisine}
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
              value={selectedFilters.distance}
              onChange={(e) => handleFilterChange('distance', e.target.value)}
            >
              <option value="all">Tất cả khoảng cách</option>
              <option value="near">Gần tôi (dưới 2km)</option>
              <option value="under5km">Dưới 5km</option>
              <option value="under10km">Dưới 10km</option>
            </select>
            <select
              className="filter-select"
              value={selectedFilters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="all">Tất cả xếp hạng</option>
              <option value="above4">Trên 4 sao</option>
              <option value="above3">Trên 3 sao</option>
            </select>
            <button className="filter-button" onClick={() => setCurrentPage(1)}>
              Lọc
            </button>
            <button className="reset-button" onClick={handleResetFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>

        <div className="filter-box">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-tab ${filter === 'reputable' ? 'active' : ''}`}
            onClick={() => setFilter('reputable')}
          >
            Nhà hàng uy tín
          </button>
          <button
            className={`filter-tab ${filter === 'hot-deals' ? 'active' : ''}`}
            onClick={() => setFilter('hot-deals')}
          >
            Ưu đãi hot
          </button>
          <button
            className={`filter-tab ${filter === 'latest' ? 'active' : ''}`}
            onClick={() => setFilter('latest')}
          >
            Mới nhất
          </button>
        </div>

        <div className="results-info">
          Tìm thấy {filteredRestaurants.length} nhà hàng phù hợp
        </div>
        {getFilterSummary() && (
          <div className="filter-summary">
            {getFilterSummary()}
          </div>
        )}

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
      </div>
    </>
  );
}

export default RestaurantPage;