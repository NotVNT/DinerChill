import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const QuanNhau = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Quán Nhậu cuisine filter
    navigate('/nha-hang?cuisine=Quán Nhậu', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default QuanNhau;
