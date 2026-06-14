# Ajaia Docs Walkthrough Video — Script & Recording Guide

Target length: **3–5 minutes**. Speak naturally; pause between sections if you need to trim later.

---

## Recording Setup

1. Open the deployed app: `http://187.77.120.162:4000`
2. Prepare two browser windows/profiles:
   - **Window A** — Alice (owner)
   - **Window B (incognito)** — Bob (collaborator)
3. Have two sample files on your desktop for the import demo:
   - `sample.txt` (plain text)
   - `sample.docx` (Word doc with some formatting)
4. Use a screen recorder at **1920×1080** (OBS, Loom, or ShareX).
5. Hide bookmarks bar / personal tabs for a clean view.
6. Do one dry run before the final take.

---

## Video Script

### 0:00–0:30 — Introduction

> “Hi, I’m [Your Name]. This is **Ajaia Docs**, a lightweight full-stack collaborative document editor inspired by Google Docs. It’s live at `http://187.77.120.162:4000`. The stack is React 18 + TipTap on the frontend, Node.js/Express + Prisma + SQLite on the backend, all containerized with Docker. In the next few minutes I’ll walk through the end-to-end user flow, what works, and the key engineering decisions behind it.”

**On screen:** Show the login page and mention the URL.

---

### 0:30–1:00 — Authentication & Demo Accounts

> “The app uses JWT-based auth with bcrypt password hashing. To make the demo easy, I seed three demo users on first run: alice, bob, and carol, all with password `password123`. I’ll log in as Alice.”

**Actions:**
- Enter `alice@example.com` / `password123` and log in.
- Briefly show the dashboard split into **Owned** and **Shared with me**.

---

### 1:00–1:45 — Creating & Editing a Document

> “From the dashboard, Alice can create a new document. The editor is built with TipTap, so we have bold, italic, underline, headings, bullet and numbered lists, plus undo/redo. The title and content auto-save as you type, and the content is stored as TipTap JSON so formatting is preserved.”

**Actions:**
- Click **New document**.
- Type a title, e.g., “Project Kickoff Notes”.
- Add some formatted text: heading, bold, italic, bullet list.
- Refresh the page to show persistence.

---

### 1:45–2:15 — File Import

> “Ajaia also supports importing files. I can upload a `.txt`, `.md`, or `.docx` file and it becomes a new editable document. Markdown currently comes in as plain text — that was an intentional scope cut for this demo.”

**Actions:**
- Click **Import** on the dashboard.
- Upload `sample.txt` or `sample.docx`.
- Open the imported document and scroll through the content.

---

### 2:15–2:55 — Sharing & Collaboration

> “Sharing is role-based: owner, editor, or viewer. I’ll share this document with Bob as an editor. Then I’ll switch to Bob’s account in an incognito window to show the shared document appears in his dashboard.”

**Actions:**
- Open the share dialog, enter `bob@example.com`, choose **Editor**, and share.
- Switch to Bob’s window, log in, and open the shared doc from the **Shared with me** list.
- Make a small edit to prove editor access works.
- Optionally show that a viewer would see the doc but edits are blocked on the backend.

---

### 2:55–3:45 — Key Implementation Decisions

> “A few decisions worth calling out. I used **SQLite** to keep the demo zero-config and easy to deploy, but I also added a **PostgreSQL** Docker Compose option for production. The backend enforces a strong `JWT_SECRET` in production, locks CORS to a configurable origin, and uses **Redis-backed rate limiting** on login and registration keyed by email. On the frontend, the editor is lazy-loaded to split the large TipTap bundle, and there’s a React error boundary so crashes show a friendly reload screen instead of a white page.”

**On screen:** Briefly show:
- `docker-compose.yml` / `docker-compose.postgres.yml`
- `apps/api/src/app.ts` (rate limiting, CORS)
- `apps/web/src/App.tsx` (lazy `Editor` import)
- `apps/web/src/components/ErrorBoundary.tsx`

---

### 3:45–4:15 — What Was Deprioritized

> “I intentionally deprioritized a few things to keep the scope realistic for a demo. Real-time collaborative editing with operational transforms or CRDTs is not implemented. There’s no comment threads, version history, or audit logs. Markdown import is plain-text only, and I kept RBAC simple to owner/editor/viewer without enterprise features like groups or SSO.”

---

### 4:15–4:45 — AI Support

> “AI tools helped me scaffold the monorepo, generate the Prisma schema, write API tests, refactor the editor toolbar, and harden the production setup — JWT enforcement, rate limiting, Docker healthchecks, and the Postgres deployment path. I reviewed and adjusted every suggestion, but it significantly sped up the boilerplate and security review.”

---

### 4:45–5:00 — Closing

> “That’s Ajaia Docs. The repo is at `https://github.com/Quraize/ajaai`. Thanks for watching!”

**On screen:** Show the GitHub repo and live URL one more time.

---

## Post-Recording Checklist

- [ ] Video is **3–5 minutes** long.
- [ ] Audio is clear and the screen is readable.
- [ ] All main flows are shown: login → create/edit → import → share → role-based access.
- [ ] You mention at least one deprioritized feature and one key engineering decision.
- [ ] Upload to **Loom / YouTube / Google Drive** as unlisted/public.
- [ ] Copy the video URL into `WALKTHROUGH_VIDEO_URL.txt` and commit it:
  ```bash
  echo "https://your-video-url" > WALKTHROUGH_VIDEO_URL.txt
  git add WALKTHROUGH_VIDEO_URL.txt
  git commit -m "Add walkthrough video URL"
  git push
  ```
