import React from 'react';

const AmbassadorDetailModal = ({ 
    isOpen, 
    ambassador, 
    onClose, 
    handleApproveApplication, 
    handleRejectApplication, 
    handleAddReward,
    loading 
}) => {

    if (!isOpen || !ambassador) return null;

    const getLanguages = () => {
        // Handle languages from backend - it should be an array
        let languages = ambassador.languages || ambassador.language;
        
        // If languages is an array (as expected from backend)
        if (Array.isArray(languages)) {
            return languages.join(' | ');
        }
        
        // If it's a string, try to parse it
        if (typeof languages === 'string') {
            // Check if it's a JSON string
            try {
                const parsed = JSON.parse(languages);
                if (Array.isArray(parsed)) {
                    return parsed.join(' | ');
                }
            } catch (e) {
                // If not JSON, check if it has comma separation
                if (languages.includes(',')) {
                    return languages.split(',').map(lang => lang.trim()).join(' | ');
                }
            }
        }
        
        // If single language, return as is
        if (languages) {
            return languages;
        }
        
        // Fallback to default
        return 'Not specified';
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center p-2 sm:p-4"
            style={{ 
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-lg border border-slate-200 max-w-lg w-full max-h-[90vh] sm:max-h-[70vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1"></div>
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow flex-shrink-0">
                            <img
                                src={ambassador.profileImage ? `http://localhost:5000/${ambassador.profileImage}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                                alt={ambassador.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                                }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">{ambassador.name}</h2>
                            <p className="text-xs text-slate-600 truncate">{ambassador.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        {!ambassador.isVerified && (
                            <>
                                <button
                                    onClick={() => handleApproveApplication(ambassador._id || ambassador.id)}
                                    disabled={loading}
                                    className="px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-green-300 disabled:text-green-300"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleRejectApplication(ambassador._id)}
                                    disabled={loading}
                                    className="px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-red-300 disabled:text-red-300"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {ambassador.isVerified && (
                            <button
                                onClick={() => {
                                    console.log('🔍 AmbassadorDetailModal - Add Reward clicked for ambassador:', ambassador);
                                    console.log('🔍 AmbassadorDetailModal - Ambassador _id:', ambassador._id);
                                    console.log('🔍 AmbassadorDetailModal - Ambassador id:', ambassador.id);
                                    const ambassadorId = ambassador._id || ambassador.id;
                                    console.log('🔍 AmbassadorDetailModal - Final ambassadorId:', ambassadorId);
                                    handleAddReward(ambassadorId);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-sm font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span>Add Reward</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                    <div className="space-y-3">
                        {/* Compact Information Grid */}
                        <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</span>
                                    <span className="text-slate-800 font-medium">{ambassador.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Program</span>
                                    <span className="text-slate-800 font-medium">{ambassador.program || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course</span>
                                    <span className="text-slate-800 font-medium">{ambassador.course || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Year</span>
                                    <span className="text-slate-800 font-medium">{ambassador.year || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Graduation</span>
                                    <span className="text-slate-800 font-medium">{ambassador.graduationYear || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Country</span>
                                    <span className="text-slate-800 font-medium">{ambassador.country || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">State</span>
                                    <span className="text-slate-800 font-medium">{ambassador.state || 'Not provided'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registered</span>
                                    <span className="text-slate-800 font-medium">{new Date(ambassador.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Languages */}
                        {getLanguages() !== 'Not specified' && (
                            <div className="bg-blue-50/50 rounded p-2 border border-blue-200/30">
                                <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Languages</span>
                                <p className="text-xs text-blue-900 mt-1">{getLanguages()}</p>
                            </div>
                        )}

                        {/* Extracurriculars */}
                        {ambassador.extracurriculars && ambassador.extracurriculars.length > 0 && (
                            <div className="bg-green-50/50 rounded p-2 border border-green-200/30">
                                <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Extracurriculars</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {ambassador.extracurriculars.map((activity, index) => (
                                        <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* About */}
                        {ambassador.about && (
                            <div className="bg-amber-50/50 rounded p-2 border border-amber-200/30">
                                <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">About</span>
                                <p className="text-xs text-amber-900 leading-relaxed mt-1">
                                    {ambassador.about}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AmbassadorDetailModal;
