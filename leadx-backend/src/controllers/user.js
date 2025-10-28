import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { Op } from "sequelize"
import { User, userValidationSchema } from "../models/user.js"
import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import Reward from "../models/Reward.js"
import { sequelize as db } from "../config/db.js"
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

    const existingUser = await User.findOne({ where: { email: value.email } })
    if (existingUser) {
      console.log("❌ User already exists:", value.email)
      return next(errGen(400, "User already exists"))
    }

    // Hash password
    value.password = await bcrypt.hash(value.password, 10)
    console.log("✅ Password hashed successfully")

    // Force default role = ambassador
    const newUser = await User.create({ ...value, role: "ambassador" })
    console.log("✅ User created successfully:", newUser.id)

    const safeUser = {
      id: newUser.id,
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
    console.log("🔍 Login attempt for email:", email)
    console.log("🔍 Login password provided:", password ? "Yes" : "No")

    if (!email || !password)
      return next(errGen(400, "Email and password are required"))

    const user = await User.findOne({ where: { email } })
    if (!user) {
      console.log("❌ User not found for email:", email)
      return next(errGen(404, "User not found"))
    }

    console.log("🔍 User found:", user.id, "Role:", user.role)
    console.log(
      "🔍 User password hash:",
      user.password
        ? user.password.substring(0, 20) + "..."
        : "No password stored"
    )
    console.log("🔍 Login attempt password:", password)
    console.log("🔍 User has password field:", !!user.password)

    const isMatch = await bcrypt.compare(password, user.password)
    console.log("🔍 Password match result:", isMatch)

    if (!isMatch) {
      console.log("❌ Invalid credentials for email:", email)
      return next(errGen(400, "Invalid credentials"))
    }

    console.log("✅ Login successful for:", email)

    const token = JWT.sign(
      { id: user.id, role: user.role },
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

        // 🌐 Fetch IP geo info for ambassadors only
        if (user.role === "ambassador" && ip) {
          const apiKey =
            process.env.IPDATA_API_KEY ||
            "a15111aa6cea99eb45b31303978093a58b64d26b1dfb90b7077e9d69"

          console.log(`🌐 Fetching location for IP: ${ip}`)

          // For localhost, try to get real external IP first
          let targetIp = ip
          if (isLocalIp || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
            try {
              console.log('🌐 Localhost detected, fetching real external IP...')
              // Get real external IP
              const ipResponse = await fetch('https://api.ipify.org?format=json')
              const ipData = await ipResponse.json()
              targetIp = ipData.ip
              console.log(`🌐 Real external IP detected: ${targetIp}`)
            } catch (ipErr) {
              console.log('⚠️ Could not get external IP, using localhost IP')
              targetIp = ip
            }
          }

          try {
            const response = await fetch(
              `https://api.ipdata.co/${targetIp}?api-key=${apiKey}`
            )

            if (response.ok) {
              const data = await response.json()
              console.log("📍 Location data from ipdata:", data)

              // Use real location data
              region = data.region || data.state || ""
              city = data.city || ""
              isp = data.asn?.name || data.carrier?.name || data.organisation || ""

              // If still no location data, try alternative API
              if (!city && !region) {
                try {
                  console.log('🌐 Trying alternative location API...')
                  const altResponse = await fetch(`http://ip-api.com/json/${targetIp}`)
                  if (altResponse.ok) {
                    const altData = await altResponse.json()
                    console.log("📍 Alternative API response:", altData)
                    
                    if (altData.status === 'success') {
                      region = altData.regionName || altData.state || ""
                      city = altData.city || ""
                      isp = altData.isp || altData.org || ""
                    }
                  }
                } catch (altErr) {
                  console.log('⚠️ Alternative API also failed:', altErr.message)
                }
              }

              console.log(`📍 Final location: ${city}, ${region} | ISP: ${isp}`)

            } else {
              console.error("❌ ipdata error:", await response.text())
              // Try alternative API if ipdata fails
              try {
                console.log('🌐 ipdata failed, trying alternative API...')
                const altResponse = await fetch(`http://ip-api.com/json/${targetIp}`)
                if (altResponse.ok) {
                  const altData = await altResponse.json()
                  console.log("📍 Alternative API response:", altData)
                  
                  if (altData.status === 'success') {
                    region = altData.regionName || altData.state || ""
                    city = altData.city || ""
                    isp = altData.isp || altData.org || ""
                    console.log(`📍 Alternative location: ${city}, ${region} | ISP: ${isp}`)
                  } else {
                    region = ""
                    city = ""
                    isp = ""
                  }
                } else {
                  region = ""
                  city = ""
                  isp = ""
                }
              } catch (altErr) {
                console.log('⚠️ Alternative API also failed:', altErr.message)
                region = ""
                city = ""
                isp = ""
              }
            }
          } catch (err) {
            console.error("⚠️ Location fetch failed:", err)
            // Try alternative API as fallback
            try {
              console.log('🌐 Primary API failed, trying alternative...')
              const altResponse = await fetch(`http://ip-api.com/json/${targetIp}`)
              if (altResponse.ok) {
                const altData = await altResponse.json()
                if (altData.status === 'success') {
                  region = altData.regionName || altData.state || ""
                  city = altData.city || ""
                  isp = altData.isp || altData.org || ""
                  console.log(`📍 Fallback location: ${city}, ${region} | ISP: ${isp}`)
                } else {
                  region = ""
                  city = ""
                  isp = ""
                }
              } else {
                region = ""
                city = ""
                isp = ""
              }
            } catch (fallbackErr) {
              console.log('⚠️ All location APIs failed:', fallbackErr.message)
              region = ""
              city = ""
              isp = ""
            }
          }
        }

    // 📦 Save login history
    await LoginHistory.create({
      userId: user.id,
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
      id: user.id,
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
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })
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
    let whereClause = { role: "ambassador" }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      }
    }

    const ambassadors = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] }
    })
    res.status(200).json(respo(true, "All Ambassadors fetched", ambassadors))
  } catch (err) {
    next(err)
  }
}

