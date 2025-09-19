import React, { useState, useEffect } from 'react';

import { Outlet, useNavigate } from 'react-router-dom';

import { ambassadorAPI, approvalAPI, rewardsAPI } from '../utils/apicopy';

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
import EditRewardModal from './EditRewardModal';
import RewardsTab from './RewardTab';
import UserManagement from './UserMannagement';
import Overview from './Overview';
import sidebarItems from './Sidebaritems';

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
            // Set the selected ambassador and open the reward modal
            setSelectedAmbassador(ambassador);
            setIsAddRewardModalOpen(true);
        }
    };

    const handleCloseAddRewardModal = () => {
        setIsAddRewardModalOpen(false);
        // Reset selectedAmbassador when closing the reward modal
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

            // Call the API to update reward
            const response = await rewardsAPI.updateRewardStatus(updatedRewardData.id, {
                amount: updatedRewardData.amount,
                currency: updatedRewardData.currency,
                status: updatedRewardData.status,
                remarks: updatedRewardData.remarks
            });
            console.log('Reward updated successfully:', response);

            // Update the rewards state
            setRewards(prev => prev.map(reward => 
                reward.id === updatedRewardData.id 
                    ? { ...reward, ...updatedRewardData }
                    : reward
            ));

            // Show success message
            alert(`✅ Reward updated successfully for ${updatedRewardData.ambassadorName}!`);

        } catch (error) {
            console.error('Error updating reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update reward';
            alert(`❌ Error: ${errorMessage}`);
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

            // Call the API to delete reward
            await rewardsAPI.deleteReward(reward.id);
            console.log('Reward deleted successfully');

            // Remove from rewards state
            setRewards(prev => prev.filter(r => r.id !== reward.id));

            // Update stats
            setStats(prev => ({
                ...prev,
                totalRewards: prev.totalRewards - 1
            }));

            // Show success message
            alert(`✅ Reward deleted successfully!`);

        } catch (error) {
            console.error('Error deleting reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete reward';
            alert(`❌ Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReward = async (rewardData) => {
        try {
            setLoading(true);
            console.log('Submitting reward:', rewardData);

            // Prepare data for API call
            const apiData = {
                ambassador: rewardData.ambassadorId,
                amount: rewardData.amount,
                currency: rewardData.currency,
                status: 'pending', // Default status
                remarks: rewardData.remarks || ''
            };

            // Call the API to create reward
            const response = await rewardsAPI.createReward(apiData);
            console.log('Reward created successfully:', response);

            // Add to rewards state with the response data
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

            // Update stats
            setStats(prev => ({
                ...prev,
                totalRewards: prev.totalRewards + 1
            }));

            // Show success message
            alert(`✅ Reward of ${rewardData.currency} ${rewardData.amount} added successfully for ${rewardData.ambassadorName}!`);

        } catch (error) {
            console.error('Error submitting reward:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add reward';
            alert(`❌ Error: ${errorMessage}`);
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

    // Mobile menu handlers
    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleCloseMobileMenu = () => {
        setIsMobileMenuOpen(false);
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

            // ✅ Since your backend always returns { success, data: [...] }
            if (response.success && Array.isArray(response.data)) {
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



            // Fetch rewards data
            let rewardsCount = 0;
            try {
                const rewardsResponse = await rewardsAPI.getAllRewards();
                console.log('Rewards response:', rewardsResponse);
                
                if (rewardsResponse.success && Array.isArray(rewardsResponse.data)) {
                    // Transform rewards data to match frontend format
                    const transformedRewards = rewardsResponse.data.map(reward => ({
                        id: reward._id,
                        ambassadorId: reward.ambassador._id,
                        ambassadorName: reward.ambassador.name,
                        amount: reward.amount,
                        currency: reward.currency,
                        status: reward.status,
                        remarks: reward.remarks,
                        createdAt: reward.createdAt,
                        country: reward.ambassador.country || 'Not specified',
                        state: reward.ambassador.state || ''
                    }));
                    
                    setRewards(transformedRewards);
                    rewardsCount = transformedRewards.length;
                    console.log('Rewards loaded:', transformedRewards);
                }
            } catch (rewardsError) {
                console.error('Failed to fetch rewards:', rewardsError);
                // Don't show error to user, just log it
            }

            // Update stats

            setStats({

                totalAmbassadors: verifiedAmbassadors.length,

                activeAmbassadors: verifiedAmbassadors.length,

                pendingApplications: pendingAmbassadors.length,

                totalConversations: Math.floor(Math.random() * 150) + 50,

                totalRewards: rewardsCount, // Use actual rewards count

                monthlyGrowth: Math.floor(Math.random() * 25) + 5

            });



        } catch (error) {

            console.error('Failed to fetch dashboard data:', error);

            alert('❌ Failed to load dashboard data. Please refresh the page.');

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={handleCloseMobileMenu}
                />
            )}

            {/* Fixed Desktop Sidebar */}
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

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
                    <div 
                        className="w-64 h-screen shadow-lg flex flex-col"
                        style={{ 
                            backgroundColor: '#4682B4',
                            borderRight: `1px solid #4682B480`
                        }}
                    >
                        {/* Mobile Close Button */}
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
            <AdminSidebar
                activeTab={activeTab}
                            setActiveTab={(tab) => {
                                if (tab === 'close') {
                                    handleCloseMobileMenu();
                                } else {
                                    setActiveTab(tab);
                                    handleCloseMobileMenu();
                                }
                            }}
                adminDashboardColor={adminDashboardColor}
                adminTextColor={adminTextColor}
                isSettingsDropdownOpen={isSettingsDropdownOpen}
                handleSettingsClick={handleSettingsClick}
                handleCustomizeClick={handleCustomizeClick}
                sidebarItems={sidebarItems}
            />
                    </div>
                </div>
            )}



            {/* Main Content Area */}

            <div

                className="flex-1 flex flex-col lg:ml-64"

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

                    <div className="px-4 lg:px-6 py-4">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-4">

                                {/* Mobile Menu Button */}
                                <button
                                    onClick={handleMobileMenuToggle}
                                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                            <div>

                                    <h1 className="text-xl lg:text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>

                                <p className="text-sm text-slate-500 mt-1">

                                    {activeTab === 'overview' && 'Overview of your platform'}

                                    {activeTab === 'ambassadors' && 'Manage your ambassadors'}

                                    {activeTab === 'rewards' && 'Manage reward system'}

                                    {activeTab === 'users' && 'User management and roles'}


                                    {activeTab === 'settings' && 'Configure platform settings'}

                                </p>

                                </div>

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

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">

                    {/* Render nested routes */}

                    <Outlet />




                    {activeTab === 'overview' && <Overview stats={stats} />}


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


                    {activeTab === 'rewards' && (
                        <RewardsTab
                            rewards={rewards}
                            adminDashboardColor={adminDashboardColor}
                            onEditReward={handleEditReward}
                            onDeleteReward={handleDeleteReward}
                        />
                    )}
                    {activeTab === 'users' && <UserManagement />}
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

            <EditRewardModal
                isOpen={isEditRewardModalOpen}
                reward={selectedReward}
                onClose={handleCloseEditRewardModal}
                onSubmit={handleUpdateReward}
            />




        </div>

    );

};





export default AdminDashboard;