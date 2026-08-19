# AGENTS.md

This file gives AI coding agents (and human contributors) the context needed to work in the Andhbhakt repo effectively.

## Project Overview

Andhbhakt is a TypeScript pnpm monorepo with a React frontend and an Express API backed by PostgreSQL. API contracts are defined in OpenAPI and code-generated into a typed frontend client via Orval, with Zod for runtime validation. Side scripts (data crawling/enrichment) run in Node and Python.

## Tech Stack

| Layer            | Stack                                                              |
|------------------|---------------------------------------------------------------------|
| Frontend         | React 19, Vite 7, Wouter, Tailwind CSS 4, shadcn/Radix, Recharts    |
| i18n / SEO       | i18next, react-helmet-async                                        |
| Data fetching    | TanStack Query + Orval-generated client                            |
| API              | Express 5, Pino, cookie sessions, rate limiting                    |
| DB               | PostgreSQL, Drizzle ORM                                            |
| Contracts        | OpenAPI 3.1 → Orval → Zod schemas                                  |
| Build / tooling  | TypeScript 5.9, esbuild, Prettier                                  |
| Bot protection   | Cloudflare Turnstile                                                |
| Side scripts     | Node (data crawl/enrich) + Python 3.13 helpers                     |
| Package manager  | pnpm workspaces                                                    |

## Setup Commands

```bash
# Install all workspace dependencies
pnpm install

# Start frontend + API in dev mode (parallel)
pnpm dev

# Start a single app
pnpm --filter web dev
pnpm --filter api dev

# Build everything
pnpm build

# Build a single package/app
pnpm --filter api build
```

## API Contract Workflow (important — follow this order)

1. Edit the OpenAPI spec in `/openapi`.
2. Regenerate the typed client and Zod schemas:
   ```bash
   pnpm generate:api
   ```
3. Implement/update the Express route handler to match the spec.
4. Update the frontend to use the regenerated Orval hooks — never hand-write fetch calls or hand-edit generated files under `packages/shared/generated` (or equivalent). Treat them as build output.
5. Run typecheck to confirm frontend, backend, and shared types agree.

## Database Workflow

```bash
# Generate a new Drizzle migration after editing schema
pnpm --filter db generate

# Apply migrations locally
pnpm --filter db migrate

# Open Drizzle Studio to inspect data
pnpm --filter db studio
```

- Never edit a migration file that has already been applied/committed — create a new one.
- Schema lives in `packages/db/schema` (adjust to actual path); keep Drizzle schema and OpenAPI/Zod types consistent when a field changes on both sides.

## Engineering Philosophy

- Favor simple, direct solutions over speculative abstraction. Don't add config options, plugin systems, extra layers of indirection, or "future-proofing" for requirements that don't exist yet.
- Follow standard best practices (typed interfaces, input validation, error handling, tests for real logic) but don't gold-plate: no premature caching, no generic frameworks for a single use case, no extra abstraction layers "just in case."
- If a request is reasonable and doesn't hurt performance or maintainability, just implement it — don't push back or add unnecessary caveats.
- If a request would clearly worsen performance, security, or maintainability (e.g. N+1 queries, unindexed lookups on large tables, blocking the event loop, disabling validation, unbounded loops/payloads), say so and propose a better alternative before implementing it as-is.
- If the user still wants to proceed after hearing the trade-off, implement what they asked for — don't keep blocking or re-litigating the decision. Note the trade-off briefly in a comment or the PR description instead.
- When in doubt between "simple" and "extensible," default to simple. Extract an abstraction only once a second real use case actually shows up, not in anticipation of one.

## Code Style

- TypeScript strict mode throughout; no `any` without a comment justifying it.
- Formatting via Prettier — run `pnpm format` before committing.
- Linting via ESLint (shared config in `packages/config`) — run `pnpm lint` and fix all warnings.
- Functional React components with hooks; no class components.
- Naming: `camelCase` for variables/functions, `PascalCase` for components/types, `SCREAMING_SNAKE_CASE` for env vars and constants.
- Prefer named exports. Co-locate component styles with Tailwind utility classes rather than separate CSS files.
- Routing: Wouter, not React Router — don't introduce React Router.
- Server logging: use Pino (`logger.info/error`, not `console.log`) in `/apps/api`.
- All user-facing strings go through i18next — no hardcoded UI copy.

## Testing Instructions

```bash
# Run all tests across the monorepo
pnpm test

# Run tests for one workspace
pnpm --filter api test
pnpm --filter web test

# Watch mode
pnpm --filter api test -- --watch
```

- New API routes require request/response tests validated against the OpenAPI-derived Zod schemas.
- New DB logic touching Drizzle queries should have integration tests against a test database, not mocked queries, where feasible.
- Frontend components with logic (not pure presentational) should have at least a render + interaction test.

## Validation Before Committing / Opening a PR

Run in order; all must pass:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If you changed `/openapi`, also confirm `pnpm generate:api` was run and the diff to generated files is committed.

## Python Side Scripts

- Python 3.13, managed via [uv / poetry / pip — confirm and fill in].
- Located in `/scripts/py`. Keep these isolated from the TS build — they should not be imported by Node code.
- Run: `python scripts/py/<script>.py` (add venv activation instructions here once confirmed).

## Git & PR Guidelines

- Branch naming: `feature/short-description`, `fix/short-description`, `chore/short-description`
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never commit directly to `main` — always via PR.
- If a PR touches `/openapi`, call this out explicitly in the description since it affects generated code downstream.
- Keep PRs scoped to one workspace/concern where possible (e.g. don't mix an API change with an unrelated frontend refactor).

## Do / Don't

**Do:**
- Regenerate Orval client/Zod schemas after any OpenAPI change, and commit the generated diff.
- Keep Drizzle schema and API contracts in sync when a field changes.
- Run rate-limiting and session logic through the existing Express middleware rather than adding ad hoc checks.
- Use Cloudflare Turnstile verification on any new public-facing form.

**Don't:**
- Don't hand-edit Orval-generated files — they'll be overwritten.
- Don't hand-write fetch/axios calls in the frontend for endpoints already covered by the generated client.
- Don't add a new state-management library — TanStack Query + local state is the standard.
- Don't bypass Zod validation on API inputs, even for "trusted" internal endpoints.
- Don't commit `.env`, session secrets, Turnstile keys, or DB credentials.

## Security & Secrets

- Env vars documented in `.env.example` per app (`apps/web/.env.example`, `apps/api/.env.example`). Copy to `.env` locally, never commit `.env`.
- Sessions are cookie-based — any change to session handling in `/apps/api` needs review for `httpOnly`/`secure`/`sameSite` flag correctness.
- Rate limiting middleware in the API should not be removed or loosened without explicit sign-off.

## Notes for Agents

<!-- Add repo-specific gotchas here as they come up, e.g. flaky tests, deprecated folders, deploy quirks. -->
- OpenAPI spec is the source of truth for API shape — always start contract changes there, not in the Express handler.
- Generated code (Orval client, Zod schemas) lives under version control for reproducible builds; treat diffs to it as expected output of `pnpm generate:api`, not something to manually clean up.
