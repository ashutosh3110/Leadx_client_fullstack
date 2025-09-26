import React from "react";

const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>

          <h4 className="text-lg font-semibold text-slate-800 mb-2">
            User Management
          </h4>
          <p className="text-slate-600">
            Manage user accounts and permissions
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
