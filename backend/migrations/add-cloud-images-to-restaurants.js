'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('restaurants', 'cloudImages', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'imageUrl'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('restaurants', 'cloudImages');
  }
}; 