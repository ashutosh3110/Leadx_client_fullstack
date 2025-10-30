import mongoose from 'mongoose'
import { User } from './src/models/user.js'

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/leadx'
    await mongoose.connect(mongoURI)
    console.log("✅ Connected to the database!")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    process.exit(1)
  }
}

// Check users in database
const checkUsers = async () => {
  try {
    await connectDB()
    
    // Get all users
    const allUsers = await User.findAll({})
    console.log(`📊 Total users in database: ${allUsers.length}`)
    
    // Get users by role
    const userRoleUsers = await User.findAll({ where: { role: 'user' } })
    console.log(`📊 Users with role 'user': ${userRoleUsers.length}`)
    
    const ambassadorRoleUsers = await User.findAll({ where: { role: 'ambassador' } })
    console.log(`📊 Users with role 'ambassador': ${ambassadorRoleUsers.length}`)
    
    const adminRoleUsers = await User.findAll({ where: { role: 'admin' } })
    console.log(`📊 Users with role 'admin': ${adminRoleUsers.length}`)
    
    // Show recent users
    const recentUsers = await User.findAll({ 
      order: [['createdAt', 'DESC']], 
      limit: 5 
    })
    console.log('\n📊 Recent users:')
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt}`)
    })
    
    // Show users with role 'user'
    if (userRoleUsers.length > 0) {
      console.log('\n📊 Users with role "user":')
      userRoleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`)
      })
    } else {
      console.log('\n❌ No users found with role "user"')
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Disconnected from database')
  }
}

checkUsers()



