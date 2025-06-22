const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Upload configuration
const uploadConfig = {
  imagePath: process.env.IMAGE_UPLOAD_PATH || 'uploads/images',
  maxSize: 5 * 1024 * 1024 // 5MB
};

// Cấu hình lưu trữ tạm thời trước khi gửi lên cloud
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, `./${uploadConfig.imagePath}/`);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Lọc tệp chỉ chấp nhận hình ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận tệp hình ảnh!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: uploadConfig.maxSize
  },
  fileFilter: fileFilter
});

module.exports = { upload, uploadConfig };