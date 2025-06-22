import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { restaurantsAPI } from "../services/api";
import "../styles/RestaurantDetailPage.css";

function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToRecentlyViewed, userName } = useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notification, setNotification] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentBannerImageIndex, setCurrentBannerImageIndex] = useState(0); // Track current banner image index
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Get initial date, checking if current time is after 22:00 to select next day
  const getCurrentOrNextDay = () => {
    const now = new Date();
    if (now.getHours() >= 22) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split("T")[0];
    }
    return now.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    guests: 2,
    children: 0,
    date: getCurrentOrNextDay(),
    time: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageSource, setSelectedImageSource] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
    image: null,
  });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [favoriteList, setFavoriteList] = useState([]);
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [savedReviews, setSavedReviews] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const tabs = [
    { id: "summary", label: "Thông tin tóm tắt" },
    { id: "description", label: "Mô tả" },
    { id: "amenities", label: "Tiện ích" },
    { id: "operating-hours", label: "Giờ hoạt động" },
    { id: "promotions", label: "Ưu đãi" },
    { id: "reviews", label: "Đánh giá" },
    { id: "map", label: "Chỉ đường" },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showReservation = searchParams.get("showReservation");
    if (showReservation === "true") {
      setShowReservationForm(true);
      document
        .getElementById("booking-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const generateTimeSlots = useCallback(
    (openTime, closeTime) => {
      const times = [];
      const [openHour, openMinute] = openTime.split(":").map(Number);
      const [closeHour, closeMinute] = closeTime.split(":").map(Number);

      let currentHour = openHour;
      let currentMinute = openMinute;

      while (
        currentHour < closeHour ||
        (currentHour === closeHour && currentMinute <= closeMinute)
      ) {
        const timeString = `${currentHour
          .toString()
          .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
        times.push(timeString);

        currentMinute += 30;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour += 1;
        }
      }

      // Check if current date is today and if current time is after 22:00
      const today = new Date().toISOString().split("T")[0];
      const currentTime = new Date();
      const currentHourOfDay = currentTime.getHours();

      // If it's after 22:00, don't filter - we're already using tomorrow's date
      if (formData.date === today && currentHourOfDay < 22) {
        const filteredTimes = times.filter((time) => {
          const [hour, minute] = time.split(":").map(Number);
          const timeDate = new Date(currentTime);
          timeDate.setHours(hour, minute, 0, 0);
          const diffHours = (timeDate - currentTime) / (1000 * 60 * 60);
          return diffHours >= 2;
        });

        // Return filtered times if there are any, otherwise return all times
        return filteredTimes.length > 0 ? filteredTimes : times;
      }

      return times;
    },
    [formData.date]
  );

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await restaurantsAPI.getById(id);
        if (!data) throw new Error(`Không thể tìm thấy nhà hàng với ID: ${id}`);

        setRestaurant(data);

        if (data && data.id) {
          addToRecentlyViewed(data);
        }

        if (data.openingTime && data.closingTime) {
          const times = generateTimeSlots(data.openingTime, data.closingTime);
          setAvailableTimes(times);
          setFormData((prev) => ({ ...prev, time: times[0] || "" }));
        } else {
          setAvailableTimes([]);
          setFormData((prev) => ({ ...prev, time: "" }));
        }
      } catch (err) {
        console.error("Lỗi tìm nhà hàng:", err);
        setError(err.message);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, addToRecentlyViewed, generateTimeSlots]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(parseInt(id)));
    setFavoriteList(favorites);
  }, [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;

    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              const { latitude, longitude } = position.coords;
              setUserLocation(`${latitude},${longitude}`);
            }
          },
          (err) => {
            console.log("Không thể lấy vị trí người dùng:", err.message);
            if (isMounted) setUserLocation("");
          }
        );
      } else {
        console.log("Trình duyệt không hỗ trợ định vị.");
        if (isMounted) setUserLocation("");
      }
    };

    if (userLocation === null) {
      getUserLocation();
    }

    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  useEffect(() => {
    // Load saved reviews from session storage
    const loadSavedReviews = () => {
      try {
        const restaurantReviews =
          JSON.parse(sessionStorage.getItem(`reviews_${id}`)) || [];
        setSavedReviews(restaurantReviews);
      } catch (err) {
        console.error("Error loading saved reviews:", err);
        setSavedReviews([]);
      }
    };

    loadSavedReviews();
  }, [id]);

  const handleFavorite = () => {
    const favorites = [...favoriteList];
    const favoriteData = {
      id: parseInt(id),
      name: restaurant.name,
      image: restaurant.image,
      address: restaurant.address,
    };

    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (favId) => favId !== parseInt(id)
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      const existingFavoriteDetails = JSON.parse(
        localStorage.getItem("favoriteDetails") || "[]"
      );
      const updatedFavoriteDetails = existingFavoriteDetails.filter(
        (fav) => fav.id !== parseInt(id)
      );
      localStorage.setItem(
        "favoriteDetails",
        JSON.stringify(updatedFavoriteDetails)
      );
      setFavoriteList(updatedFavorites);
      setNotification("Đã bỏ yêu thích nhà hàng.");
      console.log(
        `Đã xóa ${restaurant.name} khỏi danh sách yêu thích của tài khoản.`
      );
    } else {
      favorites.push(parseInt(id));
      localStorage.setItem("favorites", JSON.stringify(favorites));
      const existingFavoriteDetails = JSON.parse(
        localStorage.getItem("favoriteDetails") || "[]"
      );
      if (!existingFavoriteDetails.some((fav) => fav.id === parseInt(id))) {
        localStorage.setItem(
          "favoriteDetails",
          JSON.stringify([...existingFavoriteDetails, favoriteData])
        );
      }
      setFavoriteList(favorites);
      setNotification("Đã thêm vào danh sách yêu thích.");
      console.log(
        `Đã thêm ${restaurant.name} vào danh sách yêu thích của tài khoản.`
      );
    }
    setIsFavorite(!isFavorite);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setNotification("Đã sao chép liên kết chia sẻ!");
        setTimeout(() => setNotification(null), 2000);
      })
      .catch((err) => {
        console.error("Lỗi khi sao chép liên kết:", err);
        setNotification("Không thể sao chép liên kết. Vui lòng thử lại.");
        setTimeout(() => setNotification(null), 2000);
      });
  };

  const handleOpenGoogleMaps = () => {
    if (!restaurant?.address) {
      setNotification("Địa chỉ nhà hàng không có sẵn.");
      return;
    }
    const encodedDestination = encodeURIComponent(restaurant.address);
    let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`;
    if (userLocation) {
      const encodedOrigin = encodeURIComponent(userLocation);
      googleMapsUrl += `&origin=${encodedOrigin}`;
    }
    window.open(googleMapsUrl, "_blank");
  };

  const handleFormChange = (e) => {
    e.stopPropagation();
    const { name, value } = e.target;

    // Special handling for date to prevent selecting a date earlier than the current selected date
    if (name === "date") {
      // Don't allow selecting dates earlier than the current value
      if (value < formData.date) {
        return; // Don't update if trying to select an earlier date
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookNow = () => {
    try {
      // Check if reservation time is at least 2 hours in the future
      const currentTime = new Date();
      const reservationTime = new Date(`${formData.date}T${formData.time}:00`);
      const timeDifferenceInHours =
        (reservationTime - currentTime) / (1000 * 60 * 60);

      if (timeDifferenceInHours < 2) {
        setNotification(
          "Thời gian đặt bàn phải ít nhất 2 giờ sau thời gian hiện tại"
        );
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      // Pass both guests and children params - partySize will be calculated as guests + children in ReservationPage
      const query = new URLSearchParams({
        date: formData.date,
        time: formData.time,
        guests: formData.guests.toString(),
        children: formData.children.toString(),
      }).toString();
      navigate(`/restaurant/${id}/tables?${query}`);
    } catch (err) {
      console.error("Lỗi khi chuyển hướng:", err);
      setNotification(
        "Có lỗi khi chuyển hướng đến trang đặt bàn. Vui lòng thử lại."
      );
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageSource(null);
    setCurrentModalImageIndex(0);
  };

  const nextImage = () => {
    let images;
    if (selectedImageSource === "menu") {
      images = (restaurant.menu || []).map((item) => item.image);
    } else if (selectedImageSource === "details") {
      images = restaurant.detailImages || [];
    } else {
      images = restaurant.images || [];
    }
    setCurrentModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    let images;
    if (selectedImageSource === "menu") {
      images = (restaurant.menu || []).map((item) => item.image);
    } else if (selectedImageSource === "details") {
      images = restaurant.detailImages || [];
    } else {
      images = restaurant.images || [];
    }
    setCurrentModalImageIndex(
      (prev) => (prev - 1 + images.length) % images.length
    );
  };

  const handlePromotionClick = (e, promo) => {
    e.stopPropagation();
    // Instead of showing modal, go directly to booking with promotion
    applyPromotionAndBook(promo);
  };

  const applyPromotionAndBook = (promo) => {
    if (!promo) {
      setNotification("Không có ưu đãi nào được chọn.");
      return;
    }

    try {
      // Check if reservation time is at least 2 hours in the future
      const currentTime = new Date();
      const reservationTime = new Date(`${formData.date}T${formData.time}:00`);
      const timeDifferenceInHours =
        (reservationTime - currentTime) / (1000 * 60 * 60);

      if (timeDifferenceInHours < 2) {
        setNotification(
          "Thời gian đặt bàn phải ít nhất 2 giờ sau thời gian hiện tại"
        );
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      // Pass both guests and children params - partySize will be calculated as guests + children in ReservationPage
      const query = new URLSearchParams({
        date: formData.date,
        time: formData.time,
        guests: formData.guests.toString(),
        children: formData.children.toString(),
        promotion: promo.code,
      }).toString();

      navigate(`/restaurant/${id}/tables?${query}`);
    } catch (error) {
      console.error("Error applying promotion:", error);
      setNotification("Có lỗi xảy ra khi áp dụng ưu đãi");
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setReviewForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      // Create new review with current date
      const newReview = {
        id: Date.now(), // Use timestamp as ID
        username: userName || "Người dùng mặc định",
        rating: reviewForm.rating,
        comment: reviewForm.comment || "",
        image: reviewForm.image, // Include image data
        date: new Date().toLocaleDateString("vi-VN"),
      };

      // Save to session storage
      const existingReviews =
        JSON.parse(sessionStorage.getItem(`reviews_${id}`)) || [];
      const updatedReviews = [newReview, ...existingReviews];
      sessionStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));

      // Update UI
      setSavedReviews(updatedReviews);

      // Reset form
      setReviewForm({ rating: 0, comment: "", image: null });
      setPreviewImage(null);

      setNotification("Cảm ơn bạn đã đánh giá!");
      setTimeout(() => setNotification(null), 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setNotification("Có lỗi xảy ra khi gửi đánh giá");
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleToggleReservationForm = () => {
    setShowReservationForm((prev) => !prev);
    if (!showReservationForm) {
      document
        .getElementById("booking-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getImageUrl = (image) => {
    if (!image) return "";

    if (typeof image === "object" && image.image_path) {
      const path = image.image_path;

      if (path.startsWith("http")) {
        return path;
      }

      if (path.includes("uploads/") || path.includes("uploads\\")) {
        return `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/uploads/${path.split("uploads/").pop().split("uploads\\").pop()}`;
      }

      return `${
        process.env.REACT_APP_API_URL || "http://localhost:5000"
      }/${path.replace(/^\//, "")}`;
    }

    if (typeof image === "string") {
      if (image.startsWith("http")) {
        return image;
      }

      if (image.includes("uploads/") || image.includes("uploads\\")) {
        return `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/uploads/${image.split("uploads/").pop().split("uploads\\").pop()}`;
      }

      return `${
        process.env.REACT_APP_API_URL || "http://localhost:5000"
      }/${image.replace(/^\//, "")}`;
    }

    return "";
  };

  // Functions to navigate banner images
  const nextBannerImage = (e) => {
    e.stopPropagation();
    if (restaurant?.images && restaurant.images.length > 0) {
      setCurrentBannerImageIndex(
        (prev) => (prev + 1) % restaurant.images.length
      );
    }
  };

  const prevBannerImage = (e) => {
    e.stopPropagation();
    if (restaurant?.images && restaurant.images.length > 0) {
      setCurrentBannerImageIndex(
        (prev) =>
          (prev - 1 + restaurant.images.length) % restaurant.images.length
      );
    }
  };

  // Navigate to specific image by index
  const goToImage = (index) => {
    setCurrentBannerImageIndex(index);
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && restaurant?.images && restaurant.images.length > 1) {
      // Swipe left - next image
      setCurrentBannerImageIndex(
        (prev) => (prev + 1) % restaurant.images.length
      );
    }
    
    if (isRightSwipe && restaurant?.images && restaurant.images.length > 1) {
      // Swipe right - previous image  
      setCurrentBannerImageIndex(
        (prev) => (prev - 1 + restaurant.images.length) % restaurant.images.length
      );
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (restaurant?.images && restaurant.images.length > 1) {
        if (e.key === 'ArrowLeft') {
          setCurrentBannerImageIndex(
            (prev) => (prev - 1 + restaurant.images.length) % restaurant.images.length
          );
        } else if (e.key === 'ArrowRight') {
          setCurrentBannerImageIndex(
            (prev) => (prev + 1) % restaurant.images.length
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restaurant?.images]);

  // Time validation function
  // eslint-disable-next-line no-unused-vars
  const _isValidTime = (date, time, openingTime, closingTime) => {
    if (!date || !time || !openingTime || !closingTime) return true;
    try {
      const reservationTime = new Date(`${date} ${time}`).getTime();

      // Extract hours and minutes from time strings
      const [openHour, openMin] = openingTime.split(":").map(Number);
      const [closeHour, closeMin] = closingTime.split(":").map(Number);

      // Convert to minutes for easier comparison
      const openTimeInMinutes = openHour * 60 + (openMin || 0);
      const closeTimeInMinutes = closeHour * 60 + (closeMin || 0);

      // Convert reservation time to hours and minutes
      const reservationDate = new Date(reservationTime);
      const reservationHour = reservationDate.getHours();
      const reservationMin = reservationDate.getMinutes();
      const reservationInMinutes = reservationHour * 60 + reservationMin;

      // Handle overnight hours (when closing time is earlier than opening time)
      if (closeTimeInMinutes < openTimeInMinutes) {
        // The restaurant closes after midnight
        return (
          reservationInMinutes >= openTimeInMinutes ||
          reservationInMinutes <= closeTimeInMinutes
        );
      } else {
        // Normal case
        return (
          reservationInMinutes >= openTimeInMinutes &&
          reservationInMinutes <= closeTimeInMinutes
        );
      }
    } catch (err) {
      console.error("Error parsing opening hours:", err);
      return true;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin nhà hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button className="btn" onClick={() => navigate("/restaurants")}>
            Quay lại danh sách nhà hàng
          </button>
          <button className="btn" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-container">
        <p className="error-message">Không tìm thấy nhà hàng với ID: {id}</p>
        <button className="btn" onClick={() => navigate("/restaurants")}>
          Quay lại danh sách nhà hàng
        </button>
      </div>
    );
  }

  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  // Update the amenities processing logic to handle amenities as an array
  const amenitiesList = restaurant.amenities || [];
  const displayedAmenities = showAllAmenities
    ? amenitiesList
    : amenitiesList.slice(0, 6);
  const bannerImage =
    restaurant?.images && restaurant.images.length > 0
      ? getImageUrl(restaurant.images[currentBannerImageIndex])
      : "";

  // Star Rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? "filled" : ""}`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="restaurant-detail-page">
      {notification && <div className="notification">{notification}</div>}

      <div className="back-button-container">
        <button className="back-button" onClick={handleGoBack}>
          <i className="back-icon">←</i> Quay về
        </button>
      </div>

      <div 
        className="restaurant-banner"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={bannerImage}
          alt={restaurant.name}
          className="banner-image"
          onError={(e) => {
            e.target.src = "/placeholder-restaurant.jpg";
          }}
        />
        {/* Add navigation arrows for banner images */}
        {restaurant?.images && restaurant.images.length > 1 && (
          <>
            <button
              className="banner-nav banner-prev"
              onClick={prevBannerImage}
              aria-label="Ảnh trước"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="banner-nav banner-next"
              onClick={nextBannerImage}
              aria-label="Ảnh tiếp theo"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            <div className="banner-image-counter">
              {currentBannerImageIndex + 1}/{restaurant.images.length}
            </div>
            {/* Add dot indicators */}
            <div className="banner-dots">
              {restaurant.images.map((_, index) => (
                <button
                  key={index}
                  className={`banner-dot ${index === currentBannerImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                  aria-label={`Chuyển đến ảnh ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="banner-overlay">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.address || "Địa chỉ không có"}</p>
          <div className="banner-actions">
            <button className="btn btn-outline" style={{color: 'white'}} onClick={handleFavorite}>
              <i
                className={`fas fa-heart ${
                  isFavorite ? "favorite-active" : ""
                }`}
              ></i>
              {isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            </button>
            <button className="btn btn-outline" style={{color: 'white'}} onClick={handleShare}>
              <i className="fas fa-share"></i> Chia sẻ
            </button>
            <button
              className="btn btn-outline"
              style={{color: 'white'}}
              onClick={handleToggleReservationForm}
            >
              <i className="fas fa-calendar-alt"></i> Đặt bàn
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tabs-container">
          <div className="tabs-menu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "summary" && (
          <section id="summary-section" className="content-section">
            <h2>Thông tin tóm tắt</h2>
            <div className="summary-card">
              <p>
                <i className="fas fa-map-marker-alt"></i> Địa chỉ:{" "}
                {restaurant.address || "Chưa cập nhật"}
              </p>
              <p>
                <i className="fas fa-utensils"></i> Loại hình:{" "}
                {restaurant.categories && restaurant.categories.length > 0
                  ? restaurant.categories.map((cat) => cat.name).join(", ")
                  : "Chưa cập nhật"}
              </p>
              <p>
                <i className="fas fa-money-bill-wave"></i> Giá:{" "}
                {restaurant.priceRange || "Chưa cập nhật"}
              </p>
              <p>
                <i className="fas fa-clock"></i> Giờ mở cửa:{" "}
                {restaurant.openingTime || "Chưa cập nhật"} -{" "}
                {restaurant.closingTime || "Chưa cập nhật"}
              </p>
              <p>
                <i className="fas fa-phone"></i> Điện thoại:{" "}
                {restaurant.phone || "Chưa cập nhật"}
              </p>
              <p>
                <i className="fas fa-envelope"></i> Email:{" "}
                {restaurant.email || "Chưa cập nhật"}
              </p>
            </div>
          </section>
        )}

        {activeTab === "description" && (
          <section id="description-section" className="content-section">
            <h2>Mô tả</h2>
            <div className="description-card">
              <p>{restaurant.description || "Chưa có thông tin mô tả."}</p>
            </div>
          </section>
        )}

        {activeTab === "amenities" && (
          <section id="amenities-section" className="content-section">
            <h2>Tiện ích</h2>
            <div className="amenities-card">
              {amenitiesList.length > 0 ? (
                <>
                  <div className="amenities-list">
                    {displayedAmenities.map((amenity) => (
                      <div key={amenity.id} className="amenity-item">
                        <i className="fas fa-check"></i>
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                  {amenitiesList.length > 6 && (
                    <button
                      className="btn btn-show-more"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                    >
                      {showAllAmenities ? "Thu gọn" : "Xem thêm"}
                    </button>
                  )}
                </>
              ) : (
                <p>Chưa có thông tin tiện ích.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "operating-hours" && (
          <section id="operating-hours-section" className="content-section">
            <h2>Giờ hoạt động</h2>
            <div className="operating-hours-card">
              {(() => {
                // Tạo mảng các ngày trong tuần
                const daysOfWeek = [
                  "Thứ Hai",
                  "Thứ Ba",
                  "Thứ Tư",
                  "Thứ Năm",
                  "Thứ Sáu",
                  "Thứ Bảy",
                  "Chủ Nhật",
                ];

                // Lấy ngày hiện tại trong tuần (0 = Chủ Nhật, 1 = Thứ Hai,...)
                const today = new Date();
                const currentDayIndex = today.getDay();
                // Chuyển đổi định dạng để phù hợp với mảng (0 = Thứ Hai, 6 = Chủ Nhật)
                const adjustedDayIndex =
                  currentDayIndex === 0 ? 6 : currentDayIndex - 1;

                // Hiển thị giờ hoạt động cho mỗi ngày
                return daysOfWeek.map((day, index) => {
                  const isCurrentDay = index === adjustedDayIndex;

                  // Xác định trạng thái đang mở cửa hay không
                  let isWithinOpeningHours = false;

                  if (
                    isCurrentDay &&
                    restaurant.openingTime &&
                    restaurant.closingTime
                  ) {
                    const [openHour, openMin] = restaurant.openingTime
                      .split(":")
                      .map(Number);
                    const [closeHour, closeMin] = restaurant.closingTime
                      .split(":")
                      .map(Number);

                    // Kiểm tra giờ hiện tại có nằm trong giờ mở cửa không
                    isWithinOpeningHours =
                      (currentHour > openHour ||
                        (currentHour === openHour &&
                          currentMinute >= openMin)) &&
                      (currentHour < closeHour ||
                        (currentHour === closeHour &&
                          currentMinute <= closeMin));

                    // Xử lý trường hợp đặc biệt khi giờ đóng cửa là ngày hôm sau
                    if (closeHour < openHour) {
                      isWithinOpeningHours =
                        (currentHour >= openHour && currentHour <= 23) ||
                        (currentHour >= 0 && currentHour < closeHour) ||
                        (currentHour === closeHour &&
                          currentMinute <= closeMin);
                    }
                  }

                  return (
                    <p
                      key={index}
                      className={`${isCurrentDay ? "current-day" : ""} ${
                        isCurrentDay && isWithinOpeningHours
                          ? "current-time"
                          : ""
                      }`}
                    >
                      {day}: {restaurant.openingTime || "Chưa cập nhật"} -{" "}
                      {restaurant.closingTime || "Chưa cập nhật"}
                      {isCurrentDay && (
                        <span className="operating-status">
                          {isWithinOpeningHours
                            ? " (Đang mở cửa)"
                            : " (Đã đóng cửa)"}
                        </span>
                      )}
                    </p>
                  );
                });
              })()}
            </div>
          </section>
        )}

        {activeTab === "promotions" && (
          <section id="promotions-section" className="content-section">
            <h2>Ưu đãi</h2>
            <div className="promotions-grid">
              {restaurant.promotions && restaurant.promotions.length > 0 ? (
                restaurant.promotions.map((promo, index) => (
                  <div className="promotion-card" key={promo.id || index}>
                    <div
                      className="promotion-header"
                      style={{ textAlign: "center" }}
                    >
                      {promo.code && (
                        <div
                          className="voucher-code"
                          style={{ display: "inline-block", margin: "0 auto" }}
                        >
                          <span className="code-label">Mã:</span>
                          <span className="code-value">{promo.code}</span>
                        </div>
                      )}
                    </div>
                    <div className="promotion-info">
                      <p className="promotion-description">
                        {promo.description || "Không có mô tả"}
                      </p>
                      <div className="promotion-details">
                        {promo.discountType === "percent" && (
                          <p className="discount-info">
                            <i className="fas fa-percentage"></i>
                            Giảm {promo.discountValue}%
                            {promo.maxDiscountValue &&
                              ` (tối đa ${promo.maxDiscountValue.toLocaleString(
                                "vi-VN"
                              )}đ)`}
                          </p>
                        )}
                        {promo.discountType === "fixed" && (
                          <p className="discount-info">
                            <i className="fas fa-money-bill-wave"></i>
                            Giảm {promo.discountValue.toLocaleString("vi-VN")}đ
                          </p>
                        )}
                        {promo.discountType === "freebies" && (
                          <p className="discount-info">
                            <i className="fas fa-gift"></i>
                            Quà tặng miễn phí
                          </p>
                        )}
                        {promo.minOrderValue && (
                          <p className="min-order">
                            <i className="fas fa-shopping-cart"></i>
                            Đơn tối thiểu:{" "}
                            {promo.minOrderValue.toLocaleString("vi-VN")}đ
                          </p>
                        )}
                        <p className="validity-period">
                          <i className="fas fa-calendar-alt"></i>
                          Có hiệu lực đến:{" "}
                          {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-choose"
                      onClick={(e) => handlePromotionClick(e, promo)}
                    >
                      Áp dụng ngay
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-promotions">
                  <i className="fas fa-tag"></i>
                  <p>Hiện tại nhà hàng chưa có chương trình khuyến mãi nào.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "reviews" && (
          <section id="reviews-section" className="content-section">
            <h2>Đánh giá từ khách hàng</h2>
            <div className="reviews-container">
              <div className="reviews-list-container">
                <h3>Đánh giá gần đây</h3>
                {savedReviews.length > 0 ? (
                  <div className="reviews-list">
                    {savedReviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <span>{review.username}</span>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        {review.image && (
                          <div className="review-image-container">
                            <img
                              src={review.image}
                              alt="Hình ảnh đánh giá"
                              className="review-image"
                            />
                          </div>
                        )}
                        <p className="review-date">{review.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-reviews">Chưa có đánh giá nào.</p>
                )}
              </div>

              <div className="review-form-container">
                <div className="review-form">
                  <h3>Gửi đánh giá của bạn</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="form-group">
                      <label>Tên của bạn:</label>
                      <input
                        type="text"
                        name="username"
                        value={userName || "Người dùng mặc định"}
                        disabled
                      />
                    </div>
                    <div className="form-group rating-group">
                      <label>Đánh giá:</label>
                      <div className="star-rating-select">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fas fa-star ${
                              star <= reviewForm.rating ? "filled" : ""
                            }`}
                            onClick={() =>
                              setReviewForm((prev) => ({
                                ...prev,
                                rating: star,
                              }))
                            }
                          ></i>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Bình luận:</label>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        rows="3"
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                      ></textarea>
                    </div>
                    <div className="form-group image-upload-group">
                      <label>Hình ảnh:</label>
                      <div className="file-input-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="file-input"
                          id="review-image-upload"
                        />
                        <label
                          htmlFor="review-image-upload"
                          className="file-input-label"
                        >
                          <i className="fas fa-camera"></i>
                        </label>
                      </div>
                      {previewImage && (
                        <div className="image-preview-container">
                          <img
                            src={previewImage}
                            alt="Xem trước"
                            className="image-preview"
                          />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => {
                              setPreviewImage(null);
                              setReviewForm((prev) => ({
                                ...prev,
                                image: null,
                              }));
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="btn btn-submit-review"
                      disabled={reviewForm.rating === 0}
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "map" && (
          <section id="map-section" className="content-section">
            <h2>Chỉ đường</h2>
            <div className="map-card">
              <p>Địa chỉ: {restaurant.address || "Không có thông tin"}</p>
              <button
                className="btn btn-book-now"
                onClick={handleOpenGoogleMaps}
              >
                Xem trên Google Maps
              </button>
            </div>
          </section>
        )}

        {showReservationForm && (
          <section
            id="booking-section"
            className="content-section fixed-booking"
          >
            <div className="booking-header">
              <h2>Đặt chỗ (Để có chỗ trước khi đến)</h2>
              <button
                className="close-reservation-btn"
                onClick={() => setShowReservationForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="booking-card">
              <p className="reservation-subtitle">Đặt bàn giữ chỗ</p>

              <div className="form-row">
                <div className="form-group-half">
                  <label>
                    <i className="fas fa-user"></i> Người lớn:
                  </label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleFormChange}
                  >
                    {[...Array(10).keys()].map((num) => (
                      <option key={num} value={num + 1}>
                        {num + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-half">
                  <label>
                    <i className="fas fa-child"></i> Trẻ em:
                  </label>
                  <select
                    name="children"
                    value={formData.children}
                    onChange={handleFormChange}
                  >
                    {[...Array(11).keys()].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group-time">
                <div className="time-label">
                  <i className="fas fa-clock"></i> Thời gian đến
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-half">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    min={formData.date}
                  />
                </div>

                <div className="form-group-half">
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                  >
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có khung giờ khả dụng</option>
                    )}
                  </select>
                </div>
              </div>

              <button
                className="btn-reserve-now"
                onClick={handleBookNow}
                disabled={!formData.time}
              >
                Đặt chỗ ngay
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Restaurant Gallery Section - Outside of tab system */}
      <div className="restaurant-gallery-section">
        <div className="gallery-container">
          <h2>Hình ảnh nhà hàng</h2>
          <div className="gallery-grid">
            {restaurant.images && restaurant.images.length > 0 ? (
              restaurant.images.map((image, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  onClick={() => {
                    setSelectedImage(image);
                    setSelectedImageSource("gallery");
                    setCurrentModalImageIndex(index);
                  }}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${restaurant.name} - Hình ${index + 1}`}
                    className="gallery-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="no-images">
                Chưa có hình ảnh nào cho nhà hàng này.
              </p>
            )}
          </div>
        </div>
      </div>

      {selectedImage && restaurant.images && restaurant.images.length > 0 && (
        <>
          <div className="modal-overlay" onClick={closeImageModal}></div>
          <div className="modal image-modal">
            <button className="modal-prev" onClick={prevImage}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="modal-content">
              <img
                src={getImageUrl(restaurant.images[currentModalImageIndex])}
                alt="Hình ảnh"
                className="modal-image"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
              <button className="close-modal" onClick={closeImageModal}>
                ×
              </button>
            </div>
            <button className="modal-next" onClick={nextImage}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default RestaurantDetailPage;
