import connectDB, { sequelize } from './src/config/db.js';
import { User } from './src/models/user.js';

const checkAmbassadors = async () => {
  try {
    await connectDB();
    console.log("🔍 Checking ambassadors in database...");
    
    const ambassadors = await User.findAll({
      where: { role: 'ambassador' },
      attributes: ['id', 'name', 'email', 'role']
    });
    
    console.log(`✅ Found ${ambassadors.length} ambassadors:`);
    ambassadors.forEach((ambassador, index) => {
      console.log(`${index + 1}. ID: ${ambassador.id}, Name: ${ambassador.name}, Email: ${ambassador.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking ambassadors:", error);
    process.exit(1);
  }
};

checkAmbassadors();
