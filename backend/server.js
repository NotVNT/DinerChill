const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { User, TempUser } = require('./models');
const { Op } = require('sequelize');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin');
const fs = require('fs');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./utils/emailService');
const session = require('express-session');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const promotionRoutes = require('./routes/promotion');
const tableRoutes = require('./routes/table');
const paymentRoutes = require('./routes/payment');
const reservationRoutes = require('./routes/reservation');
const { sequelize } = require('./models');

// Đọc biến môi trường từ file .env
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(uploadsDir));

const JWT_SECRET = process.env.JWT_SECRET || 'dinerchillsecretkey';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dinerchillsecretkey',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware xác thực
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Middleware xác thực admin
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || user.roleId !== 1) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Route đăng nhập
app.post('/api/auth/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  try {
    // Tìm người dùng theo email hoặc số điện thoại
    const user = await User.findOne({ 
      where: {
        [Op.or]: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      } 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
    }
    
    // Kiểm tra xem đây có phải tài khoản đăng nhập bằng Google không
    if (user.googleId && !user.password) {
      return res.status(401).json({ 
        message: 'Thông tin đăng nhập không đúng'
      });
    }
    
    const isMatch = await user.validatePassword(password);
    
    if (!isMatch) {
      // Tăng số lần đăng nhập thất bại
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.update({ failedLoginAttempts: failedAttempts });
      
      // Hiển thị thông báo khác nhau tùy theo số lần thất bại
      if (failedAttempts >= 2) {
        return res.status(401).json({ 
          message: 'Tài khoản hoặc mật khẩu đăng nhập không chính xác. Vui lòng nhấn "Quên mật khẩu?" để đặt lại mật khẩu mới.'
        });
      } else {
        return res.status(401).json({ 
          message: 'Thông tin đăng nhập không đúng'
        });
      }
    }
    
    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.update({ failedLoginAttempts: 0 });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Tài khoản chưa được xác thực. Vui lòng xác thực email của bạn trước khi đăng nhập.',
        requiresVerification: true,
        email: user.email
      });
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Không gửi mật khẩu trong phản hồi
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route đăng ký
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  
  try {
    // Kiểm tra email đã tồn tại chưa trong cả 2 bảng users và temp_users
    const existingUser = await User.findOne({ where: { email } });
    const existingTempUser = await TempUser.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingPhoneUser = await User.findOne({ where: { phone } });
    const existingPhoneTempUser = await TempUser.findOne({ where: { phone } });
    
    if (existingPhoneUser || existingPhoneTempUser) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }
    
    // Nếu đã có trong bảng tạm, xóa record cũ để tạo mới
    if (existingTempUser) {
      await existingTempUser.destroy();
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // expires in 30 minutes
    
    // Lưu thông tin người dùng vào bảng tạm thời
    const newTempUser = await TempUser.create({
      name,
      email,
      phone,
      password,
      verificationCode,
      verificationExpires
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Delete the temp user if email fails
      await newTempUser.destroy();
      return res.status(500).json({ message: 'Không thể gửi email xác thực. Vui lòng thử lại sau.' });
    }
    
    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      email: newTempUser.email,
      requiresVerification: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route xác thực email
app.post('/api/auth/verify-email', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    // Tìm người dùng trong bảng tạm thời
    const tempUser = await TempUser.findOne({ 
      where: { 
        email,
        verificationCode: code,
        verificationExpires: { [Op.gt]: new Date() }
      }
    });
    
    if (!tempUser) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }
    
    // Tìm role_id cho user
    const userRole = await sequelize.model('UserRole').findOne({
      where: { name: 'user' }
    });

    if (!userRole) {
      return res.status(500).json({ message: 'Không thể tạo tài khoản. Vui lòng thử lại sau.' });
    }
    
    // Chuyển thông tin từ bảng tạm sang bảng chính thức
    // Sử dụng User.build() và save() thay vì create() để có thể bỏ qua hooks
    const newUser = User.build({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password, // Password đã được hash từ bảng tạm
      roleId: userRole.id, // Gán roleId từ role 'user'
      isVerified: true
    });
    
    // Bỏ qua hooks để không hash lại password
    await newUser.save({ hooks: false });
    
    // Xóa bản ghi tạm thời
    await tempUser.destroy();
    
    // Generate token for automatic login
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, roleId: newUser.roleId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Không gửi mật khẩu trong phản hồi
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    
    res.json({
      message: 'Xác thực email thành công!',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route resend verification code
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Tìm người dùng trong bảng tạm thời
    const tempUser = await TempUser.findOne({ where: { email } });
    
    if (!tempUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đăng ký hoặc đã được xác thực' });
    }
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // expires in 30 minutes
    
    // Update user with new verification code
    await tempUser.update({
      verificationCode,
      verificationExpires
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ message: 'Không thể gửi email xác thực. Vui lòng thử lại sau.' });
    }
    
    res.json({
      message: 'Mã xác thực mới đã được gửi đến email của bạn',
      email: tempUser.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route kiểm tra email tồn tại
app.post('/api/auth/check-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Tìm người dùng với email trong bảng User
    const user = await User.findOne({ where: { email } });
    
    // Trả về kết quả tồn tại hay không
    res.json({ exists: !!user });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route lấy thông tin user hiện tại
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: sequelize.models.UserRole,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Convert Sequelize model to plain object
    const userData = user.get({ plain: true });
    
    // Add role property for backward compatibility
    if (userData.role && userData.role.name) {
      userData.role = userData.role.name;
    }
    
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route cập nhật thông tin cá nhân
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const { name, phone, email } = req.body;
    
    // Kiểm tra nếu số điện thoại thay đổi, xem đã tồn tại chưa
    if (phone && phone !== user.phone) {
      const existingPhoneUser = await User.findOne({ 
        where: { 
          phone,
          id: { [Op.ne]: user.id } // Không phải là user hiện tại
        } 
      });
      
      if (existingPhoneUser) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng bởi tài khoản khác' });
      }
    }
    
    // Kiểm tra nếu email thay đổi, xem đã tồn tại chưa
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: user.id } // Không phải là user hiện tại
        } 
      });
      
      if (existingEmailUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
    }
    
    // Cập nhật thông tin
    const updateData = {
      name: name || user.name,
      phone: phone || user.phone
    };
    
    // Thêm email vào dữ liệu cập nhật nếu có
    if (email) {
      updateData.email = email;
    }
    
    console.log('Updating user profile:', updateData);
    
    await user.update(updateData);
    
    // Lấy lại user đã cập nhật (không bao gồm mật khẩu)
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetCode', 'resetExpires'] }
    });
    
    console.log('Updated user:', updatedUser.toJSON());
    
    res.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server: ' + err.message });
  }
});

