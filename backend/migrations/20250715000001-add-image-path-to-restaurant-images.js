'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column already exists
    const tableDescription = await queryInterface.describeTable('restaurant_images');
    if (!tableDescription.image_path) {
      // Add image_path column if it doesn't exist
      await queryInterface.addColumn('restaurant_images', 'image_path', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
      console.log('Added image_path column to restaurant_images table');
    } else {
      console.log('image_path column already exists in restaurant_images table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column if needed
    try {
      await queryInterface.removeColumn('restaurant_images', 'image_path');
    } catch (error) {
      console.log('Error removing image_path column:', error);
    }
  }
}; 