import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  email: { type: DataTypes.STRING, allowNull: false },
  course: { type: DataTypes.STRING, allowNull: false },
  exam: { type: DataTypes.STRING, allowNull: false },
  rank: { type: DataTypes.INTEGER, allowNull: false },
  region: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },

  amount: { type: DataTypes.DECIMAL(10,2), allowNull: true },

  paid_at: { type: DataTypes.DATE }
}, {
  tableName: "course_payment_details",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

export default Payment;