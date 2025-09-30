import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { User, userValidationSchema } from "../models/user.js"
import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import { sendEmail } from "../utils/mailer.js" // helper for email
import { LoginHistory } from "../models/LoginHistory.js"
 
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const useragent = require("useragent")
 
// 🔑 Register Ambassador
export const registerUser = async (req, res, next) => {
  try {
    console.log("🔍 Register request body:", req.body)
 
    const { error, value } = userValidationSchema.validate(req.body, {
      stripUnknown: true,
    })
 
    if (error) {
      console.log("❌ Validation error:", error.details[0].message)
      return next(errGen(400, error.details[0].message))
    }
 
    console.log("✅ Validated data:", value)
 
    const existingUser = await User.findOne({ email: value.email })
    if (existingUser) {
      console.log("❌ User already exists:", value.email)
      return next(errGen(400, "User already exists"))
    }
 
    // Hash password
    value.password = await bcrypt.hash(value.password, 10)
    console.log("✅ Password hashed successfully")
 
    // Force default role = ambassador
    const newUser = await User.create({ ...value, role: "ambassador" })
    console.log("✅ User created successfully:", newUser._id)
 
    const safeUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }
 
    res.status(201).json(respo(true, "Registered successfully", safeUser))
  } catch (err) {
    console.error("❌ Register error:", err)
    next(err)
  }
}
 
// 🔑 Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    console.log('🔍 Login attempt for email:', email)
    console.log('🔍 Login password provided:', password ? 'Yes' : 'No')
    
    if (!email || !password)
      return next(errGen(400, "Email and password are required"))
 
    const user = await User.findOne({ email })
    if (!user) {
      console.log('❌ User not found for email:', email)
      return next(errGen(404, "User not found"))
    }
    
    console.log('🔍 User found:', user._id, 'Role:', user.role)
    console.log('🔍 User password hash:', user.password.substring(0, 20) + '...')
 
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('🔍 Password match result:', isMatch)
    
    if (!isMatch) {
      console.log('❌ Invalid credentials for email:', email)
      return next(errGen(400, "Invalid credentials"))
    }
    
    console.log('✅ Login successful for:', email)
 
    const token = JWT.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    )
 
    // Extract IP
    const rawIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      ""
 
    const ip = rawIp.startsWith("::ffff:")
      ? rawIp.replace("::ffff:", "")
      : rawIp
    console.log("🛰️ Detected IP:", ip)
 
    const isLocalIp = ip === "::1" || ip === "127.0.0.1"
 
    let region = ""
    let city = ""
    let isp = ""
    let device = ""
    let os = ""
    let browser = ""
 
    // ✅ Parse user-agent properly
    const agent = useragent.parse(req.headers["user-agent"])
    device = agent.device.toString()
    os = agent.os.toString()
    browser = agent.toAgent()
 
    // 🌐 Fetch IP geo info if ambassador and not localhost
    if (user.role === "ambassador" && !isLocalIp && ip) {
      try {
        const apiKey =
          process.env.IPDATA_API_KEY ||
          "a15111aa6cea99eb45b31303978093a58b64d26b1dfb90b7077e9d69"
 
        console.log(`🌐 Fetching ipdata for IP: ${ip}`)
 
        const response = await fetch(
          `https://api.ipdata.co/${ip}?api-key=${apiKey}`
        )
 
        if (response.ok) {
          const data = await response.json()
          console.log("📍 ipdata response:", data)
 
          region = data.region || ""
          city = data.city || ""
          isp = data.asn?.name || data.carrier?.name || ""
        } else {
          console.error("❌ ipdata error:", await response.text())
        }
      } catch (err) {
        console.error("⚠️ ipdata fetch failed:", err)
      }
    }
 
    // 📦 Save login history
    await LoginHistory.create({
      userId: user._id,
      ipAddress: ip,
      region,
      city,
      isp,
      loginTime: new Date(),
      browser,
      os,
      device,
    })
 
    console.log("✅ Login history saved")
 
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
 
    res
      .status(200)
      .json(respo(true, "Login successful", { token, user: safeUser }))
  } catch (err) {
    console.error("❌ Login error:", err)
    next(err)
  }
}
 
