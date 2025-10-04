import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PendingApplicationsTable from './PendingApplicationsTable';
import ApprovedAmbassadorsTable from './ApprovedAmbassadorsTable';

const AdminAmbassadors = () => {
    const {
        ambassadors,
        pendingApplications,
        loading,
        handleApproveApplication,
        handleRejectApplication,
        handleViewAmbassadorDetails,
        handleEditAmbassador,
        handleDeleteAmbassador
    } = useOutletContext();

    return (
        <div className="space-y-4 sm:space-y-6">
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
    );
};

export default AdminAmbassadors;

