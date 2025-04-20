const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Restaurant
      Table.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      
      // Định nghĩa quan hệ với bảng Reservation (nếu cần)
      Table.hasMany(models.Reservation, {
        foreignKey: 'tableId',
        as: 'reservations'
      });
    }
  }
  
  Table.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    tableNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'occupied', 'unavailable'),
      defaultValue: 'available'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tableCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Table',
    tableName: 'tables',
    indexes: [
      {
        unique: true,
        fields: ['restaurantId', 'tableNumber'],
        name: 'unique_table_number_per_restaurant'
      }
    ]
  });
  
  return Table;
}; 