import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"
import {
  startChat,
  sendMessage,
  getMessages,
  getMyChats,
  deleteChat,
  editMessage,
  deleteMessage,
  adminGetChatsByAmbassador,
  adminGetMessages,
  adminSendAsAmbassador,
  adminGetChatStats,
  getMyUsers,
  getAmbassadorsWithMessages,
  getTotalConversations,
  getStudentStats,
} from "../controllers/Chat.js"

const router = Router()

// Public route for starting chats (no authentication required)
router.post("/start-public", startChat)
// Authenticated route for existing users
router.post("/start", authenticate, startChat)
router.post("/send", authenticate, sendMessage)
router.get("/my", authenticate, getMyChats)
router.get("/my-users", authenticate, getMyUsers)
router.get("/:chatId", authenticate, getMessages)
router.delete("/:chatId", authenticate, deleteChat)

// ==========================
// ADMIN CHAT ROUTES
// ==========================
router.get(
  "/admin/ambassador/:ambassadorId/chats",
  authenticate,
  checkRole("admin"),
  adminGetChatsByAmbassador
)
router.get(
  "/admin/chat/:chatId/messages",
  authenticate,
  checkRole("admin"),
  adminGetMessages
)
router.post(
  "/admin/send-as-ambassador",
  authenticate,
  checkRole("admin"),
  adminSendAsAmbassador
)
router.get(
  "/admin/stats",
  authenticate,
  checkRole("admin"),
  adminGetChatStats
)
router.get(
  "/admin/ambassadors-with-messages",
  authenticate,
  checkRole("admin"),
  getAmbassadorsWithMessages
)
router.get(
  "/admin/total-conversations",
  authenticate,
  checkRole("admin"),
  getTotalConversations
)
router.get(
  "/admin/student-stats",
  authenticate,
  checkRole("admin"),
  getStudentStats
)
router.put("/message/:messageId", authenticate, editMessage)
router.delete("/message/:messageId", authenticate, deleteMessage)
export default router
