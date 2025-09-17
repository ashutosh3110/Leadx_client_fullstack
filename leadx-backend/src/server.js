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


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
