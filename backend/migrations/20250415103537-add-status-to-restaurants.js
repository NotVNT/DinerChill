'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add status column to restaurants table
    await queryInterface.addColumn('restaurants', 'status', {
      type: Sequelize.ENUM('active', 'maintenance'),
      allowNull: false,
      defaultValue: 'active',
      after: 'capacity'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove status column
    await queryInterface.removeColumn('restaurants', 'status');
    // Remove the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_restaurants_status";');
  }
};
