import crypto from "crypto"
import { EmbedConfig } from "../models/EmbedConfig.js"
import { User } from "../models/user.js"
import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import { sequelize as db } from "../config/db.js"
import { Op } from "sequelize"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import bcrypt from "bcryptjs"

const genKey = () => crypto.randomBytes(12).toString("hex")

// Admin: Create embed config
export const createConfig = async (req, res, next) => {
  try {
    const {
      clientWebUrl,
      clientWebName,
      ambassadorIds = [],
      uiConfig = {},
      soldTo,
    } = req.body

    const configKey = genKey()

    const cfg = await EmbedConfig.create({
      configKey,
      clientWebUrl,
      clientWebName,
      ambassadorIds,
      uiConfig,
      status: true,
      createdBy: req.user.id,
      soldTo,
      history: soldTo
        ? [
            {
              clientName: soldTo.clientName,
              clientEmail: soldTo.clientEmail,
              websiteUrl: soldTo.websiteUrl,
              status: "active",
              notes: "Created and activated",
            },
          ]
        : [],
    })

    res.status(201).json(respo(true, "Embed config created", cfg))
  } catch (err) {
    next(err)
  }
}

// Admin: Update embed config
export const updateConfig = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body
    const cfg = await EmbedConfig.findByPk(id)
    if (!cfg) return next(errGen(404, "Config not found"))
    await cfg.update(updates)
    if (!cfg) return next(errGen(404, "Config not found"))
    res.status(200).json(respo(true, "Embed config updated", cfg))
  } catch (err) {
    next(err)
  }
}

// Admin: List configs
export const listConfigs = async (req, res, next) => {
  try {
    const list = await EmbedConfig.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.status(200).json(respo(true, "Embed configs fetched", list))
  } catch (err) {
    next(err)
  }
}

// Admin: Toggle status
export const toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const cfg = await EmbedConfig.findByPk(id)
    if (!cfg) return next(errGen(404, "Config not found"))
    cfg.status = !cfg.status
    cfg.history.push({
      clientName: cfg.soldTo?.clientName,
      clientEmail: cfg.soldTo?.clientEmail,
      websiteUrl: cfg.soldTo?.websiteUrl,
      status: cfg.status ? "active" : "inactive",
      notes: cfg.status ? "Activated" : "Deactivated",
      deactivatedAt: cfg.status ? undefined : new Date(),
    })
    await cfg.save()
    res.status(200).json(respo(true, "Status toggled", cfg))
  } catch (err) {
    next(err)
  }
}

// Admin: Record sale
export const recordSale = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      clientName,
      clientEmail,
      websiteUrl,
      status = "active",
      notes,
    } = req.body

    const cfg = await EmbedConfig.findByPk(id)
    if (!cfg) return next(errGen(404, "Config not found"))

    cfg.soldTo = { clientName, clientEmail, websiteUrl }
    cfg.status = status === "active"
    cfg.history.push({ clientName, clientEmail, websiteUrl, status, notes })
    await cfg.save()

    res.status(200).json(respo(true, "Sale recorded", cfg))
  } catch (err) {
    next(err)
  }
}

// Admin: Sales history
export const salesHistory = async (req, res, next) => {
  try {
    const list = await EmbedConfig.findAll({
      attributes: ['configKey', 'clientWebName', 'soldTo', 'history', 'status', 'createdAt']
    })
    res.status(200).json(respo(true, "Sales history fetched", list))
  } catch (err) {
    next(err)
  }
}

// Public: Serve JS widget by configKey
export const serveWidget = async (req, res, next) => {
  try {
    const { configKey } = req.params
    const cfg = await EmbedConfig.findOne({ 
      where: { configKey, status: true }
    })
    if (!cfg) return next(errGen(404, "Invalid or inactive widget"))

    // Build dynamic JS, using the API origin from this request
    const apiBase = `${req.protocol}://${req.get("host")}`

    const script = `(() => {
  const API_BASE = window.LEADX_API_BASE || '${apiBase}';
  const CONFIG_KEY = '${configKey}';
  const UI = ${JSON.stringify(cfg.uiConfig || {})};
  // Determine FRONTEND_BASE; allow host page to override.
  const FRONTEND_BASE = window.LEADX_FRONTEND_BASE || API_BASE;

  // Insert iframe inline (at script tag position)
  const scriptEl = document.currentScript;
  const mount = document.createElement('div');
  mount.style.width = '100%';
  const iframe = document.createElement('iframe');
  iframe.src = FRONTEND_BASE + '/embed/view/' + CONFIG_KEY;
  iframe.style.width = '100%';
  iframe.style.minHeight = '800px';
  iframe.style.border = '0';
  iframe.loading = 'lazy';
  mount.appendChild(iframe);
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.insertBefore(mount, scriptEl.nextSibling);
  } else {
    document.body.appendChild(mount);
  }
})();
    `

    res.setHeader("Content-Type", "application/javascript; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=600")
    return res.status(200).send(script)
  } catch (err) {
    next(err)
  }
}

// Public: combined submit - auto register user and send message
export const publicSubmit = async (req, res, next) => {
  try {
    const { configKey, configId, ambassadorId, name, email, phone, message } =
      req.body
    if (!ambassadorId || !name || !email || !phone || !message) {
      return next(errGen(400, "Missing fields"))
    }

    // Handle both old configKey and new configId
    let cfg = null
    if (configKey) {
      cfg = await EmbedConfig.findOne({ 
        where: { configKey, status: true }
      })
    } else if (configId) {
      // Import CustomizationConfig here to avoid circular dependency
      const { CustomizationConfig } = await import(
        "../models/CustomizationConfig.js"
      )
      cfg = await CustomizationConfig.findOne({ 
        where: { configId, isActive: true }
      })
    }

    if (!cfg) return next(errGen(404, "Invalid or inactive widget"))

    const ambassador = await User.findByPk(ambassadorId)
    if (
      !ambassador ||
      ambassador.role !== "ambassador" ||
      !ambassador.isVerified
    ) {
      return next(errGen(404, "Ambassador not found or not verified"))
    }

    // Auto-register or fetch
    let user = await User.findOne({ email })
    if (!user) {
      const hashed = await bcrypt.hash("123456", 10)
      user = await User.create({
        name,
        email,
        phone,
        password: hashed,
        role: "user",
        isVerified: true,
      })
    }

    // Find or create chat
    let chat = await Chat.findOne({
      where: {
        [Op.and]: [
          db.where(
            db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(user.id)),
            true
          ),
          db.where(
            db.fn('JSON_CONTAINS', db.col('participants'), JSON.stringify(ambassador.id)),
            true
          )
        ]
      }
    })
    if (!chat)
      chat = await Chat.create({ participants: [user.id, ambassador.id] })

    // Create message from user to ambassador
    const newMessage = await Message.create({
      chatId: chat.id,
      sender: user.id,
      receiver: ambassador.id,
      content: message,
      isFormSubmission: true,
    })

    chat.lastMessage = newMessage.id
    await chat.save()

    return res.status(201).json(
      respo(true, "Submitted successfully", {
        chatId: chat.id,
        messageId: newMessage.id,
      })
    )
  } catch (err) {
    next(err)
  }
}
