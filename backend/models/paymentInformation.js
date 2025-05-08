const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentInformation extends Model {
    static associate(models) {
      // Định nghĩa quan hệ với bảng Reservation
      PaymentInformation.belongsTo(models.Reservation, {
        foreignKey: 'reservationId',
        as: 'reservation'
      });
      
      // Định nghĩa quan hệ với bảng User
      PaymentInformation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  PaymentInformation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reservations',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    paymentMethod: {
      type: DataTypes.ENUM('credit_card', 'bank_transfer', 'cash', 'e_wallet'),
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'VND'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentDetails: {
      type: DataTypes.JSON,
      allowNull: true // Lưu thông tin bổ sung (ví dụ: {"cardLastFourDigits": "1234"})
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,  // Lưu mã đơn hàng từ PayOS
      unique: true     // Đảm bảo không có giao dịch trùng lặp
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PaymentInformation',
    tableName: 'payment_information',
    timestamps: true, // Bật createdAt và updatedAt
    indexes: [
      { fields: ['reservationId'] },
      { fields: ['userId'] },
      { fields: ['paymentDate'] },
      { fields: ['status'] },
      { fields: ['transactionId'] }
    ]
  });

  return PaymentInformation;
};