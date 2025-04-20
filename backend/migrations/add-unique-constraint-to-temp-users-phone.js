'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thêm ràng buộc unique vào trường phone của bảng temp_users
    await queryInterface.addConstraint('temp_users', {
      fields: ['phone'],
      type: 'unique',
      name: 'temp_users_phone_unique_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa ràng buộc khi rollback
    await queryInterface.removeConstraint('temp_users', 'temp_users_phone_unique_constraint');
  }
}; 