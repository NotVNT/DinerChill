'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm ràng buộc unique vào trường phone
    await queryInterface.addConstraint('users', {
      fields: ['phone'],
      type: 'unique',
      name: 'users_phone_unique_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa ràng buộc khi rollback
    await queryInterface.removeConstraint('users', 'users_phone_unique_constraint');
  }
}; 