'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, add the new role column
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'restaurant_owner', 'user'),
      allowNull: true
    });

    // Update existing records - set admin role for users with isAdmin=true
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET role = CASE 
        WHEN "isAdmin" = true THEN 'admin' 
        ELSE 'user' 
      END
    `);

    // Now make the role column not nullable with a default value
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'restaurant_owner', 'user'),
      allowNull: false,
      defaultValue: 'user'
    });

    // Finally, remove the isAdmin column
    await queryInterface.removeColumn('users', 'isAdmin');
  },

  async down(queryInterface, Sequelize) {
    // First, add back the isAdmin column
    await queryInterface.addColumn('users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    // Migrate data back - set isAdmin=true for users with admin role
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET "isAdmin" = (role = 'admin')
    `);

    // Remove the role column
    await queryInterface.removeColumn('users', 'role');

    // Remove the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
}; 