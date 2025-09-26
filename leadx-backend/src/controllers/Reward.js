import Reward from "../models/Reward.js"
import { User } from "../models/user.js"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import Joi from "joi"

// 📋 Validation Schema for Reward
const rewardValidationSchema = Joi.object({
  ambassador: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid("INR", "USD").required(),
  status: Joi.string().valid("pending", "approved", "paid").default("pending"),
  remarks: Joi.string().allow(""),
})

// 🎁 Create Reward (Admin only)
export const createReward = async (req, res, next) => {
  try {
    // ✅ Check if user is admin or ambassador
    if (req.user.role !== "admin" && req.user.role !== "ambassador") {
      return next(errGen(403, "Only admins and ambassadors can create rewards"))
    }

    const { error, value } = rewardValidationSchema.validate(req.body, {
      stripUnknown: true,
    })
    if (error) return next(errGen(400, error.details[0].message))

    // ✅ Check if ambassador exists
    const ambassador = await User.findById(value.ambassador)
    if (!ambassador) return next(errGen(404, "Ambassador not found"))
    
    if (ambassador.role !== "ambassador") {
      return next(errGen(400, "User is not an ambassador"))
    }

    console.log('createReward - Creating reward with data:', value)
    
    const newReward = await Reward.create(value)
    console.log('createReward - Created reward:', newReward)
    
    // Populate ambassador details
    const populatedReward = await Reward.findById(newReward._id)
      .populate("ambassador", "name email role profileImage course program country state")
    
    console.log('createReward - Populated reward:', populatedReward)

    // Update ambassador's hasReward field to true
    await User.findByIdAndUpdate(value.ambassador, { hasReward: true })
    console.log('createReward - Updated ambassador hasReward to true')

    res.status(201).json(respo(true, "Reward created successfully", populatedReward))
  } catch (err) {
    next(err)
  }
}

// 📋 Get All Rewards (Admin only)
export const getAllRewards = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can view all rewards"))
    }

    const { search = "", status = "", ambassador = "" } = req.query
    
    // Build query
    const query = {}
    
    if (status) query.status = status
    if (ambassador) query.ambassador = ambassador
    
    // Search functionality
    if (search) {
      query.$or = [
        { remarks: { $regex: search, $options: "i" } },
        { amount: isNaN(search) ? null : Number(search) }
      ]
    }

    const rewards = await Reward.find(query)
      .populate("ambassador", "name email role profileImage phone course program country state")
      .sort({ createdAt: -1 })

    res.status(200).json(respo(true, "All rewards fetched", rewards))
  } catch (err) {
    next(err)
  }
}

// 🎁 Get My Rewards (Ambassador and Admin)
export const getMyRewards = async (req, res, next) => {
  try {
    console.log('getMyRewards - Full user object:', req.user)
    console.log('getMyRewards - User role:', req.user.role)
    console.log('getMyRewards - User ID:', req.user.id)
    
    // Temporarily allow all authenticated users for debugging
    if (!req.user.role) {
      console.log('getMyRewards - No role found in user object')
      return next(errGen(403, "No role found in user object"))
    }
    
    console.log('getMyRewards - Role check passed. User role:', req.user.role)

    const { status = "" } = req.query
    
    // For admins, show all rewards. For ambassadors, show only their rewards
    const query = req.user.role === "admin" ? {} : { ambassador: req.user.id }
    if (status) query.status = status

    console.log('getMyRewards - User ID:', req.user.id)
    console.log('getMyRewards - User Role:', req.user.role)
    console.log('getMyRewards - Query:', query)

    // Debug: Check all rewards in database
    const allRewards = await Reward.find({}).populate("ambassador", "name email role")
    console.log('getMyRewards - All rewards in DB:', allRewards.length)
    console.log('getMyRewards - All rewards:', allRewards.map(r => ({ id: r._id, ambassador: r.ambassador, ambassadorId: r.ambassador._id })))

    const rewards = await Reward.find(query)
      .populate("ambassador", "name email role profileImage course program country state")
      .sort({ createdAt: -1 })

    console.log('getMyRewards - Found rewards:', rewards.length)
    console.log('getMyRewards - Rewards:', rewards)

    res.status(200).json(respo(true, "Your rewards fetched", rewards))
  } catch (err) {
    next(err)
  }
}

