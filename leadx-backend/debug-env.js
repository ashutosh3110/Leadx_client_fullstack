import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Debugging environment variables...')
console.log('📁 Current directory:', __dirname)
console.log('📁 Project root:', path.join(__dirname, '..'))

// Load .env file
const result = dotenv.config({ path: '.env' })
console.log('📄 .env file result:', result)

console.log('\n🔍 Environment variables:')
console.log('PORT:', process.env.PORT)
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET)
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD)

console.log('\n🔍 JWT Secret check:')
if (process.env.JWT_ACCESS_SECRET) {
  console.log('✅ JWT_ACCESS_SECRET is set')
  console.log('🔑 Value length:', process.env.JWT_ACCESS_SECRET.length)
} else {
  console.log('❌ JWT_ACCESS_SECRET is NOT set')
}
