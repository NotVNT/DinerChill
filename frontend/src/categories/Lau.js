import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const Lau = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Lẩu cuisine filter
    navigate('/nha-hang?cuisine=Lẩu', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default Lau;