// 📊 Get Reward Statistics (Admin only)
export const getRewardStats = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can view reward statistics"))
    }

    const stats = await Reward.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ])

    const totalRewards = await Reward.countDocuments()
    const totalAmount = await Reward.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])

    const ambassadorStats = await Reward.aggregate([
      {
        $group: {
          _id: "$ambassador",
          totalRewards: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "ambassador"
        }
      },
      {
        $unwind: "$ambassador"
      },
      {
        $project: {
          ambassadorName: "$ambassador.name",
          ambassadorEmail: "$ambassador.email",
          totalRewards: 1,
          totalAmount: 1
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ])

    res.status(200).json(respo(true, "Reward statistics fetched", {
      statusBreakdown: stats,
      totalRewards,
      totalAmount: totalAmount[0]?.total || 0,
      topAmbassadors: ambassadorStats
    }))
  } catch (err) {
    next(err)
  }
}

// ✏️ Update Reward Status (Admin only)
export const updateRewardStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can update reward status"))
    }

    const { id } = req.params
    const { status, remarks } = req.body

    if (!status || !["pending", "approved", "paid"].includes(status)) {
      return next(errGen(400, "Valid status is required"))
    }

    const updateData = { status }
    if (remarks !== undefined) updateData.remarks = remarks

    const reward = await Reward.findByIdAndUpdate(id, updateData, { new: true })
      .populate("ambassador", "name email role profileImage")

    if (!reward) return next(errGen(404, "Reward not found"))

    res.status(200).json(respo(true, "Reward status updated", reward))
  } catch (err) {
    next(err)
  }
}

// ❌ Delete Reward (Admin only)
export const deleteReward = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can delete rewards"))
    }

    const reward = await Reward.findByIdAndDelete(req.params.id)
    if (!reward) return next(errGen(404, "Reward not found"))

    // Check if ambassador has any other rewards
    const remainingRewards = await Reward.countDocuments({ ambassador: reward.ambassador })
    
    // Update ambassador's hasReward field based on remaining rewards
    await User.findByIdAndUpdate(reward.ambassador, { hasReward: remainingRewards > 0 })
    console.log(`deleteReward - Updated ambassador hasReward to ${remainingRewards > 0} (${remainingRewards} remaining rewards)`)

    res.status(200).json(respo(true, "Reward deleted successfully"))
  } catch (err) {
    next(err)
  }
}

// 📋 Get Reward by ID (Admin only)
export const getRewardById = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can view reward details"))
    }

    const reward = await Reward.findById(req.params.id)
      .populate("ambassador", "name email role profileImage phone")

    if (!reward) return next(errGen(404, "Reward not found"))

    res.status(200).json(respo(true, "Reward fetched", reward))
  } catch (err) {
    next(err)
  }
}

// 🎁 Get Rewards by Ambassador (Admin only)
export const getRewardsByAmbassador = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can view ambassador rewards"))
    }

    const { ambassadorId } = req.params
    const { status = "" } = req.query

    // Check if ambassador exists
    const ambassador = await User.findById(ambassadorId)
    if (!ambassador) return next(errGen(404, "Ambassador not found"))

    const query = { ambassador: ambassadorId }
    if (status) query.status = status

    const rewards = await Reward.find(query)
      .populate("ambassador", "name email role profileImage")
      .sort({ createdAt: -1 })

    res.status(200).json(respo(true, "Ambassador rewards fetched", {
      ambassador: {
        id: ambassador._id,
        name: ambassador.name,
        email: ambassador.email,
        profileImage: ambassador.profileImage
      },
      rewards
    }))
  } catch (err) {
    next(err)
  }
}
