import React from 'react';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 border border-slate-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-600 text-sm font-medium">{title}</p>
                <p className="text-slate-800 text-3xl font-bold mt-1">{value}</p>
                {trend && (
                    <div className="flex items-center mt-2">
                        <svg className="w-4 h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-green-600 text-sm font-medium">+{trend}%</span>
                    </div>
                )}
            </div>
            <div className="bg-slate-200/50 p-3 rounded-full">
                {icon}
            </div>
        </div>
    </div>
);

export default StatCard;
