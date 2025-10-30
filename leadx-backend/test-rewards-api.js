// Using built-in fetch (Node.js 18+)

const testRewardsAPI = async () => {
  try {
    console.log('🔍 Testing rewards API...');
    
    // First login as admin to get token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@leadx.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    const token = loginData.data.token;
    
    // Test getAllRewards API
    console.log('🔍 Testing getAllRewards API...');
    const rewardsResponse = await fetch('http://localhost:5000/api/rewards', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', rewardsResponse.status);
    console.log('📊 Response headers:', Object.fromEntries(rewardsResponse.headers));

    if (!rewardsResponse.ok) {
      const errorText = await rewardsResponse.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API failed: ${rewardsResponse.status} - ${errorText}`);
    }

    const rewardsData = await rewardsResponse.json();
    console.log('✅ Rewards API successful');
    console.log('📊 Rewards data:', JSON.stringify(rewardsData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
  }
};

testRewardsAPI();
