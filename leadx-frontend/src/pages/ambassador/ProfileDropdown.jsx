import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, removeAuth } from '../utils/auth';

const ProfileDropdown = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const user = getUser();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const getImageUrl = (path) => {
        if (!path) return null
        if (path.startsWith("http")) return path
        const normalized = String(path).replace(/^\.\/+/, "").replace(/^\/+/, "")
        return `${API_URL}/${normalized}`
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleLogout = () => {
        removeAuth();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/ambassador/profile');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={dropdownRef}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
        >
            {/* Profile Header */}
            <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-purple-50">
                <div className="flex items-center space-x-3">
                    {user?.profileImage ? (
                        <img
                            src={getImageUrl(user.profileImage)}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-purple-200"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-200">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-800">{user?.name || 'Ambassador'}</h3>
                        <p className="text-xs text-slate-500">{user?.email || 'ambassador@example.com'}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="px-4 py-3 space-y-2">
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-600">Role</p>
                        <p className="text-sm font-semibold text-slate-800 capitalize">{user?.role || 'Ambassador'}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-600">Status</p>
                        <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-semibold text-green-600">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handleProfile}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                    </button>

                    <button className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors duration-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </button>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileDropdown;

