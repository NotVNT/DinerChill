import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function AdminMyReservations() {
  // Xóa biến user nếu không sử dụng
  const { /* user */ } = useApp();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getReservations();
      setReservations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Phần còn lại của component...
}

export default AdminMyReservations; 