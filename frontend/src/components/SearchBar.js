import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/searchbar.css';

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTime, setSelectedTime] = useState('');

  // Get today's date in YYYY-MM-DD format for the date input min attribute
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedDate) params.append('date', selectedDate);
    if (guestCount) params.append('guests', guestCount);
    if (selectedTime) params.append('time', selectedTime);
    
    // Navigate to search results page with query parameters
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-bar-form">
        <div className="search-bar-wrapper">
          <div className="search-input-group location">
            <label htmlFor="search-location">
              <span>Địa điểm</span>
            </label>
            <input
              id="search-location"
              type="text"
              placeholder="Nhập tên nhà hàng hoặc món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="search-input-group date">
            <label htmlFor="search-date">
             
              <span>Ngày</span>
            </label>
            <input
              id="search-date"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="search-input-group time">
            <label htmlFor="search-time">
            
              <span>Giờ</span>
            </label>
            <select
              id="search-time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">Chọn giờ</option>
              <option value="11:00">11:00</option>
              <option value="11:30">11:30</option>
              <option value="12:00">12:00</option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="17:30">17:30</option>
              <option value="18:00">18:00</option>
              <option value="18:30">18:30</option>
              <option value="19:00">19:00</option>
              <option value="19:30">19:30</option>
              <option value="20:00">20:00</option>
            </select>
          </div>

          <div className="search-input-group guests">
            <label htmlFor="search-guests">
              <span>Khách</span>
            </label>
            <select
              id="search-guests"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            >
              <option value="1">1 người</option>
              <option value="2">2 người</option>
              <option value="3">3 người</option>
              <option value="4">4 người</option>
              <option value="5">5 người</option>
              <option value="6">6 người</option>
              <option value="7">7 người</option>
              <option value="8">8 người</option>
              <option value="9">9 người</option>
              <option value="10">10 người</option>
              <option value="10+">10+ người</option>
            </select>
          </div>

          <button type="submit" className="search-button">
            Tìm kiếm
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar; 