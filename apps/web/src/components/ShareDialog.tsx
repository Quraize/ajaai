import { useState } from "react";
import { api } from "@/lib/api";
import type { Document, Share } from "@/types";
import { X, UserPlus } from "lucide-react";

interface ShareDialogProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShareDialog({ document, open, onClose, onUpdate }: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !document) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(`/documents/${document.id}/share`, { email, role });
      setEmail("");
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Share document</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
              className="rounded-md border px-3 py-2 text-sm bg-background"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Sharing…" : "Share"}
          </button>
        </form>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">People with access</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
              <span>{document.owner.name} ({document.owner.email})</span>
              <span className="text-xs text-muted-foreground">Owner</span>
            </div>
            {document.shares.map((share: Share) => (
              <div key={share.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
                <span>{share.user.name} ({share.user.email})</span>
                <span className="text-xs text-muted-foreground capitalize">{share.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
