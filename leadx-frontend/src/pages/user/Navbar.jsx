import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"
import { getUser } from "../utils/auth"
import ProfileDropdown from "./ProfileDropdown"

const Navbar = () => {
  const navigate = useNavigate()
  const { userDashboardColor } = useColorContext()
  const user = getUser()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    const normalized = String(path).replace(/^\.\/+/, "").replace(/^\/+/, "")
    return `${API_URL}/${normalized}`
  }

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleCloseProfileDropdown = () => {
    setIsProfileDropdownOpen(false)
  }

  return (
    <div className="bg-white shadow-md px-4 sm:px-6 py-3 flex items-center justify-between">
      <h1 className="text-base sm:text-lg font-semibold text-gray-700">
        Welcome, {user?.name || "Student"}
      </h1>
      
      {/* Profile Button */}
      <div className="relative profile-dropdown">
        <button
          onClick={handleProfileClick}
          className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
        >
          {user?.profileImage ? (
            <img
              src={getImageUrl(user.profileImage)}
              alt={user.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm border-2 border-blue-200"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center shadow-sm border-2 border-blue-200">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-800">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <ProfileDropdown
          isOpen={isProfileDropdownOpen}
          onClose={handleCloseProfileDropdown}
        />
      </div>
    </div>
  )
}

export default Navbar
