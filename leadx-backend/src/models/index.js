import { User } from './user.js'
import { Chat } from './Chat.js'
import { Message } from './Message.js'
import Reward from './Reward.js'
import { LoginHistory } from './LoginHistory.js'
import { EmbedConfig } from './EmbedConfig.js'
import { CustomizationConfig } from './CustomizationConfig.js'

// Define relationships
// User-Chat many-to-many relationship
User.belongsToMany(Chat, { 
  through: 'ChatParticipants',
  foreignKey: 'userId',
  otherKey: 'chatId'
})

Chat.belongsToMany(User, { 
  through: 'ChatParticipants',
  foreignKey: 'chatId',
  otherKey: 'userId'
})

// Chat-Message relationship
Chat.hasMany(Message, { 
  foreignKey: 'chatId',
  as: 'messages'
})
Message.belongsTo(Chat, { 
  foreignKey: 'chatId',
  as: 'chat'
})

// User-Message relationships
User.hasMany(Message, { 
  foreignKey: 'senderId',
  as: 'sentMessages'
})
User.hasMany(Message, { 
  foreignKey: 'receiverId',
  as: 'receivedMessages'
})

Message.belongsTo(User, { 
  foreignKey: 'senderId',
  as: 'sender'
})
Message.belongsTo(User, { 
  foreignKey: 'receiverId',
  as: 'receiver'
})

// User-Reward relationship
User.hasMany(Reward, { 
  foreignKey: 'ambassadorId',
  as: 'rewards'
})
Reward.belongsTo(User, { 
  foreignKey: 'ambassadorId',
  as: 'ambassador'
})

// User-LoginHistory relationship
User.hasMany(LoginHistory, { 
  foreignKey: 'userId',
  as: 'loginHistory'
})
LoginHistory.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
})

// Chat-LastMessage relationship - Commented out to avoid circular dependency
// Chat.belongsTo(Message, { 
//   foreignKey: 'lastMessageId',
//   as: 'lastMessage'
// })

export { User, Chat, Message, Reward, LoginHistory, EmbedConfig, CustomizationConfig }
