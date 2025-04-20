'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'restaurants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tableNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('available', 'reserved', 'occupied', 'unavailable'),
        defaultValue: 'available'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Vị trí bàn trong nhà hàng (ví dụ: trong nhà, ngoài trời, tầng 2)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('tables', ['restaurantId']);
    await queryInterface.addIndex('tables', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tables');
  }
}; 