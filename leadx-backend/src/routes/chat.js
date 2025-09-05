import { Router } from "express"
import { authenticate } from "../middlewares/authenticate.js"
import {
  startChat,
  sendMessage,
  getMessages,
  getMyChats,
  deleteChat,
} from "../controllers/Chat.js"

const router = Router()

router.post("/start", authenticate, startChat)
router.post("/send", authenticate, sendMessage)
router.get("/my", authenticate, getMyChats)
router.get("/:chatId", authenticate, getMessages)
router.delete("/:chatId", authenticate, deleteChat)

export default router
