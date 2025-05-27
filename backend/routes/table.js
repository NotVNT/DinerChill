const express = require('express');
const router = express.Router();
const { Table, Restaurant, Reservation } = require('../models');
const { Op } = require('sequelize');

// Get all tables
router.get('/', async (req, res) => {
  try {
    const { restaurantId, date, time } = req.query;
    
    // If no restaurantId is provided, return all tables
    if (!restaurantId) {
      const tables = await Table.findAll({
        include: [
          {
            model: Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name']
          }
        ]
      });
      return res.json(tables);
    }
    
    // If date and time are provided, check which tables are available
    if (date && time) {
      // First, get all tables for the restaurant
      const allTables = await Table.findAll({
        where: { 
          restaurantId,
          isActive: true
        },
        include: [
          {
            model: Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name']
          }
        ]
      });
      
      // Then, find reservations for this date and time
      const reservedTableIds = await Reservation.findAll({
        attributes: ['tableId'],
        where: {
          restaurantId,
          date,
          time,
          status: {
            [Op.notIn]: ['cancelled', 'rejected']
          }
        }
      }).then(reservations => reservations.map(res => res.tableId));
      
      // Mark tables as available or not
      const tablesWithAvailability = allTables.map(table => {
        const tableData = table.toJSON();
        if (reservedTableIds.includes(table.id)) {
          tableData.status = 'reserved';
        }
        return tableData;
      });
      
      return res.json(tablesWithAvailability);
    }
    
    // If only restaurantId is provided, return all tables for that restaurant
    const tables = await Table.findAll({
      where: { restaurantId },
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
    console.error('Error fetching tables:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get table by ID
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id, {
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 