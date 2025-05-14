const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const zaloPassport = require('../middleware/zaloPassport');
const { User, UserRole } = require('../models');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dinerchillsecretkey';

// Google OAuth login route
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      // Đảm bảo đã thiết lập đúng thông tin user trong req.user
      console.log('Google auth user:', req.user);
      
      // Kiểm tra xem người dùng có mật khẩu không
      const hasPassword = req.user.password !== null;
      
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { id: req.user.id, name: req.user.name, roleId: req.user.roleId },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      // Redirect to frontend with token and additional information
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}&google=true&has_password=${hasPassword}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

// Zalo OAuth login route - Redirect user to Zalo's OAuth page
router.get('/zalo', (req, res) => {
  try {
    const redirectUri = `${process.env.API_URL || 'http://localhost:5000'}/api/auth/zalo/callback`;
    // URL encode the redirect URI properly
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    // Ensure the client ID is properly set
    const zaloClientId = process.env.ZALO_CLIENT_ID;
    
    if (!zaloClientId) {
      console.error('Zalo Client ID is not set');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=zalo_config_error`);
    }
    
    // Create the Zalo auth URL with proper encoding
    const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${zaloClientId}&redirect_uri=${encodedRedirectUri}&state=zalo`;
    console.log('Redirecting to Zalo auth URL:', zaloAuthUrl);
    
    // Redirect to Zalo
    res.redirect(zaloAuthUrl);
  } catch (error) {
    console.error('Error creating Zalo auth URL:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=zalo_init_failed`);
  }
});

// Zalo OAuth callback route
router.get('/zalo/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    // Check if there was an error in the Zalo OAuth process
    if (error) {
      console.error('Zalo OAuth error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=zalo_denied`);
    }
    
    if (!code) {
      throw new Error('No authorization code provided');
    }
    
    // Get the redirect URI used for the authorization code
    const redirectUri = `${process.env.API_URL || 'http://localhost:5000'}/api/auth/zalo/callback`;
    
    // Exchange code for access token
    const tokenData = await zaloPassport.getToken(code, redirectUri);
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }
    
    // Get user profile using access token
    const zaloProfile = await zaloPassport.getUserProfile(tokenData.access_token);
    
    console.log('Zalo user profile:', zaloProfile);
    
    if (!zaloProfile || !zaloProfile.id) {
      throw new Error('Failed to get user profile from Zalo');
    }
    
    // Try to find user by zaloId
    let user = await User.findOne({ 
      where: { zaloId: zaloProfile.id }
    });
    
    if (!user) {
      // Tìm role_id cho user
      const userRole = await UserRole.findOne({
        where: { name: 'user' }
      });

      if (!userRole) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=role_not_found`);
      }
      
      // If user doesn't exist, create a new one
      try {
        user = await User.create({
          name: zaloProfile.name || 'Zalo User',
          email: null, // No email for Zalo users
          phone: zaloProfile.phone || null,
          password: null, // No password for Zalo accounts
          zaloId: zaloProfile.id,
          roleId: userRole.id, // Thiết lập roleId cho user mới
          isVerified: true // Auto-verify OAuth users
        }, { 
          hooks: false,
          validate: false // Skip validation
        });
        
        console.log('Created new Zalo user:', user.id);
      } catch (createError) {
        console.error('Error creating Zalo user:', createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }
    } else {
      // Update phone for existing user if available from Zalo
      if (zaloProfile.phone && (!user.phone || user.phone === null)) {
        user.phone = zaloProfile.phone;
        await user.save();
        console.log('Updated phone for existing user:', user.id);
      }
    }
    
    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: user.id, name: user.name, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Check if user has a password
    const hasPassword = user.password !== null;
    
    // Redirect to frontend with token and user information
    console.log('Redirecting to frontend with token');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}&zalo=true&has_password=${hasPassword}`);
  } catch (error) {
    console.error('Error in Zalo authentication:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=zalo_auth_failed`);
  }
});

module.exports = router; 