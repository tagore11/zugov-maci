import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Users2, X } from "lucide-react";
import * as communityApi from "@/src/services/communityApi";
import { useSiwe } from "@/src/hooks/useSiwe";
import { withAuthDetect } from "@/src/services/httpClient";

type OwnedCommunity = { id: string; name: string; logo: string };

function CreateUnionModal({
  isOpen,
  onClose,
  communities,
}: {
  isOpen: boolean;
  onClose: () => void;
  communities: OwnedCommunity[];
}) {
  const [foundingCommunityId, setFoundingCommunityId] = useState(communities[0]?.id ?? "");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useSiwe();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foundingCommunityId || !displayName.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await withAuthDetect(
        () =>
          communityApi.createUnion({
            displayName: displayName.trim(),
            description: description.trim() || undefined,
            foundingCommunityId,
          }),
        signOut,
      );
      setDisplayName("");
      setDescription("");
      onClose();
    } catch (err) {
      if (err instanceof communityApi.OwnershipError || err instanceof communityApi.AuthError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create union");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-foreground">Create Union</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-foreground hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Founding community <span className="text-red-400">*</span>
            </label>
            <select
              value={foundingCommunityId}
              onChange={(e) => setFoundingCommunityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[6px] bg-gray-800 border border-gray-600 text-foreground focus:outline-none focus:border-accent"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Union name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Pop-up City Alliance"
              className="w-full px-4 py-2.5 rounded-[6px] bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              maxLength={500}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full px-4 py-2.5 rounded-[6px] bg-gray-800 border border-gray-600 text-foreground placeholder-gray-500 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {error && (
            <div className="rounded-[6px] border border-red-900/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !foundingCommunityId || !displayName.trim()}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-[6px] bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Creating…" : "Create Union"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function UnionsPanel({ communities }: { communities: OwnedCommunity[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (communities.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users2 className="w-5 h-5 text-accent-hover" />
          <h2 className="text-xl font-semibold text-foreground">Unions</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/unions" className="text-sm font-medium text-gray-400 hover:text-foreground transition-colors">
            Browse all unions
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm font-medium text-accent-hover hover:text-accent transition-colors"
          >
            + Create union
          </button>
        </div>
      </div>

      <CreateUnionModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} communities={communities} />
    </div>
  );
}
