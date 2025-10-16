import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"
import api from "../utils/Api"
import { setAuth } from "../utils/auth" // ✅ import setAuth

const API_URL = import.meta.env.VITE_API_URL

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  })

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true)
        const res = await axios.post(`${API_URL}/api/auth/login`, values)
        const token = res.data.data.token
        const user = res.data.data.user
        const role = user.role
        // Use setAuth function to properly store auth data
        setAuth(token, user)

        if (role === "admin") {
          navigate("/admin")
        } else if (role === "ambassador") {
          navigate("/ambassador")
        } else if (role === "user") {
          navigate("/user/dashboard")
        } else {
          navigate("/unauthorized")
        }

        resetForm()
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || "Login failed")
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-1">
          Login
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Access your account
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
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
                placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-[11px] text-gray-500 text-center">
            By logging in, you agree to our Terms & Privacy Policy.
          </p>
        </form>

        <p className="text-sm text-center text-gray-700 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold"
            style={{ color: "rgb(188, 23, 32)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
