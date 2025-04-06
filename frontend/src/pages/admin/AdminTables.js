import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../services/api';

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    status: 'available', // available, reserved, occupied
    location: '',
    notes: ''
  });

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/admin/restaurants');
      setRestaurants(data);
      if (data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Không thể tải danh sách nhà hàng');
    }
  }, [selectedRestaurant]);

  const fetchTables = useCallback(async () => {
    if (!selectedRestaurant) return;
    
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/tables`);
      setTables(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchRestaurants();
    if (selectedRestaurant) {
      fetchTables();
    }
  }, [fetchRestaurants, fetchTables, selectedRestaurant]);

  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          restaurantId: selectedRestaurant
        })
      });

      // Reset form and refresh list
      setFormData({
        tableNumber: '',
        capacity: '',
        status: 'available',
        location: '',
        notes: ''
      });
      setShowForm(false);
      fetchTables();
    } catch (error) {
      console.error('Error adding table:', error);
      setError('Không thể thêm bàn mới');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bàn này?')) {
      try {
        await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/tables/${tableId}`, {
          method: 'DELETE'
        });
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
        setError('Không thể xóa bàn');
      }
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
      setError('Không thể cập nhật trạng thái bàn');
    }
  };

  if (loading && !showForm) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'reserved': return 'status-reserved';
      case 'occupied': return 'status-occupied';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'reserved': return 'Đã đặt';
      case 'occupied': return 'Đang sử dụng';
      default: return status;
    }
  };

  return (
    <div className="admin-tables">
      <div className="admin-section-header">
        <h2>Quản lý bàn</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hủy' : 'Thêm bàn mới'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="restaurant-selector">
        <label htmlFor="restaurant-select">Chọn nhà hàng:</label>
        <select 
          id="restaurant-select" 
          value={selectedRestaurant} 
          onChange={handleRestaurantChange}
        >
          {restaurants.map(restaurant => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="table-form">
          <h3>Thêm bàn mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tableNumber">Số bàn:</label>
              <input
                type="text"
                id="tableNumber"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="capacity">Sức chứa:</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Trạng thái:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="available">Trống</option>
                <option value="reserved">Đã đặt</option>
                <option value="occupied">Đang sử dụng</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Vị trí:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="VD: Tầng 1, Gần cửa sổ, ..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Ghi chú:</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-success">Thêm bàn</button>
          </form>
        </div>
      )}

      <div className="tables-list">
        <h3>Danh sách bàn</h3>
        {tables.length === 0 ? (
          <p>Không có bàn nào.</p>
        ) : (
          <div className="tables-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Số bàn</th>
                  <th>Sức chứa</th>
                  <th>Trạng thái</th>
                  <th>Vị trí</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tables.map(table => (
                  <tr key={table.id}>
                    <td>{table.tableNumber}</td>
                    <td>{table.capacity} người</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(table.status)}`}>
                        {getStatusText(table.status)}
                      </span>
                    </td>
                    <td>{table.location || 'Chưa cập nhật'}</td>
                    <td>{table.notes || 'Không có ghi chú'}</td>
                    <td>
                      <div className="table-actions">
                        <div className="status-actions">
                          <button 
                            className={`btn btn-sm ${table.status === 'available' ? 'btn-success active' : 'btn-outline-success'}`}
                            onClick={() => handleUpdateTableStatus(table.id, 'available')}
                            title="Đánh dấu là trống"
                          >
                            Trống
                          </button>
                          <button 
                            className={`btn btn-sm ${table.status === 'reserved' ? 'btn-warning active' : 'btn-outline-warning'}`}
                            onClick={() => handleUpdateTableStatus(table.id, 'reserved')}
                            title="Đánh dấu là đã đặt"
                          >
                            Đã đặt
                          </button>
                          <button 
                            className={`btn btn-sm ${table.status === 'occupied' ? 'btn-info active' : 'btn-outline-info'}`}
                            onClick={() => handleUpdateTableStatus(table.id, 'occupied')}
                            title="Đánh dấu là đang sử dụng"
                          >
                            Đang sử dụng
                          </button>
                        </div>
                        <div className="edit-actions">
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              // Handle edit (not implemented in this version)
                              alert('Chức năng chỉnh sửa đang được phát triển');
                            }}
                          >
                            Sửa
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTable(table.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTables; 