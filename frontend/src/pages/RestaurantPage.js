import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { useApp } from '../context/AppContext';
import '../styles/RestaurantPage.css';

// Chuyển cuisines ra ngoài component vì nó là dữ liệu tĩnh
const cuisines = [
  'Nhà hàng', 'Lẩu', 'Buffet', 'Hải sản', 'Lẩu & Nướng', 'Quán Nhậu', 'Món chay',
  'Đồ tiệc', 'Hàn Quốc', 'Nhật Bản', 'Món Âu', 'Món Việt', 'Món Thái',
  'Món Trung Hoa', 'Tiệc cưới'
];

function RestaurantPage() {
  const { restaurants: contextRestaurants, loading, error, recentlyViewed } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('Lẩu');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState([]); // Danh sách nhà hàng gợi ý
  const [showSuggestions, setShowSuggestions] = useState(false);
  const restaurantsPerPage = 6;
  
  const location = useLocation();
  const navigate = useNavigate();
  const { cuisineName } = useParams();
  const query = new URLSearchParams(location.search);
  
  const cuisineFromQuery = query.get('cuisine') || cuisineName || 'Lẩu';

  const restaurants = contextRestaurants;

  useEffect(() => {
    console.log('contextRestaurants:', contextRestaurants);
    console.log('restaurants:', restaurants);
    console.log('filteredRestaurants:', filteredRestaurants);
    console.log('cuisineFromQuery:', cuisineFromQuery);
    console.log('selectedCuisine:', selectedCuisine);
    console.log('cuisineName from params:', cuisineName);
    console.log('recentlyViewed:', recentlyViewed);
  }, [contextRestaurants, restaurants, filteredRestaurants, cuisineFromQuery, selectedCuisine, cuisineName, recentlyViewed]);

  useEffect(() => {
    setSelectedCuisine(cuisineFromQuery);
  }, [cuisineFromQuery]);

  useEffect(() => {
    if (restaurants.length === 0) {
      setFilteredRestaurants([]);
      return;
    }
    
    const results = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = selectedCuisine === '' || (restaurant.category && restaurant.category.toLowerCase() === selectedCuisine.toLowerCase());
      return matchesSearch && matchesCuisine;
    });
    
    setFilteredRestaurants(results);
  }, [searchTerm, selectedCuisine, restaurants]);

  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      setSuggestedRestaurants([]);
      setShowSuggestions(false);
      return;
    }

    // Tạo danh sách gợi ý từ khóa từ danh mục và tên nhà hàng
    const cuisineSuggestions = cuisines.filter(cuisine => 
      cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const restaurantNameSuggestions = restaurants
      .filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(restaurant => restaurant.name);

    // Gộp và loại bỏ trùng lặp
    const allSuggestions = [...new Set([...cuisineSuggestions, ...restaurantNameSuggestions])]
      .slice(0, 5); // Giới hạn 5 gợi ý từ khóa

    // Tạo danh sách gợi ý nhà hàng
    const matchingRestaurants = restaurants
      .filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.category && restaurant.category.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .slice(0, 3); // Giới hạn 3 nhà hàng gợi ý

    setSuggestions(allSuggestions);
    setSuggestedRestaurants(matchingRestaurants);
    setShowSuggestions(allSuggestions.length > 0 || matchingRestaurants.length > 0);
  }, [searchTerm, restaurants]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handleRestaurantSuggestionClick = (restaurantId) => {
    setShowSuggestions(false);
    navigate(`/restaurants/${restaurantId}`);
  };

  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = filteredRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    setCurrentPage(1);
  };
  
  const handleCuisineSelect = (cuisine) => {
    setSelectedCuisine(cuisine);
    setCurrentPage(1);
    navigate(`/cuisine/${cuisine.toLowerCase()}`);
  };

  const renderCuisineFilters = () => {
    return (
      <div className="category-section">
        <div className="categories">
          {cuisines.map(cuisine => (
            <button 
              key={cuisine} 
              className={`category ${selectedCuisine.toLowerCase() === cuisine.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleCuisineSelect(cuisine)}
            >
              <span className="category-label">{cuisine}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderRecentlyViewedRestaurants = () => {
    const allViewedRestaurants = Object.values(recentlyViewed).flat();

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

  const renderStars = (rating) => {
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(numericRating) || numericRating == null) return null;

    const stars = Math.round(numericRating);
    const fullStars = Math.min(Math.max(stars, 0), 5);
    const emptyStars = 5 - fullStars;
    return (
      <>
        <span className="stars">{'★'.repeat(fullStars) + '☆'.repeat(emptyStars)}</span>
        <span className="rating-value">{numericRating.toFixed(1)}</span>
      </>
    );
  };

  return (
    <div className="restaurant-page">
      <div className="header-section">
        <div className="dropdowns">
          <select className="dropdown">
            <option>Ăn uống</option>
            <option>Giải trí</option>
          </select>
          <select className="dropdown">
            <option>Hồ Chí Minh</option>
            <option>Hà Nội</option>
            <option>Đà Nẵng</option>
          </select>
        </div>
        <div className="search-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchTerm);
                }
              }}
              onFocus={() => setShowSuggestions(suggestions.length > 0 || suggestedRestaurants.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (suggestions.length > 0 || suggestedRestaurants.length > 0) && (
              <div className="suggestions-dropdown">
                {/* Phần gợi ý từ khóa */}
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
                {/* Phần gợi ý nhà hàng */}
                {suggestedRestaurants.length > 0 && (
                  <div className="suggestions-section">
                    <h4>GỢI Ý</h4>
                    <ul className="restaurant-suggestions">
                      {suggestedRestaurants.map(restaurant => (
                        <li
                          key={restaurant.id}
                          className="restaurant-suggestion-item"
                          onClick={() => handleRestaurantSuggestionClick(restaurant.id)}
                        >
                          <img
                            src={restaurant.image || 'https://via.placeholder.com/50x50'}
                            alt={restaurant.name}
                            className="restaurant-suggestion-image"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/50x50')}
                          />
                          <div className="restaurant-suggestion-details">
                            <h5>{restaurant.name}</h5>
                            <div className="restaurant-suggestion-meta">
                              {typeof restaurant.rating !== 'undefined' && !isNaN(parseFloat(restaurant.rating)) && renderStars(restaurant.rating)}
                              {restaurant.cuisine && <span className="cuisine">{restaurant.cuisine}</span>}
                              {restaurant.distance && <span className="distance">{restaurant.distance} km</span>}
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

      <div className="restaurants-list">
        <h2>Ẩm thực "{cuisineFromQuery}" - Hồ Chí Minh</h2>
        {renderCuisineFilters()}
        {loading && <div className="loading">Đang tải danh sách nhà hàng...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && (
          <div className="restaurants-grid">
            {currentRestaurants.length > 0 ? (
              currentRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))
            ) : (
              <div className="no-results">Không tìm thấy nhà hàng nào phù hợp</div>
            )}
          </div>
        )}

        {filteredRestaurants.length > 0 && !loading && !error && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={currentPage === index + 1 ? 'active' : ''}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="recently-viewed">
        <h2>Đã xem gần đây</h2>
        {renderRecentlyViewedRestaurants()}
      </div>
    </div>
  );
}

export default RestaurantPage;