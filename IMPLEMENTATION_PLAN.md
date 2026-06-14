# Ajaia Collaborative Document Editor — Implementation Plan

## 1. Goal & Scope
Build a lightweight, full-stack Google Docs-inspired collaborative document editor that demonstrates production judgment under a timebox. Focus on **depth in editing, persistence, sharing, and file import**, with clean deployment and automated tests. Intentionally deprioritize real-time co-editing (conflict resolution), enterprise RBAC, and native mobile apps.

## 2. Recommended Architecture

### 2.1 Tech Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 18 + TypeScript + Vite | Fast dev server, modern bundling, excellent TS support |
| Editor | TipTap (ProseMirror) | Industry-grade rich-text library; JSON/HTML/Markdown output; built-in extensions for bold, italic, underline, headings, lists; easy to extend |
| Styling | Tailwind CSS + shadcn/ui primitives | Rapid, consistent UI with accessible components |
| Backend | Node.js + Express + TypeScript | Requested stack; proven, easy to deploy |
| ORM | Prisma | Type-safe DB access, migrations, schema clarity |
| Database | SQLite | Single-file, zero-config, perfect for demo/review; easy local setup and Render deployment |
| Auth | JWT (stateless) + bcrypt + seeded users | Lightweight, no OAuth complexity, allows sharing demos immediately |
| File Upload | Multer + mammoth (docx) | Handles .txt, .md, .docx import into editor JSON |
| Realtime (stretch) | Socket.io | Optional cursor/online-presence indicators only after core is solid |
| Testing | Vitest (frontend + backend via happy-dom/msw for frontend, supertest for backend) | Single runner, fast, Jest-compatible |
| Deployment | Render (Web Service for backend + static site for frontend) OR Railway for full-stack | Free tier, no credit card friction for reviewers |

### 2.2 Repository Layout (monorepo-lite)
```
ajaia-docs/
├── apps/
│   ├── web/               # React + TipTap client
│   └── api/               # Express + Prisma server
├── packages/
│   └── shared/            # Shared TypeScript types (Document, User, Share)
├── IMPLEMENTATION_PLAN.md # This plan
├── README.md              # Local setup, run, deploy instructions
├── ARCHITECTURE.md        # Priorities & tradeoffs
├── AI_WORKFLOW.md         # AI usage disclosure
├── SUBMISSION.md          # Deliverable checklist
└── package.json           # Root scripts (pnpm workspaces)
```

## 3. Data Model (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hash
  documents Document[]
  shares    Share[]  // documents shared with this user
}

