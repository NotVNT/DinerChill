import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterBox from '../components/FilterBox';
import { useApp } from '../context/AppContext';
import '../styles/HomePage.css';

function HomePage() {
  const { user } = useApp();
  
  return (
    <div className="home-page">
      <SearchBar />
      
      <div className="container">
        <FilterBox />
      </div>
      
      <div className="hero-section">
        <h1>Chào mừng đến với DinerChill</h1>
        <p>Nền tảng đặt bàn nhà hàng trực tuyến số 1</p>
        <Link to="/restaurants" className="btn btn-primary">
          Khám phá nhà hàng
        </Link>
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
    </div>
  );
}

export default HomePage; 