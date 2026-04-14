# What must stay on the server

The web app is a static Vite bundle. Anything in `VITE_*` is compiled into JavaScript and visible to anyone who loads the site. **Do not put API secrets, beta gates, or credentials in `VITE_*` variables.**

## Keep on the host that runs `server/index.mjs`

| Concern | Why |
|--------|-----|
| **`BETA_API_KEY`** | Used to validate `x-beta-key` on protected routes (e.g. `POST /api/echo`). Only the server should compare this value. Browsers, extensions, and crawlers can read any header or env value you embed in the frontend build. |
| **`CORS_ORIGIN`** | Enforces which browser origins may call the API. Cannot be replicated safely in the client alone. |
| **Rate limiting (`express-rate-limit`)** | Abuse protection must run where requests terminate; the client can be modified or scripted. |
| **`TRUST_PROXY` / IP-aware limits** | Correct client IP handling lives on the edge or Node process. |
| **Future: auth sessions, JWT signing keys, databases, webhooks, payments** | All server-side or a dedicated backend-for-frontend (BFF). |

## Public by design (no secret required)

- `GET /health` and `GET /api/health` are liveness checks. The frontend may call them when `VITE_API_BASE_URL` is set (or via the dev proxy) to show connectivity. This does **not** prove user identity or entitlements.

## If the browser must call a protected API

Use a flow where secrets never ship in static assets: cookie-based sessions with `HttpOnly`, OAuth with server exchange, or a BFF that holds API keys. The current `POST /api/echo` gate is intended for server-side or trusted tooling (e.g. `curl` with `x-beta-key`), not for hiding capabilities inside a public SPA.
