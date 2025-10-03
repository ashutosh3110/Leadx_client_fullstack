import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"
import {
  createCustomization,
  getCustomizations,
  updateCustomization,
  deleteCustomization,
  generateScript,
  getPublicConfig,
} from "../controllers/customization.js"

const router = Router()

// Admin routes (protected)
router.post("/", authenticate, checkRole("admin"), createCustomization)
router.get("/", authenticate, checkRole("admin"), getCustomizations)
router.put("/:id", authenticate, checkRole("admin"), updateCustomization)
router.delete("/:id", authenticate, checkRole("admin"), deleteCustomization)

// Public routes (for embedded scripts)
router.get("/script/:configId.js", generateScript)
router.get("/public/:configId", getPublicConfig)

export default router
