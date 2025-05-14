const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, UserRole } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dinerchillsecretkey';

// Initialize Passport with Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile);
      
      // Extract email from profile
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }
      
      // Try to find user by googleId
      let user = await User.findOne({ 
        where: { 
          googleId: profile.id 
        } 
      });
      
      if (!user) {
        // If not found by googleId, try to find by email
        user = await User.findOne({ 
          where: { 
            email: email 
          } 
        });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
        } else {
          // Tìm roleId của role "user"
          const userRole = await UserRole.findOne({
            where: { name: 'user' }
          });
          
          if (!userRole) {
            return done(new Error('Role "user" not found'), null);
          }
          
          try {
            // Create new user with Google profile info
            user = await User.create({
              name: profile.displayName || 'Google User',
              email: email,
              phone: null, // Changed from empty string to null
              password: null, // Không tạo password cho tài khoản Google
              googleId: profile.id,
              roleId: userRole.id, // Thiết lập roleId cho user mới
              isVerified: true
            }, { 
              // Bỏ qua validation cho trường password
              hooks: false,
              validate: false // Skip validation for all fields
            });
          } catch (createError) {
            console.error('Error creating user:', createError);
            return done(createError, null);
          }
        }
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Google authentication error:', err);
      return done(err, null);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 