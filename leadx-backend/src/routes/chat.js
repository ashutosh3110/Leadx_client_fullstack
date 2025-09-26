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
  sendPublicMessage,
} from "../controllers/Chat.js"

const router = Router()

router.post("/start", authenticate, startChat)
router.post("/send", authenticate, sendMessage)
router.get("/my", authenticate, getMyChats)
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
router.put("/message/:messageId", authenticate, editMessage)
router.delete("/message/:messageId", authenticate, deleteMessage)

// ==========================
// PUBLIC CHAT ROUTES (for embeddable script)
// ==========================
// Use a distinct path to avoid clashing with the authenticated "/send" above
router.post("/public/send", sendPublicMessage) // Public endpoint for embeddable script

export default router
