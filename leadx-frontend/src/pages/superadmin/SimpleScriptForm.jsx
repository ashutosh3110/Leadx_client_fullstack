import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { customizationAPI } from "../utils/apicopy"

const SimpleScriptForm = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    targetWebUrl: "",
    webUrl: "",
    webName: "",
    policyUrl: "",
    termsUrl: "",
    tilesAndButtonColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderSize: "3",
    questions: [],
    isActive: true,
  })

  const [savedConfigurations, setSavedConfigurations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [generatedScriptUrl, setGeneratedScriptUrl] = useState("")

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      const response = await customizationAPI.getCustomizations()
      setSavedConfigurations(response.data || [])
    } catch (error) {
      console.error("Error loading configurations:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddQuestion = () => {
    if (formData.questions.length >= 6) {
      toast.warning("Maximum 6 questions allowed")
      return
    }
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.clientName ||
      !formData.targetWebUrl ||
      !formData.webUrl ||
      !formData.webName
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const response = await customizationAPI.createCustomization(formData)

      if (response.success) {
        toast.success("Script generated successfully!")

        const scriptUrl = customizationAPI.getScriptUrl(response.data.configId)
        setGeneratedScriptUrl(scriptUrl)
        setShowScriptModal(true)

        loadConfigurations()

        // Reset form
        setFormData({
          clientName: "",
          clientEmail: "",
          targetWebUrl: "",
          webUrl: "",
          webName: "",
          policyUrl: "",
          termsUrl: "",
          tilesAndButtonColor:
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textColor: "#ffffff",
          borderColor: "#e5e7eb",
          borderSize: "3",
          questions: [],
          isActive: true,
        })
      }
    } catch (error) {
      console.error("Error creating configuration:", error)
      toast.error("Failed to generate script")
    } finally {
      setLoading(false)
    }
  }

  const copyScriptToClipboard = () => {
    const scriptTag = `<script src="${generatedScriptUrl}"></script>`
    navigator.clipboard.writeText(scriptTag)
    toast.success("Script tag copied to clipboard!")
  }

  const deleteConfiguration = async (configId) => {
    if (
      !window.confirm("Are you sure you want to delete this configuration?")
    ) {
      return
    }

    try {
      await customizationAPI.deleteCustomization(configId)
      toast.success("Configuration deleted successfully")
      loadConfigurations()
    } catch (error) {
      console.error("Error deleting configuration:", error)
      toast.error("Failed to delete configuration")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Ambassador Widget Generator
          </h1>
          <p className="text-slate-600 text-lg">
            Generate embeddable ambassador widgets with AmbassadorCard UI
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-4">
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    placeholder="University/College Name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      handleInputChange("clientEmail", e.target.value)
                    }
                    placeholder="client@university.edu"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.targetWebUrl}
                    onChange={(e) =>
                      handleInputChange("targetWebUrl", e.target.value)
                    }
                    placeholder="https://university.edu"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Script Status
                  </label>
                  <select
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.value === "active")
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Web Settings */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                Web Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Company URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.webUrl}
                    onChange={(e) =>
                      handleInputChange("webUrl", e.target.value)
                    }
                    placeholder="https://yourcompany.com"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.webName}
                    onChange={(e) =>
                      handleInputChange("webName", e.target.value)
                    }
                    placeholder="Your Company Name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Privacy Policy URL
                  </label>
                  <input
                    type="url"
                    value={formData.policyUrl}
                    onChange={(e) =>
                      handleInputChange("policyUrl", e.target.value)
                    }
                    placeholder="https://yourcompany.com/privacy"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Terms URL
                  </label>
                  <input
                    type="url"
                    value={formData.termsUrl}
                    onChange={(e) =>
                      handleInputChange("termsUrl", e.target.value)
                    }
                    placeholder="https://yourcompany.com/terms"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* UI Customization */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h2 className="text-lg font-semibold text-purple-700 mb-4">
                UI Customization
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Button Background Color
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.tilesAndButtonColor}
                      onChange={(e) =>
                        handleInputChange("tilesAndButtonColor", e.target.value)
                      }
                      placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="color"
                      value={
                        formData.tilesAndButtonColor?.includes("#")
                          ? formData.tilesAndButtonColor
                          : "#667eea"
                      }
                      onChange={(e) =>
                        handleInputChange("tilesAndButtonColor", e.target.value)
                      }
                      className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) =>
                        handleInputChange("textColor", e.target.value)
                      }
                      placeholder="#ffffff"
                      className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) =>
                        handleInputChange("textColor", e.target.value)
                      }
                      className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Border Color
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.borderColor}
                      onChange={(e) =>
                        handleInputChange("borderColor", e.target.value)
                      }
                      placeholder="#e5e7eb"
                      className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="color"
                      value={formData.borderColor}
                      onChange={(e) =>
                        handleInputChange("borderColor", e.target.value)
                      }
                      className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Border Radius
                  </label>
                  <select
                    value={formData.borderSize}
                    onChange={(e) =>
                      handleInputChange("borderSize", e.target.value)
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1">1 - Flat</option>
                    <option value="2">2 - Slightly Rounded</option>
                    <option value="3">3 - Medium Rounded</option>
                    <option value="4">4 - More Rounded</option>
                    <option value="5">5 - Very Rounded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-amber-700">
                  Default Questions ({formData.questions.length}/6)
                </h2>
                {formData.questions.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Add Question
                  </button>
                )}
              </div>

              {formData.questions.map((question, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 bg-white rounded border border-slate-200"
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
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
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
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Generating..."
                  : "Generate Ambassador Widget Script"}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Configurations */}
        {savedConfigurations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Generated Scripts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedConfigurations.map((config) => (
                <div
                  key={config._id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {config.clientName}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">
                        {config.targetWebUrl}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Created:{" "}
                        {new Date(config.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        config.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {config.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const scriptUrl = customizationAPI.getScriptUrl(
                          config.configId
                        )
                        const scriptTag = `<script src="${scriptUrl}"></script>`
                        navigator.clipboard.writeText(scriptTag)
                        toast.success("Script tag copied!")
                      }}
                      className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Copy Script
                    </button>
                    <button
                      onClick={() => deleteConfiguration(config._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4 text-green-600">
              🎉 Ambassador Widget Script Generated!
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Your embeddable ambassador widget script is ready! This will
              render the complete AmbassadorCard UI with chat functionality.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 border">
              <code className="text-sm break-all font-mono">
                {`<script src="${generatedScriptUrl}"></script>`}
              </code>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Features included:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  ✅ Complete AmbassadorCard UI (same as your original
                  component)
                </li>
                <li>✅ Floating chat button</li>
                <li>
                  ✅ Ambassador grid with profile images, courses, locations
                </li>
                <li>✅ Custom questions display</li>
                <li>✅ Full chat functionality</li>
                <li>✅ Responsive design</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyScriptToClipboard}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Copy Script Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleScriptForm
