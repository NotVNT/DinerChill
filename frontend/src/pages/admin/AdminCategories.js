import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import styled from 'styled-components';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Styled Components
const PageContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    font-size: 24px;
    color: #333;
    margin: 0;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => props.variant === 'danger' 
    ? '#dc3545' 
    : props.variant === 'warning' 
    ? '#ffc107'
    : props.variant === 'success'
    ? '#28a745'
    : '#FF7043'};
  color: ${props => props.variant === 'warning' ? '#212529' : '#fff'};
  margin-left: ${props => props.marginLeft ? '8px' : '0'};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    margin-right: 8px;
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const FormTitle = styled.h3`
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 12px;

  label {
    display: block;
    margin-bottom: 4px;
    color: #555;
    font-weight: 500;
    font-size: 14px;
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
      border-color: #FF7043;
      outline: none;
    }
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

const ImageUploadContainer = styled.div`
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  &:hover {
    border-color: #FF7043;
  }

  input[type="file"] {
    display: none;
  }

  .upload-icon {
    font-size: 40px;
    color: #999;
    margin-bottom: 10px;
  }

  .upload-text {
    color: #666;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
  }

  td {
    vertical-align: middle;
  }

  tbody tr:hover {
    background-color: #f5f5f5;
  }

  .image-cell {
    width: 100px;
    img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
  }

  .actions-cell {
    width: 150px;
    text-align: right;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;

  i {
    font-size: 48px;
    color: #999;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 10px;
    font-size: 18px;
  }
`;

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCategories();
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      ...formData,
      imageUrl: ''
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl);
      }

      if (editingId) {
        await adminAPI.updateCategory(editingId, formDataToSend);
      } else {
        await adminAPI.createCategory(formDataToSend);
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(`Không thể ${editingId ? 'cập nhật' : 'thêm'} danh mục`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || ''
    });
    setEditingId(category.id);
    setImagePreview(category.imageUrl);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await adminAPI.deleteCategory(categoryId);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Không thể xóa danh mục');
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <h2>Quản lý danh mục</h2>
        <ActionButton 
          onClick={() => {
            if (showForm && editingId) {
              resetForm();
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm ? (
            <>
              <i className="bi bi-x-circle"></i> {editingId ? 'Hủy chỉnh sửa' : 'Hủy'}
            </>
          ) : (
            <>
              <i className="bi bi-plus"></i> Thêm danh mục mới
            </>
          )}
        </ActionButton>
      </PageHeader>

      {error && (
        <ErrorMessage>
          <i className="bi bi-x-circle"></i>
          {error}
        </ErrorMessage>
      )}

      {showForm && (
        <FormContainer>
          <FormTitle>{editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</FormTitle>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <FormGroup>
                  <label htmlFor="name">Tên danh mục:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên danh mục"
                    style={{ height: '32px' }}
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="description">Mô tả:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả về danh mục"
                    style={{ height: '80px' }}
                  />
                </FormGroup>
              </div>
              <div>
                <FormGroup>
                  <label>Hình ảnh:</label>
                  {imagePreview ? (
                    <ImagePreview>
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" onClick={removeImage}>
                        <i className="bi bi-x"></i>
                      </button>
                    </ImagePreview>
                  ) : (
                    <ImageUploadContainer onClick={() => document.getElementById('image').click()}>
                      <i className="bi bi-image upload-icon"></i>
                      <span className="upload-text">Click để tải lên hình ảnh</span>
                      <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </ImageUploadContainer>
                  )}
                </FormGroup>
              </div>
            </FormGrid>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <ActionButton 
                type="submit" 
                variant="success"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="bi bi-plus spinner"></i>
                    {editingId ? 'Đang cập nhật...' : 'Đang thêm...'}
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus"></i>
                    {editingId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
                  </>
                )}
              </ActionButton>
            </div>
          </form>
        </FormContainer>
      )}

      <TableContainer>
        {loading ? (
          <EmptyState>
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </EmptyState>
        ) : categories.length === 0 ? (
          <EmptyState>
            <i className="bi bi-image"></i>
            <p>Chưa có danh mục nào. Hãy thêm danh mục mới!</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Tên danh mục</th>
                <th style={{ width: '70%' }}>Mô tả</th>
                <th style={{ width: '10%' }}>Hình ảnh</th>
                <th className="actions-cell" style={{ width: '20%' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || 'Không có mô tả'}</td>
                  <td className="image-cell">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={category.name} />
                    ) : (
                      'Không có hình ảnh'
                    )}
                  </td>
                  <td className="actions-cell">
                    <ActionButton
                      variant="warning"
                      onClick={() => handleEditCategory(category)}
                      marginLeft
                    >
                      <i className="bi bi-pencil"></i>
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => handleDeleteCategory(category.id)}
                      marginLeft
                    >
                      <i className="bi bi-trash"></i>
                    </ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
    </PageContainer>
  );
}

export default AdminCategories; 