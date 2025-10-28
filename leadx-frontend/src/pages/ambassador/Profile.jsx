import React, { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import api from ".././utils/Api"
import { useColorContext } from "../../context/ColorContext"

const Profile = () => {
  const { ambassadorDashboardColor } = useColorContext()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [languages, setLanguages] = useState([""])
  const [extracurriculars, setExtracurriculars] = useState([""])
  const [profileImage, setProfileImage] = useState(null)
  const [thumbnailImage, setThumbnailImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationType, setLocationType] = useState('within-india') // 'within-india' or 'outside-india'

  const API_URL = import.meta.env.VITE_API_URL
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL

  // helper for proper image url
  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    return `${IMAGE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me")

        const data = res.data.data
        setProfile(data)
        setLanguages(data.languages?.length ? data.languages : [""])
        setExtracurriculars(
          data.extracurriculars?.length ? data.extracurriculars : [""]
        )
        
        // Set location type based on existing data
        if (data.country && data.country.toLowerCase() === 'india') {
          setLocationType('within-india')
        } else if (data.country && data.country.toLowerCase() !== 'india') {
          setLocationType('outside-india')
        } else {
          setLocationType('within-india') // Default
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to fetch profile ❌")
      }
    }
    fetchProfile()
  }, [])

  // Validation functions
  const validateForm = (formData) => {
    const newErrors = {}
    
    // Required fields validation (password not included in profile update)
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
    if (!formData.program?.trim()) {
      newErrors.program = "Program is required"
    }
    
    if (!formData.course?.trim()) {
      newErrors.course = "Course is required"
    }
    
    if (!formData.year?.trim()) {
      newErrors.year = "Year is required"
    }
    
    if (!formData.graduationYear?.trim()) {
      newErrors.graduationYear = "Graduation year is required"
    } else if (!/^\d{4}$/.test(formData.graduationYear.trim())) {
      newErrors.graduationYear = "Please enter a valid year (e.g., 2024)"
    }
    
    if (!formData.country?.trim()) {
      newErrors.country = "Country is required"
    }
    
    // State validation - only required if within India
    if (locationType === 'within-india' && !formData.state?.trim()) {
      newErrors.state = "State is required"
    }
    
    if (!formData.about?.trim()) {
      newErrors.about = "About section is required"
    } else if (formData.about.trim().length < 10) {
      newErrors.about = "About section must be at least 10 characters"
    }
    
    // Languages validation
    const validLanguages = languages.filter(lang => lang.trim())
    if (validLanguages.length === 0) {
      newErrors.languages = "At least one language is required"
    }
    
    // Extracurriculars validation
    const validExtracurriculars = extracurriculars.filter(act => act.trim())
    if (validExtracurriculars.length === 0) {
      newErrors.extracurriculars = "At least one extracurricular activity is required"
    }
    
    // File validation
    if (profileImage && profileImage.size > 5 * 1024 * 1024) {
      newErrors.profileImage = "Profile image must be less than 5MB"
    }
    
    if (thumbnailImage && thumbnailImage.size > 5 * 1024 * 1024) {
      newErrors.thumbnailImage = "Thumbnail image must be less than 5MB"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddField = (setter, values) => setter([...values, ""])
  
  const handleChangeField = (setter, values, i, v) => {
    const updated = [...values]
    updated[i] = v
    setter(updated)
    // Clear language/extracurricular error when user starts typing
    if (setter === setLanguages && errors.languages) {
      setErrors(prev => ({ ...prev, languages: "" }))
    }
    if (setter === setExtracurriculars && errors.extracurriculars) {
      setErrors(prev => ({ ...prev, extracurriculars: "" }))
    }
  }

  const handleFileChange = (e, setter, errorKey) => {
    const file = e.target.files[0]
    if (file) {
      // Clear previous error
      if (errors[errorKey]) {
        setErrors(prev => ({ ...prev, [errorKey]: "" }))
      }
      setter(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    // Collect form data safely
    const getFormValue = (fieldName) => {
      const field = e.target[fieldName];
      return field ? field.value : '';
    };

    const formData = {
      name: getFormValue('name'),
      program: getFormValue('program'),
      course: getFormValue('course'),
      year: getFormValue('year'),
      graduationYear: getFormValue('graduationYear'),
      country: getFormValue('country'),
      state: getFormValue('state'),
      about: getFormValue('about'),
      // Note: password is not included in profile update
    }

    // Validate form
    if (!validateForm(formData)) {
      setIsSubmitting(false)
      toast.error("Please fix the errors below")
      return
    }

    // Prepare FormData for API
    const apiFormData = new FormData()
    
    // basic fields (exclude password and state for profile update)
    Object.keys(formData).forEach((key) => {
      if (key !== 'password' && key !== 'state') { // Don't send password and state in loop
        apiFormData.append(key, formData[key])
      }
    })

    // Handle state field based on location type (only once)
    if (locationType === 'within-india') {
      const stateField = e.target.state;
      if (stateField && stateField.value && stateField.value.trim() !== '') {
        apiFormData.append('state', stateField.value.trim())
      } else {
        apiFormData.append('state', '')
      }
    } else {
      // Clear state if outside India
      apiFormData.append('state', '')
    }

    // arrays
    languages.forEach(
      (lang, i) => lang.trim() && apiFormData.append(`languages[${i}]`, lang)
    )
    extracurriculars.forEach(
      (act, i) => act.trim() && apiFormData.append(`extracurriculars[${i}]`, act)
    )

    // files
    if (profileImage) apiFormData.append("profileImage", profileImage)
    if (thumbnailImage) apiFormData.append("thumbnailImage", thumbnailImage)

    // Log FormData contents for debugging (can be removed in production)
    if (import.meta.env.DEV) {
      console.log('FormData contents:')
      for (let [key, value] of apiFormData.entries()) {
        console.log(`${key}:`, value)
      }
    }

    try {
      console.log('Submitting profile update...')
      console.log('Location Type:', locationType)
      console.log('State Field Value:', e.target.state?.value)
      
      // Debug FormData contents
      if (import.meta.env.DEV) {
        console.log('FormData contents:')
        for (let [key, value] of apiFormData.entries()) {
          console.log(`${key}:`, value)
        }
      }
      
      // Use the correct API endpoint
      const res = await api.patch("/auth/update-profile", apiFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      
      console.log('Profile update successful:', res.data)
      
      // Handle response format from backend
      let updatedProfile;
      if (res.data && res.data.data) {
        updatedProfile = res.data.data;
      } else if (res.data) {
        updatedProfile = res.data;
      } else {
        throw new Error('No data received from server')
      }
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      setProfileImage(null)
      setThumbnailImage(null)
      setIsEditing(false)
        setErrors({})
      toast.success("Profile Updated Successfully ✅")
        
        // Refresh the page data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Invalid profile data received')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      console.error('Error response:', err.response)
      console.error('Error data:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to update profile"
      toast.error(`Failed to update profile: ${errorMessage} ❌`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!profile) return <p className="text-center mt-8">Loading profile...</p>

  return (
    <div className="min-h-screen bg-gray-50 mt-4">
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gray-200">
        <img
          src={
            thumbnailImage
              ? URL.createObjectURL(thumbnailImage)
              : getImageUrl(profile.thumbnailImage)
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {/* Profile Image */}
        <div className="absolute -bottom-16 left-6 flex flex-col items-center">
          <img
            src={
              profileImage
                ? URL.createObjectURL(profileImage)
                : getImageUrl(profile.profileImage)
            }
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
          
          <div className="mt-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-black">{profile.name}</h1>
            <p className="text-sm text-gray-700">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-10">
        {/* Edit button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: ambassadorDashboardColor }}
          >
            {profile.program ? "Update Profile" : "Complete Profile"}
          </button>
        </div>

        {!isEditing ? (
          // View Mode - Redesigned
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div 
              className="px-6 py-4 border-b"
              style={{ 
                background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`,
                borderColor: `${ambassadorDashboardColor}30`
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: ambassadorDashboardColor }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
                  <p className="text-sm text-slate-600">Your personal and academic details</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Academic Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Program</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.program ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.program || "Not added"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Course</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.course ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.course || "Not added"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Current Year</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.year ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.year || "Not added"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Graduation Year</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.graduationYear ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.graduationYear || "Not added"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Personal Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">State</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.state ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.state || "Not added"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Country</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.country ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.country || "Not added"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Languages</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        languages[0] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
              {languages[0] ? languages.join(", ") : "Not added"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-slate-700">Extracurriculars</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        extracurriculars[0] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
              {extracurriculars[0] ? extracurriculars.join(", ") : "Not added"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Me
                </h3>
                <div className={`p-4 rounded-lg border ${
                  profile.about ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm ${
                    profile.about ? 'text-slate-700' : 'text-gray-500 italic'
                  }`}>
                    {profile.about || "No description added yet. Click 'Update Profile' to add your bio."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode - Redesigned Form
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div 
              className="px-6 py-4 border-b"
              style={{ 
                background: `linear-gradient(135deg, ${ambassadorDashboardColor}15, ${ambassadorDashboardColor}10)`,
                borderColor: `${ambassadorDashboardColor}30`
              }}
            >
              <h2 className="text-xl font-bold text-slate-800">Update Your Profile</h2>
              <p className="text-sm text-slate-600 mt-1">Complete your profile to help students connect with you</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Profile Images
                </h3>
                
            <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Profile Image <span className="text-red-500">*</span>
                </label>
                    <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                        onChange={(e) => handleFileChange(e, setProfileImage, 'profileImage')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-gray-600 font-medium mb-1">Choose File</p>
                          <p className="text-xs text-gray-500">No file chosen</p>
                          <p className="text-xs text-gray-400 mt-1">Click to upload profile image</p>
                        </div>
                      </div>
                    </div>
                    {errors.profileImage && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.profileImage}
                      </p>
                    )}
              </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Cover Image <span className="text-red-500">*</span>
                </label>
                    <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                        onChange={(e) => handleFileChange(e, setThumbnailImage, 'thumbnailImage')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-gray-600 font-medium mb-1">Choose File</p>
                          <p className="text-xs text-gray-500">No file chosen</p>
                          <p className="text-xs text-gray-400 mt-1">Click to upload cover image</p>
                        </div>
                      </div>
                    </div>
                    {errors.thumbnailImage && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.thumbnailImage}
                      </p>
                    )}
                  </div>
              </div>
            </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { name: "name", label: "Full Name", type: "text", required: true },
                    { name: "program", label: "Program", type: "text", required: true },
                    { name: "course", label: "Course", type: "text", required: true },
                    { name: "year", label: "Current Year", type: "text", required: true },
                    { name: "graduationYear", label: "Graduation Year", type: "text", required: true, placeholder: "e.g., 2024" },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        defaultValue={profile[field.name]}
                        placeholder={field.placeholder}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location <span className="text-red-500">*</span>
                  </h4>
                  
                  {/* Location Type Radio Buttons */}
                  <div className="space-y-3">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="locationType"
                          value="within-india"
                          checked={locationType === 'within-india'}
                          onChange={(e) => setLocationType(e.target.value)}
                          className="w-4 h-4 focus:ring-2"
                          style={{ 
                            color: ambassadorDashboardColor,
                            focusRingColor: ambassadorDashboardColor
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">Within India</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="locationType"
                          value="outside-india"
                          checked={locationType === 'outside-india'}
                          onChange={(e) => setLocationType(e.target.value)}
                          className="w-4 h-4 focus:ring-2"
                          style={{ 
                            color: ambassadorDashboardColor,
                            focusRingColor: ambassadorDashboardColor
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">Outside India</span>
                      </label>
              </div>
            </div>

                  {/* Location Fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* State Field - Only show if within India */}
                    {locationType === 'within-india' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          State <span className="text-red-500">*</span>
                </label>
                        <div className="relative">
                          <select
                            name="state"
                            defaultValue={profile.state}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none ${
                              errors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                            style={{ 
                              maxHeight: '150px',
                              overflowY: 'auto'
                            }}
                          >
                          <option value="">Select State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                          <option value="Ladakh">Ladakh</option>
                          <option value="Lakshadweep">Lakshadweep</option>
                          <option value="Puducherry">Puducherry</option>
                        </select>
                        {/* Dropdown Arrow */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                        {errors.state && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.state}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Country Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                        name="country"
                        defaultValue={profile.country}
                        placeholder={locationType === 'within-india' ? 'India' : 'Enter your country'}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.country && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Languages <span className="text-red-500">*</span>
                </h3>
                
                <div className="space-y-3">
              {languages.map((lang, i) => (
                    <div key={i} className="flex gap-3">
                <input
                  type="text"
                  value={lang}
                        onChange={(e) => handleChangeField(setLanguages, languages, i, e.target.value)}
                        placeholder={`Language ${i + 1}`}
                        className={`flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.languages ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = languages.filter((_, index) => index !== i)
                            setLanguages(updated)
                          }}
                          className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
              <button
                type="button"
                onClick={() => handleAddField(setLanguages, languages)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-80"
                    style={{ 
                      color: ambassadorDashboardColor,
                      backgroundColor: `${ambassadorDashboardColor}10`
                    }}
              >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Language
              </button>
                  
                  {errors.languages && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.languages}
                    </p>
                  )}
                </div>
            </div>

              {/* Extracurriculars Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Extracurricular Activities <span className="text-red-500">*</span>
                </h3>
                
                <div className="space-y-3">
              {extracurriculars.map((act, i) => (
                    <div key={i} className="flex gap-3">
                <input
                  type="text"
                  value={act}
                        onChange={(e) => handleChangeField(setExtracurriculars, extracurriculars, i, e.target.value)}
                        placeholder={`Activity ${i + 1}`}
                        className={`flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.extracurriculars ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {extracurriculars.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = extracurriculars.filter((_, index) => index !== i)
                            setExtracurriculars(updated)
                          }}
                          className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
              <button
                type="button"
                    onClick={() => handleAddField(setExtracurriculars, extracurriculars)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-80"
                    style={{ 
                      color: ambassadorDashboardColor,
                      backgroundColor: `${ambassadorDashboardColor}10`
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Activity
              </button>
                  
                  {errors.extracurriculars && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.extracurriculars}
                    </p>
                  )}
                </div>
            </div>

              {/* About Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  About You <span className="text-red-500">*</span>
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Tell students about yourself, your experience, and how you can help them
                  </label>
              <textarea
                name="about"
                    rows="6"
                defaultValue={profile.about}
                    onChange={handleInputChange}
                    placeholder="Share your story, academic journey, and how you can help students..."
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                      errors.about ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      {errors.about && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.about}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Minimum 50 characters</p>
                  </div>
                </div>
            </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: ambassadorDashboardColor }}
              >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                Save Changes
                    </>
                  )}
              </button>
              <button
                type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setErrors({})
                  }}
                  className="flex-1 py-4 rounded-xl font-semibold text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
