const dotenv = require('dotenv');
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'dinerchill-secret-key',
  
  // PayOS configuration
  payos: {
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    baseUrl: process.env.PAYOS_BASE_URL || 'https://api-sandbox.payos.vn'
  },
  
  // Sequelize database config is loaded from config.json
  
  // Upload configuration
  upload: {
    imagePath: process.env.IMAGE_UPLOAD_PATH || 'uploads/images',
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};

module.exports = config; 