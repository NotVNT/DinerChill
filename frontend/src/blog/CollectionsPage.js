import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { useApp } from "../context/AppContext";
import "../styles/collectionsPage.css";

const defaultCollections = [
  {
    id: 1,
    title: "Buffet Lẩu Ngon TP.HCM",
    image: process.env.PUBLIC_URL + "/uploads/collection-buffet.jpg",
    description: "Khám phá các nhà hàng buffet lẩu ngon, đa dạng phong cách tại TP.HCM, ưu đãi hấp dẫn."
  },
  {
    id: 2,
    title: "Ẩm Thực Hải Sản",
    image: process.env.PUBLIC_URL + "/uploads/collection-seafood.jpg",
    description: "Tổng hợp các nhà hàng hải sản tươi ngon, không gian sang trọng, giá tốt."
  },
  {
    id: 3,
    title: "Nhà Hàng Gia Đình",
    image: process.env.PUBLIC_URL + "/uploads/collection-family.jpg",
    description: "Không gian ấm cúng, phù hợp cho bữa ăn gia đình, liên hoan, sinh nhật."
  }
];

const CollectionsPage = ({ restaurantList, collectionList }) => {
  const { restaurants } = useApp();
  // Ưu tiên prop, nếu không có thì lấy từ context
  const collections = collectionList || defaultCollections;
  const realRestaurants = restaurantList || restaurants || [];

  return (
    <>
      <Header />
      <div className="collections-root">
        <div className="collections-container">
          <h1 className="collections-title">
            Khám phá các Bộ sưu tập trên Dinner Chill
          </h1>
          <div className="collections-list">
            {collections.map((col) => (
              <div key={col.id} className="collection-card">
                <img src={col.image} alt={col.title} className="collection-image" />
                <div className="collection-info">
                  <h3 className="collection-name">{col.title}</h3>
                  <p className="collection-desc">{col.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="collections-desc">
            <a href="#" className="collections-link">
              Mời bạn khám phá các Bộ sưu tập trên Dinner Chill giúp bạn dễ dàng tìm kiếm nhà hàng theo sở thích, từ ẩm thực truyền thống đến hiện đại. Các địa điểm được chọn lọc kỹ lưỡng, mang đến trải nghiệm ẩm thực đa dạng và hấp dẫn. Xem ngay!
            </a>
          </p>
          <div className="collections-meta">
            Bởi Dinner Chill Team - Cập nhật: 07/10/2024
          </div>
          <h2 className="collections-top-title">
            Top Nhà Hàng Được Đề Xuất Trên Dinner Chill
          </h2>
          <div className="collections-restaurant-list">
            {realRestaurants.length > 0 ? (
              realRestaurants.slice(0, 6).map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))
            ) : (
              <div className="collections-no-restaurant">Không có dữ liệu nhà hàng thực tế.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CollectionsPage; 