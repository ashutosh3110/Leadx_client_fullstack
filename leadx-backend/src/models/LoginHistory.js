import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

const LoginHistory = sequelize.define('LoginHistory', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  os: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loginTime: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'login_history',
  timestamps: true
})

export { LoginHistory }
