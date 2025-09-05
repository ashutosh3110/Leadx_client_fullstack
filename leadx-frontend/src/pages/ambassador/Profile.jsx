import React, { useEffect, useState } from "react"

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [languages, setLanguages] = useState([""])
  const [extracurriculars, setExtracurriculars] = useState([""])
  const [profileImage, setProfileImage] = useState(null)
  const [thumbnailImage, setThumbnailImage] = useState(null)

  useEffect(() => {
    // Mock API data (replace with real API call)
    const mockData = {
      name: "Priya Sharma",
      email: "priya@example.com",
      programme: "",
      course: "",
      year: "",
      graduationYear: "",
      languages: [],
      extracurriculars: [],
      country: "",
      state: "",
      about: "",
      profileImage: null,
      thumbnailImage: null,
    }
    setProfile(mockData)
    setLanguages(mockData.languages || [""])
    setExtracurriculars(mockData.extracurriculars || [""])
  }, [])

  const handleAddField = (setter, values) => {
    setter([...values, ""])
  }

  const handleChangeField = (setter, values, index, value) => {
    const updated = [...values]
    updated[index] = value
    setter(updated)
  }

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedProfile = {
      ...profile,
      name: e.target.name.value,
      programme: e.target.programme.value,
      course: e.target.course.value,
      year: e.target.year.value,
      graduationYear: e.target.graduationYear.value,
      languages,
      extracurriculars,
      country: e.target.country.value,
      state: e.target.state.value,
      about: e.target.about.value,
      profileImage,
      thumbnailImage,
    }
    setProfile(updatedProfile)
    setIsEditing(false)
    console.log("Updated Profile:", updatedProfile)
    alert("Profile Updated (check console)")
  }

  if (!profile) return <p className="text-center mt-8">Loading profile...</p>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gray-200">
        {profile.thumbnailImage && (
          <img
            src={
              typeof profile.thumbnailImage === "string"
                ? profile.thumbnailImage
                : URL.createObjectURL(profile.thumbnailImage)
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute -bottom-16 left-6 flex items-center gap-4">
          {profile.profileImage ? (
            <img
              src={
                typeof profile.profileImage === "string"
                  ? profile.profileImage
                  : URL.createObjectURL(profile.profileImage)
              }
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-gray-600">
              No Image
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
            <p className="text-sm text-gray-600">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-10">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          {/* <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
              Share Profile
            </button>
            <button className="px-4 py-2 rounded-lg bg-[rgb(188,23,32)] text-white">
              Send Message
            </button>
          </div> */}
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white"
          >
            {profile.programme ? "Update Profile" : "Complete Profile"}
          </button>
        </div>

        {/* Profile Info */}
        {!isEditing ? (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Profile
            </h2>
            <p>
              <span className="font-semibold">Programme:</span>{" "}
              {profile.programme || "Not added"}
            </p>
            <p>
              <span className="font-semibold">Course:</span>{" "}
              {profile.course || "Not added"}
            </p>
            <p>
              <span className="font-semibold">Year:</span>{" "}
              {profile.year || "Not added"}
            </p>
            <p>
              <span className="font-semibold">Graduation Year:</span>{" "}
              {profile.graduationYear || "Not added"}
            </p>
            <p>
              <span className="font-semibold">Languages:</span>{" "}
              {languages.length ? languages.join(", ") : "Not added"}
            </p>
            <p>
              <span className="font-semibold">Extracurriculars:</span>{" "}
              {extracurriculars.length
                ? extracurriculars.join(", ")
                : "Not added"}
            </p>
            <p>
              <span className="font-semibold">Country:</span>{" "}
              {profile.country || "Not added"}
            </p>
            <p>
              <span className="font-semibold">State:</span>{" "}
              {profile.state || "Not added"}
            </p>
            <p>
              <span className="font-semibold">About:</span>{" "}
              {profile.about || "Not added"}
            </p>
          </div>
        ) : (
          // Edit Form with ALL FIELDS
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

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Programme</label>
                <input
                  type="text"
                  name="programme"
                  defaultValue={profile.programme}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">Course</label>
                <input
                  type="text"
                  name="course"
                  defaultValue={profile.course}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Year / Semester
                </label>
                <input
                  type="text"
                  name="year"
                  defaultValue={profile.year}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Expected Year of Graduation
              </label>
              <input
                type="text"
                name="graduationYear"
                defaultValue={profile.graduationYear}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium">Languages</label>
              {languages.map((lang, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={lang}
                  onChange={(e) =>
                    handleChangeField(
                      setLanguages,
                      languages,
                      idx,
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
              {extracurriculars.map((act, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={act}
                  onChange={(e) =>
                    handleChangeField(
                      setExtracurriculars,
                      extracurriculars,
                      idx,
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

            {/* Country & State */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input
                  type="text"
                  name="country"
                  defaultValue={profile.country}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input
                  type="text"
                  name="state"
                  defaultValue={profile.state}
                  className="w-full border rounded-lg p-2"
                />
              </div>
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
                className="flex-1 py-3 rounded-xl font-semibold text-white shadow bg-[rgb(188,23,32)]"
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
