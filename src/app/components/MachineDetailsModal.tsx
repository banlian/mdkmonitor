"use client";

import { Machine } from "../types/machine";
import { useEffect, useState } from "react";

interface MachineDetailsModalProps {
  machine: Machine;
  onClose: () => void;
}

// Utility function to format ISO date string to Beijing time
const formatBeijingTime = (isoString: string) => {
  const date = new Date(new Date(isoString).getTime());
  return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
};

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

export const MachineDetailsModal = ({ machine, onClose }: MachineDetailsModalProps) => {
  const [isClient, setIsClient] = useState(false);
  const [formattedOnlineTime, setFormattedOnlineTime] = useState("");
  const [formattedOfflineTime, setFormattedOfflineTime] = useState("");
  const [systemSettingsSearch, setSystemSettingsSearch] = useState("");

  useEffect(() => {
    setIsClient(true);
    setFormattedOnlineTime(formatBeijingTime(machine.onlinetime));
    setFormattedOfflineTime(formatBeijingTime(machine.offlinetime));
  }, [machine.onlinetime, machine.offlinetime]);

  // Parse system settings JSON
  const parseSystemSettings = () => {
    try {
      return JSON.parse(machine.systemsettings);
    } catch (error) {
      return null;
    }
  };

  const systemSettings = parseSystemSettings();
  const filteredSystemSettings = systemSettings 
    ? Object.entries(systemSettings).filter(([key]) => 
        key.toLowerCase().includes(systemSettingsSearch.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{machine.name} Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-gray-400 mb-2">Basic Information</h3>
            <div className="space-y-2">
              <p><span className="text-gray-400">Version:</span> {machine.type}</p>
              <p><span className="text-gray-400">Location:</span> {machine.location}</p>
              <p>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getMachineStatusColor(machine.status)}`}>
                  {getMachineStatusString(machine.status)}
                </span>
              </p>
              <p><span className="text-gray-400">Online Time:</span> {isClient ? formattedOnlineTime : "Loading..."}</p>
              <p><span className="text-gray-400">Offline Time:</span> {isClient ? formattedOfflineTime : "Loading..."}</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 mb-2">Defect Settings</h3>
            <div className="bg-gray-800/30 rounded-lg p-3 max-h-[200px] overflow-y-auto">
              {(() => {
                try {
                  const defectSettings = JSON.parse(machine.defectsettings);
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-2 text-gray-300">Code</th>
                            <th className="text-left py-2 px-2 text-gray-300">Defect Type</th>
                            <th className="text-left py-2 px-2 text-gray-300">Status</th>
                            <th className="text-left py-2 px-2 text-gray-300">Sensitivity</th>
                            <th className="text-left py-2 px-2 text-gray-300">Min Width</th>
                            <th className="text-left py-2 px-2 text-gray-300">Max Width</th>
                            <th className="text-left py-2 px-2 text-gray-300">Min Height</th>
                            <th className="text-left py-2 px-2 text-gray-300">Max Height</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(defectSettings).map(([code, values]) => {
                            const [defectType, status, sensitivity, minArea, maxArea, minLength, maxLength] = values as string[];
                            return (
                              <tr key={code} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                                <td className="py-1 px-2 text-gray-300 font-mono">{code}</td>
                                <td className="py-1 px-2 text-gray-300">{defectType}</td>
                                <td className="py-1 px-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${status === "1" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                    {status === "1" ? "Enabled" : "Disabled"}
                                  </span>
                                </td>
                                <td className="py-1 px-2 text-gray-300">{sensitivity}</td>
                                <td className="py-1 px-2 text-gray-300">{minArea}</td>
                                <td className="py-1 px-2 text-gray-300">{maxArea}</td>
                                <td className="py-1 px-2 text-gray-300">{minLength}</td>
                                <td className="py-1 px-2 text-gray-300">{maxLength}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                } catch (error) {
                  return (
                    <div>
                      <p className="text-xs text-red-400 mb-2">
                        Invalid JSON format: {error instanceof Error ? error.message : "Unknown error"}
                      </p>
                      <pre className="text-xs whitespace-pre-wrap">{machine.defectsettings}</pre>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 mb-2">Global Variables</h3>
            <div className="bg-gray-800/30 rounded-lg p-3 max-h-[200px] overflow-y-auto">
              {(() => {
                try {
                  const globalVars = JSON.parse(machine.globalvars);
                  return Object.entries(globalVars).map(([key, value]) => (
                    <p key={key} className="text-xs py-0.5 border-b border-gray-800/50 last:border-0">
                      <span className="text-gray-400">{key}:</span>{" "}
                      <span className="text-gray-300">{String(value)}</span>
                    </p>
                  ));
                } catch (error) {
                  return (
                    <p className="text-xs text-red-400">
                      Invalid JSON format: {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                  );
                }
              })()}
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 mb-2">System Settings</h3>
            <div className="bg-gray-800/30 rounded-lg p-3 max-h-[200px] overflow-y-auto">
              {systemSettings ? (
                <>
                  <input
                    type="text"
                    value={systemSettingsSearch}
                    onChange={(e) => setSystemSettingsSearch(e.target.value)}
                    placeholder="Search system settings..."
                    className="w-full bg-gray-700 text-gray-300 p-2 rounded-lg mb-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="text-xs text-gray-400 mb-2">
                    Showing {filteredSystemSettings.length} of {Object.keys(systemSettings).length} settings
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-2 text-gray-300 font-medium">Setting Key</th>
                        <th className="text-left py-2 px-2 text-gray-300 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSystemSettings.map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                          <td className="py-1.5 px-2 text-gray-300 font-mono text-xs">{key}</td>
                          <td className="py-1.5 px-2 text-gray-300 break-all">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredSystemSettings.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No settings found matching "{systemSettingsSearch}"
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-xs text-red-400 mb-2">
                    Invalid JSON format in system settings
                  </p>
                  <pre className="text-xs whitespace-pre-wrap text-gray-300">{machine.systemsettings}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 