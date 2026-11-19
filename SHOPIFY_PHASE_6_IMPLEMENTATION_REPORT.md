# Shopify Phase 6 Implementation Report

**Status:** Implementation complete; production/customer acceptance is **blocked pending Shopify Customer Account configuration and live verification**.

## Summary

Implemented a Shopify Customer Account API integration in the existing React/Vite storefront. Customer sign-in uses Shopify's public OAuth authorization-code flow with PKCE. The storefront validates OAuth state, nonce and the ID-token signature/issuer/audience/expiry using Shopify's discovered JWKS. Access and ID tokens are kept in memory; no customer token or order/address copy is written to localStorage.

The account experience reads the authenticated Shopify customer profile, paginated order history, order details and tracking information. It supports updating first and last name, and creating, editing, making default and deleting non-default saved addresses through authenticated Customer Account API mutations. Email and phone remain read-only because the Customer Account API's `CustomerUpdateInput` only permits first/last-name updates.

The previous demo account UI and fictional default customer are no longer used. Existing legacy demo identity and saved checkout-profile keys are removed on startup. The independent wishlist remains unchanged.

## Files created

- `src/shopify/customer-account/auth.ts` — Shopify endpoint discovery, PKCE authorization, callback processing, ID-token verification, silent session restoration and logout.
- `src/shopify/customer-account/service.ts` — Typed Customer Account GraphQL requests and profile, order, tracking and address/name mappings/mutations.
- `src/shopify/customer-account/types.ts` — Customer Account configuration, profile, order, address and input models.
- `src/context/ShopifyCustomerAccountContext.tsx` — In-memory auth/session state and authenticated account actions.
- `src/components/account/ShopifyCustomerAccountPage.tsx` — Account sign-in, profile, order list/detail/tracking and address-management UI.
- `scripts/verify_customer_account.cjs` — Focused mocked tests for OAuth PKCE/state/signature validation and Customer Account API mappings.
- `SHOPIFY_PHASE_6_IMPLEMENTATION_REPORT.md` — This report.

## Files modified

- `src/App.tsx` — Added the Customer Account provider and routed the account view to the Shopify-backed account page.
- `src/components/MyrklsHeader.tsx` — Replaced demo-login modal behavior with account navigation and Shopify authentication state.
- `src/context/MyrklsAuthContext.tsx` — Removed demo customer initialization/persistence and legacy saved-profile persistence; retained wishlist behavior.
- `package.json` — Added the focused Customer Account test to `npm run test:shopify`.
- `SHOPIFY_ENVIRONMENT_VARIABLES.md` — Documented the Customer Account variables and token handling.
- `SHOPIFY_API_ARCHITECTURE.md` — Documented the implemented account modules and API boundary.
- `SHOPIFY_SECURITY_PLAN.md` — Recorded the implemented authentication protections and remaining Shopify setup.

## Shopify behavior implemented

- Uses the store's `/.well-known/openid-configuration` and `/.well-known/customer-account-api` discovery documents; discovered endpoints must use HTTPS.
- Uses the public Customer Account client with authorization code + PKCE (`S256`), unpredictable state and nonce.
- Validates the ID token with discovered JWKS and verifies signature, issuer, audience, expiry and nonce.
- Requires a same-origin HTTPS storefront redirect URI (Shopify does not allow HTTP/localhost callback URLs). Explicit sign-in requests Shopify login; reload restoration uses `prompt=none` only after a prior session marker.
- Does not assume or implement refresh-token support. The access token is memory-only and expiry requires a new sign-in.
- Requests customer profile and addresses through the authenticated `customer` root. Address writes are scoped to that customer.
- Paginates order history with Shopify cursors. Order detail lookup is scoped through the authenticated customer's order connection; browser-provided IDs are validated as Shopify Order GIDs.
- Uses Shopify-provided prices, order-status links, line-item images and fulfillment tracking. External order/tracking links and image URLs must be HTTPS.
- Does not use Admin GraphQL, create orders, add payment processing, or persist customer/order/address records.

## Environment variables

