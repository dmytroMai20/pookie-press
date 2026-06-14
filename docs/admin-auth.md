# Admin Authentication

The admin panel at `/admin` is protected by JWT-based authentication using the `jose` library (HS256, edge-runtime compatible).

## Setup

Set two environment variables:

| Variable         | Description                                        | Minimum Length |
| ---------------- | -------------------------------------------------- | -------------- |
| `ADMIN_PASSWORD` | Shared password for admin login                    | 16 characters  |
| `JWT_SECRET`     | Secret key used to sign/verify JWTs                | 32 characters  |

Generate strong values:

```bash
# ADMIN_PASSWORD
openssl rand -base64 24

# JWT_SECRET
openssl rand -base64 48
```

## Auth Flow

```
1. User navigates to /admin
2. AdminLayout checks auth via GET /api/admin/verify
3. If unauthenticated → redirect to /admin/login
4. User submits password on login form
5. POST /api/admin/login
   → Server compares password using crypto.timingSafeEqual (constant-time)
   → On success: signs JWT (HS256, 24h expiry), sets httpOnly cookie
   → On failure: returns 401
6. Subsequent requests include cookie automatically
7. Protected API routes call authMiddleware() to verify JWT
```

## Cookie Configuration

| Property   | Value                                    |
| ---------- | ---------------------------------------- |
| Name       | `admin_token`                            |
| HttpOnly   | `true` (not accessible via JavaScript)   |
| Secure     | `true` in production                     |
| SameSite   | `strict`                                 |
| Path       | `/`                                      |
| MaxAge     | 86400 seconds (24 hours)                 |

## Architecture

Follows the hexagonal architecture pattern:

- **Port**: `src/ports/AuthPort.ts` — defines `signToken` and `verifyToken` interface
- **Adapter**: `src/adapters/auth/JwtAuthAdapter.ts` — `jose`-based implementation
- **Middleware**: `src/lib/authMiddleware.ts` — extracts and verifies JWT from cookie
- **Container**: `src/lib/container.ts` — `getAuthAdapter()` factory

## API Routes

| Method | Route                      | Auth     | Description                        |
| ------ | -------------------------- | -------- | ---------------------------------- |
| POST   | `/api/admin/login`         | Public   | Validate password, issue JWT       |
| POST   | `/api/admin/logout`        | Public   | Clear auth cookie                  |
| GET    | `/api/admin/verify`        | Required | Check if current session is valid  |
| GET    | `/api/admin/analytics`     | Required | Fetch analytics data               |

## Security Notes

- Password is **never sent to the client** — compared server-side only
- `crypto.timingSafeEqual` prevents timing attacks on password comparison
- JWT is stored in an httpOnly cookie, not localStorage (prevents XSS access)
- Tokens expire after 24 hours with no refresh mechanism
- All protected routes go through the same `authMiddleware` function
