import crypto from "crypto"
import { EmbedConfig } from "../models/EmbedConfig.js"
import { User } from "../models/user.js"
import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import errGen from "../utils/errGen.js"
import respo from "../utils/respo.js"
import bcrypt from "bcryptjs"

const genKey = () => crypto.randomBytes(12).toString("hex")

// Admin: Create embed config
export const createConfig = async (req, res, next) => {
  try {
    const { clientWebUrl, clientWebName, ambassadorIds = [], uiConfig = {}, soldTo } = req.body

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
    const cfg = await EmbedConfig.findByIdAndUpdate(id, updates, { new: true })
    if (!cfg) return next(errGen(404, "Config not found"))
    res.status(200).json(respo(true, "Embed config updated", cfg))
  } catch (err) {
    next(err)
  }
}

// Admin: List configs
export const listConfigs = async (req, res, next) => {
  try {
    const list = await EmbedConfig.find().sort({ createdAt: -1 })
    res.status(200).json(respo(true, "Embed configs fetched", list))
  } catch (err) {
    next(err)
  }
}

// Admin: Toggle status
export const toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const cfg = await EmbedConfig.findById(id)
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
    const { clientName, clientEmail, websiteUrl, status = "active", notes } = req.body

    const cfg = await EmbedConfig.findById(id)
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
    const list = await EmbedConfig.find({}, { configKey: 1, clientWebName: 1, soldTo: 1, history: 1, status: 1, createdAt: 1 })
    res.status(200).json(respo(true, "Sales history fetched", list))
  } catch (err) {
    next(err)
  }
}

