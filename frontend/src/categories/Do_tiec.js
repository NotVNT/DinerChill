import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const DoTiec = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Đồ tiệc cuisine filter
    navigate('/nha-hang?cuisine=Đồ tiệc', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default DoTiec;
