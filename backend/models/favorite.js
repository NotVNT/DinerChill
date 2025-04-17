const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng User
      Favorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Định nghĩa quan hệ với bảng Restaurant
      Favorite.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
    }
  }
  
  Favorite.init({
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Ghi chú của người dùng về nhà hàng yêu thích'
    }
  }, {
    sequelize,
    modelName: 'Favorite',
    tableName: 'favorites',
    // Tạo unique constraint để đảm bảo mỗi user chỉ có thể thêm 1 nhà hàng vào danh sách yêu thích 1 lần
    indexes: [
      {
        unique: true,
        fields: ['userId', 'restaurantId']
      }
    ]
  });
  
  return Favorite;
}; 