// 👥 Get Verified Ambassadors (Admin only)
export const getVerifiedAmbassadors = async (req, res, next) => {
  try {
    const { search = "" } = req.query
    let whereClause = { 
      role: "ambassador",
      isVerified: true
    }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      }
    }

    console.log(
      "🔍 getVerifiedAmbassadors query:",
      JSON.stringify(whereClause, null, 2)
    )

    const ambassadors = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] }
    })
    
    console.log("🔍 Found ambassadors count:", ambassadors.length)
    console.log(
      "🔍 Ambassadors details:",
      ambassadors.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        isVerified: a.isVerified,
        role: a.role,
      }))
    )

    // Use hasReward field from database (no need to calculate)
    const ambassadorsWithRewards = ambassadors.map((ambassador) => ({
      ...ambassador.toJSON(),
      hasReward: ambassador.hasReward || false,
    }))

    console.log(
      "getVerifiedAmbassadors - Ambassadors with reward status:",
      ambassadorsWithRewards.map((a) => ({
        name: a.name,
        hasReward: a.hasReward,
        isVerified: a.isVerified,
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
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    })
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
    console.log("🔍 updateUser called with id:", id)
    console.log("🔍 Request body:", req.body)

    // Create a custom validation schema for updates that doesn't apply defaults
    const updateValidationSchema = userValidationSchema
      .fork(["password", "email", "name", "phone"], (schema) =>
        schema.optional()
      )
      .fork(["password"], (schema) => schema.min(6).optional())
      .fork(["isVerified", "hasReward", "status"], (schema) =>
        schema.optional()
      )
      .options({ stripUnknown: true, abortEarly: false })

    const { error, value } = updateValidationSchema.validate(req.body)

    if (error) return next(errGen(400, error.details[0].message))

    console.log("🔍 Validated value:", value)
    console.log("🔍 Password in value:", value.password)
    console.log("🔍 Status in value:", value.status)
    console.log("🔍 Raw request body status:", req.body.status)

    // Handle password field properly
    if (value.password && value.password.trim() !== "") {
      console.log("🔍 Hashing password...")
      const oldPassword = value.password
      value.password = await bcrypt.hash(value.password, 10)
      console.log("🔍 Password hashed successfully")
      console.log("🔍 Original password:", oldPassword)
      console.log(
        "🔍 Hashed password:",
        value.password.substring(0, 20) + "..."
      )
    } else {
      console.log("🔍 No password provided or empty, removing from update")
      // Remove password from value if it's empty or undefined
      delete value.password
    }

    console.log("🔍 Final value to update:", value)

    // 🔒 Preserve critical fields that shouldn't be changed during admin update
    // Note: status is now editable by admin to activate/deactivate ambassadors
    const fieldsToPreserve = ["isVerified", "hasReward", "role"]
    const currentUser = await User.findByPk(id)
    if (!currentUser) return next(errGen(404, "User not found"))

    console.log("🔍 Current user before update:", {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      isVerified: currentUser.isVerified,
      hasReward: currentUser.hasReward,
      status: currentUser.status,
    })

    // Preserve critical fields - ONLY preserve these, NOT status
    fieldsToPreserve.forEach((field) => {
      // Only preserve isVerified, hasReward, and role
      value[field] = currentUser[field]
      console.log(`🔒 Preserved ${field}:`, currentUser[field])
    })

    // If status is not provided in the request, keep the current status
    if (value.status === undefined) {
      value.status = currentUser.status
      console.log(
        "🔍 Status not provided, keeping current status:",
        currentUser.status
      )
    } else {
      console.log(
        "🔍 Status provided, updating from",
        currentUser.status,
        "to",
        value.status
      )
    }

    console.log("🔍 Final value before update:", value)
    console.log("🔍 Status in final value:", value.status)

    const user = await User.findByPk(id)
    if (!user) return next(errGen(404, "User not found"))
    
    await user.update(value)
    await user.reload({ attributes: { exclude: ['password'] } })

    console.log("🔍 User updated successfully:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      hasReward: user.hasReward,
      status: user.status,
    })

    console.log("🔍 Sending response with status:", user.status)
    console.log("🔍 Full user object:", user)

    res.status(200).json(respo(true, "User updated", user))
  } catch (err) {
    console.error("❌ Error in updateUser:", err)
    next(err)
  }
}

