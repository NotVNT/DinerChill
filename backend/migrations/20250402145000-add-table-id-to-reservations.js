'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Kiểm tra xem cột tableId đã tồn tại chưa
    const tableExists = await queryInterface.describeTable('reservations');
    if (!tableExists.tableId) {
      await queryInterface.addColumn('reservations', 'tableId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tables',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });

      // Thêm index cho cột mới
      await queryInterface.addIndex('reservations', ['tableId']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('reservations', 'tableId');
  }
}; 