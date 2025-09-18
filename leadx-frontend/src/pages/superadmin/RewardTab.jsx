// src/components/RewardsTab.jsx
import React from "react";

const RewardsTab = ({ rewards, adminDashboardColor }) => {
  return (
    <div className="space-y-6">
      {/* Rewards Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Ambassador Rewards ({rewards.length})
          </h3>
          <div className="text-sm text-slate-600">
            Total Rewards: {rewards.length}
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div
        className="backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${adminDashboardColor}15, ${adminDashboardColor}10)`,
          borderColor: `${adminDashboardColor}30`,
        }}
      >
        {rewards.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead
              style={{
                background: `linear-gradient(135deg, ${adminDashboardColor}25, ${adminDashboardColor}15)`,
              }}
            >
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ambassador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Country/State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rewards.map((reward) => (
                <tr
                  key={reward.id}
                  className="transition-colors duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${adminDashboardColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden border-2 mr-3"
                        style={{ borderColor: `${adminDashboardColor}40` }}
                      >
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${adminDashboardColor}, ${adminDashboardColor}dd)`,
                          }}
                        >
                          {reward.ambassadorName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {reward.ambassadorName}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: {reward.ambassadorId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900">
                      {reward.currency === "INR" ? "₹" : "$"}
                      {reward.amount}
                    </div>
                    <div className="text-xs text-slate-500">
                      {reward.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: adminDashboardColor }}
                    >
                      {reward.category.charAt(0).toUpperCase() +
                        reward.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{reward.country}</div>
                    {reward.state && (
                      <div className="text-xs text-slate-500">
                        {reward.state}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {reward.status.charAt(0).toUpperCase() +
                        reward.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              No Rewards Yet
            </h4>
            <p className="text-slate-600">
              Start adding rewards to ambassadors to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsTab;
