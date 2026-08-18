import { useEffect } from "react";
import { X } from "lucide-react";
import { useAccount } from "wagmi";
import { useCredentialScan } from "@/src/hooks/useCredentialScan";
import type { Protocol } from "@/src/services/credentialApi";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROTOCOL_LABELS: Record<Protocol, { name: string; icon: string }> = {
  zupass: { name: "Zupass", icon: "🎫" },
  zkid: { name: "zkID", icon: "🪪" },
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { address } = useAccount();
  const { credentials, checkErrors, isScanning, scan } = useCredentialScan(address);

  useEffect(() => {
    if (isOpen && address) {
      void scan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, address]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Connect to ZuGov</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {(Object.keys(PROTOCOL_LABELS) as Protocol[]).map((protocol) => {
            const label = PROTOCOL_LABELS[protocol];
            const checkFailed = Boolean(checkErrors[protocol]);
            const status = checkFailed
              ? "unavailable"
              : (credentials[protocol]?.status ?? (isScanning ? "checking" : "unverified"));
            return (
              <div key={protocol} className="w-full flex items-center gap-4 p-4 border border-gray-700 rounded-lg">
                <span className="text-2xl">{label.icon}</span>
                <span className="font-medium text-foreground flex-1">{label.name}</span>
                <span className={`text-xs font-medium ${checkFailed ? "text-amber-400" : "text-gray-500"}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
