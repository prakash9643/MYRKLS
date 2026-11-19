# Shopify Environment Variable Specification

**Status:** Storefront configuration is documented separately. The Phase 7 sitemap build reads the public Storefront domain/token to fetch published products and collections. Phase 6 Customer Account integration remains dependent on Shopify client configuration and live verification.

## 1. Rules

- Store secrets in Vercel Project → Settings → Environment Variables, not source files, commits, chat, or `index.html`.
- Vite exposes every `VITE_*` variable to client bundles. Only non-secret public configuration may use that prefix.
- An issued **public** Storefront access token is visible to storefront users by design; keep its scopes least-privilege and use only a public token in the React app.
- Never put an Admin API token, private Storefront token, Shopify app secret, webhook HMAC secret, or customer/session secret in a `VITE_*` variable.
- Use separate test/dev and production stores/tokens. Restrict Preview to the development store.
- Use the pinned `2026-10` API version, not `latest`.

## 2. Public frontend variables (`VITE_*`)

| Name | Example shape | Secret? | Required when | Notes |
|---|---|---:|---|---|
| `VITE_SHOPIFY_STORE_DOMAIN` | `myrkls-dev.myshopify.com` | No | Storefront API enabled | Shopify canonical `*.myshopify.com` domain only; validate hostname, no scheme/path |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Issued public Storefront token | **Public by design** | Browser Storefront calls enabled | Token is visible in built JS/network requests. Never use a private token here. |
| `VITE_SHOPIFY_API_VERSION` | `2026-10` | No | Storefront calls enabled | Optional; defaults to `2026-10`. Current client validates `YYYY-MM` format and permits an owner-configured version. Verify support and schema compatibility before changing the approved version. |
| `VITE_SITE_URL` | `https://myrkls.com` | No | Optional; sitemap build | Optional canonical origin. If set, it must be `https://myrkls.com`; the app defaults to that origin. Do not set a Preview URL as the production sitemap origin. |
| `VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Shopify-issued public app client ID | No | Customer Account API enabled | Required by the Phase 6 sign-in flow. Public OAuth client ID; no client secret in browser. |
| `VITE_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_DOMAIN` | `myrkls-dev.myshopify.com` | No | Customer Account OAuth enabled | Optional if `VITE_SHOPIFY_STORE_DOMAIN` is already set; must be the canonical `*.myshopify.com` hostname. Endpoints are always discovered, never inferred from this value. |
| `VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI` | `https://www.example.com/` | No | Customer Account OAuth enabled | Required. Shopify requires HTTPS (no localhost/HTTP exception); it must be same-origin as the storefront and exactly registered in the Customer Account app settings. Use an HTTPS tunnel for local OAuth development and register each Preview/Production origin. |

The exact variable names are proposed. Validate missing/invalid values at app startup and show a clear configuration error in development; do not silently substitute production credentials or a fake catalog.

The production build runs `scripts/generate_sitemap.mjs` after Vite. With valid public Storefront configuration, it fetches all published product and collection handles by cursor and writes the generated sitemap files under `dist/`. If the Storefront domain or public token is missing, the build emits a warning and publishes a static-page-only sitemap; it does not retain or fabricate product/collection URLs. If a configured Shopify request fails or returns invalid data, the build fails rather than publishing a stale catalog sitemap.

## 3. Private Vercel server-function variables