// Public: Serve JS widget by configKey
export const serveWidget = async (req, res, next) => {
  try {
    const { configKey } = req.params
    const cfg = await EmbedConfig.findOne({ configKey, status: true })
    if (!cfg) return next(errGen(404, "Invalid or inactive widget"))

    // Build dynamic JS, using the API origin from this request
    const apiBase = `${req.protocol}://${req.get("host")}`

    const script = `(() => {
  const API_BASE = window.LEADX_API_BASE || '${apiBase}';
  const CONFIG_KEY = '${configKey}';
  const UI = ${JSON.stringify(cfg.uiConfig || {})};

  const style = document.createElement('style');
  style.textContent = ` + "`" + `
  .leadx-button { position: fixed; bottom: 24px; ${cfg.uiConfig?.position === 'left' ? 'left' : 'right'}: 24px; background: ${cfg.uiConfig?.themeColor || '#4f46e5'}; color: #fff; border: none; padding: 12px 16px; border-radius: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); cursor: pointer; z-index: 99999; }
  .leadx-modal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); z-index: 100000; }
  .leadx-modal.open { display: flex; }
  .leadx-card { width: 92%; max-width: 420px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); font-family: system-ui, -apple-system, Segoe UI, Roboto; }
  .leadx-header { font-weight: 700; margin-bottom: 8px; }
  .leadx-amb-list { max-height: 160px; overflow: auto; margin-bottom: 12px; }
  .leadx-amb-item { display: flex; align-items: center; gap: 8px; padding: 6px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 8px; cursor: pointer; }
  .leadx-amb-item.selected { outline: 2px solid ${cfg.uiConfig?.themeColor || '#4f46e5'}; }
  .leadx-input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 8px; margin: 6px 0; }
  .leadx-submit { width: 100%; padding: 10px; background: ${cfg.uiConfig?.themeColor || '#4f46e5'}; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
  ` + "`" + `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'leadx-button';
  btn.textContent = UI.buttonText || 'Chat with Ambassador';
  document.body.appendChild(btn);

  const modal = document.createElement('div');
  modal.className = 'leadx-modal';
  modal.innerHTML = ` + "`" + `
    <div class="leadx-card">
      <div class="leadx-header">${cfg.uiConfig?.titleText || 'Ask our Ambassadors'}</div>
      <div id="leadx-amb-list" class="leadx-amb-list">Loading ambassadors...</div>
      <input id="leadx_name" placeholder="Your name" class="leadx-input"/>
      <input id="leadx_email" placeholder="Email" class="leadx-input"/>
      <input id="leadx_phone" placeholder="Phone" class="leadx-input"/>
      <textarea id="leadx_msg" placeholder="Your question" class="leadx-input" rows="3"></textarea>
      <button id="leadx_submit" class="leadx-submit">Send</button>
    </div>
  ` + "`" + `;
  document.body.appendChild(modal);

  let selectedAmb = null;
  const ambList = modal.querySelector('#leadx-amb-list');

  async function fetchAmbassadors() {
    try {
      const res = await fetch(API_BASE + '/api/auth/ambassadors/public');
      const data = await res.json();
      const ambassadors = (data?.data || []).filter(a => ${JSON.stringify((cfg.ambassadorIds || []).map(id=>id.toString()))}.includes(String(a._id)));
      if (!ambassadors.length) { ambList.textContent = 'No ambassadors available.'; return; }
      ambList.textContent = '';
      ambassadors.forEach(a => {
        const item = document.createElement('div');
        item.className = 'leadx-amb-item';
        item.innerHTML = '<img src="' + (a.profileImage || '') + '" onerror="this.style.display=\\'none\\'" width="32" height="32" style="border-radius:50%"/>' +
          ' <div><div style="font-weight:600">' + (a.name || '') + '</div><div style="font-size:12px;color:#666">' + (a.course || '') + '</div></div>';
        item.addEventListener('click', () => {
          document.querySelectorAll('.leadx-amb-item').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
          selectedAmb = a._id;
        });
        ambList.appendChild(item);
      })
    } catch (e) { ambList.textContent = 'Failed to load ambassadors'; }
  }

  btn.addEventListener('click', () => modal.classList.add('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open') });

  modal.querySelector('#leadx_submit').addEventListener('click', async () => {
    const name = modal.querySelector('#leadx_name').value.trim();
    const email = modal.querySelector('#leadx_email').value.trim();
    const phone = modal.querySelector('#leadx_phone').value.trim();
    const msg = modal.querySelector('#leadx_msg').value.trim();
    if (!selectedAmb) return alert('Please select an ambassador.');
    if (!name || !email || !phone || !msg) return alert('Please fill all fields.');

    try {
      const res = await fetch(API_BASE + '/api/embed/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configKey: CONFIG_KEY, ambassadorId: selectedAmb, name, email, phone, message: msg })
      });
      const data = await res.json();
      if (data?.success) {
        alert('Message submitted! We will contact you via email.');
        modal.classList.remove('open');
      } else {
        alert(data?.message || 'Failed to submit');
      }
    } catch (e) { alert('Network error'); }
  });

  fetchAmbassadors();
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
    const { configKey, ambassadorId, name, email, phone, message } = req.body
    if (!configKey || !ambassadorId || !name || !email || !phone || !message) {
      return next(errGen(400, "Missing fields"))
    }

    const cfg = await EmbedConfig.findOne({ configKey, status: true })
    if (!cfg) return next(errGen(404, "Invalid or inactive widget"))

    const ambassador = await User.findById(ambassadorId)
    if (!ambassador || ambassador.role !== "ambassador" || !ambassador.isVerified) {
      return next(errGen(404, "Ambassador not found or not verified"))
    }

    // Auto-register or fetch
    let user = await User.findOne({ email })
    if (!user) {
      const hashed = await bcrypt.hash("123456", 10)
      user = await User.create({ name, email, phone, password: hashed, role: "user", isVerified: true })
    }

    // Find or create chat
    let chat = await Chat.findOne({ participants: { $all: [user._id, ambassador._id] } })
    if (!chat) chat = await Chat.create({ participants: [user._id, ambassador._id] })

    // Create message from user to ambassador
    const newMessage = await Message.create({ chatId: chat._id, sender: user._id, receiver: ambassador._id, content: message, isFormSubmission: true })

    chat.lastMessage = newMessage._id
    await chat.save()

    return res.status(201).json(respo(true, "Submitted successfully", { chatId: chat._id, messageId: newMessage._id }))
  } catch (err) {
    next(err)
  }
}
