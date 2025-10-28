import connectDB, { sequelize } from './src/config/db.js';
import { User, Chat, Message } from './src/models/index.js';

const testSimpleAmbassador = async () => {
  try {
    console.log('🔍 Testing simple ambassador dashboard...');
    await connectDB();
    
    // Test 1: Get ambassador
    const ambassador = await User.findOne({
      where: { role: 'ambassador' }
    });
    console.log('✅ Ambassador found:', ambassador?.name);
    
    if (!ambassador) {
      console.log('❌ No ambassador found');
      return;
    }
    
    // Test 2: Get ambassador chats
    const chats = await Chat.findAll({
      where: sequelize.where(
        sequelize.fn('JSON_CONTAINS', sequelize.col('participants'), JSON.stringify(ambassador.id)),
        true
      )
    });
    console.log('✅ Ambassador chats found:', chats.length);
    
    // Test 3: Get messages
    const chatIds = chats.map(chat => chat.id);
    let messageCount = 0;
    if (chatIds.length > 0) {
      messageCount = await Message.count({
        where: { chatId: chatIds }
      });
    }
    console.log('✅ Message count:', messageCount);
    
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testSimpleAmbassador();
