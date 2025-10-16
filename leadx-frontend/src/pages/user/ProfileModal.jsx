import React, { useState, useEffect } from 'react';
import { ambassadorAPI } from '../utils/Api'
import api from "../utils/Api"

const ProfileModal = ({ isOpen, onClose, ambassador }) => {
    const [profileData, setProfileData] = useState(ambassador || {});
    const [loading, setLoading] = useState(false);

    // Fetch updated profile data when modal opens
    useEffect(() => {
        if (isOpen && ambassador && ambassador._id) {
            fetchUpdatedProfile();
        } else if (ambassador) {
            // If no _id but ambassador exists, use the ambassador data
            setProfileData(ambassador);
        }
    }, [isOpen, ambassador]);

    const fetchUpdatedProfile = async () => {
        try {
            setLoading(true);
            console.log('Fetching updated profile for ID:', ambassador._id);
            
            // Try to fetch updated profile data
            const response = await api.get(`/api/auth/ambassadors/${ambassador._id}`);
            console.log('Profile response:', response.data);
            
            // Handle response format
            let userData;
            if (response.data.success && response.data.data) {
                userData = response.data.data.user || response.data.data;
            } else if (response.data.data) {
                userData = response.data.data;
            } else if (response.data.user) {
                userData = response.data.user;
            } else if (response.data._id) {
                userData = response.data;
            }
            
            if (userData && userData._id) {
                console.log('Successfully fetched updated profile:', userData);
                setProfileData(userData);
            } else {
                throw new Error('Invalid profile data received');
            }
        } catch (error) {
            console.error('Failed to fetch updated profile:', error);
            // Fallback to ambassador data passed from card
            setProfileData(ambassador || {});
        } finally {
            setLoading(false);
        }
    };

    const getLanguages = () => {
        // Handle languages from backend - it should be an array
        let languages = profileData.languages || profileData.language || ambassador.languages || ambassador.language;
        
        // If languages is an array (as expected from backend)
        if (Array.isArray(languages)) {
            const result = languages.join(' | ');
            return result;
        }
        
        // If it's a string, try to parse it
        if (typeof languages === 'string') {
            // Check if it's a JSON string
            try {
                const parsed = JSON.parse(languages);
                if (Array.isArray(parsed)) {
                    const result = parsed.join(' | ');
                    return result;
                }
            } catch (e) {
                // If not JSON, check if it has comma separation
                if (languages.includes(',')) {
                    const result = languages.split(',').map(lang => lang.trim()).join(' | ');
                    return result;
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


    if (!isOpen || !ambassador) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl border-2 border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Decorative Top Bar */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200/30 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {ambassador.name}
                            </h2>
                            <div className="flex items-center mt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Ambassador
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                            type="button"
                            aria-label="Close profile"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white/20 backdrop-blur-sm">
                    <div className="p-6 space-y-6">
                        {/* Academic Information */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Academic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200/50">
                                    <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Program</label>
                                    <p className="text-sm font-semibold text-blue-900 mt-1">{profileData.program || 'Not specified'}</p>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200/50">
                                    <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">Course</label>
                                    <p className="text-sm font-semibold text-purple-900 mt-1">{profileData.course || 'Not specified'}</p>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200/50">
                                    <label className="text-xs font-medium text-green-700 uppercase tracking-wide">Current Year</label>
                                    <p className="text-sm font-semibold text-green-900 mt-1">{profileData.year || 'Not specified'}</p>
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200/50">
                                    <label className="text-xs font-medium text-orange-700 uppercase tracking-wide">Expected Graduation</label>
                                    <p className="text-sm font-semibold text-orange-900 mt-1">{profileData.expectedGraduationYear || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200/50">
                                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Email</label>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">{profileData.email || 'Not specified'}</p>
                                </div>
                                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200/50">
                                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Phone</label>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">{profileData.phone || 'Not specified'}</p>
                                </div>
                                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200/50">
                                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Country</label>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">{profileData.country || 'Not specified'}</p>
                                </div>
                                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200/50">
                                    <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">State</label>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">{profileData.state || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Languages & Skills */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                Languages & Activities
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200/50">
                                    <label className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Languages</label>
                                    <p className="text-sm font-semibold text-indigo-900 mt-1">{getLanguages()}</p>
                                </div>
                                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200/50">
                                    <label className="text-xs font-medium text-pink-700 uppercase tracking-wide">Extracurriculars</label>
                                    <div className="mt-2">
                                        {profileData.extracurriculars && profileData.extracurriculars.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.extracurriculars.map((activity, index) => (
                                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 border border-pink-200">
                                                        {activity}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold text-pink-900">Not specified</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                About
                            </h3>
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200/50">
                                <p className="text-sm text-amber-900 leading-relaxed">
                                    {profileData.about || profileData.description || 'No description available.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-6 border-t border-slate-200/30 bg-white/40 backdrop-blur-sm">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm bg-white/60 backdrop-blur-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
