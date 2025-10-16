import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileSidebar = ({
    isOpen,
    onClose,
    activeTab,
    sidebarItems
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                <div
                    className="w-64 h-screen shadow-2xl flex flex-col bg-blue-600 backdrop-blur-md"
                    style={{
                        backgroundColor: '#1098e8',
                        borderRight: `1px solid rgba(16, 152, 232, 0.2)`,
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <div className="flex justify-between items-center p-4 border-b border-white/10">
                        <div className="flex items-center justify-center">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                <img
                                    src="/logo-new.png"
                                    alt="LeadX Logo"
                                    className="h-8 object-contain"
                                />
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/20 hover:scale-110 transition-all duration-200 active:scale-95 bg-white/5"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
                        <nav className="space-y-3">
                            {sidebarItems && sidebarItems.length > 0 ? sidebarItems.map((item) => (
                                <div key={item.id}>
                                    <button
                                        onClick={() => {
                                            navigate(`/admin/${item.id}`);
                                            onClose();
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left transform hover:scale-105 ${
                                            activeTab === item.id
                                                ? 'bg-white/30 text-white shadow-xl scale-105 border border-white/30'
                                                : 'text-white/90 hover:text-white hover:bg-white/10 hover:shadow-lg active:scale-95'
                                        }`}
                                    >
                                        <div className={`p-1 rounded-lg transition-colors duration-200 ${
                                            activeTab === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                                        }`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                </div>
                            )) : (
                                <div className="text-white text-center py-4">
                                    <p>Loading navigation...</p>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileSidebar;
