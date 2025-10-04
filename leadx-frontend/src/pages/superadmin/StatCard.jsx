import React from 'react';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
        <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium truncate">{title}</p>
                <p className="text-slate-800 text-2xl sm:text-3xl font-bold mt-1">{value}</p>
                {trend && (
                    <div className="flex items-center mt-1 sm:mt-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-green-600 text-xs sm:text-sm font-medium">+{trend}%</span>
                    </div>
                )}
            </div>
            <div className="bg-slate-200/50 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6">
                    {icon}
                </div>
            </div>
        </div>
    </div>
);

export default StatCard;
