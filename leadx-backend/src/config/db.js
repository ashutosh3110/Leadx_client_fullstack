import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI
    await mongoose.connect(mongoURI)
    console.log("✅ Connected to the database!")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    process.exit(1)
  }
}

export default connectDB