// ❌ Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return next(errGen(404, "User not found"))
    await user.destroy()
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

    const user = await User.findByPk(req.user.id)
    if (!user) return next(errGen(404, "User not found"))
    
    await user.update(updates)
    await user.reload({ attributes: { exclude: ['password'] } })

    res.status(200).json(respo(true, "Profile updated", user))
  } catch (err) {
    next(err)
  }
}

// 🔹 Forgot Password (Send Reset Code)
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return next(errGen(404, "User not found"))

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await user.update({
      resetCode: code,
      resetCodeExpires: new Date(Date.now() + 15 * 60 * 1000)
    })

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
    let whereClause = { role: "ambassador" }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      }
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] }
    })
    res.status(200).json(respo(true, "Ambassadors fetched", users))
  } catch (err) {
    next(err)
  }
}

// 🔹 Resend Reset Code
export const resendResetCode = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return next(errGen(404, "User not found"))

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await user.update({
      resetCode: code,
      resetCodeExpires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    })

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
    const user = await User.findOne({ where: { email } })
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
    const user = await User.findOne({ where: { email } })
    if (!user) return next(errGen(404, "User not found"))

    if (user.resetCode !== code || new Date() > user.resetCodeExpires) {
      return next(errGen(400, "Invalid or expired reset code"))
    }

    await user.update({
      password: await bcrypt.hash(newPassword, 10),
      resetCode: null,
      resetCodeExpires: null
    })

    res.status(200).json(respo(true, "Password reset successfully"))
  } catch (err) {
    next(err)
  }
}

