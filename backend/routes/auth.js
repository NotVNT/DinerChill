const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dinerchillsecretkey';

// Google OAuth login route
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { id: req.user.id, name: req.user.name, isAdmin: req.user.isAdmin },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      // Đảm bảo đã thiết lập đúng thông tin user trong req.user
      console.log('Google auth user:', req.user);
      
      // Kiểm tra xem người dùng có mật khẩu không
      const hasPassword = req.user.password !== null;
      
      // Redirect to frontend with token and additional information
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${token}&google=true&has_password=${hasPassword}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

module.exports = router; 