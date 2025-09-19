import React, { useState, useEffect } from 'react';

const AddRewardModal = ({ 
    isOpen, 
    ambassador, 
    onClose, 
    onSubmit 
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'INR',
        state: '',
        remarks: ''
    });

    const [loading, setLoading] = useState(false);

    // Indian states for dropdown
    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
        'Ladakh', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep', 'Andaman and Nicobar Islands'
    ];

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

    const currencyOptions = [
        { value: 'INR', label: 'INR (₹)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'CAD', label: 'CAD (C$)' },
        { value: 'AUD', label: 'AUD (A$)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'JPY', label: 'JPY (¥)' },
        { value: 'CNY', label: 'CNY (¥)' },
        { value: 'KRW', label: 'KRW (₩)' },
        { value: 'BRL', label: 'BRL (R$)' },
        { value: 'MXN', label: 'MXN ($)' },
        { value: 'RUB', label: 'RUB (₽)' },
        { value: 'ZAR', label: 'ZAR (R)' },
        { value: 'SGD', label: 'SGD (S$)' },
        { value: 'HKD', label: 'HKD (HK$)' },
        { value: 'AED', label: 'AED (د.إ)' },
        { value: 'SAR', label: 'SAR (﷼)' },
        { value: 'TRY', label: 'TRY (₺)' },
        { value: 'THB', label: 'THB (฿)' },
        { value: 'MYR', label: 'MYR (RM)' },
        { value: 'IDR', label: 'IDR (Rp)' },
        { value: 'PHP', label: 'PHP (₱)' },
        { value: 'VND', label: 'VND (₫)' },
        { value: 'BDT', label: 'BDT (৳)' },
        { value: 'PKR', label: 'PKR (₨)' },
        { value: 'LKR', label: 'LKR (₨)' },
        { value: 'NPR', label: 'NPR (₨)' },
        { value: 'BTN', label: 'BTN (Nu.)' },
        { value: 'MMK', label: 'MMK (K)' },
        { value: 'KHR', label: 'KHR (៛)' },
        { value: 'LAK', label: 'LAK (₭)' }
    ];

    // Function to get currency based on country
    const getCurrencyByCountry = (country) => {
        const countryCurrencyMap = {
            'India': 'INR',
            'United States': 'USD',
            'USA': 'USD',
            'US': 'USD',
            'United Kingdom': 'GBP',
            'UK': 'GBP',
            'Canada': 'CAD',
            'Australia': 'AUD',
            'Germany': 'EUR',
            'France': 'EUR',
            'Italy': 'EUR',
            'Spain': 'EUR',
            'Netherlands': 'EUR',
            'Japan': 'JPY',
            'China': 'CNY',
            'South Korea': 'KRW',
            'Brazil': 'BRL',
            'Mexico': 'MXN',
            'Russia': 'RUB',
            'South Africa': 'ZAR',
            'Singapore': 'SGD',
            'Hong Kong': 'HKD',
            'UAE': 'AED',
            'Saudi Arabia': 'SAR',
            'Turkey': 'TRY',
            'Thailand': 'THB',
            'Malaysia': 'MYR',
            'Indonesia': 'IDR',
            'Philippines': 'PHP',
            'Vietnam': 'VND',
            'Bangladesh': 'BDT',
            'Pakistan': 'PKR',
            'Sri Lanka': 'LKR',
            'Nepal': 'NPR',
            'Bhutan': 'BTN',
            'Myanmar': 'MMK',
            'Cambodia': 'KHR',
            'Laos': 'LAK'
        };
        
        // Case-insensitive matching
        const normalizedCountry = country?.trim();
        return countryCurrencyMap[normalizedCountry] || 
               countryCurrencyMap[normalizedCountry?.toLowerCase()] || 
               countryCurrencyMap[normalizedCountry?.toUpperCase()] || 
               'USD'; // Default to USD if country not found
    };

    useEffect(() => {
        if (isOpen && ambassador) {
            console.log('AddRewardModal - Ambassador data:', ambassador);
            console.log('AddRewardModal - Ambassador country:', ambassador.country);
            console.log('AddRewardModal - Ambassador state:', ambassador.state);
            
            // Set currency based on country
            const currency = getCurrencyByCountry(ambassador.country);
            console.log('AddRewardModal - Selected currency:', currency);
            
            setFormData(prev => ({
                ...prev,
                currency,
                state: ambassador.state || ''
            }));
        }
    }, [isOpen, ambassador]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                amount: '',
                currency: 'INR',
                state: '',
                remarks: ''
            });
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const rewardData = {
                ambassadorId: ambassador._id,
                ambassadorName: ambassador.name,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                state: ambassador.country === 'India' ? formData.state : null,
                country: ambassador.country,
                remarks: formData.remarks,
                date: new Date().toISOString()
            };

            console.log('AddRewardModal - Submitting reward data:', rewardData);
            console.log('AddRewardModal - Ambassador country from data:', rewardData.country);

            await onSubmit(rewardData);
            onClose();
        } catch (error) {
            console.error('Error adding reward:', error);
            alert('Error adding reward. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !ambassador) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-end p-4"
            style={{ 
                zIndex: 10000,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(2px)'
            }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-lg border border-slate-200 max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden mr-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1"></div>
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow">
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
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Add Reward</h2>
                            <p className="text-xs text-slate-600">{ambassador.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Country Info */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Country:</span>
                                <span className="text-sm font-semibold text-slate-800">{ambassador.country || 'Not specified'}</span>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Amount *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                />
                                <span className="absolute left-3 top-2 text-sm font-medium text-slate-500">
                                    {getCurrencySymbol(formData.currency)}
                                </span>
                            </div>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Currency *
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                {currencyOptions.map(currency => (
                                    <option key={currency.value} value={currency.value}>
                                        {currency.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* State (only for India) */}
                        {ambassador.country === 'India' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    State *
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                >
                                    <option value="">Select State</option>
                                    {indianStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                                placeholder="Enter reward remarks (optional)"
                            />
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? 'Adding...' : 'Add Reward'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRewardModal;
