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

export const MachineDetailsModal = ({
  machine,
  onClose,
}: MachineDetailsModalProps) => {
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
    } catch {
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
      <div className="bg-gray-900/95 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/95 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            {machine.name} Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-400 mb-2">Basic Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Version:</span> {machine.type}
                </p>
                <p>
                  <span className="text-gray-400">Location:</span>{" "}
                  {machine.location}
                </p>
                <p>
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getMachineStatusColor(
                      machine.status
                    )}`}
                  >
                    {getMachineStatusString(machine.status)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Online Time:</span>{" "}
                  {isClient ? formattedOnlineTime : "Loading..."}
                </p>
                <p>
                  <span className="text-gray-400">Offline Time:</span>{" "}
                  {isClient ? formattedOfflineTime : "Loading..."}
                </p>
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
                              <th className="text-left py-2 px-2 text-gray-300">
                                Code
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Defect Type
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Status
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Sensitivity
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Min Width
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Max Width
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Min Height
                              </th>
                              <th className="text-left py-2 px-2 text-gray-300">
                                Max Height
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(defectSettings).map(
                              ([code, values]) => {
                                const [
                                  defectType,
                                  status,
                                  sensitivity,
                                  minArea,
                                  maxArea,
                                  minLength,
                                  maxLength,
                                ] = values as string[];
                                return (
                                  <tr
                                    key={code}
                                    className="border-b border-gray-800/50 hover:bg-gray-800/20"
                                  >
                                    <td className="py-1 px-2 text-gray-300 font-mono">
                                      {code}
                                    </td>
                                    <td className="py-1 px-2 text-gray-300">
                                      {defectType}
                                    </td>
                                    <td className="py-1 px-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${
                                          status === "1"
                                            ? "bg-green-500/20 text-green-300"
                                            : "bg-red-500/20 text-red-300"
                                        }`}
                                      >
                                        {status === "1" ? "Enabled" : "Disabled"}
                                      </span>
                                    </td>
                                    <td className="py-1 px-2 text-gray-300">
                                      {sensitivity}
                                    </td>
                                    <td className="py-1 px-2 text-gray-300">
                                      {minArea}
                                    </td>
                                    <td className="py-1 px-2 text-gray-300">
                                      {maxArea}
                                    </td>
                                    <td className="py-1 px-2 text-gray-300">
                                      {minLength}
                                    </td>
                                    <td className="py-1 px-2 text-gray-300">
                                      {maxLength}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  } catch (error) {
                    return (
                      <div>
                        <p className="text-xs text-red-400 mb-2">
                          Invalid JSON format:{" "}
                          {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                        </p>
                        <pre className="text-xs whitespace-pre-wrap">
                          {machine.defectsettings}
                        </pre>
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
                      <p
                        key={key}
                        className="text-xs py-0.5 border-b border-gray-800/50 last:border-0"
                      >
                        <span className="text-gray-400">{key}:</span>{" "}
                        <span className="text-gray-300">{String(value)}</span>
                      </p>
                    ));
                  } catch (error) {
                    return (
                      <p className="text-xs text-red-400">
                        Invalid JSON format:{" "}
                        {error instanceof Error ? error.message : "Unknown error"}
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
                      Showing {filteredSystemSettings.length} of{" "}
                      {Object.keys(systemSettings).length} settings
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-2 text-gray-300 font-medium">
                            Setting Key
                          </th>
                          <th className="text-left py-2 px-2 text-gray-300 font-medium">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSystemSettings.map(([key, value]) => (
                          <tr
                            key={key}
                            className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                          >
                            <td className="py-1.5 px-2 text-gray-300 font-mono text-xs">
                              {key}
                            </td>
                            <td className="py-1.5 px-2 text-gray-300 break-all">
                              {String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredSystemSettings.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No settings found matching &quot;{systemSettingsSearch}
                        &quot;
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-xs text-red-400 mb-2">
                      Invalid JSON format in system settings
                    </p>
                    <pre className="text-xs whitespace-pre-wrap text-gray-300">
                      {machine.systemsettings}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-gray-400 mb-2">CPU List Graph</h3>
              <div className="bg-gray-800/30 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                {(() => {
                  try {
                    const cpuList = JSON.parse(machine.cpulist);
                    if (!Array.isArray(cpuList) || cpuList.length === 0) {
                      return (
                        <div className="text-center text-gray-500 py-4">
                          No CPU data available
                        </div>
                      );
                    }

                    // Process CPU data
                    const cpuData = cpuList
                      .map((item) => ({
                        ...item,
                        timestamp: new Date(item.ts).getTime(),
                      }))
                      .sort((a, b) => a.timestamp - b.timestamp);

                    // Get time range
                    const allTimestamps = cpuData.map((item) => item.timestamp);
                    const minTime = Math.min(...allTimestamps);
                    const maxTime = Math.max(...allTimestamps);
                    const timeRange = maxTime - minTime;

                    return (
                      <div className="space-y-4">
                        <div className="text-xs text-gray-400">
                          Showing {cpuList.length} CPU data points
                        </div>

                        {/* CPU State XY Plot */}
                        <div className="relative h-32 bg-gray-700 rounded overflow-hidden border border-gray-600">
                          {/* Y-axis labels */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 px-1">
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                          </div>

                          {/* X-axis labels */}
                          <div className="absolute bottom-0 left-0 right-0 h-6 flex justify-between text-xs text-gray-400 px-1">
                            <span>
                              {
                                formatBeijingTime(
                                  new Date(minTime).toISOString()
                                ).split(" ")[1]
                              }
                            </span>
                            <span>
                              {
                                formatBeijingTime(
                                  new Date(
                                    minTime + timeRange * 0.5
                                  ).toISOString()
                                ).split(" ")[1]
                              }
                            </span>
                            <span>
                              {
                                formatBeijingTime(
                                  new Date(maxTime).toISOString()
                                ).split(" ")[1]
                              }
                            </span>
                          </div>

                          {/* Grid lines */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Horizontal grid lines */}
                            {[0, 25, 50, 75, 100].map((percent) => (
                              <div
                                key={percent}
                                className="absolute w-full border-t border-gray-600/30"
                                style={{ top: `${100 - percent}%` }}
                              />
                            ))}
                            {/* Vertical grid lines */}
                            {[0, 25, 50, 75, 100].map((percent) => (
                              <div
                                key={percent}
                                className="absolute h-full border-l border-gray-600/30"
                                style={{ left: `${percent}%` }}
                              />
                            ))}
                          </div>

                          {/* CPU State Line Chart */}
                          <svg
                            className="absolute inset-0 w-full h-full"
                            style={{ paddingLeft: "20px", paddingBottom: "24px" }}
                          >
                            {cpuData.map((item, index) => {
                              if (index === 0) return null; // Skip first point for line drawing

                              const prevItem = cpuData[index - 1];
                              const x1 =
                                ((prevItem.timestamp - minTime) / timeRange) *
                                  80 +
                                10; // 80% width + 10% padding
                              const y1 = prevItem.cpu;
                              const x2 =
                                ((item.timestamp - minTime) / timeRange) * 80 +
                                10;
                              const y2 = item.cpu;

                              const stateColor =
                                item.state === 0
                                  ? "#6b7280"
                                  : item.state === 1
                                  ? "#10b981"
                                  : item.state === 2
                                  ? "#f59e0b"
                                  : "#ef4444";

                              return (
                                <g key={index}>
                                  <line
                                    x1={`${x1}%`}
                                    y1={`${y1}%`}
                                    x2={`${x2}%`}
                                    y2={`${y2}%`}
                                    stroke={stateColor}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                  <circle
                                    cx={`${x2}%`}
                                    cy={`${y2}%`}
                                    r="3"
                                    fill={stateColor}
                                    className="hover:r-4 transition-all duration-200"
                                  />
                                </g>
                              );
                            })}

                            {/* First point */}
                            {cpuData.length > 0 &&
                              (() => {
                                const firstItem = cpuData[0];
                                const x =
                                  ((firstItem.timestamp - minTime) / timeRange) *
                                    80 +
                                  10;
                                const y = 100 - (firstItem.state / 3) * 100;
                                const stateColor =
                                  firstItem.state === 0
                                    ? "#6b7280"
                                    : firstItem.state === 1
                                    ? "#10b981"
                                    : firstItem.state === 2
                                    ? "#f59e0b"
                                    : "#ef4444";

                                return (
                                  <circle
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="3"
                                    fill={stateColor}
                                    className="hover:r-4 transition-all duration-200"
                                  />
                                );
                              })()}
                          </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-500 rounded"></div>
                            <span className="text-gray-400">空闲 (0)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-gray-400">运行中 (1)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span className="text-gray-400">暂停 (2)</span>
                          </div>
                        </div>

                        {/* Time Range Info */}
                        <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                          Time range:{" "}
                          {formatBeijingTime(new Date(minTime).toISOString())} to{" "}
                          {formatBeijingTime(new Date(maxTime).toISOString())}
                        </div>
                      </div>
                    );
                  } catch (error) {
                    return (
                      <div>
                        <p className="text-xs text-red-400 mb-2">
                          Invalid CPU data format:{" "}
                          {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                        </p>
                        <pre className="text-xs whitespace-pre-wrap text-gray-300">
                          {machine.cpulist}
                        </pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            <div>
              <h3 className="text-gray-400 mb-2">Memory List Graph</h3>
              <div className="bg-gray-800/30 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                {(() => {
                  try {
                    const memList = JSON.parse(machine.memlist);
                    if (!Array.isArray(memList) || memList.length === 0) {
                      return (
                        <div className="text-center text-gray-500 py-4">
                          No memory data available
                        </div>
                      );
                    }

                    // Process memory data
                    const memData = memList
                      .map((item) => ({
                        ...item,
                        timestamp: new Date(item.ts).getTime(),
                      }))
                      .sort((a, b) => a.timestamp - b.timestamp);

                    // Get time range
                    const allTimestamps = memData.map((item) => item.timestamp);
                    const minTime = Math.min(...allTimestamps);
                    const maxTime = Math.max(...allTimestamps);
                    const timeRange = maxTime - minTime;

                    // Get memory range for Y-axis scaling
                    const memValues = memData.map((item) => item.mem);
                    const maxMem = Math.max(...memValues);
                    const minMem = Math.min(...memValues);
                    const memRange = maxMem - minMem;

                    return (
                      <div className="space-y-4">
                        <div className="text-xs text-gray-400">
                          Showing {memData.length} memory data points
                        </div>

                        {/* Memory Usage XY Plot */}
                        <div className="relative h-32 bg-gray-700 rounded overflow-hidden border border-gray-600">
                          {/* Y-axis labels */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 px-1">
                            <span>{maxMem}%</span>
                            <span>{Math.round(maxMem * 0.75)}%</span>
                            <span>{Math.round(maxMem * 0.5)}%</span>
                            <span>{Math.round(maxMem * 0.25)}%</span>
                            <span>{minMem}%</span>
                          </div>

                          {/* X-axis labels */}
                          <div className="absolute bottom-0 left-0 right-0 h-6 flex justify-between text-xs text-gray-400 px-1">
                            <span>
                              {
                                formatBeijingTime(
                                  new Date(minTime).toISOString()
                                ).split(" ")[1]
                              }
                            </span>
                            <span>
                              {
                                formatBeijingTime(
                                  new Date(
                                    minTime + timeRange * 0.5
                                  ).toISOString()
                                ).split(" ")[1]
                              }
                            </span>
                            <span>
                              {
                                formatBeijingTime(
                                  new Date(maxTime).toISOString()
                                ).split(" ")[1]
                              }
                            </span>
                          </div>

                          {/* Grid lines */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Horizontal grid lines */}
                            {[0, 25, 50, 75, 100].map((percent) => (
                              <div
                                key={percent}
                                className="absolute w-full border-t border-gray-600/30"
                                style={{ top: `${100 - percent}%` }}
                              />
                            ))}
                            {/* Vertical grid lines */}
                            {[0, 25, 50, 75, 100].map((percent) => (
                              <div
                                key={percent}
                                className="absolute h-full border-l border-gray-600/30"
                                style={{ left: `${percent}%` }}
                              />
                            ))}
                          </div>

                          {/* Memory Usage Line Chart */}
                          <svg
                            className="absolute inset-0 w-full h-full"
                            style={{ paddingLeft: "20px", paddingBottom: "24px" }}
                          >
                            {memData.map((item, index) => {
                              if (index === 0) return null; // Skip first point for line drawing

                              const prevItem = memData[index - 1];
                              const x1 =
                                ((prevItem.timestamp - minTime) / timeRange) *
                                  80 +
                                10; // 80% width + 10% padding
                              const y1 =
                                100 - ((prevItem.mem - minMem) / memRange) * 100; // Normalize memory to 0-100%
                              const x2 =
                                ((item.timestamp - minTime) / timeRange) * 80 +
                                10;
                              const y2 =
                                100 - ((item.mem - minMem) / memRange) * 100;

                              const stateColor =
                                item.state === 0
                                  ? "#6b7280"
                                  : item.state === 1
                                  ? "#10b981"
                                  : item.state === 2
                                  ? "#f59e0b"
                                  : "#ef4444";

                              return (
                                <g key={index}>
                                  <line
                                    x1={`${x1}%`}
                                    y1={`${y1}%`}
                                    x2={`${x2}%`}
                                    y2={`${y2}%`}
                                    stroke={stateColor}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                  <circle
                                    cx={`${x2}%`}
                                    cy={`${y2}%`}
                                    r="3"
                                    fill={stateColor}
                                    className="hover:r-4 transition-all duration-200"
                                  />
                                </g>
                              );
                            })}

                            {/* First point */}
                            {memData.length > 0 &&
                              (() => {
                                const firstItem = memData[0];
                                const x =
                                  ((firstItem.timestamp - minTime) / timeRange) *
                                    80 +
                                  10;
                                const y =
                                  100 -
                                  ((firstItem.mem - minMem) / memRange) * 100;
                                const stateColor =
                                  firstItem.state === 0
                                    ? "#6b7280"
                                    : firstItem.state === 1
                                    ? "#10b981"
                                    : firstItem.state === 2
                                    ? "#f59e0b"
                                    : "#ef4444";

                                return (
                                  <circle
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="3"
                                    fill={stateColor}
                                    className="hover:r-4 transition-all duration-200"
                                  />
                                );
                              })()}
                          </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-500 rounded"></div>
                            <span className="text-gray-400">空闲 (0)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-gray-400">运行中 (1)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span className="text-gray-400">暂停 (2)</span>
                          </div>
                        </div>

                        {/* Memory Range Info */}
                        <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                          Memory range: {minMem}% to {maxMem}% | Time range:{" "}
                          {formatBeijingTime(new Date(minTime).toISOString())} to{" "}
                          {formatBeijingTime(new Date(maxTime).toISOString())}
                        </div>
                      </div>
                    );
                  } catch (error) {
                    return (
                      <div>
                        <p className="text-xs text-red-400 mb-2">
                          Invalid memory data format:{" "}
                          {error instanceof Error
                            ? error.message
                            : "Unknown error"}
                        </p>
                        <pre className="text-xs whitespace-pre-wrap text-gray-300">
                          {machine.memlist}
                        </pre>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
