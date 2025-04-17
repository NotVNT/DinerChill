import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/admin_layout/admin_restaurant.css';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [viewingRestaurant, setViewingRestaurant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    restaurant: null,
    newStatus: '',
    closureReason: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    images: [],
    description: '',
    openingTime: '',
    closingTime: '',
    phone: '',
    email: '',
    capacity: '',
    priceRange: '',
    status: 'active'
  });

  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
    }
  };

  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant);
    
    // Chuẩn bị mảng hình ảnh từ images
    let initialImages = [];
    
    if (restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0) {
      // Sử dụng trường images từ quan hệ với bảng restaurant_images
      initialImages = restaurant.images.map((image) => ({
        id: `db-${image.id}`,
        url: image.image_url,
        preview: image.image_url,
        dbId: image.id // Lưu ID từ database để có thể xóa sau này
      }));
    } else if (restaurant.image) {
      initialImages = [{
        id: 'existing-0',
        url: restaurant.image,
        preview: restaurant.image
      }];
    }
    
    setFormData({
      name: restaurant.name,
      cuisine: restaurant.cuisine || restaurant.cuisineType || '',
      address: restaurant.address || '',
      images: initialImages,
      description: restaurant.description || '',
      openingTime: restaurant.openingTime || '10:00',
      closingTime: restaurant.closingTime || '22:00',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      capacity: restaurant.capacity ? restaurant.capacity.toString() : '',
      priceRange: restaurant.priceRange || '200.000đ - 500.000đ',
      status: restaurant.status || 'active'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newImages = [...formData.images];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        
        reader.onload = (event) => {
          newImages.push({
            id: Date.now() + i, // Generate a temporary unique ID
            file: file,
            preview: event.target.result
          });
          
          setFormData(prev => ({
            ...prev,
            images: newImages
          }));
        };
        
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset any previous error
    setIsSubmitting(true); // Set submitting state to true when form is submitted
    
    try {
      // Validate required fields
      if (!formData.name || !formData.address) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc (tên và địa chỉ nhà hàng).');
        setIsSubmitting(false); // Reset submitting state
        return;
      }
      
      // Tạo FormData để xử lý tải lên nhiều hình ảnh
      const formDataToSend = new FormData();
      
      // Thêm thông tin cơ bản
      formDataToSend.append('name', formData.name);
      formDataToSend.append('cuisineType', formData.cuisine || 'Chưa phân loại');
      formDataToSend.append('address', formData.address);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('openingTime', formData.openingTime || '');
      formDataToSend.append('closingTime', formData.closingTime || '');
      formDataToSend.append('phone', formData.phone || '');
      
      // Use provided email or generate a default one if empty
      formDataToSend.append('email', formData.email || '');
      
      formDataToSend.append('priceRange', formData.priceRange || '');
      formDataToSend.append('status', 'active'); // Always set status to 'active'
      
      if (formData.capacity) {
        formDataToSend.append('capacity', formData.capacity);
      }
      
      console.log('Sending data, image count:', formData.images.length);
      
      // Xử lý tải lên hình ảnh lên cloud storage
      let hasFiles = false;
      formData.images.forEach((image, index) => {
        if (image.file) {
          hasFiles = true;
          // Gửi file gốc để backend upload lên cloud
          formDataToSend.append('restaurantImages', image.file);
          console.log('Adding image file:', image.file.name);
        }
      });
      
      // Nếu không có file mới, hiển thị thông báo
      if (!hasFiles && !editingRestaurant.id) {
        console.log('No image files selected for new restaurant');
      }
      
      // Nếu đang chỉnh sửa, thêm các URLs của hình ảnh đã tồn tại
      if (editingRestaurant && editingRestaurant.id) {
        // Lọc ra các ảnh đã lưu trên cloud (có URL bắt đầu bằng http)
        const existingCloudImages = formData.images
          .filter(img => img.url && (img.url.startsWith('http') || img.url.startsWith('https')))
          .map(img => img.url);
        
        if (existingCloudImages.length > 0) {
          formDataToSend.append('existingCloudImages', JSON.stringify(existingCloudImages));
          console.log('Existing cloud images:', existingCloudImages.length);
        }
      }
      
      console.log('Dữ liệu gửi đi:', {
        name: formData.name,
        cuisineType: formData.cuisine,
        address: formData.address,
        imageCount: formData.images.length,
        hasFiles,
        isNewRestaurant: !editingRestaurant.id
      });

      let updatedRestaurant;
      if (editingRestaurant && editingRestaurant.id) {
        // Cập nhật nhà hàng hiện có
        console.log('Updating restaurant with ID:', editingRestaurant.id);
        updatedRestaurant = await adminAPI.updateRestaurant(editingRestaurant.id, formDataToSend);
        console.log('Restaurant updated successfully');
        setRestaurants(prev => prev.map(restaurant => 
          restaurant.id === editingRestaurant.id ? updatedRestaurant : restaurant
        ));
        showToast(`Đã cập nhật nhà hàng "${updatedRestaurant.name}" thành công!`, 'warning');
        createNotification(`Đã cập nhật nhà hàng "${updatedRestaurant.name}"`);
      } else {
        // Thêm nhà hàng mới
        console.log('Creating new restaurant');
        updatedRestaurant = await adminAPI.createRestaurant(formDataToSend);
        console.log('Restaurant created successfully');
        setRestaurants(prev => [...prev, updatedRestaurant]);
        showToast(`Đã thêm nhà hàng "${updatedRestaurant.name}" thành công!`, 'success');
        createNotification(`Đã thêm nhà hàng mới "${updatedRestaurant.name}"`);
      }
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Chi tiết lỗi khi lưu nhà hàng:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Không thể lưu thông tin nhà hàng: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Không thể lưu thông tin nhà hàng: ${err.message}`);
      } else {
        setError('Không thể lưu thông tin nhà hàng. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of success or failure
    }
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      cuisine: '',
      address: '',
      images: [],
      description: '',
      openingTime: '',
      closingTime: '',
      phone: '',
      email: '',
      capacity: '',
      priceRange: '',
      status: 'active'
    });
  };

  const handleDeleteClick = async (restaurantId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà hàng này?')) {
      try {
        setError(null);
        
        // Find restaurant name before deleting
        const restaurantToDelete = restaurants.find(restaurant => restaurant.id === restaurantId);
        const restaurantName = restaurantToDelete ? restaurantToDelete.name : 'Nhà hàng';
        
        await adminAPI.deleteRestaurant(restaurantId);
        setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
        showToast(`Đã xóa nhà hàng "${restaurantName}" thành công!`, 'danger');
        createNotification(`Đã xóa nhà hàng "${restaurantName}"`, 'danger');
      } catch (err) {
        console.error('Error deleting restaurant:', err);
        setError('Không thể xóa nhà hàng. Vui lòng thử lại.');
      }
    }
  };

  const handleViewClick = (restaurant) => {
    setViewingRestaurant(restaurant);
  };

  const closeDetailView = () => {
    setViewingRestaurant(null);
  };

  const handleStatusToggleClick = (restaurant) => {
    setStatusChangeModal({
      isOpen: true,
      restaurant: restaurant,
      newStatus: restaurant.status === 'active' ? 'maintenance' : 'active',
      closureReason: restaurant.closureReason || ''
    });
  };

  const closeStatusModal = () => {
    setStatusChangeModal({
      isOpen: false,
      restaurant: null,
      newStatus: '',
      closureReason: ''
    });
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusChangeModal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { restaurant, newStatus, closureReason } = statusChangeModal;
      
      if (newStatus === 'maintenance' && !closureReason.trim()) {
        setError('Vui lòng nhập lý do tạm ngừng');
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('status', newStatus);
      
      if (newStatus === 'maintenance') {
        formData.append('closureReason', closureReason);
      } else {
        formData.append('closureReason', '');
      }
      
      // Update restaurant status
      const updatedRestaurant = await adminAPI.updateRestaurant(restaurant.id, formData);
      
      // Update local state
      setRestaurants(prev => prev.map(r => 
        r.id === restaurant.id ? updatedRestaurant : r
      ));
      
      showToast(`Đã cập nhật trạng thái nhà hàng "${restaurant.name}" thành ${newStatus === 'active' ? 'Đang hoạt động' : 'Tạm ngừng'}`, 'warning');
      createNotification(`Đã cập nhật trạng thái nhà hàng "${restaurant.name}" thành ${newStatus === 'active' ? 'Đang hoạt động' : 'Tạm ngừng'}`);
      
      // Close modal
      closeStatusModal();
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      setError('Không thể cập nhật trạng thái nhà hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter(restaurant => {
    if (!searchQuery.trim()) return true;
    
    // Function to normalize Vietnamese text (remove diacritics)
    const normalizeVietnamese = (str) => {
      return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase();
    };
    
    // Check if search query contains diacritics
    const hasAccents = (str) => {
      return /[\u0300-\u036f]/.test(str.normalize('NFD'));
    };
    
    const queryHasAccents = hasAccents(searchQuery);
    
    if (queryHasAccents) {
      // If query has accents, do exact match (case insensitive)
      const lowerQuery = searchQuery.toLowerCase();
      const lowerName = (restaurant.name || '').toLowerCase();
      const lowerAddress = (restaurant.address || '').toLowerCase();
      
      return lowerName.includes(lowerQuery) || lowerAddress.includes(lowerQuery);
    } else {
      // If query has no accents, use normalized search (accent insensitive)
      const normalizedQuery = normalizeVietnamese(searchQuery);
      const normalizedName = normalizeVietnamese(restaurant.name || '');
      const normalizedAddress = normalizeVietnamese(restaurant.address || '');
      
      return normalizedName.includes(normalizedQuery) || normalizedAddress.includes(normalizedQuery);
    }
  });

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

  return (
    <div className="admin-restaurants">
      <div className="page-header">
        <h1>Quản lý Nhà hàng</h1>
        <button className="btn-action btn-add" onClick={() => setEditingRestaurant({})}>
          <i className="fa fa-plus-circle"></i> Thêm nhà hàng mới
        </button>
      </div>
      
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
      `}</style>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fa fa-exclamation-circle alert-icon"></i>
          {error}
        </div>
      )}
      
      {editingRestaurant !== null ? (
        <div className="card edit-form-card">
          <div className="card-header">
            <h2>{editingRestaurant.id ? "Chỉnh sửa nhà hàng" : "Thêm nhà hàng mới"}</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="restaurant-form">
              <div className="form-group">
                <label htmlFor="name">Tên nhà hàng</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên nhà hàng"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cuisine">Loại ẩm thực</label>
                <select
                  id="cuisine"
                  name="cuisine"
                  className="form-control"
                  value={formData.cuisine}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn loại ẩm thực</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ đầy đủ"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="images">Hình ảnh nhà hàng</label>
                <div className="image-upload-container">
                  <div className="image-upload-area">
                    <input
                      id="images"
                      type="file"
                      name="images"
                      className="image-upload-input"
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                    />
                    <div className="image-upload-placeholder">
                      <i className="fa fa-cloud-upload"></i>
                      <p>Kéo thả hình ảnh hoặc click để chọn</p>
                      <small>Hình ảnh chỉ được lưu tạm trong phiên làm việc, không lưu vào database</small>
                    </div>
                  </div>
                  
                  {formData.images && formData.images.length > 0 && (
                    <div className="image-preview-container">
                      {formData.images.map((image, index) => (
                        <div key={image.id || index} className="image-preview-item">
                          <img 
                            src={image.preview || image.url} 
                            alt={`Hình ảnh ${index + 1}`} 
                            className="preview-thumbnail" 
                          />
                          <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(image.id || index)}
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.images && formData.images.length > 0 && (
                  <div className="text-muted mt-2 image-info">
                    <i className="fa fa-info-circle"></i> Đã tải lên {formData.images.length} hình ảnh
                  </div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="openingTime">Giờ mở cửa</label>
                  <input
                    id="openingTime"
                    type="time"
                    name="openingTime"
                    className="form-control"
                    value={formData.openingTime}
                    onChange={handleChange}
                    placeholder="Ví dụ: 08:00"
                  />
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="closingTime">Giờ đóng cửa</label>
                  <input
                    id="closingTime"
                    type="time"
                    name="closingTime"
                    className="form-control"
                    value={formData.closingTime}
                    onChange={handleChange}
                    placeholder="Ví dụ: 22:00"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email liên hệ"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="capacity">Sức chứa (người)</label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  className="form-control"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  placeholder="Nhập sức chứa nhà hàng"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priceRange">Mức giá:</label>
                <input
                  type="text"
                  id="priceRange"
                  name="priceRange"
                  className="form-control"
                  value={formData.priceRange}
                  onChange={handleChange}
                  placeholder="Ví dụ: 200.000đ - 500.000đ"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Mô tả chi tiết về nhà hàng"
                ></textarea>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-2">Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save"></i> {editingRestaurant.id ? 'Cập nhật' : 'Thêm mới'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  <i className="fa fa-times"></i> Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Đang tải dữ liệu...</span>
          </div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="card restaurant-table-card">
          <div className="card-body">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm theo tên nhà hàng hoặc địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div className="search-results-info">
                <i className="fa fa-search"></i> Tìm thấy {filteredRestaurants.length} nhà hàng
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-hover admin-table">
                <thead className="thead-light">
                  <tr>
                    <th style={{ width: '15%' }}>Tên nhà hàng</th>
                    <th style={{ width: '4%' }}>Loại ẩm thực</th>
                    <th style={{ width: '10%' }}>Sức chứa</th>
                    <th style={{ width: '8%' }}>Trạng thái</th>
                    <th style={{ width: '20%' }}>Địa chỉ</th>
                    <th style={{ width: '10%' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants && filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map(restaurant => (
                      <tr key={restaurant.id}>
                        <td>{restaurant.name}</td>
                        <td>{restaurant.cuisine || restaurant.cuisineType}</td>
                        <td>{restaurant.capacity ? `${restaurant.capacity} người` : 'Chưa cập nhật'}</td>
                        <td>
                          <span 
                            className={`status-badge ${restaurant.status === 'active' ? 'active' : 'maintenance'}`}
                            onClick={() => handleStatusToggleClick(restaurant)}
                            title="Nhấn để thay đổi trạng thái"
                            style={{ cursor: 'pointer' }}
                          >
                            {restaurant.status === 'active' ? 'Đang hoạt động' : 'Tạm ngừng'}
                          </span>
                          {restaurant.status === 'maintenance' && restaurant.closureReason && (
                            <div className="closure-reason">
                              <small><i className="fa fa-info-circle"></i> {restaurant.closureReason}</small>
                            </div>
                          )}
                        </td>
                        <td>{restaurant.address}</td>
                        <td className="action-buttons">
                          <button 
                            className="btn-action btn-view"
                            onClick={() => handleViewClick(restaurant)}
                            title="Xem chi tiết"
                          >
                            <i className="fa fa-eye"></i>
                            <span>Xem</span>
                          </button>
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEditClick(restaurant)}
                            title="Chỉnh sửa"
                          >
                            <i className="fa fa-edit"></i>
                            <span>Sửa</span>
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteClick(restaurant.id)}
                            title="Xóa"
                          >
                            <i className="fa fa-trash"></i>
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center no-data">
                        <div className="empty-state">
                          {searchQuery ? (
                            <>
                              <i className="fa fa-search fa-3x"></i>
                              <p>Không tìm thấy nhà hàng nào phù hợp với "{searchQuery}"</p>
                              <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
                                Xóa tìm kiếm
                              </button>
                            </>
                          ) : (
                            <>
                              <i className="fa fa-utensils fa-3x"></i>
                              <p>Không có dữ liệu nhà hàng</p>
                              <button className="btn btn-primary" onClick={() => setEditingRestaurant({})}>
                                Thêm nhà hàng đầu tiên
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Nhà hàng */}
      {viewingRestaurant && (
        <div className="restaurant-detail-modal">
          <div className="modal-backdrop" onClick={closeDetailView}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chi tiết nhà hàng</h2>
              <button type="button" className="close-btn" onClick={closeDetailView}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="restaurant-detail-content">
                <div className="detail-header">
                  <div className="restaurant-name">{viewingRestaurant.name}</div>
                  <div className="restaurant-cuisine">{viewingRestaurant.cuisine || viewingRestaurant.cuisineType}</div>
                </div>
                
                {/* Restaurant Images Gallery */}
                <div className="restaurant-images-gallery">
                  {viewingRestaurant.images && viewingRestaurant.images.length > 0 ? (
                    viewingRestaurant.images.map((image, index) => (
                      <div key={index} className="gallery-image-item">
                        <img 
                          src={image.image_url} 
                          alt={`${viewingRestaurant.name} - Ảnh ${index + 1}`} 
                          className="gallery-image" 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="no-image-placeholder">
                      <i className="fa fa-image"></i>
                      <p>Không có hình ảnh</p>
                    </div>
                  )}
                </div>
                
                <div className="detail-info-grid">
                  <div className="detail-section">
                    <h3>Thông tin cơ bản</h3>
                    <div className="detail-row">
                      <div className="detail-label">ID:</div>
                      <div className="detail-value">{viewingRestaurant.id}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Địa chỉ:</div>
                      <div className="detail-value">{viewingRestaurant.address}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Giờ mở cửa:</div>
                      <div className="detail-value">
                        {viewingRestaurant.openingTime} - {viewingRestaurant.closingTime}
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Số điện thoại:</div>
                      <div className="detail-value">{viewingRestaurant.phone}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Email:</div>
                      <div className="detail-value">{viewingRestaurant.email}</div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Thông tin bổ sung</h3>
                    <div className="detail-row">
                      <div className="detail-label">Sức chứa:</div>
                      <div className="detail-value">
                        {viewingRestaurant.capacity ? `${viewingRestaurant.capacity} người` : 'Chưa cập nhật'}
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Mức giá:</div>
                      <div className="detail-value">{viewingRestaurant.priceRange || 'Chưa cập nhật'}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Ngày tạo:</div>
                      <div className="detail-value">
                        {new Date(viewingRestaurant.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Cập nhật lần cuối:</div>
                      <div className="detail-value">
                        {new Date(viewingRestaurant.updatedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="detail-description">
                  <h3>Mô tả</h3>
                  <p>{viewingRestaurant.description || 'Không có mô tả'}</p>
                </div>
                
                <div className="detail-actions">
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => {
                      handleEditClick(viewingRestaurant);
                      closeDetailView();
                    }}
                  >
                    <i className="fa fa-edit"></i> Chỉnh sửa
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa nhà hàng này?')) {
                        const restaurantId = viewingRestaurant.id;
                        handleDeleteClick(restaurantId);
                        closeDetailView();
                      }
                    }}
                  >
                    <i className="fa fa-trash"></i> Xóa
                  </button>
                  <button 
                    className="btn-action btn-secondary"
                    onClick={closeDetailView}
                  >
                    <i className="fa fa-times"></i> Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusChangeModal.isOpen && statusChangeModal.restaurant && (
        <div className="status-change-modal">
          <div className="modal-backdrop" onClick={closeStatusModal}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thay đổi trạng thái nhà hàng</h3>
              <button type="button" className="close-btn" onClick={closeStatusModal}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="restaurant-name-container">
                <i className="fa fa-store"></i>
                <strong>{statusChangeModal.restaurant.name}</strong>
              </div>
              
              <div className="status-options">
                <div className="form-group">
                  <label className="option-label">Trạng thái:</label>
                  <div className="status-radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="newStatus"
                        value="active"
                        checked={statusChangeModal.newStatus === 'active'}
                        onChange={handleStatusChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="status-badge active">
                        <i className="fa fa-check-circle"></i> Đang hoạt động
                      </span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="newStatus"
                        value="maintenance"
                        checked={statusChangeModal.newStatus === 'maintenance'}
                        onChange={handleStatusChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="status-badge maintenance">
                        <i className="fa fa-pause-circle"></i> Tạm ngừng
                      </span>
                    </label>
                  </div>
                </div>
                
                {statusChangeModal.newStatus === 'maintenance' && (
                  <div className="form-group closure-reason-container">
                    <label htmlFor="closureReason" className="option-label">Lý do tạm ngừng:</label>
                    <textarea
                      id="closureReason"
                      name="closureReason"
                      className="form-control"
                      value={statusChangeModal.closureReason}
                      onChange={handleStatusChange}
                      rows="3"
                      placeholder="Vui lòng nhập lý do tạm ngừng hoạt động"
                      required
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary update-btn" 
                onClick={handleStatusUpdate}
                disabled={isSubmitting || (statusChangeModal.newStatus === 'maintenance' && !statusChangeModal.closureReason.trim())}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-save"></i> Cập nhật
                  </>
                )}
              </button>
              <button className="btn btn-secondary cancel-btn" onClick={closeStatusModal}>
                <i className="fa fa-times"></i> Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;