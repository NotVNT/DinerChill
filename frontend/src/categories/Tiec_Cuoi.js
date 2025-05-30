import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const TiecCuoi = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Tiệc cưới cuisine filter
    navigate('/nha-hang?cuisine=Tiệc cưới', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default TiecCuoi;
