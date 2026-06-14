# Architecture Overview

Pookie Press uses **hexagonal architecture** (ports & adapters) to keep business logic decoupled from infrastructure.

## Layers

```
src/
├── domain/       Pure business logic, zero framework dependencies
├── ports/        TypeScript interfaces defining contracts
├── adapters/     Concrete implementations of ports
├── app/          Next.js App Router (UI + API routes)
└── lib/          DI container, config, shared utilities
```

## Design Principles

1. **Domain layer is pure** — no imports from adapters, Next.js, or third-party SDKs
2. **Ports define contracts** — adapters can be swapped without touching domain logic
3. **DI container wires everything** — `src/lib/container.ts` assembles the dependency graph
4. **One adapter per infrastructure concern** — Prisma for DB, Upstash for cache, Pusher for realtime

## Data Flow (Tap)

```
Client button press
  → POST /api/tap
    → TapService.recordTap()
      → PrismaTapRepository.recordTap()     (persist)
      → RedisAdapter.incrementWeeklyCounter() (cache)
      → PusherServerAdapter.broadcastTap()   (realtime)
    ← Return tap ID
  ← 201 Created
Client receives Pusher event → animate hearts
```

## Swapping Adapters

To replace Pusher with Socket.io:
1. Create `src/adapters/socketio/SocketIOAdapter.ts` implementing `RealtimeGateway`
2. Update `src/lib/container.ts` to inject the new adapter
3. Update the client hook in `src/adapters/socketio/useSocketIO.ts`

No domain or port changes needed.
