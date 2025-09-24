// import React, { useState, useEffect, useRef } from 'react';
// import { createPortal } from 'react-dom';
// import { useColorContext } from '../../context/ColorContext';

// const ChatModal = ({ isOpen, onClose, ambassador }) => {
//   const { ambassadorDashboardColor } = useColorContext();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     message: '',
//     name: '',
//     email: '',
//     mobile: '',
//     whatsapp: true,
//     location: 'within',
//     state: '',
//     city: '',
//     selectedCourses: [],
//     recaptcha: false,
//     terms: false
//   });
//   const [errors, setErrors] = useState({});
//   const [showCourseDropdown, setShowCourseDropdown] = useState(false);
//   const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
//   const [courseSearch, setCourseSearch] = useState('');
//   const dropdownRef = useRef(null);
//   const buttonRef = useRef(null);

//   // Available courses
//   const availableCourses = [
//     'Undecided',
//     'BCA',
//     'PhD in Biochemistry',
//     'PhD in Chemistry',
//     'PhD in Civil Engineering',
//     'Computer Science Engineering',
//     'Electronics Engineering',
//     'Mechanical Engineering',
//     'Civil Engineering',
//     'Electrical Engineering',
//     'Information Technology',
//     'Data Science',
//     'Artificial Intelligence',
//     'Business Administration',
//     'Marketing',
//     'Finance',
//     'Human Resources',
//     'MBA',
//     'BBA',
//     'B.Tech',
//     'M.Tech',
//     'B.Sc',
//     'M.Sc',
//     'B.Com',
//     'M.Com'
//   ];

//   // Filter courses based on search
//   const filteredCourses = availableCourses.filter(course =>
//     course.toLowerCase().includes(courseSearch.toLowerCase())
//   );

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: ''
//       }));
//     }
//   };

//   // Validation functions
//   const validateStep1 = () => {
//     const newErrors = {};

//     if (!formData.message.trim()) {
//       newErrors.message = 'Message is required';
//     } else if (formData.message.trim().length < 10) {
//       newErrors.message = 'Message must be at least 10 characters';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     } else if (formData.name.trim().length < 2) {
//       newErrors.name = 'Name must be at least 2 characters';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }

//     if (!formData.mobile.trim()) {
//       newErrors.mobile = 'Mobile number is required';
//     } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
//       newErrors.mobile = 'Please enter a valid 10-digit mobile number';
//     }

//     if (formData.location === 'within' && !formData.state.trim()) {
//       newErrors.state = 'State is required';
//     }

//     if (!formData.city.trim()) {
//       newErrors.city = 'City is required';
//     }

//     if (!formData.recaptcha) {
//       newErrors.recaptcha = 'Please verify you are not a robot';
//     }

//     if (!formData.terms) {
//       newErrors.terms = 'Please accept the terms and conditions';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleContinue = () => {
//     let isValid = true;

//     if (currentStep === 1) {
//       isValid = validateStep1();
//     } else if (currentStep === 2) {
//       isValid = validateStep2();
//     }

//     if (isValid && currentStep < 3) {
//       setCurrentStep(currentStep + 1);
//     } else if (isValid && currentStep === 3) {
//       // Submit form
//       console.log('Form submitted:', formData);
//       setCurrentStep(4); // Show success message
//     }
//   };

//   const handleCourseSelect = (course, event) => {
//     event.stopPropagation(); // Prevent event bubbling
//     console.log('Selecting course:', course);
//     console.log('Current selectedCourses:', formData.selectedCourses);

//     setFormData(prev => {
//       const newSelectedCourses = prev.selectedCourses.includes(course)
//         ? prev.selectedCourses.filter(c => c !== course)
//         : [...prev.selectedCourses, course];

//       console.log('New selectedCourses:', newSelectedCourses);

//       return {
//         ...prev,
//         selectedCourses: newSelectedCourses
//       };
//     });
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowCourseDropdown(false);
//       }
//     };

//     if (showCourseDropdown) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showCourseDropdown]);