// 👤 Get Own Profile
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) return next(errGen(404, "User not found"))
 
    res.status(200).json(respo(true, "Profile fetched successfully", user))
  } catch (err) {
    next(err)
  }
}
 
// 👥 Get All Ambassadors (Admin only)
export const getAllAmbassadors = async (req, res, next) => {
  try {
    const { search = "" } = req.query
    const query = {
      role: "ambassador",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }
    if (!search) delete query.$or
 
    const ambassadors = await User.find(query).select("-password")
    res.status(200).json(respo(true, "All Ambassadors fetched", ambassadors))
  } catch (err) {
    next(err)
  }
}
 
// 👥 Get Verified Ambassadors (Admin only)
export const getVerifiedAmbassadors = async (req, res, next) => {
  try {
    const { search = "" } = req.query
    const query = {
      role: "ambassador",
      isVerified: true,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }
    if (!search) delete query.$or
 
    console.log('🔍 getVerifiedAmbassadors query:', JSON.stringify(query, null, 2))
    
    const ambassadors = await User.find(query).select("-password")
    console.log('🔍 Found ambassadors count:', ambassadors.length)
    console.log('🔍 Ambassadors details:', ambassadors.map(a => ({
      id: a._id,
      name: a.name,
      email: a.email,
      isVerified: a.isVerified,
      role: a.role
    })))

    // Use hasReward field from database (no need to calculate)
    const ambassadorsWithRewards = ambassadors.map((ambassador) => ({
      ...ambassador.toObject(),
      hasReward: ambassador.hasReward || false,
    }))

    console.log(
      "getVerifiedAmbassadors - Ambassadors with reward status:",
      ambassadorsWithRewards.map((a) => ({
        name: a.name,
        hasReward: a.hasReward,
        isVerified: a.isVerified
      }))
    )
 
    res
      .status(200)
      .json(respo(true, "Verified Ambassadors fetched", ambassadorsWithRewards))
  } catch (err) {
    next(err)
  }
}
 
// 👤 Get User by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return next(errGen(404, "User not found"))
    res.status(200).json(respo(true, "User fetched successfully", user))
  } catch (err) {
    next(err)
  }
}
 
// ✏️ Update User (Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    console.log('🔍 updateUser called with id:', id)
    console.log('🔍 Request body:', req.body)
 
    // Create a custom validation schema for updates that doesn't apply defaults
    const updateValidationSchema = userValidationSchema
      .fork(["password", "email", "name", "phone"], (schema) => schema.optional())
      .fork(["password"], (schema) => schema.min(6).optional())
      .fork(["isVerified", "hasReward", "status"], (schema) => schema.optional())
      .options({ stripUnknown: true, abortEarly: false });

    const { error, value } = updateValidationSchema.validate(req.body)

    if (error) return next(errGen(400, error.details[0].message))
    
    console.log('🔍 Validated value:', value)
    console.log('🔍 Password in value:', value.password)
    console.log('🔍 Status in value:', value.status)
    console.log('🔍 Raw request body status:', req.body.status)

    // Handle password field properly
    if (value.password && value.password.trim() !== '') {
      console.log('🔍 Hashing password...')
      const oldPassword = value.password
      value.password = await bcrypt.hash(value.password, 10)
      console.log('🔍 Password hashed successfully')
      console.log('🔍 Original password:', oldPassword)
      console.log('🔍 Hashed password:', value.password.substring(0, 20) + '...')
    } else {
      console.log('🔍 No password provided or empty, removing from update')
      // Remove password from value if it's empty or undefined
      delete value.password
    }
    
    console.log('🔍 Final value to update:', value)

    // 🔒 Preserve critical fields that shouldn't be changed during admin update
    // Note: status is now editable by admin to activate/deactivate ambassadors
    const fieldsToPreserve = ['isVerified', 'hasReward', 'role']
    const currentUser = await User.findById(id)
    if (!currentUser) return next(errGen(404, "User not found"))
    
    console.log('🔍 Current user before update:', {
      id: currentUser._id,
      name: currentUser.name,
      role: currentUser.role,
      isVerified: currentUser.isVerified,
      hasReward: currentUser.hasReward,
      status: currentUser.status
    })
    
    // Preserve critical fields - ONLY preserve these, NOT status
    fieldsToPreserve.forEach(field => {
      // Only preserve isVerified, hasReward, and role
      value[field] = currentUser[field]
      console.log(`🔒 Preserved ${field}:`, currentUser[field])
    })
    
    // If status is not provided in the request, keep the current status
    if (value.status === undefined) {
      value.status = currentUser.status
      console.log('🔍 Status not provided, keeping current status:', currentUser.status)
    } else {
      console.log('🔍 Status provided, updating from', currentUser.status, 'to', value.status)
    }
    
    console.log('🔍 Final value before update:', value)
    console.log('🔍 Status in final value:', value.status)

    const user = await User.findByIdAndUpdate(id, value, { new: true }).select(
      "-password"
    )
    if (!user) return next(errGen(404, "User not found"))
    
    console.log('🔍 User updated successfully:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      hasReward: user.hasReward,
      status: user.status
    })
    
    console.log('🔍 Sending response with status:', user.status)
    console.log('🔍 Full user object:', user)

    res.status(200).json(respo(true, "User updated", user))
  } catch (err) {
    console.error('❌ Error in updateUser:', err)
    next(err)
  }
}
 
