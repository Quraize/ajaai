# Submission Checklist — Ajaia Docs

## Included in This Repo

- [x] Source code (full-stack monorepo in `apps/api` and `apps/web`)
- [x] `README.md` with local setup, run, and deployment instructions
- [x] `IMPLEMENTATION_PLAN.md` with architecture and execution steps
- [x] `ARCHITECTURE.md` explaining priorities, trade-offs, and data model
- [x] `AI_WORKFLOW.md` describing AI usage, changes, and verification
- [x] `SUBMISSION.md` (this file)
- [x] `WALKTHROUGH_VIDEO_URL.txt` (placeholder for video link)
- [x] `screenshots/` with key UI screenshots
- [x] Automated tests (backend integration + frontend component)
- [x] Seeded demo accounts for sharing flow testing

## Live Deployment

> A live Render deployment was prepared but not published because the GitHub repository could not be created from this environment. The project is ready to deploy as a single Render Web Service using the instructions in `README.md`.

- **Frontend / API**: *TBD — deploy via Render using README instructions*

## Local Demo

The production build is currently running locally at:

- **App**: http://localhost:4000
- **API health**: http://localhost:4000/health

Run `pnpm dev` to start the development servers (API on :4000, web on :3000).

## Demo Credentials

| Name  | Email                 | Password    |
|-------|-----------------------|-------------|
| Alice | alice@example.com     | password123 |
| Bob   | bob@example.com       | password123 |
| Carol | carol@example.com     | password123 |

Use Alice to create a document and share it with Bob or Carol.

## What Works End to End

- Create, rename, edit, save, and delete rich-text documents
- Bold, italic, underline, H1/H2 headings, bullet and numbered lists
- Auto-save with status indicator
- Upload `.txt`, `.md`, or `.docx` files as new documents
- Share documents by email with editor/viewer roles
- Dashboard distinguishes owned vs. shared documents
- JWT auth with seeded demo users
- Persistence across refreshes via SQLite

## What Is Intentionally Deprioritized

- Real-time collaborative editing / operational transforms
- Comments, suggestions, version history
- Markdown-aware import (currently imported as plain text paragraphs)
- Export to PDF / Markdown
- Email notifications for shares
- Granular RBAC beyond owner/editor/viewer

## What I Would Build Next with 2–4 More Hours

1. Real-time co-editing indicators and cursor presence with Yjs.
2. Markdown parsing during import.
3. Export to Markdown and PDF.
4. Comments on document selections.

## Walkthrough Video

- **URL**: *See `WALKTHROUGH_VIDEO_URL.txt` — add Loom/YouTube link there*
