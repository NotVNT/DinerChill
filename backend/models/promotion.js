const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Restaurant
      Promotion.belongsToMany(models.Restaurant, {
        through: "restaurant_promotions",
        foreignKey: "promotionId",
        otherKey: "restaurantId",
        as: "restaurants",
      });
    }
  }

  Promotion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      discountType: {
        type: DataTypes.ENUM("percent", "fixed", "freebies"),
        allowNull: false,
        defaultValue: "percent",
      },
      discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Số lần tối đa mã có thể được sử dụng",
      },
      usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Số lần mã đã được sử dụng",
      },
      minOrderValue: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: "Giá trị đơn hàng tối thiểu để áp dụng khuyến mãi",
      },
      maxDiscountValue: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: "Giá trị giảm giá tối đa",
      },
    },
    {
      sequelize,
      modelName: "Promotion",
      tableName: "promotions",
    }
  );

  return Promotion;
};
