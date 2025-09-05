import respo from "../utils/respo.js"

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || "Something went wrong!"

  return res.status(status).json(respo(false, message))
}

export default errorHandler
