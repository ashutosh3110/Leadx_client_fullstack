import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ 
    adminDashboardColor, 
    adminTextColor, 
    isSettingsDropdownOpen, 
    handleSettingsClick, 
    handleCustomizeClick,
    sidebarItems 
}) => {
    const navigate = useNavigate();
    
    return (
        <div 
            className="w-64 h-screen shadow-lg flex flex-col fixed left-0 top-0 z-40 hidden lg:flex"
            style={{ 
                backgroundColor: '#4682B4',
                borderRight: `1px solid #4682B480`
            }}
        >
            <div className="p-4 lg:p-6">

                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 p-4 rounded-xl shadow-lg">
                        {/* LEAD EXAMINE Logo */}
                        <div className="flex items-center space-x-3">
                            {/* Graphic Element */}
                            <div className="relative">
                                {/* Orange Crescent */}
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center relative">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        {/* Graduation Cap */}
                                        <div className="w-4 h-2 bg-blue-600 rounded-sm relative">
                                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-400 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Text Element */}
                            <div className="text-white">
                                <div className="text-sm font-bold leading-tight">
                                    <div className="text-blue-400">LEAD</div>
                                    <div className="text-orange-400">EXAMINE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                        <div key={item.id} className={`relative ${item.id === 'settings' ? 'sidebar-settings' : ''}`}>
                            <button
                                onClick={() => {
                                    if (item.id === 'settings') {
                                        handleSettingsClick();
                                    } else {
                                        navigate(`/admin/${item.id}`);
                                    }
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-white/80 hover:text-white"
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </button>

                            {/* Settings Dropdown */}
                            {item.id === 'settings' && isSettingsDropdownOpen && (
                                <div className="sidebar-settings absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                    <button
                                        onClick={handleCustomizeClick}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                        </svg>
                                        <span>Ambassador Card customize</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/admin/settings');
                                            setIsSettingsDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Deshboard Customize</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

        </div>
    );
};

export default AdminSidebar;



