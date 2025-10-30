import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

const EmbedConfig = sequelize.define('EmbedConfig', {
  configKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  clientWebUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  clientWebName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ambassadorIds: {
    type: DataTypes.JSON,
    allowNull: true
  },
  uiConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      themeColor: "#4f46e5",
      position: "right",
      buttonText: "Chat with Ambassador",
      titleText: "Ask our Ambassadors",
      logoUrl: null
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  soldTo: {
    type: DataTypes.JSON,
    allowNull: true
  },
  history: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'embed_configs',
  timestamps: true
})

export { EmbedConfig }