// 🔹 Delete Own Account
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return next(errGen(404, "User not found"))
    await user.destroy()

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

    const existingUser = await User.findOne({ where: { email: value.email } })
    if (existingUser) return next(errGen(400, "User already exists"))

    value.password = await bcrypt.hash(value.password, 10)

    const newAdmin = await User.create({
      ...value,
      role: "admin", // forced to admin
    })

    const safeUser = {
      id: newAdmin.id,
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

    const user = await User.findByPk(id)
    if (!user) return next(errGen(404, "User not found"))

    if (user.role !== "ambassador") {
      return next(errGen(400, "User is not an ambassador"))
    }

    await user.update({ isVerified: true })

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

    const user = await User.findByPk(id)
    if (!user) return next(errGen(404, "User not found"))

    if (user.role !== "ambassador") {
      return next(errGen(400, "User is not an ambassador"))
    }

    await user.update({ isVerified: false })

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

    // Get only verified and active ambassadors with all necessary fields for AmbassadorCard UI
    const ambassadors = await User.findAll({
      where: {
        role: "ambassador",
        isVerified: true,
        status: "active", // ✅ Only active ambassadors will be shown
      },
      attributes: [
        "id", "name", "email", "role", "course", "program", 
        "profileImage", "thumbnailImage", "country", "state", 
        "languages", "about", "createdAt", "status", "isVerified"
      ]
    })

    console.log(
      `✅ Found ${ambassadors.length} public ambassadors (active only)`
    )
    console.log(
      "🔍 Public ambassadors status:",
      ambassadors.map((a) => ({
        name: a.name,
        status: a.status,
        isVerified: a.isVerified,
      }))
    )

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

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      console.log("✅ User already exists, returning existing user")
      const safeUser = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        country: existingUser.country,
        state: existingUser.state,
        phone: existingUser.phone,
        alternatePhone: existingUser.alternativeMobile,
      }
      return res.status(200).json(respo(true, "User already exists", safeUser))
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("✅ Password hashed successfully")
    console.log("🔍 Original password:", password)
    console.log("🔍 Hashed password:", hashedPassword.substring(0, 20) + "...")

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

    console.log(
      "🔍 User created with password:",
      newUser.password ? "Yes" : "No"
    )
    console.log(
      "🔍 User password hash:",
      newUser.password
        ? newUser.password.substring(0, 20) + "..."
        : "No password"
    )

    console.log("✅ User auto-registered successfully:", newUser.id)

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      country: newUser.country,
      state: newUser.state,
      phone: newUser.phone,
      alternatePhone: newUser.alternativeMobile,
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
    console.log('🔍 getAmbassadorLogins called')
    
    // First get all login history records
    const logs = await LoginHistory.findAll({
      order: [['loginTime', 'DESC']],
      limit: 2000
    })

    console.log('📊 Total login records found:', logs.length)

    // Get user details for each login record
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        try {
          const user = await User.findByPk(log.userId, {
            attributes: ['id', 'name', 'email', 'role']
          })
          
          return {
            ...log.toJSON(),
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            } : null
          }
        } catch (error) {
          console.error('❌ Error fetching user for login record:', log.id, error)
          return {
            ...log.toJSON(),
            user: null
          }
        }
      })
    )

    // Filter only ambassador logins with location and ISP data
    const filtered = logsWithUsers.filter((log) => {
      return log.user?.role === "ambassador" && 
             log.city && 
             log.region && 
             log.isp
    })

    console.log('📊 Ambassador login records with location/ISP:', filtered.length)
    console.log('📋 Sample ambassador login:', filtered[0])

    res.status(200).json(respo(true, "Login history fetched", filtered))
  } catch (err) {
    console.error('❌ Error in getAmbassadorLogins:', err)
    next(err)
  }
}

