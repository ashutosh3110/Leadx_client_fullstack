import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useCustomization } from "../../context/CustomizationContext"
import { ambassadorAPI, embedAPI } from "../utils/apicopy"

const CustomizationForm = () => {
  const { customization, updateCustomization } = useCustomization()

  const [formData, setFormData] = useState({
    webUrl: customization.webUrl || "",
    webName: customization.webName || "",
    status: customization.status || "active",
    policyUrl: customization.policyUrl || "",
    termsUrl: customization.termsUrl || "",
    questions: customization.questions || [],
    tilesAndButtonColor:
      customization.tilesAndButtonColor ||
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: customization.textColor || "#ffffff",
    borderColor: customization.borderColor || "#e5e7eb",
    borderSize: customization.borderSize || "3",
    ambassadorCardBackgroundColor:
      customization.ambassadorCardBackgroundColor || "#3b82f6",
    ambassadorCardBorderColor:
      customization.ambassadorCardBorderColor || "#e5e7eb",
    chatBackgroundColor: customization.chatBackgroundColor || "#3b82f6",
    chatTextColor: customization.chatTextColor || "#ffffff",
  })

  const [colorFormat, setColorFormat] = useState({
    tilesAndButtonColor: "hex",
    textColor: "hex",
    borderColor: "hex",
    ambassadorCardBackgroundColor: "hex",
    chatBackgroundColor: "hex",
    chatTextColor: "hex",
  })

  const [ambassadors, setAmbassadors] = useState([])
  const [salesHistory, setSalesHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Initialize colorFormat based on customization values
  useEffect(() => {
    const newColorFormat = { ...colorFormat }
    ;[
      "tilesAndButtonColor",
      "textColor",
      "borderColor",
      "ambassadorCardBackgroundColor",
      "chatBackgroundColor",
      "chatTextColor",
    ].forEach((field) => {
      if (customization[field] && customization[field].startsWith("rgb")) {
        newColorFormat[field] = "rgb"
      } else if (customization[field] && customization[field].startsWith("#")) {
        newColorFormat[field] = "hex"
      } else if (
        customization[field] &&
        customization[field].includes("gradient")
      ) {
        newColorFormat[field] = "gradient"
      }
    })
    setColorFormat(newColorFormat)
  }, [customization])

  // Load ambassadors and sales history
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const ambRes = await ambassadorAPI.getAllAmbassadors()
        if (!ambRes || !Array.isArray(ambRes.data)) {
          throw new Error("Invalid ambassadors response format")
        }
        const ambs = ambRes.data.filter(
          (u) => u.role === "ambassador" && u.isVerified
        )
        setAmbassadors(ambs)

        const histRes = await embedAPI.salesHistory()
        if (!histRes || !Array.isArray(histRes.data)) {
          throw new Error("Invalid sales history response format")
        }
        setSalesHistory(histRes.data)
      } catch (e) {
        const errorMessage =
          e.response?.data?.message || e.message || "Failed to load data"
        setError(errorMessage)
        toast.error(`Error: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleQuestionChange = (index, value) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[index] = value
      return { ...prev, questions: updatedQuestions }
    })
  }

  const handleAddQuestion = () => {
    if ((formData.questions || []).length >= 6) {
      toast.warning("Maximum 6 questions allowed")
      return
    }
    setFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), ""],
    }))
  }

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.webUrl || !formData.webName || !formData.status) {
      toast.error(
        "Please fill in all required fields (Web URL, Web Name, Status)"
      )
      return
    }
    try {
      setLoading(true)
      await updateCustomization(formData)
      toast.success("Customization settings updated successfully!")
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update customization"
      setError(errorMessage)
      toast.error(`Error: ${errorMessage}`)
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
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}
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
                      required
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
                      required
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
                      required
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
                      Policy URL
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
                      URL for Privacy Policy page (optional)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Terms & Conditions URL
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
                      URL for Terms & Conditions page (optional)
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Button Background Color{" "}
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
                          required
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
                        Button Text Color{" "}
                        <span className="text-red-500">*</span>
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
                          required
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
                        Text color for ambassador card button and chat modal
                        text
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          required
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
                        Border Radius <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.borderSize || "3"}
                        onChange={(e) =>
                          handleInputChange("borderSize", e.target.value)
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
                        required
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
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Questions
                      </label>
                      <span className="text-xs text-slate-500">
                        {(formData.questions || []).length}/6 questions
                      </span>
                    </div>
                    {(formData.questions || []).map((question, index) => (
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
                    {(formData.questions || []).length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Question
                      </button>
                    )}
                  </div>
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <pre className="text-green-400 p-3 text-xs max-h-60 overflow-y-auto font-mono whitespace-pre-wrap break-words">
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
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center justify-center space-x-1"
                      title="Copy Script"
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
                      <span>Copy Script</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const json = JSON.stringify(formData, null, 2)
                        navigator.clipboard.writeText(json)
                        toast.success("JSON configuration copied to clipboard!")
                      }}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center space-x-1"
                      title="Copy JSON"
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

              {/* Submit Button */}
              <div className="flex justify-center pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
                  <span>{loading ? "Saving..." : "Generate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizationForm
