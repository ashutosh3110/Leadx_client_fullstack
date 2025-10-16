import React, { useEffect, useState } from "react"
import { useColorContext } from "../../context/ColorContext"
import { getUser } from "../utils/auth"
import api from "../utils/Api"
import { toast } from "react-toastify"

const Profile = () => {
  const { userDashboardColor } = useColorContext()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    country: '',
    alternativeMobile: '',
    interests: '',
    goals: ''
  })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    const normalized = String(path).replace(/^\.\/+/, "").replace(/^\/+/, "")
    return `${API_URL}/${normalized}`
  }

  const getUserAvatar = (name) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching user profile...')
      
      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        const userData = response.data.data
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          state: userData.state || '',
          city: userData.city || '',
          country: userData.country || '',
          alternativeMobile: userData.alternativeMobile || '',
          interests: userData.interests || '',
          goals: userData.goals || ''
        })
        console.log('✅ User profile loaded:', userData)
      } else {
        console.error('❌ API response not successful:', response.data)
        toast.error('Failed to load profile')
      }
    } catch (err) {
      console.error('❌ Error fetching user profile:', err)
      console.error('❌ Error details:', err.response?.data || err.message)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      console.log('🔍 Updating user profile...')
      
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })
      
      // Add images if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage)
      }
      
      const response = await api.patch('/auth/update-profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        const updatedUser = response.data.data
        setUser(updatedUser)
        setIsEditing(false)
        setProfileImage(null)
        setProfileImagePreview(null)
        
        // Update localStorage with new user data
        const currentAuth = getUser()
        if (currentAuth) {
          localStorage.setItem('authUser', JSON.stringify({
            user: {
              ...currentAuth,
              ...updatedUser
            },
            expiry: localStorage.getItem('authTokenExpiry')
          }))
        }
        
        toast.success('Profile updated successfully!')
        console.log('✅ Profile updated:', updatedUser)
        
        // Refresh to show updated image everywhere
        window.location.reload()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err)
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: userDashboardColor }}></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 text-lg">Failed to load profile</p>
          <button
            onClick={fetchUserProfile}
            className="mt-4 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: userDashboardColor }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${userDashboardColor}15, ${userDashboardColor}10)`,
          borderColor: `${userDashboardColor}30`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Your Profile
            </h1>
            <p className="text-slate-600">
              Manage your personal information and preferences
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 rounded-lg font-medium transition-all text-white hover:opacity-90"
            style={{ 
              backgroundColor: isEditing ? '#ef4444' : '#1098e8',
              hover: { opacity: 0.9 }
            }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div 
        className="bg-white rounded-2xl shadow-lg border overflow-hidden"
        style={{ 
          borderColor: `${userDashboardColor}20`
        }}
      >
        {!isEditing ? (
          // View Mode
          <div className="p-6">
            {/* Profile Image Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {user.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 shadow-lg"
                    style={{ borderColor: userDashboardColor }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg"
                  style={{ 
                    backgroundColor: userDashboardColor,
                    display: user.profileImage ? 'none' : 'flex'
                  }}
                >
                  {getUserAvatar(user.name)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">Name</span>
                  <span className="text-slate-900">{user.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">Email</span>
                  <span className="text-slate-900">{user.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">Phone</span>
                  <span className="text-slate-900">{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">Country</span>
                  <span className="text-slate-900">{user.country || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">State</span>
                  <span className="text-slate-900">{user.state || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">Alternative Mobile</span>
                  <span className="text-slate-900">{user.alternativeMobile || 'Not provided'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Interests</h4>
                  <p className="text-slate-900 bg-gray-50 p-3 rounded-lg">
                    {user.interests || 'No interests specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Goals</h4>
                  <p className="text-slate-900 bg-gray-50 p-3 rounded-lg">
                    {user.goals || 'No goals specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="p-6">
            {/* Profile Image Upload Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: userDashboardColor }}>
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.profileImage ? (
                    <img
                      src={getImageUrl(user.profileImage)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                    style={{ 
                      backgroundColor: userDashboardColor,
                      display: (profileImagePreview || user.profileImage) ? 'none' : 'flex'
                    }}
                  >
                    {getUserAvatar(user.name)}
                  </div>
                </div>
                <label
                  htmlFor="profileImageInput"
                  className="absolute bottom-0 right-0 p-2 rounded-full text-white cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                  style={{ backgroundColor: userDashboardColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alternative Mobile
                  </label>
                  <input
                    type="tel"
                    name="alternativeMobile"
                    value={formData.alternativeMobile}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Interests
                  </label>
                  <textarea
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                    placeholder="Tell us about your academic interests..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Goals
                  </label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                    placeholder="What are your academic and career goals?"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:opacity-90"
                style={{ backgroundColor: '#1098e8' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
