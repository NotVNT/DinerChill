import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import "../../styles/admin_layout/admin_restaurant.css";

function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]); // Add amenities state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [viewingRestaurant, setViewingRestaurant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    restaurant: null,
    newStatus: "",
    closureReason: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    selectedCategories: [],
    selectedAmenities: [], // Add selectedAmenities to form data
    address: "",
    images: [],
    description: "",
    openingTime: "10:00",
    closingTime: "22:00",
    phone: "",
    email: "",
    capacity: "",
    priceRange: "200.000đ - 500.000đ",
    status: "active",
  });

  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
    fetchAmenities(); // Add amenities fetch
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
    }
  };

  const fetchAmenities = async () => {
    try {
      const data = await adminAPI.getAmenities();
      setAmenities(data);
    } catch (err) {
      console.error("Error fetching amenities:", err);
      setError("Không thể tải danh sách tiện ích. Vui lòng thử lại sau.");
    }
  };

  const handleEditClick = (restaurant) => {
    setEditingRestaurant(restaurant);

    // Initialize images array from existing images
    let initialImages = [];
    if (restaurant.images && restaurant.images.length > 0) {
      initialImages = restaurant.images.map((image) => {
        const imageUrl = getImageUrl(image);
        return {
          id: `db-${image.id}`,
          url: imageUrl,
          preview: imageUrl,
          dbId: image.id, // Lưu ID từ database để có thể xóa sau này
        };
      });
    } else if (restaurant.image) {
      initialImages = [
        {
          id: "existing-0",
          url: restaurant.image,
          preview: restaurant.image,
        },
      ];
    }

    // Get restaurant categories if available
    const restaurantCategories = restaurant.categories
      ? restaurant.categories.map((category) => category.id)
      : [];

    // Get restaurant amenities if available
    const restaurantAmenities = restaurant.amenities
      ? restaurant.amenities.map((amenity) => amenity.id)
      : [];

    setFormData({
      name: restaurant.name,
      selectedCategories: restaurantCategories,
      selectedAmenities: restaurantAmenities, // Add this line
      address: restaurant.address || "",
      images: initialImages,
      description: restaurant.description || "",
      openingTime: restaurant.openingTime || "10:00",
      closingTime: restaurant.closingTime || "22:00",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      capacity: restaurant.capacity ? restaurant.capacity.toString() : "",
      priceRange: restaurant.priceRange || "200.000đ - 500.000đ",
      status: restaurant.status || "active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      selectedCategories: selectedOptions,
    }));
  };

  const handleAmenityChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: selectedOptions,
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
            preview: event.target.result,
          });

          setFormData((prev) => ({
            ...prev,
            images: newImages,
          }));
        };

        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset any previous error

    setIsSubmitting(true); // Set submitting state to true when form is submitted

    try {
      // Validate required fields
      if (!formData.name || !formData.address) {
        setError(
          "Vui lòng điền đầy đủ thông tin bắt buộc (tên và địa chỉ nhà hàng)."
        );
        setIsSubmitting(false); // Reset submitting state
        return;
      }

      // Tạo FormData để xử lý tải lên nhiều hình ảnh
      const formDataToSend = new FormData();

      // Thêm thông tin cơ bản
      formDataToSend.append("name", formData.name);

      // Add selected categories as JSON string
      formDataToSend.append(
        "categoryIds",
        JSON.stringify(formData.selectedCategories)
      );

      // Add selected amenities as JSON string
      formDataToSend.append(
        "amenityIds",
        JSON.stringify(formData.selectedAmenities)
      );

      formDataToSend.append("address", formData.address);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("openingTime", formData.openingTime || "");
      formDataToSend.append("closingTime", formData.closingTime || "");
      formDataToSend.append("phone", formData.phone || "");

      // Use provided email or generate a default one if empty
      formDataToSend.append("email", formData.email || "");

      formDataToSend.append("priceRange", formData.priceRange || "");
      formDataToSend.append("status", "active"); // Always set status to 'active'

      if (formData.capacity) {
        formDataToSend.append("capacity", formData.capacity);
      }

      console.log("Sending data, image count:", formData.images.length);

      // Xử lý tải lên hình ảnh lên cloud storage
      let hasFiles = false;
      formData.images.forEach((image, index) => {
        if (image.file) {
          hasFiles = true;
          // Gửi file gốc để backend upload lên cloud
          formDataToSend.append("restaurantImages", image.file);
          console.log("Adding image file:", image.file.name);
        }
      });

      // Nếu không có file mới, hiển thị thông báo
      if (!hasFiles && !editingRestaurant.id) {
        console.log("No image files selected for new restaurant");
      }

      // Nếu đang chỉnh sửa, thêm các IDs của hình ảnh đã tồn tại
      if (editingRestaurant && editingRestaurant.id) {
        // Lọc ra các ảnh đã lưu trong database (có dbId)
        const existingImages = formData.images
          .filter((img) => img.dbId)
          .map((img) => img.dbId.toString());

        if (existingImages.length > 0) {
          formDataToSend.append(
            "existingImages",
            JSON.stringify(existingImages)
          );
          console.log("Existing images:", existingImages.length);
        }
      }

      console.log("Dữ liệu gửi đi:", {
        name: formData.name,
        categoryIds: formData.selectedCategories,
        address: formData.address,
        imageCount: formData.images.length,
        hasFiles,
        isNewRestaurant: !editingRestaurant.id,
      });

      let updatedRestaurant;
      if (editingRestaurant && editingRestaurant.id) {
        // Cập nhật nhà hàng hiện có
        console.log("Updating restaurant with ID:", editingRestaurant.id);
        updatedRestaurant = await adminAPI.updateRestaurant(
          editingRestaurant.id,
          formDataToSend
        );
        console.log("Restaurant updated successfully");
        setRestaurants((prev) =>
          prev.map((restaurant) =>
            restaurant.id === editingRestaurant.id
              ? updatedRestaurant
              : restaurant
          )
        );

        showToast(
          `Đã cập nhật nhà hàng "${updatedRestaurant.name}" thành công!`,
          "warning"
        );
        createNotification(`Đã cập nhật nhà hàng "${updatedRestaurant.name}"`);
      } else {
        // Thêm nhà hàng mới
        console.log("Creating new restaurant");
        updatedRestaurant = await adminAPI.createRestaurant(formDataToSend);
        console.log("Restaurant created successfully");
        setRestaurants((prev) => [...prev, updatedRestaurant]);

        showToast(
          `Đã thêm nhà hàng "${updatedRestaurant.name}" thành công!`,
          "success"
        );
        createNotification(`Đã thêm nhà hàng mới "${updatedRestaurant.name}"`);
      }

      // Reset form
      resetForm();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 5000);
    } catch (err) {
      console.error("Chi tiết lỗi khi lưu nhà hàng:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(
          `Không thể lưu thông tin nhà hàng: ${err.response.data.message}`
        );
      } else if (err.message) {
        setError(`Không thể lưu thông tin nhà hàng: ${err.message}`);
      } else {
        setError("Không thể lưu thông tin nhà hàng. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of success or failure
    }
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: "",
      selectedCategories: [],
      selectedAmenities: [], // Reset selectedAmenities
      address: "",
      images: [],
      description: "",
      openingTime: "10:00",
      closingTime: "22:00",
      phone: "",
      email: "",
      capacity: "",
      priceRange: "200.000đ - 500.000đ",
      status: "active",
    });
  };

  const handleDeleteClick = async (restaurantId) => {
    if (window.confirm("Bạn có chắc muốn xóa nhà hàng này?")) {
      try {
        setError(null);

        // Find restaurant name before deleting
        const restaurantToDelete = restaurants.find(
          (restaurant) => restaurant.id === restaurantId
        );
        const restaurantName = restaurantToDelete
          ? restaurantToDelete.name
          : "Nhà hàng";

        await adminAPI.deleteRestaurant(restaurantId);
        setRestaurants((prev) =>
          prev.filter((restaurant) => restaurant.id !== restaurantId)
        );

        showToast(`Đã xóa nhà hàng "${restaurantName}" thành công!`, "danger");
        createNotification(`Đã xóa nhà hàng "${restaurantName}"`, "danger");
      } catch (err) {
        console.error("Error deleting restaurant:", err);
        setError("Không thể xóa nhà hàng. Vui lòng thử lại.");
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
      newStatus: restaurant.status === "active" ? "maintenance" : "active",
      closureReason: restaurant.closureReason || "",
    });
  };

  const closeStatusModal = () => {
    setStatusChangeModal({
      isOpen: false,
      restaurant: null,
      newStatus: "",
      closureReason: "",
    });
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusChangeModal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusUpdate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { restaurant, newStatus, closureReason } = statusChangeModal;

      if (newStatus === "maintenance" && !closureReason.trim()) {
        setError("Vui lòng nhập lý do tạm ngừng");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("status", newStatus);

      if (newStatus === "maintenance") {
        formData.append("closureReason", closureReason);
      } else {
        formData.append("closureReason", "");
      }

      // Update restaurant status
      const updatedRestaurant = await adminAPI.updateRestaurant(
        restaurant.id,
        formData
      );

      // Update local state
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurant.id ? updatedRestaurant : r))
      );

      showToast(
        `Đã cập nhật trạng thái nhà hàng "${restaurant.name}" thành ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }`,
        "warning"
      );
      createNotification(
        `Đã cập nhật trạng thái nhà hàng "${restaurant.name}" thành ${
          newStatus === "active" ? "Đang hoạt động" : "Tạm ngừng"
        }`
      );

      // Close modal
      closeStatusModal();
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      setError("Không thể cập nhật trạng thái nhà hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter restaurants based on search query
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (!searchQuery.trim()) return true;

    // Function to normalize Vietnamese text (remove diacritics)
    const normalizeVietnamese = (str) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .toLowerCase();
    };

    // Check if search query contains diacritics
    const hasAccents = (str) => {
      return /[\u0300-\u036f]/.test(str.normalize("NFD"));
    };

    const queryHasAccents = hasAccents(searchQuery);

    if (queryHasAccents) {
      // If query has accents, do exact match (case insensitive)
      const lowerQuery = searchQuery.toLowerCase();
      const lowerName = (restaurant.name || "").toLowerCase();
      const lowerAddress = (restaurant.address || "").toLowerCase();

      return (
        lowerName.includes(lowerQuery) || lowerAddress.includes(lowerQuery)
      );
    } else {
      // If query has no accents, use normalized search (accent insensitive)
      const normalizedQuery = normalizeVietnamese(searchQuery);
      const normalizedName = normalizeVietnamese(restaurant.name || "");
      const normalizedAddress = normalizeVietnamese(restaurant.address || "");

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedAddress.includes(normalizedQuery)
      );
    }
  });

  // Pagination logic
  const totalItems = filteredRestaurants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  // Reset current page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Function to show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Function to create notification
  const createNotification = (message, type = "success") => {
    // Create and dispatch a custom event
    const notificationEvent = new CustomEvent("newAdminNotification", {
      detail: { message, type },
    });
    window.dispatchEvent(notificationEvent);
  };

  // Function to get image URL from either old or new format
  const getImageUrl = (image) => {
    if (!image) return null;

    // Set a default API URL if not defined in environment
    const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

    // If it's an object with image_path (from RestaurantImage model)
    if (typeof image === "object" && image.image_path) {
      const path = image.image_path;

      // If already a full URL
      if (path.startsWith("http")) {
        return path;
      }

      // Handle uploads directory paths
      if (path.includes("uploads/") || path.includes("uploads\\")) {
        // Extract just the filename from the path
        const parts = path.split(/uploads[/\\]/);
        const fileName = parts.length > 1 ? parts[parts.length - 1] : path;
        return `${apiBaseUrl}/uploads/${fileName}`;
      }

      // Default case - just append to API URL
      return `${apiBaseUrl}/${path.replace(/^\//, "")}`;
    }

    // If image is a string (direct path)
    if (typeof image === "string") {
      // If already a full URL
      if (image.startsWith("http")) {
        return image;
      }

      // Handle uploads directory paths
      if (image.includes("uploads/") || image.includes("uploads\\")) {
        // Extract just the filename from the path
        const parts = image.split(/uploads[/\\]/);
        const fileName = parts.length > 1 ? parts[parts.length - 1] : image;
        return `${apiBaseUrl}/uploads/${fileName}`;
      }

      // Default case
      return `${apiBaseUrl}/${image.replace(/^\//, "")}`;
    }

    return null;
  };

  return (
    <div className="admin-restaurants-page">
      <div className="page-header">
        <h1>Quản lý Nhà hàng</h1>
        <button
          className="btn-action btn-add"
          onClick={() => setEditingRestaurant({})}
        >
          <i className="fa fa-plus-circle"></i> Thêm nhà hàng mới
        </button>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className="toast-notification"
          style={{
            backgroundColor:
              toast.type === "success"
                ? "#28a745"
                : toast.type === "warning"
                ? "#ffc107"
                : toast.type === "danger"
                ? "#dc3545"
                : "#28a745",
            color: toast.type === "warning" ? "#212529" : "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "3px",
            }}
          >
            {toast.type === "success" && (
              <i
                className="fa fa-check-circle"
                style={{ fontSize: "20px" }}
              ></i>
            )}
            {toast.type === "warning" && (
              <i
                className="fa fa-exclamation-circle"
                style={{ fontSize: "20px" }}
              ></i>
            )}
            {toast.type === "danger" && (
              <i
                className="fa fa-times-circle"
                style={{ fontSize: "20px" }}
              ></i>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "2px",
              }}
            >
              Thông báo
            </div>
            <div style={{ fontSize: "14px" }}>{toast.message}</div>
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: "14px",
              fontWeight: "500",
              marginLeft: "auto",
              cursor: "pointer",
            }}
            onClick={() =>
              setToast({ show: false, message: "", type: "success" })
            }
          >
            Xong
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="fa fa-exclamation-circle alert-icon"></i>
          {error}
        </div>
      )}

      {editingRestaurant !== null ? (
        <div className="restaurant-form-container">
          <div className="form-header">
            <h3>
              {editingRestaurant?.id
                ? "Chỉnh sửa nhà hàng"
                : "Thêm nhà hàng mới"}
            </h3>
            <button className="close-form-btn" onClick={resetForm}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="restaurant-form">
            <div className="form-sections">
              {/* Thông tin cơ bản */}
              <div className="form-section">
                <h4 className="section-title">Thông tin cơ bản</h4>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="name">
                      Tên nhà hàng <span className="text-danger">*</span>
                    </label>
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

                  <div className="form-group col-md-6">
                    <label htmlFor="address">
                      Địa chỉ <span className="text-danger">*</span>
                    </label>
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
                </div>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="selectedCategories">
                      Danh mục nhà hàng <span className="text-danger">*</span>
                    </label>
                    <div className="category-select-container">
                      <select
                        id="selectedCategories"
                        name="selectedCategories"
                        className="form-control category-select"
                        value={formData.selectedCategories}
                        onChange={handleCategoryChange}
                        multiple
                        size={Math.min(5, categories.length)}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.selectedCategories.length > 0 && (
                      <div className="selected-categories mt-1">
                        <span className="selected-categories-label">
                          Đã chọn:{" "}
                        </span>
                        {formData.selectedCategories.map((catId) => {
                          const category = categories.find(
                            (c) => c.id === catId
                          );
                          return category ? (
                            <span
                              key={catId}
                              className="badge badge-primary mr-1"
                            >
                              {category.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="selectedAmenities">Tiện ích nhà hàng</label>
                    <div className="amenity-select-container">
                      <select
                        id="selectedAmenities"
                        name="selectedAmenities"
                        className="form-control amenity-select"
                        value={formData.selectedAmenities}
                        onChange={handleAmenityChange}
                        multiple
                        size={Math.min(5, amenities.length)}
                      >
                        {amenities.map((amenity) => (
                          <option key={amenity.id} value={amenity.id}>
                            {amenity.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.selectedAmenities.length > 0 && (
                      <div className="selected-amenities mt-1">
                        <span className="selected-amenities-label">
                          Đã chọn:{" "}
                        </span>
                        {formData.selectedAmenities.map((amenityId) => {
                          const amenity = amenities.find(
                            (a) => a.id === amenityId
                          );
                          return amenity ? (
                            <span
                              key={amenityId}
                              className="badge badge-primary mr-1"
                            >
                              {amenity.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
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
                    />
                  </div>
                </div>
              </div>

              {/* Hình ảnh */}
              <div className="form-section">
                <h4 className="section-title">Hình ảnh nhà hàng</h4>
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
                    </div>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div className="image-preview-container">
                      {formData.images.map((image, index) => (
                        <div
                          key={image.id || index}
                          className="image-preview-item"
                        >
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
                    <i className="fa fa-info-circle"></i> Đã tải lên{" "}
                    {formData.images.length} hình ảnh
                  </div>
                )}
              </div>

              {/* Thông tin liên hệ */}
              <div className="form-section">
                <h4 className="section-title">Thông tin liên hệ</h4>
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
              </div>

              {/* Thông tin khác */}
              <div className="form-section">
                <h4 className="section-title">Thông tin khác</h4>
                <div className="form-row">
                  <div className="form-group col-md-6">
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

                  <div className="form-group col-md-6">
                    <label htmlFor="priceRange">Mức giá</label>
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
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Mô tả chi tiết về nhà hàng"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ms-2">Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-save"></i>{" "}
                    {editingRestaurant.id ? "Cập nhật" : "Thêm mới"}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                <i className="fa fa-times"></i> Hủy
              </button>
            </div>
          </form>
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
                <i className="fa fa-search"></i> Tìm thấy{" "}
                {filteredRestaurants.length} nhà hàng
                {filteredRestaurants.length > 0 && (
                  <span> - Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong tổng số {totalItems} nhà hàng</span>
                )}
              </div>
            )}
            
            {/* Pagination and Items per page controls */}
            {!searchQuery && totalItems > 0 && (
              <div className="table-controls">
                <div className="items-per-page-control">
                  <label htmlFor="itemsPerPage">Hiển thị:</label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                    className="items-per-page-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>nhà hàng mỗi trang</span>
                </div>
                <div className="pagination-info">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trong tổng số {totalItems} nhà hàng
                </div>
              </div>
            )}
            
            <div className="table-responsive">
              <table className="table table-hover admin-table">
                <thead className="thead-light">
                  <tr>
                    <th style={{ width: "15%" }}>Tên nhà hàng</th>
                    <th style={{ width: "4%" }}>Danh mục</th>
                    <th style={{ width: "10%" }}>Sức chứa</th>
                    <th style={{ width: "8%" }}>Trạng thái</th>
                    <th style={{ width: "20%" }}>Địa chỉ</th>
                    <th style={{ width: "10%" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRestaurants && currentRestaurants.length > 0 ? (
                    currentRestaurants.map((restaurant) => (
                      <tr key={restaurant.id}>
                        <td>{restaurant.name}</td>
                        <td>
                          {restaurant.categories &&
                          restaurant.categories.length > 0
                            ? restaurant.categories
                                .map((cat) => cat.name)
                                .join(", ")
                            : restaurant.cuisine ||
                              restaurant.cuisineType ||
                              "Chưa phân loại"}
                        </td>
                        <td>
                          {restaurant.capacity
                            ? `${restaurant.capacity} người`
                            : "Chưa cập nhật"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              restaurant.status === "active"
                                ? "active"
                                : "maintenance"
                            }`}
                            onClick={() => handleStatusToggleClick(restaurant)}
                            title="Nhấn để thay đổi trạng thái"
                            style={{ cursor: "pointer" }}
                          >
                            {restaurant.status === "active"
                              ? "Đang hoạt động"
                              : "Tạm ngừng"}
                          </span>
                          {restaurant.status === "maintenance" &&
                            restaurant.closureReason && (
                              <div className="closure-reason">
                                <small>
                                  <i className="fa fa-info-circle"></i>{" "}
                                  {restaurant.closureReason}
                                </small>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-eye"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                            </svg>
                          </button>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEditClick(restaurant)}
                            title="Chỉnh sửa"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-pencil-square"
                              viewBox="0 0 16 16"
                            >
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path
                                fillRule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                              />
                              <path
                                fillRule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                              />
                            </svg>
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteClick(restaurant.id)}
                            title="Xóa"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-trash"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                            </svg>
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
                              <p>
                                Không tìm thấy nhà hàng nào phù hợp với "
                                {searchQuery}"
                              </p>
                              <button
                                className="btn btn-secondary"
                                onClick={() => setSearchQuery("")}
                              >
                                Xóa tìm kiếm
                              </button>
                            </>
                          ) : (
                            <>
                              <i className="fa fa-utensils fa-3x"></i>
                              <p>Không có dữ liệu nhà hàng</p>
                              <button
                                className="btn btn-primary"
                                onClick={() => setEditingRestaurant({})}
                              >
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <div className="pagination">
                  <button
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <i className="fa fa-chevron-left"></i> Trước
                  </button>
                  
                  {getPageNumbers().map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Sau <i className="fa fa-chevron-right"></i>
                  </button>
                </div>
                
                <div className="pagination-summary">
                  Trang {currentPage} / {totalPages}
                </div>
              </div>
            )}
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
              <button
                type="button"
                className="close-btn"
                onClick={closeStatusModal}
              >
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
                        checked={statusChangeModal.newStatus === "active"}
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
                        checked={statusChangeModal.newStatus === "maintenance"}
                        onChange={handleStatusChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="status-badge maintenance">
                        <i className="fa fa-pause-circle"></i> Tạm ngừng
                      </span>
                    </label>
                  </div>
                </div>

                {statusChangeModal.newStatus === "maintenance" && (
                  <div className="form-group closure-reason-container">
                    <label htmlFor="closureReason" className="option-label">
                      Lý do tạm ngừng:
                    </label>
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
                disabled={
                  isSubmitting ||
                  (statusChangeModal.newStatus === "maintenance" &&
                    !statusChangeModal.closureReason.trim())
                }
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ms-2">Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-save"></i> Cập nhật
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary cancel-btn"
                onClick={closeStatusModal}
              >
                <i className="fa fa-times"></i> Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Detail View Modal */}
      {viewingRestaurant && (
        <div className="restaurant-detail-modal">
          <div className="modal-backdrop" onClick={closeDetailView}></div>
          <div className="modal-content detail-view">
            <button
              type="button"
              className="close-btn detail-close-btn"
              onClick={closeDetailView}
            >
              <i className="fa fa-times"></i>
            </button>

            <div className="restaurant-form-container detail-form">
              <div className="restaurant-detail-header">
                <h2 className="restaurant-name">{viewingRestaurant.name}</h2>
                <span
                  className={`status-badge ${
                    viewingRestaurant.status === "active"
                      ? "active"
                      : "maintenance"
                  }`}
                >
                  {viewingRestaurant.status === "active"
                    ? "Đang hoạt động"
                    : "Tạm ngừng"}
                </span>
              </div>

              {viewingRestaurant.status === "maintenance" &&
                viewingRestaurant.closureReason && (
                  <div className="closure-reason-note">
                    <i className="fa fa-info-circle"></i>
                    <span>
                      Lý do tạm ngừng: {viewingRestaurant.closureReason}
                    </span>
                  </div>
                )}

              {/* Restaurant Images - Integrated with moderate size */}
              <div className="restaurant-images-section-moderate">
                {viewingRestaurant.images &&
                viewingRestaurant.images.length > 0 ? (
                  <div className="restaurant-images-gallery-moderate">
                    {viewingRestaurant.images.map((image, index) => (
                      <div
                        key={`image-${index}`}
                        className="gallery-image-moderate"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${viewingRestaurant.name} - Hình ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : viewingRestaurant.image ? (
                  <div className="restaurant-single-image-moderate">
                    <img
                      src={viewingRestaurant.image}
                      alt={viewingRestaurant.name}
                    />
                  </div>
                ) : (
                  <div className="no-image-placeholder-moderate">
                    <i className="fa fa-image"></i>
                    <p>Không có hình ảnh</p>
                  </div>
                )}
              </div>

              <div className="detail-form-content">
                <div className="detail-section">
                  <h4 className="section-title">
                    <i className="fa fa-info-circle"></i> Thông tin cơ bản
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-map-marker-alt"></i> Địa chỉ:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.address || "Chưa cập nhật"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-tags"></i> Danh mục:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.categories &&
                        viewingRestaurant.categories.length > 0 ? (
                          <div className="category-tags">
                            {viewingRestaurant.categories.map((category) => (
                              <span key={category.id} className="category-tag">
                                {category.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "Chưa phân loại"
                        )}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-clock"></i> Giờ mở cửa:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.openingTime &&
                        viewingRestaurant.closingTime
                          ? `${viewingRestaurant.openingTime} - ${viewingRestaurant.closingTime}`
                          : "Chưa cập nhật"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-users"></i> Sức chứa:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.capacity
                          ? `${viewingRestaurant.capacity} người`
                          : "Chưa cập nhật"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-tag"></i> Mức giá:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.priceRange || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                {viewingRestaurant.description && (
                  <div className="detail-section">
                    <h4 className="section-title">
                      <i className="fa fa-align-left"></i> Mô tả
                    </h4>
                    <div className="restaurant-description">
                      {viewingRestaurant.description}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4 className="section-title">
                    <i className="fa fa-address-book"></i> Thông tin liên hệ
                  </h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-phone"></i> Số điện thoại:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.phone || "Chưa cập nhật"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">
                        <i className="fa fa-envelope"></i> Email:
                      </span>
                      <span className="detail-value">
                        {viewingRestaurant.email || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-form-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleEditClick(viewingRestaurant);
                    closeDetailView();
                  }}
                >
                  <i className="fa fa-edit"></i> Chỉnh sửa
                </button>
                <button className="btn btn-secondary" onClick={closeDetailView}>
                  <i className="fa fa-times"></i> Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRestaurants;
