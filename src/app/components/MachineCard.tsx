"use client";

import { Machine } from "../types/machine";
import { useEffect, useState } from "react";

//get machine status string
const getMachineStatusString = (status: string) => {
  if (status === "1") return "验布中";
  if (status === "0") return "已停止";
  if (status === "2") return "已暂停";
  return "未知";
};

//get machine color
const getMachineStatusColor = (status: string) => {
  if (status === "1") return "bg-green-500";
  if (status === "0") return "bg-gray-500";
  if (status === "2") return "bg-yellow-500";
  return "bg-gray-500";
};

// Utility function to format ISO date string to Beijing time
const formatBeijingTime = (isoString: string) => {
  //if production, subtract 8 hours
  //if development, add 8 hours
  if (process.env.NODE_ENV === "production") {
    const date = new Date(new Date(isoString).getTime() - 8 * 60 * 60 * 1000);
    return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  } else {
    const date = new Date(new Date(isoString).getTime());
    return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  }
};

// Function to check if time is within 10 minutes
const isWithin10Minutes = (isoString: string) => {
  //if production, subtract 8 hours
  //if development, add 8 hours
  if (process.env.NODE_ENV === "production") {
    const date = new Date(new Date(isoString).getTime() - 8 * 60 * 60 * 1000);
    const now = new Date();
    const beijingDate = new Date(
      date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
    );
    const beijingNow = new Date(
      now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
    );

    const diffInMinutes = Math.abs(
      (beijingNow.getTime() - beijingDate.getTime()) / (1000 * 60)
    );
    return diffInMinutes <= 10;
  } else {
    const date = new Date(new Date(isoString).getTime());
    const now = new Date();
    const beijingDate = new Date(
      date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
    );
    const beijingNow = new Date(
      now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
    );
    const diffInMinutes = Math.abs(
      (beijingNow.getTime() - beijingDate.getTime()) / (1000 * 60)
    );
    return diffInMinutes <= 10;
  }
};

interface MachineCardProps {
  machine: Machine;
  activeTab: string;
  onTabChange: (machineId: number, tab: string) => void;
  onDelete: (name: string) => void;
  onViewDetails: (machine: Machine) => void;
  onViewTodayStats: (machine: Machine) => void;
  deletingName: string | null;
}

