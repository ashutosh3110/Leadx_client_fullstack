import React, { useState, useEffect } from "react"
import AmbassadorCard from "./AmbassadorCard"
import Pagination from "./Pagination"
import ChatModal from "./ChatModal"
import ProfileModal from "./ProfileModal"
import { ambassadorAPI } from "../utils/Api"

// Comprehensive ambassador data with all card content

const AmbassadorList = () => {
  const [ambassadors, setAmbassadors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedAmbassador, setSelectedAmbassador] = useState(null)

  useEffect(() => {
    console.log("🔍 Current ambassadors state:", ambassadors)
    console.log("🔍 Ambassadors length:", ambassadors.length)
    const fetchAmbassadors = async () => {
      try {
        setLoading(true)

        // Try to fetch from API first
        try {
          console.log("Fetching ambassadors from API...")
          const response = await ambassadorAPI.getAllAmbassadors()
          console.log("API Response:", response)

          // Handle different possible response formats
          let users = []
          if (response.success && response.data && Array.isArray(response.data)) {
            users = response.data
          } else if (response.data && Array.isArray(response.data)) {
            users = response.data
          } else if (Array.isArray(response)) {
            users = response
          } else {
            throw new Error("Invalid API response format")
          }

          console.log("Users from API:", users)

          // Filter only VERIFIED and ACTIVE ambassadors (approved by admin and active status)
          const ambassadorUsers = users.filter(
            (user) =>
              user.role === "ambassador" &&
              user.isVerified === true &&
              user.status === "active"
          )

          console.log("Filtered ambassadors:", ambassadorUsers)
          console.log("First ambassador ID:", ambassadorUsers[0]?._id || ambassadorUsers[0]?.id)

          if (ambassadorUsers.length > 0) {
            // Map API data to card format
            const mappedAmbassadors = ambassadorUsers.map((user, index) => ({
              ...user,
              // Add card-specific fields for display
            }))
            console.log("background", mappedAmbassadors.backgroundImage)

            console.log("Mapped ambassadors:", mappedAmbassadors)
            console.log("First mapped ambassador ID:", mappedAmbassadors[0]?._id || mappedAmbassadors[0]?.id)
            setAmbassadors(mappedAmbassadors)
            console.log("Set ambassadors state:", mappedAmbassadors)
            console.log("First ambassador in state:", mappedAmbassadors[0])
            console.log("First ambassador ID in state:", mappedAmbassadors[0]?._id || mappedAmbassadors[0]?.id)
            console.log("First ambassador keys in state:", Object.keys(mappedAmbassadors[0] || {}))
            console.log("First ambassador type in state:", typeof mappedAmbassadors[0])
            console.log("First ambassador has _id:", mappedAmbassadors[0]?._id ? "Yes" : "No")
            console.log("First ambassador has id:", mappedAmbassadors[0]?.id ? "Yes" : "No")
            console.log("First ambassador _id value:", mappedAmbassadors[0]?._id)
            console.log("First ambassador id value:", mappedAmbassadors[0]?.id)
            setTotalPages(Math.ceil(mappedAmbassadors.length / itemsPerPage))
            console.log(
              "Successfully loaded",
              mappedAmbassadors.length,
              "ambassadors from API"
            )
          } else {
            console.warn(
              "No ambassadors found in API response, using mock data"
            )
            throw new Error("No ambassadors found")
          }
        } catch (apiError) {
          console.error("API fetch failed:", apiError)
          console.warn("Using mock data as fallback")
          // Fallback to mock data if API fails
          // setAmbassadors(ambassadorCardsData.slice(0, 8));
          setTotalPages(1)
        }

        setError(null)
      } catch (err) {
        setError("Failed to fetch ambassadors")
        console.error("Error fetching ambassadors:", err)
        // Final fallback to mock data
        // setAmbassadors(ambassadorCardsData.slice(0, 8));
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    fetchAmbassadors()
  }, [itemsPerPage])

  const handleChat = (ambassador) => {
    console.log("🔍 Selected ambassador:", ambassador)
    console.log("🔍 Ambassador ID:", ambassador._id || ambassador.id)
    console.log("🔍 Ambassador keys:", Object.keys(ambassador))
    console.log("🔍 Ambassador type:", typeof ambassador)
    if (!ambassador) {
      console.error("❌ Ambassador is null or undefined")
      return
    }
    setSelectedAmbassador(ambassador)
    setIsChatModalOpen(true)
  }

  const handleCloseChatModal = () => {
    setIsChatModalOpen(false)
    setSelectedAmbassador(null)
  }

  const handleViewProfile = (ambassador) => {
    setSelectedAmbassador(ambassador)
    setIsProfileModalOpen(true)
  }

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false)
    setSelectedAmbassador(null)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAmbassadors = ambassadors.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ambassadors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Chat with an Ambassador
          </h1>
          <p className="text-sm text-gray-600 text-center mt-2">
            Showing {ambassadors.length} ambassadors
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-hidden">
        {/* Large Container Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 overflow-x-hidden">
          {/* Ambassador Grid - 4 cards per row, 2 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-hidden">
            {currentAmbassadors.map((ambassador) => (
              <AmbassadorCard
                key={ambassador._id}
                ambassador={ambassador}
                onChat={handleChat}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Pagination - inside the large card at the bottom */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        ambassador={selectedAmbassador}
      />
      {console.log("🔍 Passing ambassador to ChatModal:", selectedAmbassador)}
      {console.log("🔍 Selected ambassador type:", typeof selectedAmbassador)}
      {console.log("🔍 Selected ambassador ID:", selectedAmbassador?._id || selectedAmbassador?.id)}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        ambassador={selectedAmbassador}
      />
    </div>
  )
}

export default AmbassadorList
