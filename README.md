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
CLIENT_ORIGIN="*"              # lock to your domain in production, e.g. http://your-domain.com
```

For the frontend, set `VITE_API_URL` when deploying to production; locally Vite proxies `/api` to the backend.

## Deployment

### Docker (recommended for VPS)

A `Dockerfile` and `docker-compose.yml` are included. This keeps your host server clean and persists the SQLite database in a Docker volume.

1. **Clone and enter the repo**
   ```bash
   git clone https://github.com/Quraize/ajaai.git
   cd ajaai
   ```

2. **Create a strong JWT secret**
   ```bash
   export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   echo $JWT_SECRET
   ```

3. **Build and start**
   ```bash
   docker compose up --build -d
   ```

4. **Seed demo users (one-time)**
   ```bash
   docker compose exec ajaai pnpm prisma db seed
   ```

5. **Open the app**
   - http://your-vps-ip:4000

6. **Redeploy after an update**
   ```bash
   git pull
   docker compose down
   docker compose up --build -d
   ```

7. **Useful commands**
   ```bash
   docker compose logs -f ajaai   # view logs
   docker compose down            # stop
   docker compose up -d           # start
   ```

### Nginx + SSL (optional)

If you have a domain, put Nginx in front of Docker:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then get SSL with Certbot:
```bash
sudo certbot --nginx -d your-domain.com
```

### Render (alternative) — single service

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
