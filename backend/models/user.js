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

      // Định nghĩa quan hệ với bảng UserRole
      User.belongsTo(models.UserRole, {
        foreignKey: 'roleId',
        as: 'role'
      });
    }

    // Method để kiểm tra mật khẩu
    async validatePassword(password) {
      // Nếu tài khoản Google (không có password), trả về false
      if (!this.password) {
        return false;
      }
      return await bcrypt.compare(password, this.password);
    }

    // Helper methods to check user role
    async isAdmin() {
      const userRole = await this.getRole();
      return userRole?.name === 'admin';
    }

    async isRestaurantOwner() {
      const userRole = await this.getRole();
      return userRole?.name === 'restaurant_owner';
    }

    async isRegularUser() {
      const userRole = await this.getRole();
      return userRole?.name === 'user';
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
      allowNull: true, // Allow null for Zalo users
      unique: true,
      validate: {
        isEmail: function() {
          // Only validate email format if email is provided
          if (this.email !== null) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
              throw new Error('Email format is invalid');
            }
          }
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Cho phép null cho tài khoản Google
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_roles',
        key: 'id'
      }
    },
    isVerified: {
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
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zaloId: {
      type: DataTypes.STRING,
      allowNull: true
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
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  
  return User;
};