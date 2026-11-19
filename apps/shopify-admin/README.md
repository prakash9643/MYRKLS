# MYRKLS CMS Shopify Admin app

This is a separate, server-rendered Shopify embedded Admin app. It does not replace or share the Vite storefront runtime. App description for the Shopify Dev Dashboard:

> Manage MYRKLS website content, pages, sections, banners and global website settings directly from Shopify Admin.

Phase 3 deliberately implements only managed installation/authentication, durable sessions, a read-only Admin API connection check, lifecycle cleanup, and a read-only schema comparison dashboard. It does not edit content, create schema, or deploy Shopify configuration.

## Phase 4 Page Builder foundation

The embedded app includes a responsive Page Builder route and an in-memory editor foundation. The section library is derived from the exact Phase 1 allowlist in the synchronized Phase 2 manifest; section inspectors use the actual generic `cms_section` fields, and page types/SEO fields follow the `cms_page` definition. The UI supports local section insertion, selection, duplication, removal, visibility, drag and keyboard reordering, desktop/mobile canvas sizing, local validation, and unsaved-change warnings.

This is **not a connected or production-ready CMS editor**. The app is currently configured with definition-read scopes only. It has no authenticated CMS entry reads/writes, no Shopify file picker, and no server-side page/section persistence service. The Shopify Dev Dashboard app ID, live schema status, PostgreSQL connection, and OAuth/API behavior have not been verified on a development store. Existing-page search/edit and template selection are therefore unavailable; the route does not invent example Shopify records. The new-page editor is local-memory only and its Save Draft control is disabled. Local changes are not persisted to Shopify or browser storage.

Do not add metaobject entry read/write scopes, enable Save Draft, or report a connected builder until the owner authorizes the required scopes and Shopify entry operations are implemented and tested against the verified live Phase 2 schema. Do not copy commerce values such as prices, variants, inventory, availability, or checkout state into section configuration.

## Architecture

- Shopify's React Router app SDK owns embedded authentication, ID-token validation, token exchange, and webhook authentication. Protected loaders call `authenticate.admin` through `requireAdmin`; the app never accepts a client-provided shop as the source of authorization.
- `AppDistribution.SingleMerchant` configures this as a single-merchant custom app. The Shopify Admin API version is `2026-10`, shared with the Phase 2 manifest.
- PostgreSQL with Shopify's official Prisma session adapter stores online/offline sessions, including expiring offline refresh-token fields. The included migration adds only session, connection-status, and rate-limit tables; no storefront or Shopify content records.
- The Shopify app configuration requests only `read_metaobject_definitions` and `read_metafield_definitions`, needed by the read-only schema dashboard. The SDK-provided `SCOPES` value is consumed by the SDK and UI; there is no second hardcoded scope list. No product, order, customer, payment, file, or content-write scopes are requested.
- The app reads Phase 2 schema TypeScript from `src/shopify/cms/schema/` and synchronizes the modules into `app/generated/cms-schema/` before build, type-check, and tests. Do not edit the generated copies directly.
- Polaris web components (`s-page`, `s-section`, etc.) provide the UI; App Bridge's `ui-nav-menu` provides embedded navigation. The server-rendered document headers retain Shopify's frame policy and add nosniff, referrer, permissions, and production HTTPS HSTS headers.

## Requirements and local setup

Use Node.js `>=22.12.0` and a PostgreSQL database. Run these commands from `apps/shopify-admin` in PowerShell:

```powershell
npm install
Copy-Item .env.example .env
# Fill local credentials through Shopify CLI or your local secret manager.
# Set DATABASE_URL to a development PostgreSQL database.
npm run db:setup
npm run dev
```

Before `npm run dev`, link this directory to an authorized Shopify Dev Dashboard app with `npm run shopify -- app config link`, select a development store, and complete Shopify's prompts. The app ID, store identity, and secrets are intentionally not committed. Shopify CLI supplies `SCOPES` from `shopify.app.toml`; do not add another scope list to `.env`.

Other local checks:

```powershell
npm run typecheck
npm test
npm run build
npm start
```

