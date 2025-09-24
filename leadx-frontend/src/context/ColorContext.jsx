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
  const [adminDashboardColor, setAdminDashboardColor] = useState("#4682B4") // Steel Blue (same as sidebar)
  const [ambassadorDashboardColor, setAmbassadorDashboardColor] =
    useState("#4682B4") // Same as admin - Steel Blue

  // Load colors from localStorage on mount
  useEffect(() => {
    const savedAdminColor = localStorage.getItem("adminDashboardColor")
    const savedAmbassadorColor = localStorage.getItem(
      "ambassadorDashboardColor"
    )

    if (savedAdminColor) {
      setAdminDashboardColor(savedAdminColor)
    }
    if (savedAmbassadorColor) {
      setAmbassadorDashboardColor(savedAmbassadorColor)
    } else {
      // Set default Steel Blue color (same as admin) if no saved color
      setAmbassadorDashboardColor("#4682B4")
      localStorage.setItem("ambassadorDashboardColor", "#4682B4")
    }
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
