'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('restaurant_promotions', {
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
      promotionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'promotions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Tạo index cho cặp khoá ngoại để tránh trùng lặp
    await queryInterface.addIndex('restaurant_promotions', ['restaurantId', 'promotionId'], {
      unique: true,
      name: 'restaurant_promotion_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('restaurant_promotions');
  }
}; 