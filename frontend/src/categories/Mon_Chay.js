import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const MonChay = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Chay cuisine filter
    navigate('/nha-hang?cuisine=Chay', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default MonChay;
