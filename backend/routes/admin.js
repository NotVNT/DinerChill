const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');
const authenticateAdmin = require('../middleware/authenticate').authenticateAdmin;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Setup temporary storage for file uploads
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create upload middleware
const upload = multer({ 
  storage: tempStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Function to upload a single file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'dinerchill/restaurants'
    });
    
    // Delete temporary file after upload
    fs.unlinkSync(file.path);
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Error uploading image to cloud');
  }
};

// Function to upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Error uploading multiple images to cloud');
  }
};

// Lấy danh sách nhà hàng
router.get('/restaurants', authenticateAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách nhà hàng' });
  }
});

// Thêm nhà hàng mới với upload nhiều hình ảnh
router.post('/restaurants', authenticateAdmin, upload.array('restaurantImages', 10), async (req, res) => {
  try {
    // In ra thông tin debug
    console.log('Request Body:', req.body);
    console.log('Files received:', req.files ? req.files.length : 'No files');

    // Lấy dữ liệu từ request body
    const { 
      name, cuisineType, address, description, 
      openingTime, closingTime, phone, email, 
      priceRange, capacity 
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Tên nhà hàng là bắt buộc' });
    }

    let cloudImages = [];

    // Upload hình ảnh lên Cloudinary nếu có
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleToCloudinary(req.files);
        cloudImages = uploadResults.map(result => result.url);
        console.log('Uploaded images:', cloudImages);
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        // Xóa các file tạm nếu có lỗi
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(500).json({ message: 'Error uploading images' });
      }
    }

    // Tạo nhà hàng mới trong database
    const newRestaurant = await Restaurant.create({
      name,
      cuisineType: cuisineType || 'Chưa phân loại',
      address: address || 'Chưa cập nhật',
      description: description || '',
      openingTime: openingTime || '10:00',
      closingTime: closingTime || '22:00',
      phone: phone || '',
      email: email || `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      priceRange: priceRange || '200.000đ - 500.000đ',
      capacity: capacity ? parseInt(capacity) : null,
      cloudImages
    });

    console.log('Restaurant created:', newRestaurant.id);
    res.status(201).json(newRestaurant);
  } catch (error) {
    console.error('Lỗi khi tạo nhà hàng:', error);
    // Xóa các file tạm nếu có lỗi
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo nhà hàng: ' + error.message });
  }
});

// Cập nhật nhà hàng với upload nhiều hình ảnh
router.put('/restaurants/:id', authenticateAdmin, upload.array('restaurantImages', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, cuisineType, address, description, 
      openingTime, closingTime, phone, email, 
      priceRange, capacity, existingCloudImages 
    } = req.body;

    // Tìm nhà hàng theo id
    const restaurant = await Restaurant.findByPk(id);
    
    if (!restaurant) {
      // Xóa file tạm nếu không tìm thấy nhà hàng
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Xử lý hình ảnh đã tồn tại
    let cloudImages = [];
    if (existingCloudImages) {
      try {
        cloudImages = JSON.parse(existingCloudImages);
      } catch (e) {
        console.error('Error parsing existingCloudImages:', e);
        cloudImages = [];
      }
    } else if (restaurant.cloudImages) {
      cloudImages = restaurant.cloudImages;
    }

    // Upload hình ảnh mới lên Cloudinary nếu có
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleToCloudinary(req.files);
        const newImageUrls = uploadResults.map(result => result.url);
        cloudImages = [...cloudImages, ...newImageUrls];
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        // Xóa các file tạm nếu có lỗi
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(500).json({ message: 'Error uploading images' });
      }
    }

    // Cập nhật thông tin nhà hàng
    await restaurant.update({
      name: name || restaurant.name,
      cuisineType: cuisineType || restaurant.cuisineType,
      address: address || restaurant.address,
      description: description !== undefined ? description : restaurant.description,
      openingTime: openingTime || restaurant.openingTime,
      closingTime: closingTime || restaurant.closingTime,
      phone: phone || restaurant.phone,
      email: email || restaurant.email,
      priceRange: priceRange || restaurant.priceRange,
      capacity: capacity ? parseInt(capacity) : restaurant.capacity,
      cloudImages
    });

    // Lấy dữ liệu nhà hàng đã cập nhật
    const updatedRestaurant = await Restaurant.findByPk(id);
    
    res.json(updatedRestaurant);
  } catch (error) {
    console.error('Lỗi khi cập nhật nhà hàng:', error);
    // Xóa các file tạm nếu có lỗi
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhà hàng: ' + error.message });
  }
});

// Xóa nhà hàng
router.delete('/restaurants/:id', authenticateAdmin, async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await Restaurant.findByPk(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }
    
    // Xóa hình ảnh từ Cloudinary nếu có
    if (restaurant.cloudImages && restaurant.cloudImages.length > 0) {
      try {
        // Chỉ log ra, không làm gián đoạn quá trình xóa nhà hàng
        console.log('Would delete Cloudinary images for restaurant:', restaurantId);
      } catch (cloudError) {
        console.error('Error deleting images from Cloudinary:', cloudError);
      }
    }

    await restaurant.destroy();
    res.json({ message: 'Đã xóa nhà hàng thành công' });
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa nhà hàng' });
  }
});

module.exports = router; 