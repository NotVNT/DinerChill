const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RestaurantImage extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Restaurant
      RestaurantImage.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant'
      });
    }
  }
  
  RestaurantImage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    restaurant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    modelName: 'RestaurantImage',
    tableName: 'restaurant_images'
  });
  
  return RestaurantImage;
};