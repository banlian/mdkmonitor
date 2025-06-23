import { Machine } from "../types/machine";

interface TodayStatsModalProps {
  machine: Machine;
  onClose: () => void;
}

export const TodayStatsModal = ({ machine, onClose }: TodayStatsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {machine.name} - Today&apos;s Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-gray-400 mb-3 text-lg font-semibold">
              Today&apos;s Statistics
            </h3>
            <div className="max-h-[400px] overflow-y-auto">
              {machine.todaystat ? (
                <pre className="text-sm whitespace-pre-wrap text-gray-300">
                  {machine.todaystat}
                </pre>
              ) : (
                <p className="text-gray-500 italic">No statistics available for today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 