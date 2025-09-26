import React from 'react';
import { useOutletContext } from 'react-router-dom';
import RewardsTab from './RewardTab';

const AdminRewards = () => {
    const {
        rewards,
        adminDashboardColor,
        handleEditReward,
        handleDeleteReward
    } = useOutletContext();

    return (
        <RewardsTab
            rewards={rewards}
            adminDashboardColor={adminDashboardColor}
            onEditReward={handleEditReward}
            onDeleteReward={handleDeleteReward}
        />
    );
};

export default AdminRewards;

