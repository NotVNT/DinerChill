'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove isTemporarilyClosed column from restaurants table
    await queryInterface.removeColumn('restaurants', 'isTemporarilyClosed');
  },

  async down (queryInterface, Sequelize) {
    // Add isTemporarilyClosed column back if needed to rollback
    await queryInterface.addColumn('restaurants', 'isTemporarilyClosed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};
