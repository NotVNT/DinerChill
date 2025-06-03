import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { amenitiesAPI } from "../../services/api";
import "../styles/modules/amenityTemplate.css";

const AmenityTemplate = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const data = await amenitiesAPI.getAll();
        setAmenities(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching amenities:", error);
        setError("Không thể tải danh sách tiện ích. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const handleAmenityClick = (amenityId) => {
    // Navigate to filter results page with the selected amenity
    navigate(`/filter-results?amenityId=${amenityId}`);
  };

  if (loading) {
    return (
      <div className="amenity-loading">Đang tải danh sách tiện ích...</div>
    );
  }

  if (error) {
    return <div className="amenity-error">{error}</div>;
  }

  return (
    <div className="amenity-template">
      <h2>Tiện ích</h2>
      <div className="amenity-grid">
        {amenities.map((amenity) => (
          <div
            key={amenity.id}
            className="amenity-item"
            onClick={() => handleAmenityClick(amenity.id)}
          >
            <span className="amenity-name">{amenity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenityTemplate;
