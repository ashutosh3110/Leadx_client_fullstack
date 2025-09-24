// import React, { useState, useEffect } from 'react';
// import { useCustomization } from '../../context/CustomizationContext';

// const CustomizationForm = () => {
//     const { customization, updateCustomization } = useCustomization();

//     const [formData, setFormData] = useState(customization);

//     const [colorFormat, setColorFormat] = useState({
//         backgroundColor: 'hex',
//         textColor: 'hex',
//         chatBackgroundColor: 'hex',
//         chatTextColor: 'hex',
//         gradientColor: 'hex'
//     });

//     // Sync form data with context when customization changes
//     useEffect(() => {
//         setFormData(customization);

//         // Auto-detect color formats based on saved values
//         const newColorFormat = { ...colorFormat };

//         if (customization.backgroundColor && customization.backgroundColor.startsWith('rgb')) {
//             newColorFormat.backgroundColor = 'rgb';
//         } else if (customization.backgroundColor && customization.backgroundColor.startsWith('#')) {
//             newColorFormat.backgroundColor = 'hex';
//         }

//         if (customization.textColor && customization.textColor.startsWith('rgb')) {
//             newColorFormat.textColor = 'rgb';
//         } else if (customization.textColor && customization.textColor.startsWith('#')) {
//             newColorFormat.textColor = 'hex';
//         }

//         if (customization.chatBackgroundColor && customization.chatBackgroundColor.startsWith('rgb')) {
//             newColorFormat.chatBackgroundColor = 'rgb';
//         } else if (customization.chatBackgroundColor && customization.chatBackgroundColor.startsWith('#')) {
//             newColorFormat.chatBackgroundColor = 'hex';
//         }

//         if (customization.chatTextColor && customization.chatTextColor.startsWith('rgb')) {
//             newColorFormat.chatTextColor = 'rgb';
//         } else if (customization.chatTextColor && customization.chatTextColor.startsWith('#')) {
//             newColorFormat.chatTextColor = 'hex';
//         }

//         if (customization.gradientColor && customization.gradientColor.startsWith('rgb')) {
//             newColorFormat.gradientColor = 'rgb';
//         } else if (customization.gradientColor && customization.gradientColor.startsWith('#')) {
//             newColorFormat.gradientColor = 'hex';
//         }

//         setColorFormat(newColorFormat);
//     }, [customization]);

//     const handleInputChange = (field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleColorFormatChange = (field, format) => {
//         setColorFormat(prev => ({
//             ...prev,
//             [field]: format
//         }));

//         // Reset color value when format changes
//         if (format === 'hex') {
//             setFormData(prev => ({
//                 ...prev,
//                 [field]: '#ffffff'
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [field]: 'rgb(255, 255, 255)'
//             }));
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log('Form submitted:', formData);

//         // Update the global customization context
//         updateCustomization(formData);

//         // Show success message
//         alert('Configuration saved successfully! The changes will be applied to the Chat buttons.');
//     };

//     const ColorInput = ({ field, label, value }) => {
//         const handleColorInputChange = (newValue) => {
//             handleInputChange(field, newValue);
//         };

//         const handleColorInputKeyDown = (e) => {
//             // For RGB format, handle special key combinations
//             if (colorFormat[field] === 'rgb') {
//                 // If user presses Ctrl+A or Cmd+A, select all text
//                 if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
//                     e.target.select();
//                     return;
//                 }

//                 // If user presses Delete or Backspace when all text is selected, clear the field
//                 if ((e.key === 'Delete' || e.key === 'Backspace') &&
//                     e.target.selectionStart === 0 && e.target.selectionEnd === e.target.value.length) {
//                     e.preventDefault();
//                     handleColorInputChange('');
//                     return;
//                 }
//             }
//         };

//         const handleColorInputFocus = (e) => {
//             // Auto-select all text when focusing on RGB input
//             if (colorFormat[field] === 'rgb') {
//                 setTimeout(() => {
//                     e.target.select();
//                 }, 10);
//             }
//         };

//         const handleColorPickerChange = (e) => {
//             const hexColor = e.target.value;
//             handleColorInputChange(hexColor);
//         };

//         const clearColorInput = () => {
//             handleColorInputChange('');
//         };

