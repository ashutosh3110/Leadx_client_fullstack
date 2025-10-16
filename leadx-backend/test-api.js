import fetch from 'node-fetch'

// Test the API endpoint
const testAPI = async () => {
  try {
    console.log('🔍 Testing API endpoint...')
    
    // Test the users/chat-history endpoint
    const response = await fetch('http://localhost:5000/api/auth/users/chat-history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // You'll need to get this from login
      }
    })
    
    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', response.headers.raw())
    
    const data = await response.json()
    console.log('📊 Response data:', JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('❌ Error testing API:', error)
  }
}

testAPI()

