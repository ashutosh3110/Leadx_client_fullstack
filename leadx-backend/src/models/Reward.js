import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

const Reward = sequelize.define('Reward', {
  ambassadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('INR', 'USD'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('added', 'notAdded', 'paid', 'pending'),
    defaultValue: 'pending'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'rewards'
})

export default Reward
