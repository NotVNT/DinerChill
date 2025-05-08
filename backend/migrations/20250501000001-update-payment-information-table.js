'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add paymentDetails JSON column
    await queryInterface.addColumn('payment_information', 'paymentDetails', {
      type: Sequelize.JSON,
      allowNull: true
    });

    // Remove specific payment related columns that have been replaced by paymentDetails
    await queryInterface.removeColumn('payment_information', 'cardLastFourDigits');
    await queryInterface.removeColumn('payment_information', 'bankName');
    await queryInterface.removeColumn('payment_information', 'accountName');

    // Add index for paymentDate field
    await queryInterface.addIndex('payment_information', ['paymentDate']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove paymentDetails column
    await queryInterface.removeColumn('payment_information', 'paymentDetails');

    // Add back the specific payment related columns
    await queryInterface.addColumn('payment_information', 'cardLastFourDigits', {
      type: Sequelize.STRING(4),
      allowNull: true
    });

    await queryInterface.addColumn('payment_information', 'bankName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('payment_information', 'accountName', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Remove the added index
    await queryInterface.removeIndex('payment_information', ['paymentDate']);
  }
}; 