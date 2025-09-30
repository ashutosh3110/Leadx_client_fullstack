import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ 
    activeTab,
    setActiveTab,
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
            className="w-64 h-screen shadow-2xl flex flex-col fixed left-0 top-0 z-40 hidden lg:flex backdrop-blur-sm"
            style={{ 
                backgroundColor: '#1098e8',
                borderRight: `1px solid rgba(16, 152, 232, 0.2)`,
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="p-4 lg:p-6">

                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                        <img
                            src="/logo-new.png"
                            alt="LeadX Logo"
                            className="h-8 sm:h-10 object-contain"
                        />
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
                                        setActiveTab(item.id);
                                        navigate(`/admin/${item.id}`);
                                    }
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group ${
                                    activeTab === item.id 
                                        ? 'bg-white/30 text-white shadow-xl scale-105 border border-white/30' 
                                        : 'text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg hover:scale-105 active:scale-95'
                                }`}
                                title={`Item ID: ${item.id}, Active: ${activeTab}, Match: ${activeTab === item.id}`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </button>

                            {/* Settings Dropdown */}
                            {item.id === 'settings' && isSettingsDropdownOpen && (
                                <div className="sidebar-settings absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 py-2 z-50">
                                    <button
                                        onClick={handleCustomizeClick}
                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 rounded-lg transition-all duration-200 hover:shadow-md"
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
                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 rounded-lg transition-all duration-200 hover:shadow-md"
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



