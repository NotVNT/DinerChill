import React, { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../api";
import "../../styles/admin_layout/admin_promotion.css";

// Định nghĩa API_BASE_URL cho thông báo lỗi
const API_BASE_URL = "http://localhost:5000/api";

function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    minimumOrderAmount: "",
    maximumDiscount: "",
    usageLimit: "",
    isActive: true,
    selectedRestaurant: "",
  });
  const [formattedValues, setFormattedValues] = useState({
    minimumOrderAmount: "",
    maximumDiscount: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [viewingRestaurants, setViewingRestaurants] = useState(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.promotions.getAll();
      const mappedData = data.map((promo) => ({
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: "percentage",
        discountValue: promo.discountValue,
        startDate: promo.startDate,
        endDate: promo.endDate,
        minimumOrderAmount: promo.minOrderValue,
        maximumDiscount: promo.maxDiscountValue,
        usageLimit: promo.usageLimit,
        usageCount: promo.usageCount,
        isActive: promo.isActive,
        restaurants: promo.restaurants || [],
      }));
      setPromotions(mappedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setError("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const data = await adminAPI.getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    fetchRestaurants();
  }, [fetchPromotions, fetchRestaurants]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "minimumOrderAmount" || name === "maximumDiscount") {
      const numericValue = value.replace(/[^\d.]/g, "");
      const parsedValue = parseCurrency(numericValue);
      setFormData({
        ...formData,
        [name]: parsedValue,
      });
      setFormattedValues({
        ...formattedValues,
        [name]: formatCurrency(parsedValue),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseCurrency = (value) => {
    if (!value) return "";
    return value.toString().replace(/\./g, "");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      startDate: "",
      endDate: "",
      minimumOrderAmount: "",
      maximumDiscount: "",
      usageLimit: "",
      isActive: true,
      selectedRestaurant: "",
    });
    setEditingId(null);
    setShowForm(false);
    setFormattedValues({
      minimumOrderAmount: "",
      maximumDiscount: "",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      setError("Vui lòng nhập đầy đủ thông tin khuyến mãi");
      return;
    }

    const formDataToSubmit = {
      code: formData.code,
      description: formData.description,
      discountType: "percentage",
      discountValue: Number(formData.discountValue),
      startDate: formData.startDate,
      endDate: formData.endDate,
      minimumOrderAmount: formData.minimumOrderAmount
        ? Number(formData.minimumOrderAmount)
        : 0,
      maximumDiscount: formData.maximumDiscount
        ? Number(formData.maximumDiscount)
        : 0,
      usageLimit: Number(formData.usageLimit),
      isActive: formData.isActive,
      restaurantId: formData.selectedRestaurant
        ? Number(formData.selectedRestaurant)
        : null,
    };

    try {
      if (editingId) {
        await adminAPI.promotions.update(editingId, formDataToSubmit);
      } else {
        await adminAPI.promotions.create(formDataToSubmit);
      }
      resetForm();
      fetchPromotions();
      const actionText = editingId ? "cập nhật" : "thêm";
      setSuccess(`Đã ${actionText} khuyến mãi thành công`);
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.message || "Đã có lỗi xảy ra khi xử lý yêu cầu"
      );
    }
  };

  const handleEditPromotion = (promo) => {
    setEditingId(promo.id);
    const selectedRestaurant =
      promo.restaurants && promo.restaurants.length > 0
        ? promo.restaurants[0].id.toString()
        : "";

    setFormData({
      code: promo.code || "",
      description: promo.description || "",
      discountType: "percentage",
      discountValue: promo.discountValue || "",
      startDate: formatDate(promo.startDate) || "",
      endDate: formatDate(promo.endDate) || "",
      minimumOrderAmount: promo.minimumOrderAmount || "",
      maximumDiscount: promo.maximumDiscount || "",
      usageLimit: promo.usageLimit || "",
      isActive: promo.isActive !== undefined ? promo.isActive : true,
      selectedRestaurant: selectedRestaurant,
    });
    setShowForm(true);
  };

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      try {
        await adminAPI.promotions.delete(promotionId);
        fetchPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
        setError("Không thể xóa khuyến mãi");
      }
    }
  };

  const handleToggleStatus = async (promotionId, currentStatus) => {
    try {
      setLoading(true);
      await adminAPI.promotions.toggleStatus(promotionId, !currentStatus);

      // Hiển thị thông báo thành công bằng state
      setSuccess("Đã thay đổi trạng thái khuyến mãi thành công");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Cập nhật lại danh sách khuyến mãi
      await fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion status:", error);

      let errorMessage;
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("kết nối")
      ) {
        errorMessage =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.";
      } else {
        errorMessage = `Không thể thay đổi trạng thái khuyến mãi: ${
          error.message || "Lỗi không xác định"
        }`;
      }

      setError(errorMessage);
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const getPromotionStatus = (promo) => {
    const currentDate = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (!promo.isActive) {
      return { text: "Tạm dừng", class: "status-paused" };
    } else if (currentDate < startDate) {
      return { text: "Sắp diễn ra", class: "status-not-started" };
    } else if (currentDate > endDate) {
      return { text: "Hết hạn", class: "status-expired" };
    } else {
      return { text: "Hoạt động", class: "status-active" };
    }
  };

  const filteredPromotions = promotions.filter((promo) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (promo.code && promo.code.toLowerCase().includes(lowerQuery)) ||
      (promo.description &&
        promo.description.toLowerCase().includes(lowerQuery)) ||
      (promo.usageCount !== undefined &&
        promo.usageCount.toString().includes(lowerQuery)) ||
      (promo.usageLimit !== undefined &&
        promo.usageLimit.toString().includes(lowerQuery))
    );
  });

  useEffect(() => {
    if (formData) {
      setFormattedValues({
        minimumOrderAmount: formatCurrency(formData.minimumOrderAmount || ""),
        maximumDiscount: formatCurrency(formData.maximumDiscount || ""),
      });
    }
  }, [formData]);

  const handleViewRestaurants = (promo) => {
    setViewingRestaurants(promo);
  };

  const closeRestaurantsModal = () => {
    setViewingRestaurants(null);
  };

  if (loading && !showForm) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-promotions">
      <div className="admin-section-header">
        <h2>Quản lý khuyến mãi</h2>
        {!showForm && (
          <button
            className="btn btn-primary btn-add-promotion"
            onClick={() => {
              setShowForm(true);
            }}
          >
            Thêm khuyến mãi mới
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <div>{error}</div>
          {error.includes("kết nối") && (
            <div className="error-help-text">
              Gợi ý: Đảm bảo rằng server API đang chạy tại {API_BASE_URL}
            </div>
          )}
        </div>
      )}

      {success && <div className="success-message">{success}</div>}

      {showForm ? (
        <div className="promotion-form">
          <h3>{editingId ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code">Mã khuyến mãi:</label>
                <input
                  type="text"
                  className="form-control"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Mô tả:</label>
              <textarea
                className="form-control"
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
                  className="form-control"
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Phần trăm (%)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="discountValue">Giá trị giảm giá (%):</label>
                <input
                  type="number"
                  className="form-control"
                  id="discountValue"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
                <span className="input-suffix">%</span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu:</label>
                <input
                  type="date"
                  className="form-control"
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
                  className="form-control"
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
                <label htmlFor="minimumOrderAmount">
                  Giá trị đơn hàng tối thiểu (VNĐ)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  value={formattedValues.minimumOrderAmount}
                  onChange={handleInputChange}
                  placeholder="Nhập giá trị đơn hàng tối thiểu"
                />
              </div>
              <div className="form-group">
                <label htmlFor="maximumDiscount">Giảm giá tối đa (VNĐ)</label>
                <input
                  type="text"
                  className="form-control"
                  id="maximumDiscount"
                  name="maximumDiscount"
                  value={formattedValues.maximumDiscount}
                  onChange={handleInputChange}
                  placeholder="Nhập giá trị giảm tối đa"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usageLimit">Giới hạn sử dụng:</label>
                <input
                  type="number"
                  className="form-control"
                  id="usageLimit"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="selectedRestaurant">Áp dụng cho nhà hàng:</label>
              <select
                className="form-control"
                id="selectedRestaurant"
                name="selectedRestaurant"
                value={formData.selectedRestaurant}
                onChange={handleInputChange}
              >
                <option value="">
                  -- Chọn nhà hàng (để trống nếu áp dụng cho tất cả) --
                </option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
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
        <div className="promotions-list">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo mã, mô tả, số lượng sử dụng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <h3>Danh sách khuyến mãi</h3>
          {filteredPromotions.length === 0 ? (
            searchQuery ? (
              <p>Không tìm thấy khuyến mãi phù hợp.</p>
            ) : (
              <p>Không có khuyến mãi nào.</p>
            )
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>% Giảm</th>
                  <th>Điều kiện đơn</th>
                  <th>Nhà hàng áp dụng</th>
                  <th>Thời gian</th>
                  <th>Sử dụng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promo) => (
                  <tr key={promo.id}>
                    <td className="promotion-code-cell">
                      <span className="promotion-code">{promo.code}</span>
                    </td>
                    <td>
                      <div className="discount-value">
                        {promo.discountValue}%
                      </div>
                    </td>
                    <td>
                      <div className="order-requirements">
                        {promo.minimumOrderAmount > 0 ? (
                          <div className="min-order-amount">
                            Tối thiểu:{" "}
                            {promo.minimumOrderAmount.toLocaleString("vi-VN")}đ
                          </div>
                        ) : (
                          <div className="no-minimum">
                            Không giới hạn tối thiểu
                          </div>
                        )}

                        {promo.maximumDiscount > 0 ? (
                          <div className="max-discount">
                            Tối đa:{" "}
                            {promo.maximumDiscount.toLocaleString("vi-VN")}đ
                          </div>
                        ) : (
                          <div className="no-maximum">
                            Không giới hạn tối đa
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="applied-restaurants">
                        {promo.restaurants && promo.restaurants.length > 0 ? (
                          <div className="view-restaurants">
                            <button
                              className="btn-view-restaurants"
                              onClick={() => handleViewRestaurants(promo)}
                              title="Xem danh sách nhà hàng áp dụng"
                            >
                              <i className="fas fa-eye"></i>
                              <span className="restaurant-count">
                                {promo.restaurants.length}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="all-restaurants">Tất cả nhà hàng</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        Từ:{" "}
                        {new Date(promo.startDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div>
                        Đến:{" "}
                        {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td>
                      <div className="usage-info">
                        {promo.usageCount !== undefined ? promo.usageCount : 0}{" "}
                        / {promo.usageLimit || "Không giới hạn"}
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const status = getPromotionStatus(promo);
                        return (
                          <span
                            className={`status-badge ${status.class}`}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Bạn có chắc chắn muốn ${
                                    promo.isActive ? "tạm dừng" : "kích hoạt"
                                  } mã khuyến mãi này?`
                                )
                              ) {
                                handleToggleStatus(promo.id, promo.isActive);
                              }
                            }}
                            title={`Nhấp để ${
                              promo.isActive ? "tạm dừng" : "kích hoạt"
                            } mã khuyến mãi`}
                          >
                            {status.text}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditPromotion(promo)}
                          title="Sửa"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeletePromotion(promo.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal for viewing restaurants */}
      {viewingRestaurants && (
        <div className="modal-overlay" onClick={closeRestaurantsModal}>
          <div
            className="restaurant-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Nhà hàng áp dụng mã "{viewingRestaurants.code}"</h3>
              <button
                className="close-modal-btn"
                onClick={closeRestaurantsModal}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {viewingRestaurants.restaurants &&
              viewingRestaurants.restaurants.length > 0 ? (
                <div className="restaurants-list">
                  {viewingRestaurants.restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="restaurant-item">
                      <span className="restaurant-icon">
                        <i className="fas fa-utensils"></i>
                      </span>
                      <span className="restaurant-name">{restaurant.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-restaurants">
                  Không có nhà hàng cụ thể - áp dụng cho tất cả nhà hàng
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeRestaurantsModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPromotions;
