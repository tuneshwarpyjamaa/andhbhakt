# GovLens India

A civic accountability platform that cross-references official PIB (Press Information Bureau) press releases against CAG (Comptroller and Auditor General) audit findings for every major BJP-era government scheme (2014–present). Citizens can see the gap between political announcements and ground reality, browse state-level governance scorecards, explore cabinet minister integrity data sourced from ECI affidavits, and track central government manifesto promises across three election terms.

## Quick Start

```bash
# Install dependencies
pnpm install

# Push the DB schema (first time / after schema changes)
pnpm --filter @workspace/db run push

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (separate terminal)
pnpm --filter @workspace/govlens run dev
```

Copy `.env.example` → `.env` and fill in your values before running.

## Environment Variables

See `.env.example` for the full list with descriptions. The minimum required:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Yes | API server port (set by Replit automatically) |
| `SESSION_SECRET` | Prod | 64-char random hex — signs session cookies |
| `ADMIN_TOKEN` | Prod | Token for `/api/admin/*` routes (X-Admin-Token header) |
| `TURNSTILE_SECRET_KEY` | Prod | Cloudflare Turnstile bot-check secret |
| `ALLOWED_ORIGIN` | Prod | CORS origin allowlist (e.g. `https://govlens.in`) |

Generate secrets: `openssl rand -hex 32`

## Stack

- **Monorepo**: pnpm workspaces
- **Runtime**: Node.js 24, TypeScript 5.9
- **API**: Express 5 (`artifacts/api-server`)
- **Frontend**: React + Vite + Tailwind (`artifacts/govlens`)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod v4 + drizzle-zod (`lib/api-zod`)
- **API codegen**: Orval (OpenAPI spec → typed hooks + Zod schemas, `lib/api-spec`)
- **Build**: esbuild (CJS bundle for the API server)

## Where Things Live

| Path | What's here |
|---|---|
| `artifacts/api-server/src/routes/` | All Express route handlers |
| `artifacts/api-server/src/middlewares/` | Auth, rate-limiting, cache, CORS |
| `artifacts/api-server/src/jobs/` | Background jobs (news fetcher) |
| `artifacts/govlens/src/pages/` | Frontend page components |
| `artifacts/govlens/src/data/` | Static civic data (schemes, state facts, ministers, manifestos, CAG reports) |
| `lib/db/` | Drizzle schema + migrations |
| `lib/api-zod/` | Auto-generated Zod schemas from OpenAPI spec |
| `lib/api-spec/` | OpenAPI 3.1 spec (`openapi.yaml`) |

## Architecture Decisions

- **Static data in TypeScript files** — The majority of civic data (state facts, minister profiles, manifesto promises, CAG report narratives) lives as typed TypeScript constants in `artifacts/govlens/src/data/`. This makes it auditable, diff-able, and contribution-friendly without needing a CMS. Only live/dynamic data (PIB entries, CAG audit records, news) lives in the database.

- **Session cookie, not JWT** — The bot-check gate issues an HMAC-signed cookie (not a JWT) to keep the session mechanism simple and server-controlled. The `SESSION_SECRET` must be set in production; the server refuses to start without it.

- **Cloudflare in front** — Production traffic is gated behind Cloudflare (Turnstile bot check + CF-Connecting-IP header check + optional origin secret). The `cloudflareOnlyMiddleware` enforces this; it is a no-op in development.

- **Admin token via header only** — The `X-Admin-Token` header is the only way to authenticate admin routes. Query-string tokens are not accepted (they appear in server logs and browser history).

- **National vs state CAG scoring** — The monetary-management score formula uses a coefficient of 15 for the central government (vs 30 for states) to be proportionate to the Union Budget scale. Both use `100 − k × log₁₀(amount/10 + 1)`.

## Common Tasks

```bash
# Typecheck all packages
pnpm run typecheck

# Regenerate API hooks and Zod schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes (dev only — use migrations in production)
pnpm --filter @workspace/db run push

# Build everything
pnpm run build

# Typecheck the shared libraries (Drizzle schema, Zod schemas, API client)
pnpm run typecheck:libs
```

## Data Sources

All civic data is sourced from public documents:
- **ECI affidavits** — via ADR/myneta.info
- **CAG published reports** — cag.gov.in
- **PIB press releases** — pib.gov.in
- **NFHS-5, NCRB, MOSPI, ASER** — as cited per indicator

## Contributing

1. Fork the repo and clone locally.
2. Copy `.env.example` → `.env` and fill in `DATABASE_URL`, `SESSION_SECRET`, and `ADMIN_TOKEN`.
3. Run `pnpm install` then `pnpm --filter @workspace/db run push`.
4. Data corrections go in `artifacts/govlens/src/data/` — each file has inline source citations.
5. Open a PR with the source URL for any data change.