//   const handleGoBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };
// const getProfileImage=()=>{
//   const url=`http://localhost:5000/${ambassador.profileImage}`
//   return url;
// }
//   const handleClose = () => {
//     setCurrentStep(1);
//     setFormData({
//       message: '',
//       name: '',
//       email: '',
//       mobile: '',
//       whatsapp: true,
//       location: 'within',
//       state: '',
//       city: '',
//       selectedCourses: [],
//       recaptcha: false,
//       terms: false
//     });
//     setErrors({});
//     setShowCourseDropdown(false);
//     setCourseSearch('');
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
//       style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
//       onClick={handleClose}
//     >
//       <div
//         className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-300"
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//           backdropFilter: 'blur(10px)'
//         }}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 rounded-full overflow-hidden">
//               <img
//                 src={getProfileImage()}
//                 alt={ambassador?.name}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <h2 className="text-lg font-bold text-gray-900">
//               Get your query resolved in 3 easy steps
//             </h2>
//           </div>
//           <button
//             onClick={handleClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
//           >
//             ×
//           </button>
//         </div>

//         {/* Progress Steps */}
//         <div className="flex items-center justify-center p-3 border-b">
//           <div className="flex items-center space-x-3">
//             {/* Step 1 */}
//             <div className={`flex items-center space-x-1 ${currentStep >= 1 ? 'text-blue-500' : 'text-gray-400'}`}>
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
//                 currentStep > 1 ? 'text-white' :
//                 currentStep === 1 ? 'text-white' : 'bg-gray-200 text-gray-400'
//               }`}
//               style={{
//                 backgroundColor: currentStep >= 1 ? ambassadorDashboardColor : undefined
//               }}>
//                 {currentStep > 1 ? '✓' : '1'}
//               </div>
//               <span className="text-xs font-medium">Your Message</span>
//             </div>

//             <div className="w-3 h-0.5 bg-gray-300"></div>

//             {/* Step 2 */}
//             <div className={`flex items-center space-x-1 ${currentStep >= 2 ? 'text-blue-500' : 'text-gray-400'}`}>
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
//                 currentStep > 2 ? 'text-white' :
//                 currentStep === 2 ? 'text-white' : 'bg-gray-200 text-gray-400'
//               }`}
//               style={{
//                 backgroundColor: currentStep >= 2 ? ambassadorDashboardColor : undefined
//               }}>
//                 {currentStep > 2 ? '✓' : '2'}
//               </div>
//               <span className="text-xs font-medium">Your Information</span>
//             </div>

//             <div className="w-3 h-0.5 bg-gray-300"></div>

//             {/* Step 3 */}
//             <div className={`flex items-center space-x-1 ${currentStep >= 3 ? 'text-blue-500' : 'text-gray-400'}`}>
//               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
//                 currentStep > 3 ? 'text-white' :
//                 currentStep === 3 ? 'text-white' : 'bg-gray-200 text-gray-400'
//               }`}
//               style={{
//                 backgroundColor: currentStep >= 3 ? ambassadorDashboardColor : undefined
//               }}>
//                 {currentStep > 3 ? '✓' : '3'}
//               </div>
//               <span className="text-xs font-medium">Receive an Answer</span>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4 flex-1 overflow-y-auto">
//           {currentStep === 1 && (
//             <div className="space-y-4">
//               <div>
//                 <textarea
//                   value={formData.message}
//                   onChange={(e) => handleInputChange('message', e.target.value)}
//                   placeholder="Ask me about university courses, campus life and more!"
//                   className={`w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 text-sm ${
//                     errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
//                   }`}
//                   style={{
//                     focusRingColor: errors.message ? '#ef4444' : ambassadorDashboardColor
//                   }}
//                 />
//                 {errors.message && (
//                   <p className="text-xs text-red-600 mt-1">{errors.message}</p>
//                 )}
//               </div>

//               <div>
//                 <p className="text-xs text-gray-600 mb-2">You can ask me about</p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                   {[
//                     "Can you tell me how the course is?",
//                     "How is the extra curriculars?",
//                     "How are the placements, internships opportunities?",
//                     "How is the campus life?"
//                   ].map((question, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleInputChange('message', question)}
//                       className="flex items-center space-x-2 p-2 border border-red-500 rounded-lg text-left hover:bg-red-50 transition-colors"
//                     >
//                       <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
//                       </svg>
//                       <span className="text-xs text-gray-700">{question}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <div className="space-y-2">
//                   <span className="text-xs text-gray-600">Course Interest?</span>
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       ref={buttonRef}
//                       type="button"
//                       onClick={() => {
//                         if (buttonRef.current) {
//                           const rect = buttonRef.current.getBoundingClientRect();
//                           setDropdownPosition({
//                             top: rect.top + window.scrollY - 4, // Position above the button
//                             right: window.innerWidth - rect.right - window.scrollX,
//                             bottom: window.innerHeight - rect.top - window.scrollY + 4 // For upward opening
//                           });
//                         }
//                         setShowCourseDropdown(!showCourseDropdown);
//                       }}
//                       className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-between w-full min-h-[40px]"
//                     >
//                       <div className="flex-1 text-left">
//                         {(() => {
//                           console.log('Button rendering with selectedCourses:', formData.selectedCourses);
//                           return formData.selectedCourses.length > 0 ? (
//                             <div className="flex flex-wrap gap-1">
//                               {formData.selectedCourses.slice(0, 2).map((course) => (
//                                 <span key={course} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
//                                   {course}
//                                 </span>
//                               ))}
//                               {formData.selectedCourses.length > 2 && (
//                                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
//                                   +{formData.selectedCourses.length - 2} more
//                                 </span>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="text-gray-500">Select Courses</span>
//                           );
//                         })()}
//                       </div>
//                       <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${showCourseDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>

