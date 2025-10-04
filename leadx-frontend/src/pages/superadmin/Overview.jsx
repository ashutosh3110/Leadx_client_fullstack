import React, { useState, useEffect } from "react";
import StatCard from "./StatCard"; // adjust path as needed

const Overview = ({ stats }) => {
  const [studentTimeFilter, setStudentTimeFilter] = useState('24');
  const [studentChatStats, setStudentChatStats] = useState({
    totalChats: 0,
    unrepliedChats: 0,
    repliedChats: 0
  });

  // Fetch chat statistics based on time filter
  const fetchChatStats = async (timeFilter, type) => {
    try {
      const hours = timeFilter === '12' ? 12 : 24;
      const response = await fetch(`/api/chat/admin/stats?hours=${hours}&type=${type}`);
      const data = await response.json();
      
      setStudentChatStats({
        totalChats: data.totalChats || 0,
        unrepliedChats: data.unrepliedChats || 0,
        repliedChats: data.repliedChats || 0
      });
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  };

  useEffect(() => {
    fetchChatStats(studentTimeFilter, 'student');
  }, [studentTimeFilter]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* For Ambassador Stats */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">For Ambassador</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Ambassadors"
            value={stats.totalAmbassadors}
            trend={stats.monthlyGrowth}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            }
          />

          <StatCard
            title="Active Ambassadors"
            value={stats.activeAmbassadors}
            trend={15}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <StatCard
            title="Total Conversations"
            value={stats.totalConversations}
            trend={8}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          />
        </div>
      </div>

      {/* For Student Section */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">For Student</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Total Chats"
            value={studentChatStats.totalChats}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          />

          <StatCard
            title="Unreplied Chats"
            value={studentChatStats.unrepliedChats}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <StatCard
            title="Replied Chats"
            value={studentChatStats.repliedChats}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>
        
        {/* Time Filter Dropdown */}
        <div className="flex justify-end">
          <select
            value={studentTimeFilter}
            onChange={(e) => setStudentTimeFilter(e.target.value)}
            className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="12">Last 12 Hours</option>
            <option value="24">Last 24 Hours</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Overview;