// ❌ Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return next(errGen(404, "User not found"))
    res.status(200).json(respo(true, "User deleted"))
  } catch (err) {
    next(err)
  }
}
// 🔹 Logout
export const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (err) {
    next(err)
  }
}
 
// 🔹 Update Profile (Self)
export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body
 
    // 🔐 Hash password if provided (and not empty)
    if (updates.password && updates.password.trim() !== "") {
      updates.password = await bcrypt.hash(updates.password, 10)
    } else {
      // Remove password field if empty or undefined
      delete updates.password
    }
 
    // 🏠 Handle state field (ensure it's a string, not array)
    if (updates.state) {
      if (Array.isArray(updates.state)) {
        // If it's an array, take the first non-empty value
        updates.state =
          updates.state.find((val) => val && val.trim() !== "") || ""
      } else {
        // Ensure it's a string
        updates.state = String(updates.state)
      }
    } else {
      updates.state = ""
    }
 
    // 🖼️ Handle uploaded files
    if (req.files?.profileImage) {
      updates.profileImage = req.files.profileImage[0].path.replace(/\\/g, "/")
    }
    if (req.files?.thumbnailImage) {
      updates.thumbnailImage = req.files.thumbnailImage[0].path.replace(
        /\\/g,
        "/"
      )
    }
 
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password")
 
    if (!user) return next(errGen(404, "User not found"))
 
    res.status(200).json(respo(true, "Profile updated", user))
  } catch (err) {
    next(err)
  }
}
 
// 🔹 Forgot Password (Send Reset Code)
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(errGen(404, "User not found"))
 
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.resetCode = code
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()
 
    await sendEmail(email, "Password Reset Code", `Your code: ${code}`)
    res.status(200).json(respo(true, "Reset code sent to email"))
  } catch (err) {
    next(err)
  }
}
// 👥 Get Ambassadors (Admin only)
export const getAmbassadors = async (req, res, next) => {
  try {
    const { search = "" } = req.query
    const query = {
      role: "ambassador",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }
    // If no search, remove $or to return all ambassadors
    if (!search) delete query.$or
 
    const users = await User.find(query).select("-password")
    res.status(200).json(respo(true, "Ambassadors fetched", users))
  } catch (err) {
    next(err)
  }
}
 
// 🔹 Resend Reset Code
export const resendResetCode = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(errGen(404, "User not found"))
 
    const code = generateOtpCode()
    user.resetCode = code
    user.resetCodeExpires = generateExpiry(5) // pass minutes (5 min)
    await user.save()
 
    await sendEmail(email, "Password Reset Code", `Your reset code is: ${code}`)
    return res.status(200).json(respo(true, "Reset code resent"))
  } catch (err) {
    next(err)
  }
}
 
// 🔹 Verify Reset Code
export const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(errGen(404, "User not found"))
 
    if (user.resetCode !== code || new Date() > user.resetCodeExpires) {
      return next(errGen(400, "Invalid or expired reset code"))
    }
 
    res.status(200).json(respo(true, "Code verified"))
  } catch (err) {
    next(err)
  }
}
 
