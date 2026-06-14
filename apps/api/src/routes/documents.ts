import { Router, type Request, type Response } from "express";
import { z } from "zod";
import multer from "multer";
import mammoth from "mammoth";
import { prisma } from "../lib/db.js";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const defaultContent = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

function parseDocContent(content: unknown): string {
  if (typeof content === "string") {
    try {
      JSON.parse(content);
      return content;
    } catch {
      return JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] });
    }
  }
  if (typeof content === "object" && content !== null) {
    return JSON.stringify(content);
  }
  return defaultContent;
}

async function getAccessibleDocument(documentId: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  if (!doc) return null;
  const isOwner = doc.ownerId === userId;
  const share = doc.shares.find((s: { userId: string }) => s.userId === userId);
  if (!isOwner && !share) return null;
  return { doc, isOwner, share };
}

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const owned = await prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  const shared = await prisma.document.findMany({
    where: { shares: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  res.json({ owned, shared });
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const title = typeof req.body.title === "string" && req.body.title.trim() ? req.body.title.trim() : "Untitled document";
  const content = parseDocContent(req.body.content);
  const doc = await prisma.document.create({
    data: { title, content, ownerId: userId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  res.status(201).json(doc);
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const result = await getAccessibleDocument(req.params.id, req.user!.userId);
  if (!result) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json({ ...result.doc, role: result.isOwner ? "owner" : result.share?.role });
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.any().optional(),
});

router.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const result = await getAccessibleDocument(req.params.id, userId);
  if (!result) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const canEdit = result.isOwner || result.share?.role === "editor";
  if (!canEdit) {
    res.status(403).json({ error: "You do not have permission to edit this document" });
    return;
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const data: { title?: string; content?: string } = {};
  if (parsed.data.title) data.title = parsed.data.title;
  if (parsed.data.content !== undefined) data.content = parseDocContent(parsed.data.content);

  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data,
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  res.json(doc);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  if (doc.ownerId !== userId) {
    res.status(403).json({ error: "Only the owner can delete a document" });
    return;
  }
  await prisma.document.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const shareSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]).default("editor"),
});

router.post("/:id/share", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  if (doc.ownerId !== userId) {
    res.status(403).json({ error: "Only the owner can share a document" });
    return;
  }

  const parsed = shareSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const target = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (target.id === userId) {
    res.status(400).json({ error: "Cannot share with yourself" });
    return;
  }

  const share = await prisma.share.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: target.id } },
    create: { documentId: doc.id, userId: target.id, role: parsed.data.role },
    update: { role: parsed.data.role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  res.status(201).json(share);
});

router.post("/import", authMiddleware, upload.single("file"), async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const ext = file.originalname.split(".").pop()?.toLowerCase();
  let content = defaultContent;
  let title = file.originalname.replace(/\.(txt|md|docx)$/i, "") || "Imported document";

  try {
    if (ext === "txt" || ext === "md") {
      const text = file.buffer.toString("utf-8");
      const paragraphs = text.split(/\r?\n/).map((line) => ({
        type: "paragraph",
        content: line ? [{ type: "text", text: line }] : undefined,
      }));
      content = JSON.stringify({ type: "doc", content: paragraphs });
    } else if (ext === "docx") {
      const result = await mammoth.convertToHtml({ buffer: file.buffer });
      content = htmlToTiptapJson(result.value);
    } else {
      res.status(400).json({ error: "Unsupported file type. Use .txt, .md, or .docx" });
      return;
    }
  } catch (err) {
    res.status(422).json({ error: "Failed to parse file" });
    return;
  }

  const doc = await prisma.document.create({
    data: { title, content, ownerId: userId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      shares: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
  res.status(201).json(doc);
});

function htmlToTiptapJson(html: string): string {
  const paragraphs = html
    .split(/<\/p>/i)
    .map((block) => block.replace(/<p[^>]*>/i, "").trim())
    .filter(Boolean);

  const content: Array<{ type: string; content?: Array<{ type: string; text: string }> }> = paragraphs.map((p) => {
    const text = p.replace(/<[^>]+>/g, "").trim();
    return { type: "paragraph", content: text ? [{ type: "text", text }] : undefined };
  });

  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return JSON.stringify({ type: "doc", content });
}

export default router;
