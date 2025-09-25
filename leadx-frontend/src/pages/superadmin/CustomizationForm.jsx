import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useCustomization } from "../../context/CustomizationContext"

const CustomizationForm = () => {
  const { customization, updateCustomization } = useCustomization()

  const [formData, setFormData] = useState({
    ...customization,
    url: "",
    webname: "",
    isActive: false,
    questions: [], // Changed to array for multiple questions
  })

  const [colorFormat, setColorFormat] = useState({
    backgroundColor: "hex",
    textColor: "hex",
    chatBackgroundColor: "hex",
    chatTextColor: "hex",
    gradientColor: "hex",
  })

  const [generatedCode, setGeneratedCode] = useState("")
  const [error, setError] = useState("")

  // Sync form data with context when customization changes
  useEffect(() => {
    setFormData(customization)

    // Auto-detect color formats based on saved values
    const newColorFormat = { ...colorFormat }

    if (
      customization.backgroundColor &&
      customization.backgroundColor.startsWith("rgb")
    ) {
      newColorFormat.backgroundColor = "rgb"
    } else if (
      customization.backgroundColor &&
      customization.backgroundColor.startsWith("#")
    ) {
      newColorFormat.backgroundColor = "hex"
    }

    if (customization.textColor && customization.textColor.startsWith("rgb")) {
      newColorFormat.textColor = "rgb"
    } else if (
      customization.textColor &&
      customization.textColor.startsWith("#")
    ) {
      newColorFormat.textColor = "hex"
    }

    if (
      customization.chatBackgroundColor &&
      customization.chatBackgroundColor.startsWith("rgb")
    ) {
      newColorFormat.chatBackgroundColor = "rgb"
    } else if (
      customization.chatBackgroundColor &&
      customization.chatBackgroundColor.startsWith("#")
    ) {
      newColorFormat.chatBackgroundColor = "hex"
    }

    if (
      customization.chatTextColor &&
      customization.chatTextColor.startsWith("rgb")
    ) {
      newColorFormat.chatTextColor = "rgb"
    } else if (
      customization.chatTextColor &&
      customization.chatTextColor.startsWith("#")
    ) {
      newColorFormat.chatTextColor = "hex"
    }

    if (
      customization.gradientColor &&
      customization.gradientColor.startsWith("rgb")
    ) {
      newColorFormat.gradientColor = "rgb"
    } else if (
      customization.gradientColor &&
      customization.gradientColor.startsWith("#")
    ) {
      newColorFormat.gradientColor = "hex"
    }

    setColorFormat(newColorFormat)
  }, [customization])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
    setColorFormat((prev) => ({
      ...prev,
      [field]: format,
    }))

    // Reset color value when format changes
    setFormData((prev) => ({
      ...prev,
      [field]: format === "hex" ? "#ffffff" : "rgb(255, 255, 255)",
    }))
  }

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)

    // Update the global customization context
    updateCustomization(formData)

    // Show success message
    toast.success(
      "Configuration saved successfully! The changes will be applied to the Chat buttons."
    )
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
        setTimeout(() => {
          e.target.select()
        }, 10)
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

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4"
      style={{ touchAction: "pan-y" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
          {/* Header */}
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
                      Change Color of Tiles and Button{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.tilesAndButtonColor || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "tilesAndButtonColor",
                            e.target.value
                          )
                        }
                        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                      />
                      <input
                        type="color"
                        value={
                          formData.tilesAndButtonColor?.includes("#")
                            ? formData.tilesAndButtonColor
                            : "#667eea"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "tilesAndButtonColor",
                            e.target.value
                          )
                        }
                        className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Gradient color for ambassador card background image and
                      button colors
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Text Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.textColor || ""}
                        onChange={(e) =>
                          handleInputChange("textColor", e.target.value)
                        }
                        placeholder="#ffffff"
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                      />
                      <input
                        type="color"
                        value={formData.textColor || "#ffffff"}
                        onChange={(e) =>
                          handleInputChange("textColor", e.target.value)
                        }
                        className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Text color for ambassador card button and chat modal text
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Border Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.borderColor || ""}
                        onChange={(e) =>
                          handleInputChange("borderColor", e.target.value)
                        }
                        placeholder="#e5e7eb"
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                      />
                      <input
                        type="color"
                        value={formData.borderColor || "#e5e7eb"}
                        onChange={(e) =>
                          handleInputChange("borderColor", e.target.value)
                        }
                        className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Border color for ambassador cards and chat questions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Border Size <span className="text-red-500">*</span>
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
                </div>

                {/* Dynamic Questions Section */}
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

              {/* Script Preview Section */}
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
                  Script Preview
                </h3>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto max-h-60 overflow-y-auto font-mono">
                      {`// Customization Configuration
const customization = {
  // Web URL Settings
  webUrl: "${formData.webUrl || ""}",
  webName: "${formData.webName || ""}",
  status: "${formData.status || "active"}",
  
  // Terms and Policy URLs
  policyUrl: "${formData.policyUrl || ""}",
  termsUrl: "${formData.termsUrl || ""}",
  questions: ${JSON.stringify(formData.questions || [], null, 2)},
  
  // Ambassador Card Settings
  tilesAndButtonColor: "${
    formData.tilesAndButtonColor ||
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }",
  textColor: "${formData.textColor || "#ffffff"}",
  borderColor: "${formData.borderColor || "#e5e7eb"}",
  borderSize: "${formData.borderSize || "3"}",
  
  // Legacy Settings
  ambassadorCardBackgroundColor: "${
    formData.ambassadorCardBackgroundColor || "#3b82f6"
  }",
  ambassadorCardBorderColor: "${
    formData.ambassadorCardBorderColor || "#e5e7eb"
  }",
  chatBackgroundColor: "${formData.chatBackgroundColor || "#3b82f6"}",
  chatTextColor: "${formData.chatTextColor || "#ffffff"}"
};

// Apply customization
localStorage.setItem('customization', JSON.stringify(customization));`}
                    </pre>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const script = `// Customization Configuration
const customization = {
  // Web URL Settings
  webUrl: "${formData.webUrl || ""}",
  webName: "${formData.webName || ""}",
  status: "${formData.status || "active"}",
  
  // Terms and Policy URLs
  policyUrl: "${formData.policyUrl || ""}",
  termsUrl: "${formData.termsUrl || ""}",
  questions: ${JSON.stringify(formData.questions || [], null, 2)},
  
  // Ambassador Card Settings
  tilesAndButtonColor: "${
    formData.tilesAndButtonColor ||
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }",
  textColor: "${formData.textColor || "#ffffff"}",
  borderColor: "${formData.borderColor || "#e5e7eb"}",
  borderSize: "${formData.borderSize || "3"}",
  
  // Legacy Settings
  ambassadorCardBackgroundColor: "${
    formData.ambassadorCardBackgroundColor || "#3b82f6"
  }",
  ambassadorCardBorderColor: "${
    formData.ambassadorCardBorderColor || "#e5e7eb"
  }",
  chatBackgroundColor: "${formData.chatBackgroundColor || "#3b82f6"}",
  chatTextColor: "${formData.chatTextColor || "#ffffff"}"
};

// Apply customization
localStorage.setItem('customization', JSON.stringify(customization));`
                        navigator.clipboard.writeText(script)
                        toast.success("Script copied to clipboard!")
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-1"
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
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const json = JSON.stringify(formData, null, 2)
                        navigator.clipboard.writeText(json)
                        toast.success("JSON configuration copied to clipboard!")
                      }}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-1"
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Copy JSON</span>
                    </button>
                  </div>
                </div>
              </div>

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
                  want the ambassador cards to appear. The script will only run
                  on {formData.url}.
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
