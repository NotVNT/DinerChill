'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tables', 'location');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tables', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Vị trí bàn trong nhà hàng (ví dụ: trong nhà, ngoài trời, tầng 2)'
    });
  }
}; 