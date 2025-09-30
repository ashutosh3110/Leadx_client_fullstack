import JWT from "jsonwebtoken"
import errGen from "../utils/errGen.js"

// 🔑 Authenticate middleware
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(" ")[1]
  
  console.log('Auth middleware - Authorization header:', authHeader)
  console.log('Auth middleware - Extracted token:', token ? 'Present' : 'Missing')

  if (!token) {
    console.log('Auth middleware - No token found in request')
    return next(errGen(401, "No authorization token found!"))
  }

  try {
    const decoded = JWT.verify(token, process.env.JWT_ACCESS_SECRET)
    console.log('Auth middleware - Decoded token:', decoded)

    if (!decoded.id) {
      return next(errGen(401, "Invalid session! Please login again"))
    }

    req.user = decoded
    console.log('Auth middleware - User ID:', req.user.id, 'Role:', req.user.role)
    next()
  } catch (err) {
    console.log('Auth middleware - JWT error:', err.message)
    return next(errGen(401, "Unauthorized Access!"))
  }
}

// 🔑 Role check middleware
export const checkRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.role
    console.log('🔍 checkRole - Required role:', role)
    console.log('🔍 checkRole - User role:', userRole)
    console.log('🔍 checkRole - User object:', req.user)

    if (userRole !== role) {
      console.log('🔍 checkRole - Access denied, role mismatch')
      return next(
        errGen(403, "You don't have permissions to perform this task")
      )
    }

    console.log('🔍 checkRole - Access granted')
    next()
  }
}
