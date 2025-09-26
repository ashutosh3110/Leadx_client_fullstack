import { Router } from "express"
import { authenticate, checkRole } from "../middlewares/authenticate.js"
import uploader from "../utils/uploader.js"
import mongoose from "mongoose"
 
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

// Users list (Admin)
router.get("/users", authenticate, checkRole("admin"), getAllUsers)

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
router.get("/ambassador-logins", getAmbassadorLogins) // ✅ moved above dynamic routes
 
/* ==========================
   🧠 Dynamic Routes (must come last)
========================== */
 
// ✅ Add ObjectId validation here
router.get("/:id", async (req, res, next) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
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