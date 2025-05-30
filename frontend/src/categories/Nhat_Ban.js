import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const NhatBan = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Nhật Bản cuisine filter
    navigate('/nha-hang?cuisine=Nhật Bản', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default NhatBan;
