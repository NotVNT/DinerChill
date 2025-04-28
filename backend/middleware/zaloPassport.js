const axios = require('axios');
const qs = require('querystring');

// Middleware to handle Zalo OAuth
const zaloPassport = {
  // Convert Zalo OAuth code to token
  getToken: async (code, redirectUri) => {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://oauth.zaloapp.com/v4/access_token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': process.env.ZALO_CLIENT_SECRET
        },
        data: qs.stringify({
          code,
          app_id: process.env.ZALO_CLIENT_ID,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting Zalo token:', error);
      throw new Error('Failed to get Zalo access token');
    }
  },
  
  // Get user profile from Zalo using access token
  getUserProfile: async (accessToken) => {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://graph.zalo.me/v2.0/me',
        headers: {
          'access_token': accessToken
        },
        params: {
          fields: 'id,name,picture,email,phone,birthday'
        }
      });
      
      // Get phone from the Zalo API (if available)
      // Attempt to extract the phone number from the response
      let phoneNumber = null;
      try {
        if (response.data && response.data.phone) {
          phoneNumber = response.data.phone;
        }
      } catch (err) {
        console.log('Error extracting phone from Zalo response:', err);
      }
      
      // Add the phone number to the response data
      const userData = {
        ...response.data,
        phone: phoneNumber
      };
      
      console.log('Zalo user profile with phone:', userData);
      
      return userData;
    } catch (error) {
      console.error('Error getting Zalo profile:', error);
      throw new Error('Failed to get Zalo user profile');
    }
  }
};

module.exports = zaloPassport; 