//         return (
//             <div className="space-y-1">
//                 <label className="block text-xs font-medium text-slate-700">
//                     {label}
//                 </label>
//                 <div className="flex space-x-2">
//                     <div className="flex space-x-1">
//                         <label className="flex items-center">
//                             <input
//                                 type="radio"
//                                 name={`${field}-format`}
//                                 checked={colorFormat[field] === 'hex'}
//                                 onChange={() => handleColorFormatChange(field, 'hex')}
//                                 className="mr-1 w-3 h-3 text-blue-600"
//                             />
//                             <span className="text-xs text-slate-600">HEX</span>
//                         </label>
//                         <label className="flex items-center">
//                             <input
//                                 type="radio"
//                                 name={`${field}-format`}
//                                 checked={colorFormat[field] === 'rgb'}
//                                 onChange={() => handleColorFormatChange(field, 'rgb')}
//                                 className="mr-1 w-3 h-3 text-blue-600"
//                             />
//                             <span className="text-xs text-slate-600">RGB</span>
//                         </label>
//                     </div>
//                     <div className="flex-1 flex space-x-1">
//                         {colorFormat[field] === 'hex' ? (
//                             <div className="relative">
//                                 <input
//                                     ref={(ref) => {
//                                         if (ref) {
//                                             ref.colorPickerField = field;
//                                         }
//                                     }}
//                                     type="color"
//                                     value={value.startsWith('#') ? value : '#ffffff'}
//                                     onChange={handleColorPickerChange}
//                                     className="absolute opacity-0 w-10 h-8 cursor-pointer"
//                                     style={{ zIndex: 10 }}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={(e) => {
//                                         e.preventDefault();
//                                         const colorInput = e.currentTarget.previousElementSibling;
//                                         if (colorInput) {
//                                             colorInput.click();
//                                         }
//                                     }}
//                                     className="w-10 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center relative"
//                                     title="Click to open color picker"
//                                     style={{
//                                         minWidth: '40px',
//                                         minHeight: '32px',
//                                         backgroundColor: value.startsWith('#') ? value : '#ffffff'
//                                     }}
//                                 >
//                                     <svg className="w-4 h-4 text-gray-600 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         ) : null}
//                         <div className="flex-1 relative">
//                             <input
//                                 type="text"
//                                 value={value}
//                                 onChange={(e) => handleColorInputChange(e.target.value)}
//                                 onKeyDown={handleColorInputKeyDown}
//                                 onFocus={handleColorInputFocus}
//                                 placeholder={colorFormat[field] === 'hex' ? '#ffffff' : 'rgb(255, 255, 255)'}
//                                 className="w-full p-2 pr-6 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
//                             />
//                             {value && (
//                                 <button
//                                     type="button"
//                                     onClick={clearColorInput}
//                                     className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 flex items-center justify-center"
//                                     title="Clear color"
//                                 >
//                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             )}
//                         </div>
//                         <div
//                             className="w-8 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-slate-400 transition-colors flex-shrink-0"
//                             style={{ backgroundColor: value || '#ffffff', minWidth: '32px', minHeight: '32px' }}
//                             title="Color preview - click to copy color"
//                             onMouseDown={(e) => e.stopPropagation()}
//                             onTouchStart={(e) => e.stopPropagation()}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 e.preventDefault();
//                                 if (value) {
//                                     navigator.clipboard.writeText(value).then(() => {
//                                         // Show temporary feedback
//                                         const originalTitle = e.target.title;
//                                         e.target.title = 'Color copied!';
//                                         setTimeout(() => {
//                                             e.target.title = originalTitle;
//                                         }, 1000);
//                                     }).catch(() => {
//                                         // Fallback for browsers that don't support clipboard API
//                                         console.log('Color value:', value);
//                                         const originalTitle = e.target.title;
//                                         e.target.title = 'Copy not supported';
//                                         setTimeout(() => {
//                                             e.target.title = originalTitle;
//                                         }, 1000);
//                                     });
//                                 }
//                             }}
//                         ></div>
//                     </div>
//                 </div>
//                 {colorFormat[field] === 'rgb' && (
//                     <div className="text-xs text-slate-500 mt-1">
//                         💡 Tip: Focus on the input and press Ctrl+A (or Cmd+A) to select all, then Delete to clear
//                     </div>
//                 )}
//                 {colorFormat[field] === 'hex' && (
//                     <div className="text-xs text-slate-500 mt-1">
//                         🎨 Tip: Click the color square to open the color picker palette
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4" style={{ touchAction: 'pan-y' }}>
//             <div className="max-w-3xl mx-auto">
//                 <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
//                     {/* Header */}
//                     <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1"></div>
//                     <div className="p-4">
//                         <div className="text-center mb-4">
//                             <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
//                                 Customization Form
//                             </h1>
//                             <p className="text-slate-600 text-sm">Configure your interface settings</p>
//                         </div>

