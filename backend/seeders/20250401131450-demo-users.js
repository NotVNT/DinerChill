'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword1 = await bcrypt.hash('vinhngoctran123', salt);
    const hashedPassword2 = await bcrypt.hash('admin123', salt);
    
    return queryInterface.bulkInsert('users', [
      {
        name: 'Vinh Ngoc Tran',
        email: 'vinhngoctran137@gmail.com',
        phone: '0987654321',
        password: hashedPassword1,
        isAdmin: false,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      },
      {
        name: 'Admin',
        email: 'admin@dinerchillvn.com',
        phone: '0909123456',
        password: hashedPassword2,
        isAdmin: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};