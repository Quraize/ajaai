import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { X, Upload, FileUp } from "lucide-react";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportDialog({ open, onClose, onImported }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post("/documents/import", form, { headers: { "Content-Type": "multipart/form-data" } });
      onImported();
      onClose();
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Import document</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Supports <strong>.txt</strong>, <strong>.md</strong>, and <strong>.docx</strong> files up to 5 MB.
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.md,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
                setError("");
              }
            }}
          />
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Click or drag a file here</p>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span className="truncate flex-1">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-xs text-destructive hover:underline">
              Remove
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