// 🔹 Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body
    const user = await User.findOne({ email })
    if (!user) return next(errGen(404, "User not found"))
 
    if (user.resetCode !== code || new Date() > user.resetCodeExpires) {
      return next(errGen(400, "Invalid or expired reset code"))
    }
 
    user.password = await bcrypt.hash(newPassword, 10)
    user.resetCode = undefined
    user.resetCodeExpires = undefined
    await user.save()
 
    res.status(200).json(respo(true, "Password reset successfully"))
  } catch (err) {
    next(err)
  }
}
 
// 🔹 Delete Own Account
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id)
    if (!user) return next(errGen(404, "User not found"))
 
    res.status(200).json(respo(true, "Account deleted successfully"))
  } catch (err) {
    next(err)
  }
}
 
// create admin
export const createAdmin = async (req, res, next) => {
  try {
    // ✅ Check role
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can create new admins"))
    }
 
    const { error, value } = userValidationSchema.validate(req.body, {
      stripUnknown: true,
    })
    if (error) return next(errGen(400, error.details[0].message))
 
    const existingUser = await User.findOne({ email: value.email })
    if (existingUser) return next(errGen(400, "User already exists"))
 
    value.password = await bcrypt.hash(value.password, 10)
 
    const newAdmin = await User.create({
      ...value,
      role: "admin", // forced to admin
    })
 
    const safeUser = {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    }
 
    res.status(201).json(respo(true, "Admin created successfully", safeUser))
  } catch (err) {
    next(err)
  }
}
 
// 👉 Approve Ambassador
export const approveAmbassador = async (req, res, next) => {
  try {
    const { id } = req.params
 
    // only admin can approve
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can approve ambassadors"))
    }
 
    const user = await User.findById(id)
    if (!user) return next(errGen(404, "User not found"))
 
    if (user.role !== "ambassador") {
      return next(errGen(400, "User is not an ambassador"))
    }
 
    user.isVerified = true
    await user.save()
 
    return res
      .status(200)
      .json(respo(true, "Ambassador approved successfully", user))
  } catch (err) {
    next(err)
  }
}
 
// 👉 Reject Ambassador
export const rejectAmbassador = async (req, res, next) => {
  try {
    const { id } = req.params
 
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can reject ambassadors"))
    }
 
    const user = await User.findById(id)
    if (!user) return next(errGen(404, "User not found"))
 
    if (user.role !== "ambassador") {
      return next(errGen(400, "User is not an ambassador"))
    }
 
    user.isVerified = false
    await user.save()
 
    return res
      .status(200)
      .json(respo(true, "Ambassador rejected successfully", user))
  } catch (err) {
    next(err)
  }
}
 
//  Get Public Ambassadors (for embeddable script)
export const getPublicAmbassadors = async (req, res, next) => {
  try {
    console.log("🔍 Fetching public ambassadors...")

    // Get only verified and active ambassadors with basic info
    // Only ambassadors with status: "active" will appear in public cards
    const ambassadors = await User.find({
      role: "ambassador",
      isVerified: true,
      status: "active", // ✅ Only active ambassadors will be shown
    }).select("name email course profileImage createdAt status")

    console.log(`✅ Found ${ambassadors.length} public ambassadors (active only)`)
    console.log('🔍 Public ambassadors status:', ambassadors.map(a => ({ 
      name: a.name, 
      status: a.status,
      isVerified: a.isVerified 
    })))

    res
      .status(200)
      .json(respo(true, "Public ambassadors fetched successfully", ambassadors))
  } catch (err) {
    console.error("❌ Error fetching public ambassadors:", err)
    next(err)
  }
}
 
