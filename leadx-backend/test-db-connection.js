import connectDB, { sequelize } from './src/config/db.js';
import { User, Chat, Message } from './src/models/index.js';

const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    console.log('🔍 Testing Chat model...');
    const chatCount = await Chat.count();
    console.log(`✅ Chat count: ${chatCount}`);
    
    console.log('🔍 Testing User model...');
    const userCount = await User.count();
    console.log(`✅ User count: ${userCount}`);
    
    console.log('🔍 Testing Message model...');
    const messageCount = await Message.count();
    console.log(`✅ Message count: ${messageCount}`);
    
    console.log('✅ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
};

testDatabaseConnection();
