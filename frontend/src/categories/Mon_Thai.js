import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const MonThai = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Món Thái cuisine filter
    navigate('/nha-hang?cuisine=Món Thái', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default MonThai;
