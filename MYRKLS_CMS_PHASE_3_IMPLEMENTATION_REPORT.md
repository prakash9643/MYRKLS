# MYRKLS CMS Phase 3 Implementation Report

## Summary

Implemented a separate Shopify embedded Admin app in `apps/shopify-admin`. It is independent of the existing Vite storefront and provides Shopify-managed authentication, durable PostgreSQL-backed sessions, a read-only Admin API connection check, lifecycle cleanup, and a read-only comparison of live Shopify schema definitions against the Phase 2 manifest.

The app has **not** been linked to a Shopify Dev Dashboard app, installed on a store, connected to a provisioned database, deployed, or used to change Shopify. No storefront, cart, checkout, customer-account, Vercel, or existing Shopify integration source was intentionally changed.

## Implementation

- Added a standalone React Router/Shopify app, local scripts, CLI configuration, environment template, lockfile, build setup, and project README.
- Configured Shopify's React Router SDK for embedded, single-merchant distribution, API version `2026-10`, managed authentication, and expiring offline access tokens.
- Configured only `read_metaobject_definitions` and `read_metafield_definitions` as requested scopes. No product, order, customer, payment, or content-write scopes are requested.
- Added PostgreSQL persistence through Shopify's Prisma session-storage adapter. The additive migration contains only session, app connection-status, and rate-limit tables.
- Added authenticated Dashboard, Website Overview, CMS Connection, Schema Status, and Settings routes. Server loaders derive store context from the authenticated Shopify session.
- Added read-only GraphQL queries with pagination and safe error handling. The app has no schema create/update/delete path.
- Added signed `app/uninstalled` and `app/scopes_update` webhook handlers. Cleanup removes app sessions and app-only status/rate-limit records, not merchant content.
- Added app-local synchronization of Phase 2 schema modules, unit/UI tests, security/deployment notes, and a manual development-store checklist.

## Verification results

| Check | Result |
|---|---|
| Admin app `npm run typecheck` | Passed |
| Admin app `npm test` | Passed: 7 test files, 22 tests |
| Admin app `npm run build` | Passed |
| Prisma schema validation | Passed using a placeholder URL; no database connection or migration was performed |
| Admin app `npm audit --audit-level=high` | Passed: 0 vulnerabilities |
| Built client asset scan | No matches for `SHOPIFY_API_SECRET`, `DATABASE_URL`, `refreshToken`, `accessToken`, `PrismaSessionStorage`, or `shopify.server` |
| Existing storefront `npm run build` | Passed, including sitemap generation and verification |
| Existing storefront `npm run test:shopify` | Passed all Shopify, cart, customer-account, Phase 7, and analytics checks |
| Existing storefront `npm test` | Failed at the cart-line removal click in `scripts/verify_flows.cjs` (`Node is either not clickable or not an Element`); the Vite server was confirmed responsive at HTTP 200 and stopped afterward |

The storefront browser-test failure is isolated to the existing smoke-test click at `[role="dialog"] button[aria-label^="Remove "]` (the script's cart line-removal step). This run does not establish why Puppeteer could not click the element. No storefront code or test was changed to suppress or work around it.

The Admin production build reports React Router future-flag notices and empty chunks for server-only route modules; the build completed successfully.

## Shopify setup and remaining verification

Shopify CLI configuration validation is blocked until an authorized Shopify app record is linked: `client_id` in `shopify.app.toml` is intentionally blank. The actual app identity, production URL, Shopify credentials, and database connection string were not available; no local `.env` file or corresponding process environment values were present during the final check.

Consequently, the following remain unverified and require owner-authorized setup:

1. Link the app to the authorized Shopify Dev Dashboard record and development store.
2. Provision PostgreSQL and apply the included migration.
3. Perform OAuth, embedded Admin, live read-only API, durable-session, and signed-webhook checks on a development store.
4. Approve a hosting environment and production URL before any deployment or Shopify app release.

No Shopify app configuration was deployed, no merchant data was changed, and no schema definitions were created or modified.
