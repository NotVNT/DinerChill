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
    address: '',
    image: '',
    description: '',
    openingHours: '',
    phone: '',
    capacity: ''
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
      cuisine: restaurant.cuisine || restaurant.cuisineType || '',
      address: restaurant.address || '',
      image: restaurant.image || restaurant.imageUrl || '',
      description: restaurant.description || '',
      openingHours: restaurant.openingHours || `${restaurant.openingTime || '10:00'} - ${restaurant.closingTime || '22:00'}`,
      phone: restaurant.phone || '',
      capacity: restaurant.capacity ? restaurant.capacity.toString() : ''
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
      // Phân tích giờ mở cửa thành openingTime và closingTime
      const [openingTime, closingTime] = formData.openingHours ? formData.openingHours.split(' - ') : ['10:00', '22:00'];
      
      // Chuẩn bị dữ liệu nhà hàng với định dạng backend mong đợi
      const restaurantData = {
        name: formData.name,
        cuisine: formData.cuisine,
        address: formData.address,
        image: formData.image,
        description: formData.description,
        openingTime,
        closingTime,
        phone: formData.phone,
        email: `contact@${formData.name.toLowerCase().replace(/\s+/g, '')}.com`,
        priceRange: '200.000đ - 500.000đ', 
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      console.log('Dữ liệu gửi đi:', restaurantData);

      let updatedRestaurant;
      if (editingRestaurant) {
        // Cập nhật nhà hàng hiện có
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
      console.error('Chi tiết lỗi khi lưu nhà hàng:', err);
      setError('Không thể lưu thông tin nhà hàng. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      cuisine: '',
      address: '',
      image: '',
      description: '',
      openingHours: '',
      phone: '',
      capacity: ''
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

  return (
    <div className="admin-restaurants">
      <div className="page-header">
        <h1>Quản lý Nhà hàng</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>Thêm nhà hàng mới</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {editingRestaurant !== null ? (
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
            
            <div className="form-group">
              <label>Sức chứa (người)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                placeholder="Nhập sức chứa nhà hàng"
                required={false}
              />
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
      ) : loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà hàng</th>
              <th>Loại ẩm thực</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {restaurants && restaurants.length > 0 ? (
              restaurants.map(restaurant => (
                <tr key={restaurant.id}>
                  <td>{restaurant.id}</td>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.cuisine || restaurant.cuisineType}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">Không có dữ liệu nhà hàng</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminRestaurants;