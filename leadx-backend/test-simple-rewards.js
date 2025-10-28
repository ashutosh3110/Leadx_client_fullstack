import { sequelize } from "./src/config/db.js";
import Reward from "./src/models/Reward.js";
import { User } from "./src/models/user.js";
import "./src/models/index.js"; // Import associations

const testSimpleRewards = async () => {
  try {
    console.log('🔍 Testing simple rewards query...');
    
    // Test 1: Simple findAll
    console.log('📊 Test 1: Simple Reward.findAll()');
    const rewards = await Reward.findAll({
      limit: 5
    });
    console.log('✅ Found', rewards.length, 'rewards');
    
    // Test 2: Manual population (like in controller)
    console.log('📊 Test 2: Manual population');
    const rewardsWithAmbassadors = await Promise.all(
      rewards.map(async (reward) => {
        const ambassador = await User.findByPk(reward.ambassadorId, {
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'phone', 'course', 'program', 'country', 'state']
        });
        
        return {
          ...reward.toJSON(),
          ambassador: ambassador ? ambassador.toJSON() : null
        };
      })
    );
    console.log('✅ Manual population successful, found', rewardsWithAmbassadors.length, 'rewards with ambassadors');
    
    // Test 3: Try include (to see exact error)
    console.log('📊 Test 3: Include query');
    try {
      const rewardsWithInclude = await Reward.findAll({
        include: [
          {
            model: User,
            as: 'ambassador',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: 5
      });
      console.log('✅ Include query successful, found', rewardsWithInclude.length, 'rewards');
    } catch (includeError) {
      console.error('❌ Include query failed:', includeError.message);
      console.error('❌ Include error details:', includeError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
  } finally {
    await sequelize.close();
  }
};

testSimpleRewards();
