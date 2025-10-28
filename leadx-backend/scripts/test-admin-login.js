import { sequelize } from '../src/config/db.js'
import { User } from '../src/models/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const testAdminLogin = async () => {
  try {
    console.log('🔍 Testing admin login...')
    
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Connected to MySQL database')
    
    // Find admin user
    const admin = await User.findOne({ 
      where: { 
        email: 'admin@leadx.com' 
      } 
    })
    
    if (!admin) {
      console.log('❌ Admin user not found!')
      return
    }
    
    console.log('✅ Admin user found:')
    console.log('📧 Email:', admin.email)
    console.log('👤 Name:', admin.name)
    console.log('🔑 Role:', admin.role)
    console.log('✅ Verified:', admin.isVerified)
    console.log('📊 Status:', admin.status)
    
    // Test password verification
    const passwordMatch = await bcrypt.compare('admin123', admin.password)
    console.log('🔐 Password verification:', passwordMatch ? '✅ Valid' : '❌ Invalid')
    
    if (passwordMatch) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          role: admin.role 
        },
        process.env.JWT_ACCESS_SECRET || 'LeadXSecretKey',
        { expiresIn: '7d' }
      )
      
      console.log('🎫 JWT Token generated successfully!')
      console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...')
      
      console.log('\n🌐 Admin Dashboard Access:')
      console.log('1. Start your frontend server')
      console.log('2. Go to login page')
      console.log('3. Use these credentials:')
      console.log('   Email: admin@leadx.com')
      console.log('   Password: admin123')
      console.log('4. You will be redirected to admin dashboard!')
    }
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error.message)
  } finally {
    await sequelize.close()
    console.log('🔌 Database connection closed')
  }
}

testAdminLogin()