//                         <form onSubmit={handleSubmit} className="space-y-3">
//                             {/* Design Settings Section */}
//                             <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
//                                 <h2 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
//                                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
//                                     </svg>
//                                     Design Settings
//                                 </h2>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     <ColorInput
//                                         field="backgroundColor"
//                                         label="Background Color"
//                                         value={formData.backgroundColor}
//                                     />

//                                     <ColorInput
//                                         field="textColor"
//                                         label="Text Color"
//                                         value={formData.textColor}
//                                     />

//                                     <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-slate-700">
//                                             Rounded Border (pixels)
//                                         </label>
//                                         <div className="relative">
//                                             <input
//                                                 type="number"
//                                                 value={formData.roundedBorder}
//                                                 onChange={(e) => handleInputChange('roundedBorder', e.target.value)}
//                                                 placeholder="8"
//                                                 min="0"
//                                                 className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
//                                             />
//                                             <span className="absolute left-3 top-3.5 text-slate-400 text-sm">px</span>
//                                         </div>
//                                     </div>

//                                     <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-slate-700">
//                                             Padding (pixels)
//                                         </label>
//                                         <div className="relative">
//                                             <input
//                                                 type="number"
//                                                 value={formData.padding}
//                                                 onChange={(e) => handleInputChange('padding', e.target.value)}
//                                                 placeholder="16"
//                                                 min="0"
//                                                 className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
//                                             />
//                                             <span className="absolute left-3 top-3.5 text-slate-400 text-sm">px</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* User Information Section */}
//                             <div className="bg-green-50/50 rounded-lg p-3 border border-green-200/30">
//                                 <h2 className="text-base font-semibold text-green-700 mb-2 flex items-center">
//                                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                     </svg>
//                                     User Information
//                                 </h2>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                     <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-slate-700">
//                                             Admission Year <span className="text-red-500">*</span>
//                                         </label>
//                                         <div className="relative">
//                                             <input
//                                                 type="number"
//                                                 value={formData.admissionYear}
//                                                 onChange={(e) => handleInputChange('admissionYear', e.target.value)}
//                                                 placeholder="2024"
//                                                 min="1900"
//                                                 max="2050"
//                                                 className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
//                                             />
//                                             <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                             </svg>
//                                         </div>
//                                     </div>

//                                     <div className="space-y-2">
//                                         <label className="block text-sm font-medium text-slate-700">
//                                             CAPTCHA Verification
//                                         </label>
//                                         <select
//                                             value={formData.captcha}
//                                             onChange={(e) => handleInputChange('captcha', e.target.value)}
//                                             className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200"
//                                         >
//                                             <option value="">Select verification status</option>
//                                             <option value="yes">Yes</option>
//                                             <option value="no">No</option>
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="mt-3 md:col-span-2">
//                                     <label className="flex items-center p-2 bg-white/60 rounded border border-slate-200 cursor-pointer">
//                                         <input
//                                             type="checkbox"
//                                             checked={formData.agreeTerms}
//                                             onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
//                                             className="mr-2 w-4 h-4 text-blue-600"
//                                         />
//                                         <span className="text-xs text-slate-700">
//                                             I agree to the <span className="text-blue-600 underline">Terms and Conditions</span> and <span className="text-blue-600 underline">Privacy Policy</span>
//                                         </span>
//                                     </label>
//                                 </div>
//                             </div>

//                             {/* Chat Settings Section */}
//                             <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
//                                 <h2 className="text-base font-semibold text-purple-700 mb-2 flex items-center">
//                                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                                     </svg>
//                                     Chat Settings
//                                 </h2>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//                                     <ColorInput
//                                         field="chatBackgroundColor"
//                                         label="Chat Background Color"
//                                         value={formData.chatBackgroundColor}
//                                     />

//                                     <ColorInput
//                                         field="chatTextColor"
//                                         label="Chat Text Color"
//                                         value={formData.chatTextColor}
//                                     />

//                                     <ColorInput
//                                         field="gradientColor"
//                                         label="Gradient Color"
//                                         value={formData.gradientColor}
//                                     />
//                                 </div>

