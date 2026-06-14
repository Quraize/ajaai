import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Document } from "@/types";
import DocumentEditor from "@/components/DocumentEditor";
import ShareDialog from "@/components/ShareDialog";
import { ArrowLeft, Share2, Trash2, Check, Loader2 } from "lucide-react";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [debouncedContent] = useDebounce(content, 1000);
  const [debouncedTitle] = useDebounce(title, 1000);
  const isInitialMount = useRef(true);
  const docRef = useRef(doc);
  docRef.current = doc;

  const fetchDoc = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/documents/${id}`);
      setDoc(res.data);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch {
      navigate("/documents");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const currentDoc = docRef.current;
    if (!id || !currentDoc) return;
    if (debouncedTitle === currentDoc.title && debouncedContent === currentDoc.content) return;

    const save = async () => {
      setSaving(true);
      setSaveStatus("Saving…");
      try {
        const res = await api.patch(`/documents/${id}`, { title: debouncedTitle, content: debouncedContent });
        setDoc(res.data);
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (err: any) {
        setSaveStatus(err.response?.data?.error || "Save failed");
      } finally {
        setSaving(false);
      }
    };

    save();
  }, [debouncedContent, debouncedTitle, id]);

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this document?")) return;
    await api.delete(`/documents/${id}`);
    navigate("/documents");
  };

  const isOwner = doc?.ownerId === user?.id;
  const canEdit = isOwner || doc?.role === "editor";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/documents")} className="rounded-md p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
            className="flex-1 bg-transparent text-lg font-semibold focus:outline-none disabled:opacity-60"
            placeholder="Document title"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {saving ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : saveStatus === "Saved" ? <Check className="h-3 w-3 inline mr-1" /> : null}
              {saveStatus}
            </span>
            {isOwner && (
              <button
                onClick={() => setShareOpen(true)}
                aria-label="Share document"
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                aria-label="Delete document"
                className="rounded-md border px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!canEdit && (
          <div className="mb-4 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
            You have viewer access. Editing is disabled.
          </div>
        )}
        <DocumentEditor content={content} editable={canEdit} onChange={setContent} />
      </main>

      <ShareDialog document={doc} open={shareOpen} onClose={() => setShareOpen(false)} onUpdate={fetchDoc} />
    </div>
  );
}
