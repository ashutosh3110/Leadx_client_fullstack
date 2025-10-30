import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ambassadorAPI, approvalAPI, rewardsAPI, chatAPI } from '../utils/Api';

import ProfileDropdown from './ProfileDropdown';
import SimpleSettingsForm from './SimpleSettingsForm';
import StatCard from './StatCard';
import AdminSidebar from './AdminSidebar';
import MobileSidebar from '../../components/MobileSidebar';
import PendingApplicationsTable from './PendingApplicationsTable';
import ApprovedAmbassadorsTable from './ApprovedAmbassadorsTable';
import AmbassadorDetailModal from './AmbassadorDetailModal';
import AddRewardModal from './AddRewardModal';
import EditRewardModal from './EditRewardModal';
import EditAmbassadorModal from './EditAmbassadorModal';
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
    const [isEditAmbassadorModalOpen, setIsEditAmbassadorModalOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Color context
    const { adminDashboardColor, adminTextColor } = useColorContext();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Update activeTab based on current location
    useEffect(() => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/overview') {
            setActiveTab('overview');
        } else if (path === '/admin/ambassadors') {
            setActiveTab('ambassadors');
        } else if (path === '/admin/rewards') {
            setActiveTab('rewards');
        } else if (path === '/admin/users') {
            setActiveTab('users');
        } else if (path === '/admin/ambassador-login') {
            setActiveTab('ambassador-login');
        } else if (path === '/admin/chat') {
            setActiveTab('chat');
        } else if (path === '/admin/settings') {
            setActiveTab('settings');
        } else if (path === '/admin/customize') {
            setActiveTab('customize');
        }
    }, [location.pathname]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    // Approve/Reject functionality
    const handleApproveApplication = async (userId) => {
        try {
            setLoading(true);
            console.log('Approving ambassador:', userId);

            const response = await approvalAPI.approveAmbassador(userId);
            console.log('Approval response:', response);

            if (response.success) {
                const approvedUser = pendingApplications.find(user => (user.id || user._id) === userId);

                if (approvedUser) {
                    const updatedUser = {
                        ...approvedUser,
                        isVerified: true,
                        approvedAt: new Date().toISOString()
                    };

                    setPendingApplications(prev => prev.filter(user => (user.id || user._id) !== userId));
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
                setPendingApplications(prev => prev.filter(user => (user.id || user._id) !== userId));
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
        console.log('🔍 handleAddReward called with ambassadorId:', ambassadorId);
        const ambassador = ambassadors.find(amb => (amb.id || amb._id) === ambassadorId);
        console.log('🔍 Found ambassador:', ambassador);
        if (ambassador) {
            setSelectedAmbassador(ambassador);
            setIsAddRewardModalOpen(true);
        } else {
            console.error('❌ Ambassador not found for ID:', ambassadorId);
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
                (ambassador.id || ambassador._id) === reward.ambassadorId 
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
                ambassador: rewardData.ambassador,
                amount: rewardData.amount,
                currency: rewardData.currency,
                status: 'pending',
                remarks: rewardData.remarks || ''
            };

            const response = await rewardsAPI.createReward(apiData);
            console.log('Reward created successfully:', response);

            // Find ambassador to get course info
            const ambassador = ambassadors.find(amb => (amb.id || amb._id) === rewardData.ambassador);
            
            const newReward = {
                id: response.data.id || response.data._id,
                ambassadorId: rewardData.ambassador, // Use ambassador field as ambassadorId
                ambassadorName: rewardData.ambassadorName,
                course: ambassador?.program || ambassador?.course || 'Not specified',
                amount: rewardData.amount,
                currency: rewardData.currency,
                status: response.data.status || 'pending',
                remarks: rewardData.remarks,
                createdAt: response.data.createdAt || new Date().toISOString(),
                country: rewardData.country,
                state: rewardData.state
            };

            setRewards(prev => [newReward, ...prev]);

            setAmbassadors(prev => prev.map(ambassador => 
                (ambassador.id || ambassador._id) === rewardData.ambassador 
                    ? { ...ambassador, hasReward: true }
                    : ambassador
            ));

            setStats(prev => ({
                ...prev,
                totalRewards: prev.totalRewards + 1
            }));

            toast.success(`✅ Reward of ${rewardData.currency} ${rewardData.amount} added successfully for ${rewardData.ambassadorName}!`);
            
            // Refresh rewards data to ensure consistency
            await refreshRewards();

        } catch (error) {
            console.error('Error submitting reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add reward';
            toast.error(`❌ Error: ${errorMessage}`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Function to refresh rewards data
    const refreshRewards = async () => {
        try {
            const rewardsResponse = await rewardsAPI.getAllRewards();
            console.log('Refreshed rewards response:', rewardsResponse);
            
            if (rewardsResponse.success && Array.isArray(rewardsResponse.data)) {
                const transformedRewards = rewardsResponse.data.map(reward => {
                    // Handle case where ambassador might be null
                    const ambassador = reward.ambassador || {};
                    
                    return {
                        id: reward.id,
                        ambassadorId: ambassador.id || reward.ambassadorId,
                        ambassadorName: ambassador.name || 'Unknown Ambassador',
                        course: ambassador.program || ambassador.course || 'Not specified',
                        amount: reward.amount,
                        currency: reward.currency,
                        status: reward.status,
                        remarks: reward.remarks,
                        createdAt: reward.createdAt,
                        country: ambassador.country || 'Not specified',
                        state: ambassador.state || ''
                    };
                });
                
                setRewards(transformedRewards);
                console.log('Rewards refreshed:', transformedRewards);
            }
        } catch (error) {
            console.error('Failed to refresh rewards:', error);
        }
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
        // Toggle body blur effect
        if (!isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.backdropFilter = 'blur(4px)';
            document.body.style.webkitBackdropFilter = 'blur(4px)';
            // Ensure background is visible
            document.body.style.backgroundColor = '#f8fafc';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.backdropFilter = 'none';
            document.body.style.webkitBackdropFilter = 'none';
            document.body.style.backgroundColor = '';
        }
    };

    const handleCloseMobileMenu = () => {
        setIsMobileMenuOpen(false);
        // Remove body blur effect
        document.body.style.overflow = 'auto';
        document.body.style.backdropFilter = 'none';
        document.body.style.webkitBackdropFilter = 'none';
        document.body.style.backgroundColor = '';
    };

    // Edit and Delete functionality for approved ambassadors
    const handleEditAmbassador = (ambassador) => {
        console.log('Edit ambassador:', ambassador);
        setSelectedAmbassador(ambassador);
        setIsEditAmbassadorModalOpen(true);
    };

    const handleCloseEditAmbassadorModal = async () => {
        setIsEditAmbassadorModalOpen(false);
        setSelectedAmbassador(null);
        // Refresh dashboard data to get updated status
        await fetchDashboardData();
    };

    const handleUpdateAmbassador = async (ambassadorId, updatedData) => {
        try {
            setLoading(true);
            console.log('Updating ambassador:', ambassadorId, updatedData);
            console.log('🔍 Status in update data:', updatedData.status);
            
            const response = await ambassadorAPI.updateAmbassador(ambassadorId, updatedData);
            console.log('Update response:', response);
            console.log('🔍 Updated ambassador status:', response.data?.status);
            
            if (response.success) {
                // Update local state with the response data (which has the updated status)
                setAmbassadors(prev => prev.map(ambassador => 
                    (ambassador.id || ambassador._id) === ambassadorId 
                        ? { ...ambassador, ...response.data } // Use response.data instead of updatedData
                        : ambassador
                ));
                
                toast.success('✅ Ambassador updated successfully!');
            } else {
                toast.error(`❌ Failed to update ambassador: ${response.message}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(`❌ Failed to update ambassador: ${error.message}`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAmbassador = async (ambassadorId) => {
        if (window.confirm('Are you sure you want to delete this ambassador? This action cannot be undone.')) {
            try {
                setLoading(true);
                console.log('Deleting ambassador:', ambassadorId);

                // Call delete API
                const response = await ambassadorAPI.deleteAmbassador(ambassadorId);
                console.log('Delete response:', response);
                
                if (response.success) {
                    // Remove from local state
                    setAmbassadors(prev => prev.filter(ambassador => (ambassador.id || ambassador._id) !== ambassadorId));
                    setStats(prev => ({
                        ...prev,
                        totalAmbassadors: prev.totalAmbassadors - 1,
                        activeAmbassadors: prev.activeAmbassadors - 1
                    }));

                    toast.success('✅ Ambassador deleted successfully!');
                } else {
                    toast.error(`❌ Failed to delete ambassador: ${response.message}`);
                }

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
                        console.log('Program field:', reward.ambassador?.program);
                        console.log('Course field:', reward.ambassador?.course);
                        
                        // Handle case where ambassador might be null
                        const ambassador = reward.ambassador || {};
                        
                        return {
                            id: reward.id,
                            ambassadorId: ambassador.id || reward.ambassadorId,
                            ambassadorName: ambassador.name || 'Unknown Ambassador',
                            course: ambassador.program || ambassador.course || 'Not specified',
                            amount: reward.amount,
                            currency: reward.currency,
                            status: reward.status,
                            remarks: reward.remarks,
                            createdAt: reward.createdAt,
                            country: ambassador.country || 'Not specified',
                            state: ambassador.state || ''
                        };
                    });
                    
                    setRewards(transformedRewards);
                    rewardsCount = transformedRewards.length;
                    console.log('Rewards loaded:', transformedRewards);
                }
            } catch (rewardsError) {
                console.error('Failed to fetch rewards:', rewardsError);
            }

            // Get total conversations count
            let totalConversations = 0;
            try {
                const conversationsData = await chatAPI.getTotalConversations();
                totalConversations = conversationsData.data.totalConversations || 0;
                console.log('✅ Total conversations:', totalConversations);
            } catch (error) {
                console.error('❌ Error fetching total conversations:', error);
            }

            setStats({
                totalAmbassadors: verifiedAmbassadors.length,
                activeAmbassadors: verifiedAmbassadors.length,
                pendingApplications: pendingAmbassadors.length,
                totalConversations: totalConversations,
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col lg:flex-row relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
            {/* Fixed Desktop Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                adminDashboardColor={adminDashboardColor}
                adminTextColor={adminTextColor}
                sidebarItems={sidebarItems}
            />

            {/* Mobile Background Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-30 lg:hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="absolute inset-0 bg-white bg-opacity-20"></div>
                </div>
            )}

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={handleCloseMobileMenu}
                activeTab={activeTab}
                sidebarItems={sidebarItems}
            />

            {/* Main Content Area */}
            <div
                className="flex-1 flex flex-col lg:ml-48 min-h-screen relative z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
                style={{
                    background: `linear-gradient(135deg, ${adminDashboardColor}15, ${adminDashboardColor}10)`,
                    minHeight: '100vh',
                    backgroundColor: '#f8fafc'
                }}
            >
                {/* Header */}
                <div
                    className="bg-white border-b sticky top-0 z-20 shadow-sm"
                >
                    <div className="px-3 sm:px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleMobileMenuToggle}
                                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                <h1 className="text-sm sm:text-base font-semibold text-gray-700">
                                    {getPageTitle()}
                                </h1>
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
                                        <p className="text-xs font-medium text-slate-800">Admin User</p>
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
                <div className="flex-1 p-2 sm:p-3 lg:p-4 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ backgroundColor: '#f8fafc' }}>
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

            <EditAmbassadorModal
                isOpen={isEditAmbassadorModalOpen}
                ambassador={selectedAmbassador}
                onClose={handleCloseEditAmbassadorModal}
                onUpdate={handleUpdateAmbassador}
            />
        </div>
    );
};

export default AdminLayout;
