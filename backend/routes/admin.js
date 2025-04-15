const express = require('express');
const router = express.Router();
const { Restaurant, RestaurantImage, Category, Reservation, User, Table } = require('../models');
const authenticateAdmin = require('../middleware/authenticate').authenticateAdmin;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

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
    const { 
      name, cuisineType, address, description, 
      openingTime, closingTime, phone, email, 
      priceRange, capacity 
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Tên nhà hàng là bắt buộc' });
    }

    // Tạo nhà hàng mới trong database với giá trị mặc định "Chưa cập nhật"
    const newRestaurant = await Restaurant.create({
      name,
      cuisineType: cuisineType || 'Chưa phân loại',
      address: address || 'Chưa cập nhật',
      description: description || 'Chưa cập nhật',
      openingTime: openingTime || '1:00',
      closingTime: closingTime || '23:00',
      phone: phone || '',
      email: email || '',
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

// Categories Management Routes
// Get all categories
router.get('/categories', authenticateAdmin, async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách danh mục' });
  }
});

// Create a new category
router.post('/categories', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    }

    let imageUrl = null;
    
    // If image file is uploaded, process it
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Clean up any temp file
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Không thể tải lên hình ảnh' });
      }
    } else if (req.body.imageUrl) {
      // If imageUrl is provided in the body
      imageUrl = req.body.imageUrl;
    }

    // Create new category
    const newCategory = await Category.create({
      name,
      description: description || '',
      imageUrl
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    // Clean up any temp file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Không thể tạo danh mục mới' });
  }
});

// Update a category
router.put('/categories/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    
    // Find the category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      // Clean up any temp file
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    let imageUrl = category.imageUrl;
    
    // If image file is uploaded, process it
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Clean up any temp file
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Không thể tải lên hình ảnh' });
      }
    } else if (req.body.imageUrl) {
      // If imageUrl is provided in the body
      imageUrl = req.body.imageUrl;
    }

    // Update the category
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      imageUrl
    });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    // Clean up any temp file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Không thể cập nhật danh mục' });
  }
});

// Delete a category
router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Find the category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Delete the category
    await category.destroy();
    
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Không thể xóa danh mục' });
  }
});

// Get all reservations with included User data
router.get('/reservations', authenticateAdmin, async (req, res) => {
  try {
    console.log('Admin API: Getting reservations with associations');
    const reservations = await Reservation.findAll({
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Restaurant, attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC'], ['time', 'ASC']]
    });
    console.log(`Admin API: Found ${reservations.length} reservations`);
    res.json(reservations);
  } catch (error) {
    console.error('Admin API: Error getting reservations:', error);
    console.error('Admin API: Error details:', error.message);
    console.error('Admin API: Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Đã xảy ra lỗi khi lấy danh sách đặt bàn',
      error: error.message 
    });
  }
});

// Tables Management Routes
router.get('/tables', authenticateAdmin, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    // Thêm điều kiện where để lọc theo restaurantId
    const whereCondition = restaurantId ? { restaurantId } : {};
    
    const tables = await Table.findAll({
      where: whereCondition,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(tables);
  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách bàn' });
  }
});

// Tạo bàn mới
router.post('/tables', authenticateAdmin, async (req, res) => {
  try {
    // Kiểm tra xem số bàn đã tồn tại trong nhà hàng chưa
    const existingTable = await Table.findOne({
      where: {
        restaurantId: req.body.restaurantId,
        tableNumber: req.body.tableNumber
      }
    });

    if (existingTable) {
      return res.status(400).json({
        message: 'Số bàn này đã tồn tại trong nhà hàng'
      });
    }

    // Nếu không trùng, tạo bàn mới
    const tableData = {
      ...req.body,
      tableCode: generateTableCode()
    };

    const table = await Table.create(tableData);
    const tableWithRestaurant = await Table.findByPk(table.id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });
    res.status(201).json(tableWithRestaurant);
  } catch (error) {
    console.error('Error creating table:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Số bàn này đã tồn tại trong nhà hàng'
      });
    }
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo bàn mới' });
  }
});

// Cập nhật bàn
router.put('/tables/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByPk(id);
    
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' });
    }

    // Kiểm tra xem số bàn mới có trùng với bàn khác trong cùng nhà hàng không
    if (req.body.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({
        where: {
          restaurantId: req.body.restaurantId || table.restaurantId,
          tableNumber: req.body.tableNumber,
          id: { [Op.ne]: id } // Loại trừ bàn hiện tại
        }
      });

      if (existingTable) {
        return res.status(400).json({
          message: 'Số bàn này đã tồn tại trong nhà hàng'
        });
      }
    }
    
    await table.update(req.body);
    
    const updatedTable = await Table.findByPk(id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Số bàn này đã tồn tại trong nhà hàng'
      });
    }
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật bàn' });
  }
});

router.delete('/tables/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const table = await Table.findByPk(id);
    
    if (!table) {
      return res.status(404).json({ message: 'Không tìm thấy bàn' });
    }
    
    await table.destroy();
    res.json({ message: 'Đã xóa bàn thành công' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa bàn' });
  }
});

const generateTableCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = router; 