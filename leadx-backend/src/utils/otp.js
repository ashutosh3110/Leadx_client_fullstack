export const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

export const generateExpiry = () => new Date(Date.now() + 5 * 60 * 1000) // 5 min
