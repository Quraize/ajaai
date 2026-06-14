# Ajaia Docs

A lightweight, full-stack collaborative document editor inspired by Google Docs. Built with React, TipTap, Node.js/Express, Prisma, and SQLite.

## Features

- **Document creation & editing**: Create, rename, edit, and delete rich-text documents with bold, italic, underline, headings, and bullet/numbered lists.
- **Auto-save**: Documents save automatically as you type.
- **File import**: Import `.txt`, `.md`, or `.docx` files as new editable documents.
- **Sharing**: Share documents with other users by email with editor or viewer access.
- **Owned vs. shared**: Dashboard clearly separates documents you own from documents shared with you.
- **Persistence**: SQLite database with Prisma ORM; formatting is preserved as TipTap JSON.
- **Seeded demo accounts**: Three demo users are created on first run for quick testing.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TipTap (ProseMirror)
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite via Prisma ORM
- **Auth**: JWT with bcrypt password hashing
- **Testing**: Vitest + Supertest (backend), Vitest + React Testing Library (frontend)

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)

## Local Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up the database**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

3. **Run the dev servers**
   ```bash
   pnpm dev
   ```
   - API: http://localhost:4000
   - Web: http://localhost:3000

4. **Run tests**
   ```bash
   pnpm test
   ```

## Demo Accounts

| Name  | Email                 | Password    |
|-------|-----------------------|-------------|
| Alice | alice@example.com     | password123 |
| Bob   | bob@example.com       | password123 |
| Carol | carol@example.com     | password123 |

Log in as Alice, create a document, then share it with Bob or Carol to test the sharing flow.

## Environment Variables

Create `apps/api/.env` (see `.env.example`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=4000
NODE_ENV=development
```

For the frontend, set `VITE_API_URL` when deploying to production; locally Vite proxies `/api` to the backend.

## Deployment

### Render (recommended) — single service

1. Push this repo to GitHub.
2. Create a **Web Service**:
   - Root directory: `/`
   - Build command: `pnpm install && pnpm db:deploy && pnpm build`
   - Start command: `pnpm --filter api start`
   - Set environment variables:
     - `NODE_ENV=production`
     - `JWT_SECRET=<a-strong-random-string>`
     - `DATABASE_URL=file:./prisma/prod.db`
3. The API will serve the built React app from `apps/web/dist` on the same domain, so no CORS or separate static site is needed.

> **Note:** On Render's free tier the filesystem is ephemeral. For a persistent demo, attach a Render Disk or re-seed after deploys.

## Project Structure

```
ajaia-docs/
├── apps/
│   ├── api/               # Express backend
│   └── web/               # React frontend
├── IMPLEMENTATION_PLAN.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
└── SUBMISSION.md
```

## License

MIT
