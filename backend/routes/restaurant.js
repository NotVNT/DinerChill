const express = require('express');
const router = express.Router();
const { models } = require('../models');
const authMiddleware = require('../middleware/auth');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Helper function to normalize path for web URLs
function normalizeFilePath(filePath) {
  // Convert Windows backslashes to forward slashes for web URLs
  return filePath.replace(/\\/g, '/');
}

// Setup storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname;
    cb(null, uniqueFilename);
  }
});

// Create upload middleware for handling multipart form data
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await models.Restaurant.findAll({
      include: [
        {
          model: models.RestaurantImage, 
          as: 'images',
        }
      ]
    });
    
    // Normalize paths for web URLs
    for (const restaurant of restaurants) {
      if (restaurant.images && restaurant.images.length > 0) {
        for (const image of restaurant.images) {
          if (image.image_path) {
            image.image_path = normalizeFilePath(image.image_path);
          }
        }
      }
    }
    
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Failed to fetch restaurants', error: error.message });
  }
});

// Get a specific restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await models.Restaurant.findByPk(req.params.id, {
      include: [
        {
          model: models.RestaurantImage, 
          as: 'images',
        }
      ]
    });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Normalize paths for web URLs
    if (restaurant.images && restaurant.images.length > 0) {
      for (const image of restaurant.images) {
        if (image.image_path) {
          image.image_path = normalizeFilePath(image.image_path);
        }
      }
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ message: 'Failed to fetch restaurant', error: error.message });
  }
});

// Create a new restaurant with image upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, cuisine_type, address, description } = req.body;
    
    // Validate required fields
    if (!name || !cuisine_type || !address) {
      return res.status(400).json({ message: 'Name, cuisine type, and address are required fields' });
    }

    // Create the restaurant
    const restaurant = await models.Restaurant.create({
      name,
      cuisine_type,
      address,
      description,
      owner_id: req.user.id
    });

    // Save image to database if file was provided
    if (req.file) {
      try {
        const imagePath = normalizeFilePath(req.file.path);
        // Store image information in restaurant_image table
        await models.RestaurantImage.create({
          restaurant_id: restaurant.id,
          image_path: imagePath
        });
      } catch (imageError) {
        console.error('Failed to save image information:', imageError);
        return res.status(500).json({ message: 'Failed to save image information', error: imageError.message });
      }
    }

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: 'Failed to create restaurant', error: error.message });
  }
});

// Update restaurant
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, cuisine_type, address, description } = req.body;
    const restaurant = await models.Restaurant.findByPk(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Handle image update if provided
    if (req.file) {
      try {
        // Find existing restaurant image
        const existingImage = await models.RestaurantImage.findOne({
          where: { restaurant_id: restaurant.id }
        });

        // If there's an existing image, delete the file and update the record
        if (existingImage) {
          // Delete the old file if it exists
          if (fs.existsSync(existingImage.image_path)) {
            fs.unlinkSync(existingImage.image_path);
          }
          
          // Update the existing image record
          await existingImage.update({
            image_path: normalizeFilePath(req.file.path)
          });
        } else {
          // Create a new image record
          await models.RestaurantImage.create({
            restaurant_id: restaurant.id,
            image_path: normalizeFilePath(req.file.path)
          });
        }
      } catch (imageError) {
        console.error('Failed to update image:', imageError);
        return res.status(500).json({ message: 'Failed to update image', error: imageError.message });
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

    // Find and delete associated image
    const image = await models.RestaurantImage.findOne({
      where: { restaurant_id: restaurant.id }
    });

    if (image) {
      // Delete the physical file
      if (fs.existsSync(image.image_path)) {
        fs.unlinkSync(image.image_path);
      }
      
      // Delete the database record
      await image.destroy();
    }

    // Delete the restaurant
    await restaurant.destroy();
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Failed to delete restaurant', error: error.message });
  }
});

module.exports = router;