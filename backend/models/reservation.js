const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng User
      Reservation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Định nghĩa quan hệ với bảng Restaurant
      Reservation.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      
      // Định nghĩa quan hệ với bảng Table
      Reservation.belongsTo(models.Table, {
        foreignKey: 'tableId',
        as: 'table'
      });
      
      // Định nghĩa quan hệ với bảng PaymentInformation
      Reservation.hasMany(models.PaymentInformation, {
        foreignKey: 'reservationId',
        as: 'paymentInformation'
      });
    }
  }
  
  Reservation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tables',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations'
  });
  
  return Reservation;
}; 