`npm run db:setup` generates the Prisma client and applies the additive migrations. For a database that has already been provisioned, `npm run db:migrate` applies migrations only. Keep `DATABASE_URL` server-only; use TLS and a managed PostgreSQL service with encryption at rest, restricted network access, and protected backups for production.

## Environment variables

The server-only `.env.example` contains placeholders for:

- `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`: supplied by Shopify CLI locally or a production secret manager.
- `SHOPIFY_APP_URL`: the HTTPS origin serving this app in production.
- `DATABASE_URL`: PostgreSQL connection string. Require TLS for production connections.
- `SCOPES`: supplied by Shopify CLI/app configuration at runtime; not manually maintained.

The API version is pinned in the app SDK and is read from the Phase 2 manifest; do not set a second version variable. The authenticated session provides the store domain; no `SHOPIFY_STORE_DOMAIN` is trusted. No variable uses the `VITE_` prefix. `.env` files are ignored.

## Shopify configuration and lifecycle

`shopify.app.toml` is the sole source of requested scopes and managed webhooks. It registers `app/uninstalled` and `app/scopes_update`. Both handlers use `authenticate.webhook`, which validates Shopify's request signature. Repeated lifecycle delivery is safe: the handler removes the shop's sessions and cached connection/rate-limit rows, and never deletes Metaobjects or merchant content. A scope update invalidates old sessions so the app must reauthorize with the updated permissions.

This is a single-merchant custom distribution, not a public App Store listing. Therefore the App Store customer-data compliance webhook set is not added. Re-evaluate the distribution and Shopify's current policy before any future public listing.

The Shopify Dev Dashboard app record, actual application URL, app description, authorized organization, and development-store installation require owner access and are not created by this repository change. Do not run deployment or publish commands without explicit approval.

## Production deployment

Deploy this application separately from the Vercel storefront as a Node.js server/container with HTTPS and a persistent managed PostgreSQL database. Build in this directory with `npm ci` and `npm run build`; run `npm run db:migrate` as a controlled release step, then start with `npm start`. Configure the Shopify app URL and production secrets in the hosting platform. Preserve the existing Vercel project and root scripts.

`npm run shopify -- app deploy` publishes the Shopify app configuration/release through Shopify CLI; it does **not** host this Node server. Do not run it until the merchant approves and the Shopify app record, production URL, and deployment environment are ready.

## Manual development-store verification

Use a dedicated development store and test credentials only. Do not use production customer or order data.

1. Confirm the linked Dev Dashboard app is single-merchant, embedded, named `MYRKLS CMS`, and has the description above. Confirm the two configured schema-read scopes and lifecycle webhooks.
2. Start PostgreSQL, apply `npm run db:setup`, and run `npm run dev`. Complete Shopify's installation and authorize only the requested scopes.
3. Open and reopen the app from Shopify Admin. Confirm the displayed store domain is the authenticated `.myshopify.com` session's store; edit the `shop` query parameter to another domain and confirm access is rejected.
4. Check Dashboard and CMS Connection. Confirm the API version, session status, granted scopes, store details, and safe connection errors. Inspect the browser bundle/network responses to confirm no access token, refresh token, API secret, or session data is returned.
5. Open Schema Status. Confirm it reads all pages of live definitions, classifies differences, and performs no create/update/delete mutation. Compare results with the Phase 2 CLI preflight; neither view should claim a definition exists without a Shopify response.
6. Restart the app server and confirm sessions restore from PostgreSQL. Reauthorize after a scope update and confirm old sessions are invalidated. Uninstall the app and confirm sessions and app-only status rows are cleaned up while merchant Metaobjects and Metafields remain unchanged; reinstall and verify a new session.
7. Deliver a valid signed uninstall/scope-update webhook and then replay it; both should return success. Send a request with an invalid signature and confirm it is rejected and performs no cleanup.
8. Confirm no cart, checkout, customer-account, product, collection, SEO, routing, analytics, or Vercel behavior changed in the storefront.

Automated tests mock Shopify SDK/API boundaries and contain no real credentials. Manual OAuth, embedded browser, PostgreSQL persistence, and actual Shopify webhook verification remain pending until an authorized development store and app record are linked.
