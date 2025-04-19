const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

/**
 * Send verification email with code
 * @param {string} to - Recipient email address
 * @param {string} verificationCode - Verification code
 * @returns {Promise} - Email sending result
 */
const sendVerificationEmail = async (to, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Email Verification for DinerChill',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a; text-align: center;">Verify Your Email Address</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for registering with DinerChill. Please use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f5f5f5; padding: 15px; border-radius: 5px; display: inline-block;">${verificationCode}</div>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 30 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} DinerChill. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail
}; 