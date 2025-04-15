const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Reservation
      Restaurant.hasMany(models.Reservation, {
        foreignKey: 'restaurantId',
        as: 'reservations'
      });
      
      // Định nghĩa quan hệ với bảng Review
      Restaurant.hasMany(models.Review, {
        foreignKey: 'restaurantId',
        as: 'reviews'
      });
      
      // Định nghĩa quan hệ với bảng MenuItem
      Restaurant.hasMany(models.MenuItem, {
        foreignKey: 'restaurantId',
        as: 'menuItems'
      });
      
      // Định nghĩa quan hệ với bảng Category (nhiều-nhiều)
      Restaurant.belongsToMany(models.Category, {
        through: 'RestaurantCategories',
        foreignKey: 'restaurantId',
        otherKey: 'categoryId',
        as: 'categories'
      });
      
      // Định nghĩa quan hệ với bảng Table
      Restaurant.hasMany(models.Table, {
        foreignKey: 'restaurantId',
        as: 'tables'
      });
      
      // Định nghĩa quan hệ với bảng Favorite
      Restaurant.hasMany(models.Favorite, {
        foreignKey: 'restaurantId',
        as: 'favorites'
      });
      
      // Định nghĩa quan hệ với bảng Promotion (nhiều-nhiều)
      Restaurant.belongsToMany(models.Promotion, {
        through: 'RestaurantPromotions',
        foreignKey: 'restaurantId',
        otherKey: 'promotionId',
        as: 'promotions'
      });
      
      // Định nghĩa quan hệ với bảng RestaurantImage
      Restaurant.hasMany(models.RestaurantImage, {
        foreignKey: 'restaurant_id',
        as: 'images'
      });
    }
  }
  
  Restaurant.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cuisineType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    openingTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    closingTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priceRange: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance'),
      allowNull: false,
      defaultValue: 'active'
    },
    closureReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants'
  });
  
  return Restaurant;
}; 