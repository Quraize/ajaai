# AI Workflow Note — Ajaia Docs

## AI Tools & Models Used

- **Opus 4.7**: used for architecture planning and broader implementation planning, including stack selection, monorepo layout, and scoping decisions.
- **Kimi 2.6 / Kimi Code CLI**: primary agent for hands-on code implementation, scaffolding, refactoring, and test/debug loops.
- **Claude Code / Kimi Code CLI**: used for production hardening (JWT enforcement, CORS, rate limiting, Docker healthchecks) and final QA passes.
- **Project skills / system instructions**: used to enforce TDD, coding standards, backend patterns, and verification loops throughout development.
- **GitHub Copilot-style completions**: used implicitly via the editor environment for small boilerplate.

## Where AI Materially Sped Up Work

- **Project scaffolding**: generated the pnpm workspace, Vite, Tailwind, and Prisma boilerplate in seconds.
- **Backend routes**: drafted the Express CRUD, auth middleware, and share/import endpoints; I then tightened validation and error handling.
- **TipTap integration**: quickly surfaced the right extensions and toolbar pattern for the required formatting.
- **Tests**: generated the Vitest + Supertest integration test structure and React Testing Library component test scaffold.
- **Documentation**: produced first drafts of README, architecture note, and this workflow note, which I edited for accuracy.

## What AI-Generated Output I Changed or Rejected

- **State management**: AI suggested Redux/Zustand for document state. Rejected in favor of React hooks + local component state + debounced API calls to keep the scope minimal.
- **Database choice**: AI initially proposed Postgres/Supabase. I chose SQLite for portability and reviewer convenience.
- **Authentication**: AI suggested OAuth or magic links. Rejected in favor of JWT + seeded demo accounts to avoid external service dependencies.
- **Real-time collaboration**: AI offered to add Socket.io/operational transforms early. I deferred it as a stretch goal so core editing/sharing could be solid.
- **Code corrections**: fixed Prisma client resolution under pnpm workspaces, added explicit TypeScript annotations for Express routers, and corrected import paths.

## How I Verified Correctness, UX, and Reliability

- **Test-driven development (TDD)**: wrote failing tests first for new backend endpoints and frontend behavior, then implemented the code to make them pass.
- **Type safety**: ran `tsc` across both apps until clean.
- **Automated tests**: backend integration tests for document CRUD, sharing, unauthorized access, and file import; frontend tests for login rendering and demo-account selection.
- **Manual end-to-end**: used a browser to log in as Alice, create/edit documents, share with Bob, verify Bob sees it under "Shared with you," and test file import via curl.
- **Deployment smoke test**: planned Render deployment with build/start commands and verified the production build locally (`pnpm build`).
