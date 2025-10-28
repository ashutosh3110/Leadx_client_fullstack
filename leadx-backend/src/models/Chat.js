import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

const Chat = sequelize.define('Chat', {
  participants: {
    type: DataTypes.JSON,
    allowNull: false
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true
    // Removed foreign key constraint to avoid circular dependency
  }
}, {
  tableName: 'chats',
  timestamps: true
})

export { Chat }
