import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"

import {
  createReward,
  getAllRewards,
  getMyRewards,
  getRewardStats,
  updateRewardStatus,
  deleteReward,
  getRewardById,
  getRewardsByAmbassador,
} from "../controllers/Reward.js"

const router = Router()

/* ==========================
   🎁 REWARD ROUTES
========================== */

// 🎁 Create Reward (Admin and Ambassador)
router.post("/", authenticate, createReward)

// 📋 Get All Rewards (Admin only)
router.get("/", authenticate, checkRole("admin"), getAllRewards)

// 📊 Get Reward Statistics (Admin only)
router.get("/stats", authenticate, checkRole("admin"), getRewardStats)

// 🎁 Get My Rewards (Ambassador and Admin)
router.get("/my", authenticate, getMyRewards)

// 📋 Get Reward by ID (Admin only)
router.get("/:id", authenticate, checkRole("admin"), getRewardById)

// 🎁 Get Rewards by Ambassador (Admin only)
router.get(
  "/ambassador/:ambassadorId",
  authenticate,
  checkRole("admin"),
  getRewardsByAmbassador
)

// ✏️ Update Reward Status (Admin only)
router.patch(
  "/:id/status",
  authenticate,
  checkRole("admin"),
  updateRewardStatus
)

// ❌ Delete Reward (Admin only)
router.delete("/:id", authenticate, checkRole("admin"), deleteReward)

export default router
