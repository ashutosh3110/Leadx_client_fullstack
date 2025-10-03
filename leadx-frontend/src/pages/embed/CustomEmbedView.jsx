import React, { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { customizationAPI } from "../utils/apicopy"
import { toast } from "react-toastify"

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000"

const ChatModal = ({ open, onClose, ambassador, config }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData({ name: "", email: "", phone: "", message: "" })
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      toast.error("Please fill all fields")
      return
    }

    try {
      setSubmitting(true)

      // Submit to chat API
      const response = await fetch(`${apiBase}/api/embed/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configId: config.configId,
          ambassadorId: ambassador._id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Message sent successfully! We'll contact you via email.")
        onClose()
      } else {
        toast.error(result.message || "Failed to send message")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getBorderRadius = () => {
    const size = parseInt(config.borderSize) || 3
    return size * 4
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        style={{ borderRadius: `${getBorderRadius()}px` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Chat with {ambassador?.name || "Ambassador"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Ambassador Info */}
        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <img
            src={ambassador?.profilePicture || "/default-avatar.png"}
            alt={ambassador?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{ambassador?.name}</p>
            <p className="text-sm text-gray-600">
              {ambassador?.bio || "Ambassador"}
            </p>
          </div>
        </div>

        {/* Questions */}
        {config.questions && config.questions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Quick Questions:
            </p>
            <div className="space-y-2">
              {config.questions.map((question, index) => (
                <div
                  key={index}
                  className="text-sm p-2 bg-gray-50 rounded border"
                  style={{ borderColor: config.borderColor }}
                >
                  {question}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <textarea
              placeholder="Your message"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: config.tilesAndButtonColor,
              color: config.textColor,
              borderRadius: `${getBorderRadius()}px`,
            }}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Footer Links */}
        {(config.policyUrl || config.termsUrl) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              {config.policyUrl && (
                <a
                  href={config.policyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700"
                >
                  Privacy Policy
                </a>
              )}
              {config.termsUrl && (
                <a
                  href={config.termsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700"
                >
                  Terms & Conditions
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CustomEmbedView = () => {
  const { configId } = useParams()
  const [searchParams] = useSearchParams()
  const [config, setConfig] = useState(null)
  const [ambassadors, setAmbassadors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedAmbassador, setSelectedAmbassador] = useState(null)

  // Check if opened from widget with specific ambassador
  const ambassadorId = searchParams.get("ambassador")
  const ambassadorName = searchParams.get("name")

  useEffect(() => {
    loadConfiguration()
  }, [configId])

  useEffect(() => {
    // If opened with specific ambassador, auto-open chat
    if (ambassadorId && ambassadors.length > 0) {
      const ambassador = ambassadors.find((amb) => amb._id === ambassadorId)
      if (ambassador) {
        setSelectedAmbassador(ambassador)
        setChatOpen(true)
      }
    }
  }, [ambassadorId, ambassadors])

  const loadConfiguration = async () => {
    try {
      setLoading(true)
      const response = await customizationAPI.getPublicConfig(configId)

      if (response.success) {
        setConfig(response.data)
        setAmbassadors(response.data.ambassadors || [])
      } else {
        setError("Configuration not found or inactive")
      }
    } catch (error) {
      console.error("Error loading configuration:", error)
      setError("Failed to load configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleChatClick = (ambassador) => {
    setSelectedAmbassador(ambassador)
    setChatOpen(true)
  }

  const handleCloseChat = () => {
    setChatOpen(false)
    setSelectedAmbassador(null)
  }

  const getBorderRadius = () => {
    if (!config) return 12
    const size = parseInt(config.borderSize) || 3
    return size * 4
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ambassadors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connect with our Ambassadors
            </h1>
            <p className="text-gray-600">
              Chat with our verified ambassadors from {config?.webName}
            </p>
            {config?.webUrl && (
              <a
                href={config.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Visit {config.webName} →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Ambassador Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {ambassadors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Ambassadors Available
            </h3>
            <p className="text-gray-600">
              Please check back later or contact us directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambassadors.map((ambassador) => (
              <div
                key={ambassador._id}
                className="bg-white rounded-lg shadow-sm border-2 hover:shadow-md transition-all duration-200"
                style={{
                  borderColor: config.borderColor,
                  borderRadius: `${getBorderRadius()}px`,
                }}
              >
                {/* Ambassador Header with Gradient */}
                <div
                  className="h-20 rounded-t-lg"
                  style={{
                    background: config.tilesAndButtonColor,
                    borderRadius: `${getBorderRadius()}px ${getBorderRadius()}px 0 0`,
                  }}
                />

                {/* Ambassador Info */}
                <div className="p-4 -mt-10 relative">
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={ambassador.profilePicture || "/default-avatar.png"}
                      alt={ambassador.name}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover mb-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {ambassador.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {ambassador.bio || "Ambassador"}
                    </p>

                    {/* Questions Preview */}
                    {config.questions && config.questions.length > 0 && (
                      <div className="w-full mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Quick Questions:
                        </p>
                        <div className="space-y-1">
                          {config.questions
                            .slice(0, 2)
                            .map((question, index) => (
                              <div
                                key={index}
                                className="text-xs p-2 bg-gray-50 rounded text-left"
                                style={{ borderColor: config.borderColor }}
                              >
                                {question.length > 50
                                  ? `${question.substring(0, 50)}...`
                                  : question}
                              </div>
                            ))}
                          {config.questions.length > 2 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{config.questions.length - 2} more questions
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Chat Button */}
                    <button
                      onClick={() => handleChatClick(ambassador)}
                      className="w-full py-2 px-4 font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                      style={{
                        background: config.tilesAndButtonColor,
                        color: config.textColor,
                        borderRadius: `${getBorderRadius()}px`,
                      }}
                    >
                      Chat with {ambassador.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by LeadX Ambassador Platform</p>
            {(config?.policyUrl || config?.termsUrl) && (
              <div className="mt-2 space-x-4">
                {config.policyUrl && (
                  <a
                    href={config.policyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-700"
                  >
                    Privacy Policy
                  </a>
                )}
                {config.termsUrl && (
                  <a
                    href={config.termsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-700"
                  >
                    Terms & Conditions
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        open={chatOpen}
        onClose={handleCloseChat}
        ambassador={selectedAmbassador}
        config={config}
      />
    </div>
  )
}

export default CustomEmbedView
