import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [viewingRestaurant, setViewingRestaurant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setSuccess(null); // Reset any previous success message
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
      formDataToSend.append('email', formData.email || ``);
      
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
        setSuccess(`Đã cập nhật nhà hàng "${updatedRestaurant.name}" thành công!`);
      } else {
        // Thêm nhà hàng mới
        console.log('Creating new restaurant');
        updatedRestaurant = await adminAPI.createRestaurant(formDataToSend);
        console.log('Restaurant created successfully');
        setRestaurants(prev => [...prev, updatedRestaurant]);
        setSuccess(`Đã thêm nhà hàng "${updatedRestaurant.name}" thành công!`);
      }
      
      // Reset form
      resetForm();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
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
        setSuccess(null);
        
        // Find restaurant name before deleting
        const restaurantToDelete = restaurants.find(restaurant => restaurant.id === restaurantId);
        const restaurantName = restaurantToDelete ? restaurantToDelete.name : 'Nhà hàng';
        
        await adminAPI.deleteRestaurant(restaurantId);
        setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
        setSuccess(`Đã xóa nhà hàng "${restaurantName}" thành công!`);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
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
      
      setSuccess(`Đã cập nhật trạng thái nhà hàng "${restaurant.name}" thành ${newStatus === 'active' ? 'Đang hoạt động' : 'Tạm ngừng'}`);
      
      // Close modal
      closeStatusModal();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      setError('Không thể cập nhật trạng thái nhà hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-restaurants">
      <div className="page-header">
        <h1>Quản lý Nhà hàng</h1>
        <button className="btn-action btn-add" onClick={() => setEditingRestaurant({})}>
          <i className="fa fa-plus-circle"></i> Thêm nhà hàng mới
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fa fa-exclamation-circle alert-icon"></i>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <i className="fa fa-check-circle alert-icon"></i>
          {success}
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
                <input
                  id="cuisine"
                  type="text"
                  name="cuisine"
                  className="form-control"
                  value={formData.cuisine}
                  onChange={handleChange}
                  placeholder="Ví dụ: Việt Nam, Ý, Nhật Bản..."
                  required
                />
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
            <div className="table-responsive">
              <table className="table table-hover admin-table">
                <thead className="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Tên nhà hàng</th>
                    <th>Loại ẩm thực</th>
                    <th>Trạng thái</th>
                    <th>Địa chỉ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants && restaurants.length > 0 ? (
                    restaurants.map(restaurant => (
                      <tr key={restaurant.id}>
                        <td>{restaurant.id}</td>
                        <td>
                          {restaurant.images && restaurant.images.length > 0 ? (
                            <img 
                              src={restaurant.images[0].image_url} 
                              alt={restaurant.name} 
                              className="restaurant-thumbnail" 
                              width="50"
                              height="50"
                            />
                          ) : (
                            <div className="no-image-placeholder-small">
                              <i className="fa fa-image"></i>
                            </div>
                          )}
                        </td>
                        <td>{restaurant.name}</td>
                        <td>{restaurant.cuisine || restaurant.cuisineType}</td>
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
                          <i className="fa fa-utensils fa-3x"></i>
                          <p>Không có dữ liệu nhà hàng</p>
                          <button className="btn btn-primary" onClick={() => setEditingRestaurant({})}>
                            Thêm nhà hàng đầu tiên
                          </button>
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

      <style jsx>{`
        .admin-restaurants {
          padding: 20px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .card {
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
          padding: 15px 20px;
        }
        .card-body {
          padding: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-control {
          border-radius: 4px;
          border: 1px solid #ddd;
          padding: 10px 12px;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        .form-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background-color: #007bff;
          border-color: #007bff;
          color: white;
        }
        .btn-success {
          background-color: #28a745;
          border-color: #28a745;
          color: white;
        }
        .btn-secondary {
          background-color: #6c757d;
          border-color: #6c757d;
          color: white;
        }
        .btn-danger {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        .btn-info {
          background-color: #17a2b8;
          border-color: #17a2b8;
          color: white;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .alert {
          padding: 12px 15px 12px 45px;
          border-radius: 4px;
          margin-bottom: 20px;
          position: relative;
          animation: fadeIn 0.3s ease;
        }
        .alert-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
        }
        .alert-danger {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }
        .alert-success {
          background-color: #d4edda;
          border-color: #c3e6cb;
          color: #155724;
          font-weight: 500;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 12px 15px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }
        .thead-light th {
          background-color: #f8f9fa;
          border-color: #dee2e6;
          font-weight: 600;
        }
        .restaurant-thumbnail {
          border-radius: 4px;
          object-fit: cover;
        }
        .empty-state {
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          color: #6c757d;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          gap: 15px;
        }
        .image-upload-container {
          margin-bottom: 15px;
        }
        .image-upload-area {
          position: relative;
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background-color: #f9f9f9;
          margin-bottom: 15px;
        }
        .image-upload-area:hover {
          border-color: #80bdff;
          background-color: #f0f7ff;
        }
        .image-upload-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .image-upload-placeholder {
          padding: 20px;
          color: #666;
        }
        .image-upload-placeholder i {
          font-size: 32px;
          margin-bottom: 10px;
          color: #007bff;
        }
        .image-upload-placeholder p {
          margin-bottom: 5px;
          font-weight: 500;
        }
        .image-upload-placeholder small {
          color: #888;
        }
        .image-preview-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        .image-preview-item {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #ddd;
        }
        .preview-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          color: #dc3545;
        }
        .remove-image-btn:hover {
          background: rgba(255, 255, 255, 1);
          color: #bd2130;
        }
        .legacy-url-field {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #eee;
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        .add-button {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .form-row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -10px;
          margin-left: -10px;
        }
        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
          padding-right: 10px;
          padding-left: 10px;
        }
        @media (max-width: 768px) {
          .col-md-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }
          .form-buttons {
            flex-direction: column;
          }
        }

        /* Modal Chi tiết nhà hàng */
        .restaurant-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: -1;
        }

        .modal-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #ddd;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #777;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .restaurant-detail-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-header {
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .restaurant-name {
          font-size: 1.8rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .restaurant-cuisine {
          font-size: 1.1rem;
          color: #666;
        }

        .detail-image {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .detail-image img {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .detail-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h3 {
          font-size: 1.2rem;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
          color: #555;
        }

        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }

        .detail-label {
          width: 150px;
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          flex: 1;
          color: #333;
        }

        .detail-description {
          margin-top: 10px;
        }

        .detail-description h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }

        .detail-description p {
          line-height: 1.6;
          color: #555;
        }

        .detail-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #5a6268;
        }

        /* Restaurant image gallery */
        .restaurant-images-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
          width: 100%;
        }
        
        .gallery-image-item {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          aspect-ratio: 4/3;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .gallery-image-item:hover {
          transform: scale(1.02);
        }
        
        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .single-image-container {
          width: 100%;
          max-height: 300px;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }
        
        .detail-single-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .no-image-placeholder {
          width: 100%;
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 2px dashed #ddd;
          margin: 20px 0;
          color: #888;
        }
        
        .no-image-placeholder i {
          font-size: 48px;
          margin-bottom: 10px;
          opacity: 0.5;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .restaurant-images-gallery {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
        
        @media (max-width: 480px) {
          .restaurant-images-gallery {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }

        .no-image-placeholder-small {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9f9f9;
          border-radius: 4px;
          border: 1px solid #ddd;
          color: #aaa;
        }
        
        .no-image-placeholder-small i {
          font-size: 18px;
        }

        /* Action buttons styling */
        .action-buttons {
          display: flex;
          justify-content: flex-start;
          gap: 8px;
        }
        
        .btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-action i {
          font-size: 16px;
        }
        
        .btn-view {
          background-color: #17a2b8;
          color: white;
        }
        
        .btn-view:hover {
          background-color: #138496;
        }
        
        .btn-edit {
          background-color: #ffc107;
          color: #212529;
        }
        
        .btn-edit:hover {
          background-color: #e0a800;
        }
        
        .btn-delete {
          background-color: #dc3545;
          color: white;
        }
        
        .btn-delete:hover {
          background-color: #c82333;
        }
        
        @media (max-width: 768px) {
          .btn-action span {
            display: none;
          }
          
          .btn-action {
            padding: 8px;
          }
          
          .action-buttons {
            gap: 5px;
          }
        }

        .btn-add {
          background-color: #28a745;
          color: white;
          font-size: 16px;
          padding: 10px 20px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .btn-add:hover {
          background-color: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-add i {
          font-size: 18px;
          margin-right: 6px;
        }

        /* Status styles */
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        
        .status-badge.active {
          background-color: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #a5d6a7;
        }
        
        .status-badge.maintenance {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ef9a9a;
        }
        
        .status-badge:hover {
          opacity: 0.8;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .closure-reason {
          font-style: italic;
          color: #c62828;
          margin-top: 4px;
          font-size: 12px;
        }
        
        /* Status change modal */
        .status-change-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1060;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .status-change-modal .modal-content {
          width: 450px;
          max-width: 90%;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .status-change-modal .modal-header {
          background-color: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .status-change-modal .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }
        
        .status-change-modal .modal-body {
          padding: 20px;
        }
        
        .restaurant-name-container {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .restaurant-name-container i {
          color: #007bff;
          font-size: 18px;
        }
        
        .restaurant-name-container strong {
          color: #333;
        }
        
        .status-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .option-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }
        
        .status-radio-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 8px;
        }
        
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 10px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .radio-label:hover {
          background-color: #f5f5f5;
        }
        
        .radio-label input[type="radio"] {
          position: absolute;
          opacity: 0;
        }
        
        .radio-custom {
          display: inline-block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #ccc;
          position: relative;
          transition: all 0.2s;
        }
        
        .radio-label input[type="radio"]:checked + .radio-custom {
          border-color: #007bff;
        }
        
        .radio-label input[type="radio"]:checked + .radio-custom:after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #007bff;
        }
        
        .closure-reason-container {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .status-change-modal .form-control {
          border-radius: 4px;
          border: 1px solid #ddd;
          padding: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          resize: vertical;
        }
        
        .status-change-modal .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 15px 20px;
          border-top: 1px solid #eee;
          background-color: #f8f9fa;
        }
        
        .update-btn, .cancel-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }
        
        .update-btn {
          background-color: #007bff;
          color: white;
        }
        
        .update-btn:hover {
          background-color: #0069d9;
        }
        
        .update-btn:disabled {
          background-color: #80bdff;
          cursor: not-allowed;
        }
        
        .cancel-btn {
          background-color: #6c757d;
          color: white;
        }
        
        .cancel-btn:hover {
          background-color: #5a6268;
        }
      `}</style>
    </div>
  );
}

export default AdminRestaurants;