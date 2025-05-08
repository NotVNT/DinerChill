'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_information', 'transactionId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'paymentDetails'
    });

    // Add index for faster lookups by transactionId
    await queryInterface.addIndex('payment_information', ['transactionId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('payment_information', ['transactionId']);
    await queryInterface.removeColumn('payment_information', 'transactionId');
  }
}; 