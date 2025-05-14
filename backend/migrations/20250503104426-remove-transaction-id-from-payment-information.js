'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('payment_information', 'transactionId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_information', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
