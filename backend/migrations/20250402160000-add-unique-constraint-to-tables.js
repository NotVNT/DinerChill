'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm ràng buộc unique cho cặp (restaurantId, tableNumber)
    await queryInterface.addConstraint('tables', {
      fields: ['restaurantId', 'tableNumber'],
      type: 'unique',
      name: 'unique_table_number_per_restaurant'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa ràng buộc khi rollback
    await queryInterface.removeConstraint('tables', 'unique_table_number_per_restaurant');
  }
}; 