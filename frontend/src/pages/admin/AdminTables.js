import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import "../../styles/admin_layout/admin_tables.css";

const generateTableCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function AdminTables() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [tableStatusFilter, setTableStatusFilter] = useState("all");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [currentTable, setCurrentTable] = useState({
    restaurantId: "",
    tableNumber: "",
    capacity: 2,
    status: "available",
    description: "",
    tableCode: generateTableCode(),
  });
  const [restaurantTableCounts, setRestaurantTableCounts] = useState({});
  const [availableTableCounts, setAvailableTableCounts] = useState({});

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const restaurantsRes = await adminAPI.getRestaurants();
        setRestaurants(restaurantsRes);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      if (selectedRestaurant) {
        try {
          const tablesRes = await adminAPI.getTables({
            restaurantId: selectedRestaurant.id,
          });
          const sortedTables = tablesRes
            .filter((table) => table.restaurantId === selectedRestaurant.id)
            .sort((a, b) => {
              const tableNumA = parseInt(a.tableNumber.replace(/\D/g, ""));
              const tableNumB = parseInt(b.tableNumber.replace(/\D/g, ""));
              return tableNumA - tableNumB;
            });
          setTables(sortedTables);
        } catch (error) {
          console.error("Error fetching tables:", error);
        }
      }
    };
    fetchTables();
  }, [selectedRestaurant]);

  useEffect(() => {
    const fetchTableCounts = async () => {
      try {
        const allTables = await adminAPI.getTables();
        const counts = {};
        const availableCounts = {};

        allTables.forEach((table) => {
          if (table.restaurantId) {
            counts[table.restaurantId] = (counts[table.restaurantId] || 0) + 1;
            if (table.status === "available") {
              availableCounts[table.restaurantId] =
                (availableCounts[table.restaurantId] || 0) + 1;
            }
          }
        });

        setRestaurantTableCounts(counts);
        setAvailableTableCounts(availableCounts);
      } catch (error) {
        console.error("Error fetching table counts:", error);
      }
    };

    if (restaurants.length > 0) {
      fetchTableCounts();
    }
  }, [restaurants]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const createNotification = (message, type = "success") => {
    const notificationEvent = new CustomEvent("newAdminNotification", {
      detail: { message, type },
    });
    window.dispatchEvent(notificationEvent);
  };

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTable((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTable = () => {
    setCurrentTable({
      restaurantId: selectedRestaurant.id,
      tableNumber: "",
      capacity: 2,
      status: "available",
      description: "",
      tableCode: generateTableCode(),
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditTable = (table) => {
    setCurrentTable({ ...table });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let detailMessage;
      if (isEditing) {
        const originalTable = tables.find(
          (table) => table.id === currentTable.id
        );
        const updatedTable = await adminAPI.updateTable(
          currentTable.id,
          currentTable
        );
        setTables(
          tables.map((table) =>
            table.id === currentTable.id ? updatedTable : table
          )
        );

        let changeDetails = [];
        if (originalTable.tableNumber !== updatedTable.tableNumber) {
          changeDetails.push(
            `số bàn từ ${originalTable.tableNumber} thành ${updatedTable.tableNumber}`
          );
        }
        if (originalTable.capacity !== updatedTable.capacity) {
          changeDetails.push(
            `sức chứa từ ${originalTable.capacity} thành ${updatedTable.capacity} người`
          );
        }
        if (originalTable.status !== updatedTable.status) {
          const getStatusName = (status) =>
            ({
              available: "Trống",
              reserved: "Đã đặt",
              occupied: "Đang sử dụng",
              unavailable: "Không khả dụng",
            }[status] || status);
          changeDetails.push(
            `trạng thái từ ${getStatusName(
              originalTable.status
            )} thành ${getStatusName(updatedTable.status)}`
          );
        }

        detailMessage =
          changeDetails.length > 0
            ? `Đã cập nhật Bàn ${
                updatedTable.tableNumber
              }: ${changeDetails.join(", ")}!`
            : `Đã cập nhật Bàn ${updatedTable.tableNumber} thành công!`;
        showToast(detailMessage, "warning");
        createNotification(detailMessage);
      } else {
        const newTable = await adminAPI.createTable(currentTable);
        setTables([...tables, newTable]);
        detailMessage = `Đã thêm Bàn ${newTable.tableNumber} (Sức chứa: ${
          newTable.capacity
        } người, Trạng thái: ${getStatusLabel(newTable.status)})`;
        showToast(detailMessage, "success");
        createNotification(detailMessage);
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error saving table:", error);
      showToast(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin bàn.",
        "danger"
      );
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bàn này?")) {
      try {
        const tableToDelete = tables.find((table) => table.id === id);
        await adminAPI.deleteTable(id);
        setTables(tables.filter((table) => table.id !== id));
        const detailMessage = `Đã xóa Bàn ${tableToDelete.tableNumber} (Sức chứa: ${tableToDelete.capacity} người, Mã bàn: ${tableToDelete.tableCode})`;
        showToast(detailMessage, "danger");
        createNotification(detailMessage, "danger");
      } catch (error) {
        console.error("Error deleting table:", error);
        showToast("Có lỗi xảy ra khi xóa bàn.", "danger");
      }
    }
  };

  const getRestaurantStatus = (restaurant) => {
    if (restaurant.status === "maintenance") {
      return "maintenance";
    }

    const now = new Date();
    const parseTimeToMinutes = (timeString) => {
      if (!timeString) return null;
      const [hours, minutes] = timeString.split(":").map(Number);
      return hours * 60 + (minutes || 0);
    };

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openingMinutes = parseTimeToMinutes(restaurant.openingTime);
    const closingMinutes = parseTimeToMinutes(restaurant.closingTime);

    if (openingMinutes === null || closingMinutes === null) {
      return "closed";
    }

    if (closingMinutes < openingMinutes) {
      return currentMinutes >= openingMinutes || currentMinutes < closingMinutes
        ? "open"
        : "closed";
    }

    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes
      ? "open"
      : "closed";
  };

  const getStatusLabel = (status) =>
    ({
      available: "Trống",
      reserved: "Đã đặt",
      occupied: "Đang sử dụng",
      unavailable: "Không khả dụng",
    }[status] || status);

  const getRestaurantStatusLabel = (status) =>
    ({
      open: "Đang hoạt động",
      closed: "Ngoài giờ mở cửa",
      maintenance: "Tạm ngưng",
    }[status] || status);

  const formatLastUpdated = (date) => {
    if (!date) return "";
    const updateDate = new Date(date);
    return updateDate.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusDotStyle = (status) =>
    ({
      open: { backgroundColor: "#4CAF50" },
      closed: { backgroundColor: "#9E9E9E" },
      maintenance: { backgroundColor: "#F44336" },
    }[status] || { backgroundColor: "#9E9E9E" });

  const normalizeVietnamese = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const hasAccents = (str) => /[\u0300-\u036f]/.test(str.normalize("NFD"));

  const filteredRestaurants = restaurants.filter((restaurant) => {
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const queryHasAccents = hasAccents(searchQuery);
      if (queryHasAccents) {
        const lowerQuery = searchQuery.toLowerCase();
        const lowerName = (restaurant.name || "").toLowerCase();
        matchesSearch = lowerName.includes(lowerQuery);
      } else {
        const normalizedQuery = normalizeVietnamese(searchQuery);
        const normalizedName = normalizeVietnamese(restaurant.name || "");
        matchesSearch = normalizedName.includes(normalizedQuery);
      }
    }

    const status = getRestaurantStatus(restaurant);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    let matchesTime = true;
    if (timeFilter !== "all") {
      const [openHour] = restaurant.openingTime?.split(":").map(Number) || [0];
      matchesTime =
        timeFilter === "morning"
          ? openHour >= 6 && openHour < 12
          : timeFilter === "afternoon"
          ? openHour >= 12 && openHour < 17
          : timeFilter === "evening"
          ? openHour >= 17
          : true;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  const filterTables = () =>
    tables.filter((table) => {
      let searchMatch = true;
      if (tableSearchQuery.trim()) {
        const tableNumberStr = String(table.tableNumber);
        const tableCodeStr = String(table.tableCode || "").toLowerCase();
        const queryHasAccents = hasAccents(tableSearchQuery);
        if (queryHasAccents) {
          const lowerQuery = tableSearchQuery.toLowerCase();
          searchMatch =
            tableNumberStr.includes(lowerQuery) ||
            tableCodeStr.includes(lowerQuery);
        } else {
          const normalizedQuery = normalizeVietnamese(tableSearchQuery);
          const normalizedTableNumber = normalizeVietnamese(tableNumberStr);
          const normalizedTableCode = normalizeVietnamese(tableCodeStr);
          searchMatch =
            normalizedTableNumber.includes(normalizedQuery) ||
            normalizedTableCode.includes(normalizedQuery);
        }
      }

      const statusMatch =
        tableStatusFilter === "all" || table.status === tableStatusFilter;

      return searchMatch && statusMatch;
    });

  const renderSelectFilter = (id, value, onChange, options, label) => (
    <div className="custom-select-wrapper">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="custom-select-filter"
        aria-label={label}
      >
        {options.map(({ value, text }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      <div className="select-icon">
        <i className={id.includes("status") ? "bi bi-circle-fill" : "bi bi-clock"} style={id.includes("status") ? { fontSize: "10px" } : {}}></i>
      </div>
    </div>
  );

  const renderRestaurantItem = (restaurant) => {
    const status = getRestaurantStatus(restaurant);
    return (
      <div key={restaurant.id} className="restaurant-item">
        <div className="restaurant-info">
          <div className="restaurant-name-wrapper">
            <span
              className={`status-indicator ${status}`}
              title={getRestaurantStatusLabel(status)}
              style={getStatusDotStyle(status)}
            ></span>
            <span className="restaurant-name" title={restaurant.name}>
              Nhà hàng: {restaurant.name}
            </span>
          </div>
          <span className="restaurant-hours">
            Giờ mở cửa: {restaurant.openingTime || "--"} -{" "}
            {restaurant.closingTime || "--"}
          </span>
          <span className="table-count">
            Bàn trống/Tổng số: {availableTableCounts[restaurant.id] || 0}/
            {restaurantTableCounts[restaurant.id] || 0}
          </span>
          <span className="last-updated">
            Cập nhật: {formatLastUpdated(restaurant.updatedAt)}
          </span>
        </div>
        <button
          className="view-tables-btn"
          onClick={() => handleSelectRestaurant(restaurant)}
          title="Xem chi tiết bàn"
        >
          <i className="bi bi-eye-fill"></i>
        </button>
      </div>
    );
  };

  const renderTableCard = (table) => (
    <div key={table.id} className="table-card">
      <div className="table-header">
        <span>Bàn {table.tableNumber}</span>
        <div className="table-actions">
          <button className="edit-btn" onClick={() => handleEditTable(table)}>
            Sửa
          </button>
          <button
            className="delete-btn"
            onClick={() => handleDeleteTable(table.id)}
          >
            Xóa
          </button>
        </div>
      </div>
      <div className="table-info">
        <div>Mã bàn: {table.tableCode}</div>
        <div>Sức chứa: {table.capacity} người</div>
        <div className={`table-status status-${table.status}`}>
          {getStatusLabel(table.status)}
        </div>
        <div className="table-description">
          <span className="description-text">
            {table.description ? table.description : "Không có mô tả"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-tables-container">
      {!selectedRestaurant ? (
        <div>
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {renderSelectFilter(
              "statusFilter",
              statusFilter,
              (e) => setStatusFilter(e.target.value),
              [
                { value: "all", text: "Tất cả trạng thái" },
                { value: "open", text: "Đang mở cửa" },
                { value: "maintenance", text: "Tạm ngưng" },
                { value: "closed", text: "Hết giờ hoạt động" },
              ],
              "Lọc theo trạng thái nhà hàng"
            )}
            {renderSelectFilter(
              "timeFilter",
              timeFilter,
              (e) => setTimeFilter(e.target.value),
              [
                { value: "all", text: "Tất cả thời gian" },
                { value: "morning", text: "Buổi sáng (6h-12h)" },
                { value: "afternoon", text: "Buổi chiều (12h-17h)" },
                { value: "evening", text: "Buổi tối (Sau 17h)" },
              ],
              "Lọc theo thời gian mở cửa"
            )}
          </div>
          <div className="restaurant-list">
            {filteredRestaurants.map(renderRestaurantItem)}
          </div>
        </div>
      ) : (
        <div className="restaurant-tables">
          <button
            className="back-btn-standalone"
            onClick={handleBackToRestaurants}
            title="Quay lại danh sách nhà hàng"
          >
            <i className="bi bi-arrow-left-circle-fill"></i> Quay lại danh sách
          </button>
          <div className="restaurant-header">
            <div className="header-left">
              <div className="restaurant-info-header">
                <div className="restaurant-title">
                  <span
                    className={`status-indicator ${getRestaurantStatus(
                      selectedRestaurant
                    )}`}
                    title={getRestaurantStatusLabel(
                      getRestaurantStatus(selectedRestaurant)
                    )}
                    style={getStatusDotStyle(
                      getRestaurantStatus(selectedRestaurant)
                    )}
                  ></span>
                  <h2>{selectedRestaurant.name}</h2>
                </div>
                <div className="table-stats">
                  <div className="table-count-display">
                    Tổng số bàn: {tables.length}
                  </div>
                  <div className="table-count-reserved">
                    Đã đặt:{" "}
                    {tables.filter((table) => table.status === "reserved").length}
                  </div>
                  <div className="table-count-occupied">
                    Đang sử dụng:{" "}
                    {tables.filter((table) => table.status === "occupied").length}
                  </div>
                  <div className="table-count-unavailable">
                    Không khả dụng:{" "}
                    {
                      tables.filter((table) => table.status === "unavailable")
                        .length
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="action-container">
              <div className="table-search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm số bàn hoặc mã bàn..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="form-control table-search-input"
                  aria-label="Tìm kiếm bàn"
                />
                <span className="search-icon">
                  <i className="bi bi-search"></i>
                </span>
              </div>
              <div className="table-filter-container">
                {renderSelectFilter(
                  "tableStatusFilter",
                  tableStatusFilter,
                  (e) => setTableStatusFilter(e.target.value),
                  [
                    { value: "all", text: "Tất cả trạng thái" },
                    { value: "available", text: "Trống" },
                    { value: "reserved", text: "Đã đặt" },
                    { value: "occupied", text: "Đang sử dụng" },
                    { value: "unavailable", text: "Không khả dụng" },
                  ],
                  "Lọc theo trạng thái bàn"
                )}
              </div>
              <button className="btn add-table-btn" onClick={handleAddTable}>
                <i className="bi bi-plus-lg me-2"></i>
                Thêm bàn
              </button>
            </div>
          </div>
          <div className="admin-tables-grid">
            {filterTables().map(renderTableCard)}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="table-modal">
            <h2>{isEditing ? "Chỉnh sửa bàn" : "Thêm bàn mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Số bàn</label>
                <input
                  type="text"
                  name="tableNumber"
                  value={currentTable.tableNumber}
                  onChange={handleInputChange}
                  placeholder="Nhập số bàn"
                  required
                />
              </div>
              <div className="form-group">
                <label>Sức chứa</label>
                <div className="capacity-input-group">
                  <input
                    type="number"
                    name="capacity"
                    value={currentTable.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                  />
                  <span className="capacity-addon">người</span>
                </div>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={currentTable.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="available">Trống</option>
                  <option value="reserved">Đã đặt</option>
                  <option value="occupied">Đang sử dụng</option>
                  <option value="unavailable">Không khả dụng</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={currentTable.description || ""}
                  onChange={handleInputChange}
                  placeholder="Mô tả bàn (tùy chọn)"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {isEditing ? "Cập nhật" : "Lưu"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div
          className="toast-notification"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            transform: "none",
            backgroundColor:
              toast.type === "success"
                ? "#28a745"
                : toast.type === "warning"
                ? "#ffc107"
                : toast.type === "danger"
                ? "#dc3545"
                : "#28a745",
            color: toast.type === "warning" ? "#212529" : "white",
            padding: "15px 20px",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            minWidth: "300px",
            maxWidth: "400px",
            animation: "slideInUp 0.3s ease-out",
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
              <i className="fa fa-check-circle" style={{ fontSize: "20px" }}></i>
            )}
            {toast.type === "warning" && (
              <i
                className="fa fa-exclamation-circle"
                style={{ fontSize: "20px" }}
              ></i>
            )}
            {toast.type === "danger" && (
              <i className="fa fa-times-circle" style={{ fontSize: "20px" }}></i>
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
            onClick={() => setToast({ show: false, message: "", type: "success" })}
          >
            Xong
          </div>
        </div>
      )}

      <style jsx="true">{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .toast-notification {
          animation: slideInUp 0.3s ease-out;
        }
        .custom-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-right: 15px;
        }
        .custom-select-filter {
          appearance: none;
          padding-right: 2.5rem !important;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-weight: 500;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        .search-filter-container {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-input {
          padding: 0.375rem 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 6px;
          margin-right: 15px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          min-width: 240px;
        }
        .search-input:focus,
        .search-input:hover {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }
        .custom-select-filter:hover {
          border-color: #80bdff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .custom-select-filter:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }
        .select-icon {
          position: absolute;
          right: 10px;
          pointer-events: none;
          display: flex;
          align-items: center;
          color: #6c757d;
        }
        .table-filter-container {
          margin-right: 15px;
        }
        .custom-select-filter option[value="all"] {
          font-weight: bold;
        }
        .custom-select-filter option[value="available"] {
          color: #28a745;
        }
        .custom-select-filter option[value="reserved"] {
          color: #ffc107;
        }
        .custom-select-filter option[value="occupied"] {
          color: #007bff;
        }
        .custom-select-filter option[value="unavailable"] {
          color: #dc3545;
        }
        .custom-select-filter option[value="open"] {
          color: #28a745;
        }
        .custom-select-filter option[value="maintenance"] {
          color: #dc3545;
        }
        .custom-select-filter option[value="closed"] {
          color: #6c757d;
        }
        .table-search-container {
          position: relative;
          min-width: 320px;
          width: 320px;
        }
        .table-search-input {
          padding-right: 2.5rem !important;
          border: 1px solid #ced4da;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        .table-search-input:hover {
          border-color: #80bdff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .table-search-input:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }
        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          pointer-events: none;
        }
        .action-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        .add-table-btn {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.375rem 0.75rem;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
          min-width: 120px;
          justify-content: center;
        }
        .add-table-btn:hover {
          background-color: #0069d9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .table-description {
          margin-top: 6px;
          border-top: 1px dashed #e0e0e0;
          padding-top: 6px;
        }
        .description-text {
          font-size: 0.75rem;
          color: #6c757d;
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 2.4em;
          line-height: 1.2;
        }
        .table-card {
          height: auto;
          min-height: 150px;
          display: flex;
          flex-direction: column;
        }
        .table-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .back-btn-standalone {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background-color: #fff;
          border: 1px solid #ced4da;
          border-radius: 6px;
          color: #495057;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        .back-btn-standalone i {
          margin-right: 8px;
          font-size: 1.2rem;
          color: #6c757d;
        }
        .back-btn-standalone:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .table-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 8px;
          width: 100%;
          justify-content: flex-start;
          margin-left: 10px;
        }
        .restaurant-info-header {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .table-search-container,
        .table-filter-container,
        .custom-select-wrapper {
          margin-right: 0;
        }
        @media (max-width: 1200px) {
          .restaurant-header {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          .action-container {
            justify-content: center;
            margin-left: 0;
          }
        }
        .restaurant-title {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .table-count-display {
          padding: 4px 10px;
          background-color: #e9ecef;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #495057;
        }
        .table-count-reserved {
          padding: 4px 10px;
          background-color: #fff3cd;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #856404;
        }
        .table-count-occupied {
          padding: 4px 10px;
          background-color: #cce5ff;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #004085;
        }
        .table-count-unavailable {
          padding: 4px 10px;
          background-color: #f8d7da;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #721c24;
        }
        .status-available {
          background-color: #d4edda;
          color: #155724;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        .status-reserved {
          background-color: #fff3cd;
          color: #856404;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        .status-occupied {
          background-color: #cce5ff;
          color: #004085;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        .status-unavailable {
          background-color: #f8d7da;
          color: #721c24;
          padding: 4px 10px;
          border-radius: 4px;
          display: inline-block;
        }
        .restaurant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .header-left {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .restaurant-info-header {
          width: 100%;
        }
        .action-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: flex-end;
          margin-left: 20px;
        }
      `}</style>
    </div>
  );
}

export default AdminTables;