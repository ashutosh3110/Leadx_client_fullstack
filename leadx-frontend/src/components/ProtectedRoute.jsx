import { Navigate, Outlet } from "react-router-dom"
import { getToken, getUser } from "../pages/utils/auth" // ✅ use your auth utils

const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken()
  const user = getUser()
  const role = user?.role

  if (!token || !role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.includes(role)) {
    return <Outlet />
  }

  return <Navigate to="/unauthorized" replace />
}

export default ProtectedRoute
