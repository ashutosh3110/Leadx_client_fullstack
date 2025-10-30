import connectDB, { sequelize } from './src/config/db.js';
import { User } from './src/models/user.js';
import bcrypt from 'bcryptjs';

const checkAmbassadorPassword = async () => {
  try {
    await connectDB();
    console.log("🔍 Checking ambassador password...");
    
    const ambassador = await User.findOne({
      where: { 
        role: 'ambassador',
        email: 'prince@gmail.com'
      },
      attributes: ['id', 'name', 'email', 'password']
    });
    
    if (ambassador) {
      console.log(`✅ Ambassador found: ${ambassador.name} (${ambassador.email})`);
      console.log(`🔍 Password hash: ${ambassador.password}`);
      
      // Test common passwords
      const testPasswords = ['prince123', 'password123', 'prince', '123456', 'admin123'];
      
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, ambassador.password);
        console.log(`🔍 Testing password "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
      }
    } else {
      console.log("❌ Ambassador not found");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking ambassador password:", error);
    process.exit(1);
  }
};

checkAmbassadorPassword();
