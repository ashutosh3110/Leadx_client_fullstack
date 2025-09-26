import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken"
import { User, userValidationSchema } from "../models/user.js"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import { sendEmail } from "../utils/mailer.js" // helper for email
import { LoginHistory } from "../models/LoginHistory.js"
import geoip from "geoip-lite"

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
    if (!email || !password)
      return next(errGen(400, "Email and password are required"))

    const user = await User.findOne({ email })
    if (!user) return next(errGen(404, "User not found"))

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return next(errGen(400, "Invalid credentials"))

    const token = JWT.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    )

    // Get IP properly
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      ""

    console.log("Detected IP:", ip)

    // Skip localhost IPs
    const isLocalIp =
      ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.")

    let region = ""
    let city = ""
    let isp = ""

    // If ambassador and IP is NOT local, fetch geo data from ipdata.co
    if (user.role === "ambassador" && ip) {
      try {
        const apiKey =
          process.env.IPDATA_API_KEY ||
          "a15111aa6cea99eb45b31303978093a58b64d26b1dfb90b7077e9d69"

        console.log(`Fetching ipdata for IP: ${ip}`)

        const response = await fetch(
          `https://api.ipdata.co/${ip}?api-key=${apiKey}`
        )

        if (response.ok) {
          const data = await response.json()
          console.log("ipdata response:", data)
          region = data.region_name || data.region || ""
          city = data.city || ""
          isp = data.asn?.name || data.carrier?.name || ""
        } else {
          console.error("ipdata response error:", await response.text())
        }
      } catch (err) {
        console.error("ipdata API fetch error:", err)
      }

      await LoginHistory.create({
        userId: user._id,
        ipAddress: ip,
        region,
        city,
        isp,
        loginTime: new Date(),
      })
      console.log("Login history saved")
    } else {
      console.log("Login history not saved due to local IP or role")
    }

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
    next(err)
  }
}

// export const loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body
//     if (!email || !password)
//       return next(errGen(400, "Email and password are required"))

//     const user = await User.findOne({ email })
//     if (!user) return next(errGen(404, "User not found"))

//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) return next(errGen(400, "Invalid credentials"))

//     const token = JWT.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_ACCESS_SECRET,
//       { expiresIn: "7d" }
//     )

//     const safeUser = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     }

//     res
//       .status(200)
//       .json(respo(true, "Login successful", { token, user: safeUser }))
//   } catch (err) {
//     next(err)
//   }
// }
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

    const ambassadors = await User.find(query).select("-password")

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

    const { error, value } = userValidationSchema
      .fork(["password", "email", "name"], (schema) => schema.optional())
      .validate(req.body, { stripUnknown: true })

    if (error) return next(errGen(400, error.details[0].message))

    if (value.password) value.password = await bcrypt.hash(value.password, 10)

    const user = await User.findByIdAndUpdate(id, value, { new: true }).select(
      "-password"
    )
    if (!user) return next(errGen(404, "User not found"))

    res.status(200).json(respo(true, "User updated", user))
  } catch (err) {
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

    // Get only verified ambassadors with basic info
    const ambassadors = await User.find({
      role: "ambassador",
      isVerified: true,
    }).select("name email course profileImage createdAt")

    console.log(`✅ Found ${ambassadors.length} public ambassadors`)

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
