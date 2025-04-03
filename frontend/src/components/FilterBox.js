import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/modules/filterBox.css';
import '../styles/modules/booth_categories.css';

function FilterBox() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [visibleFilterStart, setVisibleFilterStart] = useState(0); // Bắt đầu từ filter đầu tiên
  const [visibleCategoryStart, setVisibleCategoryStart] = useState(0); // Bắt đầu từ category đầu tiên
  const [isTransitioning, setIsTransitioning] = useState(false); // State mới để kiểm soát trạng thái chuyển đổi
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false); // State cho categories
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const navigate = useNavigate();
  const filtersSliderRef = useRef(null);
  const categoriesSliderRef = useRef(null);
  
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
  
  // Danh sách các loại món ăn (booth categories)
  const cuisineTypes = [
    { id: 'buffet', name: 'Buffet', icon: '🍱' },
    { id: 'hotpot', name: 'Lẩu', icon: '🍲' },
    { id: 'grilled', name: 'Nướng', icon: '🔥' },
    { id: 'seafood', name: 'Hải sản', icon: '🦐' },
    { id: 'beer', name: 'Quán nhậu', icon: '🍻' },
    { id: 'japanese', name: 'Món Nhật', icon: '🍣' },
    { id: 'vietnamese', name: 'Món Việt', icon: '🍜' },
    { id: 'korean', name: 'Món Hàn', icon: '🍲' },
    { id: 'vegetarian', name: 'Món chay', icon: '🥗' },
    { id: 'asian', name: 'Món Châu Á', icon: '🥢' },
    { id: 'european', name: 'Món Châu Âu', icon: '🍕' },
    { id: 'thai', name: 'Món Thái', icon: '🍸' },
    { id: 'chinese', name: 'Món Trung Hoa', icon: '🥟' }
  ];
  
  // Số lượng filter hiển thị cùng lúc
  const visibleFiltersCount = 5;
  
  // Số lượng categories hiển thị cùng lúc
  const visibleCategoriesCount = 8;
  
  // Tính toán các filter hiện đang hiển thị
  const visibleFilters = filterOptions.slice(visibleFilterStart, visibleFilterStart + visibleFiltersCount);
  
  // Tính toán các categories hiện đang hiển thị
  const visibleCategories = cuisineTypes.slice(visibleCategoryStart, visibleCategoryStart + visibleCategoriesCount);
  
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
    }, 300); // Khoảng trễ 300ms
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

  const handleFilterClick = () => {
    const params = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    navigate(`/search?${params.toString()}`);
  };

  // Hàm xử lý khi người dùng chọn loại món ăn
  const handleCuisineSelect = (cuisineId) => {
    navigate({
      pathname: '/restaurants',
      search: `?cuisine=${cuisineId}`
    });
  };
  
  // Hàm scroll categories left/right
  const scrollCategories = (direction) => {
    if (isCategoryTransitioning) return;
    
    setIsCategoryTransitioning(true);
    
    if (direction === 'left' && visibleCategoryStart > 0) {
      if (categoriesSliderRef.current) {
        categoriesSliderRef.current.scrollBy({
          left: -200,
          behavior: 'smooth'
        });
      }
      
      setTimeout(() => {
        setVisibleCategoryStart(visibleCategoryStart - 1);
        setIsCategoryTransitioning(false);
        // Check if we've scrolled all the way to the start
        if (visibleCategoryStart <= 1) {
          setIsScrolled(false);
        }
        // Always set isAtEnd to false when scrolling left
        setIsAtEnd(false);
      }, 300);
    } else if (direction === 'right' && visibleCategoryStart + visibleCategoriesCount < cuisineTypes.length) {
      if (categoriesSliderRef.current) {
        categoriesSliderRef.current.scrollBy({
          left: 200,
          behavior: 'smooth'
        });
      }
      
      setTimeout(() => {
        const newPosition = visibleCategoryStart + 1;
        setVisibleCategoryStart(newPosition);
        setIsCategoryTransitioning(false);
        // Explicitly set isScrolled to true when scrolling right
        setIsScrolled(true);
        
        // Check if we've reached the end of the categories
        if (newPosition + visibleCategoriesCount >= cuisineTypes.length) {
          setIsAtEnd(true);
        }
      }, 300);
    } else {
      setIsCategoryTransitioning(false);
    }
  };

  // Function to handle scroll events on the categories slider
  const handleCategoriesScroll = () => {
    if (categoriesSliderRef.current) {
      // Check if scrolled at all (scrollLeft > 0)
      setIsScrolled(categoriesSliderRef.current.scrollLeft > 0);
    }
  };

  // Add event listener when component mounts
  useEffect(() => {
    const slider = categoriesSliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleCategoriesScroll);
      return () => {
        slider.removeEventListener('scroll', handleCategoriesScroll);
      };
    }
  }, []);

  // Also check for the end when component mounts or categories update
  useEffect(() => {
    // Check if we're at the end of the list on initial load
    if (visibleCategoryStart + visibleCategoriesCount >= cuisineTypes.length) {
      setIsAtEnd(true);
    } else {
      setIsAtEnd(false);
    }
  }, [visibleCategoryStart, visibleCategoriesCount, cuisineTypes.length]);

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
      
      {/* Phần booth categories product */}
      <div className="booth-categories">
        <button 
          className={`category-nav prev ${!isScrolled ? 'hidden' : ''}`}
          onClick={() => scrollCategories('left')}
        >
          <span>←</span>
        </button>
        
        <div className="categories-slider" ref={categoriesSliderRef}>
          {visibleCategories.map((cuisine) => (
            <div 
              key={cuisine.id} 
              className="category-item" 
              onClick={() => handleCuisineSelect(cuisine.id)}
            >
              <div className="category-icon-wrapper">
                <span className="category-icon">{cuisine.icon}</span>
              </div>
              <span className="category-name">{cuisine.name}</span>
            </div>
          ))}
        </div>
        
        <button 
          className={`category-nav next ${isAtEnd ? 'hidden' : ''}`}
          onClick={() => scrollCategories('right')}
        >
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default FilterBox; 