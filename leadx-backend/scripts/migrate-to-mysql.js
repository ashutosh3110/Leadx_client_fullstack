import { sequelize } from '../src/config/db.js'
import { User, Chat, Message, Reward } from '../src/models/index.js'
import fs from 'fs'
import path from 'path'

const migrateToMySQL = async () => {
  try {
    console.log('🚀 Starting MongoDB to MySQL migration...')
    
    // 1. Connect to database
    await sequelize.authenticate()
    console.log('✅ Connected to MySQL database')
    
    // 2. Sync models (create tables)
    await sequelize.sync({ force: true })
    console.log('✅ Database tables created')
    
    // 3. If you have existing MongoDB data, you can export it first
    // and then import it here. For now, we'll create some sample data
    
    console.log('📝 Creating sample admin user...')
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@leadx.com',
      phone: '1234567890',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      isVerified: true,
      status: 'active'
    })
    console.log('✅ Admin user created:', adminUser.id)
    
    console.log('📝 Creating sample ambassador...')
    const ambassador = await User.create({
      name: 'John Ambassador',
      email: 'ambassador@leadx.com',
      phone: '1234567891',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'ambassador',
      isVerified: true,
      status: 'active',
      course: 'Computer Science',
      program: 'B.Tech',
      country: 'India',
      state: 'Delhi'
    })
    console.log('✅ Ambassador created:', ambassador.id)
    
    console.log('📝 Creating sample user...')
    const user = await User.create({
      name: 'Jane User',
      email: 'user@leadx.com',
      phone: '1234567892',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'user',
      isVerified: true,
      status: 'active',
      country: 'India',
      state: 'Mumbai'
    })
    console.log('✅ User created:', user.id)
    
    console.log('📝 Creating sample chat...')
    const chat = await Chat.create({})
    console.log('✅ Chat created:', chat.id)
    
    // Add participants to chat
    await chat.addUser(ambassador)
    await chat.addUser(user)
    
    console.log('📝 Creating sample message...')
    const message = await Message.create({
      chatId: chat.id,
      senderId: user.id,
      receiverId: ambassador.id,
      content: 'Hello, I am interested in your course!',
      isRead: false
    })
    console.log('✅ Message created:', message.id)
    
    // Update chat with last message
    await chat.update({ lastMessageId: message.id })
    
    console.log('📝 Creating sample reward...')
    const reward = await Reward.create({
      ambassadorId: ambassador.id,
      amount: 1000.00,
      currency: 'INR',
      status: 'pending',
      remarks: 'Sample reward for testing'
    })
    console.log('✅ Reward created:', reward.id)
    
    console.log('🎉 Migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`- Users: ${await User.count()}`)
    console.log(`- Chats: ${await Chat.count()}`)
    console.log(`- Messages: ${await Message.count()}`)
    console.log(`- Rewards: ${await Reward.count()}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await sequelize.close()
    console.log('🔌 Database connection closed')
  }
}

// Run migration
migrateToMySQL()
