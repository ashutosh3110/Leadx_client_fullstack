# MongoDB to MySQL Migration Guide

## 🚀 Migration Steps

### 1. Install Dependencies
```bash
cd leadx-backend
npm install mysql2 sequelize
```

### 2. Setup MySQL Database
```sql
CREATE DATABASE leadx_crm;
```

### 3. Environment Variables
Create `.env` file with MySQL configuration:
```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=leadx_crm
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_secret_key_here

# Email Configuration
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Server Configuration
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Migration Script
```bash
node scripts/migrate-to-mysql.js
```

### 5. Start Server
```bash
npm run dev
```

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String)
- `email` (String, Unique)
- `phone` (String)
- `password` (String)
- `role` (ENUM: user, ambassador, admin)
- `isVerified` (Boolean)
- `hasReward` (Boolean)
- `status` (ENUM: active, inactive)
- `conversionStatus` (ENUM: pending, converted, enrolled)
- `profileImage` (String)
- `thumbnailImage` (String)
- `country` (String)
- `state` (String)
- `about` (Text)
- `languages` (JSON)
- `extracurriculars` (JSON)
- `program` (String)
- `course` (String)
- `year` (String)
- `graduationYear` (String)
- `resetCode` (String)
- `resetCodeExpires` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Chats Table
- `id` (Primary Key)
- `lastMessageId` (Foreign Key to Messages)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Messages Table
- `id` (Primary Key)
- `chatId` (Foreign Key to Chats)
- `senderId` (Foreign Key to Users)
- `receiverId` (Foreign Key to Users)
- `content` (Text)
- `isRead` (Boolean)
- `isFormSubmission` (Boolean)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Rewards Table
- `id` (Primary Key)
- `ambassadorId` (Foreign Key to Users)
- `amount` (Decimal)
- `currency` (ENUM: INR, USD)
- `status` (ENUM: pending, approved, paid)
- `remarks` (Text)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### ChatParticipants Table (Junction Table)
- `id` (Primary Key)
- `chatId` (Foreign Key to Chats)
- `userId` (Foreign Key to Users)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## 🔄 Key Changes Made

### 1. Database Connection
- **Before**: MongoDB with Mongoose
- **After**: MySQL with Sequelize

### 2. Model Definitions
- **Before**: Mongoose Schemas
- **After**: Sequelize Models

### 3. Query Syntax
- **Before**: `User.findById(id)`
- **After**: `User.findByPk(id)`

- **Before**: `User.find({ role: "ambassador" })`
- **After**: `User.findAll({ where: { role: "ambassador" } })`

### 4. Relationships
- **Before**: MongoDB References
- **After**: MySQL Foreign Keys with Sequelize Associations

## ✅ Frontend Compatibility

- **API Endpoints**: Same URLs
- **Response Format**: Same JSON structure
- **Authentication**: Same JWT tokens
- **File Uploads**: Same endpoints
- **Real-time Chat**: Same Socket.io functionality

## 🧪 Testing

1. **API Testing**: All endpoints work same
2. **Frontend Testing**: No changes needed
3. **Database Testing**: MySQL queries work
4. **Integration Testing**: End-to-end flow

## 🚨 Important Notes

1. **Zero Frontend Changes**: Frontend code remains exactly the same
2. **Same API Interface**: All endpoints return same response format
3. **Data Migration**: Use migration script for existing data
4. **Backup**: Always backup MongoDB data before migration
5. **Testing**: Test all functionality after migration

## 🔧 Troubleshooting

### Common Issues:
1. **Connection Error**: Check MySQL credentials
2. **Table Creation**: Ensure database exists
3. **Foreign Key Errors**: Check relationship definitions
4. **Query Errors**: Verify Sequelize syntax

### Solutions:
1. Verify MySQL server is running
2. Check database credentials
3. Run migration script again
4. Check console logs for errors
