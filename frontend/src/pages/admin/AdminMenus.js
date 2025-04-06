import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../services/api';

function AdminMenus() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    restaurantId: '',
    image: null
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

  const fetchMenuItems = useCallback(async () => {
    if (!selectedRestaurant) return;
    
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/menu-items`);
      setMenuItems(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Không thể tải danh sách thực đơn');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchRestaurants();
    fetchMenuItems();
  }, [fetchRestaurants, fetchMenuItems]);

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

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('restaurantId', selectedRestaurant);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/menu-items`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          // Don't set Content-Type here, it will be set automatically with the boundary
        }
      });

      // Reset form and refresh list
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        restaurantId: '',
        image: null
      });
      setShowForm(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Không thể thêm món ăn mới');
    }
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        await fetchWithAuth(`/admin/restaurants/${selectedRestaurant}/menu-items/${menuItemId}`, {
          method: 'DELETE'
        });
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        setError('Không thể xóa món ăn');
      }
    }
  };

  if (loading && !showForm) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-menus">
      <div className="admin-section-header">
        <h2>Quản lý thực đơn</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hủy' : 'Thêm món ăn mới'}
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
        <div className="menu-item-form">
          <h3>Thêm món ăn mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Tên món ăn:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Mô tả:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="price">Giá:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Danh mục:</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Hình ảnh:</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <button type="submit" className="btn btn-success">Thêm món ăn</button>
          </form>
        </div>
      )}

      <div className="menu-items-list">
        <h3>Danh sách món ăn</h3>
        {menuItems.length === 0 ? (
          <p>Không có món ăn nào.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên món ăn</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        width="50" 
                        height="50" 
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="no-image">Không có ảnh</div>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.description || 'Không có mô tả'}</td>
                  <td>{item.price.toLocaleString('vi-VN')}đ</td>
                  <td>{item.category || 'Chưa phân loại'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning mr-2"
                      onClick={() => {
                        // Handle edit (not implemented in this version)
                        alert('Chức năng chỉnh sửa đang được phát triển');
                      }}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteMenuItem(item.id)}
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
    </div>
  );
}

export default AdminMenus; 