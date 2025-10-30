import { Sequelize } from "sequelize"

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'leadx_crm',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
)

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Connected to MySQL database!")
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false })
    console.log("✅ Database tables synchronized!")
  } catch (error) {
    console.error("❌ MySQL connection failed:", error)
    process.exit(1)
  }
}

export { sequelize }
export default connectDB
