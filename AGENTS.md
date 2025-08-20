# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Application source.
  - `routes/`: Route modules (lowercase kebab-case, e.g., `stream-resource.tsx`).
  - `models/`: Server-only logic (suffix files with `.server.ts`).
  - `db/`: Drizzle ORM setup and `schema.ts`.
  - `root.tsx`, `layout.tsx`: App shell and shared layout.
- `public/`: Static assets.
- `build/`: Output from `react-router build`.
- Config: `react-router.config.ts` (SSR on), `vite.config.ts`, `tsconfig.json`, `.editorconfig`.

## Build, Test, and Development Commands
- `npm run dev`: Start dev server with HMR via React Router + Vite.
- `npm run build`: Build server/client bundles to `build/`.
- `npm run start`: Serve the built app (`build/server/index.js`).
- `npm run typecheck`: Generate types and run TypeScript.
- `npm run db:generate`: Generate Drizzle migrations from schema.
- `npm run db:push`: Apply schema to the database.
- Docker (optional): `docker build -t demo-react-router . && docker run -p 3000:3000 demo-react-router`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; trim trailing whitespace; final newline (`.editorconfig`).
- Language: TypeScript, strict mode; JSX with React 19.
- Components: PascalCase React components; filename casing: routes in kebab-case.
- Server-only code: use `.server.ts` and keep side effects isolated.
- Imports: use alias `~/` for `app/` (see `tsconfig.json`).

## Testing Guidelines
- No test runner is configured yet. When adding tests, prefer Vitest + React Testing Library.
- Suggested patterns: colocate `*.test.ts(x)` next to modules; keep unit tests fast and deterministic.
- Aim for coverage on route loaders/actions and critical UI states.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat: add stream demo`, `docs: update README`).
- PRs: concise description, linked issues, screenshots for UI, and notes on DB changes (`db:generate`/`db:push`). Ensure `npm run build` and `npm run typecheck` pass.

## Security & Configuration Tips
- Env: `.env` provides `DATABASE_URL` for Drizzle (`pglite` driver by default). Never commit secrets or `/pgdata`.
- SSR: Enabled by default; avoid leaking sensitive data in loaders/actions.
