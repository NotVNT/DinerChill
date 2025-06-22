const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dinerchill-secret-key';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: JWT_SECRET,
  
  // PayOS configuration
  payos: {
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    baseUrl: process.env.PAYOS_BASE_URL || 'https://api-sandbox.payos.vn'
  }
  
  // Sequelize database config is loaded from config.json
};

module.exports = config;
module.exports.JWT_SECRET = JWT_SECRET; 