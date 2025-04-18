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
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
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

  // Function to show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };
  
  // Function to create notification
  const createNotification = (message, type = 'success') => {
    // Create and dispatch a custom event
    const notificationEvent = new CustomEvent('newAdminNotification', {
      detail: { message, type }
    });
    window.dispatchEvent(notificationEvent);
  };

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
        // Find the original table to compare changes
        const originalTable = tables.find(table => table.id === currentTable.id);
        const updatedTable = await adminAPI.updateTable(currentTable.id, currentTable);
        setTables(tables.map(table => 
          table.id === currentTable.id ? updatedTable : table
        ));
        
        // Create detailed message about what changed
        let changeDetails = [];
        if (originalTable.tableNumber !== updatedTable.tableNumber) {
          changeDetails.push(`số bàn từ ${originalTable.tableNumber} thành ${updatedTable.tableNumber}`);
        }
        if (originalTable.capacity !== updatedTable.capacity) {
          changeDetails.push(`sức chứa từ ${originalTable.capacity} thành ${updatedTable.capacity} người`);
        }
        if (originalTable.status !== updatedTable.status) {
          const getStatusName = (status) => {
            return {
              'available': 'Trống',
              'reserved': 'Đã đặt',
              'occupied': 'Đang sử dụng',
              'unavailable': 'Không khả dụng'
            }[status] || status;
          };
          changeDetails.push(`trạng thái từ ${getStatusName(originalTable.status)} thành ${getStatusName(updatedTable.status)}`);
        }
        
        const detailMessage = changeDetails.length > 0 
          ? `Đã cập nhật Bàn ${updatedTable.tableNumber}: ${changeDetails.join(', ')}!`
          : `Đã cập nhật Bàn ${updatedTable.tableNumber} thành công!`;
          
        showToast(detailMessage, 'warning');
        createNotification(detailMessage);
      } else {
        const newTable = await adminAPI.createTable(currentTable);
        setTables([...tables, newTable]);
        
        const detailMessage = `Đã thêm Bàn ${newTable.tableNumber} (Sức chứa: ${newTable.capacity} người, Trạng thái: ${getStatusLabel(newTable.status)})`;
        showToast(detailMessage, 'success');
        createNotification(detailMessage);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving table:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bàn.', 'danger');
    }
  };

  // Handle table deletion
  const handleDeleteTable = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        const tableToDelete = tables.find(table => table.id === id);
        await adminAPI.deleteTable(id);
        setTables(tables.filter(table => table.id !== id));
        
        const detailMessage = `Đã xóa Bàn ${tableToDelete.tableNumber} (Sức chứa: ${tableToDelete.capacity} người, Mã bàn: ${tableToDelete.tableCode})`;
        showToast(detailMessage, 'danger');
        createNotification(detailMessage, 'danger');
      } catch (error) {
        console.error('Error deleting table:', error);
        showToast('Có lỗi xảy ra khi xóa bàn.', 'danger');
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

  const filterTables = () => {
    return tables.filter((table) => {
      const searchMatch = table.tableNumber.toString().includes(tableSearchQuery) ||
        (table.tableCode && table.tableCode.toLowerCase().includes(tableSearchQuery.toLowerCase()));
      
      const statusMatch = tableStatusFilter === 'all' || 
        (tableStatusFilter === 'available' && table.status === 'available') ||
        (tableStatusFilter === 'reserved' && table.status === 'reserved') ||
        (tableStatusFilter === 'occupied' && table.status === 'occupied') ||
        (tableStatusFilter === 'unavailable' && table.status === 'unavailable');
      
      return searchMatch && statusMatch;
    });
  };

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
            <div className="custom-select-wrapper">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter custom-select-filter"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="open">Đang mở cửa</option>
                <option value="maintenance">Tạm ngưng</option>
                <option value="closed">Hết giờ hoạt động</option>
              </select>
              <div className="select-icon">
                <i className="bi bi-circle-fill" style={{fontSize: '10px'}}></i>
              </div>
            </div>
            <div className="custom-select-wrapper">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-filter custom-select-filter"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="morning">Buổi sáng (6h-12h)</option>
                <option value="afternoon">Buổi chiều (12h-17h)</option>
                <option value="evening">Buổi tối (Sau 17h)</option>
              </select>
              <div className="select-icon">
                <i className="bi bi-clock"></i>
              </div>
            </div>
          </div>
          <div className="restaurant-list">
            {filteredRestaurants.map(restaurant => {
              const status = getRestaurantStatus(restaurant);
              
              return (
                <div key={restaurant.id} className="restaurant-item">
                  <div className="restaurant-info">
                    <div className="restaurant-name-wrapper">
                      <span className={`status-indicator ${status}`} title={getRestaurantStatusLabel(status)} style={getStatusDotStyle(status)}></span>
                      <span className="restaurant-name" title={restaurant.name}>Nhà hàng: {restaurant.name}</span>
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
          <button 
            className="back-btn-standalone"
            onClick={handleBackToRestaurants}
            title="Quay lại danh sách nhà hàng"
          >
            <i className="bi bi-arrow-left-circle-fill"></i> Quay lại danh sách
          </button>
          
          <div className="restaurant-header">
            <div className="header-left">
              <div className="restaurant-info-header">
                <div className="restaurant-title">
                  <span className={`status-indicator ${getRestaurantStatus(selectedRestaurant)}`} title={getRestaurantStatusLabel(getRestaurantStatus(selectedRestaurant))} style={getStatusDotStyle(getRestaurantStatus(selectedRestaurant))}></span>
                  <h2>{selectedRestaurant.name}</h2>
                </div>
                <div className="table-stats">
                  <div className="table-count-display">Tổng số bàn: {tables.length}</div>
                  <div className="table-count-reserved">Đã đặt: {tables.filter(table => table.status === 'reserved').length}</div>
                  <div className="table-count-occupied">Đang sử dụng: {tables.filter(table => table.status === 'occupied').length}</div>
                  <div className="table-count-unavailable">Không khả dụng: {tables.filter(table => table.status === 'unavailable').length}</div>
                </div>
              </div>
            </div>

            <div className="action-container">
              <div className="table-search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm số bàn hoặc mã bàn..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="form-control table-search-input"
                  aria-label="Tìm kiếm bàn"
                />
                <span className="search-icon">
                  <i className="bi bi-search"></i>
                </span>
              </div>
              <div className="table-filter-container">
                <div className="custom-select-wrapper">
                  <select
                    className="form-control custom-select-filter"
                    value={tableStatusFilter}
                    onChange={(e) => setTableStatusFilter(e.target.value)}
                    aria-label="Lọc theo trạng thái"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="available">Trống</option>
                    <option value="reserved">Đã đặt</option>
                    <option value="occupied">Đang sử dụng</option>
                    <option value="unavailable">Không khả dụng</option>
                  </select>
                  <div className="select-icon">
                    <i className="bi bi-funnel-fill"></i>
                  </div>
                </div>
              </div>
              <button 
                className="btn add-table-btn"
                onClick={handleAddTable}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Thêm bàn
              </button>
            </div>
          </div>

          <div className="tables-grid">
            {filterTables().map(table => (
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
                  <div className="table-description">
                    <span className="description-text">
                      {table.description ? table.description : "Không có mô tả"}
                    </span>
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
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          transform: 'none',
          backgroundColor: toast.type === 'success' ? '#28a745' : 
                           toast.type === 'warning' ? '#ffc107' : 
                           toast.type === 'danger' ? '#dc3545' : '#28a745',
          color: toast.type === 'warning' ? '#212529' : 'white',
          padding: '15px 20px',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          minWidth: '300px',
          maxWidth: '400px',
          animation: 'slideInUp 0.3s ease-out'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '3px'
          }}>
            {toast.type === 'success' && <i className="fa fa-check-circle" style={{ fontSize: '20px' }}></i>}
            {toast.type === 'warning' && <i className="fa fa-exclamation-circle" style={{ fontSize: '20px' }}></i>}
            {toast.type === 'danger' && <i className="fa fa-times-circle" style={{ fontSize: '20px' }}></i>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>Thông báo</div>
            <div style={{ fontSize: '14px' }}>{toast.message}</div>
          </div>
          <div style={{
            alignSelf: 'flex-start',
            fontSize: '14px',
            fontWeight: '500',
            marginLeft: 'auto',
            cursor: 'pointer'
          }} onClick={() => setToast({ show: false, message: '', type: 'success' })}>
            Xong
          </div>
        </div>
      )}
      <style jsx="true">{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .toast-notification {
          animation: slideInUp 0.3s ease-out;
        }
        
        /* Custom Select Styling */
        .custom-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-right: 15px;
        }
        
        .custom-select-filter {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 2.5rem !important;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-weight: 500;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .search-filter-container {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .search-input {
          padding: 0.375rem 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 6px;
          margin-right: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
          min-width: 240px;
        }
        
        .search-input:focus, .search-input:hover {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
          outline: none;
        }
        
        .custom-select-filter:hover {
          border-color: #80bdff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .custom-select-filter:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
          outline: none;
        }
        
        .select-icon {
          position: absolute;
          right: 10px;
          pointer-events: none;
          display: flex;
          align-items: center;
          color: #6c757d;
        }
        
        /* Table filter container */
        .table-filter-container {
          margin-right: 15px;
        }
        
        /* Style the option color indicators when selected */
        .custom-select-filter option[value="all"] {
          font-weight: bold;
        }
        
        .custom-select-filter option[value="available"] {
          color: #28a745;
        }
        
        .custom-select-filter option[value="reserved"] {
          color: #ffc107;
        }
        
        .custom-select-filter option[value="occupied"] {
          color: #007bff;
        }
        
        .custom-select-filter option[value="unavailable"] {
          color: #dc3545;
        }
        
        /* Restaurant status colors */
        .custom-select-filter option[value="open"] {
          color: #28a745;
        }
        
        .custom-select-filter option[value="maintenance"] {
          color: #dc3545;
        }
        
        .custom-select-filter option[value="closed"] {
          color: #6c757d;
        }
        
        .table-search-container {
          position: relative;
          min-width: 320px;
          width: 320px;
        }
        
        .table-search-input {
          padding-right: 2.5rem !important;
          border: 1px solid #ced4da;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        
        .table-search-input:hover {
          border-color: #80bdff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .table-search-input:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
          outline: none;
        }
        
        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          pointer-events: none;
        }
        
        .action-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .add-table-btn {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.375rem 0.75rem;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          white-space: nowrap;
          min-width: 120px;
          justify-content: center;
        }
        
        .add-table-btn:hover {
          background-color: #0069d9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        /* Table description styling */
        .table-description {
          margin-top: 6px;
          border-top: 1px dashed #e0e0e0;
          padding-top: 6px;
        }
        
        .description-text {
          font-size: 0.75rem;
          color: #6c757d;
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 2.4em;
          line-height: 1.2;
        }
        
        /* Adjust table card to accommodate description */
        .table-card {
          height: auto;
          min-height: 150px;
          display: flex;
          flex-direction: column;
        }
        
        .table-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Back button standalone styling */
        .back-btn-standalone {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 6px;
          color: #495057;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .back-btn-standalone i {
          margin-right: 8px;
          font-size: 1.2rem;
          color: #6c757d;
        }
        
        .back-btn-standalone:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Table count styling */
        .table-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 8px;
          width: 100%;
          justify-content: flex-start;
          margin-left: 10px;
        }
        
        .restaurant-info-header {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        /* Table search and filter container sizing */
        .table-search-container {
          position: relative;
          min-width: 320px;
          width: 320px;
        }
        
        .table-filter-container {
          width: auto;
        }
        
        .custom-select-filter {
          min-width: 160px;
          width: 100%;
        }
        
        .add-table-btn {
          white-space: nowrap;
          min-width: 120px;
          justify-content: center;
        }
        
        .table-count-display {
          padding: 4px 10px;
          background-color: #e9ecef;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #495057;
        }
        
        .table-count-reserved {
          padding: 4px 10px;
          background-color: #fff3cd;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #856404;
        }
        
        .table-count-occupied {
          padding: 4px 10px;
          background-color: #cce5ff;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #004085;
        }
        
        .table-count-unavailable {
          padding: 4px 10px;
          background-color: #f8d7da;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #721c24;
        }
        
        /* Table status colors */
        .status-available {
          background-color: #d4edda;
          color: #155724;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .status-reserved {
          background-color: #fff3cd;
          color: #856404;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .status-occupied {
          background-color: #cce5ff;
          color: #004085;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .status-unavailable {
          background-color: #f8d7da;
          color: #721c24;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }

        /* Restaurant header styling */
        .restaurant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          position: relative;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .restaurant-info-header {
          width: 100%;
        }
        
        .action-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: flex-end;
          margin-left: 20px;
        }
        
        .table-search-container, 
        .table-filter-container,
        .custom-select-wrapper {
          margin-right: 0;
        }
        
        @media (max-width: 1200px) {
          .restaurant-header {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          
          .action-container {
            justify-content: center;
            margin-left: 0;
          }
        }

        .restaurant-title {
          display: flex;
          align-items: center;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default AdminTables;
