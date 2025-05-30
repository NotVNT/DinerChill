import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const HaiSan = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Hải sản cuisine filter
    navigate('/nha-hang?cuisine=Hải sản', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default HaiSan;
