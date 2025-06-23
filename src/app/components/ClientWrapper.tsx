"use client";

import { useEffect, useState } from "react";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial client render, show a minimal loading state
  if (!isClient) {
    return (
      <div className="min-h-screen p-8 bg-black text-white">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Machine Monitor
        </h1>
        <div className="text-center text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 