// API Quản lý user (Admin)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetCode', 'resetExpires'] }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Chi tiết user (Admin)
app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'resetCode', 'resetExpires'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Cập nhật thông tin user (Admin)
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, phone, isAdmin, password } = req.body;
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Cập nhật thông tin
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone
    };
    
    // Cập nhật quyền admin nếu có
    if (isAdmin !== undefined) {
      updateData.isAdmin = isAdmin;
    }
    
    // Cập nhật mật khẩu nếu có
    if (password) {
      updateData.password = password;
    }
    
    await user.update(updateData);
    
    // Lấy lại user đã cập nhật (không bao gồm mật khẩu)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'resetCode', 'resetExpires'] }
    });
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Xóa user (Admin)
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Không cho phép xóa tài khoản admin đang đăng nhập
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản admin đang sử dụng' });
    }
    
    await user.destroy();
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route quên mật khẩu
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Tìm người dùng với email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Trả về thành công ngay cả khi email không tồn tại (bảo mật)
      return res.json({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi' });
    }
    
    // Tạo mã reset password
    const resetCode = Math.random().toString(36).substring(2, 10);
    const resetExpires = new Date(Date.now() + 3600000); // Mã có hiệu lực trong 1 giờ
    
    // Cập nhật thông tin reset cho user
    await user.update({
      resetCode,
      resetExpires
    });
    
    // Gửi email chứa link reset password
    await sendPasswordResetEmail(email, resetCode);
    
    res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route kiểm tra mã reset có hợp lệ không
app.post('/api/auth/verify-reset-code', async (req, res) => {
  const { email, resetCode } = req.body;
  
  try {
    // Tìm người dùng với email và mã reset hợp lệ
    const user = await User.findOne({
      where: {
        email,
        resetCode,
        resetExpires: {
          [Op.gt]: new Date() // resetExpires > current time
        }
      }
    });
    
    // Trả về kết quả xác thực
    res.json({ valid: !!user });
  } catch (err) {
    console.error('Error verifying reset code:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server', valid: false });
  }
});

