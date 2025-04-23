import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminAPI.getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
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
      const updatedUser = await adminAPI.updateUser(editingUser.id, formData);
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Không thể cập nhật người dùng. Vui lòng thử lại.');
    }
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-users">
      <h1>Quản lý người dùng</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {editingUser ? (
        <div className="edit-form">
          <h2>Chỉnh sửa người dùng</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
            
            <div className="form-group">
              <label>Vai trò</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">Người dùng</option>
                <option value="restaurant_owner">Chủ nhà hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Lưu thay đổi
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditingUser(null)}
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
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  {user.role === 'admin' ? 'Quản trị viên' : 
                   user.role === 'restaurant_owner' ? 'Chủ nhà hàng' : 'Người dùng'}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEditClick(user)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDeleteClick(user.id)}
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

export default AdminUsers; 