//  Auto Register User (for embeddable script)
export const autoRegisterUser = async (req, res, next) => {
  try {
    // console.log("🔍 Auto-register request body:", req.body)
 
    const {
      name,
      email,
      phone,
      password = "123456",
      role = "user",
      country,
      state,
      alternatePhone,
    } = req.body
 
    if (!name || !email || !phone) {
      return next(errGen(400, "Name, email, and phone are required"))
    }
 
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("✅ User already exists, returning existing user")
      const safeUser = {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        country: existingUser.country,
        state: existingUser.state,
        phone: existingUser.phone,
        alternatePhone: existingUser.alternatePhone,
      }
      return res.status(200).json(respo(true, "User already exists", safeUser))
    }
 
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("✅ Password hashed successfully")
 
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      country,
      state,
      alternatePhone,
      isVerified: true, // Optional: mark as verified
    })
 
    console.log("✅ User auto-registered successfully:", newUser._id)
 
    const safeUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      country: newUser.country,
      state: newUser.state,
      phone: newUser.phone,
      alternatePhone: newUser.alternatePhone,
    }
 
    // ✅ Send welcome email with credentials
    const subject = "🎉 Welcome to LeadX!"
    const text = `Hi ${name},
 
Welcome to LeadX! 🎉 Your account has been successfully created.
 
You can log in with the following credentials:
 
Email: ${email}
Password: ${password}
 
We recommend updating your password after logging in for the first time.
 
Thanks,  
The LeadX Team`
 
    await sendEmail(email, subject, text)
 
    res
      .status(201)
      .json(respo(true, "User auto-registered successfully", safeUser))
  } catch (err) {
    console.error("❌ Auto-register error:", err)
    next(err)
  }
}
 
// get ambassador login history
export const getAmbassadorLogins = async (req, res, next) => {
  try {
    const logs = await LoginHistory.find()
      .sort({ loginTime: -1 })
      .populate("userId", "name email role")
      .limit(2000)

    const filtered = logs.filter((log) => log.userId?.role === "ambassador")

    res.status(200).json(respo(true, "Login history fetched", filtered))
  } catch (err) {
    next(err)
  }
}

// 👥 Get All Users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query
    const query = {
      role: "user",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    }
    if (!search) delete query.$or

    const users = await User.find(query).select("-password").sort({ createdAt: -1 })
    res.status(200).json(respo(true, "All Users fetched", users))
  } catch (err) {
    next(err)
  }
}

// 🔄 Update User Conversion Status (Ambassador only)
export const updateUserConversionStatus = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { conversionStatus } = req.body // 'pending', 'converted', 'enrolled'
    
    console.log('🔍 Ambassador updating user status:', userId, conversionStatus)
    
    if (!['pending', 'converted', 'enrolled'].includes(conversionStatus)) {
      return next(errGen(400, 'Invalid conversion status'))
    }
    
    // Only allow ambassador to mark as 'converted', and admin to mark as 'enrolled'
    if (req.user.role === 'ambassador' && conversionStatus === 'enrolled') {
      return next(errGen(403, 'Only admin can mark users as enrolled'))
    }
    
    // Prevent ambassador from changing enrolled users
    if (req.user.role === 'ambassador' && user.conversionStatus === 'enrolled') {
      return next(errGen(403, 'Cannot change status of enrolled users'))
    }
    
    const user = await User.findById(userId)
    if (!user) return next(errGen(404, 'User not found'))
    
    if (user.role !== 'user') {
      return next(errGen(400, 'This is not a user account'))
    }
    
    // Update conversionStatus field (we'll add this to schema)
    user.conversionStatus = conversionStatus
    await user.save()
    
    console.log(`✅ User ${user.name} status updated to: ${conversionStatus}`)
    
    res.status(200).json(respo(true, 'User status updated successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      conversionStatus: user.conversionStatus
    }))
  } catch (err) {
    console.error('❌ Error updating user status:', err)
    next(err)
  }
}

