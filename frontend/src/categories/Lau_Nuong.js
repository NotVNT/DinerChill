import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const LauNuong = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Lẩu & Nướng cuisine filter
    navigate('/nha-hang?cuisine=Lẩu & Nướng', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default LauNuong;
