import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [location, setLocation] = useState('Hồ Chí Minh');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="search-section">
      <div className="search-container">
        <form className="search-form" onSubmit={handleSearch}>
          <select 
            className="location-select" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Đà Lạt">Đà Lạt</option>
          </select>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Bạn muốn đặt chỗ đến đâu" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <div className="hotline">
          <span className="phone-icon">📞</span>
          <span>1234 5678</span>
        </div>
      </div>
    </div>
  );
}

export default SearchBar; 