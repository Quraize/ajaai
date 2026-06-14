import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Document } from "@/types";
import { FileText, Plus, LogOut, Upload } from "lucide-react";
import ImportDialog from "@/components/ImportDialog";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [owned, setOwned] = useState<Document[]>([]);
  const [shared, setShared] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    const res = await api.get("/documents");
    setOwned(res.data.owned);
    setShared(res.data.shared);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const createDoc = async () => {
    const res = await api.post("/documents", { title: "Untitled document" });
    navigate(`/documents/${res.data.id}`);
  };

  const DocCard = ({ doc, badge }: { doc: Document; badge?: string }) => (
    <button
      onClick={() => navigate(`/documents/${doc.id}`)}
      className="flex items-start gap-3 w-full text-left bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{doc.title}</h3>
          {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{badge}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {badge === "Shared" ? `Owner: ${doc.owner.name}` : "Owned by you"} · {new Date(doc.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="font-semibold">Ajaia Docs</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <button
              onClick={() => setImportOpen(true)}
              aria-label="Import document"
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={logout}
              aria-label="Log out"
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Documents</h2>
          <button
            onClick={createDoc}
            className="flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New document
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading documents…</div>
        ) : (
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Owned by you</h3>
              {owned.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents yet. Create one to get started.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {owned.map((doc) => (
                    <DocCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Shared with you</h3>
              {shared.length === 0 ? (
                <p className="text-sm text-muted-foreground">No shared documents yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {shared.map((doc) => (
                    <DocCard key={doc.id} doc={doc} badge="Shared" />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImported={fetchDocs} />
    </div>
  );
}
