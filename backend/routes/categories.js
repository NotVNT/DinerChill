const express = require('express');
const router = express.Router();
const { Category, Restaurant } = require('../models');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all restaurants for a specific category
router.get('/:id/restaurants', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: {
        model: Restaurant,
        as: 'restaurants',
        through: { attributes: [] } // Don't include junction table attributes
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category.restaurants);
  } catch (error) {
    console.error('Error fetching restaurants by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all restaurants by category name
router.get('/name/:name/restaurants', async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { name: req.params.name },
      include: {
        model: Restaurant,
        as: 'restaurants',
        through: { attributes: [] } // Don't include junction table attributes
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category.restaurants);
  } catch (error) {
    console.error('Error fetching restaurants by category name:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
