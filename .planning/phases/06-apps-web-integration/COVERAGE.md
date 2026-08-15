# Phase 6 — API Coverage Declaration

No external API integration: this phase wires `apps/web` to this monorepo's own `apps/server` backend (new first-party public REST endpoints — `POST /leads`, `GET /public/blog-posts`, `GET /public/blog-posts/:slug`, `GET /public/pricing-plans`) — no third-party API/SDK/service is integrated.

The one new package installed (`@nestjs/throttler`) is a rate-limiting guard library, not an external API/SDK client — it has no remote endpoints, no capability matrix applies.
