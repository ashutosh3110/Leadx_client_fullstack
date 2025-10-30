import axios from 'axios';

const testAmbassadorAPI = async () => {
  try {
    console.log('🔍 Testing Ambassador API...');
    
    // Test 1: Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'prince@gmail.com',
      password: '123456'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      
      // Test 2: Ambassador Dashboard
      try {
        const dashboardResponse = await axios.get('http://localhost:5000/api/auth/ambassador-dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Ambassador Dashboard Response:');
        console.log(JSON.stringify(dashboardResponse.data, null, 2));
      } catch (dashboardError) {
        console.error('❌ Dashboard Error:');
        console.error('Status:', dashboardError.response?.status);
        console.error('Data:', dashboardError.response?.data);
        console.error('Message:', dashboardError.message);
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing ambassador API:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
};

testAmbassadorAPI();
