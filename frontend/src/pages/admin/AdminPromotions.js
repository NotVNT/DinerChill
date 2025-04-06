import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../services/api';

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: '',
    startDate: '',
    endDate: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    isActive: true,
    restaurantId: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/promotions');
      setPromotions(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/admin/restaurants');
      setRestaurants(data);
      // Set default restaurant if none selected
      if (data.length > 0 && !formData.restaurantId) {
        setFormData(prev => ({
          ...prev,
          restaurantId: data[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  }, [formData.restaurantId]);

  useEffect(() => {
    fetchPromotions();
    fetchRestaurants();
  }, [fetchPromotions, fetchRestaurants]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      minimumOrderAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      isActive: true,
      restaurantId: restaurants.length > 0 ? restaurants[0].id : ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      if (editingId) {
        // Update existing promotion
        await fetchWithAuth(`/admin/promotions/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new promotion
        await fetchWithAuth('/admin/promotions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      setError(`Không thể ${editingId ? 'cập nhật' : 'thêm'} khuyến mãi`);
    }
  };

  const handleEditPromotion = (promotion) => {
    setFormData({
      code: promotion.code,
      description: promotion.description || '',
      discountType: promotion.discountType || 'percentage',
      discountValue: promotion.discountValue ? promotion.discountValue.toString() : '',
      startDate: formatDate(promotion.startDate),
      endDate: formatDate(promotion.endDate),
      minimumOrderAmount: promotion.minimumOrderAmount ? promotion.minimumOrderAmount.toString() : '',
      maximumDiscount: promotion.maximumDiscount ? promotion.maximumDiscount.toString() : '',
      usageLimit: promotion.usageLimit ? promotion.usageLimit.toString() : '',
      isActive: promotion.isActive,
      restaurantId: promotion.restaurantId
    });
    setEditingId(promotion.id);
    setShowForm(true);
  };

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      try {
        await fetchWithAuth(`/admin/promotions/${promotionId}`, {
          method: 'DELETE'
        });
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        setError('Không thể xóa khuyến mãi');
      }
    }
  };

  const handleToggleStatus = async (promotionId, currentStatus) => {
    try {
      await fetchWithAuth(`/admin/promotions/${promotionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      setError('Không thể thay đổi trạng thái khuyến mãi');
    }
  };

  if (loading && !showForm) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Không có thông tin';
  };

  return (
    <div className="admin-promotions">
      <div className="admin-section-header">
        <h2>Quản lý khuyến mãi</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (showForm && editingId) {
              resetForm();
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm ? (editingId ? 'Hủy chỉnh sửa' : 'Hủy') : 'Thêm khuyến mãi mới'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="promotion-form">
          <h3>{editingId ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code">Mã khuyến mãi:</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="restaurantId">Nhà hàng áp dụng:</label>
                <select
                  id="restaurantId"
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleInputChange}
                  required
                >
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="discountType">Loại giảm giá:</label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="discountValue">Giá trị giảm giá:</label>
                <input
                  type="number"
                  id="discountValue"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min={formData.discountType === 'percentage' ? "0" : "1000"}
                  max={formData.discountType === 'percentage' ? "100" : "100000000"}
                  step={formData.discountType === 'percentage' ? "0.1" : "1000"}
                  required
                />
                <span className="input-suffix">
                  {formData.discountType === 'percentage' ? '%' : 'VNĐ'}
                </span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minimumOrderAmount">Giá trị đơn hàng tối thiểu (VNĐ):</label>
                <input
                  type="number"
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  value={formData.minimumOrderAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="maximumDiscount">Giảm giá tối đa (VNĐ):</label>
                <input
                  type="number"
                  id="maximumDiscount"
                  name="maximumDiscount"
                  value={formData.maximumDiscount}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usageLimit">Giới hạn sử dụng:</label>
                <input
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive">Kích hoạt</label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="promotions-list">
        <h3>Danh sách khuyến mãi</h3>
        {promotions.length === 0 ? (
          <p>Không có khuyến mãi nào.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Nhà hàng</th>
                <th>Mô tả</th>
                <th>Giảm giá</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo.id}>
                  <td>{promo.code}</td>
                  <td>{getRestaurantName(promo.restaurantId)}</td>
                  <td>{promo.description || 'Không có mô tả'}</td>
                  <td>
                    {promo.discountType === 'percentage' 
                      ? `${promo.discountValue}%` 
                      : `${promo.discountValue.toLocaleString('vi-VN')}đ`}
                    {promo.maximumDiscount && (
                      <div className="max-discount">
                        Tối đa: {promo.maximumDiscount.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                  </td>
                  <td>
                    <div>Từ: {new Date(promo.startDate).toLocaleDateString('vi-VN')}</div>
                    <div>Đến: {new Date(promo.endDate).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${promo.isActive ? 'status-active' : 'status-inactive'}`}
                      onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                    >
                      {promo.isActive ? 'Đang kích hoạt' : 'Đã tắt'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning mr-2"
                      onClick={() => handleEditPromotion(promo)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeletePromotion(promo.id)}
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

export default AdminPromotions; 