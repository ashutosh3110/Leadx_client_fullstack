import { sequelize } from "./src/config/db.js";
import { User } from "./src/models/user.js";
import Reward from "./src/models/Reward.js";
import "./src/models/index.js"; // Import associations

const testAssociations = async () => {
  try {
    console.log('🔍 Testing Sequelize associations...');
    
    // Test if associations are loaded
    console.log('📊 User associations:', Object.keys(User.associations));
    console.log('📊 Reward associations:', Object.keys(Reward.associations));
    
    // Test simple query without include
    console.log('🔍 Testing simple Reward query...');
    const rewards = await Reward.findAll({
      limit: 5
    });
    console.log('✅ Simple query successful, found', rewards.length, 'rewards');
    
    // Test query with include
    console.log('🔍 Testing Reward query with include...');
    const rewardsWithUser = await Reward.findAll({
      include: [
        {
          model: User,
          as: 'ambassador',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: 5
    });
    console.log('✅ Include query successful, found', rewardsWithUser.length, 'rewards with users');
    
    // Log sample data
    if (rewardsWithUser.length > 0) {
      console.log('📊 Sample reward with user:', JSON.stringify(rewardsWithUser[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Association test failed:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await sequelize.close();
  }
};

testAssociations();
