import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/modules/filterBox.css';
import '../styles/modules/booth_categories.css';

function FilterBox() {
  const { filters = { location: '', distance: '', rating: '', cuisine: '' }, setFilters } = useApp();
  const [visibleFilterStart, setVisibleFilterStart] = useState(0);
  const [visibleCategoryStart, setVisibleCategoryStart] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const navigate = useNavigate();
  const filtersSliderRef = useRef(null);
  const categoriesSliderRef = useRef(null);

  // Danh sách các bộ lọc (chỉ giữ 3 bộ lọc chính)
  const filterOptions = [
    { id: 'location', name: 'Khu vực' },
    { id: 'distance', name: 'Khoảng cách' },
    { id: 'rating', name: 'Đánh giá' },
  ];

  // Danh sách các loại món ăn (booth categories) - đại diện cho bộ lọc "Loại hình nhà hàng"
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
    { id: 'chinese', name: 'Món Trung Hoa', icon: '🥟' },
  ];

  // Số lượng filter hiển thị cùng lúc
  const visibleFiltersCount = 3; // Vì chỉ có 3 bộ lọc, không cần cuộn ngang nữa

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

  const handleFilterChange = (filterId, value) => {
    if (!setFilters) return;
    setFilters({
      ...filters,
      [filterId]: value,
    });
  };

  const handleCuisineSelect = (cuisineId) => {
    if (!setFilters) return;
    setFilters({
      ...filters,
      cuisine: cuisineId,
    });
    navigate({
      pathname: '/restaurants',
      search: `?cuisine=${cuisineId}`,
    });
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
                value={filters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
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
        </div>
      </div>

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