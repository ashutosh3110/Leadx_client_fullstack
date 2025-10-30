import axios from 'axios';

const testAmbassadorDashboard = async () => {
  try {
    console.log('🔍 Testing Ambassador Dashboard Endpoint...');
    
    // First, let's try to login as an ambassador
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'prince@gmail.com', // Use an ambassador email
      password: '123456' // Use ambassador password
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Now test the ambassador dashboard endpoint
      const dashboardResponse = await axios.get('http://localhost:5000/api/auth/ambassador-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Ambassador Dashboard Response:');
      console.log(JSON.stringify(dashboardResponse.data, null, 2));
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing ambassador dashboard:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
};

testAmbassadorDashboard();
