// src/utils/auth.js
const TOKEN_KEY = "authToken"
const EXPIRY_KEY = "authTokenExpiry"
const USER_KEY = "authUser"

// default expiry in days (change to 5 if you want 5 days)
const DEFAULT_DAYS = 7

function _msFromDays(days) {
  return days * 24 * 60 * 60 * 1000
}

// Save token and user with expiry (single source)
export const setAuth = (token, user, days = DEFAULT_DAYS) => {
  const now = Date.now()
  const expiry = now + _msFromDays(days)
  // token stored as plain string (compatible with your simple snippet)
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRY_KEY, expiry.toString())
  if (user) localStorage.setItem(USER_KEY, JSON.stringify({ user, expiry }))
}

// Convenience: set token-only
export const setToken = (token, days = DEFAULT_DAYS) => {
  const now = Date.now()
  const expiry = now + _msFromDays(days)
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRY_KEY, expiry.toString())
}

// Get token if not expired
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (!token || !expiry) return null
  const now = Date.now()
  if (now > parseInt(expiry, 10)) {
    removeAuth()
    return null
  }
  return token
}

// Get cached user if not expired (returns plain user object)
export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (!raw) return null
  try {
    // our stored shape: { user, expiry }
    const parsed = JSON.parse(raw)
    // check token expiry as single source-of-truth
    if (!expiry) {
      // if expiry missing, still return user (backward compat)
      return parsed.user ?? parsed
    }
    if (Date.now() > parseInt(expiry, 10)) {
      removeAuth()
      return null
    }
    return parsed.user ?? parsed
  } catch {
    // if parsing fails, clear stale data
    removeAuth()
    return null
  }
}

// Remove both token + user + expiry
export const removeAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRY_KEY)
  localStorage.removeItem(USER_KEY)
}

// Check login
export const isLoggedIn = () => {
  return !!getToken()
}
