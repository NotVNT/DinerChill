const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ tạm thời trước khi gửi lên cloud
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
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
    fileSize: 5 * 1024 * 1024 // Giới hạn kích thước 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;