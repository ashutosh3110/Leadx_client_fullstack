import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"
import uploader from "../utils/uploader.js"

import {
  registerUser,
  loginUser,
  getVerifiedAmbassadors,
  getAllAmbassadors,
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
  createAdmin,
  getMyProfile,
  approveAmbassador,
  rejectAmbassador,
} from "../controllers/user.js"

const router = Router()

/* ==========================
   🔑 AUTH ROUTES
========================== */
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", authenticate, logout)
router.get("/me", authenticate, getMyProfile)
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
router.post("/create", authenticate, checkRole("admin"), createAdmin)

// Ambassadors list (Admin)
router.get("/ambassadors", getAllAmbassadors)

// Manage users
router.get(
  "/verify/ambassadors",
  authenticate,
  checkRole("admin"),
  getVerifiedAmbassadors
)
router.get("/:id", getUserById)
router.put("/:id", authenticate, checkRole("admin"), updateUser)
router.delete("/:id", authenticate, checkRole("admin"), deleteUser)
// 🔐 Protected routes (admin only)
router.patch(
  "/:id/approve",
  authenticate,
  checkRole("admin"),
  approveAmbassador
)
router.patch("/:id/reject", authenticate, checkRole("admin"), rejectAmbassador)
export default router
