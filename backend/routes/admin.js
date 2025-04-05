const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');
const authenticateAdmin = require('../middleware/authenticate').authenticateAdmin;

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

// Thêm nhà hàng mới
router.post('/restaurants', authenticateAdmin, async (req, res) => {
  try {
    console.log('Nhận được request tạo nhà hàng mới:', req.body);
    
    const {
      name,
      cuisine,
      address,
      image,
      description,
      openingTime,
      closingTime,
      phone,
      email,
      priceRange,
      capacity
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !cuisine) {
      return res.status(400).json({ message: 'Tên và loại ẩm thực là bắt buộc' });
    }

    console.log('Dữ liệu đã xử lý:', {
      name, cuisineType: cuisine, 
      address, imageUrl: image, 
      openingTime, closingTime, phone, email, priceRange, capacity
    });

    // Tạo nhà hàng mới
    const newRestaurant = await Restaurant.create({
      name,
      cuisineType: cuisine,
      address,
      imageUrl: image,
      description,
      openingTime: openingTime || '10:00',
      closingTime: closingTime || '22:00',
      phone,
      email: email || `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
      priceRange: priceRange || '200.000đ - 500.000đ',
      capacity
    });

    console.log('Đã tạo nhà hàng mới thành công:', newRestaurant.id);
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error('Chi tiết lỗi khi tạo nhà hàng:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo nhà hàng mới', error: err.message });
  }
});

// Cập nhật nhà hàng
router.put('/restaurants/:id', authenticateAdmin, async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const {
      name,
      cuisine,
      address,
      image,
      description,
      openingTime,
      closingTime,
      phone,
      capacity
    } = req.body;

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
    }

    // Cập nhật nhà hàng
    await restaurant.update({
      name: name || restaurant.name,
      cuisineType: cuisine || restaurant.cuisineType,
      address: address || restaurant.address,
      imageUrl: image || restaurant.imageUrl,
      description: description || restaurant.description,
      openingTime: openingTime || restaurant.openingTime,
      closingTime: closingTime || restaurant.closingTime,
      phone: phone || restaurant.phone,
      capacity: capacity !== undefined ? capacity : restaurant.capacity
    });

    // Lấy dữ liệu đã cập nhật
    const updatedRestaurant = await Restaurant.findByPk(restaurantId);
    res.json(updatedRestaurant);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật nhà hàng' });
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
    
    await restaurant.destroy();
    res.json({ message: 'Đã xóa nhà hàng thành công' });
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa nhà hàng' });
  }
});

module.exports = router; 