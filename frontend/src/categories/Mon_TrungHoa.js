import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantPage from '../pages/RestaurantPage';

const MonTrungHoa = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the restaurant page with the Trung Hoa cuisine filter
    navigate('/nha-hang?cuisine=Trung Hoa', { replace: true });
  }, [navigate]);

  // This will render briefly before the redirect
  return <RestaurantPage />;
};

export default MonTrungHoa;
