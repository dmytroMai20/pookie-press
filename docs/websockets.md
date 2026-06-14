# WebSocket / Real-time Integration

## Current Implementation: Pusher

Pookie Press uses [Pusher Channels](https://pusher.com/channels) for real-time event broadcasting.

### Why Pusher?

- **Serverless-compatible** — no persistent WebSocket server needed
- **Managed infrastructure** — no scaling concerns for MVP
- **Simple swap** — abstracted behind `RealtimeGateway` port

### Channel & Events

| Channel        | Event      | Payload                          |
|---------------|------------|----------------------------------|
| `pookie-press` | `love-tap` | `{ id: string, timestamp: string }` |

### Server-side (broadcast)

```typescript
// src/adapters/pusher/PusherServerAdapter.ts
await pusher.trigger("pookie-press", "love-tap", { id, timestamp });
```

### Client-side (subscribe)

```typescript
// src/adapters/pusher/usePusher.ts
const channel = pusher.subscribe("pookie-press");
channel.bind("love-tap", (data) => { /* animate hearts */ });
```

### Environment Variables

```
PUSHER_APP_ID=       # Server-side
PUSHER_KEY=          # Server-side
PUSHER_SECRET=       # Server-side
PUSHER_CLUSTER=      # Server-side
NEXT_PUBLIC_PUSHER_KEY=     # Client-side (exposed)
NEXT_PUBLIC_PUSHER_CLUSTER= # Client-side (exposed)
```

## Swapping to Another Provider

1. Implement `RealtimeGateway` interface in a new adapter
2. Create a corresponding client hook
3. Update the DI container in `src/lib/container.ts`
4. Update client import in the page component
