const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const { Op } = require('sequelize');
const dotenv = require('dotenv');

// Đọc biến môi trường từ file .env
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'dinerchillsecretkey';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // URL của frontend
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Route đăng nhập
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    const isMatch = await user.validatePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, isAdmin: user.isAdmin },
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
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    // Tạo người dùng mới
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      isAdmin: false
    });
    
    // Tạo token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, isAdmin: newUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Không gửi mật khẩu trong phản hồi
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
  }
});

// Route lấy thông tin user hiện tại
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
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

// Route cập nhật thông tin cá nhân
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const { name, phone } = req.body;
    
    // Cập nhật thông tin
    const updateData = {
      name: name || user.name,
      phone: phone || user.phone
    };
    
    await user.update(updateData);
    
    // Lấy lại user đã cập nhật (không bao gồm mật khẩu)
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetCode', 'resetExpires'] }
    });
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
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
    
    // Trong thực tế, gửi email chứa link reset password
    console.log(`Reset code for ${email}: ${resetCode}`);
    
    res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã xảy ra lỗi server' });
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
    
    // Cập nhật mật khẩu và xóa thông tin reset
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

// Khởi động server
app.listen(PORT, async () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  try {
    // Kiểm tra kết nối database khi khởi động server
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');
  } catch (error) {
    console.error('Không thể kết nối đến database:', error);
  }
});