// src/components/RewardsTab.jsx
import React, { useState, useMemo } from "react";

const RewardsTab = ({ rewards, adminDashboardColor, onEditReward, onDeleteReward }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rewards based on search term
  const filteredRewards = useMemo(() => {
    if (!searchTerm.trim()) {
      return rewards;
    }
    
    return rewards.filter(reward => 
      reward.ambassadorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rewards, searchTerm]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Ambassador Rewards ({filteredRewards.length})
        </h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ambassador, remarks, or country..."
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
              <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
              <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Remarks</th>
              <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Country</th>
              <th className="px-2 lg:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-2 lg:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRewards.map((reward, index) => (
              <tr key={reward.id || index} className="hover:bg-yellow-50/50 transition-colors duration-200">
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-200 flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {reward.ambassadorName?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {reward.ambassadorName || 'Unknown Ambassador'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">
                    {getCurrencySymbol(reward.currency || 'USD')}{reward.amount || 0}
                  </div>
                  <div className="text-xs text-slate-500">{reward.currency || 'USD'}</div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                  <div className="truncate max-w-32">{reward.remarks || 'No remarks'}</div>
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                  <div className="truncate max-w-24">{reward.country || 'Not specified'}</div>
                  {reward.state && (
                    <div className="text-xs text-slate-500 truncate">{reward.state}</div>
                  )}
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  {reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-2 lg:px-4 py-4 whitespace-nowrap text-center">
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
                    <h4 className="text-sm font-medium text-slate-500 mb-1">
                      {searchTerm ? `No rewards found for "${searchTerm}"` : 'No Rewards Yet'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start adding rewards to ambassadors to see them here'}
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

export default RewardsTab;