// 👥 Get All Users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query
    let whereClause = { role: "user" }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { country: { [Op.like]: `%${search}%` } }
        ]
      }
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    })
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

    console.log("🔍 Ambassador updating user status:", userId, conversionStatus)

    if (!["pending", "converted", "enrolled"].includes(conversionStatus)) {
      return next(errGen(400, "Invalid conversion status"))
    }

    // Only allow ambassador to mark as 'converted', and admin to mark as 'enrolled'
    if (req.user.role === "ambassador" && conversionStatus === "enrolled") {
      return next(errGen(403, "Only admin can mark users as enrolled"))
    }

    const user = await User.findByPk(userId)
    if (!user) return next(errGen(404, "User not found"))

    // Prevent ambassador from changing enrolled users
    if (
      req.user.role === "ambassador" &&
      user.conversionStatus === "enrolled"
    ) {
      return next(errGen(403, "Cannot change status of enrolled users"))
    }

    if (user.role !== "user") {
      return next(errGen(400, "This is not a user account"))
    }

    // Update conversionStatus field with timestamp
    const updateData = { conversionStatus }
    
    if (conversionStatus === 'converted') {
      updateData.convertedAt = new Date()
      updateData.convertedBy = req.user.id
    } else if (conversionStatus === 'enrolled') {
      updateData.enrolledAt = new Date()
      updateData.enrolledBy = req.user.id
    }
    
    await user.update(updateData)

    // If admin enrolls a user, create a reward for the ambassador who converted them
    if (req.user.role === "admin" && conversionStatus === "enrolled") {
      try {
        // Find the chat where this user was converted by an ambassador
        const chats = await Chat.findAll({
          where: db.where(
            db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(user.id)),
            true
          )
        })

        // Find ambassador from chat participants
        let ambassadorId = null
        for (const chat of chats) {
          const participants = chat.participants || []
          for (const participantId of participants) {
            if (participantId !== user.id) {
              const participant = await User.findByPk(participantId)
              if (participant && participant.role === "ambassador") {
                ambassadorId = participant.id
                break
              }
            }
          }
          if (ambassadorId) break
        }

        // Create reward if ambassador found
        if (ambassadorId) {
          await Reward.create({
            ambassadorId: ambassadorId,
            amount: 1000, // Default reward amount
            currency: 'INR',
            status: 'pending',
            remarks: `Enrollment reward for converting ${user.name}`
          })
          console.log(`🎁 Reward created for ambassador ${ambassadorId} for enrolling user ${user.name}`)
        }
      } catch (rewardError) {
        console.error("❌ Error creating enrollment reward:", rewardError)
        // Don't fail the status update if reward creation fails
      }
    }

    console.log(`✅ User ${user.name} status updated to: ${conversionStatus}`)

    res.status(200).json(
      respo(true, "User status updated successfully", {
        _id: user.id,
        name: user.name,
        email: user.email,
        conversionStatus: user.conversionStatus,
        convertedAt: user.convertedAt,
        convertedBy: user.convertedBy,
        enrolledAt: user.enrolledAt,
        enrolledBy: user.enrolledBy,
      })
    )
  } catch (err) {
    console.error("❌ Error updating user status:", err)
    next(err)
  }
}

