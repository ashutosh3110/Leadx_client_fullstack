// embed.js
import React from "react"
import { createRoot } from "react-dom/client"
import AmbassadorList from "./AmbassadorList" // Import your AmbassadorList component
import { CustomizationContext } from "./context/CustomizationContext" // Import your context

;(function () {
  // Find the script tag with data-config
  const scriptTag = document.querySelector("script[data-config]")
  if (!scriptTag) {
    console.error("No script tag with data-config found")
    return
  }

  // Get the configuration from data-config
  const encodedConfig = scriptTag.getAttribute("data-config")
  if (!encodedConfig) {
    console.error("No configuration data found in data-config")
    return
  }

  try {
    // Decode and parse the configuration
    const config = JSON.parse(atob(encodedConfig))

    // Check if the script is active
    if (!config.isActive) {
      console.warn("Script is not active")
      return
    }

    // Get the current website's URL
    const currentUrl = window.location.origin // e.g., https://example.com
    const configuredUrl = config.url.replace(/\/$/, "") // Remove trailing slash
    const currentUrlNormalized = currentUrl.replace(/\/$/, "")

    // Check if the current URL matches the configured URL
    if (currentUrlNormalized !== configuredUrl) {
      console.warn(
        `Script is configured for ${configuredUrl} but running on ${currentUrlNormalized}`
      )
      return
    }

    // Find the container to render the AmbassadorList
    const container = document.getElementById("ambassador-container")
    if (!container) {
      console.error('No element with id "ambassador-container" found')
      return
    }

    // Create a root and render the AmbassadorList with the configuration
    const root = createRoot(container)
    root.render(
      <CustomizationContext.Provider
        value={{ customization: config, updateCustomization: () => {} }}
      >
        <AmbassadorList />
      </CustomizationContext.Provider>
    )
  } catch (error) {
    console.error("Error initializing ambassador script:", error)
  }
})()
