import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const MonViet = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Việt Nam cuisine filter
    navigate('/nha-hang?cuisine=Việt Nam', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default MonViet;
