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
      } catch (err) {
        console.error(err)
        toast.error("Failed to fetch profile ❌")
      }
    }
    fetchProfile()
  }, [])

  const handleAddField = (setter, values) => setter([...values, ""])
  const handleChangeField = (setter, values, i, v) => {
    const updated = [...values]
    updated[i] = v
    setter(updated)
  }

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0]
    if (file) setter(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()

    // basic fields
    ;[
      "name",
      "program",
      "course",
      "year",
      "graduationYear",
      "country",
      "state",
      "about",
    ].forEach((f) => formData.append(f, e.target[f].value))

    // arrays
    languages.forEach(
      (lang, i) => lang.trim() && formData.append(`languages[${i}]`, lang)
    )
    extracurriculars.forEach(
      (act, i) => act.trim() && formData.append(`extracurriculars[${i}]`, act)
    )

    // files
    if (profileImage) formData.append("profileImage", profileImage)
    if (thumbnailImage) formData.append("thumbnailImage", thumbnailImage)

    try {
      const res = await api.patch("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setProfile(res.data.data)
      setProfileImage(null)
      setThumbnailImage(null)
      setIsEditing(false)
      toast.success("Profile Updated Successfully ✅")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update profile ❌")
    }
  }

  if (!profile) return <p className="text-center mt-8">Loading profile...</p>

  return (
    <div className="min-h-screen bg-gray-50">
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
          // View Mode
          <div className="bg-white rounded-xl shadow p-6 space-y-3">
            <h2 className="text-lg font-semibold border-b pb-2 mb-2">
              Profile
            </h2>
            <p>
              <b>Program:</b> {profile.program || "Not added"}
            </p>
            <p>
              <b>Course:</b> {profile.course || "Not added"}
            </p>
            <p>
              <b>Year:</b> {profile.year || "Not added"}
            </p>
            <p>
              <b>Graduation Year:</b> {profile.graduationYear || "Not added"}
            </p>
            <p>
              <b>Languages:</b>{" "}
              {languages[0] ? languages.join(", ") : "Not added"}
            </p>
            <p>
              <b>Extracurriculars:</b>{" "}
              {extracurriculars[0] ? extracurriculars.join(", ") : "Not added"}
            </p>
            <p>
              <b>Country:</b> {profile.country || "Not added"}
            </p>
            <p>
              <b>State:</b> {profile.state || "Not added"}
            </p>
            <p>
              <b>About:</b> {profile.about || "Not added"}
            </p>
          </div>
        ) : (
          // Edit Mode
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold border-b pb-2">
              Update Profile
            </h2>

            {/* Uploads */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setProfileImage)}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setThumbnailImage)}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </div>

            {/* Text fields */}
            {[
              "name",
              "program",
              "course",
              "year",
              "graduationYear",
              "country",
              "state",
            ].map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium capitalize">
                  {f}
                </label>
                <input
                  type="text"
                  name={f}
                  defaultValue={profile[f]}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            ))}

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium">Languages</label>
              {languages.map((lang, i) => (
                <input
                  key={i}
                  type="text"
                  value={lang}
                  onChange={(e) =>
                    handleChangeField(
                      setLanguages,
                      languages,
                      i,
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-2 mb-2"
                />
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setLanguages, languages)}
                className="px-4 py-1 text-sm rounded-lg bg-[rgb(188,23,32)] text-white"
              >
                + Add Language
              </button>
            </div>

            {/* Extracurriculars */}
            <div>
              <label className="block text-sm font-medium">
                Extracurriculars
              </label>
              {extracurriculars.map((act, i) => (
                <input
                  key={i}
                  type="text"
                  value={act}
                  onChange={(e) =>
                    handleChangeField(
                      setExtracurriculars,
                      extracurriculars,
                      i,
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg p-2 mb-2"
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  handleAddField(setExtracurriculars, extracurriculars)
                }
                className="px-4 py-1 text-sm rounded-lg bg-[rgb(188,23,32)] text-white"
              >
                + Add Activity
              </button>
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium">About</label>
              <textarea
                name="about"
                rows="4"
                defaultValue={profile.about}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-semibold text-white shadow hover:opacity-90 transition-opacity"
                style={{ backgroundColor: ambassadorDashboardColor }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-700 border"
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
