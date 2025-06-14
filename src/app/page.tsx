"use client";

import { useEffect, useState } from "react";

interface Machine {
  id: number;
  name: string;
  type: string;
  location: string;
  status: string;
  onlinetime: string;
  offlinetime: string;
  globalvars: string;
  defectsettings: string;
  systemsettings: string;
}

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
  const date = new Date(isoString);
  return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
};

// Function to check if time is within 10 minutes
const isWithin10Minutes = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  
  // Convert both times to Beijing time for comparison
  const beijingDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const beijingNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));

  const diffInMinutes = Math.abs(
    (beijingNow.getTime() - beijingDate.getTime()) / (1000 * 60)
  );
  return diffInMinutes <= 10;
};

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: string }>({});
  const [deletingName, setDeletingName] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch("/api/machines");
        if (!response.ok) {
          throw new Error("Failed to fetch machines");
        }
        const data = await response.json();
        setMachines(data);
        // Initialize all machines to show basic info tab
        const initialTabs = data.reduce(
          (acc: { [key: number]: string }, machine: Machine) => {
            acc[machine.id] = "basic";
            return acc;
          },
          {}
        );
        setActiveTabs(initialTabs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const handleTabChange = (machineId: number, tab: string) => {
    setActiveTabs((prev) => ({
      ...prev,
      [machineId]: tab,
    }));
  };

  const handleDelete = async (name: string) => {
    const password = prompt("Please enter admin password to delete:");
    if (!password) {
      return;
    }

    if (password !== "520980") {
      // You should use a more secure password in production
      alert("Incorrect password");
      return;
    }

    if (!confirm("Are you sure you want to delete this machine?")) {
      return;
    }

    setDeletingName(name);
    try {
      const response = await fetch(`/api/machines?name=${name}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete machine");
      }

      setMachines((prevMachines) =>
        prevMachines.filter((machine) => machine.name !== name)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete machine");
    } finally {
      setDeletingName(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        Machine Monitor
      </h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={`bg-gray-900/50 backdrop-blur-xl p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-800/50 ${
              isWithin10Minutes(machine.onlinetime)
                ? "bg-green-900/50"
                : "bg-gray-900/50"
            }`}
          >
            <h2 className="text-lg font-semibold mb-3 text-white">
              {machine.name}
            </h2>

            {/* Delete button */}
            <button
              onClick={() => handleDelete(machine.name)}
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

            {/*machine status / online time */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    getMachineStatusColor(machine.status)
                  }`}
                />
                <span className="text-sm text-gray-400">
                  {getMachineStatusString(machine.status)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatBeijingTime(machine.onlinetime)}
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-3">
              <button
                onClick={() => handleTabChange(machine.id, "basic")}
                className={`px-2 py-1 text-xs rounded ${
                  activeTabs[machine.id] === "basic"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Basic
              </button>
              <button
                onClick={() => handleTabChange(machine.id, "defects")}
                className={`px-2 py-1 text-xs rounded ${
                  activeTabs[machine.id] === "defects"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Defects
              </button>
              <button
                onClick={() => handleTabChange(machine.id, "system")}
                className={`px-2 py-1 text-xs rounded ${
                  activeTabs[machine.id] === "system"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                System
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-2 text-sm">
              {activeTabs[machine.id] === "basic" && (
                <>
                  <p>
                    <span className="font-medium text-gray-400">Type:</span>{" "}
                    {machine.type}
                  </p>
                  <p>
                    <span className="font-medium text-gray-400">Location:</span>{" "}
                    {machine.location}
                  </p>
                  <p>
                    <span className="font-medium text-gray-400">Status:</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        getMachineStatusColor(machine.status)
                      }`}
                    >
                      {getMachineStatusString(machine.status)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-400">
                      Last Online:
                    </span>{" "}
                    {formatBeijingTime(machine.onlinetime)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-400">
                      Last Offline:
                    </span>{" "}
                    {formatBeijingTime(machine.offlinetime)}
                  </p>
                </>
              )}

              {activeTabs[machine.id] === "defects" && (
                <div className="max-h-[200px] overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {machine.defectsettings}
                  </pre>
                </div>
              )}

              {activeTabs[machine.id] === "system" && (
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
        ))}
      </div>
    </main>
  );
}
