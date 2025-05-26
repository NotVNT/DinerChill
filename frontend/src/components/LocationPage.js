import React, { useState, useEffect, useRef } from "react";
import "../styles/LocationPage.css";

function LocationPage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultMarkers, setSearchResultMarkers] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
          setShowMap(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            "Không thể xác định vị trí của bạn. Vui lòng cho phép quyền truy cập vị trí và thử lại."
          );
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError(
        "Trình duyệt của bạn không hỗ trợ định vị. Vui lòng sử dụng trình duyệt khác."
      );
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (searchValue.trim().length > 0) {
      setIsLoadingSuggestions(true);
      setShowSuggestions(true);

      suggestionTimeoutRef.current = setTimeout(async () => {
        try {
          let searchTerm = searchValue.trim();
          if (/^pho$/i.test(searchTerm) || /^ph[oô]$/i.test(searchTerm)) {
            searchTerm = "phố";
          }

          // Thêm viewbox để giới hạn khu vực tìm kiếm trong Việt Nam
          const vietnamViewbox = "102.0,8.0,110.0,24.0";

          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchTerm
            )}&limit=15&countrycodes=vn&viewbox=${vietnamViewbox}&bounded=1`,
            {
              headers: {
                "Accept-Language": "vi-VN",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Không thể kết nối đến dịch vụ tìm kiếm");
          }

          const data = await response.json();

          const searchValueLower = searchTerm.toLowerCase();
          const isSearchingForPho =
            /^pho$/i.test(searchValueLower) || searchValueLower === "phố";

          const filteredResults = data.filter((item) => {
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
            road: 10,
            street: 10,
            highway: 10,
            hamlet: 8,
            quarter: 8,
            neighbourhood: 7,
            residential: 7,
            village: 6,
            suburb: 5,
            city_district: 5,
            city: 4,
            town: 4,
            building: 3,
            restaurant: -10,
            cafe: -10,
            food: -15,
          };

          const processedResults = filteredResults
            .map((item) => {
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

              const isActualLocation =
                item.type &&
                (item.type.includes("road") ||
                  item.type.includes("street") ||
                  item.type.includes("hamlet") ||
                  item.type.includes("quarter") ||
                  item.class === "highway" ||
                  item.class === "place");

              if (isActualLocation) {
                priorityScore += 10;
              }

              return {
                ...item,
                priorityScore,
              };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore);

          // Loại bỏ các kết quả trùng lặp hoặc quá giống nhau
          const normalizeVietnamese = (text) => {
            return text
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
          };

          const uniqueResults = [];
          const seenAddresses = new Set();

          for (const result of processedResults) {
            // Chuẩn hóa các thành phần địa chỉ để so sánh
            const addressParts = result.display_name
              .split(",")
              .map((part) => normalizeVietnamese(part.trim()));

            // Trích xuất các thành phần quan trọng như phường, quận, thành phố
            const importantParts = [];
            for (const part of addressParts) {
              if (
                part.includes("phuong") ||
                part.includes("quan") ||
                part.includes("thanh pho") ||
                part.includes("duong") ||
                part.includes("pho")
              ) {
                importantParts.push(part);
              }
            }

            // Tạo khóa duy nhất dựa trên các phần quan trọng
            const addressKey = importantParts.join("|");

            if (!seenAddresses.has(addressKey)) {
              seenAddresses.add(addressKey);
              uniqueResults.push(result);
            }
          }

          // Nếu đang tìm kiếm địa chỉ cụ thể và chỉ có một kết quả cùng phường quận
          const specificSearch =
            searchValue.toLowerCase().includes("phường") &&
            searchValue.toLowerCase().includes("quận");

          if (specificSearch && uniqueResults.length > 1) {
            // Phân tích chuỗi tìm kiếm
            const searchNormalized = normalizeVietnamese(searchValue);

            // Phát hiện phường, quận trong tìm kiếm
            const wardMatch = searchNormalized.match(/phuong\s+(\d+|[^,]+)/i);
            const districtMatch = searchNormalized.match(
              /quan\s+(\d+|[^,]+)|binh\s+thanh|thu\s+duc/i
            );

            if (wardMatch && districtMatch) {
              const wardSearch = wardMatch[0];
              const districtSearch = districtMatch[0];

              // Tìm kết quả phù hợp nhất với phường và quận
              const exactMatches = uniqueResults.filter((item) => {
                const itemNormalized = normalizeVietnamese(item.display_name);
                return (
                  itemNormalized.includes(wardSearch) &&
                  itemNormalized.includes(districtSearch)
                );
              });

              if (exactMatches.length > 0) {
                setSuggestions(exactMatches.slice(0, 1)); // Chỉ lấy kết quả đầu tiên
                setIsLoadingSuggestions(false);
                return;
              }
            }
          }

          setSuggestions(uniqueResults.slice(0, 5));
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 200);
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
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "leaflet-css";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.id = "leaflet-js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        document.body.appendChild(script);
        script.onload = () => resolve();
      });
    }
    return Promise.resolve();
  };

  const searchLocation = async () => {
    if (!searchValue.trim()) {
      setSearchError("Vui lòng nhập địa chỉ cần tìm");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);

    try {
      // Thêm viewbox để giới hạn khu vực tìm kiếm trong Việt Nam
      // Tọa độ Việt Nam: khoảng từ 8.0-24.0 vĩ độ N, 102.0-110.0 kinh độ E
      const vietnamViewbox = "102.0,8.0,110.0,24.0";

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchValue
        )}&limit=15&countrycodes=vn&viewbox=${vietnamViewbox}&bounded=1`,
        {
          headers: {
            "Accept-Language": "vi-VN",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể kết nối đến dịch vụ tìm kiếm");
      }

      const data = await response.json();

      if (data.length === 0) {
        setSearchError(
          "Không tìm thấy địa điểm. Vui lòng thử lại với từ khóa khác."
        );
      } else {
        // Phân tích chuỗi tìm kiếm để lấy thông tin thành phố, quận, phường
        const normalizeVietnamese = (text) => {
          return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        };

        const searchNormalized = normalizeVietnamese(searchValue);

        // Phát hiện thành phố
        const cityPatterns = [
          {
            pattern:
              /h[oố]\s*ch[ií]\s*minh|hcm|tp\.?\s*hcm|tp\.?\s*h[oố]\s*ch[ií]\s*minh|s[aà]i\s*g[oò]n/i,
            city: "ho chi minh",
          },
          {
            pattern: /h[aà]\s*n[oộ]i|hn|tp\.?\s*hn|tp\.?\s*h[aà]\s*n[oộ]i/i,
            city: "ha noi",
          },
          {
            pattern:
              /[dđ][aà]\s*n[ăẵ]ng|[dđ]n|tp\.?\s*[dđ]n|tp\.?\s*[dđ][aà]\s*n[ăẵ]ng/i,
            city: "da nang",
          },
          {
            pattern: /c[aầ]n\s*th[oơ]|ct|tp\.?\s*ct|tp\.?\s*c[aầ]n\s*th[oơ]/i,
            city: "can tho",
          },
          {
            pattern:
              /h[aả]i\s*ph[oò]ng|hp|tp\.?\s*hp|tp\.?\s*h[aả]i\s*ph[oò]ng/i,
            city: "hai phong",
          },
        ];

        let detectedCity = null;
        for (const { pattern, city } of cityPatterns) {
          if (pattern.test(searchNormalized)) {
            detectedCity = city;
            break;
          }
        }

        // Phát hiện quận
        const districtMatch = searchNormalized.match(
          /qu[aậ]n\s+(\d+|[^,]+)|huy[eệ]n\s+([^,]+)|b[ìi]nh\s+th[aạ]nh|g[oò]\s+v[aấ]p|t[aâ]n\s+b[ìi]nh|ph[uú]\s+nhu[aậ]n|th[uủ]\s+[dđ][uứ]c/i
        );
        const detectedDistrict = districtMatch ? districtMatch[0] : null;

        // Phát hiện phường/xã
        const wardMatch = searchNormalized.match(
          /ph[uư][oờ]ng\s+(\d+|[^,]+)|x[aã]\s+([^,]+)/i
        );
        const detectedWard = wardMatch ? wardMatch[0] : null;

        // Phát hiện tên đường
        const streetMatch = searchNormalized.match(
          /([^,]+)(\s+street|\s+[dđ][uư][oờ]ng|\s+qu[oố]c\s+l[oộ])/i
        );
        const detectedStreet = streetMatch ? streetMatch[1] : null;

        // Lọc và xếp hạng kết quả
        const scoredResults = data.map((result) => {
          let score = 0;
          const displayNameNormalized = normalizeVietnamese(
            result.display_name
          );

          // Ưu tiên kết quả có đúng thành phố
          if (detectedCity) {
            if (displayNameNormalized.includes(detectedCity)) {
              score += 150;
            } else if (
              detectedCity === "ho chi minh" &&
              displayNameNormalized.includes("sai gon")
            ) {
              score += 150;
            }
          }

          // Ưu tiên kết quả có đúng quận/huyện
          if (
            detectedDistrict &&
            displayNameNormalized.includes(
              normalizeVietnamese(detectedDistrict)
            )
          ) {
            score += 100;
          }

          // Ưu tiên kết quả có đúng phường/xã
          if (
            detectedWard &&
            displayNameNormalized.includes(normalizeVietnamese(detectedWard))
          ) {
            score += 80;
          }

          // Ưu tiên kết quả có đúng tên đường
          if (
            detectedStreet &&
            displayNameNormalized.includes(normalizeVietnamese(detectedStreet))
          ) {
            score += 60;
          }

          // Một số trường hợp đặc biệt
          if (
            displayNameNormalized.includes("ha noi") &&
            !searchNormalized.includes("ha noi")
          ) {
            score -= 100; // Giảm điểm cho kết quả ở Hà Nội nếu không phải chủ ý tìm
          }

          if (normalizeVietnamese(searchValue).includes("pham van dong")) {
            // Đường Phạm Văn Đồng xuất hiện ở nhiều thành phố
            if (
              detectedCity === "ho chi minh" &&
              displayNameNormalized.includes("ho chi minh")
            ) {
              score += 120; // Tăng điểm cho Phạm Văn Đồng ở TP.HCM
            }
            if (
              detectedDistrict === "binh thanh" &&
              displayNameNormalized.includes("binh thanh")
            ) {
              score += 100; // Tăng điểm cho Phạm Văn Đồng ở Bình Thạnh
            }
          }

          // Ưu tiên loại kết quả thích hợp
          if (
            result.type === "street" ||
            result.type === "road" ||
            result.type === "residential"
          ) {
            score += 30;
          }

          // Độ chính xác của vĩ độ, kinh độ (chứng tỏ kết quả chính xác hơn)
          if (result.lat && result.lon) {
            score += 10;
          }

          return {
            ...result,
            score,
          };
        });

        // Sắp xếp theo điểm cao nhất
        const sortedResults = scoredResults.sort((a, b) => b.score - a.score);

        // Log ra kết quả đã xếp hạng để debug
        console.log(
          "Kết quả tìm kiếm được xếp hạng:",
          sortedResults.map((r) => ({
            name: r.display_name,
            score: r.score,
          }))
        );

        // Sử dụng kết quả đầu tiên sau khi đã lọc và sắp xếp
        addSearchResultsToMap([sortedResults[0]]);
      }
    } catch (error) {
      console.error("Error searching for location:", error);
      setSearchError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.");
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

    searchResultMarkers.forEach((marker) => {
      marker.remove();
    });
    setSearchResultMarkers([]);

    const L = window.L;
    const map = mapInstanceRef.current;
    const markers = [];

    const searchIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    });

    results.forEach((result) => {
      const marker = L.marker(
        [parseFloat(result.lat), parseFloat(result.lon)],
        { icon: searchIcon }
      ).addTo(map).bindPopup(`
          <div class="popup-content">
            <h3>${result.display_name}</h3>
            <p>Loại: ${result.type}</p>
            ${
              result.address?.road ? `<p>Đường: ${result.address.road}</p>` : ""
            }
            ${
              result.address?.city
                ? `<p>Thành phố: ${result.address.city}</p>`
                : ""
            }
          </div>
        `);
      markers.push(marker);
    });

    setSearchResultMarkers(markers);

    if (results.length > 0) {
      map.setView([parseFloat(results[0].lat), parseFloat(results[0].lon)], 15);
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

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          const userIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            shadowSize: [41, 41],
          });

          L.marker([currentLocation.lat, currentLocation.lng], {
            icon: userIcon,
          })
            .addTo(map)
            .bindPopup("Vị trí của bạn")
            .openPopup();

          const restaurantsData = [
            {
              position: {
                lat: currentLocation.lat + 0.001,
                lng: currentLocation.lng + 0.002,
              },
              title: "Sân Thủy - Lê Ngô Cát",
              type: "Gỏi món Việt, Chuyên Hải sản",
              address: "12 Lê Ngô Cát, Quận 3, TP. Hồ Chí Minh",
              distance: "1.2 km",
            },
            {
              position: {
                lat: currentLocation.lat - 0.002,
                lng: currentLocation.lng + 0.001,
              },
              title: "Cheer House Restaurant",
              type: "Gỏi Á, Âu (Chuyền rượu vang)",
              address: "50 Hồ Xuân Hương, Quận 3, TP. Hồ Chí Minh",
              distance: "0.8 km",
            },
            {
              position: {
                lat: currentLocation.lat + 0.0015,
                lng: currentLocation.lng - 0.0015,
              },
              title: "Cơm Niêu Sài Gòn - Hồ Xuân Hương",
              type: "Cơm Việt, món kiểu Sài Gòn",
              address: "24 Hồ Xuân Hương, Quận 3, TP. Hồ Chí Minh",
              distance: "1.5 km",
            },
            {
              position: {
                lat: currentLocation.lat + 0.0025,
                lng: currentLocation.lng + 0.001,
              },
              title: "Phở Lệ Nguyễn Trãi",
              type: "Phở, Đặc sản Việt Nam",
              address: "303 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
              distance: "1.7 km",
            },
            {
              position: {
                lat: currentLocation.lat - 0.001,
                lng: currentLocation.lng - 0.002,
              },
              title: "Bếp Nhà Lê",
              type: "Món Việt truyền thống",
              address: "18 Trương Định, Quận 3, TP. Hồ Chí Minh",
              distance: "0.9 km",
            },
            {
              position: {
                lat: currentLocation.lat - 0.0018,
                lng: currentLocation.lng + 0.0025,
              },
              title: "The Coffee House",
              type: "Quán cà phê, Bánh ngọt",
              address: "15 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh",
              distance: "1.3 km",
            },
          ];

          setNearbyRestaurants(restaurantsData);

          // Thêm nút "Quay về vị trí của bạn"
          const locationButton = L.control({ position: "bottomright" });

          locationButton.onAdd = function () {
            const div = L.DomUtil.create(
              "div",
              "leaflet-bar leaflet-control current-location-button"
            );
            div.innerHTML =
              '<a href="#" title="Quay về vị trí của bạn"><span>📍</span></a>';

            L.DomEvent.on(div, "click", function (e) {
              L.DomEvent.preventDefault(e);
              map.setView([currentLocation.lat, currentLocation.lng], 15);
            });

            return div;
          };

          locationButton.addTo(map);

          const restaurantIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            shadowSize: [41, 41],
          });

          restaurantsData.forEach((restaurant) => {
            L.marker([restaurant.position.lat, restaurant.position.lng], {
              icon: restaurantIcon,
            }).addTo(map).bindPopup(`
               <div class="popup-content">
                 <h3>${restaurant.title}</h3>
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
    if (e.key === "Enter") {
      searchLocation();
    }
  };

  const formatSuggestionName = (suggestion) => {
    const nameParts = suggestion.display_name.split(",");
    const mainName = nameParts[0].trim();
    const locationParts = nameParts
      .slice(1)
      .filter((part) => !part.trim().toLowerCase().includes("việt nam"));

    return {
      mainName,
      location: locationParts.join(", ").trim(),
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
          onFocus={() =>
            searchValue.trim().length > 0 && setShowSuggestions(true)
          }
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
                        <div className="suggestion-main-name">
                          {formattedName.mainName}
                        </div>
                        <div className="suggestion-location">
                          {formattedName.location}
                        </div>
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
        <div className="location-content-container">
          <div className="location-content-wrapper">
            <div className="restaurant-list-section">
              <div className="restaurant-list-cards">
                {nearbyRestaurants.map((restaurant, index) => (
                  <div key={index} className="restaurant-card">
                    <h4 className="restaurant-name">{restaurant.title}</h4>
                    <p className="restaurant-address">{restaurant.address}</p>
                    <div className="restaurant-info">
                      <span className="restaurant-distance">
                        <i className="distance-icon">📍</i>{" "}
                        {restaurant.distance}
                      </span>
                    </div>
                    <p className="restaurant-type">{restaurant.type}</p>
                    <button className="book-button">Đặt chỗ</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="map-section">
              <div className="map-container">
                <div ref={mapRef} className="leaflet-map"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPage;
