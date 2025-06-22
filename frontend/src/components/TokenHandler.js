import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useApp();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('dinerchillToken', token);
      
      // Decode token to get user info
      try {
        // Parse token base64 parts (JWT format: header.payload.signature)
        const payload = token.split('.')[1];
        const decodedData = JSON.parse(atob(payload));
        
        // Map roleId to role string for consistency
        let roleName = 'user';
        if (decodedData.roleId === 1) {
          roleName = 'admin';
        } else if (decodedData.roleId === 2) {
          roleName = 'restaurant_owner';
        }
        
        const userData = {
          id: decodedData.id,
          name: decodedData.name,
          roleId: decodedData.roleId,
          role: roleName // Add role string based on roleId
        };
        
        setUser(userData);
        
        // Check if there was a pending reservation before OAuth login
        const isOAuthLoginPending = sessionStorage.getItem('oauthLoginPending');
        const savedReservationData = sessionStorage.getItem('pendingReservation');
        
        if (isOAuthLoginPending && savedReservationData) {
          const reservationData = JSON.parse(savedReservationData);
          
          // Clean up OAuth login flag
          sessionStorage.removeItem('oauthLoginPending');
          
          // Redirect based on where we were in the reservation process
          if (reservationData.tableId) {
            // Already selected a table, construct query for reservation page
            const query = new URLSearchParams({
              restaurant: reservationData.restaurantId,
              date: reservationData.date,
              time: reservationData.time,
              guests: reservationData.guests,
              children: reservationData.children,
              tableId: reservationData.tableId,
              tableCode: reservationData.tableCode,
              tableCapacity: reservationData.tableCapacity
            });
            
            if (reservationData.promotion) {
              query.append("promotion", reservationData.promotion);
            }
            
            if (reservationData.promotionId) {
              query.append("promotionId", reservationData.promotionId);
            }
            
            // Clean up
            sessionStorage.removeItem('pendingReservation');
            
            // Navigate to reservation page with stored parameters
            navigate(`/reservation?${query.toString()}`);
          } else {
            // Navigate back to table selection
            const query = new URLSearchParams({
              date: reservationData.date,
              time: reservationData.time,
              guests: reservationData.guests,
              children: reservationData.children
            });
            
            if (reservationData.promotion) {
              query.append("promotion", reservationData.promotion);
            }
            
            // Clean up
            sessionStorage.removeItem('pendingReservation');
            
            navigate(`/restaurant/${reservationData.restaurantId}/tables?${query.toString()}`);
          }
        } else {
          // For all users, remove token from URL and go to homepage if no pending reservation
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error processing token:', error);
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate, setUser]);

  return null; // This component doesn't render anything
}

export default TokenHandler; 