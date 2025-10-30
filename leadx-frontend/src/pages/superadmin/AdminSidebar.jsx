import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ 
    activeTab,
    setActiveTab,
    adminDashboardColor, 
    adminTextColor, 
    isSettingsDropdownOpen, 
    handleSettingsClick, 
    sidebarItems 
}) => {
    const navigate = useNavigate();
    
    return (
        <div
            className="w-48 h-screen shadow-2xl flex flex-col fixed left-0 top-0 z-40 hidden lg:flex backdrop-blur-sm bg-blue-600"
            style={{
                backgroundColor: '#1098e8',
                borderRight: `1px solid rgba(16, 152, 232, 0.2)`,
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="p-3 lg:p-4">

                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                    <img
                        src="/logo-new.png"
                        alt="LeadX Logo"
                        className="h-6 sm:h-7 object-contain"
                    />
                </div>


                {/* Navigation */}
                <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                        <div key={item.id} className={`relative ${item.id === 'settings' ? 'sidebar-settings' : ''}`}>
                            <button
                                onClick={() => {
                                    if (item.id === 'settings') {
                                        handleSettingsClick();
                                    } else {
                                        setActiveTab(item.id);
                                        navigate(`/admin/${item.id}`);
                                    }
                                }}
                                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-left group ${
                                    activeTab === item.id 
                                        ? 'bg-white/30 text-white shadow-xl scale-105 border border-white/30' 
                                        : 'text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg hover:scale-105 active:scale-95'
                                }`}
                                title={`Item ID: ${item.id}, Active: ${activeTab}, Match: ${activeTab === item.id}`}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.name}</span>
                            </button>

                            {/* Settings Dropdown */}
                            {item.id === 'settings' && isSettingsDropdownOpen && (
                                <div className="sidebar-settings absolute top-full left-0 mt-1 w-44 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20 py-1 z-50">
                                    <button
                                        onClick={() => navigate('/admin/customize')}
                                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2 rounded-md transition-all duration-200 hover:shadow-md"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                        </svg>
                                        <span>Ambassador Card customize</span>
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



