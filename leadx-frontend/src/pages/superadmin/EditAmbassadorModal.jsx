import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditAmbassadorModal = ({ 
    isOpen, 
    onClose, 
    ambassador, 
    onUpdate 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        alternativeMobile: '',
        country: '',
        state: '',
        course: '',
        program: '',
        year: '',
        graduationYear: '',
        languages: [],
        extracurriculars: [],
        about: '',
        password: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (ambassador && isOpen) {
            setFormData({
                name: ambassador.name || '',
                email: ambassador.email || '',
                phone: ambassador.phone || '',
                alternativeMobile: ambassador.alternativeMobile || '',
                country: ambassador.country || '',
                state: ambassador.state || '',
                course: ambassador.course || '',
                program: ambassador.program || '',
                year: ambassador.year || '',
                graduationYear: ambassador.graduationYear || '',
                languages: ambassador.languages || [],
                extracurriculars: ambassador.extracurriculars || [],
                about: ambassador.about || '',
                password: '',
                status: ambassador.status || 'active'
            });
            setErrors({});
        }
    }, [ambassador, isOpen]);

    const handleInputChange = (field, value) => {
        console.log(`📝 Field changed: ${field} = ${value}`);
        
        setFormData(prev => {
            const updated = {
                ...prev,
                [field]: value
            };
            console.log('📝 Updated formData:', updated);
            if (field === 'status') {
                console.log('📝 Status changed to:', value);
            }
            return updated;
        });
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        }

        // Password validation (only if password is provided)
        if (formData.password.trim() && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        try {
            setLoading(true);
            
            // Create a copy of formData without password if it's empty
            const dataToSend = { ...formData };
            
            // Remove password field if it's empty or just whitespace
            if (!dataToSend.password || dataToSend.password.trim() === '') {
                delete dataToSend.password;
            }
            
            console.log('📤 Updating ambassador:', ambassador._id);
            console.log('📤 Data to send:', dataToSend);
            console.log('📤 Status in data:', dataToSend.status);
            
            await onUpdate(ambassador._id, dataToSend);
            
            toast.success('✅ Ambassador updated successfully!');
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            toast.error(`❌ Failed to update ambassador: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-end p-4"
            style={{ 
                zIndex: 10000,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-full overflow-y-auto"
                style={{ 
                    border: '1px solid #e2e8f0',
                }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <svg
                                className="w-5 h-5 text-blue-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Edit Ambassador
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Ambassador Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-2">Ambassador Details</h3>
                        <div className="text-sm text-slate-600">
                            <div className="font-medium">{ambassador?.name}</div>
                            <div className="text-xs text-slate-500">
                                {ambassador?.email}
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">Basic Information</h3>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.name ? 'border-red-500' : ''
                                }`}
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.email ? 'border-red-500' : ''
                                }`}
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.phone ? 'border-red-500' : ''
                                }`}
                                placeholder="Enter phone number"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Alternative Mobile
                            </label>
                            <input
                                type="tel"
                                value={formData.alternativeMobile}
                                onChange={(e) => handleInputChange('alternativeMobile', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Enter alternative mobile number"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter country"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter state"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <p className="text-xs text-slate-500">
                                Inactive ambassadors will not appear in ambassador cards
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter new password (leave blank to keep current)"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            <p className="text-xs text-slate-500">
                                Leave blank to keep current password. Ambassador will need to use new password for login.
                            </p>
                        </div>
                    </div>

                    {/* Education Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">Education Information</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Course
                                </label>
                                <input
                                    type="text"
                                    value={formData.course}
                                    onChange={(e) => handleInputChange('course', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="e.g., Computer Science"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Program
                                </label>
                                <input
                                    type="text"
                                    value={formData.program}
                                    onChange={(e) => handleInputChange('program', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="e.g., Bachelor's, Master's"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Year
                                </label>
                                <input
                                    type="text"
                                    value={formData.year}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="e.g., 3rd Year, Final Year"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    Graduation Year
                                </label>
                                <input
                                    type="text"
                                    value={formData.graduationYear}
                                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="e.g., 2024"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Languages and Extracurriculars */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">Languages & Activities</h3>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Languages (comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.languages.join(', ')}
                                onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang))}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="e.g., English, Hindi, Spanish"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Extracurriculars (comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.extracurriculars.join(', ')}
                                onChange={(e) => handleInputChange('extracurriculars', e.target.value.split(',').map(activity => activity.trim()).filter(activity => activity))}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="e.g., Sports, Music, Debate"
                            />
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-700 border-b border-slate-200 pb-2">About</h3>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                About
                            </label>
                            <textarea
                                value={formData.about}
                                onChange={(e) => handleInputChange('about', e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Update Ambassador'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAmbassadorModal;