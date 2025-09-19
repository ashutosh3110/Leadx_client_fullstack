import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/user.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/leadx");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@leadx.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@leadx.com",
      password: hashedPassword,
      role: "admin",
      phone: "1234567890",
      country: "India",
      state: "Delhi"
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@leadx.com");
    console.log("Password: admin123");
    console.log("Role: admin");
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdmin();
  process.exit(0);
};

run();
