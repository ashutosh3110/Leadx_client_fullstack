import React, { useState, useEffect } from "react"
import { useColorContext } from "../../context/ColorContext"
import { rewardsAPI } from "../utils/Api"
import { getToken, getUser } from "../utils/auth"

const Rewards = () => {
  const { ambassadorDashboardColor } = useColorContext()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRewards: 0,
    totalAmount: 0,
    pendingRewards: 0,
    approvedRewards: 0,
    paidRewards: 0,
    primaryCurrency: 'INR'
  })
  const [filter, setFilter] = useState('all') // all, pending, approved, paid

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

  useEffect(() => {
    fetchMyRewards()
  }, [])

  const fetchMyRewards = async () => {
    try {
      setLoading(true)
      
      // Debug: Check current user and token using the same functions as ProtectedRoute
      const token = getToken()
      const user = getUser()
      console.log('Ambassador Rewards - Current token:', token ? 'Present' : 'Missing')
      console.log('Ambassador Rewards - Current user:', user)
      console.log('Ambassador Rewards - User role:', user?.role)
      
      const response = await rewardsAPI.getMyRewards()
      console.log('My rewards response:', response)
      
      if (response.success && Array.isArray(response.data)) {
        setRewards(response.data)
        
               // Calculate statistics
               const totalRewards = response.data.length
               const totalAmount = response.data.reduce((sum, reward) => sum + (reward.amount || 0), 0)
               const pendingRewards = response.data.filter(r => r.status === 'pending').length
               const approvedRewards = response.data.filter(r => r.status === 'approved').length
               const paidRewards = response.data.filter(r => r.status === 'paid').length
               
               // Get the most common currency from rewards (or default to first reward's currency)
               const currencyCounts = {}
               response.data.forEach(reward => {
                 const currency = reward.currency || 'INR'
                 currencyCounts[currency] = (currencyCounts[currency] || 0) + 1
               })
               
               // Find the most common currency
               const primaryCurrency = Object.keys(currencyCounts).reduce((a, b) => 
                 currencyCounts[a] > currencyCounts[b] ? a : b, 'INR'
               )
               
               setStats({
                 totalRewards,
                 totalAmount,
                 pendingRewards,
                 approvedRewards,
                 paidRewards,
                 primaryCurrency
               })
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'all') return true
    return reward.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'paid':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-slate-600">Loading your rewards...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <svg
              className="w-6 h-6 text-yellow-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            My Rewards
          </h2>
          <div className="text-sm text-slate-600">
            Total Rewards: {stats.totalRewards}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Amount */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                {getCurrencySymbol(stats.primaryCurrency)}{stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${ambassadorDashboardColor}20` }}
            >
              <svg className="w-6 h-6" style={{ color: ambassadorDashboardColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Rewards */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRewards}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Approved Rewards */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-blue-600">{stats.approvedRewards}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Paid Rewards */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidRewards}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Rewards Table */}
      <div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        {/* Filter Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex space-x-1 p-4">
            {[
              { key: 'all', label: 'All Rewards', count: stats.totalRewards },
              { key: 'pending', label: 'Pending', count: stats.pendingRewards },
              { key: 'approved', label: 'Approved', count: stats.approvedRewards },
              { key: 'paid', label: 'Paid', count: stats.paidRewards }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === tab.key
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: filter === tab.key ? ambassadorDashboardColor : 'transparent'
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Table */}
        {filteredRewards.length > 0 ? (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-slate-50 rounded-t-lg text-xs font-medium text-slate-500 uppercase tracking-wider">
              <div>Amount</div>
              <div>Remarks</div>
              <div>Date</div>
              <div>Status</div>
            </div>
            
            {/* Rows */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filteredRewards.map((reward) => (
                <div
                  key={reward._id}
                  className="grid grid-cols-4 gap-4 px-4 py-2 bg-white hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100"
                >
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold text-slate-900">
                      {getCurrencySymbol(reward.currency || 'INR')}
                      {reward.amount?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-slate-500">
                      {reward.currency || 'INR'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-900 truncate">
                    {reward.remarks || 'No remarks'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {reward.createdAt ? new Date(reward.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                      {getStatusIcon(reward.status)}
                      <span className="ml-1">
                        {reward.status?.charAt(0)?.toUpperCase() + reward.status?.slice(1) || 'Pending'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <h4 className="text-lg font-semibold text-slate-800 mb-2">
              {filter === 'all' ? 'No Rewards Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Rewards`}
            </h4>
            <p className="text-slate-600">
              {filter === 'all' 
                ? 'You haven\'t received any rewards yet. Keep up the great work!' 
                : `You don't have any ${filter} rewards at the moment.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Rewards
