import Reward from "../models/Reward.js"
import { User } from "../models/user.js"
import { Op } from "sequelize"
import { sequelize as db } from "../config/db.js"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import Joi from "joi"
// Ensure associations are loaded
import "../models/index.js"

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
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can create rewards"))
    }

    const { error, value } = rewardValidationSchema.validate(req.body, {
      stripUnknown: true,
    })
    if (error) return next(errGen(400, error.details[0].message))

    // ✅ Check if ambassador exists
    const ambassador = await User.findByPk(value.ambassador)
    if (!ambassador) return next(errGen(404, "Ambassador not found"))

    if (ambassador.role !== "ambassador") {
      return next(errGen(400, "User is not an ambassador"))
    }

    // Set currency based on ambassador's country
    value.currency = ambassador.country === "India" ? "INR" : "USD"

    console.log("createReward - Creating reward with data:", value)

    const newReward = await Reward.create({
      ambassadorId: value.ambassador,
      amount: value.amount,
      currency: value.currency,
      status: value.status,
      remarks: value.remarks
    })
    console.log("createReward - Created reward:", newReward)

    // Get ambassador details
    const populatedReward = {
      ...newReward.toJSON(),
      ambassador: ambassador
    }

    console.log("createReward - Populated reward:", populatedReward)

    // Update ambassador's hasReward field to true
    await User.update({ hasReward: true }, { where: { id: value.ambassador } })
    console.log("createReward - Updated ambassador hasReward to true")

    res
      .status(201)
      .json(respo(true, "Reward created successfully", populatedReward))
  } catch (err) {
    next(err)
  }
}

// 📋 Get All Rewards (Admin only)
export const getAllRewards = async (req, res, next) => {
  try {
    console.log('🔍 getAllRewards called by user:', req.user?.email, 'role:', req.user?.role);
    
    if (req.user.role !== "admin") {
      return next(errGen(403, "Only admins can view all rewards"))
    }

    const { search = "", status = "", ambassador = "" } = req.query
    console.log('🔍 Query params:', { search, status, ambassador });

    // Build query
    const whereClause = {}

    if (status) whereClause.status = status
    if (ambassador) whereClause.ambassadorId = ambassador

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { remarks: { [Op.like]: `%${search}%` } },
        { amount: isNaN(search) ? null : Number(search) },
      ]
    }

    console.log('🔍 Where clause:', whereClause);

    // Get rewards without include to avoid association issues
    const rewards = await Reward.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    })

    console.log('✅ Found', rewards.length, 'rewards');

    // Manually populate ambassador data
    const rewardsWithAmbassadors = [];
    for (const reward of rewards) {
      const ambassador = await User.findByPk(reward.ambassadorId, {
        attributes: ['id', 'name', 'email', 'role', 'profileImage', 'phone', 'course', 'program', 'country', 'state']
      });
      
      rewardsWithAmbassadors.push({
        ...reward.toJSON(),
        ambassador: ambassador ? ambassador.toJSON() : null
      });
    }

    console.log('✅ getAllRewards successful, populated', rewardsWithAmbassadors.length, 'rewards with ambassadors');
    res.status(200).json(respo(true, "All rewards fetched", rewardsWithAmbassadors))
  } catch (err) {
    console.error('❌ getAllRewards error:', err.message);
    console.error('❌ Full error:', err);
    next(err)
  }
}

