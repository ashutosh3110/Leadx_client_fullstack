import React, { useState, useMemo, useEffect } from 'react';
import Pagination from './Pagination';

// API Setup Instructions:
// 1. Get API key from https://countrystatecity.in/
// 2. Create .env file in frontend root directory
// 3. Add: REACT_APP_COUNTRY_API_KEY=your_api_key_here
// 4. Restart the development server

const ApprovedAmbassadorsTable = ({
    ambassadors,
    loading, 
    handleViewAmbassadorDetails, 
    handleEditAmbassador,
    handleDeleteAmbassador,
    handleAddReward
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [rewardFilter, setRewardFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [stateSearchTerm, setStateSearchTerm] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter ambassadors based on search and filters
    const filteredAmbassadors = useMemo(() => {
        return ambassadors.filter(ambassador => {
            const matchesSearch = ambassador.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ambassador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ambassador.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                ambassador.country?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !statusFilter || ambassador.status === statusFilter;
            
            const matchesReward = !rewardFilter || 
                (rewardFilter === 'hasReward' && ambassador.hasReward) ||
                (rewardFilter === 'noReward' && !ambassador.hasReward);
            
            const matchesCountry = !countryFilter || 
                ambassador.country?.toLowerCase().includes(countryFilter.toLowerCase());
            
            const matchesState = !stateFilter || 
                ambassador.state?.toLowerCase().includes(stateFilter.toLowerCase());
            
            return matchesSearch && matchesStatus && matchesReward && matchesCountry && matchesState;
        });
    }, [ambassadors, searchTerm, statusFilter, rewardFilter, countryFilter, stateFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredAmbassadors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAmbassadors = filteredAmbassadors.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, rewardFilter, countryFilter, stateFilter]);

    // Fetch countries from API
    const fetchCountries = async () => {
        setLoadingCountries(true);
        try {
            const response = await fetch('https://api.countrystatecity.in/v1/countries', {
                headers: {
                    'X-CSCAPI-KEY': import.meta.env.VITE_COUNTRY_API_KEY || 'YOUR_API_KEY_HERE' // Get API key from environment variables
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                <h3 className="text-xs font-semibold text-slate-800 flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approved Ambassadors ({filteredAmbassadors.length})
                </h3>
                
                {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, course or country..."
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
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 mb-2 border border-slate-200">
                {/* Single Row - All Filters */}
                <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-end">
                    {/* Status Filter */}
                    <div className="flex-1">
                            <label className="block text-xs font-normal text-slate-700 mb-0.5">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Reward Filter */}
                    <div className="flex-1">
                            <label className="block text-xs font-normal text-slate-700 mb-0.5">Reward Status</label>
                        <select
                            value={rewardFilter}
                            onChange={(e) => setRewardFilter(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                        >
                            <option value="">All Rewards</option>
                            <option value="hasReward">Added</option>
                            <option value="noReward">Not Added</option>
                        </select>
                    </div>


                    {/* Country Filter */}
                    <div className="flex-1">
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
                        <div className="flex-1">
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

                    {/* Clear All Button - Always at the end */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                                setRewardFilter('');
                                setCountryFilter('');
                                setStateFilter('');
                                setCountrySearchTerm('');
                                setStateSearchTerm('');
                            }}
                            className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs flex items-center space-x-1 cursor-pointer"
                        >
                            <span>Clear All</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive container with horizontal scroll */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-x-auto max-w-6xl mx-auto">
                <table className="w-full divide-y divide-slate-200" style={{ minWidth: '500px' }}>
                    <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <tr>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Ambassador</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Email</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Course</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Country</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Status</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Reward</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Registered</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 space-y-1">
                        {paginatedAmbassadors.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="text-gray-400 text-4xl">👥</div>
                                        <div className="text-gray-500 text-lg font-medium">No Ambassadors Available</div>
                                        <div className="text-gray-400 text-sm">
                                            {searchTerm || statusFilter || rewardFilter || countryFilter || stateFilter 
                                                ? 'No ambassadors found matching your filter criteria.' 
                                                : 'No ambassadors found in the database.'}
                                        </div>
                                        {(searchTerm || statusFilter || rewardFilter || countryFilter || stateFilter) && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('');
                                                    setRewardFilter('');
                                                    setCountryFilter('');
                                                    setStateFilter('');
                                                }}
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedAmbassadors.map((ambassador, index) => {
                                console.log('🔍 Rendering ambassador:', ambassador);
                                console.log('🔍 Ambassador keys:', Object.keys(ambassador));
                                return (
                            <tr key={ambassador._id || ambassador.id || index} className="hover:bg-yellow-50/50 transition-colors duration-200 mb-1">
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                                            {ambassador.profileImage ? (
                                                <img
                                                    src={`http://localhost:5000/${ambassador.profileImage}`}
                                                    alt={ambassador.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                                ${ambassador.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {ambassador.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-1 min-w-0 flex-1 text-center">
                                            <button
                                                onClick={() => handleViewAmbassadorDetails(ambassador)}
                                                className="text-xs font-normal text-blue-600 hover:text-blue-800 transition-colors cursor-pointer text-center truncate block w-full capitalize"
                                            >
                                                {ambassador.name}
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                                    <div className="flex justify-center items-center">
                                        <span className="truncate max-w-32 text-xs">{ambassador.email}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                                    <div className="flex justify-center items-center">
                                        <span className="truncate max-w-32 text-xs">{ambassador.course || 'Not specified'}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900">
                                    <div className="flex justify-center items-center">
                                        <span className="truncate max-w-24 text-xs">{ambassador.country || 'Not specified'}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${
                                        ambassador.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {ambassador.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${
                                        ambassador.hasReward 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {ambassador.hasReward ? 'Added' : 'Not Added'}
                                    </span>
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900 text-center">
                                    {new Date(ambassador.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEditAmbassador(ambassador)}
                                            disabled={loading}
                                            className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer"
                                            title="Edit Ambassador"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAmbassador(ambassador._id || ambassador.id)}
                                            disabled={loading}
                                            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer"
                                            title="Delete Ambassador"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            );
                        })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredAmbassadors.length > 0 && (
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

export default ApprovedAmbassadorsTable;