// Route reset mật khẩu
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  
  try {
    // Tìm người dùng với email và mã reset hợp lệ
    const user = await User.findOne({
      where: {
        email,
        resetCode,
        resetExpires: {
          [Op.gt]: new Date() // resetExpires > current time
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }
    
    // Kiểm tra xem mật khẩu mới có trùng với mật khẩu hiện tại không
    if (user.password) {
      const isMatch = await user.validatePassword(newPassword);
      if (isMatch) {
        return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại của bạn' });
      }
    }
    
    // Cập nhật mật khẩu và xóa thông tin reset
    // Ở đây ta cung cấp mật khẩu mới chưa hash nên cần giữ hooks để hash password
    await user.update({
      password: newPassword,
      resetCode: null,
      resetExpires: null
    });
    
    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route thiết lập mật khẩu đầu tiên cho tài khoản Google
app.post('/api/auth/set-password', authenticate, async (req, res) => {
  const { newPassword } = req.body;
  
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra xem đây có phải tài khoản Google không có mật khẩu không
    if (!user.googleId) {
      return res.status(400).json({ 
        message: 'Tài khoản này không phải tài khoản Google hoặc đã có mật khẩu. Vui lòng sử dụng chức năng đổi mật khẩu.' 
      });
    }
    
    // Cập nhật mật khẩu mới
    await user.update({
      password: newPassword
    });
    
    // Tạo đối tượng user để trả về (loại bỏ thông tin nhạy cảm)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      googleId: user.googleId,
      password: true // Đảm bảo client biết user đã có mật khẩu
    };
    
    res.json({ 
      message: 'Mật khẩu đã được thiết lập thành công',
      user: userResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route đổi mật khẩu
app.post('/api/auth/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.validatePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }
    
    // Cập nhật mật khẩu mới
    await user.update({
      password: newPassword
    });
    
    res.json({ message: 'Mật khẩu đã được cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Use auth routes
app.use('/api/auth', authRoutes);

// Thêm vào cuối file server.js trước app.listen
app.use('/api/admin', adminRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/table', tableRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reservation', reservationRoutes);

// Add restaurant routes
const restaurantRoutes = require('./routes/restaurant');
app.use('/api/restaurants', restaurantRoutes);

// Explicitly disable review functionality
app.post('/api/restaurants/:id/reviews', (req, res) => {
  res.status(404).json({ message: 'Review functionality has been removed' });
});

app.get('/api/restaurants/:id/reviews', (req, res) => {
  res.status(404).json({ message: 'Review functionality has been removed' });
});

// Add this route after the existing restaurant routes
app.get('/api/restaurants/:id/images', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const { RestaurantImage } = require('./models');
    
    // Find all images for the restaurant
    const images = await RestaurantImage.findAll({
      where: { restaurant_id: restaurantId }
    });
    
    if (!images || images.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hình ảnh cho nhà hàng này' });
    }
    
    res.json(images);
  } catch (err) {
    console.error('Error fetching restaurant images:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server khi lấy hình ảnh nhà hàng' });
  }
});

// Add this route to get a single restaurant with all its images
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const { Restaurant, RestaurantImage } = require('./models');
    
    // Find restaurant with its images
    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [
        {
          model: RestaurantImage,
          as: 'images'
        }
      ]
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: `Không thể tìm thấy nhà hàng với ID: ${restaurantId}` });
    }
    
    res.json(restaurant);
  } catch (err) {
    console.error('Error fetching restaurant details:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server khi lấy thông tin nhà hàng' });
  }
});

// Hàm khởi động server với port cụ thể
const startServer = (port) => {
  const server = app.listen(port, async () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
    try {
      // Kiểm tra kết nối database khi khởi động server
      await sequelize.authenticate();
      console.log('Kết nối database thành công.');
    } catch (error) {
      console.error('Không thể kết nối đến database:', error);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} đã được sử dụng. Thử port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Lỗi khởi động server:', err);
    }
  });
};

// Bắt đầu với port mặc định
startServer(PORT);