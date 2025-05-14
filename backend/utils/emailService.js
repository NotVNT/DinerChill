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

/**
 * Send password reset email with link
 * @param {string} to - Recipient email address
 * @param {string} resetCode - Reset password code
 * @returns {Promise} - Email sending result
 */
const sendPasswordResetEmail = async (to, resetCode) => {
  const resetLink = `http://localhost:3000/reset-password?email=${encodeURIComponent(to)}&code=${resetCode}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Đặt lại Mật khẩu cho DinerChill',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a; text-align: center;">Yêu cầu Đặt lại Mật khẩu</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản DinerChill của bạn. Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e53935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Đặt lại Mật khẩu</a>
        </div>
        <p style="color: #666; font-size: 14px;">Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
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

/**
 * Send payment confirmation email
 * @param {string} to - Recipient email address
 * @param {Object} paymentInfo - Payment information object
 * @returns {Promise} - Email sending result
 */
const sendPaymentConfirmationEmail = async (to, paymentInfo) => {
  const {
    transactionId,
    amount,
    paymentMethod,
    paymentDate,
    status
  } = paymentInfo;

  // Format payment method for display
  const formattedPaymentMethod = paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt';
  
  // Format amount with thousand separator
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);
  
  // Format date for display
  const formattedDate = new Date(paymentDate).toLocaleString('vi-VN');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Xác Nhận Thanh Toán - DinerChill',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a; text-align: center;">Xác Nhận Thanh Toán</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Cảm ơn bạn đã thanh toán tại DinerChill. Dưới đây là thông tin chi tiết về giao dịch của bạn:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Mã giao dịch:</strong> ${transactionId}</p>
          <p style="margin: 5px 0;"><strong>Số tiền:</strong> ${formattedAmount} VND</p>
          <p style="margin: 5px 0;"><strong>Phương thức thanh toán:</strong> ${formattedPaymentMethod}</p>
          <p style="margin: 5px 0;"><strong>Thời gian thanh toán:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Trạng thái:</strong> 
            <span style="color: ${status === 'completed' ? '#4CAF50' : '#F44336'}; font-weight: bold;">
              ${status === 'completed' ? 'Đã thanh toán' : 'Đang xử lý'}
            </span>
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        <p style="color: #666; font-size: 14px;">Trân trọng cảm ơn,</p>
        <p style="color: #666; font-size: 14px;">Đội ngũ DinerChill</p>
        
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
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail
}; 