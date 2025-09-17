import React, { useState, useEffect } from 'react';

import { Outlet, useNavigate } from 'react-router-dom';

import { ambassadorAPI, approvalAPI } from '../utils/apicopy';

// import api from '../pages/utils/apicopy';

import CustomizationForm from './CustomizationForm';

import ProfileDropdown from './ProfileDropdown';

import SimpleSettingsForm from './SimpleSettingsForm';

import StatCard from './StatCard';

import AdminSidebar from './AdminSidebar';

import PendingApplicationsTable from './PendingApplicationsTable';

import ApprovedAmbassadorsTable from './ApprovedAmbassadorsTable';

import AmbassadorDetailModal from './AmbassadorDetailModal';
import AddRewardModal from './AddRewardModal';


import { useColorContext } from '../../context/ColorContext';



const AdminDashboard = () => {

    console.log('AdminDashboard component is rendering...');

    const navigate = useNavigate();

    const [stats, setStats] = useState({

        totalAmbassadors: 0,

        activeAmbassadors: 0,

        pendingApplications: 0,

        totalConversations: 0,

        totalRewards: 0,

        monthlyGrowth: 0

    });

    const [ambassadors, setAmbassadors] = useState([]);

    const [pendingApplications, setPendingApplications] = useState([]);

    const [rewards, setRewards] = useState([]);

    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview');

    const [selectedAmbassador, setSelectedAmbassador] = useState(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [isAddRewardModalOpen, setIsAddRewardModalOpen] = useState(false);

    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);


    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    
    // Color context

const { adminDashboardColor, adminTextColor } = useColorContext();



    // Handle logout

    const handleLogout = () => {

        localStorage.removeItem('authToken');

        navigate('/login');

    };



    useEffect(() => {

        fetchDashboardData();

    }, []);



    // Close dropdown when clicking outside

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (isSettingsDropdownOpen && !event.target.closest('.sidebar-settings')) {

                setIsSettingsDropdownOpen(false);

            }

            if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {

                setIsProfileDropdownOpen(false);

            }

        };



        document.addEventListener('mousedown', handleClickOutside);

        return () => {

            document.removeEventListener('mousedown', handleClickOutside);

        };

    }, [isSettingsDropdownOpen, isProfileDropdownOpen]);



    // Approve/Reject functionality - Clean and efficient

    const handleApproveApplication = async (userId) => {

        try {

            setLoading(true);

            console.log('Approving ambassador:', userId);


            
            const response = await approvalAPI.approveAmbassador(userId);

            console.log('Approval response:', response);
            
            if (response.success) {

                // Find the user being approved

                const approvedUser = pendingApplications.find(user => user._id === userId);

          
                
                if (approvedUser) {

                    // Update the user's verification status and add approval timestamp

                    const updatedUser = { 

                        ...approvedUser, 

                        isVerified: true,

                        approvedAt: new Date().toISOString() // Add approval timestamp

                    };


                    
                    // Update UI immediately - remove from pending, add to TOP of approved list

                    setPendingApplications(prev => prev.filter(user => user._id !== userId));

                    setAmbassadors(prev => [updatedUser, ...prev]); // Add to TOP of the list

                    setStats(prev => ({

                        ...prev,

                        pendingApplications: prev.pendingApplications - 1,

                        totalAmbassadors: prev.totalAmbassadors + 1,

                        activeAmbassadors: prev.activeAmbassadors + 1

                    }));

                }


                
                alert('✅ Ambassador approved successfully!');

            } else {

                alert(`❌ Failed to approve: ${response.message}`);

            }

        } catch (error) {

            console.error('Approval error:', error);

            alert(`❌ Failed to approve: ${error.response?.data?.message || error.message}`);

        } finally {

            setLoading(false);

        }

    };



    const handleRejectApplication = async (userId) => {

        try {

            setLoading(true);

            console.log('Rejecting ambassador:', userId);

            
            const response = await approvalAPI.rejectAmbassador(userId);

            console.log('Rejection response:', response);


            
            if (response.success) {

                // Update UI immediately - remove from pending

                setPendingApplications(prev => prev.filter(user => user._id !== userId));

                setStats(prev => ({

                    ...prev,

                    pendingApplications: prev.pendingApplications - 1

                }));

                alert('✅ Ambassador rejected successfully!');

            } else {

                alert(`❌ Failed to reject: ${response.message}`);

            }

        } catch (error) {

            console.error('Rejection error:', error);

            alert(`❌ Failed to reject: ${error.response?.data?.message || error.message}`);

        } finally {

            setLoading(false);

        }

    };



    // Modal functions

    const handleViewAmbassadorDetails = (ambassador) => {

        setSelectedAmbassador(ambassador);

        setIsDetailModalOpen(true);

    };



    const handleCloseDetailModal = () => {

        setIsDetailModalOpen(false);

        setSelectedAmbassador(null);

    };

    const handleAddReward = (ambassadorId) => {
        const ambassador = ambassadors.find(amb => amb._id === ambassadorId);
        if (ambassador) {
            // Don't change selectedAmbassador, just open the reward modal
            setIsAddRewardModalOpen(true);
        }
    };

    const handleCloseAddRewardModal = () => {
        setIsAddRewardModalOpen(false);
        // Don't reset selectedAmbassador to keep detail modal open
    };

    const handleSubmitReward = async (rewardData) => {
        try {
            setLoading(true);
            console.log('Submitting reward:', rewardData);
            
            // Create new reward object
            const newReward = {
                id: Date.now(),
                ...rewardData,
                status: 'completed',
                createdAt: new Date().toISOString()
            };
            
            // Add to rewards state
            setRewards(prev => [newReward, ...prev]);
            
            // TODO: Implement API call to save reward
            // const response = await fetch('/api/rewards', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //     },
            //     body: JSON.stringify(rewardData)
            // });
            
            // Show success message
            alert(`Reward of ${rewardData.currency} ${rewardData.amount} added successfully for ${rewardData.ambassadorName}!`);
            
        } catch (error) {
            console.error('Error submitting reward:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };



    // Settings dropdown handlers

    const handleSettingsClick = () => {

        setIsSettingsDropdownOpen(!isSettingsDropdownOpen);

    };



    const handleCustomizeClick = () => {

        setActiveTab('customize');

        setIsSettingsDropdownOpen(false);

    };






    // Profile dropdown handlers

    const handleProfileClick = () => {

        setIsProfileDropdownOpen(!isProfileDropdownOpen);

    };



    const handleCloseProfileDropdown = () => {

        setIsProfileDropdownOpen(false);

    };



    // Edit and Delete functionality for approved ambassadors

    const handleEditAmbassador = (ambassador) => {

        // TODO: Implement edit functionality

        console.log('Edit ambassador:', ambassador);

        alert('Edit functionality will be implemented soon!');

    };



    const handleDeleteAmbassador = async (ambassadorId) => {

        if (window.confirm('Are you sure you want to delete this ambassador? This action cannot be undone.')) {

            try {

                setLoading(true);

                console.log('Deleting ambassador:', ambassadorId);


                
                // TODO: Implement delete API call

                // const response = await ambassadorAPI.deleteAmbassador(ambassadorId);

                
                // For now, just remove from local state

                setAmbassadors(prev => prev.filter(ambassador => ambassador._id !== ambassadorId));

                setStats(prev => ({

                    ...prev,

                    totalAmbassadors: prev.totalAmbassadors - 1,

                    activeAmbassadors: prev.activeAmbassadors - 1

                }));


                
                alert('✅ Ambassador deleted successfully!');

            } catch (error) {

                console.error('Delete error:', error);

                alert(`❌ Failed to delete ambassador: ${error.message}`);

            } finally {

                setLoading(false);

            }

        }

    };



    const fetchDashboardData = async () => {

        try {

            setLoading(true);

            
            // Fetch all ambassadors from the single API endpoint

            const response = await ambassadorAPI.getAllAmbassadors();

            console.log('All ambassadors response:', response);


            
            let allAmbassadors = [];

            if (response.success && response.data && Array.isArray(response.data)) {

                allAmbassadors = response.data;

            } else if (Array.isArray(response)) {

                allAmbassadors = response;

            } else if (response.data && Array.isArray(response.data)) {

                allAmbassadors = response.data;

            }


            
            console.log('All ambassadors:', allAmbassadors);


            
            // Filter ambassadors based on verification status

            const verifiedAmbassadors = allAmbassadors.filter(user => 

                user.role === 'ambassador' && user.isVerified === true

            );


            
            const pendingAmbassadors = allAmbassadors.filter(user => 

                user.role === 'ambassador' && user.isVerified === false

            );


            
            // Sort verified ambassadors by most recently updated first

            const sortedVerifiedAmbassadors = verifiedAmbassadors.sort((a, b) => {

                const dateA = new Date(a.updatedAt || a.createdAt || 0);

                const dateB = new Date(b.updatedAt || b.createdAt || 0);

                return dateB - dateA; // Most recent first

            });


            
            console.log('Verified ambassadors (sorted):', sortedVerifiedAmbassadors);

            console.log('Pending ambassadors:', pendingAmbassadors);


            
            // Set the data

            setAmbassadors(sortedVerifiedAmbassadors);

            setPendingApplications(pendingAmbassadors);


            
            // Update stats

            setStats({

                totalAmbassadors: verifiedAmbassadors.length,

                activeAmbassadors: verifiedAmbassadors.length,

                pendingApplications: pendingAmbassadors.length,

                totalConversations: Math.floor(Math.random() * 150) + 50,

                totalRewards: Math.floor(Math.random() * 50) + 20,

                monthlyGrowth: Math.floor(Math.random() * 25) + 5

            });
            

            
        } catch (error) {

            console.error('Failed to fetch dashboard data:', error);

            alert('❌ Failed to load dashboard data. Please refresh the page.');

        } finally {

            setLoading(false);

        }

    };






    const sidebarItems = [

        { 

            id: 'overview', 

            name: 'Dashboard', 

            icon: (

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />

                </svg>

            )

        },

        { 

            id: 'ambassadors', 

            name: 'Ambassadors', 

            icon: (

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />

                </svg>

 )

 },

 // { 

 //     id: 'analytics', 

 //     name: 'Analytics', 

 //     icon: (

//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />

//         </svg>

//     )

 // },

 // { 

 //     id: 'messages', 
 //     name: 'Messages', 

 //     icon: (

 //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

 //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

 //         </svg>

 //     )

 // },

 {

            id: 'rewards', 

            name: 'Rewards', 

            icon: (

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />

                </svg>

            )

        },

        { 

            id: 'users', 

            name: 'User Management', 

            icon: (

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                </svg>
            )

},

// { 

//     id: 'reports', 

//     name: 'Reports', 

 //     icon: (

 //         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

 //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 //         </svg>

 //     )

 // },

 {

            id: 'settings', 

            name: 'Settings', 

            icon: (

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

                </svg>

            )

        }

    ];



    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">

            <AdminSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                adminDashboardColor={adminDashboardColor}
                adminTextColor={adminTextColor}
                isSettingsDropdownOpen={isSettingsDropdownOpen}
                handleSettingsClick={handleSettingsClick}
                handleCustomizeClick={handleCustomizeClick}
                sidebarItems={sidebarItems}
            />



            {/* Main Content Area */}

            <div 

                className="flex-1 flex flex-col"

                style={{ 

                    background: `linear-gradient(135deg, ${adminDashboardColor}15, ${adminDashboardColor}10)`

                }}

            >

                {/* Header */}

                <div 
                    className="backdrop-blur-sm border-b sticky top-0 z-30"
                style={{ 
                        background: `linear-gradient(135deg, ${adminDashboardColor}25, ${adminDashboardColor}15)`,
                        borderColor: `${adminDashboardColor}40`
                }}
            >

                    <div className="px-6 py-4">

                        <div className="flex items-center justify-between">

                            <div>

                                <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>

                                <p className="text-sm text-slate-500 mt-1">

                                    {activeTab === 'overview' && 'Overview of your platform'}

                                    {activeTab === 'ambassadors' && 'Manage your ambassadors'}

                                    {activeTab === 'analytics' && 'View detailed analytics'}

                                    {activeTab === 'messages' && 'Monitor conversations'}

                                    {activeTab === 'rewards' && 'Manage reward system'}

                                    {activeTab === 'users' && 'User management and roles'}

                                    {activeTab === 'reports' && 'Generate and view reports'}

                                    {activeTab === 'settings' && 'Configure platform settings'}

                                </p>

                            </div>


                            
                            {/* Profile Icon */}

                            <div className="relative profile-dropdown">

                                <button

                                    onClick={handleProfileClick}

                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"

                                >

                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shadow-sm border-2 border-slate-200">

                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                                        </svg>

                                    </div>

                                    <div className="text-left">

                                        <p className="text-sm font-medium text-slate-800">Admin User</p>

                                        <p className="text-xs text-slate-500">admin@leadx.com</p>

                                    </div>

                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />

                                    </svg>

                                </button>


                                
                                <ProfileDropdown 

                                    isOpen={isProfileDropdownOpen} 

                                    onClose={handleCloseProfileDropdown} 

                                />

                            </div>

                        </div>

                    </div>

                </div>



                {/* Content Area */}

                <div className="flex-1 p-6 overflow-y-auto">

                    {/* Render nested routes */}

                    <Outlet />


                    
                    {/* Overview Tab */}

                    {activeTab === 'overview' && (

                        <div className="space-y-6">

                            {/* Stats Grid */}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                <StatCard

                                    title="Total Ambassadors"

                                    value={stats.totalAmbassadors}

                                    trend={stats.monthlyGrowth}

                                    color="from-slate-100 to-slate-200"

                                    icon={

                                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />

                                        </svg>

                                    }

                                />

                                <StatCard

                                    title="Active Ambassadors"

                                    value={stats.activeAmbassadors}

                                    trend={15}

                                    color="from-slate-100 to-slate-200"

                                    icon={

                                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />

                                        </svg>

                                    }

                                />

                                <StatCard

                                    title="Pending Applications"

                                    value={stats.pendingApplications}

                                    color="from-slate-100 to-slate-200"

                                    icon={

                                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />

                                        </svg>

                                    }

                                />

                                <StatCard

                                    title="Total Conversations"

                                    value={stats.totalConversations}

                                    trend={8}

                                    color="from-slate-100 to-slate-200"

                                    icon={

                                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

                                        </svg>

                                    }

                                />

                                </div>

                        </div>
                    )}



                    {/* Ambassadors Tab */}

                    {activeTab === 'ambassadors' && (

                        <div className="space-y-6">

                            <PendingApplicationsTable 
                                pendingApplications={pendingApplications}
                                handleApproveApplication={handleApproveApplication}
                                handleRejectApplication={handleRejectApplication}
                                loading={loading}
                                handleViewAmbassadorDetails={handleViewAmbassadorDetails}
                            />



                            <ApprovedAmbassadorsTable 
                                ambassadors={ambassadors}
                                handleEditAmbassador={handleEditAmbassador}
                                handleDeleteAmbassador={handleDeleteAmbassador}
                                loading={loading}
                                handleViewAmbassadorDetails={handleViewAmbassadorDetails}
                            />

                                                            </div>

                    )}



                    {/* Other Tabs */}

                    {activeTab === 'analytics' && (

                        <div className="space-y-6">

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">

                                <div className="text-center py-12">

                                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />

                                    </svg>

                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Analytics & Reports</h4>

                                    <p className="text-slate-600">View detailed analytics and performance metrics</p>

                                                            </div>

                                                        </div>

                                                        </div>

                    )}



                    {activeTab === 'messages' && (

                        <div className="space-y-6">

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">

                                <div className="text-center py-12">

                                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

                                                            </svg>

                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Message Management</h4>

                                    <p className="text-slate-600">Monitor and manage conversations</p>

                                                        </div>

                                </div>

                            </div>

                    )}



                    {activeTab === 'rewards' && (

                        <div className="space-y-6">

                            {/* Rewards Header */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                        <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Ambassador Rewards ({rewards.length})
                                    </h3>
                                    <div className="text-sm text-slate-600">
                                        Total Rewards: {rewards.length}
                                        </div>
                                    </div>
                                </div>

                            {/* Rewards Table */}
                            <div 
                                className="backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden"
                                style={{ 
                                    background: `linear-gradient(135deg, ${adminDashboardColor}15, ${adminDashboardColor}10)`,
                                    borderColor: `${adminDashboardColor}30`
                                }}
                            >
                                {rewards.length > 0 ? (
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead 
                                            style={{ 
                                                background: `linear-gradient(135deg, ${adminDashboardColor}25, ${adminDashboardColor}15)`
                                            }}
                                        >
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ambassador</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Country/State</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {rewards.map((reward) => (
                                                <tr 
                                                    key={reward.id} 
                                                    className="transition-colors duration-200"
                                                    style={{ 
                                                        '--hover-bg': `${adminDashboardColor}10`
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = `${adminDashboardColor}20`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div 
                                                                className="w-8 h-8 rounded-full overflow-hidden border-2 mr-3"
                                                                style={{ borderColor: `${adminDashboardColor}40` }}
                                                            >
                                                                <div 
                                                                    className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                                                                    style={{ 
                                                                        background: `linear-gradient(135deg, ${adminDashboardColor}, ${adminDashboardColor}dd)`
                                                                    }}
                                                                >
                                                                    {reward.ambassadorName.charAt(0).toUpperCase()}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900">{reward.ambassadorName}</div>
                                                                <div className="text-xs text-slate-500">ID: {reward.ambassadorId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-slate-900">
                                                            {reward.currency === 'INR' ? '₹' : '$'}{reward.amount}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{reward.currency}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span 
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                            style={{ backgroundColor: adminDashboardColor }}
                                                        >
                                                            {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                        <div>{reward.country}</div>
                                                        {reward.state && <div className="text-xs text-slate-500">{reward.state}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {new Date(reward.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                        <h4 className="text-lg font-semibold text-slate-800 mb-2">No Rewards Yet</h4>
                                        <p className="text-slate-600">Start adding rewards to ambassadors to see them here</p>
                        </div>
                    )}
                                </div>

                                </div>

                    )}



                    {activeTab === 'users' && (

                        <div className="space-y-6">

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">

                                <div className="text-center py-12">

                                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                                    </svg>

                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">User Management</h4>

                                    <p className="text-slate-600">Manage user accounts and permissions</p>

                                </div>

                            </div>

                        </div>

                    )}



                    {activeTab === 'reports' && (

                        <div className="space-y-6">

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">

                                <div className="text-center py-12">

                                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                                    </svg>

                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Reports & Analytics</h4>

                                    <p className="text-slate-600">Generate and export detailed reports</p>

                                </div>

                            </div>

                        </div>

                    )}



                    {activeTab === 'settings' && (

                        <div className="space-y-6">

 <SimpleSettingsForm />

                                </div>

                    )}

                    {activeTab === 'customize' && (

                        <div className="space-y-6">

                            <CustomizationForm />

                        </div>

                    )}

                        </div>

                        </div>



            <AmbassadorDetailModal 
                isOpen={isDetailModalOpen}
                ambassador={selectedAmbassador}
                onClose={handleCloseDetailModal}
                handleApproveApplication={handleApproveApplication}
                handleRejectApplication={handleRejectApplication}
                handleAddReward={handleAddReward}
                loading={loading}
            />

            <AddRewardModal 
                isOpen={isAddRewardModalOpen}
                ambassador={selectedAmbassador}
                onClose={handleCloseAddRewardModal}
                onSubmit={handleSubmitReward}
            />




                        </div>

    );

};





export default AdminDashboard;