//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   * Your Name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   placeholder="Enter Your Name"
//                   className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
//                     errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
//                   }`}
//                 />
//                 {errors.name && (
//                   <p className="text-xs text-red-600 mt-1">{errors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   * Your Email Address
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   placeholder="Enter Your Email Address"
//                   className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
//                     errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
//                   }`}
//                 />
//                 {errors.email && (
//                   <p className="text-xs text-red-600 mt-1">{errors.email}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   * Your Mobile Number
//                 </label>
//                 <div className="flex">
//                   <div className="flex items-center px-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50">
//                     <span className="text-xs">🇮🇳 +91</span>
//                   </div>
//                   <input
//                     type="tel"
//                     value={formData.mobile}
//                     onChange={(e) => handleInputChange('mobile', e.target.value)}
//                     placeholder="Enter mobile number"
//                     className={`flex-1 p-2 border rounded-r-lg focus:outline-none focus:ring-2 text-sm ${
//                       errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
//                     }`}
//                   />
//                 </div>
//                 {errors.mobile && (
//                   <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>
//                 )}
//                 <label className="flex items-center mt-1">
//                   <input
//                     type="checkbox"
//                     checked={formData.whatsapp}
//                     onChange={(e) => handleInputChange('whatsapp', e.target.checked)}
//                     className="mr-1"
//                   />
//                   <span className="text-xs text-gray-600">This is also my WhatsApp number</span>
//                 </label>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   * Location
//                 </label>
//                 <div className="flex space-x-3">
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="location"
//                       value="within"
//                       checked={formData.location === 'within'}
//                       onChange={(e) => handleInputChange('location', e.target.value)}
//                       className="mr-1"
//                     />
//                     <span className="text-xs">Within india</span>
//                   </label>
//                   <label className="flex items-center">
//                     <input
//                       type="radio"
//                       name="location"
//                       value="outside"
//                       checked={formData.location === 'outside'}
//                       onChange={(e) => handleInputChange('location', e.target.value)}
//                       className="mr-1"
//                     />
//                     <span className="text-xs">Outside india</span>
//                   </label>
//                 </div>
//               </div>

//               {formData.location === 'within' && (
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     * Which state are you applying from
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.state}
//                     onChange={(e) => handleInputChange('state', e.target.value)}
//                     placeholder="Enter your state"
//                     className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
//                       errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
//                     }`}
//                   />
//                   {errors.state && (
//                     <p className="text-xs text-red-600 mt-1">{errors.state}</p>
//                   )}
//                 </div>
//               )}

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   * Which city are you applying from
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.city}
//                   onChange={(e) => handleInputChange('city', e.target.value)}
//                   placeholder="Enter your city"
//                   className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
//                     errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
//                   }`}
//                 />
//                 {errors.city && (
//                   <p className="text-xs text-red-600 mt-1">{errors.city}</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     checked={formData.recaptcha}
//                     onChange={(e) => handleInputChange('recaptcha', e.target.checked)}
//                     className={`mr-1 ${errors.recaptcha ? 'border-red-500' : ''}`}
//                   />
//                   <span className="text-xs text-gray-600">I'm not a robot</span>
//                   <div className="text-xs text-gray-500">reCAPTCHA</div>
//                 </div>
//                 {errors.recaptcha && (
//                   <p className="text-xs text-red-600 mt-1">{errors.recaptcha}</p>
//                 )}
//               </div>

