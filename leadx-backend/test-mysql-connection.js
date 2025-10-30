import { sequelize } from './src/config/db.js'
import { User, Chat, Message, Reward } from './src/models/index.js'

const testConnection = async () => {
  try {
    console.log('🔍 Testing MySQL connection...')
    
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ MySQL connection successful!')
    
    // Test model sync
    console.log('🔍 Testing model sync...')
    await sequelize.sync({ alter: true })
    console.log('✅ Models synchronized successfully!')
    
    // Test creating a simple user
    console.log('🔍 Testing user creation...')
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'hashedpassword',
      role: 'user'
    })
    console.log('✅ Test user created:', testUser.id)
    
    // Test finding the user
    console.log('🔍 Testing user retrieval...')
    const foundUser = await User.findByPk(testUser.id)
    console.log('✅ User found:', foundUser.name)
    
    // Clean up test user
    await testUser.destroy()
    console.log('✅ Test user cleaned up')
    
    console.log('🎉 All tests passed! MySQL migration is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await sequelize.close()
    console.log('🔌 Database connection closed')
  }
}

testConnection()
