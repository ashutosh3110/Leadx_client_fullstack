import React, { useState, useMemo, useEffect } from 'react';
import Pagination from '../user/Pagination';

// API Setup Instructions:
// 1. Get API key from https://countrystatecity.in/
// 2. Create .env file in frontend root directory
// 3. Add: REACT_APP_COUNTRY_API_KEY=your_api_key_here
// 4. Restart the development server

const PendingApplicationsTable = ({ 
    pendingApplications, 
    handleApproveApplication, 
    handleRejectApplication, 
    loading, 
    handleViewAmbassadorDetails 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [stateSearchTerm, setStateSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter applications based on search term and filters
    const filteredApplications = useMemo(() => {
        return pendingApplications.filter(application => {
            const matchesSearch = !searchTerm.trim() || 
                application.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                application.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCountry = !countryFilter || 
                application.country?.toLowerCase().includes(countryFilter.toLowerCase());
            
            const matchesState = !stateFilter || 
                application.state?.toLowerCase().includes(stateFilter.toLowerCase());
            
            const matchesCourse = !courseFilter || 
                application.course?.toLowerCase().includes(courseFilter.toLowerCase());
            
            return matchesSearch && matchesCountry && matchesState && matchesCourse;
        });
    }, [pendingApplications, searchTerm, countryFilter, stateFilter, courseFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, countryFilter, stateFilter, courseFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    // Fetch countries from API
    const fetchCountries = async () => {
        setLoadingCountries(true);
        try {
            const response = await fetch('https://api.countrystatecity.in/v1/countries', {
                headers: {
                    'X-CSCAPI-KEY': import.meta.env.VITE_COUNTRY_API_KEY || 'YOUR_API_KEY_HERE'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch countries');
            }
            
            const countriesData = await response.json();
            setCountries(countriesData);
        } catch (error) {
            console.error('Error fetching countries:', error);
            // Fallback to mock data if API fails
            const mockCountries = [
                { name: 'India' },
                { name: 'United States' },
                { name: 'United Kingdom' },
                { name: 'Canada' },
                { name: 'Australia' }
            ];
            setCountries(mockCountries);
        } finally {
            setLoadingCountries(false);
        }
    };

    // Fetch Indian states
    const fetchStates = async (countryCode) => {
        if (!countryCode) return;
        
        setLoadingStates(true);
        
        try {
            const apiKey = import.meta.env.VITE_COUNTRY_API_KEY || 'YOUR_API_KEY_HERE';
            
            const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
                headers: {
                    'X-CSCAPI-KEY': apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch states: ${response.status}`);
            }
            
            const statesData = await response.json();
            setStates(statesData);
        } catch (error) {
            console.error('Error fetching states:', error);
            // Fallback to mock Indian states data
            const mockStates = [
                { name: 'Andhra Pradesh' },
                { name: 'Arunachal Pradesh' },
                { name: 'Assam' },
                { name: 'Bihar' },
                { name: 'Chhattisgarh' },
                { name: 'Goa' },
                { name: 'Gujarat' },
                { name: 'Haryana' },
                { name: 'Himachal Pradesh' },
                { name: 'Jharkhand' },
                { name: 'Karnataka' },
                { name: 'Kerala' },
                { name: 'Madhya Pradesh' },
                { name: 'Maharashtra' },
                { name: 'Manipur' },
                { name: 'Meghalaya' },
                { name: 'Mizoram' },
                { name: 'Nagaland' },
                { name: 'Odisha' },
                { name: 'Punjab' },
                { name: 'Rajasthan' },
                { name: 'Sikkim' },
                { name: 'Tamil Nadu' },
                { name: 'Telangana' },
                { name: 'Tripura' },
                { name: 'Uttar Pradesh' },
                { name: 'Uttarakhand' },
                { name: 'West Bengal' },
                { name: 'Delhi' }
            ];
            setStates(mockStates);
        } finally {
            setLoadingStates(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        if (countryFilter && countryFilter.toLowerCase() === 'india') {
            // Only fetch states for India
            fetchStates('IN');
        } else {
            // Clear states for non-India countries
            setStates([]);
            setStateFilter('');
        }
    }, [countryFilter]);
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <h3 className="text-xs font-semibold text-slate-800 flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending Applications ({filteredApplications.length})
                </h3>
                
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by ambassador name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white w-full sm:w-64"
                    />
                    <svg className="w-3 h-3 text-slate-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-2 mb-2">
                <div className="flex flex-wrap gap-2 items-end">
                    {/* Course Filter */}
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-normal text-slate-700 mb-0.5">Course</label>
                        <input
                            type="text"
                            placeholder="Filter by course..."
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                        />
                    </div>

                    {/* Country Filter */}
                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-normal text-slate-700 mb-0.5">Country</label>
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            disabled={loadingCountries}
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white disabled:bg-gray-100"
                        >
                            <option value="">All Countries</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                        {loadingCountries && (
                            <div className="text-xs text-gray-500 mt-1">Loading countries...</div>
                        )}
                    </div>

                    {/* State Filter - Show only when India is selected */}
                    {countryFilter && countryFilter.toLowerCase() === 'india' && (
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-normal text-slate-700 mb-0.5">State</label>
                            <select
                                value={stateFilter}
                                onChange={(e) => setStateFilter(e.target.value)}
                                disabled={loadingStates}
                                className="w-full px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white disabled:bg-gray-100"
                            >
                                <option value="">All States</option>
                                {states.map((state, index) => (
                                    <option key={index} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {loadingStates && (
                                <div className="text-xs text-gray-500 mt-1">Loading states...</div>
                            )}
                        </div>
                    )}

                    {/* Clear All Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCountryFilter('');
                                setStateFilter('');
                                setCourseFilter('');
                                setCountrySearchTerm('');
                                setStateSearchTerm('');
                            }}
                            className="flex items-center space-x-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 text-xs"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Clear All</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-x-auto max-w-6xl mx-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '600px' }}>
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <tr>
                            <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Ambassador</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Course</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Applied</th>
                            <th className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 space-y-1">
                        {paginatedApplications.length > 0 ? paginatedApplications.map((application, index) => (
                            <tr key={application._id || index} className="hover:bg-yellow-50/50 transition-colors duration-200 mb-1">
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                                            {application.profileImage ? (
                                                <img
                                                    src={`http://localhost:5000/${application.profileImage}`}
                                                    alt={application.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                                ${application.name ? application.name.charAt(0).toUpperCase() : 'A'}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {application.name ? application.name.charAt(0).toUpperCase() : 'A'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 text-center">
                                            <button 
                                                onClick={() => handleViewAmbassadorDetails(application)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer text-center truncate block w-full"
                                            >
                                                {application.name ? application.name.charAt(0).toUpperCase() + application.name.slice(1) : 'Unknown Ambassador'}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="text-xs text-slate-600 truncate max-w-40" title={application.email}>
                                        {application.email || 'No email provided'}
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                                    <div className="flex justify-center items-center">
                                        <span className="truncate max-w-32 text-xs">{application.course || 'Not specified'}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                                    <div className="flex justify-center items-center">
                                        <span className="truncate max-w-24 text-xs">{application.country || 'Not specified'}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-500 text-center">
                                    {new Date(application.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => handleApproveApplication(application._id || application.id)}
                                            disabled={loading}
                                            className="px-2 py-2 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white text-xs font-medium rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-green-300 disabled:text-green-300 whitespace-nowrap cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectApplication(application._id || application.id)}
                                            disabled={loading}
                                            className="px-2 py-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white text-xs font-medium rounded-full transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-red-300 disabled:text-red-300 whitespace-nowrap cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                                        </svg>
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">
                                            {searchTerm ? `No ambassadors found for "${searchTerm}"` : 'No Pending Applications'}
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            {searchTerm ? 'Try adjusting your search terms' : 'All ambassador applications have been processed'}
                                        </p>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline cursor-pointer"
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