//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-slate-700">
//                                         Add Question
//                                     </label>
//                                     <div className="relative">
//                                         <textarea
//                                             value={formData.question}
//                                             onChange={(e) => handleInputChange('question', e.target.value)}
//                                             placeholder="Type your question here..."
//                                             rows="4"
//                                             className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/90 backdrop-blur-sm transition-all duration-200 resize-none"
//                                         />
//                                         <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Preview Section */}
//                             <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/30">
//                                 <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center">
//                                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                     </svg>
//                                     Live Preview
//                                 </h3>
//                                 <div
//                                     className="p-3 rounded border text-xs"
//                                     style={{
//                                         backgroundColor: formData.backgroundColor,
//                                         color: formData.textColor,
//                                         borderRadius: `${formData.roundedBorder}px`,
//                                         padding: `${formData.padding}px`
//                                     }}
//                                 >
//                                     <p>Preview of your design settings</p>
//                                     <div
//                                         className="mt-1 p-2 rounded text-xs"
//                                         style={{
//                                             backgroundColor: formData.chatBackgroundColor,
//                                             color: formData.chatTextColor
//                                         }}
//                                     >
//                                         Chat preview
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Submit Button */}
//                             <div className="flex justify-center pt-3">
//                                 <button
//                                     type="submit"
//                                     className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
//                                 >
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                     <span>Save Configuration</span>
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CustomizationForm;

import React, { useState, useEffect } from "react"
import { useCustomization } from "../../context/CustomizationContext"

