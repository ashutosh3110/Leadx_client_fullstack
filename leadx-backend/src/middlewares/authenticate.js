import JWT from "jsonwebtoken"
import errGen from "../utils/errGen.js"

// 🔑 Authenticate middleware
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return next(errGen(401, "No authorization token found!"))
  }

  try {
    const decoded = JWT.verify(token, process.env.JWT_ACCESS_SECRET)

    if (!decoded.id) {
      return next(errGen(401, "Invalid session! Please login again"))
    }

    req.user = decoded
    next()
  } catch (err) {
    return next(errGen(401, "Unauthorized Access!"))
  }
}

// 🔑 Role check middleware
export const checkRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.role

    if (userRole !== role) {
      return next(
        errGen(403, "You don't have permissions to perform this task")
      )
    }

    next()
  }
}
