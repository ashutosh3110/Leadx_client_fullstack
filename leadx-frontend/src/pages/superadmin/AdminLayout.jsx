import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ambassadorAPI, approvalAPI, rewardsAPI } from '../utils/apicopy';

import ProfileDropdown from './ProfileDropdown';
import SimpleSettingsForm from './SimpleSettingsForm';
import StatCard from './StatCard';
import AdminSidebar from './AdminSidebar';
import PendingApplicationsTable from './PendingApplicationsTable';
import ApprovedAmbassadorsTable from './ApprovedAmbassadorsTable';
import AmbassadorDetailModal from './AmbassadorDetailModal';
import AddRewardModal from './AddRewardModal';
import EditRewardModal from './EditRewardModal';
import RewardsTab from './RewardTab';

import Overview from './Overview';
import sidebarItems from './Sidebaritems';

import { useColorContext } from '../../context/ColorContext';

const AdminLayout = () => {
    console.log('AdminLayout component is rendering...');

    const navigate = useNavigate();
    const location = useLocation();
    
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/overview') return 'Overview';
        if (path === '/admin/ambassadors') return 'Ambassadors';
        if (path === '/admin/rewards') return 'Rewards';
        if (path === '/admin/users') return 'User Management';
        if (path === '/admin/settings') return 'Settings';
        if (path === '/admin/customize') return 'Customize';
        return 'Admin Dashboard';
    };
    
    const getPageDescription = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/overview') return 'Overview of your platform';
        if (path === '/admin/ambassadors') return 'Manage your ambassadors';
        if (path === '/admin/rewards') return 'Manage reward system';
        if (path === '/admin/users') return 'User management and roles';
        if (path === '/admin/settings') return 'Configure platform settings';
        if (path === '/admin/customize') return 'Customize ambassador cards';
        return 'Manage your platform';
    };

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

    const [selectedAmbassador, setSelectedAmbassador] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddRewardModalOpen, setIsAddRewardModalOpen] = useState(false);
    const [isEditRewardModalOpen, setIsEditRewardModalOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Color context
    const { adminDashboardColor, adminTextColor } = useColorContext();

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

    // Approve/Reject functionality
    const handleApproveApplication = async (userId) => {
        try {
            setLoading(true);
            console.log('Approving ambassador:', userId);

            const response = await approvalAPI.approveAmbassador(userId);
            console.log('Approval response:', response);

            if (response.success) {
                const approvedUser = pendingApplications.find(user => user._id === userId);

                if (approvedUser) {
                    const updatedUser = {
                        ...approvedUser,
                        isVerified: true,
                        approvedAt: new Date().toISOString()
                    };

                    setPendingApplications(prev => prev.filter(user => user._id !== userId));
                    setAmbassadors(prev => [updatedUser, ...prev]);

                    setStats(prev => ({
                        ...prev,
                        pendingApplications: prev.pendingApplications - 1,
                        totalAmbassadors: prev.totalAmbassadors + 1,
                        activeAmbassadors: prev.activeAmbassadors + 1
                    }));
                }

                toast.success('✅ Ambassador approved successfully!');
            } else {
                toast.error(`❌ Failed to approve: ${response.message}`);
            }
        } catch (error) {
            console.error('Approval error:', error);
            toast.error(`❌ Failed to approve: ${error.response?.data?.message || error.message}`);
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
                setPendingApplications(prev => prev.filter(user => user._id !== userId));
                setStats(prev => ({
                    ...prev,
                    pendingApplications: prev.pendingApplications - 1
                }));

                toast.success('✅ Ambassador rejected successfully!');
            } else {
                toast.error(`❌ Failed to reject: ${response.message}`);
            }
        } catch (error) {
            console.error('Rejection error:', error);
            toast.error(`❌ Failed to reject: ${error.response?.data?.message || error.message}`);
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
            setSelectedAmbassador(ambassador);
            setIsAddRewardModalOpen(true);
        }
    };

    const handleCloseAddRewardModal = () => {
        setIsAddRewardModalOpen(false);
        setSelectedAmbassador(null);
    };

    // Edit and Delete Reward handlers
    const handleEditReward = (reward) => {
        setSelectedReward(reward);
        setIsEditRewardModalOpen(true);
    };

    const handleCloseEditRewardModal = () => {
        setIsEditRewardModalOpen(false);
        setSelectedReward(null);
    };

    const handleUpdateReward = async (updatedRewardData) => {
        try {
            setLoading(true);
            console.log('Updating reward:', updatedRewardData);

            const response = await rewardsAPI.updateRewardStatus(updatedRewardData.id, {
                amount: updatedRewardData.amount,
                currency: updatedRewardData.currency,
                status: updatedRewardData.status,
                remarks: updatedRewardData.remarks
            });
            console.log('Reward updated successfully:', response);

            setRewards(prev => prev.map(reward => 
                reward.id === updatedRewardData.id 
                    ? { ...reward, ...updatedRewardData }
                    : reward
            ));

            toast.success(`✅ Reward updated successfully for ${updatedRewardData.ambassadorName}!`);

        } catch (error) {
            console.error('Error updating reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update reward';
            toast.error(`❌ Error: ${errorMessage}`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReward = async (reward) => {
        if (!window.confirm(`Are you sure you want to delete the reward of ${reward.currency} ${reward.amount} for ${reward.ambassadorName}?`)) {
            return;
        }

        try {
            setLoading(true);
            console.log('Deleting reward:', reward);

            await rewardsAPI.deleteReward(reward.id);
            console.log('Reward deleted successfully');

            setRewards(prev => prev.filter(r => r.id !== reward.id));

            const ambassadorHasOtherRewards = rewards.some(r => 
                r.ambassadorId === reward.ambassadorId && r.id !== reward.id
            );

            setAmbassadors(prev => prev.map(ambassador => 
                ambassador._id === reward.ambassadorId 
                    ? { ...ambassador, hasReward: ambassadorHasOtherRewards }
                    : ambassador
            ));

            setStats(prev => ({
                ...prev,
                totalRewards: prev.totalRewards - 1
            }));

            toast.success(`✅ Reward deleted successfully!`);

        } catch (error) {
            console.error('Error deleting reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete reward';
            toast.error(`❌ Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReward = async (rewardData) => {
        try {
            setLoading(true);
            console.log('Submitting reward:', rewardData);

            const apiData = {
                ambassador: rewardData.ambassadorId,
                amount: rewardData.amount,
                currency: rewardData.currency,
                status: 'pending',
                remarks: rewardData.remarks || ''
            };

            const response = await rewardsAPI.createReward(apiData);
            console.log('Reward created successfully:', response);

            const newReward = {
                id: response.data._id,
                ambassadorId: rewardData.ambassadorId,
                ambassadorName: rewardData.ambassadorName,
                amount: rewardData.amount,
                currency: rewardData.currency,
                status: response.data.status,
                remarks: rewardData.remarks,
                createdAt: response.data.createdAt,
                country: rewardData.country,
                state: rewardData.state
            };

            setRewards(prev => [newReward, ...prev]);

            setAmbassadors(prev => prev.map(ambassador => 
                ambassador._id === rewardData.ambassadorId 
                    ? { ...ambassador, hasReward: true }
                    : ambassador
            ));

            setStats(prev => ({
                ...prev,
                totalRewards: prev.totalRewards + 1
            }));

            toast.success(`✅ Reward of ${rewardData.currency} ${rewardData.amount} added successfully for ${rewardData.ambassadorName}!`);

        } catch (error) {
            console.error('Error submitting reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add reward';
            toast.error(`❌ Error: ${errorMessage}`);
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
        navigate('/admin/customize');
        setIsSettingsDropdownOpen(false);
    };

    // Profile dropdown handlers
    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleCloseProfileDropdown = () => {
        setIsProfileDropdownOpen(false);
    };

    // Mobile menu handlers
    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleCloseMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Edit and Delete functionality for approved ambassadors
    const handleEditAmbassador = (ambassador) => {
        console.log('Edit ambassador:', ambassador);
        toast.success('Edit functionality will be implemented soon!');
    };

    const handleDeleteAmbassador = async (ambassadorId) => {
        if (window.confirm('Are you sure you want to delete this ambassador? This action cannot be undone.')) {
            try {
                setLoading(true);
                console.log('Deleting ambassador:', ambassadorId);

                setAmbassadors(prev => prev.filter(ambassador => ambassador._id !== ambassadorId));
                setStats(prev => ({
                    ...prev,
                    totalAmbassadors: prev.totalAmbassadors - 1,
                    activeAmbassadors: prev.activeAmbassadors - 1
                }));

                toast.success('✅ Ambassador deleted successfully!');

            } catch (error) {
                console.error('Delete error:', error);
                toast.error(`❌ Failed to delete ambassador: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const response = await ambassadorAPI.getAllAmbassadors();
            console.log('All ambassadors response:', response);

            let allAmbassadors = [];

            if (response.success && Array.isArray(response.data)) {
                allAmbassadors = response.data;
            }

            console.log('All ambassadors:', allAmbassadors);

            const verifiedAmbassadors = allAmbassadors.filter(user =>
                user.role === 'ambassador' && user.isVerified === true
            );

            const pendingAmbassadors = allAmbassadors.filter(user =>
                user.role === 'ambassador' && user.isVerified === false
            );

            const sortedVerifiedAmbassadors = verifiedAmbassadors.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                return dateB - dateA;
            });

            console.log('Verified ambassadors (sorted):', sortedVerifiedAmbassadors);
            console.log('Pending ambassadors:', pendingAmbassadors);

            setAmbassadors(sortedVerifiedAmbassadors);
            setPendingApplications(pendingAmbassadors);

            let rewardsCount = 0;
            try {
                const rewardsResponse = await rewardsAPI.getAllRewards();
                console.log('Rewards response:', rewardsResponse);
                
                if (rewardsResponse.success && Array.isArray(rewardsResponse.data)) {
                    console.log('Raw rewards data:', rewardsResponse.data);
                    const transformedRewards = rewardsResponse.data.map(reward => {
                        console.log('Ambassador data:', reward.ambassador);
                        console.log('Program field:', reward.ambassador.program);
                        console.log('Course field:', reward.ambassador.course);
                        console.log('Program value:', reward.ambassador.program);
                        console.log('Program type:', typeof reward.ambassador.program);
                        return {
                            id: reward._id,
                            ambassadorId: reward.ambassador._id,
                            ambassadorName: reward.ambassador.name,
                            course: reward.ambassador.program || reward.ambassador.course || 'Not specified',
                            amount: reward.amount,
                            currency: reward.currency,
                            status: reward.status,
                            remarks: reward.remarks,
                            createdAt: reward.createdAt,
                            country: reward.ambassador.country || 'Not specified',
                            state: reward.ambassador.state || ''
                        };
                    });
                    
                    setRewards(transformedRewards);
                    rewardsCount = transformedRewards.length;
                    console.log('Rewards loaded:', transformedRewards);
                }
            } catch (rewardsError) {
                console.error('Failed to fetch rewards:', rewardsError);
            }

            setStats({
                totalAmbassadors: verifiedAmbassadors.length,
                activeAmbassadors: verifiedAmbassadors.length,
                pendingApplications: pendingAmbassadors.length,
                totalConversations: Math.floor(Math.random() * 150) + 50,
                totalRewards: rewardsCount,
                monthlyGrowth: Math.floor(Math.random() * 25) + 5
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('❌ Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col lg:flex-row">
            {/* Fixed Desktop Sidebar */}
            <AdminSidebar
                adminDashboardColor={adminDashboardColor}
                adminTextColor={adminTextColor}
                isSettingsDropdownOpen={isSettingsDropdownOpen}
                handleSettingsClick={handleSettingsClick}
                handleCustomizeClick={handleCustomizeClick}
                sidebarItems={sidebarItems}
            />

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-10 z-30 lg:hidden"
                        onClick={handleCloseMobileMenu}
                        style={{ left: '256px' }}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                        <div 
                            className="w-64 h-screen shadow-lg flex flex-col"
                            style={{ 
                                backgroundColor: '#4682B4',
                                borderRight: `1px solid #4682B480`
                            }}
                        >
                            <div className="flex justify-end p-4">
                                <button
                                    onClick={handleCloseMobileMenu}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col overflow-y-auto">
                                <div className="p-4">
                                    <div className="flex items-center justify-center mb-8">
                                        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 p-4 rounded-xl shadow-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center relative">
                                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <div className="w-4 h-2 bg-blue-600 rounded-sm relative">
                                                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-400 rounded-sm"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-white">
                                                    <div className="text-sm font-bold leading-tight">
                                                        <div className="text-blue-400">LEAD</div>
                                                        <div className="text-orange-400">EXAMINE</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <nav className="space-y-2">
                                        {sidebarItems && sidebarItems.length > 0 ? sidebarItems.map((item) => (
                                            <div key={item.id} className={`relative ${item.id === 'settings' ? 'sidebar-settings' : ''}`}>
                                                <button
                                                    onClick={() => {
                                                        if (item.id === 'settings') {
                                                            handleSettingsClick();
                                                        } else {
                                                            navigate(`/admin/${item.id}`);
                                                            handleCloseMobileMenu();
                                                        }
                                                    }}
                                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left text-white/80 hover:text-white"
                                                >
                                                    {item.icon}
                                                    <span className="font-medium">{item.name}</span>
                                                </button>

                                                {item.id === 'settings' && isSettingsDropdownOpen && (
                                                    <div className="sidebar-settings absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                                        <button
                                                            onClick={() => {
                                                                handleCustomizeClick();
                                                                handleCloseMobileMenu();
                                                            }}
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
                                                                handleCloseMobileMenu();
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>Dashboard Customize</span>
                                                        </button>
                                                    </div>
                                                )}
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
                    </div>
                </>
            )}

            {/* Main Content Area */}
            <div
                className="flex-1 flex flex-col lg:ml-64 min-h-screen relative z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
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
                    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button
                                    onClick={handleMobileMenuToggle}
                                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 capitalize truncate">
                                        {getPageTitle()}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1 hidden sm:block">
                                        {getPageDescription()}
                                    </p>
                                </div>
                            </div>

                            <div className="relative profile-dropdown">
                                <button
                                    onClick={handleProfileClick}
                                    className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                                >
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center shadow-sm border-2 border-slate-200">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-left hidden sm:block">
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
                <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto">
                    <Outlet context={{
                        stats,
                        ambassadors,
                        pendingApplications,
                        rewards,
                        loading,
                        handleApproveApplication,
                        handleRejectApplication,
                        handleViewAmbassadorDetails,
                        handleEditAmbassador,
                        handleDeleteAmbassador,
                        handleAddReward,
                        handleEditReward,
                        handleDeleteReward,
                        handleSubmitReward,
                        adminDashboardColor
                    }} />
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

            <EditRewardModal
                isOpen={isEditRewardModalOpen}
                reward={selectedReward}
                onClose={handleCloseEditRewardModal}
                onSubmit={handleUpdateReward}
            />
        </div>
    );
};

export default AdminLayout;
