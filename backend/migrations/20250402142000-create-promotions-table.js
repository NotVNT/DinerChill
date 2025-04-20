'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('promotions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      discountType: {
        type: Sequelize.ENUM('percent', 'fixed', 'freebies'),
        allowNull: false,
        defaultValue: 'percent'
      },
      discountValue: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      usageLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Số lần tối đa mã có thể được sử dụng'
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Số lần mã đã được sử dụng'
      },
      minOrderValue: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Giá trị đơn hàng tối thiểu để áp dụng khuyến mãi'
      },
      maxDiscountValue: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Giá trị giảm giá tối đa'
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Hình ảnh cho khuyến mãi'
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
    await queryInterface.addIndex('promotions', ['code']);
    await queryInterface.addIndex('promotions', ['startDate', 'endDate']);
    await queryInterface.addIndex('promotions', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('promotions');
  }
}; 