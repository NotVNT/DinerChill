'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Thay đổi ràng buộc cho trường password, cho phép giá trị NULL
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Khôi phục ràng buộc NOT NULL
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
}; 