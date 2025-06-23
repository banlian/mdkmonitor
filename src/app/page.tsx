"use client";

import { useEffect, useState } from "react";
import { Machine } from "./types/machine";
import { MachineDetailsModal } from "./components/MachineDetailsModal";
import { TodayStatsModal } from "./components/TodayStatsModal";
import { MachineCard } from "./components/MachineCard";
import { ClientWrapper } from "./components/ClientWrapper";
import { getBuildDate } from "../lib/build-info";

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: string }>({});
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [todayStatsMachine, setTodayStatsMachine] = useState<Machine | null>(null);

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

    // Initial fetch
    fetchMachines();

    // Set up polling every 3 minutes (180000 milliseconds)
    const intervalId = setInterval(fetchMachines, 180000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
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

  const handleViewDetails = (machine: Machine) => {
    setSelectedMachine(machine);
  };

  const handleViewTodayStats = (machine: Machine) => {
    setTodayStatsMachine(machine);
  };

  if (loading) {
    return (
      <ClientWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </ClientWrapper>
    );
  }

  if (error) {
    return (
      <ClientWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </ClientWrapper>
    );
  }

  return (
    <ClientWrapper>
      <main className="min-h-screen p-8 bg-black text-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Machine Monitor
          </h1>
          <div className="text-sm text-gray-400">
            Build: {getBuildDate()}
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {machines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              activeTab={activeTabs[machine.id]}
              onTabChange={handleTabChange}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              onViewTodayStats={handleViewTodayStats}
              deletingName={deletingName}
            />
          ))}
        </div>
        {selectedMachine && (
          <MachineDetailsModal
            machine={selectedMachine}
            onClose={() => setSelectedMachine(null)}
          />
        )}
        {todayStatsMachine && (
          <TodayStatsModal
            machine={todayStatsMachine}
            onClose={() => setTodayStatsMachine(null)}
          />
        )}
      </main>
    </ClientWrapper>
  );
}
