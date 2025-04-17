const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Function to upload a single file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    // Upload file lên Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'dinerchill/restaurants'
    });
    
    // Xóa file tạm sau khi upload
    fs.unlinkSync(file.path);
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Lỗi upload lên Cloudinary:', error);
    throw new Error('Lỗi upload ảnh lên cloud');
  }
};

// Function to upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Lỗi upload nhiều ảnh lên Cloudinary:', error);
    throw new Error('Lỗi upload nhiều ảnh lên cloud');
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary
};