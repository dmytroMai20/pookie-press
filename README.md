# Pookie-Press

A real-time love-tap app for couples. Tap a heart button to send love to your partner — they see floating hearts animate on their screen in real time. A shared weekly progress meter tracks how many taps you've exchanged together.

## Features

- **Heart button** with pulsing animation and haptic feel
- **Floating hearts** that animate across the screen on each tap
- **Love meter** — shared weekly progress bar toward a configurable goal
- **Real-time sync** — your partner sees hearts the moment you tap
- **Optimistic UI** — instant feedback with debounced server sync

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 (forced dark mode) |
| **Animation** | Framer Motion |
| **Database** | PostgreSQL (Supabase or Neon) |
| **ORM** | Prisma 7 (driver adapter pattern) |
| **Cache** | Upstash Redis (HTTP-based) |
| **Real-time** | Pusher Channels (WebSocket) |
| **Deployment** | Vercel |

## Architecture

Hexagonal architecture (ports & adapters) — business logic is decoupled from infrastructure.

```
src/
├── domain/       Pure business logic (models, services)
├── ports/        TypeScript interfaces defining contracts
├── adapters/     Concrete implementations (Prisma, Redis, Pusher)
├── app/          Next.js App Router (UI + API routes)
└── lib/          DI container, config, utilities
```

See `docs/architecture.md` for the full architecture overview.

## Cloud Architecture diagrams

### MVP

<img width="1090" height="632" alt="diagram-export-14-06-2026-13_59_16" src="https://github.com/user-attachments/assets/30655c30-0eed-41c0-a4fb-4fb0a919ec79" />

### POST-MVP

<img width="1215" height="957" alt="diagram-export-14-06-2026-14_05_15" src="https://github.com/user-attachments/assets/c962e03e-8a9b-4cbe-b47d-5627a4d90120" />

## Design Decisions

### Why Pusher over SSE?

The client only **receives** real-time events (server → client), making Server-Sent Events (SSE) a natural fit. However, **Vercel serverless functions don't support long-lived HTTP connections** required by SSE (they timeout after 10-30s). Pusher works natively with serverless — the server fires a trigger and Pusher handles delivery over its own managed WebSocket infrastructure. This avoids needing a separate long-running server.

### Why Prisma 7 driver adapters?

Prisma 7 removed `url` from the `datasource` block in `schema.prisma`. The connection URL is now configured via `prisma.config.ts` (for CLI operations) and passed at runtime through a driver adapter (`@prisma/adapter-pg`). This gives more control over connection management and is the forward-compatible pattern.

### Why Upstash Redis over direct PostgreSQL queries for counts?

Redis `INCR` is atomic and returns the new value in a single operation — perfect for a fast tap counter. The weekly count is cached in Redis and used as the source of truth for display. PostgreSQL is the durable store; Redis is the fast path. This avoids a `COUNT(*)` query on every tap and every stats fetch.

### Why optimistic updates with debounced flush?

Rapid tapping needs to feel instant. The UI increments the meter immediately on each tap, queues taps locally, and flushes them to the server in a batch after 300ms of inactivity. The server's response includes the true `weeklyCount` from Redis, which corrects any drift. This gives sub-millisecond UI response while keeping the server accurate.

### Why hexagonal architecture for an MVP?

The ports & adapters pattern makes it trivial to swap infrastructure. For example, replacing Pusher with another provider only requires a new adapter — no domain or API changes. This keeps the MVP lean while being extensible for post-MVP features (auth, multi-couple support, analytics).

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A PostgreSQL database (Supabase or Neon)
- An Upstash Redis database
- A Pusher Channels app

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your credentials in .env

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — open in two tabs to test real-time sync.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `PUSHER_APP_ID` | Pusher app ID |
| `PUSHER_KEY` | Pusher key (server) |
| `PUSHER_SECRET` | Pusher secret |
| `PUSHER_CLUSTER` | Pusher cluster region |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher key (client, public) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (client, public) |
| `WEEKLY_TAP_GOAL` | Weekly goal target (default: 50) |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema to database |

## Testing

```bash
pnpm test:run
```

20 unit tests covering domain models, services, and adapters. Tests use Vitest with mocked infrastructure.

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js
5. Run `pnpm db:push` against production database

Vercel integrations for [Neon](https://vercel.com/integrations/neon) and [Upstash](https://vercel.com/integrations/upstash) can auto-provision database credentials.

## Documentation

- `docs/architecture.md` — Architecture overview and data flow
- `docs/database.md` — Database schema, commands, and seeding
- `docs/websockets.md` — Real-time integration details
- `docs/deployment.md` — Deployment guide
