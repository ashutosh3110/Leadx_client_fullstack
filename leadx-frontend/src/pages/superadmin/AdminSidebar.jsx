import React from 'react';

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
    return (
        <div 
            className="w-64 shadow-lg flex flex-col"
            style={{ 
                backgroundColor: adminDashboardColor,
                borderRight: `1px solid ${adminDashboardColor}80`
            }}
        >
            <div className="p-6">
                {/* Logo */}
                <div className="flex items-center space-x-3 mb-8">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Admin Panel
                        </h2>
                        <p className="text-xs text-white/70">Leadx Dashboard</p>
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
                                    }
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                                    activeTab === item.id
                                        ? 'shadow-lg bg-white/20 text-white'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                }`}
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
                                        <span>Customize</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('settings');
                                            setIsSettingsDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Settings</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* User Profile */}
            <div className="mt-auto p-6">
                <div className="rounded-xl p-4 bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Admin User</p>
                            <p className="text-xs text-white/70">admin@leadx.com</p>
                        </div>
                        <button className="text-white/60 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;


