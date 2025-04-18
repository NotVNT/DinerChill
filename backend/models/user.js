const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Reservation
      User.hasMany(models.Reservation, {
        foreignKey: 'userId',
        as: 'reservations'
      });
      
      // Định nghĩa quan hệ với bảng Review
      User.hasMany(models.Review, {
        foreignKey: 'userId',
        as: 'reviews'
      });
      
      // Định nghĩa quan hệ với bảng Favorite
      User.hasMany(models.Favorite, {
        foreignKey: 'userId',
        as: 'favorites'
      });
      
      // Định nghĩa quan hệ với bảng PaymentInformation
      User.hasMany(models.PaymentInformation, {
        foreignKey: 'userId',
        as: 'paymentInformation'
      });
    }

    // Method để kiểm tra mật khẩu
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resetCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      // Hash mật khẩu trước khi lưu
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  
  return User;
};