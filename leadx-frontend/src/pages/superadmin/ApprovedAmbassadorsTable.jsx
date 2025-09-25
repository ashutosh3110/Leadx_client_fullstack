import React, { useState, useMemo } from 'react';

const ApprovedAmbassadorsTable = ({
    ambassadors,
    handleEditAmbassador,
    handleDeleteAmbassador,
    loading,
    handleViewAmbassadorDetails
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter ambassadors based on search term
    const filteredAmbassadors = useMemo(() => {
        if (!searchTerm.trim()) {
            return ambassadors;
        }
        
        return ambassadors.filter(ambassador => 
            ambassador.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ambassador.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [ambassadors, searchTerm]);
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approved Ambassadors ({filteredAmbassadors.length})
                </h3>
                <div className="flex items-center space-x-3">
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
            </div>

            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '700px' }}>
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <tr>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Ambassador</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Profile</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Course</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Reward</th>
                            <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Joined</th>
                            <th className="px-2 lg:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredAmbassadors.map((ambassador, index) => (
                            <tr key={ambassador._id || index} className="hover:bg-yellow-50/50 transition-colors duration-200">
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                                            {ambassador.profileImage ? (
                                                <img
                                                    src={`http://localhost:5000/${ambassador.profileImage}`}
                                                    alt={ambassador.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                                ${ambassador.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {ambassador.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1">
                                            <button
                                                onClick={() => handleViewAmbassadorDetails(ambassador)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer text-left truncate block w-full"
                                            >
                                                {ambassador.name}
                                            </button>
                                            <div className="text-xs text-slate-500 truncate">{ambassador.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ambassador.isVerified
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                        {ambassador.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="truncate max-w-32">{ambassador.course || 'Not specified'}</div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="truncate max-w-24">{ambassador.country || 'Not specified'}</div>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        ambassador.hasReward 
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                        {ambassador.hasReward ? 'Added' : 'Not Added'}
                                    </span>
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(ambassador.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handleEditAmbassador(ambassador)}
                                            disabled={loading}
                                            className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                            title="Edit Ambassador"
                                        >
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAmbassador(ambassador._id)}
                                            disabled={loading}
                                            className="p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                            title="Delete Ambassador"
                                        >
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredAmbassadors.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">
                                            {searchTerm ? `No ambassadors found for "${searchTerm}"` : 'No Approved Ambassadors'}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {searchTerm ? 'Try adjusting your search terms' : 'No ambassadors have been approved yet'}
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
        </div>
    );
};

export default ApprovedAmbassadorsTable;
