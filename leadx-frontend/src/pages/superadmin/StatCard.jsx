import React from 'react';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-300/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
        <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-slate-600 text-xs font-medium truncate">{title}</p>
                <p className="text-slate-800 text-xl sm:text-2xl font-bold mt-1">{value}</p>
                {trend && (
                    <div className="flex items-center mt-1">
                        <svg className="w-3 h-3 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-green-600 text-xs font-medium">+{trend}%</span>
                    </div>
                )}
            </div>
            <div className="bg-slate-200/50 p-1.5 sm:p-2 rounded-full flex-shrink-0 ml-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5">
                    {icon}
                </div>
            </div>
        </div>
    </div>
);

export default StatCard;
