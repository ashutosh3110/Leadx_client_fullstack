import { Router } from "express"

import userRoutes from "./user.js"
import chatRoutes from "./chat.js"

const router = Router()

// ROUTES
router.use("/auth", userRoutes)
router.use("/chat", chatRoutes)

export default router
