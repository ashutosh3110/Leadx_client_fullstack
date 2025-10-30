import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useColorContext } from "../../context/ColorContext"
import { getUser } from "../utils/auth"
import ProfileDropdown from "./ProfileDropdown"

const Navbar = () => {
  const navigate = useNavigate()
  const { ambassadorDashboardColor } = useColorContext()
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
    <div className="bg-white shadow-md px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between lg:block">
      <div className="flex items-center justify-between w-full lg:w-auto">
        <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 truncate">
          Welcome, {user?.name || "Ambassador"}
        </h1>
        
        {/* Profile Button */}
        <div className="relative profile-dropdown">
          <button
            onClick={handleProfileClick}
            className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 p-1 sm:p-1.5 lg:p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            {user?.profileImage ? (
              <img
                src={getImageUrl(user.profileImage)}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full object-cover shadow-sm border-2 border-purple-200"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-full flex items-center justify-center shadow-sm border-2 border-purple-200">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-slate-800">{user?.name || 'Ambassador'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'ambassador@example.com'}</p>
            </div>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onClose={handleCloseProfileDropdown}
          />
        </div>
      </div>
    </div>
  )
}

export default Navbar
