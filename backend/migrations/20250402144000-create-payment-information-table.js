'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_information', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reservationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'reservations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      paymentMethod: {
        type: Sequelize.ENUM('credit_card', 'bank_transfer', 'cash', 'e_wallet'),
        allowNull: false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'VND'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cardLastFourDigits: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accountName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Tạo index trên các trường thường được sử dụng để truy vấn
    await queryInterface.addIndex('payment_information', ['userId']);
    await queryInterface.addIndex('payment_information', ['reservationId']);
    await queryInterface.addIndex('payment_information', ['status']);
    await queryInterface.addIndex('payment_information', ['transactionId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payment_information');
  }
}; 