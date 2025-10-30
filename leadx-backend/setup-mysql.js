import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

const setupMySQL = async () => {
  try {
    console.log('🚀 Setting up MySQL for LeadX CRM...')
    
    // Check if .env file exists
    const envPath = path.join(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file from template...')
      const envTemplate = `# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=leadx_crm
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_secret_key_here

# Email Configuration (Optional)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Socket Configuration
SOCKET_URL=http://localhost:5000

# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000`
      
      fs.writeFileSync(envPath, envTemplate)
      console.log('✅ .env file created! Please update the database password.')
    }
    
    // Test MySQL connection
    console.log('🔍 Testing MySQL connection...')
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })
    
    console.log('✅ MySQL connection successful!')
    
    // Create database if it doesn't exist
    console.log('🔍 Creating database...')
    await connection.execute('CREATE DATABASE IF NOT EXISTS leadx_crm')
    console.log('✅ Database "leadx_crm" created/verified!')
    
    // Show databases
    const [databases] = await connection.execute('SHOW DATABASES')
    console.log('📊 Available databases:')
    databases.forEach(db => console.log(`  - ${db.Database}`))
    
    await connection.end()
    console.log('🎉 MySQL setup completed successfully!')
    console.log('📝 Next steps:')
    console.log('  1. Update .env file with your MySQL password')
    console.log('  2. Run: node scripts/migrate-to-mysql.js')
    console.log('  3. Run: npm run dev')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure MySQL is installed and running')
    console.log('2. Check your MySQL credentials')
    console.log('3. Try installing XAMPP for easier setup')
    console.log('4. Or use Docker: docker run --name mysql-leadx -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=leadx_crm -p 3306:3306 -d mysql:8.0')
  }
}

setupMySQL()
