import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import "../../styles/admin_layout/admin_amenities.css";

function AdminAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAmenities();
      setAmenities(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      setError("Không thể tải danh sách tiện ích");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError("Tên tiện ích không được để trống");
      return;
    }

    try {
      if (editingId) {
        // Update existing amenity
        await adminAPI.updateAmenity(editingId, formData);
        setSuccess("Cập nhật tiện ích thành công");
      } else {
        // Create new amenity
        await adminAPI.createAmenity(formData);
        setSuccess("Thêm tiện ích thành công");
      }

      // Reset form and refresh data
      setFormData({ name: "" });
      setEditingId(null);
      fetchAmenities();

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving amenity:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError(
          editingId
            ? "Không thể cập nhật tiện ích"
            : "Không thể thêm tiện ích mới"
        );
      }
    }
  };

  const handleEdit = (amenity) => {
    setFormData({ name: amenity.name });
    setEditingId(amenity.id);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({ name: "" });
    setEditingId(null);
    setError(null);
    setShowForm(false);
  };

  const confirmDelete = (amenity) => {
    setAmenityToDelete(amenity);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!amenityToDelete) return;

    try {
      await adminAPI.deleteAmenity(amenityToDelete.id);
      setSuccess("Xóa tiện ích thành công");
      fetchAmenities();

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting amenity:", error);
      setError("Không thể xóa tiện ích");
    } finally {
      setShowConfirmDialog(false);
      setAmenityToDelete(null);
    }
  };

  const ConfirmDialog = () => (
    <div className="amenities-confirm-dialog">
      <div className="amenities-confirm-content">
        <h3>Xác nhận xóa</h3>
        <p>Bạn có chắc chắn muốn xóa tiện ích "{amenityToDelete?.name}"?</p>
        <div className="amenities-confirm-actions">
          <button
            className="amenities-btn amenities-btn-secondary"
            onClick={() => setShowConfirmDialog(false)}
          >
            Hủy
          </button>
          <button
            className="amenities-btn amenities-btn-danger"
            onClick={handleDelete}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="amenities-manager">
      <div className="amenities-header">
        <h1>Quản lý tiện ích</h1>
        <button
          className="amenities-btn amenities-btn-primary"
          onClick={() => {
            if (showForm && editingId) {
              handleCancelEdit();
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm
            ? editingId
              ? "Hủy chỉnh sửa"
              : "Hủy"
            : "Thêm tiện ích mới"}
        </button>
      </div>

      {error && <div className="amenity-error-message">{error}</div>}
      {success && <div className="amenity-success-message">{success}</div>}

      {showForm && (
        <div className="amenities-form">
          <h2 className="amenities-form-title">
            {editingId ? "Cập nhật tiện ích" : "Thêm tiện ích mới"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="amenities-form-group">
              <label htmlFor="name">Tên tiện ích:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên tiện ích"
              />
            </div>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="amenities-btn amenities-btn-primary"
              >
                {editingId ? "Cập nhật tiện ích" : "Thêm tiện ích mới"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="amenities-btn amenities-btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="amenities-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>ID</th>
              <th style={{ width: "70%" }}>Tên tiện ích</th>
              <th style={{ width: "20%" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="amenities-loader">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : amenities.length === 0 ? (
              <tr>
                <td colSpan="3" className="amenities-empty-state">
                  Chưa có tiện ích nào
                </td>
              </tr>
            ) : (
              amenities.map((amenity) => (
                <tr key={amenity.id}>
                  <td>{amenity.id}</td>
                  <td>{amenity.name}</td>
                  <td className="amenities-actions">
                    <button
                      className="amenities-btn amenities-btn-warning"
                      onClick={() => handleEdit(amenity)}
                    >
                      Sửa
                    </button>
                    <button
                      className="amenities-btn amenities-btn-danger"
                      onClick={() => confirmDelete(amenity)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showConfirmDialog && <ConfirmDialog />}
    </div>
  );
}

export default AdminAmenities;
