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
  globalvar: string;
  defectssettings: string;
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
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Machine Monitor</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{machine.name}</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Type:</span> {machine.type}</p>
              <p><span className="font-medium">Location:</span> {machine.location}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  machine.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {machine.status}
                </span>
              </p>
              <p><span className="font-medium">Last Online:</span> {new Date(machine.onlinetime).toLocaleString()}</p>
              <p><span className="font-medium">Last Offline:</span> {new Date(machine.offlinetime).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
