import React, { useState } from "react"
import CustomizationForm from "./CustomizationForm"
import ScriptGeneratorForm from "./ScriptGeneratorForm"

const AdminCustomize = () => {
  const [activeTab, setActiveTab] = useState("generator")

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "generator"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Script Generator
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            General Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "generator" ? (
        <ScriptGeneratorForm />
      ) : (
        <CustomizationForm />
      )}
    </div>
  )
}

export default AdminCustomize
