import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"
import {
  createConfig,
  updateConfig,
  listConfigs,
  toggleStatus,
  recordSale,
  salesHistory,
  serveWidget,
  publicSubmit,
  // publicConfig,
} from "../controllers/embed.js"

const router = Router()

// Admin-only management
router.post("/admin/config", authenticate, checkRole("admin"), createConfig)
router.put("/admin/config/:id", authenticate, checkRole("admin"), updateConfig)
router.get("/admin/config", authenticate, checkRole("admin"), listConfigs)
router.patch(
  "/admin/config/:id/toggle",
  authenticate,
  checkRole("admin"),
  toggleStatus
)
router.post(
  "/admin/config/:id/sale",
  authenticate,
  checkRole("admin"),
  recordSale
)
router.get(
  "/admin/sales-history",
  authenticate,
  checkRole("admin"),
  salesHistory
)

// Public endpoints
router.get("/widget/:configKey.js", serveWidget)
router.post("/submit", publicSubmit)
// router.get("/public/config/:configKey", publicConfig)

export default router
