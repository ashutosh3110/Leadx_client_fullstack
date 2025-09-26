import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useCustomization } from "../../context/CustomizationContext"
import { ambassadorAPI, embedAPI } from "../utils/apicopy"

const CustomizationForm = () => {
  const { customization, updateCustomization } = useCustomization()

  const [formData, setFormData] = useState({
    ...customization,
    url: "",
    webName: "",
    isActive: false,
    questions: [],
    clientName: "",
    apiBaseUrl: "http://localhost:5000",
  })

  const [colorFormat, setColorFormat] = useState({
    backgroundColor: "hex",
    textColor: "hex",
    chatBackgroundColor: "hex",
    chatTextColor: "hex",
    gradientColor: "hex",
  })

  const [generatedCode, setGeneratedCode] = useState("")
  const [ambassadors, setAmbassadors] = useState([])
  const [selectedAmbassadorIds, setSelectedAmbassadorIds] = useState([])
  const [salesHistory, setSalesHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Sync form data with context
  useEffect(() => {
    setFormData(customization)

    const newColorFormat = { ...colorFormat }
    ;[
      "backgroundColor",
      "textColor",
      "chatBackgroundColor",
      "chatTextColor",
      "gradientColor",
    ].forEach((field) => {
      if (customization[field] && customization[field].startsWith("rgb")) {
        newColorFormat[field] = "rgb"
      } else if (customization[field] && customization[field].startsWith("#")) {
        newColorFormat[field] = "hex"
      }
    })
    setColorFormat(newColorFormat)
  }, [customization])

  // Load ambassadors and existing sales history
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const ambRes = await ambassadorAPI.getAllAmbassadors()
        const ambs = Array.isArray(ambRes?.data)
          ? ambRes.data.filter((u) => u.role === "ambassador" && u.isVerified)
          : []
        setAmbassadors(ambs)

        const histRes = await embedAPI.salesHistory()
        setSalesHistory(Array.isArray(histRes?.data) ? histRes.data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), ""],
    }))
  }

  const handleQuestionChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? value : q)),
    }))
  }

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const handleColorFormatChange = (field, format) => {
    setColorFormat((prev) => ({ ...prev, [field]: format }))
    setFormData((prev) => ({
      ...prev,
      [field]: format === "hex" ? "#ffffff" : "rgb(255, 255, 255)",
    }))
  }

  const generateEmbeddableScript = (data) => {
    const clientId = `client_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`
    return `<!-- LeadX Ambassador Chat Widget -->
<!-- Client ID: ${clientId} -->
<!-- Generated: ${new Date().toISOString()} -->
<script>
(function() {
  const config = {
    clientId: "${clientId}",
    apiBaseUrl: "${data.apiBaseUrl || "http://localhost:5000"}",
    webUrl: "${data.webUrl || ""}",
    webName: "${data.webName || ""}",
    status: "${data.status || "active"}",
    policyUrl: "${data.policyUrl || ""}",
    termsUrl: "${data.termsUrl || ""}",
    questions: ${JSON.stringify(data.questions || [], null, 2)},
    tilesAndButtonColor: "${
      data.tilesAndButtonColor ||
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }",
    textColor: "${data.textColor || "#ffffff"}",
    borderColor: "${data.borderColor || "#e5e7eb"}",
    borderSize: "${data.borderSize || "3"}"
  };

  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'leadx-ambassador-widget';
  widgetContainer.innerHTML = \`
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div id="ambassador-cards" style="
        display: none;
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: white;
        border-radius: \${config.borderSize}px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        border: 1px solid \${config.borderColor};
      ">
      </div>
      <button id="chat-toggle" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: \${config.tilesAndButtonColor};
        color: \${config.textColor};
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        💬
      </button>
    </div>
  \`;

  async function loadAmbassadors() {
    try {
      const response = await fetch(\`\${config.apiBaseUrl}/api/ambassadors/public\`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const cardsContainer = document.getElementById('ambassador-cards');
        cardsContainer.innerHTML = data.data.map(ambassador => \`
          <div style="
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'"
          onclick="openChat('\${ambassador._id}', '\${ambassador.name}', '\${ambassador.email}')">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: \${config.tilesAndButtonColor};
                display: flex;
                align-items: center;
                justify-content: center;
                color: \${config.textColor};
                font-weight: bold;
              ">
                \${ambassador.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-weight: 600; color: #333;">\${ambassador.name}</div>
                <div style="font-size: 12px; color: #666;">\${ambassador.course || 'Student Ambassador'}</div>
              </div>
            </div>
          </div>
        \`).join('');
      }
    } catch (error) {
      console.error('Error loading ambassadors:', error);
    }
  }

  function openChat(ambassadorId, ambassadorName, ambassadorEmail) {
    const modal = document.createElement('div');
    modal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    modal.innerHTML = \`
      <div style="
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      ">
        <div style="padding: 20px; border-bottom: 1px solid #eee;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #333;">Chat with \${ambassadorName}</h3>
            <button onclick="this.closest('.modal').remove()" style="
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            ">×</button>
          </div>
        </div>
        <div style="padding: 20px;">
          <div id="chat-form">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Message *</label>
              <textarea name="message" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
                resize: vertical;
                min-height: 80px;
              " placeholder="Ask your question..."></textarea>
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Name *</label>
              <input type="text" name="name" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your name">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Email *</label>
              <input type="email" name="email" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your email">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500;">Your Mobile *</label>
              <input type="tel" name="mobile" required style="
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              " placeholder="Enter your mobile number">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="terms" required>
                <span style="font-size: 14px;">
                  I agree to the 
                  <a href="\${config.termsUrl}" target="_blank" style="color: #007bff;">Terms of Use</a> and 
                  <a href="\${config.policyUrl}" target="_blank" style="color: #007bff;">Privacy Policy</a>
                </span>
              </label>
            </div>
            <button type="submit" style="
              width: 100%;
              padding: 12px;
              background: \${config.tilesAndButtonColor};
              color: \${config.textColor};
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              transition: opacity 0.2s;
            " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              Send Message
            </button>
          </div>
        </div>
      </div>
    \`;
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    document.getElementById('chat-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        mobile: formData.get('mobile'),
        message: formData.get('message'),
        ambassadorId: ambassadorId,
        ambassadorName: ambassadorName,
        ambassadorEmail: ambassadorEmail
      };
      try {
        const response = await fetch(\`\${config.apiBaseUrl}/api/user/auto-register\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            password: '123456',
            role: 'user'
          })
        });
        if (response.ok) {
          const chatResponse = await fetch(\`\${config.apiBaseUrl}/api/chat/send\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ambassadorId: ambassadorId,
              message: userData.message,
              userEmail: userData.email
            })
          });
          if (chatResponse.ok) {
            alert('Message sent successfully! You will receive an email when the ambassador replies.');
            modal.remove();
          } else {
            alert('Error sending message. Please try again.');
          }
        } else {
          alert('Error registering user. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  document.getElementById('chat-toggle').addEventListener('click', function() {
    const cards = document.getElementById('ambassador-cards');
    cards.style.display = cards.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', function(e) {
    const widget = document.getElementById('leadx-ambassador-widget');
    const cards = document.getElementById('ambassador-cards');
    if (!widget.contains(e.target)) {
      cards.style.display = 'none';
    }
  });

  document.body.appendChild(widgetContainer);
  loadAmbassadors();
})();
</script>`
  }

  const ColorInput = ({ field, label, value }) => {
    const handleColorInputChange = (newValue) => {
      handleInputChange(field, newValue)
    }

    const handleColorInputKeyDown = (e) => {
      if (colorFormat[field] === "rgb") {
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.target.select()
          return
        }
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          e.target.selectionStart === 0 &&
          e.target.selectionEnd === e.target.value.length
        ) {
          e.preventDefault()
          handleColorInputChange("")
          return
        }
      }
    }

    const handleColorInputFocus = (e) => {
      if (colorFormat[field] === "rgb") {
        setTimeout(() => e.target.select(), 10)
      }
    }

    const handleColorPickerChange = (e) => {
      handleColorInputChange(e.target.value)
    }

    const clearColorInput = () => {
      handleColorInputChange("")
    }

    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
        <div className="flex space-x-2">
          <div className="flex space-x-1">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${field}-format`}
                checked={colorFormat[field] === "hex"}
                onChange={() => handleColorFormatChange(field, "hex")}
                className="mr-1 w-3 h-3 text-blue-600"
              />
              <span className="text-xs text-slate-600">HEX</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${field}-format`}
                checked={colorFormat[field] === "rgb"}
                onChange={() => handleColorFormatChange(field, "rgb")}
                className="mr-1 w-3 h-3 text-blue-600"
              />
              <span className="text-xs text-slate-600">RGB</span>
            </label>
          </div>
          <div className="flex-1 flex space-x-1">
            {colorFormat[field] === "hex" && (
              <div className="relative">
                <input
                  type="color"
                  value={value && value.startsWith("#") ? value : "#ffffff"}
                  onChange={handleColorPickerChange}
                  className="absolute opacity-0 w-10 h-8 cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    const colorInput = e.currentTarget.previousElementSibling
                    if (colorInput) colorInput.click()
                  }}
                  className="w-10 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center relative"
                  title="Click to open color picker"
                  style={{
                    minWidth: "40px",
                    minHeight: "32px",
                    backgroundColor:
                      value && value.startsWith("#") ? value : "#ffffff",
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-600 opacity-75"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 relative">
              <input
                type="text"
                value={value || ""}
                onChange={(e) => handleColorInputChange(e.target.value)}
                onKeyDown={handleColorInputKeyDown}
                onFocus={handleColorInputFocus}
                placeholder={
                  colorFormat[field] === "hex"
                    ? "#ffffff"
                    : "rgb(255, 255, 255)"
                }
                className="w-full p-2 pr-6 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
              />
              {value && (
                <button
                  type="button"
                  onClick={clearColorInput}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 flex items-center justify-center"
                  title="Clear color"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div
              className="w-8 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-slate-400 transition-colors flex-shrink-0"
              style={{
                backgroundColor: value || "#ffffff",
                minWidth: "32px",
                minHeight: "32px",
              }}
              title="Color preview - click to copy color"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (value) {
                  navigator.clipboard
                    .writeText(value)
                    .then(() => {
                      const originalTitle = e.target.title
                      e.target.title = "Color copied!"
                      setTimeout(() => (e.target.title = originalTitle), 1000)
                    })
                    .catch(() => {
                      console.log("Color value:", value)
                      const originalTitle = e.target.title
                      e.target.title = "Copy not supported"
                      setTimeout(() => (e.target.title = originalTitle), 1000)
                    })
                }
              }}
            ></div>
          </div>
        </div>
        {colorFormat[field] === "rgb" && (
          <div className="text-xs text-slate-500 mt-1">
            💡 Tip: Focus on the input and press Ctrl+A (or Cmd+A) to select
            all, then Delete to clear
          </div>
        )}
        {colorFormat[field] === "hex" && (
          <div className="text-xs text-slate-500 mt-1">
            🎨 Tip: Click the color square to open the color picker palette
          </div>
        )}
      </div>
    )
  }

  // Build final embeddable script tag using backend-served widget
  const buildCdnScriptTag = (apiBase, configKey) =>
    `<!-- LeadX Widget -->\n<script src="${apiBase}/api/embed/widget/${configKey}.js" async></script>`

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      updateCustomization(formData)
      const apiBase = formData.apiBaseUrl || import.meta.env.VITE_API_URL || ""

      const payload = {
        clientWebUrl: formData.webUrl,
        clientWebName: formData.webName,
        ambassadorIds: selectedAmbassadorIds,
        uiConfig: {
          themeColor: formData.tilesAndButtonColor || "#4f46e5",
          position: "right",
          buttonText: "Chat with Ambassador",
          titleText: "Ask our Ambassadors",
          logoUrl: "",
        },
        soldTo: {
          clientName: formData.clientName || formData.webName,
          clientEmail: formData.clientEmail || "",
          websiteUrl: formData.webUrl,
        },
      }

      const res = await embedAPI.createConfig(payload)
      if (res?.success) {
        const cfg = res.data
        const snippet = buildCdnScriptTag(apiBase, cfg.configKey)
        setGeneratedCode(snippet)
        toast.success("Embed script generated. Copy and share with client.")
        // refresh history
        const histRes = await embedAPI.salesHistory()
        setSalesHistory(Array.isArray(histRes?.data) ? histRes.data : [])
      } else {
        toast.error(res?.message || "Failed to create embed config")
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4"
      style={{ touchAction: "pan-y" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1"></div>
          <div className="p-4">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Ambassador Page Setting
              </h1>
              <p className="text-slate-600 text-sm">
                Configure your interface settings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Web URL Section */}
              <div className="bg-green-50/50 rounded-lg p-3 border border-green-200/30">
                <h2 className="text-base font-semibold text-green-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                  Web URL
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Web URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.webUrl || ""}
                      onChange={(e) =>
                        handleInputChange("webUrl", e.target.value)
                      }
                      placeholder="https://example.com"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500">Main website URL</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Web Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.webName || ""}
                      onChange={(e) =>
                        handleInputChange("webName", e.target.value)
                      }
                      placeholder="Enter website name"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500">
                      Website display name
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status || "active"}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <p className="text-xs text-slate-500">Website status</p>
                  </div>
                </div>
              </div>

              {/* Ambassador Selection Section */}
              <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-200/30">
                <h2 className="text-base font-semibold text-orange-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Select Ambassadors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto p-2 border rounded bg-white">
                  {ambassadors.map((a) => {
                    const checked = selectedAmbassadorIds.includes(a._id)
                    return (
                      <label key={a._id} className={`flex items-center gap-2 p-2 rounded border ${checked ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...selectedAmbassadorIds, a._id]
                              : selectedAmbassadorIds.filter((id) => id !== a._id)
                            setSelectedAmbassadorIds(next)
                          }}
                        />
                        <span className="font-medium text-slate-700">{a.name}</span>
                        <span className="text-xs text-slate-500">{a.email}</span>
                      </label>
                    )
                  })}
                  {!ambassadors.length && (
                    <div className="text-slate-500 text-sm">No verified ambassadors found.</div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">Only selected ambassadors will appear in the client's widget.</p>
              </div>

              {/* Script Generation Result */}
              {generatedCode && (
                <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-200/30">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-semibold text-emerald-700">Generated Script</h2>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success('Script copied!') }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                      aria-label="Copy script"
                      title="Copy script"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mb-2">Embed this snippet on the client website:</div>
                  <pre className="bg-slate-900 text-green-300 text-xs p-3 rounded overflow-auto"><code>{generatedCode}</code></pre>
                </div>
              )}

              {/* Sales History */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-slate-700">Script History</h2>
                  <span className="text-xs text-slate-500">{loading ? 'Loading...' : ''}</span>
                </div>
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="p-2">Client</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Website</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesHistory.map((row) => (
                        <tr key={row._id} className="border-b align-top">
                          <td className="p-2">{row.clientWebName || row.soldTo?.clientName || '-'}</td>
                          <td className="p-2">{row.soldTo?.clientEmail || '-'}</td>
                          <td className="p-2">{row.soldTo?.websiteUrl || row.clientWebUrl || '-'}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${row.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{row.status ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td className="p-2">{new Date(row.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {!salesHistory.length && (
                        <tr>
                          <td className="p-2 text-slate-500" colSpan={5}>No history yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Terms and Policy URL Section */}
              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                <h2 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Terms and Policy URL
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Policy URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.policyUrl || ""}
                      onChange={(e) =>
                        handleInputChange("policyUrl", e.target.value)
                      }
                      placeholder="https://example.com/privacy-policy"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500">
                      URL for Privacy Policy page
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Terms & Conditions URL{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.termsUrl || ""}
                      onChange={(e) =>
                        handleInputChange("termsUrl", e.target.value)
                      }
                      placeholder="https://example.com/terms-and-conditions"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500">
                      URL for Terms & Conditions page
                    </p>
                  </div>
                </div>
              </div>

              {/* Ambassador Card Settings Section */}
              <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
                <h2 className="text-base font-semibold text-purple-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Ambassador Card Settings
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Button Background Color{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <ColorInput
                      field="tilesAndButtonColor"
                      label="Button Background Color"
                      value={formData.tilesAndButtonColor || ""}
                    />
                    <p className="text-xs text-slate-500">
                      Gradient color for ambassador card background and button
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Button Text Color <span className="text-red-500">*</span>
                    </label>
                    <ColorInput
                      field="textColor"
                      label="Button Text Color"
                      value={formData.textColor || ""}
                    />
                    <p className="text-xs text-slate-500">
                      Text color for ambassador card button and chat modal text
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Border Color <span className="text-red-500">*</span>
                    </label>
                    <ColorInput
                      field="borderColor"
                      label="Border Color"
                      value={formData.borderColor || ""}
                    />
                    <p className="text-xs text-slate-500">
                      Border color for ambassador cards and chat questions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Border Radius <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.borderSize || "3"}
                      onChange={(e) =>
                        handleInputChange("borderSize", e.target.value)
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="1">1 - Flat</option>
                      <option value="2">2 - Slightly Rounded</option>
                      <option value="3">3 - Medium Rounded</option>
                      <option value="4">4 - More Rounded</option>
                      <option value="5">5 - Very Rounded</option>
                    </select>
                    <p className="text-xs text-slate-500">
                      Border radius for ambassador cards (1=flat, 5=very
                      rounded)
                    </p>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Questions
                    </label>
                    {formData.questions &&
                      formData.questions.map((question, index) => (
                        <div
                          key={index}
                          className="mb-3 p-3 bg-white/60 rounded border border-slate-200"
                        >
                          <div className="flex items-start space-x-2">
                            <div className="flex-1">
                              <textarea
                                value={question}
                                onChange={(e) =>
                                  handleQuestionChange(index, e.target.value)
                                }
                                placeholder="Type your question here..."
                                rows="2"
                                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200 resize-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full p-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm"
                    >
                      + Add New Question
                    </button>
                  </div>
                </div>
              </div>

              {/* Script Generation Section */}
              <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/30">
                <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Dynamic Client Script Generator
                </h3>
                <p className="text-xs text-amber-600 mb-3">
                  Generate unique scripts for different clients. Each script
                  will have custom branding and settings.
                </p>
                <div className="bg-white/60 rounded p-3 border border-amber-200 mb-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName || ""}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    placeholder="e.g., Delhi University, IIT Mumbai"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will be used to identify the client and customize the
                    script
                  </p>
                </div>
                <div className="bg-white/60 rounded p-3 border border-amber-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    API Base URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.apiBaseUrl || "http://localhost:5000"}
                    onChange={(e) =>
                      handleInputChange("apiBaseUrl", e.target.value)
                    }
                    placeholder="https://your-api-domain.com"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Your backend API URL where the script will make requests
                  </p>
                </div>
              </div>

              {/* Client Management Section */}
              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                <h3 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Saved Clients
                </h3>
                <p className="text-xs text-blue-600 mb-3">
                  View and manage your saved client configurations.
                </p>
                <div className="space-y-2">
                  {(() => {
                    const savedClients = JSON.parse(
                      localStorage.getItem("leadxClients") || "[]"
                    )
                    if (savedClients.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          <svg
                            className="w-8 h-8 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <p className="text-sm">No clients saved yet</p>
                        </div>
                      )
                    }
                    return savedClients.map((client, index) => (
                      <div
                        key={client.id}
                        className="bg-white/60 rounded p-3 border border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {client.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {client.webName} • {client.webUrl}
                            </p>
                            <p className="text-xs text-gray-400">
                              Created:{" "}
                              {new Date(client.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  clientName: client.name,
                                  webUrl: client.webUrl,
                                  webName: client.webName,
                                  apiBaseUrl: client.apiBaseUrl,
                                  status: client.status,
                                  policyUrl: client.policyUrl,
                                  termsUrl: client.termsUrl,
                                  questions: client.questions,
                                  tilesAndButtonColor:
                                    client.tilesAndButtonColor,
                                  textColor: client.textColor,
                                  borderColor: client.borderColor,
                                  borderSize: client.borderSize,
                                }))
                                toast.success(
                                  `Loaded configuration for ${client.name}`
                                )
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => {
                                const script = generateEmbeddableScript(client)
                                navigator.clipboard.writeText(script)
                                toast.success(
                                  `Script for ${client.name} copied!`
                                )
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => {
                                const updatedClients = savedClients.filter(
                                  (c) => c.id !== client.id
                                )
                                localStorage.setItem(
                                  "leadxClients",
                                  JSON.stringify(updatedClients)
                                )
                                toast.success(`Client ${client.name} deleted`)
                                window.location.reload()
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Save Configuration & Generate Script</span>
                </button>
              </div>
            </form>

            {generatedCode && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">Generated Embed Script:</h3>
                <pre className="bg-white p-4 rounded border overflow-x-auto text-xs">
                  {generatedCode}
                </pre>
                <p className="text-xs mt-2 text-gray-600">
                  Copy this code and paste it into your website's HTML where you
                  want the ambassador cards to appear.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizationForm
