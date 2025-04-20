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
        
        const userData = {
          id: decodedData.id,
          name: decodedData.name,
          isAdmin: decodedData.isAdmin
        };
        
        setUser(userData);
        
        // For all users, remove token from URL and go to homepage
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error processing token:', error);
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate, setUser]);

  return null; // This component doesn't render anything
}

export default TokenHandler; 