const express = require('express');
const router = express.Router();
const { Restaurant, RestaurantImage } = require('../models');
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
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

// Get all restaurants with include images
router.get('/restaurants', authenticateAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [{ model: RestaurantImage, as: 'images' }]
    });
    res.json(restaurants);
  } catch (error) {
    console.error('Error getting restaurants:', error);
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
      capacity: capacity ? parseInt(capacity) : null
    });

    // Upload hình ảnh lên Cloudinary nếu có
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleToCloudinary(req.files);
        
        // Lưu thông tin hình ảnh vào database
        const imagePromises = uploadResults.map(result => {
          return RestaurantImage.create({
            restaurant_id: newRestaurant.id,
            image_url: result.url
          });
        });
        
        await Promise.all(imagePromises);
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        // Xóa các file tạm nếu có lỗi
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        // Note: We continue with restaurant creation even if image upload fails
      }
    }

    // Fetch restaurant with images
    const restaurantWithImages = await Restaurant.findByPk(newRestaurant.id, {
      include: [{ model: RestaurantImage, as: 'images' }]
    });

    console.log('Restaurant created:', newRestaurant.id);
    res.status(201).json(restaurantWithImages);
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
      priceRange, capacity, deleteImageIds 
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

    // Xóa hình ảnh đã chọn nếu có
    if (deleteImageIds && deleteImageIds.length > 0) {
      try {
        let idsToDelete = [];
        
        if (typeof deleteImageIds === 'string') {
          idsToDelete = deleteImageIds.split(',').map(id => parseInt(id.trim()));
        } else if (Array.isArray(deleteImageIds)) {
          idsToDelete = deleteImageIds.map(id => parseInt(id));
        }
        
        if (idsToDelete.length > 0) {
          await RestaurantImage.destroy({
            where: {
              id: idsToDelete,
              restaurant_id: id
            }
          });
        }
      } catch (deleteError) {
        console.error('Error deleting images:', deleteError);
      }
    }

    // Upload hình ảnh mới lên Cloudinary nếu có
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await uploadMultipleToCloudinary(req.files);
        
        // Lưu thông tin hình ảnh vào database
        const imagePromises = uploadResults.map(result => {
          return RestaurantImage.create({
            restaurant_id: id,
            image_url: result.url
          });
        });
        
        await Promise.all(imagePromises);
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        // Xóa các file tạm nếu có lỗi
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
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
      capacity: capacity ? parseInt(capacity) : restaurant.capacity
    });

    // Lấy dữ liệu nhà hàng đã cập nhật, kèm theo images
    const updatedRestaurant = await Restaurant.findByPk(id, {
      include: [{ model: RestaurantImage, as: 'images' }]
    });
    
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
    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [{ model: RestaurantImage, as: 'images' }]
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }
    
    // Restaurant will be deleted along with its images due to CASCADE constraint
    await restaurant.destroy();
    res.json({ message: 'Đã xóa nhà hàng thành công' });
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa nhà hàng' });
  }
});

module.exports = router; 