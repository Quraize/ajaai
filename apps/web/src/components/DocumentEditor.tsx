import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentEditorProps {
  content: string;
  editable?: boolean;
  onChange?: (content: string) => void;
}

export default function DocumentEditor({ content, editable = true, onChange }: DocumentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start typing…" }),
      UnderlineExtension,
    ],
    content: parseContent(content),
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(JSON.stringify(editor.getJSON()));
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({
    active,
    onClick,
    icon: Icon,
    title,
  }: {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={!editable}
      className={cn(
        "p-2 rounded-md transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50",
        !editable && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="border rounded-xl bg-card">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30 rounded-t-xl">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={Italic}
          title="Italic"
        />
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={Underline}
          title="Underline"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading2}
          title="Heading 2"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={List}
          title="Bullet list"
        />
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={ListOrdered}
          title="Numbered list"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Undo"
        />
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Redo"
        />
      </div>
      <EditorContent editor={editor} className="p-6 min-h-[60vh]" />
    </div>
  );
}

function parseContent(content: string) {
  if (!content) return { type: "doc", content: [{ type: "paragraph" }] };
  try {
    return JSON.parse(content);
  } catch {
    return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] };
  }
}