Required in local/Vercel frontend configuration:

- `VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` — public Shopify OAuth client ID.
- `VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI` — exact HTTPS callback URL registered in Shopify and on the current storefront origin.
- `VITE_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_DOMAIN` — optional when `VITE_SHOPIFY_STORE_DOMAIN` is already configured; canonical `*.myshopify.com` hostname.
- `VITE_SHOPIFY_API_VERSION` — existing approved API version, `2026-10`.

The local `.env.local` variable-name check found no Customer Account client ID, shop-domain override or redirect URI. Values were not printed. The existing `.env.example` was not modified. No API token, client secret or real credential was added to source.

## Shopify Admin actions still required

1. Enable the merchant-approved Shopify Customer Accounts experience for the store.
2. Register/configure a public OAuth client for the storefront and provide its public client ID.
3. Register exact callback and logout return URLs for Development, each Preview origin and Production. The callback origin must match the storefront origin.
4. Configure the storefront origin and Customer Account API access for the app/client.
5. Request/approve the required protected customer data access and Customer Account API capabilities:
   - `customer_read_customers` for profile/address reads.
   - `customer_read_orders` for order history/details/tracking.
   - `customer_write_customers` for name and address mutations.
6. Configure `VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` and `VITE_SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI` in `.env.local` and Vercel environments. Set the optional `VITE_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_DOMAIN` only if the existing Storefront domain is not the correct Customer Account shop domain. Use distinct development/preview/production callback registrations and approved stores.
7. Test only with an authorized development customer and development-store orders/addresses. Do not use production customer data for setup verification.

The exact app/client setup UI and permission approval are owner-controlled. The required values must be entered in local/Vercel settings; do not send private credentials in chat.

## Verification

- `npm run build` — **PASS** (TypeScript strict build and Vite production bundle). Existing Vite warning remains: the main JavaScript chunk is slightly over the 500 kB advisory threshold.
- `npm run test:shopify` — **PASS** for the existing Storefront and cart checks and the new Customer Account tests.
- Customer Account automated checks cover:
  - Public OAuth client with PKCE `S256`, state and no client secret.
  - Rejection of callback state mismatch and removal of transient callback data.
  - Successful code exchange and ID-token signature/claim validation using a generated test key.
  - Customer-scoped order pagination, detail lookup, image/tracking mapping and rejection of malformed order IDs.
  - Profile/default-address mapping and name/address mutation request fields.
  - Surfacing Customer Account GraphQL errors.
- Local `.env.local` check — **PASS**: checked the presence of variable names only; required Customer Account client configuration is missing.
- Browser smoke test at `/#account` without Customer Account credentials — **PASS**: the account route renders the explicit setup-required state rather than demo data. Mobile viewport check at 390 px found no horizontal overflow; no JavaScript/console errors occurred during the check. The browser reported an unused hero-image preload warning from existing page markup.
- Live Customer Account sign-in, customer profile/orders/addresses and mutations — **NOT TESTED** because the public OAuth client ID, callback URI and Shopify Admin permissions are not configured.
- No production order, payment or customer mutation was attempted.
- Authenticated-browser order/address interaction and responsive verification — **PENDING** Admin setup and authorized test data.

## Known issues and acceptance blockers

- Live Customer Account discovery, OAuth callback exchange and GraphQL permissions have not been verified for this store/client.
- Shopify Customer Account API access and protected customer data approval are owner-controlled and may require review.
- Shopify-hosted account logout behavior depends on the store's discovered logout endpoint and registered post-logout redirect.
- Email and phone are displayed read-only because the documented `CustomerUpdateInput` permits only first and last name.
- The legacy `MyrklsAccountDashboard.tsx` and `MyrklsAuthModal.tsx` files remain in the source tree but are no longer used by the app's account route/header. Their former demo identity is not initialized or persisted by the active auth provider.

## Phase 7 boundary

This phase does not implement Shopify webhooks, order creation/mutation, fulfillment, payment, Razorpay or Admin API calls. Do not proceed to those features until Phase 6 Admin setup and live account testing are approved.
