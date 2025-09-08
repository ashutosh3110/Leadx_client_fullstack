// src/utils/Api.js
import axios from "axios"
import { getToken, removeAuth, getUser, setAuth } from "./auth"

const base = import.meta.env.VITE_API_URL
// console.log("This is my base url here", base)
const api = axios.create({
  baseURL: `${base}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 120000,
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token && config.headers)
      config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (err) => Promise.reject(err)
)

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      removeAuth()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export function getCurrentUser() {
  // console.log('running the getCurrentUser')
  const local = getUser()
  if (local) return local
  console.log("running the getCurrentUser line 2")

  return null
}

export default api
