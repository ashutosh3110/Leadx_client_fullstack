import { sequelize } from '../src/config/db.js'
import { User } from '../src/models/user.js'
import bcrypt from 'bcryptjs'

const createAdminUser = async () => {
  try {
    console.log('🚀 Creating admin user...')
    
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Connected to MySQL database')
    
    // Sync models
    await sequelize.sync({ alter: true })
    console.log('✅ Database tables synchronized')
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        email: 'admin@leadx.com' 
      } 
    })
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!')
      console.log('📧 Email:', existingAdmin.email)
      console.log('🔑 Password: admin123')
      console.log('👤 Role:', existingAdmin.role)
      return
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await User.create({
      name: 'LeadX Admin',
      email: 'admin@leadx.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      status: 'active',
      country: 'India',
      state: 'Delhi',
      about: 'LeadX CRM Administrator'
    })
    
    console.log('🎉 Admin user created successfully!')
    console.log('📧 Email: admin@leadx.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role: admin')
    console.log('🆔 User ID:', adminUser.id)
    
    console.log('\n📋 Login Credentials:')
    console.log('Email: admin@leadx.com')
    console.log('Password: admin123')
    console.log('\n🌐 You can now login to admin dashboard!')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
  } finally {
    await sequelize.close()
    console.log('🔌 Database connection closed')
  }
}

createAdminUser()
