import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterBox from '../components/FilterBox';
import RestaurantCard from '../components/RestaurantCard';
import { useApp } from '../context/AppContext';
import '../styles/HomePage.css';

function HomePage() {
  const {
    hotRestaurants,
    hotProducts,
    recommendedRestaurants,
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
    loadMore,
  } = useApp();

  const renderSection = (title, subtitle, link, dataList, className, category) => (
    <div className={`section-wrapper ${className}`}>
      <div className="section-header">
        <div className="section-title">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <Link to={link} className="view-all">Xem tất cả</Link>
      </div>
      <div className="restaurant-grid">
        {dataList.length > 0 ? (
          dataList.map((item) => (
            <RestaurantCard key={item.id} restaurant={item} />
          ))
        ) : (
          <p>Không có dữ liệu để hiển thị.</p>
        )}
      </div>
      {dataList.length > 0 && (
        <button onClick={() => loadMore(category)} className="load-more-btn" disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải thêm'}
        </button>
      )}
    </div>
  );

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

  if (loading && !hotRestaurants.length) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="home-page">
      <SearchBar />
      <div className="container">
        <FilterBox />
      </div>

      <div className="hero-section">
        <h1>Chào mừng đến với DinerChill</h1>
        <p>Nền tảng đặt bàn nhà hàng trực tuyến số 1</p>
        <Link to="/restaurants" className="btn btn-primary">Khám phá nhà hàng</Link>
      </div>

      <div className="features-section">
        <h2>Tại sao chọn DinerChill?</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Dễ dàng đặt bàn</h3>
            <p>Đặt bàn chỉ với vài bước đơn giản</p>
          </div>
          <div className="feature">
            <h3>Nhiều lựa chọn</h3>
            <p>Hàng trăm nhà hàng chất lượng</p>
          </div>
          <div className="feature">
            <h3>Khuyến mãi hấp dẫn</h3>
            <p>Ưu đãi đặc biệt cho thành viên</p>
          </div>
        </div>
      </div>

      {renderRecentlyViewed()}

      {renderSection(
        'Top nhà hàng ưu đãi Hot',
        'Khám phá những Nhà hàng đang có ưu đãi hấp dẫn ngay',
        '/restaurants/hot',
        hotRestaurants,
        'hot-restaurants-section',
        'hotRestaurants'
      )}

      {renderSection(
        'Top sản phẩm ưu đãi Hot',
        'Khám phá những Sản phẩm đang có ưu đãi hấp dẫn ngay',
        '/products/hot',
        hotProducts,
        'hot-products-section',
        'hotProducts'
      )}

      {renderSection(
        'Nhà hàng được đề xuất',
        'Mời bạn lựa chọn và đặt bàn trước qua DinerChill để nhận ngay ưu đãi.',
        '/restaurants/recommended',
        recommendedRestaurants,
        'recommended-restaurants-section',
        'recommendedRestaurants'
      )}

      {renderSection(
        'Nhà hàng phù hợp đặt tiệc',
        'Với nhiều ưu đãi để đặt tiệc giúp bạn dễ dàng lựa chọn hơn!',
        '/restaurants/party',
        partyRestaurants,
        'party-restaurants-section',
        'partyRestaurants'
      )}

      {renderSection(
        'Địa danh nổi tiếng',
        'Cùng DinerChill giới thiệu những địa danh ẩm thực nổi tiếng tại Tp.HCM.',
        '/restaurants/locations',
        famousLocations,
        'famous-locations-section',
        'famousLocations'
      )}

      {renderSection(
        'Nhà hàng hải sản ngon nhất ưu đãi',
        'Mời bạn tham khảo ngay nhà hàng hải sản được yêu thích!',
        '/restaurants/seafood',
        seafoodRestaurants,
        'seafood-restaurants-section',
        'seafoodRestaurants'
      )}

      {renderSection(
        'Ăn món Trung ngon ở đâu?',
        'Xem ngay top quán Trung ngon được DinerChill lựa chọn!',
        '/restaurants/chinese',
        chineseRestaurants,
        'chinese-restaurants-section',
        'chineseRestaurants'
      )}

      {renderSection(
        'Phong cách ẩm thực phổ biến',
        'Với nhiều ưu đãi để ẩm thực giúp bạn dễ dàng lựa chọn hơn!',
        '/restaurants/cuisines',
        popularCuisines,
        'popular-cuisines-section',
        'popularCuisines'
      )}

      {renderSection(
        'Yêu thích nhất hàng tháng',
        'Khám phá nhà hàng được đặt chỗ nhiều nhất ngay',
        '/restaurants/monthly-favorites',
        monthlyFavorites,
        'monthly-favorites-section',
        'monthlyFavorites'
      )}

      {renderSection(
        'Tìm nhà hàng theo tiện ích',
        'Khám phá danh sách nhà hàng theo tiện ích phù hợp để lựa chọn địa điểm nhanh nhất',
        '/restaurants/amenities',
        amenitiesRestaurants,
        'amenities-restaurants-section',
        'amenitiesRestaurants'
      )}

      {renderSection(
        'Top nhà hàng cao cấp',
        'Khám phá nhà hàng cao cấp món ngon, không gian sang trọng, đẳng cấp ưu đãi tốt',
        '/restaurants/luxury',
        luxuryRestaurants,
        'luxury-restaurants-section',
        'luxuryRestaurants'
      )}

      {renderSection(
        'Đặt chỗ ưu tín',
        'Gợi ý nhà hàng ngon, chất lượng, đ.điểm đặt chỗ qua DinerChill',
        '/restaurants/trusted',
        trustedRestaurants,
        'trusted-restaurants-section',
        'trustedRestaurants'
      )}

      {renderSection(
        'Danh cho du khách',
        'Thưởng thức đặc sản Sài Gòn tại đây',
        '/restaurants/tourist',
        touristRestaurants,
        'tourist-restaurants-section',
        'touristRestaurants'
      )}

      {renderSection(
        'Trưa nay ăn gì?',
        'Mời bạn lựa chọn và đặt bàn trước qua DinerChill ngay',
        '/products/lunch',
        lunchSuggestions,
        'lunch-suggestions-section',
        'lunchSuggestions'
      )}

      {renderSection(
        'Mới nhất trên DinerChill',
        'Dự án đây là các nhà hàng mới nhất đặt chỗ qua DinerChill. Khám phá ngay!',
        '/restaurants/new-on-DinerChill',
        newOnDinerChill,
        'new-on-DinerChill-section',
        'newOnDinerChill'
      )}

      {renderSection(
        'Tin tức & Blog',
        'Những thông tin hữu ích về ẩm thực, sức khỏe, mẹo vặt,... cho bạn dễ dàng tìm hiểu đặt cập nhật liên tục tại DinerChill',
        '/blog',
        newsAndBlog,
        'news-and-blog-section',
        'newsAndBlog'
      )}
    </div>
  );
}

export default HomePage;