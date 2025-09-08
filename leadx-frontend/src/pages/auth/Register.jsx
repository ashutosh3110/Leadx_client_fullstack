import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../utils/Api"

const API_URL = import.meta.env.VITE_API_URL

const Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone")
      .required("Phone is required"),
    program: Yup.string().required("Program is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      program: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true)
        const res = await api.post("/auth/register", values)
        toast.success("Registration successful! 🎉")
        resetForm()
        navigate("/login")
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || "Registration failed")
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-1">
          Student Registration
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Create your account to become a campus ambassador
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              placeholder="e.g., Priya Sharma"
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(188,23,32)] ${
                formik.touched.name && formik.errors.name
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-600 mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="you@example.com"
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(188,23,32)] ${
                formik.touched.email && formik.errors.email
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-600 mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              placeholder="10-digit mobile number"
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(188,23,32)] ${
                formik.touched.phone && formik.errors.phone
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-xs text-red-600 mt-1">{formik.errors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="program"
              className="block text-sm font-medium text-gray-700"
            >
              Program
            </label>
            <select
              id="program"
              name="program"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.program}
              className={`mt-1 w-full rounded-xl border px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[rgb(188,23,32)] ${
                formik.touched.program && formik.errors.program
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
            >
              <option value="" disabled>
                Choose your program
              </option>
              <option value="B.Tech">B.Tech</option>
              <option value="MBA">MBA</option>
              <option value="BBA">BBA</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="Other">Other</option>
            </select>
            {formik.touched.program && formik.errors.program && (
              <p className="text-xs text-red-600 mt-1">
                {formik.errors.program}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                placeholder="Create a password"
                className={`mt-1 w-full rounded-xl border px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-[rgb(188,23,32)] ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 font-semibold text-white shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: "rgb(188, 23, 32)",
              boxShadow: "0 8px 20px rgba(188, 23, 32, 0.25)",
            }}
          >
            {loading ? "Submitting..." : "Create Account"}
          </button>

          <p className="text-[11px] text-gray-500 text-center">
            By signing up, you agree to our Terms & Privacy Policy.
          </p>
        </form>

        <p className="text-sm text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold"
            style={{ color: "rgb(188, 23, 32)" }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