// 👥 Get All Users with Chat History and Ambassador Details (Admin only)
export const getAllUsersWithChatHistory = async (req, res, next) => {
  try {
    console.log("🔍 getAllUsersWithChatHistory called")
    const { search = "" } = req.query
    console.log("🔍 Search query:", search)

    let whereClause = { role: "user" }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { country: { [Op.like]: `%${search}%` } }
        ]
      }
    }

    console.log("🔍 Database query:", JSON.stringify(whereClause, null, 2))

    // Get users with their chat history and ambassador details
    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    })

    console.log("📊 Found users:", users.length)
    console.log(
      "📊 Users details:",
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }))
    )

    // For each user, get their chat history and ambassador details
    const usersWithChatHistory = await Promise.all(
      users.map(async (user) => {
        try {
          console.log(`🔍 Processing user: ${user.name} (${user.id})`)

          // Get all chats for this user using JSON_CONTAINS
          const chats = await Chat.findAll({
            where: db.where(
              db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(user.id)),
              true
            )
          })

          // Manually populate participants for each chat
          const populatedChats = await Promise.all(
            chats.map(async (chat) => {
              const participantIds = chat.participants
              const participants = await User.findAll({
                where: { id: participantIds },
                attributes: ['id', 'name', 'email', 'role', 'profileImage']
              })
              
              return {
                ...chat.toJSON(),
                participants: participants
              }
            })
          )

          console.log(`📊 User ${user.name} has ${populatedChats.length} chats`)
          console.log(
            `📊 Chats for ${user.name}:`,
            populatedChats.map((c) => ({
              id: c.id,
              participants: c.participants?.length,
              lastMessage: c.lastMessage?.content,
            }))
          )

          // Extract unique ambassadors from chats
          const ambassadors = []
          const ambassadorIds = new Set()

          console.log(
            `🔍 Processing ${populatedChats.length} chats for user ${user.name}`
          )

          populatedChats.forEach((chat, chatIndex) => {
            console.log(`🔍 Chat ${chatIndex + 1}:`, {
              id: chat.id,
              participants: chat.participants?.length || 0,
              participantDetails: chat.participants?.map((p) => ({
                id: p.id,
                name: p.name,
                role: p.role,
              })),
            })

            chat.participants.forEach((participant, partIndex) => {
              console.log(`🔍 Participant ${partIndex + 1}:`, {
                id: participant.id,
                name: participant.name,
                role: participant.role,
                isAmbassador: participant.role === "ambassador",
                alreadyAdded: ambassadorIds.has(participant.id.toString()),
              })

              if (
                participant &&
                participant.role === "ambassador" &&
                !ambassadorIds.has(participant.id.toString())
              ) {
                console.log(`✅ Adding ambassador: ${participant.name}`)
                ambassadors.push({
                  id: participant.id,
                  name: participant.name,
                  email: participant.email,
                  profileImage: participant.profileImage,
                })
                ambassadorIds.add(participant.id.toString())
              }
            })
          })

          console.log(
            `📊 Final ambassadors for ${user.name}:`,
            ambassadors.map((a) => a.name)
          )

          // Get total messages count for this user
          const totalMessages = await Message.count({
            where: {
              [Op.or]: [
                { senderId: user.id },
                { receiverId: user.id }
              ]
            }
          })

          console.log(
            `📊 User ${user.name} has ${totalMessages} total messages`
          )

          // Get last activity (last message time)
          const lastMessage = await Message.findOne({
            where: {
              [Op.or]: [
                { senderId: user.id },
                { receiverId: user.id }
              ]
            },
            order: [['createdAt', 'DESC']]
          })

          console.log(
            `📊 User ${user.name} last message:`,
            lastMessage
              ? {
                  content: lastMessage.content,
                  createdAt: lastMessage.createdAt,
                  senderId: lastMessage.senderId,
                }
              : "No messages"
          )

          // Also check last activity from user's updatedAt field
          const userLastActivity = user.updatedAt || user.createdAt
          const finalLastActivity = lastMessage?.createdAt || userLastActivity

          console.log(
            `📊 User ${user.name} final last activity:`,
            finalLastActivity
          )

          const result = {
            ...user.toJSON(),
            chatHistory: {
              totalChats: populatedChats.length,
              totalMessages,
              lastActivity: finalLastActivity,
              ambassadors: ambassadors,
              recentChats: populatedChats.slice(0, 3), // Last 3 chats
            },
          }

          console.log(`✅ Final result for ${user.name}:`, {
            totalChats: result.chatHistory.totalChats,
            totalMessages: result.chatHistory.totalMessages,
            ambassadors: result.chatHistory.ambassadors.length,
            lastActivity: result.chatHistory.lastActivity,
          })

          return result
        } catch (error) {
          console.error(
            `Error fetching chat history for user ${user.id}:`,
            error
          )
          return {
            ...user.toJSON(),
            chatHistory: {
              totalChats: 0,
              totalMessages: 0,
              lastActivity: null,
              ambassadors: [],
              recentChats: [],
            },
          }
        }
      })
    )

    console.log(
      "🎯 Final response - Total users with chat history:",
      usersWithChatHistory.length
    )
    console.log(
      "🎯 Users summary:",
      usersWithChatHistory.map((u) => ({
        name: u.name,
        totalChats: u.chatHistory.totalChats,
        totalMessages: u.chatHistory.totalMessages,
        ambassadors: u.chatHistory.ambassadors.length,
      }))
    )

    res
      .status(200)
      .json(
        respo(true, "Users with chat history fetched", usersWithChatHistory)
      )
  } catch (err) {
    console.error("❌ Error in getAllUsersWithChatHistory:", err)
    next(err)
  }
}

