import { Navigate, Outlet } from "react-router-dom"
import { getToken, getUser } from "../pages/utils/auth" // ✅ use your auth utils

const ProtectedRoute = ({ allowedRoles }) => {
  const token = getToken()
  const user = getUser()
  const role = user?.role

  console.log("ProtectedRoute Debug:", { 
    token: !!token, 
    user, 
    role, 
    allowedRoles,
    userRole: user?.role,
    localStorage: {
      authToken: localStorage.getItem('authToken'),
      authUser: localStorage.getItem('authUser'),
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role')
    }
  })

  if (!token || !role) {
    console.log("Redirecting to login - missing token or role")
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.includes(role)) {
    console.log("Access granted for role:", role)
    return <Outlet />
  }

  console.log("Access denied - role not in allowed roles:", role, allowedRoles)
  return <Navigate to="/unauthorized" replace />
}

export default ProtectedRoute