| Name | Example shape | Required when | Secret handling |
|---|---|---|---|
| `SHOPIFY_ADMIN_STORE_DOMAIN` | `myrkls-dev.myshopify.com` | Admin GraphQL function enabled | Non-secret, server-only variable |
| `SHOPIFY_ADMIN_API_VERSION` | `2026-10` | Admin GraphQL function enabled | Server-only; same approved pin |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Shopify-issued Admin token | Admin GraphQL function enabled | Secret; never return it in a response or log |
| `SHOPIFY_API_KEY` | Shopify app/client ID | App/webhook setup requires it | Generally an identifier, still server config; do not confuse with token |
| `SHOPIFY_API_SECRET_KEY` | Shopify app client secret | Webhook HMAC validation | Secret; use as HMAC key for Shopify deliveries per current docs |
| `SHOPIFY_WEBHOOK_IDEMPOTENCY_URL` | Approved durable store endpoint | Side-effecting webhook processing | Private connection string; only if an idempotency store is selected |
| `SHOPIFY_WEBHOOK_IDEMPOTENCY_TOKEN` | Provider-issued token | Side-effecting webhook processing | Secret; optional and provider-specific |
| `CUSTOMER_ACCOUNT_SESSION_SECRET` | Random high-entropy secret | Only if backend session/cookie signing is adopted | Secret; do not create/use unless the selected OAuth/session architecture needs it |

`SHOPIFY_API_SECRET_KEY` is the HMAC verification secret for HTTPS Shopify webhooks; do not create a second independently rotated `SHOPIFY_WEBHOOK_SECRET` containing a different value unless Shopify explicitly supplies a separate signing secret for the configured delivery mechanism.

If Admin API calls are not required by the first storefront release, do not set or deploy the Admin token yet. Use Shopify Admin UI for content/product setup and Storefront API for public reads.

## 4. Customer Account credentials and token handling

- Shopify Customer Account API public OAuth client ID and redirect URI are frontend configuration, not app secrets.
- The Phase 6 public-client flow uses authorization code + PKCE, validates unpredictable state, nonce and the ID-token signature/issuer/audience/expiry, and requires the redirect origin to match the current storefront.
- Do not invent a customer-account client secret for the browser.
- Discover the current authorization, token, logout and GraphQL endpoints using Shopify's configured discovery response; do not hardcode endpoint hosts from an example shop.
- The access token and validated ID token are held in memory only. `sessionStorage` stores only transient PKCE state/verifier/nonce during a redirect and a non-secret marker used to attempt Shopify-hosted silent session restoration after a reload; no refresh-token behavior is assumed.
- Shopify Admin must explicitly approve/configure the Customer Account API permissions needed for profile/address reads, address writes and order reads; never add Admin API credentials to the storefront.
- Never log access tokens or put them in analytics/error-reporting events.

## 5. Vercel environment separation

Configure variables separately for:

| Vercel environment | Shopify target | Notes |
|---|---|---|
| Development | Local/dev Shopify store | `.env.local` may be used locally but stays ignored; do not commit it |
| Preview | Dedicated Shopify development/test store | Use Vercel preview callback URLs registered in Shopify; avoid production data |
| Production | Merchant-approved production store | Enable only after owner approves scopes, provider, content and checkout |

Set private values only for the server runtime/functions that need them. Do not expose production Admin credentials to Preview. Rotate exposed/compromised values immediately and update all affected deployments.

## 6. Recommended non-secret project constants

Keep API version and allowed component types in reviewed TypeScript source or validated build settings. Do not allow arbitrary content to override endpoint hosts, request headers, allowed origins, or scopes. Vercel provides deployment metadata such as its deployment URL; treat those values as public and still register exact callback URLs.

## 7. Pre-deployment secret scan

- [ ] Search tracked files and built output for `shpat_`, Admin access tokens, app secrets, private Storefront tokens and session secrets.
- [ ] Confirm the only Shopify token in client output is the public Storefront token intended for browser use.
- [ ] Confirm no `VITE_SHOPIFY_ADMIN_*`, `VITE_*SECRET*`, or customer token variables exist.
- [ ] Confirm local `.env*` files are ignored and Vercel secrets are set per environment.
- [ ] Confirm errors/logs redact authorization headers, cookies, webhook bodies containing personal data and payment information.

## References

- [Shopify Storefront API token types](https://shopify.dev/docs/api/storefront/latest#authentication)
- [Shopify API authentication](https://shopify.dev/docs/api/usage/authentication)
- [Customer Account API 2026-10](https://shopify.dev/docs/api/customer/2026-10)
- [Shopify webhook verification](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
