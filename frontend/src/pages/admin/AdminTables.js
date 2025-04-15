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
  const [currentTable, setCurrentTable] = useState({
    restaurantId: '',
    tableNumber: '',
    capacity: 2,
    status: 'available',
    description: '',
    tableCode: generateTableCode()
  });

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

  const getStatusLabel = (status) => {
    const statusLabels = {
      available: 'Trống',
      reserved: 'Đã đặt',
      occupied: 'Đang sử dụng',
      unavailable: 'Không khả dụng'
    };
    return statusLabels[status] || status;
  };

  return (
    <div className="admin-tables-container">
      {!selectedRestaurant ? (
        // Restaurant List View
        <div className="restaurant-list">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="restaurant-item">
              <div className="restaurant-info">
                <span className="restaurant-name">Nhà hàng: {restaurant.name}</span>
                <span className="table-count">
                  Tổng số bàn: {restaurant.tableCount || '...'}
                </span>
              </div>
              <button 
                className="view-tables-btn"
                onClick={() => handleSelectRestaurant(restaurant)}
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>
      ) : (
        // Tables View for Selected Restaurant
        <div className="restaurant-tables">
          <div className="restaurant-header">
            <button 
              className="back-btn"
              onClick={handleBackToRestaurants}
            >
              <i className="fas fa-arrow-left"></i> Quay lại
            </button>
            <h2>{selectedRestaurant.name}</h2>
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
