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
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'occupied', 'unavailable'),
      defaultValue: 'available'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Vị trí bàn trong nhà hàng (ví dụ: trong nhà, ngoài trời, tầng 2)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Table',
    tableName: 'tables'
  });
  
  return Table;
}; 