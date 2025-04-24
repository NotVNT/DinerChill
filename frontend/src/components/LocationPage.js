import React, { useState, useEffect, useRef } from 'react';
import '../styles/LocationPage.css';

function LocationPage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [ setSearchResults] = useState([]);
  const [searchResultMarkers, setSearchResultMarkers] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
          setShowMap(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Không thể xác định vị trí của bạn. Vui lòng cho phép quyền truy cập vị trí và thử lại.');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị. Vui lòng sử dụng trình duyệt khác.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (searchValue.trim().length > 1) {
      setIsLoadingSuggestions(true);
      setShowSuggestions(true);

      suggestionTimeoutRef.current = setTimeout(async () => {
        try {
          let searchTerm = searchValue.trim();
          if (/^pho$/i.test(searchTerm) || /^ph[oô]$/i.test(searchTerm)) {
            searchTerm = "phố";
          }

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=15&countrycodes=vn`,
            {
              headers: {
                'Accept-Language': 'vi-VN'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Không thể kết nối đến dịch vụ tìm kiếm');
          }

          const data = await response.json();

          const searchValueLower = searchTerm.toLowerCase();
          const isSearchingForPho = /^pho$/i.test(searchValueLower) || searchValueLower === "phố";

          const filteredResults = data.filter(item => {
            const displayName = item.display_name.toLowerCase();
            const isNotRestaurantOrFood = !(
              item.type === "restaurant" ||
              item.type === "food" ||
              item.type === "cafe" ||
              displayName.includes("nhà hàng") ||
              displayName.includes("quán ăn") ||
              displayName.includes("quán cà phê")
            );
            return isNotRestaurantOrFood;
          });

          const locationTypeScores = {
            "road": 10,
            "street": 10,
            "highway": 10,
            "hamlet": 8,
            "quarter": 8,
            "neighbourhood": 7,
            "residential": 7,
            "village": 6,
            "suburb": 5,
            "city_district": 5,
            "city": 4,
            "town": 4,
            "building": 3,
            "restaurant": -10,
            "cafe": -10,
            "food": -15
          };

          const processedResults = filteredResults
            .map(item => {
              let priorityScore = 0;

              if (item.type && locationTypeScores[item.type] !== undefined) {
                priorityScore += locationTypeScores[item.type];
              } else if (item.class === "highway") {
                priorityScore += locationTypeScores["highway"];
              }

              const displayName = item.display_name.toLowerCase();
              if (isSearchingForPho) {
                if (displayName.includes("phố")) {
                  priorityScore += 20;
                }
                if (displayName.includes("phở")) {
                  priorityScore -= 30;
                }
              }

              const nameParts = displayName.split(",");
              const firstPart = nameParts[0].trim().toLowerCase();
              if (firstPart.startsWith(searchValueLower)) {
                priorityScore += 15;
              } else if (firstPart.includes(searchValueLower)) {
                priorityScore += 5;
              }

              const isActualLocation = item.type && (
                item.type.includes("road") ||
                item.type.includes("street") ||
                item.type.includes("hamlet") ||
                item.type.includes("quarter") ||
                item.class === "highway" ||
                item.class === "place"
              );

              if (isActualLocation) {
                priorityScore += 10;
              }

              return {
                ...item,
                priorityScore
              };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, 5);

          setSuggestions(processedResults);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [searchValue]);

  const loadLeafletScript = () => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'leaflet-css';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.id = 'leaflet-js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        document.body.appendChild(script);
        script.onload = () => resolve();
      });
    }
    return Promise.resolve();
  };

  const searchLocation = async () => {
    if (!searchValue.trim()) {
      setSearchError('Vui lòng nhập địa chỉ cần tìm');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=1&countrycodes=vn`,
        {
          headers: {
            'Accept-Language': 'vi-VN'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Không thể kết nối đến dịch vụ tìm kiếm');
      }

      const data = await response.json();

      if (data.length === 0) {
        setSearchError('Không tìm thấy địa điểm. Vui lòng thử lại với từ khóa khác.');
        setSearchResults([]);
      } else {
        setSearchResults(data);
        addSearchResultsToMap(data);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setSearchError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion.display_name);
    setShowSuggestions(false);
    setTimeout(() => {
      searchLocation();
    }, 100);
  };

  const addSearchResultsToMap = (results) => {
    if (!mapInstanceRef.current || !window.L) return;

    searchResultMarkers.forEach(marker => {
      marker.remove();
    });
    setSearchResultMarkers([]);

    const L = window.L;
    const map = mapInstanceRef.current;
    const markers = [];

    const searchIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    results.forEach(result => {
      const marker = L.marker(
        [parseFloat(result.lat), parseFloat(result.lon)],
        { icon: searchIcon }
      ).addTo(map)
        .bindPopup(`
          <div class="popup-content">
            <h3>${result.display_name}</h3>
            <p>Loại: ${result.type}</p>
            ${result.address?.road ? `<p>Đường: ${result.address.road}</p>` : ''}
            ${result.address?.city ? `<p>Thành phố: ${result.address.city}</p>` : ''}
          </div>
        `);
      markers.push(marker);
    });

    setSearchResultMarkers(markers);

    if (results.length > 0) {
      map.setView(
        [parseFloat(results[0].lat), parseFloat(results[0].lon)],
        15
      );
      markers[0].openPopup();
    }
  };

  useEffect(() => {
    if (currentLocation && showMap && mapRef.current) {
      loadLeafletScript().then(() => {
        if (!mapInstanceRef.current && window.L) {
          const L = window.L;
          const map = L.map(mapRef.current).setView(
            [currentLocation.lat, currentLocation.lng], 
            15
          );

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          const userIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41]
          });

          L.marker([currentLocation.lat, currentLocation.lng], {icon: userIcon})
            .addTo(map)
            .bindPopup('Vị trí của bạn')
            .openPopup();

          const nearbyRestaurants = [
            { 
              position: { 
                lat: currentLocation.lat + 0.001, 
                lng: currentLocation.lng + 0.002 
              }, 
              title: 'Sân Thủy - Lê Ngô Cát',
              rating: 4,
              type: 'Gọi món Việt, Chuyên Hải sản'
            },
            { 
              position: { 
                lat: currentLocation.lat - 0.002, 
                lng: currentLocation.lng + 0.001 
              }, 
              title: 'Cheer House Restaurant',
              rating: 4.1,
              type: 'Gọi Á, Âu (Chuyền rượu vang)'
            },
            { 
              position: { 
                lat: currentLocation.lat + 0.0015, 
                lng: currentLocation.lng - 0.0015 
              }, 
              title: 'Cơm Niêu Sài Gòn - Hồ Xuân Hương',
              rating: 4,
              type: 'Cơm Việt, món kiểu Sài Gòn'
            }
          ];

          const restaurantIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41]
          });

          nearbyRestaurants.forEach(restaurant => {
            L.marker(
              [restaurant.position.lat, restaurant.position.lng],
              {icon: restaurantIcon}
            ).addTo(map)
             .bindPopup(`
               <div class="popup-content">
                 <h3>${restaurant.title}</h3>
                 <div class="restaurant-rating">
                   ${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.floor(restaurant.rating))}
                 </div>
                 <p>${restaurant.type}</p>
                 <button class="popup-button">Đặt chỗ</button>
               </div>
             `);
          });

          mapInstanceRef.current = map;
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentLocation, showMap]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  const formatSuggestionName = (suggestion) => {
    const nameParts = suggestion.display_name.split(',');
    const mainName = nameParts[0].trim();
    const locationParts = nameParts.slice(1).filter(part => 
      !part.trim().toLowerCase().includes("việt nam")
    );

    return {
      mainName,
      location: locationParts.join(', ').trim()
    };
  };

  return (
    <div className="location-page-container">
      <div className="location-header">
        <h1>Vị Trí Gần Bạn</h1>
        <p>Khám phá các nhà hàng và quán ăn gần khu vực của bạn</p>
      </div>

      <div className="search-input-wrapper" ref={inputRef}>
        <div className="location-pin-icon">
          <i className="location-pin">📍</i>
        </div>
        <input 
          type="text" 
          className="location-search-input" 
          placeholder="Nhập địa chỉ tìm kiếm" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => searchValue.trim().length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button 
          className="search-button-icon" 
          onClick={searchLocation}
          disabled={isSearching}
        >
          <i className="search-icon-magnifier">🔍</i>
        </button>
        
        {showSuggestions && (
          <div className="suggestions-dropdown">
            {isLoadingSuggestions ? (
              <div className="suggestion-loading">Đang tìm kiếm...</div>
            ) : suggestions.length > 0 ? (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => {
                  const formattedName = formatSuggestionName(suggestion);
                  return (
                    <li 
                      key={index} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="suggestion-icon">📍</div>
                      <div className="suggestion-content">
                        <div className="suggestion-main-name">{formattedName.mainName}</div>
                        <div className="suggestion-location">{formattedName.location}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-suggestions">Không tìm thấy gợi ý</div>
            )}
          </div>
        )}
      </div>

      {searchError && (
        <div className="search-error">
          <i className="error-icon-small">⚠️</i> {searchError}
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Đang xác định vị trí của bạn...</p>
        </div>
      )}

      {locationError && (
        <div className="error-message">
          <i className="error-icon">⚠️</i>
          <p>{locationError}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      )}

      {showMap && (
        <div className="map-container">
          <div ref={mapRef} className="leaflet-map"></div>
        </div>
      )}
    </div>
  );
}

export default LocationPage;