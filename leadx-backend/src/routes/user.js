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
  getAmbassadors,
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
  autoRegisterUser,
  rejectAmbassador,
  getPublicAmbassadors,
  getAmbassadorLogins,
  getAllUsers,
  getAllUsersWithChatHistory,
  updateUserConversionStatus,
  getUserDashboard,
  getAmbassadorDashboard,
} from "../controllers/user.js"

const router = Router()

/* ==========================
   🔑 AUTH ROUTES
========================== */
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", authenticate, logout)
router.get("/me", authenticate, getMyProfile)
router.get("/debug-token", authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      userId: req.user?.id,
      userKeys: req.user ? Object.keys(req.user) : []
    }
  })
})
router.get("/dashboard", authenticate, getUserDashboard)
router.get("/ambassador-dashboard", authenticate, getAmbassadorDashboard)

// Test endpoint to check if the route is working
router.get("/test-ambassador", authenticate, (req, res) => {
  console.log("🔍 Test endpoint called")
  console.log("🔍 Test endpoint - req.user:", req.user)
  console.log("🔍 Test endpoint - req.user.id:", req.user?.id)
  console.log("🔍 Test endpoint - req.user.role:", req.user?.role)
  
  if (!req.user?.id) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' })
  }
  
  res.json({ success: true, message: "Test endpoint working", user: req.user })
})

// Simple test endpoint without authentication
router.get("/test-simple", (req, res) => {
  console.log("🔍 Simple test endpoint called")
  res.json({ success: true, message: "Simple test endpoint working" })
})
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

// Users list (Admin)
router.get("/users", authenticate, checkRole("admin"), getAllUsers)

// Users with chat history (Admin)
router.get(
  "/users/chat-history",
  authenticate,
  checkRole("admin"),
  getAllUsersWithChatHistory
)

// Manage users
router.get(
  "/verify/ambassadors",
  authenticate,
  checkRole("admin"),
  getVerifiedAmbassadors
)

/* ==========================
   🌐 PUBLIC API ROUTES (for embeddable script)
========================== */
router.get("/ambassadors/public", getPublicAmbassadors)
router.post("/auto-register", autoRegisterUser)
router.post("/debug-password", async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    return res.json({ found: false })
  }
  
  const isMatch = await bcrypt.compare(password, user.password)
  return res.json({
    found: true,
    hasPassword: !!user.password,
    passwordMatch: isMatch,
    passwordHash: user.password?.substring(0, 20) + "...",
    role: user.role,
    email: user.email
  })
})
router.get("/ambassador-logins", getAmbassadorLogins) // ✅ moved above dynamic routes

/* ==========================
   🔄 USER CONVERSION STATUS (must be before dynamic routes)
========================== */
// Update user conversion status (Ambassador can mark as converted, Admin can mark as enrolled)
router.patch(
  "/user/:userId/conversion-status",
  authenticate,
  updateUserConversionStatus
)

/* ==========================
   🧠 Dynamic Routes (must come last)
========================== */

// ✅ Add ID validation here
router.get("/:id", async (req, res, next) => {
  const { id } = req.params
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid user ID" })
  }
  return getUserById(req, res, next)
})

router.put("/:id", authenticate, checkRole("admin"), updateUser)
router.delete("/:id", authenticate, checkRole("admin"), deleteUser)
router.patch(
  "/:id/approve",
  authenticate,
  checkRole("admin"),
  approveAmbassador
)
router.patch("/:id/reject", authenticate, checkRole("admin"), rejectAmbassador)

export default router
