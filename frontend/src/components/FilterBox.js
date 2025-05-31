import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/modules/filterBox.css';
import '../styles/modules/booth_categories.css';

function FilterBox() {
  const { filters = { location: '', distance: '', rating: '', cuisine: '', price: '', operatingHours: '' }, setFilters } = useApp();
  const [localFilters, setLocalFilters] = useState(filters); // Local state for filter values
  const [visibleFilterStart, setVisibleFilterStart] = useState(0);
  const [visibleCategoryStart, setVisibleCategoryStart] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const navigate = useNavigate();
  const filtersSliderRef = useRef(null);
  const categoriesSliderRef = useRef(null);

  // Update local filters when global filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Danh sách các bộ lọc (thêm 2 bộ lọc mới: giá và giờ hoạt động)
  const filterOptions = [
    { id: 'location', name: 'Khu vực' },
    { id: 'distance', name: 'Khoảng cách' },
    { id: 'price', name: 'Mức giá' },
    { id: 'rating', name: 'Đánh giá' },
    { id: 'operatingHours', name: 'Giờ hoạt động' },
  ];

  // Danh sách các loại món ăn (booth categories) - đại diện cho bộ lọc "Loại hình nhà hàng"
  const cuisineTypes = [
    { id: 'buffet', name: 'Buffet', icon: '🍱', route: '/buffet' },
    { id: 'lau', name: 'Lẩu', icon: '🍲', route: '/lau' },
    { id: 'nuong', name: 'Nướng', icon: '🔥', route: '/lau-nuong' },
    { id: 'hai-san', name: 'Hải sản', icon: '🦐', route: '/hai-san' },
    { id: 'quan-nhau', name: 'Quán nhậu', icon: '🍻', route: '/quan-nhau' },
    { id: 'nhat-ban', name: 'Món Nhật', icon: '🍣', route: '/nhat-ban' },
    { id: 'mon-viet', name: 'Món Việt', icon: '🍜', route: '/mon-viet' },
    { id: 'han-quoc', name: 'Món Hàn', icon: '🍲', route: '/han-quoc' },
    { id: 'mon-chay', name: 'Món chay', icon: '🥗', route: '/mon-chay' },
    { id: 'mon-thai', name: 'Món Thái', icon: '🍸', route: '/mon-thai' },
    { id: 'mon-trung-hoa', name: 'Món Trung Hoa', icon: '🥟', route: '/mon-trung-hoa' },
    { id: 'do-tiec', name: 'Đồ tiệc', icon: '🍽️', route: '/do-tiec' },
    { id: 'tiec-cuoi', name: 'Tiệc cưới', icon: '💍', route: '/tiec-cuoi' },
    { id: 'do-uong', name: 'Đồ uống', icon: '🥤', route: '/do-uong' },
  ];

  // Số lượng filter hiển thị cùng lúc
  const visibleFiltersCount = 5; // Tăng lên 5 vì đã thêm 2 bộ lọc mới

  // Số lượng categories hiển thị cùng lúc
  const visibleCategoriesCount = 8;

  // Tính toán các filter hiện đang hiển thị
  const visibleFilters = filterOptions.slice(
    visibleFilterStart,
    visibleFilterStart + visibleFiltersCount
  );

  // Tính toán các categories hiện đang hiển thị
  const visibleCategories = cuisineTypes.slice(
    visibleCategoryStart,
    visibleCategoryStart + visibleCategoriesCount
  );

  const showNextFilter = () => {
    if (isTransitioning || visibleFilterStart + visibleFiltersCount >= filterOptions.length) {
      return;
    }
    setIsTransitioning(true);
    if (filtersSliderRef.current) {
      filtersSliderRef.current.scrollBy({
        left: 160,
        behavior: 'smooth',
      });
    }
    setTimeout(() => {
      setVisibleFilterStart(visibleFilterStart + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const showPreviousFilter = () => {
    if (isTransitioning || visibleFilterStart <= 0) {
      return;
    }
    setIsTransitioning(true);
    if (filtersSliderRef.current) {
      filtersSliderRef.current.scrollBy({
        left: -160,
        behavior: 'smooth',
      });
    }
    setTimeout(() => {
      setVisibleFilterStart(visibleFilterStart - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const canScrollLeft = visibleFilterStart > 0 && !isTransitioning;
  const canScrollRight =
    visibleFilterStart + visibleFiltersCount < filterOptions.length && !isTransitioning;

  // Handle local filter changes without applying them immediately
  const handleLocalFilterChange = (filterId, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  // Apply all filters at once
  const applyFilters = () => {
    if (!setFilters) return;
    
    // Apply filters to context
    setFilters(localFilters);
    
    // Create query parameters for URL
    const params = new URLSearchParams();
    
    // Add all non-empty and non-default filters to query params
    if (localFilters.location && localFilters.location !== '') {
      params.append('location', localFilters.location);
    }
    
    if (localFilters.distance && localFilters.distance !== 'all') {
      params.append('distance', localFilters.distance);
    }
    
    if (localFilters.price && localFilters.price !== 'all') {
      params.append('price', localFilters.price);
    }
    
    if (localFilters.rating && localFilters.rating !== 'all') {
      params.append('rating', localFilters.rating);
    }
    
    if (localFilters.operatingHours && localFilters.operatingHours !== 'all') {
      params.append('operatingHours', localFilters.operatingHours);
    }
    
    if (localFilters.cuisine && localFilters.cuisine !== 'all') {
      params.append('cuisine', localFilters.cuisine);
    }
    
    // Navigate to filter results page with query parameters
    navigate(`/filter-results?${params.toString()}`);
  };

  // Reset all filters to default values
  const resetFilters = () => {
    const defaultFilters = {
      location: '',
      distance: 'all',
      cuisine: 'all',
      rating: 'all',
      price: 'all',
      operatingHours: 'all',
      keyword: '',
    };
    setLocalFilters(defaultFilters);
    if (setFilters) {
      setFilters(defaultFilters);
    }
  };

  const handleCuisineSelect = (cuisineId) => {
    if (!setFilters) return;
    
    // Update both local and global filters
    const updatedFilters = {
      ...localFilters,
      cuisine: cuisineId,
    };
    
    setLocalFilters(updatedFilters);
    setFilters(updatedFilters);
    
    const selectedCuisine = cuisineTypes.find(c => c.id === cuisineId);
    if (selectedCuisine && selectedCuisine.route) {
      navigate(selectedCuisine.route);
    }
  };

  const scrollCategories = (direction) => {
    if (isCategoryTransitioning) return; // Sửa từ ifSummon thành if và thêm dấu chấm phẩy

    setIsCategoryTransitioning(true);

    if (direction === 'left' && visibleCategoryStart > 0) {
      if (categoriesSliderRef.current) {
        categoriesSliderRef.current.scrollBy({
          left: -200,
          behavior: 'smooth',
        });
      }
      setTimeout(() => {
        setVisibleCategoryStart(visibleCategoryStart - 1);
        setIsCategoryTransitioning(false);
        if (visibleCategoryStart <= 1) {
          setIsScrolled(false);
        }
        setIsAtEnd(false);
      }, 300);
    } else if (
      direction === 'right' &&
      visibleCategoryStart + visibleCategoriesCount < cuisineTypes.length
    ) {
      if (categoriesSliderRef.current) {
        categoriesSliderRef.current.scrollBy({
          left: 200,
          behavior: 'smooth',
        });
      }
      setTimeout(() => {
        const newPosition = visibleCategoryStart + 1;
        setVisibleCategoryStart(newPosition);
        setIsCategoryTransitioning(false);
        setIsScrolled(true);
        if (newPosition + visibleCategoriesCount >= cuisineTypes.length) {
          setIsAtEnd(true);
        }
      }, 300);
    } else {
      setIsCategoryTransitioning(false);
    }
  };

  const handleCategoriesScroll = () => {
    if (categoriesSliderRef.current) {
      setIsScrolled(categoriesSliderRef.current.scrollLeft > 0);
    }
  };

  useEffect(() => {
    const slider = categoriesSliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleCategoriesScroll);
      return () => {
        slider.removeEventListener('scroll', handleCategoriesScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (visibleCategoryStart + visibleCategoriesCount >= cuisineTypes.length) {
      setIsAtEnd(true);
    } else {
      setIsAtEnd(false);
    }
  }, [visibleCategoryStart, visibleCategoriesCount, cuisineTypes.length]);

  // Nếu filters hoặc setFilters không tồn tại, hiển thị thông báo lỗi
  if (!filters || !setFilters) {
    return <div>Lỗi: Không thể truy cập AppContext. Vui lòng kiểm tra AppProvider.</div>;
  }

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
                value={localFilters[filter.id] || ''}
                onChange={(e) => handleLocalFilterChange(filter.id, e.target.value)}
              >
                {filter.id === 'location' && (
                  <>
                    <option value="">{filter.name}</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </>
                )}
                {filter.id === 'distance' && (
                  <>
                    <option value="">{filter.name}</option>
                    <option value="all">Tất cả</option>
                    <option value="near">Gần nhất</option>
                    <option value="under5km">Dưới 5km</option>
                    <option value="under10km">Dưới 10km</option>
                  </>
                )}
                {filter.id === 'rating' && (
                  <>
                    <option value="">{filter.name}</option>
                    <option value="all">Tất cả</option>
                    <option value="above4">Trên 4 sao</option>
                    <option value="above3">Trên 3 sao</option>
                  </>
                )}
                {filter.id === 'price' && (
                  <>
                    <option value="">{filter.name}</option>
                    <option value="all">Tất cả</option>
                    <option value="low">Dưới 100.000đ</option>
                    <option value="medium">100.000đ - 300.000đ</option>
                    <option value="high">300.000đ - 500.000đ</option>
                    <option value="luxury">Trên 500.000đ</option>
                  </>
                )}
                {filter.id === 'operatingHours' && (
                  <>
                    <option value="">{filter.name}</option>
                    <option value="all">Tất cả</option>
                    <option value="morning">Buổi sáng (6:00 - 11:00)</option>
                    <option value="lunch">Buổi trưa (11:00 - 14:00)</option>
                    <option value="evening">Buổi tối (17:00 - 22:00)</option>
                    <option value="latenight">Khuya (22:00 - 2:00)</option>
                    <option value="24h">Mở cửa 24h</option>
                  </>
                )}
              </select>
              <span className="dropdown-icon">▼</span>
            </div>
          ))}

          <div className="filter-buttons">
            <button type="button" className="filter-action-btn apply-btn" onClick={applyFilters}>
              Lọc
            </button>
            <button type="button" className="filter-action-btn reset-btn" onClick={resetFilters}>
              Đặt lại
            </button>
          </div>

          <button
            className={`filter-nav next custom-position ${canScrollRight ? '' : 'hidden'}`}
            onClick={showNextFilter}
            disabled={isTransitioning}
          >
            <span>→</span>
          </button>
        </div>
      </div>

      <div className="booth-categories">
        <button
          className={`category-nav prev ${!isScrolled ? 'hidden' : ''}`}
          onClick={() => scrollCategories('left')}
          aria-label="Previous categories"
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
          aria-label="Next categories"
        >
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default FilterBox;