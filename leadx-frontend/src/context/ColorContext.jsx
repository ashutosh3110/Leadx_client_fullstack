import React, { createContext, useContext, useState, useEffect } from "react"

const ColorContext = createContext()

export const useColorContext = () => {
  const context = useContext(ColorContext)
  if (!context) {
    throw new Error("useColorContext must be used within a ColorProvider")
  }
  return context
}

export const ColorProvider = ({ children }) => {
  const [adminDashboardColor, setAdminDashboardColor] = useState("#1098e8") // Same as sidebar
  const [ambassadorDashboardColor, setAmbassadorDashboardColor] =
    useState("#1098e8") // Same as sidebar

  // Load colors from localStorage on mount
  useEffect(() => {
    // Force update to new color
    setAdminDashboardColor("#1098e8")
    setAmbassadorDashboardColor("#1098e8")
    localStorage.setItem("adminDashboardColor", "#1098e8")
    localStorage.setItem("ambassadorDashboardColor", "#1098e8")
  }, [])

  // Save colors to localStorage when they change
  useEffect(() => {
    localStorage.setItem("adminDashboardColor", adminDashboardColor)
  }, [adminDashboardColor])

  useEffect(() => {
    localStorage.setItem("ambassadorDashboardColor", ambassadorDashboardColor)
  }, [ambassadorDashboardColor])

  const updateAdminDashboardColor = (color) => {
    setAdminDashboardColor(color)
  }

  const updateAmbassadorDashboardColor = (color) => {
    setAmbassadorDashboardColor(color)
  }

  const value = {
    adminDashboardColor,
    ambassadorDashboardColor,
    updateAdminDashboardColor,
    updateAmbassadorDashboardColor,
  }

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
}
