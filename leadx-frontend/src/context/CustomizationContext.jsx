// import React, { createContext, useContext, useState } from 'react';

// const CustomizationContext = createContext();

// export const useCustomization = () => {
//     const context = useContext(CustomizationContext);
//     if (!context) {
//         throw new Error('useCustomization must be used within a CustomizationProvider');
//     }
//     return context;
// };

// export const CustomizationProvider = ({ children }) => {
//     // Load saved customization from localStorage or use defaults
//     const getInitialCustomization = () => {
//         try {
//             const saved = localStorage.getItem('customization');
//             if (saved) {
//                 return JSON.parse(saved);
//             }
//         } catch (error) {
//             console.error('Error loading customization from localStorage:', error);
//         }

//         // Return default values if no saved data or error
//         return {
//             backgroundColor: '#ffffff',
//             textColor: '#000000',
//             roundedBorder: '8',
//             padding: '16',
//             admissionYear: '',
//             agreeTerms: false,
//             captcha: '',
//             chatBackgroundColor: '#3b82f6', // Default blue
//             chatTextColor: '#ffffff', // Default white
//             gradientColor: '#3b82f6', // Default blue for gradient
//             question: ''
//         };
//     };

//     const [customization, setCustomization] = useState(getInitialCustomization);

//     const updateCustomization = (newCustomization) => {
//         const updatedCustomization = {
//             ...customization,
//             ...newCustomization
//         };

//         setCustomization(updatedCustomization);

//         // Save to localStorage
//         try {
//             localStorage.setItem('customization', JSON.stringify(updatedCustomization));
//         } catch (error) {
//             console.error('Error saving customization to localStorage:', error);
//         }
//     };

//     return (
//         <CustomizationContext.Provider value={{ customization, updateCustomization }}>
//             {children}
//         </CustomizationContext.Provider>
//     );
// };

import React, { createContext, useContext, useState } from "react"

const CustomizationContext = createContext()

export const useCustomization = () => {
  const context = useContext(CustomizationContext)
  if (!context) {
    throw new Error(
      "useCustomization must be used within a CustomizationProvider"
    )
  }
  return context
}

export const CustomizationProvider = ({ children }) => {
  // Load saved customization from localStorage or use defaults
  const getInitialCustomization = () => {
    try {
      const saved = localStorage.getItem("customization")
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error("Error loading customization from localStorage:", error)
    }

    // Return default values if no saved data or error
    return {
      backgroundColor: "#ffffff",
      textColor: "#ffffff", // Text color for buttons and chat modal
      roundedBorder: "8",
      padding: "16",
      admissionYear: "",
      agreeTerms: false,
      captcha: "",
      chatBackgroundColor: "#3b82f6", // Default blue
      chatTextColor: "#ffffff", // Default white
      gradientColor: "#3b82f6", // Default blue for gradient
      questions: [], // Array of questions
      policyUrl: "", // New field for policy URL
      termsUrl: "", // New field for terms URL
      ambassadorCardBackgroundColor: "#3b82f6", // Background color for ambassador cards
      ambassadorCardBorderColor: "#e5e7eb", // Border color for ambassador cards
      // Web URL section fields
      webUrl: "", // Web URL field
      webName: "", // Web Name field
      status: "active", // Status dropdown field
      // Ambassador Card Settings - New fields
      tilesAndButtonColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Gradient color for tiles and buttons
      borderColor: "#e5e7eb", // Border color for cards and chat questions
      borderSize: "3", // Border size for ambassador cards (1-5)
    }
  }

  const [customization, setCustomization] = useState(getInitialCustomization)

  const updateCustomization = (newCustomization) => {
    const updatedCustomization = {
      ...customization,
      ...newCustomization,
    }

    setCustomization(updatedCustomization)

    // Save to localStorage
    try {
      localStorage.setItem(
        "customization",
        JSON.stringify(updatedCustomization)
      )
    } catch (error) {
      console.error("Error saving customization to localStorage:", error)
    }
  }

  return (
    <CustomizationContext.Provider
      value={{ customization, updateCustomization }}
    >
      {children}
    </CustomizationContext.Provider>
  )
}
