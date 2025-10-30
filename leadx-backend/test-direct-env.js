// Set environment variables directly
process.env.PORT = '5000'
process.env.JWT_ACCESS_SECRET = 'LeadXSecretKey'
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'leadx_crm'
process.env.DB_USER = 'root'
process.env.DB_PASSWORD = 'root'

console.log('🔍 Environment variables set directly:')
console.log('PORT:', process.env.PORT)
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET)
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD)

// Test JWT token generation
import jwt from 'jsonwebtoken'

try {
  const token = jwt.sign(
    { id: 1, email: 'admin@leadx.com', role: 'admin' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '7d' }
  )
  console.log('✅ JWT Token generated successfully!')
  console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...')
} catch (error) {
  console.error('❌ JWT Error:', error.message)
}
