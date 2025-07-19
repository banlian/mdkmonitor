"use client";

import { Machine } from "../types/machine";
import { useState } from "react";

interface StatsTableProps {
  machines: Machine[];
  columnOrder?: string[]; // Optional array of stat keys in desired order
}

type SortDirection = "asc" | "desc";

// Function to parse todaystat string and extract statistics
const parseTodayStats = (todaystat: string) => {
  const stats: { [key: string]: string } = {};

  try {
    if (todaystat == null || todaystat == undefined || todaystat == "") {
      return stats;
    }

    // Split by lines and process each line
    const lines = todaystat.split("\n").filter((line) => line.trim());

    lines.forEach((line) => {
      if (line.includes("：")) {
        const [key, value] = line.split("：");
        if (key && value) {
          stats[key.trim()] = value.trim();
        }
      }
    });
  } catch (error) {
    console.error("Error parsing todaystat:", error);
  }

  return stats;
};

// Function to check if a date string is today
const isToday = (dateString: string): boolean => {
  if (!dateString || dateString === "-") return false;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
};

const isDateString = (value: string): boolean => {
  // Check if it's a datetime string by regex 2025-07-19 10:00:00
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value.trim())) {
    return true;
  }
  // Also check for date-only format 2025-07-19
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return true;
  }
  return false;
};

// Function to get sortable value for a cell
const getSortableValue = (value: string): number => {
  if (value.startsWith("AI")) return NaN;
  // 统一全角百分号、去除所有空格
  const cleanValue = value.replace(/％/g, "%").replace(/\s+/g, "").trim();
  // 百分比提取
  if (cleanValue.includes("%")) {
    const match = cleanValue.match(/(-?\d+(?:\.\d+)?)%/);
    if (match) return parseFloat(match[1]);
    // fallback
    const num = parseFloat(cleanValue.replace("%", ""));
    return isNaN(num) ? NaN : num;
  }
  if (cleanValue === "" || cleanValue === "-") return NaN;
  const numStr = cleanValue.match(/(-?\d+(?:\.\d+)?)/);
  if (numStr) return parseFloat(numStr[1]);
  const num = parseFloat(cleanValue);
  if (!isNaN(num)) return num;
  return NaN;
};

export function StatsTable({ machines, columnOrder }: StatsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("Machine");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get all unique stat keys from all machines
  const allStatKeys = new Set<string>();

  machines.forEach((machine) => {
    try {
      const stats = parseTodayStats(machine.todaystat);
      Object.keys(stats).forEach((key) => allStatKeys.add(key));
    } catch (error) {
      console.error(`Error parsing stats for machine ${machine.name}:`, error);
    }
  });

  // Use custom column order if provided, otherwise use alphabetical order
  let statKeys: string[];

  //add default column order in Machine	- 准 确 率	- 更新时间	- 机器名称	- 检 出 率	- 检出疵点	- 检测单数	- 检测时长	- 检测长度	- 误判数量
  const defaultColumnOrder = [
    "- 机器名称",
    "- 检测时长",
    "- 检测单数",
    "- 检测长度",
    "- 更新时间",
    "- 检 出 率",
    "- 准 确 率",
    "- 检出疵点",
    "- 误判数量",
  ];

  columnOrder = defaultColumnOrder;

  if (columnOrder) {
    // Filter to only include keys that actually exist in the data
    const existingKeys = Array.from(allStatKeys);
    statKeys = columnOrder.filter((key) => existingKeys.includes(key));
    // Add any remaining keys that weren't in the custom order
    const remainingKeys = existingKeys
      .filter((key) => !columnOrder.includes(key))
      .sort();
    statKeys = [...statKeys, ...remainingKeys];
  } else {
    statKeys = Array.from(allStatKeys).sort();
  }

  // Sort machines based on current sort column and direction
  const sortedMachines = [...machines].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortColumn === "Machine") {
      aValue = a.name;
      bValue = b.name;
    } else {
      try {
        const aStats = parseTodayStats(a.todaystat);
        const bStats = parseTodayStats(b.todaystat);
        aValue = aStats[sortColumn] || "-";
        bValue = bStats[sortColumn] || "-";
      } catch {
        aValue = "-";
        bValue = "-";
      }
    }

    const aStr = aValue.toString();
    const bStr = bValue.toString();

    // Check for datetime values first
    const aIsDate = isDateString(aStr);
    const bIsDate = isDateString(bStr);

    if (aIsDate && bIsDate) {
      const aDate = new Date(aStr);
      const bDate = new Date(bStr);
      return sortDirection === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    } else if (aIsDate) {
      return -1; // a is date, b is not, a comes first
    } else if (bIsDate) {
      return 1; // b is date, a is not, b comes first
    }

    // Check for numeric values
    const aNum = getSortableValue(aStr);
    const bNum = getSortableValue(bStr);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    } else if (!isNaN(aNum)) {
      return -1; // a 有效，b 无效，a 靠前
    } else if (!isNaN(bNum)) {
      return 1; // b 有效，a 无效，b 靠前
    }

    // Both are non-numeric, non-date strings - compare as strings
    const comparison = aStr.localeCompare(bStr);
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return "↕️";
    }
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (machines.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No machines available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800/50">
        <thead>
          <tr className="border-b border-gray-800/50">
            <th
              className="px-4 py-3 text-left text-sm font-medium text-gray-400 bg-gray-800/30 cursor-pointer hover:bg-gray-700/30 transition-colors"
              onClick={() => handleSort("Machine")}
            >
              <div className="flex items-center gap-2">
                Machine {getSortIcon("Machine")}
              </div>
            </th>
            {statKeys.map((statKey) => (
              <th
                key={statKey}
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 bg-gray-800/30 min-w-[150px] cursor-pointer hover:bg-gray-700/30 transition-colors"
                onClick={() => handleSort(statKey)}
              >
                <div className="flex items-center gap-2">
                  {statKey} {getSortIcon(statKey)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedMachines.map((machine, index) => {
            // Check if update time is today
            const stats = parseTodayStats(machine.todaystat);
            const updateTime = stats["- 更新时间"] || "-";
            const isUpdateTimeToday = isToday(updateTime);

            return (
              <tr
                key={machine.id}
                className={`border-b border-gray-800/30 ${
                  isUpdateTimeToday
                    ? "bg-green-900/50 border-green-500/50"
                    : index % 2 === 0
                    ? "bg-gray-800/20"
                    : "bg-gray-800/10"
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-300 border-r border-gray-800/30">
                  {machine.name}
                </td>
                {statKeys.map((statKey) => {
                  try {
                    const stats = parseTodayStats(machine.todaystat);
                    const value = stats[statKey] || "-";
                    return (
                      <td
                        key={`${machine.id}-${statKey}`}
                        className="px-4 py-3 text-sm text-gray-300"
                      >
                        {value}
                      </td>
                    );
                  } catch {
                    return (
                      <td
                        key={`${machine.id}-${statKey}`}
                        className="px-4 py-3 text-sm text-red-400"
                      >
                        Error
                      </td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
