import React, { useState, useMemo } from 'react';
import Pagination from '../user/Pagination';

const PendingApplicationsTable = ({ 
    pendingApplications, 
    handleApproveApplication, 
    handleRejectApplication, 
    loading, 
    handleViewAmbassadorDetails 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter applications based on search term
    const filteredApplications = useMemo(() => {
        if (!searchTerm.trim()) {
            return pendingApplications;
        }
        
        return pendingApplications.filter(application => 
            application.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pendingApplications, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending Applications ({filteredApplications.length})
                </h3>
                
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white w-full sm:w-64"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '600px' }}>
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <tr>
                            <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Applicant</th>
                            <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Course</th>
                            <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Applied</th>
                            <th className="px-2 lg:px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginatedApplications.length > 0 ? paginatedApplications.map((application, index) => (
                            <tr key={application._id || index} className="hover:bg-yellow-50/50 transition-colors duration-200">
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center">
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
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                                    <div className="truncate max-w-32">{application.course || 'Not specified'}</div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                                    <div className="truncate max-w-24">{application.country || 'Not specified'}</div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                    {new Date(application.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handleApproveApplication(application._id)}
                                            disabled={loading}
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white text-xs font-semibold rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-green-300 disabled:text-green-300 whitespace-nowrap"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectApplication(application._id)}
                                            disabled={loading}
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white text-xs font-semibold rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-red-300 disabled:text-red-300 whitespace-nowrap"
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
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">
                                            {searchTerm ? `No applications found for "${searchTerm}"` : 'No Pending Applications'}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {searchTerm ? 'Try adjusting your search terms' : 'All ambassador applications have been processed'}
                                        </p>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredApplications.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}
        </div>
    );
};

export default PendingApplicationsTable;