// 🎁 Get My Rewards (Ambassador and Admin)
export const getMyRewards = async (req, res, next) => {
  try {
    console.log("getMyRewards - Full user object:", req.user)
    console.log("getMyRewards - User role:", req.user.role)
    console.log("getMyRewards - User ID:", req.user.id)

    // Temporarily allow all authenticated users for debugging
    if (!req.user.role) {
      console.log("getMyRewards - No role found in user object")
      return next(errGen(403, "No role found in user object"))
    }

    console.log("getMyRewards - Role check passed. User role:", req.user.role)

    const { status = "" } = req.query

    // For admins, show all rewards. For ambassadors, show only their rewards
    const whereClause = req.user.role === "admin" ? {} : { ambassadorId: req.user.id }
    if (status) whereClause.status = status

    console.log("getMyRewards - User ID:", req.user.id)
    console.log("getMyRewards - User Role:", req.user.role)
    console.log("getMyRewards - Query:", whereClause)

    // Debug: Check all rewards in database
    const allRewards = await Reward.findAll({
      include: [
        {
          model: User,
          as: 'ambassador',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    })
    console.log("getMyRewards - All rewards in DB:", allRewards.length)
    console.log(
      "getMyRewards - All rewards:",
      allRewards.map((r) => ({
        id: r.id,
        ambassador: r.ambassador,
        ambassadorId: r.ambassador.id,
      }))
    )

    const rewards = await Reward.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'ambassador',
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'course', 'program', 'country', 'state']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    console.log("getMyRewards - Found rewards:", rewards.length)
    console.log("getMyRewards - Rewards:", rewards)

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

    const stats = await Reward.findAll({
      attributes: [
        'status',
        [db.fn('COUNT', db.col('id')), 'count'],
        [db.fn('SUM', db.col('amount')), 'totalAmount']
      ],
      group: ['status']
    })

    const totalRewards = await Reward.count()
    const totalAmount = await Reward.findAll({
      attributes: [
        [db.fn('SUM', db.col('amount')), 'total']
      ]
    })

    const ambassadorStats = await Reward.findAll({
      attributes: [
        'ambassadorId',
        [db.fn('COUNT', db.col('id')), 'totalRewards'],
        [db.fn('SUM', db.col('amount')), 'totalAmount']
      ],
      group: ['ambassadorId'],
      include: [
        {
          model: User,
          as: 'ambassador',
          attributes: ['id', 'name', 'email']
        }
      ]
    })

    res.status(200).json(
      respo(true, "Reward statistics fetched", {
        statusBreakdown: stats,
        totalRewards,
        totalAmount: totalAmount[0]?.total || 0,
        topAmbassadors: ambassadorStats,
      })
    )
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

    const reward = await Reward.findByPk(id)
    if (!reward) return next(errGen(404, "Reward not found"))

    await reward.update(updateData)
    
    // Get ambassador details
    const ambassador = await User.findByPk(reward.ambassadorId, {
      attributes: ['id', 'name', 'email', 'role', 'profileImage']
    })
    
    const populatedReward = {
      ...reward.toJSON(),
      ambassador: ambassador
    }

    res.status(200).json(respo(true, "Reward status updated", populatedReward))
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

    const reward = await Reward.findByPk(req.params.id)
    if (!reward) return next(errGen(404, "Reward not found"))

    const ambassadorId = reward.ambassadorId
    await reward.destroy()

    // Check if ambassador has any other rewards
    const remainingRewards = await Reward.count({
      where: { ambassadorId: ambassadorId }
    })

    // Update ambassador's hasReward field based on remaining rewards
    await User.update(
      { hasReward: remainingRewards > 0 },
      { where: { id: ambassadorId } }
    )
    console.log(
      `deleteReward - Updated ambassador hasReward to ${
        remainingRewards > 0
      } (${remainingRewards} remaining rewards)`
    )

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

    const reward = await Reward.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'ambassador',
          attributes: ['id', 'name', 'email', 'role', 'profileImage', 'phone']
        }
      ]
    })

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
    const ambassador = await User.findByPk(ambassadorId)
    if (!ambassador) return next(errGen(404, "Ambassador not found"))

    const whereClause = { ambassadorId: ambassadorId }
    if (status) whereClause.status = status

    const rewards = await Reward.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'ambassador',
          attributes: ['id', 'name', 'email', 'role', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.status(200).json(
      respo(true, "Ambassador rewards fetched", {
        ambassador: {
          id: ambassador.id,
          name: ambassador.name,
          email: ambassador.email,
          profileImage: ambassador.profileImage,
        },
        rewards,
      })
    )
  } catch (err) {
    next(err)
  }
}
