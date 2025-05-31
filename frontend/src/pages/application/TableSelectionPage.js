import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { restaurantsAPI } from "../../services/api";
import "../../styles/TableSelectionPage.css";

function TableSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: restaurantId } = useParams();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  
  // Get query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const date = queryParams.get("date") || new Date().toISOString().split("T")[0];
  const time = queryParams.get("time") || "";
  const guests = queryParams.get("guests") || "2";
  const children = queryParams.get("children") || "0";
  const promotionId = queryParams.get("promotionId") || "";
  const promotion = queryParams.get("promotion") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantData = await restaurantsAPI.getById(restaurantId);
        setRestaurant(restaurantData);
        
        // Fetch tables for the restaurant
        // In a real application, you would filter by date/time/availability
        const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/table?restaurantId=${restaurantId}&date=${date}&time=${time}`);
        
        if (!response.ok) {
          throw new Error("Không thể tải danh sách bàn");
        }
        
        const tablesData = await response.json();
        
        // Filter tables that are available and have enough capacity
        const availableTables = tablesData.filter(
          table => 
            table.status === "available" && 
            table.capacity >= parseInt(guests, 10)
        );
        
        setTables(availableTables);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [restaurantId, date, time, guests]);

  const handleTableSelect = (table) => {
    setSelectedTable(table.id === selectedTable ? null : table.id);
  };

  const handleContinue = () => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn trước khi tiếp tục");
      return;
    }
    
    // Find the selected table object to get its code and capacity
    const selectedTableObj = tables.find(table => table.id === selectedTable);
    
    // Create query parameters for reservation page
    const query = new URLSearchParams({
      restaurant: restaurantId,
      date,
      time,
      guests,
      children,
      tableId: selectedTable,
      tableCode: selectedTableObj?.tableCode || '',
      tableCapacity: selectedTableObj?.capacity || ''
    });
    
    if (promotion) query.append("promotion", promotion);
    if (promotionId) query.append("promotionId", promotionId);
    
    // Navigate to reservation page with all parameters
    navigate(`/reservation?${query.toString()}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin bàn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button className="btn" onClick={handleGoBack}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-selection-page">
      <div className="container">
        <div className="page-header">
          <h1>Chọn bàn tại {restaurant?.name}</h1>
          <p>Ngày: {new Date(date).toLocaleDateString("vi-VN")} | Giờ: {time} | Số người: {parseInt(guests) + parseInt(children)}</p>
        </div>

        {tables.length === 0 ? (
          <div className="no-tables-message">
            <p>Không có bàn trống phù hợp với số lượng người của bạn vào thời gian này.</p>
            <p>Vui lòng chọn thời gian khác hoặc liên hệ nhà hàng để được hỗ trợ.</p>
            <button className="btn" onClick={handleGoBack}>
              Quay lại chọn thời gian
            </button>
          </div>
        ) : (
          <>
            <div className="restaurant-layout">
              <div className="layout-info">
                <p>Sơ đồ bàn tại nhà hàng - Chọn bàn trống để đặt chỗ</p>
              </div>
              
              <div className="table-status-indicators">
                <div className="status-item">
                  <span className="status-circle available"></span>
                  <span>Bàn trống</span>
                </div>
                <div className="status-item">
                  <span className="status-circle selected"></span>
                  <span>Bàn đã chọn</span>
                </div>
             
              </div>
              
              <div className="tables-grid">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`table-item ${selectedTable === table.id ? "selected" : ""}`}
                    onClick={() => handleTableSelect(table)}
                  >
                    <div className="table-number">{table.tableCode}</div>
                    <div className="table-capacity">
                      <i className="fas fa-user"></i> {table.capacity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="table-selection-footer">
              <button 
                className="btn-cancel"
                onClick={handleGoBack}
              >
                Hủy
              </button>
              <button 
                className="btn-continue"
                onClick={handleContinue}
                disabled={!selectedTable}
              >
                Tiếp tục đặt bàn
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TableSelectionPage; 