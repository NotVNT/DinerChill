import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../services/api';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconClass: '',
    displayOrder: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/categories');
      setCategories(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconClass: '',
      displayOrder: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0
      };

      if (editingId) {
        // Update existing category
        await fetchWithAuth(`/admin/categories/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new category
        await fetchWithAuth('/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(`Không thể ${editingId ? 'cập nhật' : 'thêm'} danh mục`);
    }
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      iconClass: category.iconClass || '',
      displayOrder: category.displayOrder ? category.displayOrder.toString() : '0'
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await fetchWithAuth(`/admin/categories/${categoryId}`, {
          method: 'DELETE'
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Không thể xóa danh mục');
      }
    }
  };

  if (loading && !showForm) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-categories">
      <div className="admin-section-header">
        <h2>Quản lý danh mục</h2>
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
          {showForm ? (editingId ? 'Hủy chỉnh sửa' : 'Hủy') : 'Thêm danh mục mới'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="category-form">
          <h3>{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Tên danh mục:</label>
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
              <label htmlFor="iconClass">Icon Class (Font Awesome):</label>
              <input
                type="text"
                id="iconClass"
                name="iconClass"
                value={formData.iconClass}
                onChange={handleInputChange}
                placeholder="fa-utensils"
              />
              {formData.iconClass && (
                <div className="icon-preview">
                  <i className={`fa ${formData.iconClass}`}></i>
                  <span>Icon preview (requires Font Awesome)</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="displayOrder">Thứ tự hiển thị:</label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
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

      <div className="categories-list">
        <h3>Danh sách danh mục</h3>
        {categories.length === 0 ? (
          <p>Không có danh mục nào.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Icon</th>
                <th>Thứ tự hiển thị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || 'Không có mô tả'}</td>
                  <td>
                    {category.iconClass ? (
                      <i className={`fa ${category.iconClass}`}></i>
                    ) : (
                      'Không có icon'
                    )}
                  </td>
                  <td>{category.displayOrder || 0}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning mr-2"
                      onClick={() => handleEditCategory(category)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCategory(category.id)}
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

export default AdminCategories; 