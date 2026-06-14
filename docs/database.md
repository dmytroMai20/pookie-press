# Database

## Provider

PostgreSQL hosted on **Neon** or **Supabase** (both integrate with Vercel).

## Schema

```prisma
model LoveTap {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  userId    String?

  @@index([timestamp])
  @@map("love_taps")
}
```

## Commands

```bash
# Generate Prisma Client after schema changes
pnpm db:generate

# Create and apply migrations (development)
pnpm db:migrate

# Push schema to DB without migrations (prototyping)
pnpm db:push
```

## Configuration

Set `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://user:password@host:5432/pookie_press?sslmode=require"
```

## Seeding (optional)

Create `prisma/seed.ts` to populate test data:

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.loveTap.createMany({
    data: Array.from({ length: 25 }, () => ({
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    })),
  });
}

main().finally(() => prisma.$disconnect());
```
