import { X } from "lucide-react";
import { CreateCommunityWizard } from "./CreateCommunityWizard";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCommunityModal({ isOpen, onClose }: CreateCommunityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-700 sticky top-0 bg-gray-900 rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white">Create Community</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <CreateCommunityWizard />
        </div>
      </div>
    </div>
  );
}