// 📊 Get User Dashboard Data
export const getUserDashboard = async (req, res, next) => {
  try {
    console.log("🔍 getUserDashboard called")
    console.log("🔍 req.user:", JSON.stringify(req.user, null, 2))
    console.log("🔍 req.user.id:", req.user?.id)
    console.log("🔍 typeof req.user.id:", typeof req.user?.id)
    
    const userId = req.user?.id
    console.log("🔍 Fetching dashboard data for user:", userId)

    if (!userId) {
      console.log("❌ User ID is missing or undefined")
      return res.status(400).json({
        success: false,
        message: "Invalid user ID - User ID is missing from token"
      })
    }

    // Verify user exists
    const userExists = await User.findByPk(userId)
    if (!userExists) {
      console.log("❌ User not found in database:", userId)
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    console.log("✅ User found:", userExists.name, userExists.email)

    // Get user's chats using Sequelize
    const userChats = await Chat.findAll({
      where: db.where(
        db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(userId)),
        true
      ),
      order: [['updatedAt', 'DESC']]
    })

    console.log("🔍 User chats found:", userChats.length)

    // Get total messages count
    const chatIds = userChats.map((chat) => chat.id)
    let totalMessages = 0
    if (chatIds.length > 0) {
      totalMessages = await Message.count({
        where: {
          chatId: chatIds
        }
      })
    }

    console.log("🔍 Total messages:", totalMessages)

    // Populate participants for each chat
    const populatedChats = await Promise.all(
      userChats.map(async (chat) => {
        const participantIds = chat.participants
        const participants = await User.findAll({
          where: { id: participantIds },
          attributes: ['id', 'name', 'email', 'role', 'profileImage']
        })
        
        return {
          ...chat.toJSON(),
          participants: participants
        }
      })
    )

    // Get unique ambassadors from chats
    const ambassadorSet = new Set()
    populatedChats.forEach((chat) => {
      chat.participants.forEach((participant) => {
        if (participant.role === "ambassador" && participant.id.toString() !== userId.toString()) {
          ambassadorSet.add(participant.id.toString())
        }
      })
    })

    console.log("🔍 Unique ambassadors:", ambassadorSet.size)

    // Get last activity (most recent message)
    let lastActivity = null
    if (chatIds.length > 0) {
      const lastMessage = await Message.findOne({
        where: {
          chatId: chatIds
        },
        order: [['createdAt', 'DESC']]
      })
      lastActivity = lastMessage?.createdAt || null
    }

    // Prepare recent chats with ambassador info
    const recentChats = populatedChats.slice(0, 5).map((chat) => {
      // Find the ambassador in participants (the one who is not the current user)
      const ambassador = chat.participants.find(
        (p) => p.role === "ambassador" && p.id.toString() !== userId.toString()
      )

      return {
        chatId: chat.id,
        id: chat.id,
        ambassador: ambassador ? {
          id: ambassador.id,
          _id: ambassador.id,
          name: ambassador.name,
          email: ambassador.email,
          profileImage: ambassador.profileImage,
        } : null,
        lastMessage: "No messages yet", // We'll need to get this from Message model
        unreadCount: 0, // TODO: Implement unread count logic
        updatedAt: chat.updatedAt,
      }
    })

    const dashboardData = {
      stats: {
        totalAmbassadors: ambassadorSet.size,
        totalChats: populatedChats.length,
        totalMessages: totalMessages,
        lastActivity: lastActivity,
      },
      recentChats: recentChats,
    }

    console.log("✅ Dashboard data prepared:", dashboardData)

    res.status(200).json(respo(true, "Dashboard data fetched", dashboardData))
  } catch (err) {
    console.error("❌ Error in getUserDashboard:", err)
    next(err)
  }
}

