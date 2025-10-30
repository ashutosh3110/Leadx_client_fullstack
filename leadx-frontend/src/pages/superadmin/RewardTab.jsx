// src/components/RewardsTab.jsx
import React, { useState, useMemo, useEffect } from "react";

const RewardsTab = ({ rewards, adminDashboardColor, onEditReward, onDeleteReward }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (countryFilter === 'India') {
      loadStates();
    } else {
      setStates([]);
      setStateFilter('');
    }
  }, [countryFilter]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const apiKey = import.meta.env.VITE_COUNTRY_API_KEY;
      
      if (!apiKey) {
        console.warn('Country API key not found. Using fallback countries.');
        setCountries([
          { name: 'India' },
          { name: 'United States' },
          { name: 'United Kingdom' },
          { name: 'Canada' },
          { name: 'Australia' },
          { name: 'Germany' },
          { name: 'France' },
          { name: 'Japan' },
          { name: 'Singapore' },
          { name: 'UAE' }
        ]);
        return;
      }

      const response = await fetch('https://api.countrystatecity.in/v1/countries', {
        headers: {
          'X-CSCAPI-KEY': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCountries(data);
      } else {
        throw new Error('Failed to fetch countries');
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      // Fallback countries
      setCountries([
        { name: 'India' },
        { name: 'United States' },
        { name: 'United Kingdom' },
        { name: 'Canada' },
        { name: 'Australia' }
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const apiKey = import.meta.env.VITE_COUNTRY_API_KEY;
      
      if (!apiKey) {
        console.warn('Country API key not found. Using fallback states.');
        setStates([
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
        ]);
        return;
      }

      const response = await fetch('https://api.countrystatecity.in/v1/countries/IN/states', {
        headers: {
          'X-CSCAPI-KEY': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStates(data);
      } else {
        throw new Error('Failed to fetch states');
      }
    } catch (error) {
      console.error('Error loading states:', error);
      // Fallback states
      setStates([
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
      ]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Filter rewards based on search term, date range, and country
  const filteredRewards = useMemo(() => {
    let filtered = rewards;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(reward => 
        reward.ambassadorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter(reward => {
        if (!reward.createdAt) return false;
        
        const rewardDate = new Date(reward.createdAt);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        // Set time to start/end of day for proper comparison
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);

        if (fromDate && toDate) {
          return rewardDate >= fromDate && rewardDate <= toDate;
        } else if (fromDate) {
          return rewardDate >= fromDate;
        } else if (toDate) {
          return rewardDate <= toDate;
        }
        return true;
      });
    }

    // Country filter
    if (countryFilter) {
      filtered = filtered.filter(reward => {
        if (countryFilter === 'India' && stateFilter) {
          return reward.country === 'India' && reward.state === stateFilter;
        } else {
          return reward.country === countryFilter;
        }
      });
    }

    return filtered;
  }, [rewards, searchTerm, dateFrom, dateTo, countryFilter, stateFilter]);

  // Function to get currency symbol
  const getCurrencySymbol = (currency) => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'EUR': '€',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩',
      'BRL': 'R$',
      'MXN': '$',
      'RUB': '₽',
      'ZAR': 'R',
      'SGD': 'S$',
      'HKD': 'HK$',
      'AED': 'د.إ',
      'SAR': '﷼',
      'TRY': '₺',
      'THB': '฿',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫',
      'BDT': '৳',
      'PKR': '₨',
      'LKR': '₨',
      'NPR': '₨',
      'BTN': 'Nu.',
      'MMK': 'K',
      'KHR': '៛',
      'LAK': '₭'
    };
    return currencySymbols[currency] || currency;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
        <h3 className="text-xs font-semibold text-slate-800 flex items-center">
          <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Ambassador Rewards ({filteredRewards.length})
        </h3>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ambassador, remarks, or country..."
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
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs bg-white"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs bg-white"
            />
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              disabled={loadingCountries}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs bg-white disabled:bg-gray-100"
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

          {/* State Filter (only for India) */}
          {countryFilter === 'India' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                disabled={loadingStates}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs bg-white disabled:bg-gray-100"
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

          {/* Clear Filters Button */}
          {(dateFrom || dateTo || countryFilter || stateFilter) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setCountryFilter('');
                  setStateFilter('');
                }}
                className="w-full px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive container with horizontal scroll */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-x-auto max-w-6xl mx-auto">
        <table className="w-full divide-y divide-slate-200" style={{ minWidth: '500px' }}>
          <thead className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <tr>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Ambassador</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Amount</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Remarks</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Country</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 space-y-1">
            {filteredRewards.map((reward, index) => (
              <tr key={reward.id || index} className="hover:bg-yellow-50/50 transition-colors duration-200 mb-1">
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="text-xs font-semibold text-slate-900">
                    {reward.ambassadorName ? reward.ambassadorName.charAt(0).toUpperCase() + reward.ambassadorName.slice(1) : 'Unknown Ambassador'}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="text-xs font-semibold text-slate-900 text-center">
                    {getCurrencySymbol(reward.currency || 'USD')}{reward.amount || 0}
                  </div>
                  <div className="text-xs text-slate-500 text-center">{reward.currency || 'USD'}</div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900 text-center">
                  <div className="flex justify-center">
                    <div className="truncate max-w-32 text-center">{reward.remarks || 'No remarks'}</div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-900 text-center">
                  <div className="flex flex-col items-center">
                    <div className="truncate max-w-24">{reward.country || 'Not specified'}</div>
                    {reward.state && (
                      <div className="text-xs text-slate-500 truncate">{reward.state}</div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-slate-500 text-center">
                  {reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onEditReward && onEditReward(reward)}
                      className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                      title="Edit Reward"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteReward && onDeleteReward(reward)}
                      className="p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                      title="Delete Reward"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRewards.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <h4 className="text-xs font-medium text-slate-500 mb-1">
                      {searchTerm ? `No rewards found for "${searchTerm}"` : 'No Rewards Yet'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start adding rewards to ambassadors to see them here'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-xs underline"
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

export default RewardsTab;