//               <div>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     checked={formData.terms}
//                     onChange={(e) => handleInputChange('terms', e.target.checked)}
//                     className={`mr-1 ${errors.terms ? 'border-red-500' : ''}`}
//                   />
//                   <span className="text-xs text-gray-600">
//                     I agree to the <span className="text-red-500 underline">Terms of Use</span>, <span className="text-red-500 underline">Privacy Policy</span> and <span className="text-red-500 underline">Chat Rules</span>
//                   </span>
//                 </div>
//                 {errors.terms && (
//                   <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {currentStep === 3 && (
//             <div className="text-center py-6">
//               <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-2">Your message has been sent!</h3>
//               <p className="text-sm text-gray-600 mb-3">
//                 You will receive an email to <strong>{formData.email}</strong> when {ambassador?.name} replies.
//                 No further action needed from your side and you may close this window 😉
//               </p>
//               <p className="text-xs text-gray-500">
//                 If the email is not in your inbox, don't forget to check your junk mail or spam folders.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Footer Buttons */}
//         {currentStep < 4 && (
//           <div className="flex items-center justify-between p-4 border-t">
//             <button
//               onClick={handleGoBack}
//               className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
//             >
//               {currentStep === 1 ? 'Close' : '< Go Back'}
//             </button>
//             <button
//               onClick={handleContinue}
//               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
//             >
//               <span>{currentStep === 3 ? 'Send Message' : 'Continue'}</span>
//               {currentStep < 3 && <span>&gt;</span>}
//             </button>
//           </div>
//         )}

//         {currentStep === 4 && (
//           <div className="flex justify-end p-4 border-t">
//             <button
//               onClick={handleClose}
//               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
//             >
//               Close
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Portal for Course Dropdown */}
//       {showCourseDropdown && createPortal(
//         <>
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => {
//               setShowCourseDropdown(false);
//               setCourseSearch('');
//             }}
//           />
//           {/* Dropdown */}
//           <div
//             className="fixed w-64 bg-white border border-gray-300 rounded-lg shadow-xl max-h-40 overflow-hidden z-50"
//             style={{
//               bottom: dropdownPosition.bottom,
//               right: dropdownPosition.right
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Search Input */}
//             <div className="p-2 border-b border-gray-200">
//               <input
//                 type="text"
//                 placeholder="Search options"
//                 value={courseSearch}
//                 onChange={(e) => setCourseSearch(e.target.value)}
//                 onClick={(e) => e.stopPropagation()}
//                 className="w-full p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             {/* Course List */}
//             <div className="max-h-32 overflow-y-auto">
//               {filteredCourses.map((course) => (
//                 <label
//                   key={course}
//                   className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={formData.selectedCourses.includes(course)}
//                     onChange={(e) => handleCourseSelect(course, e)}
//                     className="w-3 h-3"
//                   />
//                   <span className="text-xs text-gray-700">{course}</span>
//                 </label>
//               ))}
//               {filteredCourses.length === 0 && (
//                 <div className="p-2 text-xs text-gray-500 text-center">
//                   No courses found
//                 </div>
//               )}
//             </div>
//           </div>
//         </>,
//         document.body
//       )}
//     </div>
//   );
// };

// export default ChatModal;

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useColorContext } from "../../context/ColorContext"
import { useCustomization } from "../../context/CustomizationContext"

