import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/admin_layout/admin_tables.css';

// Di chuyển hàm generateTableCode lên trước component
const generateTableCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function AdminTables() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentTable, setCurrentTable] = useState({
    restaurantId: '',
    tableNumber: '',
    capacity: 2,
    status: 'available',
    description: '',
    tableCode: generateTableCode()
  });
  const [restaurantTableCounts, setRestaurantTableCounts] = useState({});
  const [availableTableCounts, setAvailableTableCounts] = useState({});

  // Fetch restaurants data
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantsRes = await adminAPI.getRestaurants();
        setRestaurants(restaurantsRes);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch tables when a restaurant is selected
  useEffect(() => {
    const fetchTables = async () => {
      if (selectedRestaurant) {
        try {
          const tablesRes = await adminAPI.getTables({ 
            restaurantId: selectedRestaurant.id 
          });
          // Thêm sort để sắp xếp bàn theo thứ tự tăng dần của số bàn
          const sortedTables = tablesRes
            .filter(table => table.restaurantId === selectedRestaurant.id)
            .sort((a, b) => {
              // Chuyển số bàn thành số để so sánh
              const tableNumA = parseInt(a.tableNumber.replace(/\D/g, ''));
              const tableNumB = parseInt(b.tableNumber.replace(/\D/g, ''));
              return tableNumA - tableNumB;
            });
          setTables(sortedTables);
        } catch (error) {
          console.error('Error fetching tables:', error);
        }
      }
    };
    fetchTables();
  }, [selectedRestaurant]);

  // Thêm useEffect để lấy số lượng bàn của mỗi nhà hàng và đếm số bàn trống
  useEffect(() => {
    const fetchTableCounts = async () => {
      try {
        // Lấy tất cả các bàn một lần
        const allTables = await adminAPI.getTables();
        
        // Đếm số bàn và số bàn trống cho mỗi nhà hàng
        const counts = {};
        const availableCounts = {};
        
        allTables.forEach(table => {
          if (table.restaurantId) {
            // Tổng số bàn
            counts[table.restaurantId] = (counts[table.restaurantId] || 0) + 1;
            
            // Số bàn trống (có trạng thái 'available')
            if (table.status === 'available') {
              availableCounts[table.restaurantId] = (availableCounts[table.restaurantId] || 0) + 1;
            }
          }
        });
        
        setRestaurantTableCounts(counts);
        setAvailableTableCounts(availableCounts);
      } catch (error) {
        console.error('Error fetching table counts:', error);
      }
    };
    
    if (restaurants.length > 0) {
      fetchTableCounts();
    }
  }, [restaurants]);

  // Handle selecting a restaurant
  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  // Handle going back to restaurant list
  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTable({
      ...currentTable,
      [name]: value
    });
  };

  // Open modal for adding a new table
  const handleAddTable = () => {
    setCurrentTable({
      restaurantId: selectedRestaurant.id,
      tableNumber: '',
      capacity: 2,
      status: 'available',
      description: '',
      tableCode: generateTableCode()
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open modal for editing an existing table
  const handleEditTable = (table) => {
    setCurrentTable({ ...table });
    setIsEditing(true);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const updatedTable = await adminAPI.updateTable(currentTable.id, currentTable);
        setTables(tables.map(table => 
          table.id === currentTable.id ? updatedTable : table
        ));
      } else {
        const newTable = await adminAPI.createTable(currentTable);
        setTables([...tables, newTable]);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving table:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bàn.');
    }
  };

  // Handle table deletion
  const handleDeleteTable = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        await adminAPI.deleteTable(id);
        setTables(tables.filter(table => table.id !== id));
      } catch (error) {
        console.error('Error deleting table:', error);
        alert('Có lỗi xảy ra khi xóa bàn.');
      }
    }
  };

  // Determine restaurant status based on opening/closing times and temporary closure
  const getRestaurantStatus = (restaurant) => {
    // Check for maintenance status first
    if (restaurant.status === 'maintenance') {
      return 'maintenance';
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Parse opening and closing times to minutes since midnight
    const parseTimeToMinutes = (timeString) => {
      if (!timeString) return null;
      
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    };
    
    const openingMinutes = parseTimeToMinutes(restaurant.openingTime);
    const closingMinutes = parseTimeToMinutes(restaurant.closingTime);
    
    // If opening/closing times are not set, default to closed
    if (openingMinutes === null || closingMinutes === null) {
      return 'closed';
    }
    
    // Handle case where closing time is on the next day
    if (closingMinutes < openingMinutes) {
      return (currentTime >= openingMinutes || currentTime < closingMinutes) 
        ? 'open' 
        : 'closed';
    }
    
    // Normal case
    return (currentTime >= openingMinutes && currentTime < closingMinutes) 
      ? 'open' 
      : 'closed';
  };
  
  // Return appropriate status label
  const getStatusLabel = (status) => {
    const statusLabels = {
      available: 'Trống',
      reserved: 'Đã đặt',
      occupied: 'Đang sử dụng',
      unavailable: 'Không khả dụng'
    };
    return statusLabels[status] || status;
  };
  
  // Return restaurant status label
  const getRestaurantStatusLabel = (status) => {
    const statusLabels = {
      'open': 'Đang hoạt động',
      'closed': 'Ngoài giờ mở cửa',
      'maintenance': 'Tạm ngưng'
    };
    return statusLabels[status] || status;
  };

  // Hàm định dạng thời gian cập nhật
  const formatLastUpdated = (date) => {
    if (!date) return '';
    
    const updateDate = new Date(date);
    return updateDate.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDotStyle = (status) => {
    switch (status) {
      case 'open':
        return { backgroundColor: '#4CAF50' }; // Green
      case 'closed':
        return { backgroundColor: '#9E9E9E' }; // Grey
      case 'maintenance':
        return { backgroundColor: '#F44336' }; // Red
      default:
        return { backgroundColor: '#9E9E9E' }; // Default grey
    }
  };

  // Filter restaurants based on search query and filters
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getRestaurantStatus(restaurant);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    // Check time filter
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const [openHour] = restaurant.openingTime?.split(':').map(Number) || [0];
      
      switch(timeFilter) {
        case 'morning':
          matchesTime = openHour >= 6 && openHour < 12;
          break;
        case 'afternoon':
          matchesTime = openHour >= 12 && openHour < 17;
          break;
        case 'evening':
          matchesTime = openHour >= 17;
          break;
        default:
          matchesTime = true;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  return (
    <div className="admin-tables-container">
      {!selectedRestaurant ? (
        // Restaurant List View
        <div>
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Đang mở cửa</option>
              <option value="maintenance">Tạm ngưng</option>
              <option value="closed">Hết giờ hoạt động</option>
            </select>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="time-filter"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="morning">Buổi sáng (6h-12h)</option>
              <option value="afternoon">Buổi chiều (12h-17h)</option>
              <option value="evening">Buổi tối (Sau 17h)</option>
            </select>
          </div>
          <div className="restaurant-list">
            {filteredRestaurants.map(restaurant => {
              const status = getRestaurantStatus(restaurant);
              
              return (
                <div key={restaurant.id} className="restaurant-item">
                  <div className="restaurant-info">
                    <div className="restaurant-name-wrapper">
                      <span className={`status-indicator ${status}`} title={getRestaurantStatusLabel(status)} style={getStatusDotStyle(status)}></span>
                      <span className="restaurant-name">Nhà hàng: {restaurant.name}</span>
                    </div>
                    <span className="restaurant-hours">
                      Giờ mở cửa: {restaurant.openingTime || '--'} - {restaurant.closingTime || '--'}
                    </span>
                    <span className="table-count">
                      Bàn trống/Tổng số: {availableTableCounts[restaurant.id] || 0}/{restaurantTableCounts[restaurant.id] || 0}
                    </span>
                    <span className="last-updated">
                      Cập nhật: {formatLastUpdated(restaurant.updatedAt)}
                    </span>
                  </div>
                  <button 
                    className="view-tables-btn"
                    onClick={() => handleSelectRestaurant(restaurant)}
                    title="Xem chi tiết bàn"
                  >
                    <i className="bi bi-eye-fill"></i>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Restaurant Detail View
        <div className="restaurant-tables">
          <div className="restaurant-header">
            <button 
              className="back-btn"
              onClick={handleBackToRestaurants}
              title="Quay lại danh sách nhà hàng"
            >
              <i className="bi bi-arrow-left-circle-fill"></i>
            </button>
            <div className="restaurant-info-header">
              <div className="restaurant-title">
                <span className={`status-indicator ${getRestaurantStatus(selectedRestaurant)}`} title={getRestaurantStatusLabel(getRestaurantStatus(selectedRestaurant))} style={getStatusDotStyle(getRestaurantStatus(selectedRestaurant))}></span>
                <h2>{selectedRestaurant.name}</h2>
              </div>
              <div className="table-stats">
                <div className="table-count-display">Tổng số bàn: {tables.length}</div>
                <div className="table-count-reserved">Đã đặt: {tables.filter(table => table.status === 'reserved').length}</div>
                <div className="table-count-occupied">Đang sử dụng: {tables.filter(table => table.status === 'occupied').length}</div>
              </div>
            </div>
            <button 
              className="add-table-btn"
              onClick={handleAddTable}
            >
              Thêm bàn
            </button>
          </div>

          <div className="tables-grid">
            {tables.map(table => (
              <div key={table.id} className="table-card">
                <div className="table-header">
                  <span>Bàn {table.tableNumber}</span>
                  <div className="table-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditTable(table)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteTable(table.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="table-info">
                  <div>Mã bàn: {table.tableCode}</div>
                  <div>Sức chứa: {table.capacity} người</div>
                  <div className={`table-status status-${table.status}`}>
                    {getStatusLabel(table.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="table-modal">
            <h2>{isEditing ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Số bàn</label>
                <input
                  type="text"
                  name="tableNumber"
                  value={currentTable.tableNumber}
                  onChange={handleInputChange}
                  placeholder="Nhập số bàn"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Sức chứa</label>
                <div className="capacity-input-group">
                  <input
                    type="number"
                    name="capacity"
                    value={currentTable.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                  />
                  <span className="capacity-addon">người</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={currentTable.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="available">Trống</option>
                  <option value="reserved">Đã đặt</option>
                  <option value="occupied">Đang sử dụng</option>
                  <option value="unavailable">Không khả dụng</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={currentTable.description || ''}
                  onChange={handleInputChange}
                  placeholder="Mô tả bàn (tùy chọn)"
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {isEditing ? 'Cập nhật' : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTables;
