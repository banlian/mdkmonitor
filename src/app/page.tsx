'use client';

import { useEffect, useState } from 'react';

interface Machine {
  id: number;
  name: string;
  type: string;
  location: string;
  status: string;
  onlinetime: Date;
  offlinetime: Date;
  globalvars: string;
  defectsettings: string;
  systemsettings: string;
}

export default function Home() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/machines');
        if (!response.ok) {
          throw new Error('Failed to fetch machines');
        }
        const data = await response.json();
        setMachines(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

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
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Machine Monitor</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-800/50"
          >
            <h2 className="text-xl font-semibold mb-4 text-white">{machine.name}</h2>
            <div className="space-y-3 text-gray-300">
              <p><span className="font-medium text-gray-400">Type:</span> {machine.type}</p>
              <p><span className="font-medium text-gray-400">Location:</span> {machine.location}</p>
              <p><span className="font-medium text-gray-400">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                  machine.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {machine.status}
                </span>
              </p>
              <p><span className="font-medium text-gray-400">Last Online:</span> {new Date(machine.onlinetime).toLocaleString()}</p>
              <p><span className="font-medium text-gray-400">Last Offline:</span> {new Date(machine.offlinetime).toLocaleString()}</p>
              <div>
                <span className="font-medium text-gray-400">Global Variables:</span>
                <div className="ml-4 mt-1 max-h-[200px] overflow-y-auto bg-gray-800/30 rounded-lg p-2">
                  {(() => {
                    try {
                      const globalVars = JSON.parse(machine.globalvars);
                      return Object.entries(globalVars).map(([key, value]) => (
                        <p key={key} className="text-sm py-1 border-b border-gray-800/50 last:border-0">
                          <span className="text-gray-400">{key}:</span> <span className="text-gray-300">{String(value)}</span>
                        </p>
                      ));
                    } catch (error) {
                      return <p className="text-sm text-red-400">Invalid JSON format: {error instanceof Error ? error.message : 'Unknown error'}</p>;
                    }
                  })()}
                </div>
              </div>
              <p><span className="font-medium text-gray-400">Defects Settings:</span> {machine.defectsettings}</p>
              <p><span className="font-medium text-gray-400">System Settings:</span> {machine.systemsettings}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
