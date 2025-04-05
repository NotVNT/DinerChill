const express = require('express');
const router = express.Router();
const { models } = require('../models');
const { upload } = require('../utils/cloudinary');
const authMiddleware = require('../middleware/auth');
const { cloudinary, uploadImage } = require('../utils/cloudinary');
const fs = require('fs');
const multer = require('multer');

// Setup temporary storage for file uploads
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

// Create temporary upload middleware for handling multipart form data
const tempUpload = multer({ 
  storage: tempStorage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

// Make sure upload directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await models.Restaurant.findAll();
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Failed to fetch restaurants', error: error.message });
  }
});

// Get a specific restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await models.Restaurant.findByPk(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant', error: error.message });
  }
});

// Create a new restaurant with image upload
router.post('/', authMiddleware, tempUpload.single('image'), async (req, res) => {
  try {
    const { name, cuisine_type, address, description } = req.body;
    
    // Validate required fields
    if (!name || !cuisine_type || !address) {
      return res.status(400).json({ message: 'Name, cuisine type, and address are required fields' });
    }

    let imageData = null;
    
    // Handle image upload to Cloudinary if file was provided
    if (req.file) {
      try {
        imageData = await uploadImage(req.file);
        // Delete temporary file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        // Clean up temp file if upload fails
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Failed to upload image', error: uploadError.message });
      }
    }

    // Create the restaurant with image URL if available
    const restaurant = await models.Restaurant.create({
      name,
      cuisine_type,
      address,
      description,
      image_url: imageData ? imageData.url : null,
      image_public_id: imageData ? imageData.public_id : null,
      owner_id: req.user.id // If using authentication
    });

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    // Clean up temp file if any error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to create restaurant', error: error.message });
  }
});

// Update restaurant
router.put('/:id', authMiddleware, tempUpload.single('image'), async (req, res) => {
  try {
    const { name, cuisine_type, address, description } = req.body;
    const restaurant = await models.Restaurant.findByPk(req.params.id);
    
    if (!restaurant) {
      // Clean up temp file if restaurant not found
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Handle image update if provided
    if (req.file) {
      try {
        // Delete previous image from Cloudinary if exists
        if (restaurant.image_public_id) {
          await cloudinary.uploader.destroy(restaurant.image_public_id);
        }
        
        // Upload new image
        const imageData = await uploadImage(req.file);
        
        // Update image fields
        restaurant.image_url = imageData.url;
        restaurant.image_public_id = imageData.public_id;
        
        // Delete temporary file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Failed to update image:', uploadError);
        // Clean up temp file if upload fails
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Failed to update image', error: uploadError.message });
      }
    }

    // Update other fields
    if (name) restaurant.name = name;
    if (cuisine_type) restaurant.cuisine_type = cuisine_type;
    if (address) restaurant.address = address;
    if (description !== undefined) restaurant.description = description;

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    // Clean up temp file if any error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to update restaurant', error: error.message });
  }
});

// Delete restaurant
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const restaurant = await models.Restaurant.findByPk(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Delete image from Cloudinary if exists
    if (restaurant.image_public_id) {
      await cloudinary.uploader.destroy(restaurant.image_public_id);
    }

    await restaurant.destroy();
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Failed to delete restaurant', error: error.message });
  }
});

module.exports = router;