export function MachineCard({
  machine,
  activeTab,
  onTabChange,
  onDelete,
  onViewDetails,
  onViewTodayStats,
  deletingName,
}: MachineCardProps) {
  // State for client-side time calculations to prevent hydration mismatch
  const [isOnline, setIsOnline] = useState(false);
  const [formattedTime, setFormattedTime] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    // Only calculate time-dependent values on the client
    setIsOnline(isWithin10Minutes(machine.onlinetime));
    setFormattedTime(formatBeijingTime(machine.onlinetime));
  }, [machine.onlinetime]);

  // Show loading state during SSR and initial client render to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-gray-800/50 relative">
        <h2 className="text-lg font-semibold mb-3 text-white">
          {machine.name}
        </h2>
        
        {/* Delete button */}
        <button
          onClick={() => onDelete(machine.name)}
          disabled={deletingName === machine.name}
          className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400 disabled:opacity-50"
          title="Delete machine"
        >
          {deletingName === machine.name ? (
            <span className="animate-spin">⌛</span>
          ) : (
            "×"
          )}
        </button>

        {/* View Details button */}
        <button
          onClick={() => onViewDetails(machine)}
          className="absolute top-2 right-10 p-1 text-blue-400 hover:text-blue-300"
          title="View details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/*machine status / online time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${getMachineStatusColor(
                machine.status
              )}`}
            />
            <span className="text-sm text-gray-400">
              {getMachineStatusString(machine.status)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Loading...
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-3">
          <button
            onClick={() => onTabChange(machine.id, "basic")}
            className={`px-2 py-1 text-xs rounded ${
              activeTab === "basic"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => onTabChange(machine.id, "defects")}
            className={`px-2 py-1 text-xs rounded ${
              activeTab === "defects"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Defects
          </button>
          <button
            onClick={() => onTabChange(machine.id, "system")}
            className={`px-2 py-1 text-xs rounded ${
              activeTab === "system"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            System
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-2 text-sm">
          {activeTab === "basic" && (
            <>
              <p>
                <span className="font-medium text-gray-400">版本:</span>{" "}
                {machine.type}
              </p>
              <p>
                <span className="font-medium text-gray-400">位置:</span>{" "}
                {machine.location}
              </p>
              <p>
                <span className="font-medium text-gray-400">状态:</span>
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getMachineStatusColor(
                    machine.status
                  )}`}
                >
                  {getMachineStatusString(machine.status)}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-400">刷新时间:</span>{" "}
                Loading...
              </p>
            </>
          )}

          {activeTab === "defects" && (
            <div className="max-h-[200px] overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {machine.defectsettings}
              </pre>
            </div>
          )}

          {activeTab === "system" && (
            <div className="max-h-[200px] overflow-y-auto">
              <div>
                <span className="font-medium text-gray-400">
                  Global Variables:
                </span>
                <div className="ml-2 mt-1 max-h-[100px] overflow-y-auto bg-gray-800/30 rounded-lg p-1">
                  {(() => {
                    try {
                      const globalVars = JSON.parse(machine.globalvars);
                      return Object.entries(globalVars).map(
                        ([key, value]) => (
                          <p
                            key={key}
                            className="text-xs py-0.5 border-b border-gray-800/50 last:border-0"
                          >
                            <span className="text-gray-400">{key}:</span>{" "}
                            <span className="text-gray-300">
                              {String(value)}
                            </span>
                          </p>
                        )
                      );
                    } catch (error) {
                      return (
                        <p className="text-xs text-red-400">
                          Invalid JSON format:{" "}
                          {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="max-h-[200px] overflow-y-auto">
              <div className="text-xs">
                {(() => {
                  try {
                    const lines = machine.todaystat.split('\n').filter(line => line.trim());
                    return lines.map((line, index) => {
                      if (line.includes('：')) {
                        const [key, value] = line.split('：');
                        return (
                          <p key={index} className="py-0.5 border-b border-gray-800/50 last:border-0">
                            <span className="text-gray-400">{key?.trim()}:</span>{" "}
                            <span className="text-gray-300">{value?.trim()}</span>
                          </p>
                        );
                      }
                      return (
                        <p key={index} className="py-0.5 text-gray-300">
                          {line}
                        </p>
                      );
                    });
                  } catch {
                    return (
                      <p className="text-xs text-red-400">
                        Error parsing statistics
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-xl p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-800/50 relative ${
        isOnline ? "bg-green-900/50" : "bg-gray-900/50"
      }`}
    >
      <h2 
        className="text-lg font-semibold mb-3 text-white cursor-pointer hover:text-blue-400 transition-colors"
        onClick={() => onViewTodayStats(machine)}
        title="Click to view today's statistics"
      >
        {machine.name}
      </h2>

      {/* Delete button */}
      <button
        onClick={() => onDelete(machine.name)}
        disabled={deletingName === machine.name}
        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-400 disabled:opacity-50"
        title="Delete machine"
      >
        {deletingName === machine.name ? (
          <span className="animate-spin">⌛</span>
        ) : (
          "×"
        )}
      </button>

      {/* View Details button */}
      <button
        onClick={() => onViewDetails(machine)}
        className="absolute top-2 right-10 p-1 text-blue-400 hover:text-blue-300"
        title="View details"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/*machine status / online time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${getMachineStatusColor(
              machine.status
            )}`}
          />
          <span className="text-sm text-gray-400">
            {getMachineStatusString(machine.status)}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formattedTime}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-3">
        <button
          onClick={() => onTabChange(machine.id, "basic")}
          className={`px-2 py-1 text-xs rounded ${
            activeTab === "basic"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => onTabChange(machine.id, "defects")}
          className={`px-2 py-1 text-xs rounded ${
            activeTab === "defects"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Defects
        </button>
        <button
          onClick={() => onTabChange(machine.id, "system")}
          className={`px-2 py-1 text-xs rounded ${
            activeTab === "system"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          System
        </button>
        <button
          onClick={() => onTabChange(machine.id, "stats")}
          className={`px-2 py-1 text-xs rounded ${
            activeTab === "stats"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => onTabChange(machine.id, "stats")}
          className={`px-2 py-1 text-xs rounded ${
            activeTab === "stats"
              ? "bg-blue-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Stats
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-2 text-sm">
        {activeTab === "basic" && (
          <>
            <p>
              <span className="font-medium text-gray-400">版本:</span>{" "}
              {machine.type}
            </p>
            <p>
              <span className="font-medium text-gray-400">位置:</span>{" "}
              {machine.location}
            </p>
            <p>
              <span className="font-medium text-gray-400">状态:</span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getMachineStatusColor(
                  machine.status
                )}`}
              >
                {getMachineStatusString(machine.status)}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-400">刷新时间:</span>{" "}
              {formattedTime}
            </p>
          </>
        )}

        {activeTab === "defects" && (
          <div className="max-h-[200px] overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {machine.defectsettings}
            </pre>
          </div>
        )}

        {activeTab === "system" && (
          <div className="max-h-[200px] overflow-y-auto">
            <div>
              <span className="font-medium text-gray-400">
                Global Variables:
              </span>
              <div className="ml-2 mt-1 max-h-[100px] overflow-y-auto bg-gray-800/30 rounded-lg p-1">
                {(() => {
                  try {
                    const globalVars = JSON.parse(machine.globalvars);
                    return Object.entries(globalVars).map(
                      ([key, value]) => (
                        <p
                          key={key}
                          className="text-xs py-0.5 border-b border-gray-800/50 last:border-0"
                        >
                          <span className="text-gray-400">{key}:</span>{" "}
                          <span className="text-gray-300">
                            {String(value)}
                          </span>
                        </p>
                      )
                    );
                  } catch (error) {
                    return (
                      <p className="text-xs text-red-400">
                        Invalid JSON format:{" "}
                        {error instanceof Error
                          ? error.message
                          : "Unknown error"}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 