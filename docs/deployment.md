# Deployment

## Target: Vercel

Pookie Press is designed for serverless deployment on Vercel.

## Prerequisites

1. **Neon PostgreSQL** — create a project at [neon.tech](https://neon.tech)
2. **Upstash Redis** — create a database at [upstash.com](https://upstash.com)
3. **Pusher** — create an app at [pusher.com](https://pusher.com)

## Environment Variables

Set these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon/Supabase PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `PUSHER_APP_ID` | Pusher app ID |
| `PUSHER_KEY` | Pusher key (server) |
| `PUSHER_SECRET` | Pusher secret |
| `PUSHER_CLUSTER` | Pusher cluster region |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher key (client, public) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (client, public) |
| `WEEKLY_TAP_GOAL` | Weekly goal target (default: 50) |

## Deploy Steps

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js
5. Run `pnpm db:push` against production DB (or use Prisma Migrate)

## Local Development

```bash
cp .env.example .env
# Fill in your dev credentials

pnpm install
pnpm db:push          # Push schema to dev DB
pnpm dev              # Start dev server on :3000
```

## Vercel Integrations (recommended)

- **Neon** — auto-provisions `DATABASE_URL`
- **Upstash** — auto-provisions `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
