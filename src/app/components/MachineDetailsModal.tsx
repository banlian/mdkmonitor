import { Machine } from "../types/machine";

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
          <div className="grid grid-cols-2 gap-4">
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
                <p><span className="text-gray-400">Online Time:</span> {formatBeijingTime(machine.onlinetime)}</p>
                <p><span className="text-gray-400">Offline Time:</span> {formatBeijingTime(machine.offlinetime)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-400 mb-2">System Settings</h3>
              <div className="bg-gray-800/30 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">{machine.systemsettings}</pre>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 mb-2">Defect Settings</h3>
            <div className="bg-gray-800/30 rounded-lg p-3 max-h-[200px] overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">{machine.defectsettings}</pre>
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
        </div>
      </div>
    </div>
  );
}; 