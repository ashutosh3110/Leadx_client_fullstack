import { Router } from "express"

import userRoutes from "./user.js"
import chatRoutes from "./chat.js"
import rewardRoutes from "./reward.js"
import embedRoutes from "./embed.js"
import customizationRoutes from "./customization.js"

const router = Router()

// ROUTES
router.use("/auth", userRoutes)
router.use("/chat", chatRoutes)
router.use("/rewards", rewardRoutes)
router.use("/embed", embedRoutes)
router.use("/customization", customizationRoutes)

export default router
