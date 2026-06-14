# Architecture Note — Ajaia Docs

## What I Prioritized

1. **End-to-end editing flow first**
   - Chose TipTap/ProseMirror because it provides a production-grade rich-text surface with the exact formatting required (bold, italic, underline, headings, lists) and serializes cleanly to JSON for persistence.
   - Built auto-save around debounced content/title changes so the UX feels responsive and safe.

2. **Persistence that preserves structure**
   - Stored documents as TipTap JSON strings in SQLite via Prisma. JSON keeps formatting, nesting, and marks intact without needing a document-store database.
   - SQLite keeps local setup and deployment trivial while still demonstrating relational modeling (users, documents, shares).

3. **Clear sharing semantics**
   - Owner/editor/viewer roles with middleware that rejects unauthorized reads and edits.
   - Dashboard separates owned and shared documents so the distinction is obvious.

4. **Production-ready deployment path**
   - Stateless Express API with SQLite file on disk, suitable for a single Render Web Service instance.
   - Static React build served separately, communicating via environment-configured API URL.

5. **Validation and tests**
   - Zod request validation, consistent error responses, and integration tests covering CRUD, sharing, and access control.
   - Frontend component tests for the login flow.

## Key Trade-offs

| Decision | Why |
|----------|-----|
| SQLite instead of Postgres | Zero-config for reviewers; single-file backup; sufficient for this scope. |
| JWT + seeded users instead of OAuth | Removes external service dependencies and lets reviewers test sharing immediately. |
| File import converts `.docx` to plain paragraphs | Mammoth HTML → TipTap JSON is robust enough for the exercise; complex styles are intentionally flattened. |
| No real-time collaboration | Operational transforms/WebSockets would dominate the timebox; auto-save + share provides a coherent slice. |
| Monorepo-lite with pnpm workspaces | Keeps frontend, backend, and shared tooling in one repo without heavy Nx/Turborepo config. |

## Data Model

- `User`: identity and authentication.
- `Document`: title + TipTap JSON content + owner relation.
- `Share`: many-to-many bridge between documents and users with a role column.

## What I Would Build Next (2–4 More Hours)

- Real-time cursor presence and live co-editing with Yjs + TipTap collaboration.
- Markdown-aware import (parse headings, bold, lists from `.md`).
- Export to `.md` and `.pdf`.
- Comments and suggestion mode.
- Role-based UI hiding (e.g., hide Share button for non-owners instead of relying on server 403).