model Document {
  id        String   @id @default(uuid())
  title     String   @default("Untitled document")
  content   Json     // TipTap ProseMirror JSON
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  shares    Share[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Share {
  id         String   @id @default(uuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       String   @default("editor") // editor, viewer
  createdAt  DateTime @default(now())
  @@unique([documentId, userId])
}
```

## 4. API Design

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST   | /auth/register | Public | Create user (seeded accounts preferred) |
| POST   | /auth/login    | Public | Issue JWT |
| GET    | /auth/me       | Auth   | Current user |
| GET    | /documents     | Auth   | List owned + shared docs |
| POST   | /documents     | Auth   | Create doc |
| GET    | /documents/:id | Auth   | Get doc if owner/shared |
| PATCH  | /documents/:id | Auth   | Update title/content |
| DELETE | /documents/:id | Auth   | Delete doc (owner only) |
| POST   | /documents/:id/share | Auth | Share with user by email (owner only) |
| POST   | /documents/import | Auth | Upload .txt/.md/.docx → new doc |

### Validation
- Zod schemas for all request bodies.
- Document access middleware checks owner or share before every read/write.
- 401/403/404 with consistent error shape `{ error: string }`.

## 5. Frontend Structure

### Routes (React Router)
- `/login` — seeded user selector + email/password login
- `/documents` — dashboard listing owned + shared docs
- `/documents/:id` — editor page
- `*` — redirect to `/documents`

### Key Components
- `AuthProvider` — JWT in memory + localStorage refresh, Axios interceptor
- `DocumentEditor` — TipTap editor wrapper with toolbar (bold, italic, underline, H1/H2, bullet/ordered list, undo/redo)
- `DocumentList` — owned vs. shared sections
- `ShareDialog` — share by email, show current collaborators
- `ImportDialog` — drag/drop or click to upload .txt/.md/.docx
- `AutoSaveIndicator` — debounced save status

### Editor Features
- Toolbar + keyboard shortcuts (Ctrl/Cmd+B/I/U)
- Auto-save on content/title change (debounced 1s)
- JSON persistence (TipTap doc JSON)
- Export/download as .md (optional stretch)

## 6. File Upload Behavior
- Accept `.txt`, `.md`, `.docx` (max 5 MB).
- `.txt`/`.md` → plain text converted to TipTap paragraph nodes.
- `.docx` → use `mammoth` to extract HTML, then TipTap `generateJSON` from HTML.
- Create a new document owned by uploader.
- UI clearly states supported formats.

## 7. Sharing Model
- Owner can share by entering another user's email.
- Shared docs appear in recipient's dashboard under "Shared with me".
- Access middleware enforces owner/shared read; only owners and "editor" role can update.
- No public links; auth-required sharing only.

## 8. Authentication (Lightweight)
- Seed 3 demo users on first startup via Prisma seed script.
- Login returns JWT; frontend stores token and includes `Authorization: Bearer <token>`.
- Passwords hashed with bcrypt.
- No email verification or OAuth.

## 9. Testing Strategy
- **Backend**: 1+ integration test using `supertest` + in-memory SQLite:
  - Create document, save content, fetch, share, unauthorized access rejected.
- **Frontend**: 1+ component test using Vitest + React Testing Library:
  - Document list renders owned vs shared sections.
- Run via `pnpm test`.

## 10. Deployment Plan
1. Push to GitHub.
2. Deploy `apps/api` to Render Web Service (build: `pnpm install && pnpm db:deploy && pnpm build`, start: `pnpm start`).
3. Deploy `apps/web` to Render Static Site or Vercel (build: `pnpm build`, env `VITE_API_URL`).
4. Provide live URL + seeded credentials in README/SUBMISSION.md.

## 11. Implementation Steps (Execution Order)
1. Copy this plan into project root as `IMPLEMENTATION_PLAN.md`.
2. Bootstrap monorepo with pnpm workspaces, TypeScript, ESLint, Prettier.
3. Set up Prisma schema, migration, seed script.
4. Build Express API: auth, documents CRUD, share, import.
5. Add backend integration tests.
6. Build React client: routing, auth context, dashboard, editor.
7. Integrate TipTap toolbar and auto-save.
8. Add share dialog + import dialog.
9. Add frontend component tests.
10. Write README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION.
11. Deploy to Render and verify end-to-end.
12. Record 3–5 min Loom walkthrough.

## 12. Scope Cuts (Documented)
- Real-time collaborative editing with operational transforms.
- Granular RBAC beyond owner/editor/viewer.
- Comments, suggestions, version history.
- Export to PDF.
- Email notifications for shares.
These are listed in SUBMISSION.md as "What I'd build next with 2–4 more hours."

## 13. AI-Native Workflow Note (Draft)
- AI tools: Kimi Code CLI / Claude Code, ChatGPT/Gemini for research, Copilot for code completion.
- Speedups: scaffolding project structure, generating boilerplate routes, drafting tests, creating README copy, converting docx parsing logic.
- Rejected/changed: generic auth middleware suggestions, overly complex state-management proposals, premature real-time collaboration code.
- Verification: run typecheck/lint/tests, manual browser walkthrough, seeded-user sharing scenarios, Render deployment smoke test.
