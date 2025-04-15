'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add closureReason column to restaurants table
    await queryInterface.addColumn('restaurants', 'closureReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'status'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove closureReason column
    await queryInterface.removeColumn('restaurants', 'closureReason');
  }
}; 