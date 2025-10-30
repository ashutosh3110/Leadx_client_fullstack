import React, { useState, useEffect } from "react";
import StatCard from "./StatCard"; // adjust path as needed
import { chatAPI } from "../utils/Api";

const Overview = ({ stats }) => {
  const [studentStats, setStudentStats] = useState({
    totalStudents: 0,
    totalInitiatedChats: 0,
    repliedChats: 0,
    unrepliedChats: 0
  });

  // Fetch student statistics
  const fetchStudentStats = async () => {
    try {
      const response = await chatAPI.getStudentStats();
      if (response.success) {
        setStudentStats({
          totalStudents: response.data.totalStudents || 0,
          totalInitiatedChats: response.data.totalInitiatedChats || 0,
          repliedChats: response.data.repliedChats || 0,
          unrepliedChats: response.data.unrepliedChats || 0
        });
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* For Ambassador Stats */}
      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">For Ambassador</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Ambassadors"
            value={stats.totalAmbassadors}
            trend={stats.monthlyGrowth}
            color="from-slate-100 to-slate-200"
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600"
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
                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600"
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
                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600"
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
                className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600"
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
      <div className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">For Student</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Students"
            value={studentStats.totalStudents}
            color="from-blue-100 to-blue-200"
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
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
            title="Initiated Chats"
            value={studentStats.totalInitiatedChats}
            color="from-green-100 to-green-200"
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
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
            title="Replied"
            value={studentStats.repliedChats}
            color="from-emerald-100 to-emerald-200"
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600"
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
            title="Unreplied"
            value={studentStats.unrepliedChats}
            color="from-red-100 to-red-200"
            icon={
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
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
        </div>
      </div>
    </div>
  );
};

export default Overview;