// 📊 Get Ambassador Dashboard Data
export const getAmbassadorDashboard = async (req, res, next) => {
  try {
    console.log("🔍 getAmbassadorDashboard - User ID:", req.user.id)
    console.log("🔍 getAmbassadorDashboard - User role:", req.user.role)
    console.log("🔍 getAmbassadorDashboard - Full user object:", req.user)

    // Check if user is ambassador
    if (req.user.role !== "ambassador") {
      console.log("❌ User is not ambassador, role:", req.user.role)
      return next(errGen(403, "Only ambassadors can access this dashboard"))
    }

    const ambassadorId = parseInt(req.user.id)
    console.log("🔍 Ambassador ID (parsed):", ambassadorId)

    // Get ambassador's chats using Sequelize
    console.log("🔍 Searching for chats with ambassadorId:", ambassadorId)
    
    const ambassadorChats = await Chat.findAll({
      where: db.where(
        db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(ambassadorId)),
        true
      ),
      order: [['updatedAt', 'DESC']]
    })

    console.log("🔍 Ambassador chats found:", ambassadorChats.length)

    // Populate participants for each chat
    const populatedChats = await Promise.all(
      ambassadorChats.map(async (chat) => {
        const participantIds = chat.participants
        const participants = await User.findAll({
          where: { id: participantIds },
          attributes: ['id', 'name', 'email', 'role', 'profileImage']
        })
        
        return {
          ...chat.toJSON(),
          participants: participants
        }
      })
    )

    console.log("🔍 Populated chats:", populatedChats.length)

    // Get total messages count for this ambassador
    const chatIds = populatedChats.map((chat) => chat.id)
    let totalMessages = 0
    if (chatIds.length > 0) {
      totalMessages = await Message.count({
        where: {
          chatId: chatIds
        }
      })
    }

    console.log("🔍 Total messages:", totalMessages)

    // Get unique users from chats (users who have chatted with this ambassador)
    const userSet = new Set()
    populatedChats.forEach((chat) => {
      chat.participants.forEach((participant) => {
        if (participant.role === "user" && participant.id.toString() !== ambassadorId.toString()) {
          userSet.add(participant.id.toString())
        }
      })
    })

    console.log("🔍 Unique users:", userSet.size)

    // Get this month's stats
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const thisMonthChats = await Chat.findAll({
      where: {
        [Op.and]: [
          db.where(
            db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(ambassadorId)),
            true
          ),
          {
            createdAt: {
              [Op.gte]: startOfMonth
            }
          }
        ]
      }
    })

    let thisMonthMessages = 0
    if (chatIds.length > 0) {
      thisMonthMessages = await Message.count({
        where: {
          chatId: chatIds,
          createdAt: {
            [Op.gte]: startOfMonth
          }
        }
      })
    }

    // Get last activity (most recent message)
    let lastActivity = null
    if (chatIds.length > 0) {
      const lastMessage = await Message.findOne({
        where: {
          chatId: chatIds
        },
        order: [['createdAt', 'DESC']]
      })
      lastActivity = lastMessage?.createdAt || null
    }

    // Prepare recent chats with user info
    const recentChats = populatedChats.slice(0, 5).map((chat) => {
      // Find the user in participants (the one who is not the current ambassador)
      const user = chat.participants.find(
        (p) => p.role === "user" && p.id.toString() !== ambassadorId.toString()
      )

      return {
        id: chat.id,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        } : null,
        lastMessage: "No messages yet", // We'll need to get this from Message model
        unreadCount: 0, // TODO: Implement unread count logic
        updatedAt: chat.updatedAt,
      }
    })

    const dashboardData = {
      stats: {
        totalUsers: userSet.size,
        totalChats: populatedChats.length,
        totalMessages: totalMessages,
        thisMonthChats: thisMonthChats.length,
        thisMonthMessages: thisMonthMessages,
        lastActivity: lastActivity,
      },
      recentChats: recentChats,
    }

    console.log("✅ Ambassador dashboard data prepared:", dashboardData)

    res.status(200).json(respo(true, "Ambassador dashboard data fetched", dashboardData))
  } catch (err) {
    console.error("❌ Error in getAmbassadorDashboard:", err)
    next(err)
  }
}
