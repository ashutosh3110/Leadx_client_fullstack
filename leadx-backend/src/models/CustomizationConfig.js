import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

const CustomizationConfig = sequelize.define('CustomizationConfig', {
  configId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetWebUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  webUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  webName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  policyUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  termsUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chatRuleUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tilesAndButtonColor: {
    type: DataTypes.STRING,
    defaultValue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  textColor: {
    type: DataTypes.STRING,
    defaultValue: "#ffffff"
  },
  borderColor: {
    type: DataTypes.STRING,
    defaultValue: "#e5e7eb"
  },
  borderSize: {
    type: DataTypes.STRING,
    defaultValue: "3"
  },
  questions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  selectedAmbassadorIds: {
    type: DataTypes.JSON,
    allowNull: true
  },
  scriptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  soldAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ambassadorCardBackgroundColor: {
    type: DataTypes.STRING,
    defaultValue: "#3b82f6"
  },
  ambassadorCardBorderColor: {
    type: DataTypes.STRING,
    defaultValue: "#e5e7eb"
  },
  chatBackgroundColor: {
    type: DataTypes.STRING,
    defaultValue: "#3b82f6"
  },
  chatTextColor: {
    type: DataTypes.STRING,
    defaultValue: "#ffffff"
  }
}, {
  tableName: 'customization_configs',
  timestamps: true
})

export { CustomizationConfig }
