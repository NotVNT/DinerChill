import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/modules/filterBox.css';

function FilterBox() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [visibleFilterStart, setVisibleFilterStart] = useState(0); // Bắt đầu từ filter đầu tiên
  const [isTransitioning, setIsTransitioning] = useState(false); // State mới để kiểm soát trạng thái chuyển đổi
  const navigate = useNavigate();
  const categoriesSliderRef = useRef(null);
  const filtersSliderRef = useRef(null);
  
  // Danh sách các bộ lọc
  const filterOptions = [
    // 5 mục lọc mặc định hiển thị đầu tiên
    { id: 'area', name: 'Khu vực' },
    { id: 'restaurant', name: 'Nhà hàng' },
    { id: 'price', name: 'Giá trung bình' },
    { id: 'food', name: 'Đồ ăn chính' },
    { id: 'suitable', name: 'Phù hợp' },
    { id: 'deal', name: 'Ưu đãi' },
    
    // Các mục lọc khác sẽ hiển thị khi người dùng kéo
    { id: 'private_room', name: 'Phòng riêng' },
    { id: 'daily_meal', name: 'Bữa ăn hằng ngày' },
    { id: 'company_party', name: 'Đặt tiệc công ty' },
    { id: 'private_area', name: 'Khu riêng' },
    { id: 'family_party', name: 'Đặt tiệc gia đình' },
    { id: 'business_type', name: 'Loại hình kinh doanh' },
    { id: 'service_style', name: 'Kiểu phục vụ' },
    { id: 'cuisine_style', name: 'Phong cách ẩm thực' },
  ];
  
  // Danh sách các loại món ăn
  const cuisineTypes = [
    { id: 'grilled', name: 'Nướng', icon: '🔥' },
    { id: 'seafood', name: 'Hải sản', icon: '🦐' },
    { id: 'asian', name: 'Quán nhậu', icon: '🍻' },
    { id: 'japanese', name: 'Món Nhật', icon: '🍱' },
    { id: 'vietnamese', name: 'Món Việt', icon: '🍜' },
    { id: 'korean', name: 'Món Hàn', icon: '🍲' },
    { id: 'vegetarian', name: 'Món chay', icon: '🥗' },
    { id: 'american', name: 'Món Châu Á', icon: '🥢' },
    { id: 'european', name: 'Món Châu Âu', icon: '🍕' }
  ];

  // Số lượng filter hiển thị cùng lúc
  const visibleFiltersCount = 5;
  
  // Tính toán các filter hiện đang hiển thị
  const visibleFilters = filterOptions.slice(visibleFilterStart, visibleFilterStart + visibleFiltersCount);
  
  // Hàm cuộn đến filter tiếp theo với khoảng trễ
  const showNextFilter = () => {
    // Nếu đang trong quá trình chuyển đổi hoặc đã ở cuối danh sách thì không làm gì
    if (isTransitioning || visibleFilterStart + visibleFiltersCount >= filterOptions.length) {
      return;
    }
    
    // Đánh dấu đang trong quá trình chuyển đổi
    setIsTransitioning(true);
    
    // Cuộn filtersSliderRef để tạo hiệu ứng trượt
    if (filtersSliderRef.current) {
      filtersSliderRef.current.scrollBy({
        left: 160, // Khoảng cách của một filter
        behavior: 'smooth'
      });
    }
    
    // Chờ một khoảng thời gian trước khi thực sự cập nhật state
    setTimeout(() => {
      setVisibleFilterStart(visibleFilterStart + 1);
      setIsTransitioning(false);
    }, 300); // Khoảng trễ 300ms - có thể điều chỉnh
  };
  
  // Hàm cuộn về filter trước đó với khoảng trễ
  const showPreviousFilter = () => {
    // Nếu đang trong quá trình chuyển đổi hoặc đã ở đầu danh sách thì không làm gì
    if (isTransitioning || visibleFilterStart <= 0) {
      return;
    }
    
    // Đánh dấu đang trong quá trình chuyển đổi
    setIsTransitioning(true);
    
    // Cuộn filtersSliderRef để tạo hiệu ứng trượt
    if (filtersSliderRef.current) {
      filtersSliderRef.current.scrollBy({
        left: -160, // Khoảng cách của một filter
        behavior: 'smooth'
      });
    }
    
    // Chờ một khoảng thời gian trước khi thực sự cập nhật state
    setTimeout(() => {
      setVisibleFilterStart(visibleFilterStart - 1);
      setIsTransitioning(false);
    }, 300); // Khoảng trễ 300ms - có thể điều chỉnh
  };

  // Hàm kiểm tra có thể cuộn về filter trước không
  const canScrollLeft = visibleFilterStart > 0 && !isTransitioning;
  
  // Hàm kiểm tra có thể cuộn đến filter tiếp theo không
  const canScrollRight = visibleFilterStart + visibleFiltersCount < filterOptions.length && !isTransitioning;

  const handleFilterChange = (filterId, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterId]: value
    });
  };

  const handleCuisineSelect = (cuisineId) => {
    navigate(`/search?cuisine=${cuisineId}`);
  };

  const handleFilterClick = () => {
    const params = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    navigate(`/search?${params.toString()}`);
  };

  // Hàm xử lý scroll cho categories slider
  const scrollCategories = (direction) => {
    if (categoriesSliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoriesSliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="filter-box">
      <div className="filters-container">
        <button 
          className={`filter-nav prev ${canScrollLeft ? '' : 'hidden'}`}
          onClick={showPreviousFilter}
          disabled={isTransitioning}
        >
          <span>←</span>
        </button>
        
        <div className="filter-section" ref={filtersSliderRef}>
          {visibleFilters.map((filter) => (
            <div key={filter.id} className="filter-dropdown">
              <select
                className="filter-select"
                value={selectedFilters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              >
                <option value="">{filter.name}</option>
                <option value="option1">Tùy chọn 1</option>
                <option value="option2">Tùy chọn 2</option>
                <option value="option3">Tùy chọn 3</option>
              </select>
              <span className="dropdown-icon">▼</span>
            </div>
          ))}
          
          <button 
            className={`filter-nav next custom-position ${canScrollRight ? '' : 'hidden'}`}
            onClick={showNextFilter}
            disabled={isTransitioning}
          >
            <span>→</span>
          </button>
          
          <div className="filter-button">
            <button 
              className="filter-btn"
              onClick={handleFilterClick}
            >
              <span className="filter-icon">⚙️</span> Lọc
            </button>
          </div>
        </div>
      </div>

      <div className="cuisine-categories">
        <button 
          className="category-nav prev" 
          onClick={() => scrollCategories('left')}
        >
          <span>←</span>
        </button>
        
        <div className="categories-slider" ref={categoriesSliderRef}>
          {cuisineTypes.map((cuisine) => (
            <div 
              key={cuisine.id} 
              className="category-item" 
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              <div className="category-icon">{cuisine.icon}</div>
              <span className="category-name">{cuisine.name}</span>
            </div>
          ))}
        </div>
        
        <button 
          className="category-nav next" 
          onClick={() => scrollCategories('right')}
        >
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default FilterBox; 