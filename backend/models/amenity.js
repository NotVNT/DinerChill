const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Amenity extends Model {
    static associate(models) {
      // Define relationship with Restaurant model (many-to-many)
      Amenity.belongsToMany(models.Restaurant, {
        through: "restaurant_amenities",
        foreignKey: "amenityId",
        otherKey: "restaurantId",
        as: "restaurants",
      });
    }
  }

  Amenity.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Amenity",
      tableName: "amenities",
    }
  );

  return Amenity;
};
