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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    country: '',
    alternativeMobile: ''
  })

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching user profile...')
      
      const response = await api.get('/auth/profile')
      
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
          alternativeMobile: userData.alternativeMobile || ''
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
      
      const response = await api.patch('/auth/profile', formData)
      
      if (response.data.success) {
        setUser(response.data.data)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
        console.log('✅ Profile updated:', response.data.data)
      } else {
        toast.error('Failed to update profile')
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err)
      toast.error('Failed to update profile')
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
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: userDashboardColor }}
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
                  <span className="font-medium text-slate-700">Mobile</span>
                  <span className="text-slate-900">{user.mobile || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-slate-700">Location</span>
                  <span className="text-slate-900">{user.location || 'Not provided'}</span>
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
                    Mobile
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: `${userDashboardColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
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
                className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: userDashboardColor }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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
