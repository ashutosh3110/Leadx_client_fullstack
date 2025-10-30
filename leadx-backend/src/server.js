import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { fileURLToPath } from "url"
import path from "path"
import { createServer } from "http"
import { Server } from "socket.io"

import connectDB from "./config/db.js"
import ROUTER from "./routes/index.js"
import errorHandler from "./middlewares/error-handler.js"
import { initChatSocket } from "./sockets/chatSocket.js"
// Import models to ensure associations are loaded
import "./models/index.js"

// Get __dirname first
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Log environment variables for debugging
console.log('🔍 Environment Variables Loaded:')
console.log('PORT:', process.env.PORT)
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '✅ Set' : '❌ Not Set')
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ Not Set')

// Force set critical environment variables
process.env.JWT_ACCESS_SECRET = 'LeadXSecretKey'
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'leadx_crm'
process.env.DB_USER = 'root'
process.env.DB_PASSWORD = 'root'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/public", express.static(path.join(__dirname, "../public")))
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ROUTES
app.use("/api", ROUTER)
app.get("/", (req, res) => {
  res.send("🚀 LeadX App API is running...")
})

// ✅ Error handler middleware sabse last me rakho
app.use(errorHandler)

// --- SOCKET.IO SETUP ---
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
})

// Initialize chat socket
initChatSocket(io)

// Attach io to requests so controllers can use it
app.use((req, res, next) => {
  req.io = io
  next()
})
console.log("MAIL_USER:", process.env.MAIL_USER)
console.log("MAIL_PASS:", process.env.MAIL_PASS ? "✅ Loaded" : "❌ Missing")

// DB Connection + Server Start
const startServer = async () => {
  await connectDB()
  server.listen(PORT, () => {
    console.log(`✅ Server running on ${PORT}`)
  })
}

startServer()
