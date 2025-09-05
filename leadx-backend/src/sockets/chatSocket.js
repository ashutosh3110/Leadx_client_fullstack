export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id)

    // Join room for personal messages
    socket.on("join", (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined their personal room`)
    })

    // Handle sending messages
    socket.on("sendMessage", ({ chatId, senderId, receiverId, content }) => {
      io.to(receiverId).emit("newMessage", { chatId, senderId, content })
    })

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected")
    })
  })
}
