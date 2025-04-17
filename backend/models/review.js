const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng User
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Định nghĩa quan hệ với bảng Restaurant
      Review.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
    }
  }
  
  Review.init({
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    photos: {
      type: DataTypes.TEXT, // JSON array of URLs stored as text
      allowNull: true,
      get() {
        const value = this.getDataValue('photos');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('photos', JSON.stringify(value || []));
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews'
  });
  
  return Review;
}; 