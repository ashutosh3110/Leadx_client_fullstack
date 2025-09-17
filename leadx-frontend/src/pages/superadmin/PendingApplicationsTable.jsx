import React from 'react';

const PendingApplicationsTable = ({ 
    pendingApplications, 
    handleApproveApplication, 
    handleRejectApplication, 
    loading, 
    handleViewAmbassadorDetails 
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending Applications ({pendingApplications.length})
                </h3>
            </div>

            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '800px' }}>
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Applicant</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Course</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Applied</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {pendingApplications.length > 0 ? pendingApplications.map((application, index) => (
                            <tr key={application._id || index} className="hover:bg-yellow-50/50 transition-colors duration-200">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                                            {application.profileImage ? (
                                                <img
                                                    src={`http://localhost:5000/${application.profileImage}`}
                                                    alt={application.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                                ${application.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {application.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1">
                                            <button 
                                                onClick={() => handleViewAmbassadorDetails(application)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer text-left truncate block w-full"
                                            >
                                                {application.name}
                                            </button>
                                            <div className="text-xs text-slate-500 truncate">{application.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="truncate max-w-32">{application.course || 'Not specified'}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="truncate max-w-24">{application.country || 'Not specified'}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(application.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onClick={() => handleApproveApplication(application._id)}
                                            disabled={loading}
                                            className="px-3 py-1.5 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white text-xs font-semibold rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-green-300 disabled:text-green-300 whitespace-nowrap"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectApplication(application._id)}
                                            disabled={loading}
                                            className="px-3 py-1.5 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white text-xs font-semibold rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-red-300 disabled:text-red-300 whitespace-nowrap"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                                        </svg>
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">No Pending Applications</h4>
                                        <p className="text-xs text-slate-400">All ambassador applications have been processed</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingApplicationsTable;
