const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Restaurant (nhiều-nhiều)
      Category.belongsToMany(models.Restaurant, {
        through: 'restaurant_categories',
        foreignKey: 'categoryId',
        otherKey: 'restaurantId',
        as: 'restaurants'
      });
    }
  }
  
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories'
  });
  
  return Category;
}; 