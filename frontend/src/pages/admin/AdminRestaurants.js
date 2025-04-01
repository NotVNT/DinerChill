import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    rating: '',
    address: '',
    image: '',
    description: '',
    openingHours: '',
    phone: ''
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating.toString(),
      address: restaurant.address,
      image: restaurant.image,
      description: restaurant.description,
      openingHours: restaurant.openingHours,
      phone: restaurant.phone
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert rating từ string sang number
      const restaurantData = {
        ...formData,
        rating: parseFloat(formData.rating)
      };

      let updatedRestaurant;
      if (editingRestaurant) {
        // Cập nhật nhà hàng
        updatedRestaurant = await adminAPI.updateRestaurant(editingRestaurant.id, restaurantData);
        setRestaurants(prev => prev.map(restaurant => 
          restaurant.id === editingRestaurant.id ? updatedRestaurant : restaurant
        ));
      } else {
        // Thêm nhà hàng mới
        updatedRestaurant = await adminAPI.createRestaurant(restaurantData);
        setRestaurants(prev => [...prev, updatedRestaurant]);
      }
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error saving restaurant:', err);
      setError('Không thể lưu thông tin nhà hàng. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      cuisine: '',
      rating: '',
      address: '',
      image: '',
      description: '',
      openingHours: '',
      phone: ''
    });
  };

  const handleDeleteClick = async (restaurantId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà hàng này?')) {
      try {
        await adminAPI.deleteRestaurant(restaurantId);
        setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
      } catch (err) {
        console.error('Error deleting restaurant:', err);
        setError('Không thể xóa nhà hàng. Vui lòng thử lại.');
      }
    }
  };

  const handleAddNew = () => {
    resetForm();
    setEditingRestaurant(false); // false indicates add mode versus edit mode
  };

  if (loading && restaurants.length === 0) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-restaurants">
      <div className="page-header">
        <h1>Quản lý Nhà hàng</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>Thêm nhà hàng mới</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {(editingRestaurant !== null) ? (
        <div className="edit-form">
          <h2>{editingRestaurant ? 'Chỉnh sửa nhà hàng' : 'Thêm nhà hàng mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên nhà hàng</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Loại ẩm thực</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Đánh giá (1-5)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>URL Hình ảnh</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Giờ mở cửa</label>
              <input
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                required
                placeholder="Ví dụ: 8:00 - 22:00"
              />
            </div>
            
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {editingRestaurant ? 'Cập nhật' : 'Thêm mới'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà hàng</th>
              <th>Loại ẩm thực</th>
              <th>Đánh giá</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map(restaurant => (
              <tr key={restaurant.id}>
                <td>{restaurant.id}</td>
                <td>{restaurant.name}</td>
                <td>{restaurant.cuisine}</td>
                <td>{restaurant.rating}</td>
                <td>{restaurant.address}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEditClick(restaurant)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDeleteClick(restaurant.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminRestaurants; 