const ChatModal = ({ isOpen, onClose, ambassador }) => {
  const { ambassadorDashboardColor } = useColorContext()
  const { customization } = useCustomization()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    message: "",
    name: "",
    email: "",
    mobile: "",
    whatsapp: true,
    location: "within",
    state: "",
    city: "",
    selectedCourses: [],
    recaptcha: false,
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [courseSearch, setCourseSearch] = useState("")
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Available courses
  const availableCourses = [
    "Undecided",
    "BCA",
    "PhD in Biochemistry",
    "PhD in Chemistry",
    "PhD in Civil Engineering",
    "Computer Science Engineering",
    "Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
    "Data Science",
    "Artificial Intelligence",
    "Business Administration",
    "Marketing",
    "Finance",
    "Human Resources",
    "MBA",
    "BBA",
    "B.Tech",
    "M.Tech",
    "B.Sc",
    "M.Sc",
    "B.Com",
    "M.Com",
  ]

  // Filter courses based on search
  const filteredCourses = availableCourses.filter((course) =>
    course.toLowerCase().includes(courseSearch.toLowerCase())
  )

  // Default questions if not customized
  const defaultQuestions = [
    "Can you tell me how the course is?",
    "How is the extra curriculars?",
    "How are the placements, internships opportunities?",
    "How is the campus life?",
  ]

  // Use customized questions or default
  const questions =
    customization.questions.length > 0
      ? customization.questions
      : defaultQuestions

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required"
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number"
    }

    if (formData.location === "within" && !formData.state.trim()) {
      newErrors.state = "State is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.recaptcha) {
      newErrors.recaptcha = "Please verify you are not a robot"
    }

    if (!formData.terms) {
      newErrors.terms = "Please accept the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    let isValid = true

    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else if (isValid && currentStep === 3) {
      // Submit form
      console.log("Form submitted:", formData)
      setCurrentStep(4) // Show success message
    }
  }

  const handleCourseSelect = (course, event) => {
    event.stopPropagation() // Prevent event bubbling
    console.log("Selecting course:", course)
    console.log("Current selectedCourses:", formData.selectedCourses)

    setFormData((prev) => {
      const newSelectedCourses = prev.selectedCourses.includes(course)
        ? prev.selectedCourses.filter((c) => c !== course)
        : [...prev.selectedCourses, course]

      console.log("New selectedCourses:", newSelectedCourses)

      return {
        ...prev,
        selectedCourses: newSelectedCourses,
      }
    })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false)
      }
    }

    if (showCourseDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCourseDropdown])

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  const getProfileImage = () => {
    const url = `http://localhost:5000/${ambassador.profileImage}`
    return url
  }
  const handleClose = () => {
    setCurrentStep(1)
    setFormData({
      message: "",
      name: "",
      email: "",
      mobile: "",
      whatsapp: true,
      location: "within",
      state: "",
      city: "",
      selectedCourses: [],
      recaptcha: false,
      terms: false,
    })
    setErrors({})
    setShowCourseDropdown(false)
    setCourseSearch("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={getProfileImage()}
                alt={ambassador?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Get your query resolved in 3 easy steps
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-3 border-b">
          <div className="flex items-center space-x-3">
            {/* Step 1 */}
            <div
              className={`flex items-center space-x-1 ${
                currentStep >= 1 ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep > 1
                    ? "text-white"
                    : currentStep === 1
                    ? "text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
                style={{
                  backgroundColor:
                    currentStep >= 1 ? ambassadorDashboardColor : undefined,
                }}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span className="text-xs font-medium">Your Message</span>
            </div>

            <div className="w-3 h-0.5 bg-gray-300"></div>

            {/* Step 2 */}
            <div
              className={`flex items-center space-x-1 ${
                currentStep >= 2 ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep > 2
                    ? "text-white"
                    : currentStep === 2
                    ? "text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
                style={{
                  backgroundColor:
                    currentStep >= 2 ? ambassadorDashboardColor : undefined,
                }}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className="text-xs font-medium">Your Information</span>
            </div>

            <div className="w-3 h-0.5 bg-gray-300"></div>

            {/* Step 3 */}
            <div
              className={`flex items-center space-x-1 ${
                currentStep >= 3 ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep > 3
                    ? "text-white"
                    : currentStep === 3
                    ? "text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
                style={{
                  backgroundColor:
                    currentStep >= 3 ? ambassadorDashboardColor : undefined,
                }}
              >
                {currentStep > 3 ? "✓" : "3"}
              </div>
              <span className="text-xs font-medium">Receive an Answer</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Ask me about university courses, campus life and more!"
                  className={`w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 text-sm ${
                    errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  style={{
                    focusRingColor: errors.message
                      ? "#ef4444"
                      : ambassadorDashboardColor,
                  }}
                />
                {errors.message && (
                  <p className="text-xs text-red-600 mt-1">{errors.message}</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-2">
                  You can ask me about
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleInputChange("message", question)}
                      className="flex items-center space-x-2 p-2 border border-red-500 rounded-lg text-left hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-3 h-3 text-red-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-gray-700">{question}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <span className="text-xs text-gray-600">
                    Course Interest?
                  </span>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      ref={buttonRef}
                      type="button"
                      onClick={() => {
                        if (buttonRef.current) {
                          const rect = buttonRef.current.getBoundingClientRect()
                          setDropdownPosition({
                            top: rect.top + window.scrollY - 4, // Position above the button
                            right:
                              window.innerWidth - rect.right - window.scrollX,
                            bottom:
                              window.innerHeight -
                              rect.top -
                              window.scrollY +
                              4, // For upward opening
                          })
                        }
                        setShowCourseDropdown(!showCourseDropdown)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-between w-full min-h-[40px]"
                    >
                      <div className="flex-1 text-left">
                        {(() => {
                          console.log(
                            "Button rendering with selectedCourses:",
                            formData.selectedCourses
                          )
                          return formData.selectedCourses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {formData.selectedCourses
                                .slice(0, 2)
                                .map((course) => (
                                  <span
                                    key={course}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                  >
                                    {course}
                                  </span>
                                ))}
                              {formData.selectedCourses.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                  +{formData.selectedCourses.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">
                              Select Courses
                            </span>
                          )
                        })()}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform flex-shrink-0 ${
                          showCourseDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  * Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter Your Name"
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-red-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  * Your Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter Your Email Address"
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-red-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  * Your Mobile Number
                </label>
                <div className="flex">
                  <div className="flex items-center px-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50">
                    <span className="text-xs">🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      handleInputChange("mobile", e.target.value)
                    }
                    placeholder="Enter mobile number"
                    className={`flex-1 p-2 border rounded-r-lg focus:outline-none focus:ring-2 text-sm ${
                      errors.mobile
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>
                )}
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={formData.whatsapp}
                    onChange={(e) =>
                      handleInputChange("whatsapp", e.target.checked)
                    }
                    className="mr-1"
                  />
                  <span className="text-xs text-gray-600">
                    This is also my WhatsApp number
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  * Location
                </label>
                <div className="flex space-x-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      value="within"
                      checked={formData.location === "within"}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="mr-1"
                    />
                    <span className="text-xs">Within india</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      value="outside"
                      checked={formData.location === "outside"}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="mr-1"
                    />
                    <span className="text-xs">Outside india</span>
                  </label>
                </div>
              </div>

              {formData.location === "within" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    * Which state are you applying from
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter your state"
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                      errors.state
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500"
                    }`}
                  />
                  {errors.state && (
                    <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  * Which city are you applying from
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                    errors.city
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-red-500"
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.recaptcha}
                    onChange={(e) =>
                      handleInputChange("recaptcha", e.target.checked)
                    }
                    className={`mr-1 ${
                      errors.recaptcha ? "border-red-500" : ""
                    }`}
                  />
                  <span className="text-xs text-gray-600">I'm not a robot</span>
                  <div className="text-xs text-gray-500">reCAPTCHA</div>
                </div>
                {errors.recaptcha && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.recaptcha}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.terms}
                    onChange={(e) =>
                      handleInputChange("terms", e.target.checked)
                    }
                    className={`mr-1 ${errors.terms ? "border-red-500" : ""}`}
                  />
                  <span className="text-xs text-gray-600">
                    I agree to the{" "}
                    <span className="text-red-500 underline">Terms of Use</span>
                    ,{" "}
                    <span className="text-red-500 underline">
                      Privacy Policy
                    </span>{" "}
                    and{" "}
                    <span className="text-red-500 underline">Chat Rules</span>
                  </span>
                </div>
                {errors.terms && (
                  <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Your message has been sent!
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                You will receive an email to <strong>{formData.email}</strong>{" "}
                when {ambassador?.name} replies. No further action needed from
                your side and you may close this window 😉
              </p>
              <p className="text-xs text-gray-500">
                If the email is not in your inbox, don't forget to check your
                junk mail or spam folders.
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between p-4 border-t">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              {currentStep === 1 ? "Close" : "< Go Back"}
            </button>
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 text-sm"
            >
              <span>{currentStep === 3 ? "Send Message" : "Continue"}</span>
              {currentStep < 3 && <span>&gt;</span>}
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex justify-end p-4 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Portal for Course Dropdown */}
      {showCourseDropdown &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setShowCourseDropdown(false)
                setCourseSearch("")
              }}
            />
            {/* Dropdown */}
            <div
              className="fixed w-64 bg-white border border-gray-300 rounded-lg shadow-xl max-h-40 overflow-hidden z-50"
              style={{
                bottom: dropdownPosition.bottom,
                right: dropdownPosition.right,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search options"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Course List */}
              <div className="max-h-32 overflow-y-auto">
                {filteredCourses.map((course) => (
                  <label
                    key={course}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedCourses.includes(course)}
                      onChange={(e) => handleCourseSelect(course, e)}
                      className="w-3 h-3"
                    />
                    <span className="text-xs text-gray-700">{course}</span>
                  </label>
                ))}
                {filteredCourses.length === 0 && (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    No courses found
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

export default ChatModal
