import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditRewardModal = ({ 
    isOpen, 
    reward, 
    onClose, 
    onSubmit 
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'INR',
        remarks: ''
    });

    const [loading, setLoading] = useState(false);

    const currencyOptions = [
        { value: 'INR', label: 'INR (₹)' },
        { value: 'USD', label: 'USD ($)' }
    ];


    useEffect(() => {
        if (isOpen && reward) {
            console.log('EditRewardModal - Reward data:', reward);
            
            setFormData({
                amount: reward.amount || '',
                currency: reward.currency || 'INR',
                remarks: reward.remarks || ''
            });
        }
    }, [isOpen, reward]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                amount: '',
                currency: 'INR',
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
            const updatedRewardData = {
                id: reward.id,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                remarks: formData.remarks,
                ambassadorId: reward.ambassadorId,
                ambassadorName: reward.ambassadorName,
                country: reward.country,
                state: reward.state
            };

            console.log('EditRewardModal - Submitting updated reward data:', updatedRewardData);

            await onSubmit(updatedRewardData);
            onClose();
        } catch (error) {
            console.error('Error updating reward:', error);
            toast.error('Error updating reward. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !reward) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-end p-4"
            style={{ 
                zIndex: 10000,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-full overflow-y-auto"
                style={{ 
                    border: '1px solid #e2e8f0',
                }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <svg
                                className="w-5 h-5 text-yellow-500 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Edit Reward
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Ambassador Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-2">Ambassador Details</h3>
                        <div className="text-sm text-slate-600">
                            <div className="font-medium">{reward.ambassadorName}</div>
                            <div className="text-xs text-slate-500">
                                {reward.country} {reward.state && `- ${reward.state}`}
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Currency - Only show for non-India countries */}
                    {reward.country !== 'India' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Currency <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                            >
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                    )}


                    {/* Remarks */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Enter remarks (optional)"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Update Reward'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRewardModal;
