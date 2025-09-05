import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"
import uploader from "../utils/uploader.js"

import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
  logout,
  forgotPassword,
  resendResetCode,
  verifyResetCode,
  resetPassword,
  deleteAccount,
  createAdmin, // NEW
} from "../controllers/user.js"

const router = Router()

/* ==========================
   🔑 AUTH ROUTES
========================== */
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", authenticate, logout)

/* ==========================
   👤 USER PROFILE ROUTES
========================== */
router.patch(
  "/update-profile",
  authenticate,
  uploader("users").fields([
    { name: "profileImage", maxCount: 1 },
    { name: "thumbnailImage", maxCount: 1 },
  ]),
  updateProfile
)

router.delete("/delete-account", authenticate, deleteAccount)

/* ==========================
   🔒 PASSWORD RESET FLOW
========================== */
router.post("/forgot-password", forgotPassword)
router.post("/resend-code", resendResetCode)
router.post("/verify-code", verifyResetCode)
router.post("/reset-password", resetPassword)

/* ==========================
   👥 ADMIN ROUTES
========================== */
// Create admin (only admin can create new admin dynamically)
router.post("/admin/create", authenticate, checkRole("admin"), createAdmin)

// Manage users
router.get("/admin", authenticate, checkRole("admin"), getAllUsers)
router.get("/admin/:id", authenticate, checkRole("admin"), getUserById)
router.put("/admin/:id", authenticate, checkRole("admin"), updateUser)
router.delete("/admin/:id", authenticate, checkRole("admin"), deleteUser)

export default router