// 👥 Get All Users with Chat History and Ambassador Details (Admin only)
export const getAllUsersWithChatHistory = async (req, res, next) => {
  try {
    console.log("🔍 getAllUsersWithChatHistory called")
    const { search = "" } = req.query
    console.log("🔍 Search query:", search)
    
    const query = {
      role: "user",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    }
    if (!search) delete query.$or

    console.log("🔍 Database query:", JSON.stringify(query, null, 2))

    // Get users with their chat history and ambassador details
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })

    console.log("📊 Found users:", users.length)
    console.log("📊 Users details:", users.map(u => ({ 
      id: u._id, 
      name: u.name, 
      email: u.email, 
      role: u.role,
      createdAt: u.createdAt 
    })))

    // For each user, get their chat history and ambassador details
    const usersWithChatHistory = await Promise.all(
      users.map(async (user) => {
        try {
          console.log(`🔍 Processing user: ${user.name} (${user._id})`)
          
          // Get all chats for this user
          const chats = await Chat.find({ participants: user._id })
            .populate({
              path: "participants",
              select: "name email role profileImage",
              match: { role: "ambassador" }
            })
            .populate({
              path: "lastMessage",
              select: "content sender createdAt",
              populate: {
                path: "sender",
                select: "name email role profileImage"
              }
            })
            .sort({ updatedAt: -1 })

          console.log(`📊 User ${user.name} has ${chats.length} chats`)
          console.log(`📊 Chats for ${user.name}:`, chats.map(c => ({ 
            id: c._id, 
            participants: c.participants?.length,
            lastMessage: c.lastMessage?.content 
          })))

          // Extract unique ambassadors from chats
          const ambassadors = []
          const ambassadorIds = new Set()

          console.log(`🔍 Processing ${chats.length} chats for user ${user.name}`)
          
          chats.forEach((chat, chatIndex) => {
            console.log(`🔍 Chat ${chatIndex + 1}:`, {
              id: chat._id,
              participants: chat.participants?.length || 0,
              participantDetails: chat.participants?.map(p => ({
                id: p._id,
                name: p.name,
                role: p.role
              }))
            })
            
            chat.participants.forEach((participant, partIndex) => {
              console.log(`🔍 Participant ${partIndex + 1}:`, {
                id: participant._id,
                name: participant.name,
                role: participant.role,
                isAmbassador: participant.role === "ambassador",
                alreadyAdded: ambassadorIds.has(participant._id.toString())
              })
              
              if (participant && participant.role === "ambassador" && !ambassadorIds.has(participant._id.toString())) {
                console.log(`✅ Adding ambassador: ${participant.name}`)
                ambassadors.push({
                  _id: participant._id,
                  name: participant.name,
                  email: participant.email,
                  profileImage: participant.profileImage
                })
                ambassadorIds.add(participant._id.toString())
              }
            })
          })

          console.log(`📊 Final ambassadors for ${user.name}:`, ambassadors.map(a => a.name))

          // Get total messages count for this user
          const totalMessages = await Message.countDocuments({
            $or: [
              { sender: user._id },
              { receiver: user._id }
            ]
          })

          console.log(`📊 User ${user.name} has ${totalMessages} total messages`)

          // Get last activity (last message time)
          const lastMessage = await Message.findOne({
            $or: [
              { sender: user._id },
              { receiver: user._id }
            ]
          }).sort({ createdAt: -1 })

          console.log(`📊 User ${user.name} last message:`, lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            sender: lastMessage.sender
          } : 'No messages')

          // Also check last activity from user's updatedAt field
          const userLastActivity = user.updatedAt || user.createdAt
          const finalLastActivity = lastMessage?.createdAt || userLastActivity
          
          console.log(`📊 User ${user.name} final last activity:`, finalLastActivity)

          const result = {
            ...user.toObject(),
            chatHistory: {
              totalChats: chats.length,
              totalMessages,
              lastActivity: finalLastActivity,
              ambassadors: ambassadors,
              recentChats: chats.slice(0, 3) // Last 3 chats
            }
          }

          console.log(`✅ Final result for ${user.name}:`, {
            totalChats: result.chatHistory.totalChats,
            totalMessages: result.chatHistory.totalMessages,
            ambassadors: result.chatHistory.ambassadors.length,
            lastActivity: result.chatHistory.lastActivity
          })

          return result
        } catch (error) {
          console.error(`Error fetching chat history for user ${user._id}:`, error)
          return {
            ...user.toObject(),
            chatHistory: {
              totalChats: 0,
              totalMessages: 0,
              lastActivity: null,
              ambassadors: [],
              recentChats: []
            }
          }
        }
      })
    )

    console.log("🎯 Final response - Total users with chat history:", usersWithChatHistory.length)
    console.log("🎯 Users summary:", usersWithChatHistory.map(u => ({
      name: u.name,
      totalChats: u.chatHistory.totalChats,
      totalMessages: u.chatHistory.totalMessages,
      ambassadors: u.chatHistory.ambassadors.length
    })))

    res.status(200).json(respo(true, "Users with chat history fetched", usersWithChatHistory))
  } catch (err) {
    console.error("❌ Error in getAllUsersWithChatHistory:", err)
    next(err)
  }
}

 
 