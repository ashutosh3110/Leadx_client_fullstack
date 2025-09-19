import { Router } from "express"

import userRoutes from "./user.js"
import chatRoutes from "./chat.js"
import rewardRoutes from "./reward.js"

const router = Router()

// ROUTES
router.use("/auth", userRoutes)
router.use("/chat", chatRoutes)
router.use("/rewards", rewardRoutes)

export default router