const CustomizationForm = () => {
  const { customization, updateCustomization } = useCustomization()

  const [formData, setFormData] = useState({
    ...customization,
    url: "",
    webname: "",
    isActive: false,
    questions: [], // Changed to array for multiple questions
  })

  const [colorFormat, setColorFormat] = useState({
    backgroundColor: "hex",
    textColor: "hex",
    chatBackgroundColor: "hex",
    chatTextColor: "hex",
    gradientColor: "hex",
  })

  const [generatedCode, setGeneratedCode] = useState("")
  const [error, setError] = useState("")

  // Sync form data with context when customization changes
  useEffect(() => {
    setFormData({
      ...customization,
      url: customization.url || "",
      webname: customization.webname || "",
      isActive: customization.isActive || false,
      questions: customization.questions || [],
    })

    // Auto-detect color formats based on saved values
    const newColorFormat = { ...colorFormat }

    ;[
      "backgroundColor",
      "textColor",
      "chatBackgroundColor",
      "chatTextColor",
      "gradientColor",
    ].forEach((field) => {
      if (customization[field] && customization[field].startsWith("rgb")) {
        newColorFormat[field] = "rgb"
      } else if (customization[field] && customization[field].startsWith("#")) {
        newColorFormat[field] = "hex"
      }
    })

    setColorFormat(newColorFormat)
  }, [customization])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (field === "url") {
      setError("") // Clear URL error when user types
    }
  }

  const handleColorFormatChange = (field, format) => {
    setColorFormat((prev) => ({
      ...prev,
      [field]: format,
    }))

    // Reset color value when format changes
    setFormData((prev) => ({
      ...prev,
      [field]: format === "hex" ? "#ffffff" : "rgb(255, 255, 255)",
    }))
  }

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate URL
    if (!formData.url) {
      setError("Website URL is required")
      return
    }
    if (!validateUrl(formData.url)) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    // Validate questions (limit to 5)
    if (formData.questions.length > 5) {
      setError("You can add up to 5 questions only")
      return
    }

    console.log("Form submitted:", formData)

    // Update the global customization context
    updateCustomization(formData)

    // Generate the embed script
    const config = JSON.stringify(formData)
    const encodedConfig = btoa(config) // Base64 encode to safely pass in data attribute

    const embedCode = `<script src="https://yourdomain.com/embed.js" data-config="${encodedConfig}" async></script>
<div id="ambassador-container"></div>`

    setGeneratedCode(embedCode)
    setError("")

    // Show success message
    alert("Configuration saved successfully! Embed script generated below.")
  }

  const ColorInput = ({ field, label, value }) => {
    const handleColorInputChange = (newValue) => {
      handleInputChange(field, newValue)
    }

    const handleColorInputKeyDown = (e) => {
      if (colorFormat[field] === "rgb") {
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.target.select()
          return
        }
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          e.target.selectionStart === 0 &&
          e.target.selectionEnd === e.target.value.length
        ) {
          e.preventDefault()
          handleColorInputChange("")
          return
        }
      }
    }

    const handleColorInputFocus = (e) => {
      if (colorFormat[field] === "rgb") {
        setTimeout(() => {
          e.target.select()
        }, 10)
      }
    }

    const handleColorPickerChange = (e) => {
      handleColorInputChange(e.target.value)
    }

    const clearColorInput = () => {
      handleColorInputChange("")
    }

    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-700">
          {label}
        </label>
        <div className="flex space-x-2">
          <div className="flex space-x-1">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${field}-format`}
                checked={colorFormat[field] === "hex"}
                onChange={() => handleColorFormatChange(field, "hex")}
                className="mr-1 w-3 h-3 text-blue-600"
              />
              <span className="text-xs text-slate-600">HEX</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${field}-format`}
                checked={colorFormat[field] === "rgb"}
                onChange={() => handleColorFormatChange(field, "rgb")}
                className="mr-1 w-3 h-3 text-blue-600"
              />
              <span className="text-xs text-slate-600">RGB</span>
            </label>
          </div>
          <div className="flex-1 flex space-x-1">
            {colorFormat[field] === "hex" && (
              <div className="relative">
                <input
                  type="color"
                  value={value && value.startsWith("#") ? value : "#ffffff"}
                  onChange={handleColorPickerChange}
                  className="absolute opacity-0 w-10 h-8 cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    const colorInput = e.currentTarget.previousElementSibling
                    if (colorInput) colorInput.click()
                  }}
                  className="w-10 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center relative"
                  title="Click to open color picker"
                  style={{
                    minWidth: "40px",
                    minHeight: "32px",
                    backgroundColor:
                      value && value.startsWith("#") ? value : "#ffffff",
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-600 opacity-75"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 relative">
              <input
                type="text"
                value={value || ""}
                onChange={(e) => handleColorInputChange(e.target.value)}
                onKeyDown={handleColorInputKeyDown}
                onFocus={handleColorInputFocus}
                placeholder={
                  colorFormat[field] === "hex"
                    ? "#ffffff"
                    : "rgb(255, 255, 255)"
                }
                className="w-full p-2 pr-6 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
              />
              {value && (
                <button
                  type="button"
                  onClick={clearColorInput}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600 flex items-center justify-center"
                  title="Clear color"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div
              className="w-8 h-8 border-2 border-slate-300 rounded cursor-pointer hover:border-slate-400 transition-colors flex-shrink-0"
              style={{
                backgroundColor: value || "#ffffff",
                minWidth: "32px",
                minHeight: "32px",
              }}
              title="Color preview - click to copy color"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (value) {
                  navigator.clipboard
                    .writeText(value)
                    .then(() => {
                      const originalTitle = e.target.title
                      e.target.title = "Color copied!"
                      setTimeout(() => (e.target.title = originalTitle), 1000)
                    })
                    .catch(() => {
                      console.log("Color value:", value)
                      const originalTitle = e.target.title
                      e.target.title = "Copy not supported"
                      setTimeout(() => (e.target.title = originalTitle), 1000)
                    })
                }
              }}
            ></div>
          </div>
        </div>
        {colorFormat[field] === "rgb" && (
          <div className="text-xs text-slate-500 mt-1">
            💡 Tip: Focus on the input and press Ctrl+A (or Cmd+A) to select
            all, then Delete to clear
          </div>
        )}
        {colorFormat[field] === "hex" && (
          <div className="text-xs text-slate-500 mt-1">
            🎨 Tip: Click the color square to open the color picker palette
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4"
      style={{ touchAction: "pan-y" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1"></div>
          <div className="p-4">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Customization Form
              </h1>
              <p className="text-slate-600 text-sm">
                Configure your interface settings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="bg-indigo-50/50 rounded-lg p-3 border border-indigo-200/30">
                <h2 className="text-base font-semibold text-indigo-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3"
                    />
                  </svg>
                  Website Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Website URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange("url", e.target.value)}
                      placeholder="https://example.com"
                      className={`w-full p-2 border rounded focus:outline-none focus:ring-1 text-xs bg-white ${
                        error ? "border-red-500" : "border-slate-300"
                      }`}
                    />
                    {error && (
                      <p className="text-xs text-red-600 mt-1">{error}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={formData.webname}
                      onChange={(e) =>
                        handleInputChange("webname", e.target.value)
                      }
                      placeholder="My Website"
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center space-y-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          handleInputChange("isActive", e.target.checked)
                        }
                        className="mr-1 w-3 h-3 text-blue-600"
                      />
                      <span className="text-xs text-slate-600">Is Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                <h2 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    />
                  </svg>
                  Design Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ColorInput
                    field="backgroundColor"
                    label="Background Color"
                    value={formData.backgroundColor}
                  />
                  <ColorInput
                    field="textColor"
                    label="Text Color"
                    value={formData.textColor}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Rounded Border (pixels)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.roundedBorder}
                        onChange={(e) =>
                          handleInputChange("roundedBorder", e.target.value)
                        }
                        placeholder="8"
                        min="0"
                        className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/90"
                      />
                      <span className="absolute left-3 top-3.5 text-slate-400 text-sm">
                        px
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Padding (pixels)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.padding}
                        onChange={(e) =>
                          handleInputChange("padding", e.target.value)
                        }
                        placeholder="16"
                        min="0"
                        className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/90"
                      />
                      <span className="absolute left-3 top-3.5 text-slate-400 text-sm">
                        px
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50/50 rounded-lg p-3 border border-green-200/30">
                <h2 className="text-base font-semibold text-green-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  User Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Admission Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.admissionYear}
                        onChange={(e) =>
                          handleInputChange("admissionYear", e.target.value)
                        }
                        placeholder="2024"
                        min="1900"
                        max="2050"
                        className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/90"
                      />
                      <svg
                        className="w-4 h-4 text-slate-400 absolute left-3 top-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      CAPTCHA Verification
                    </label>
                    <select
                      value={formData.captcha}
                      onChange={(e) =>
                        handleInputChange("captcha", e.target.value)
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/90"
                    >
                      <option value="">Select verification status</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 md:col-span-2">
                  <label className="flex items-center p-2 bg-white/60 rounded border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        handleInputChange("agreeTerms", e.target.checked)
                      }
                      className="mr-2 w-4 h-4 text-blue-600"
                    />
                    <span className="text-xs text-slate-700">
                      I agree to the{" "}
                      <span className="text-blue-600 underline">
                        Terms and Conditions
                      </span>{" "}
                      and{" "}
                      <span className="text-blue-600 underline">
                        Privacy Policy
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-200/30">
                <h2 className="text-base font-semibold text-purple-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Chat Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <ColorInput
                    field="chatBackgroundColor"
                    label="Chat Background Color"
                    value={formData.chatBackgroundColor}
                  />
                  <ColorInput
                    field="chatTextColor"
                    label="Chat Text Color"
                    value={formData.chatTextColor}
                  />
                  <ColorInput
                    field="gradientColor"
                    label="Gradient Color"
                    value={formData.gradientColor}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Add Default Questions (one per line, up to 5)
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.questions.join("\n")}
                      onChange={(e) =>
                        handleInputChange(
                          "questions",
                          e.target.value
                            .split("\n")
                            .filter((q) => q.trim())
                            .slice(0, 5)
                        )
                      }
                      placeholder="Type your questions here, one per line..."
                      rows="5"
                      className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/90 resize-none"
                    />
                    <svg
                      className="w-4 h-4 text-slate-400 absolute left-3 top-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/30">
                <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Live Preview
                </h3>
                <div
                  className="p-3 rounded border text-xs"
                  style={{
                    backgroundColor: formData.backgroundColor,
                    color: formData.textColor,
                    borderRadius: `${formData.roundedBorder}px`,
                    padding: `${formData.padding}px`,
                  }}
                >
                  <p>Preview of your design settings</p>
                  <div
                    className="mt-1 p-2 rounded text-xs"
                    style={{
                      backgroundColor: formData.chatBackgroundColor,
                      color: formData.chatTextColor,
                    }}
                  >
                    Chat preview
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Save Configuration & Generate Script</span>
                </button>
              </div>
            </form>

            {generatedCode && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">Generated Embed Script:</h3>
                <pre className="bg-white p-4 rounded border overflow-x-auto text-xs">
                  {generatedCode}
                </pre>
                <p className="text-xs mt-2 text-gray-600">
                  Copy this code and paste it into your website's HTML where you
                  want the ambassador cards to appear. The script will only run
                  on {formData.url}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomizationForm
