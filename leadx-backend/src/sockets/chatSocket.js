import { Server } from "socket.io"

// ✅ Global onlineUsers map
export const onlineUsers = new Map()

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id)

    // Token se userId nikalna (abhi dummy)
    const userId = socket.handshake.auth?.tokenUserId
    if (userId) {
      onlineUsers.set(userId, socket.id)
    }

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id)
      if (userId) onlineUsers.delete(userId)
    })
  })
}
