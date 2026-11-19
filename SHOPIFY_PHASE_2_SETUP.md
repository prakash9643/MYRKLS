# Shopify Phase 2 — Development Store and Integration Setup

**Status:** Planning guide only. This document does not create Shopify resources or change the application.  
**Verified against:** the repository audited in `SHOPIFY_MIGRATION_AUDIT.md`, November 4, 2026.

## 1. Decisions fixed for this plan

- Keep the React 18 + Vite + strict TypeScript storefront on Vercel.
- Keep the existing components, styles, animations, and brand assets.
- Use Shopify Storefront API for catalog, search, cart and checkout handoff.
- Use Shopify Metaobjects/Metafields for editable content and Shopify Files for CMS media.
- Use Shopify Customer Account API for real customer authentication and account data.
- Restrict Admin GraphQL API access to server-side Vercel functions.
- Use Shopify-hosted checkout. Razorpay can be used there only after confirming the official Shopify provider is available and eligible for this merchant/store.
- Keep Shopify as the sole commerce record for products, inventory, customers and orders.
- Preserve existing customer-facing URLs where possible; route compatibility is specified in `SHOPIFY_ROUTING_AND_SEO_PLAN.md`.
- Do not assume Shopify Payments is available to an Indian merchant.

## 2. Repository verification and account-owner approvals

The source-file inventory is documented in `SHOPIFY_API_ARCHITECTURE.md`. All 40 paths under `src/` listed there were confirmed to exist. The root currently has no `vercel.json`, `.env*`, Shopify config, or backend directory.

The user reports an existing Razorpay integration, but an exhaustive workspace search found no Razorpay SDK, endpoint, key, or configuration. The checkout UI currently contains demo payment inputs and a completion message that says no payment/order was made. This plan does not remove or replace it. The account owner should identify the current Razorpay installation/configuration outside this repository and verify whether it can be enabled as the Shopify checkout payment provider. Do not treat the current React checkout as a working gateway.

The Shopify account owner must approve:

1. Development-store creation/access, store domain, ownership, staff roles and app ownership.
2. Creation/installation of the custom app or Headless channel, API scopes, webhook subscriptions and credential rotation.
3. Storefront token creation and the store domain/API version used by each Vercel environment.
4. Customer Account API setup, app client ID, allowed callback/logout URLs, and the customer-account host/domain.
5. Publication and Storefront read access for Metaobject definitions/entries and Shopify Files media.
6. Market, base currency, local currency behavior, INR display/checkout and domain/language setup.
7. Tax registrations, GST settings, product tax categories/HSN data, tax-inclusive display, and shipping-tax handling. Consult the merchant's tax adviser.
8. Shipping zones/rates, fulfillment origins, delivery promises and free-shipping thresholds.
9. Razorpay provider availability, merchant eligibility/KYC, fees, test/production activation and any required Shopify/provider support approval.
10. COD availability, serviceable areas, order limits, COD fees, fraud controls and return handling.
11. Whether existing public product/collection handles can be preserved exactly and whether any historic redirect list exists.
12. Whether product/collection pages require SSR or a pre-rendering investment for search/social crawlers.
13. Selection and approval of durable storage for webhook delivery idempotency if webhook side effects are required.

## 3. Development store checklist

1. In the merchant's Shopify organization or Shopify Partner account, create a **development/test store**. Do not point the development frontend at the production store.
2. Use a clearly named store, such as `myrkls-dev`, and record its canonical `*.myshopify.com` domain in the team's password manager/Vercel project settings. Do not put credentials in this document or source control.
3. Populate it with test products, variants, product images, inventory, collections, discounts, pages, and representative Metaobject entries. Preserve the existing seven product names/IDs only as migration fixtures; Shopify remains authoritative after cutover.
4. Configure test shipping zones/rates and tax behavior. Use the store's test payment mode/provider tools where available. Never submit production customer/payment data or create real orders as a setup test.
5. Create separate Vercel **Development**, **Preview**, and **Production** environment values. Preview must point to a development/test Shopify store unless the account owner expressly approves otherwise.
6. Keep a reproducible checklist of Storefront token, Customer Account callback, webhook, and checkout tests. Remove test credentials before launch.

## 4. Storefront API access

1. Add Shopify's Headless sales channel in the development store when available, or create/configure the approved custom app and its Storefront API access through Shopify Admin/Dev Dashboard.
2. Create a **public Storefront API access token** for calls made by the browser. Public tokens are intentionally visible to storefront visitors; they are not Admin credentials. Restrict its Storefront API permissions to required public reads and cart operations.
3. Do not use a private Storefront token in Vite/client code. If a later server-side Storefront call needs a private token, keep it in Vercel server-only environment variables and forward buyer IP as Shopify requires.
4. Request only the least-privilege unauthenticated Storefront access needed. Confirm the current required scope list in Shopify's Admin UI/docs when creating the token; scope names and access behavior are API/app-version-specific.
5. Use the versioned endpoint:

   ```text
   https://{store-domain}/api/2026-10/graphql.json
   ```

   Send the public token in `X-Shopify-Storefront-Access-Token`. The exact endpoint and access mode must be confirmed against the store's issued token.
6. Expose only the public store domain, public token, API version and Customer Account client configuration through `VITE_` variables. See `SHOPIFY_ENVIRONMENT_VARIABLES.md`.
7. Test product, collection, product search, variants, availability, cart creation/mutation, discount codes, cart totals, and hosted-checkout URL using development data.

## 5. Customer Account API

1. Enable/configure Shopify's customer accounts for the development store. Use the **Customer Account API**, not the legacy Storefront customer-password token flow.
2. Register the storefront as an approved public OAuth client and record its client ID. A public client uses authorization-code flow with PKCE; it has no client secret in the browser.
3. Register exact Vercel local-development, preview and production callback/redirect URIs in Shopify. Register logout/return URLs as required by the configured account experience. Wildcard preview URLs should not be assumed to be accepted.
4. Use Shopify's discovery endpoints to obtain the authorization, token, logout and GraphQL endpoints. Do not hardcode a guessed account API host.
5. Request only the customer account scopes needed for the features actually retained (for example, authenticated profile, address and order access). Reconfirm scope values during app setup.
6. Test sign-in, callback state validation, PKCE verifier handling, sign-out, token expiry, account profile, address and order access using test customers.
7. Do not seed or expose the demo customer in a real environment. Do not create another customer/order database.

## 6. Custom app and Admin GraphQL API

1. The Shopify account owner creates and installs the approved custom app for the intended store. The exact creation flow may be through Shopify Dev Dashboard or Admin depending on current account/app settings.
2. Keep the Admin API access token on Vercel server functions only. Vite's `VITE_` prefix is forbidden for all Admin credentials, app secrets and webhook HMAC secrets.
3. Apply the smallest scopes required by actual backend features:
   - Product update webhook/reconciliation: `read_products` only if the backend needs protected product data or follow-up Admin queries.
   - Inventory update webhook/reconciliation: `read_inventory`, plus `read_locations` only if location data is queried.
   - Admin-side content management: `read_metaobjects` and `write_metaobjects` only if backend code manages entries; add definition-write permissions only if definitions are intentionally managed by this app.
   - Programmatic webhook registration: `write_webhooks` only if the app creates subscriptions through Admin GraphQL. Admin-managed/declarative registration may avoid this scope.
   - `read_orders` only if a server operation must fetch orders beyond the webhook payload; request the extra older-order scope only if there is a concrete need and approval.
   - Do not request customer, order-write, product-write, inventory-write, payment, or fulfillment scopes by default.
4. Shopify Admin UI and store-owner workflows can be used to manage products/content without granting the storefront integration write scopes.
5. Use the same pinned `2026-10` GraphQL Admin API version for server calls during this cycle. Revisit version and schema compatibility before its support deadline.

## 7. Shopify Metaobjects and Files

1. Create the definitions and field validations in `SHOPIFY_METAOBJECT_SCHEMA.md`, preferably in the development store first.
2. Set Storefront access to **read-only/public read** only on definitions intended to render publicly. Never expose private customer, operational, draft-only, or unpublished data through Storefront API.
3. Publish test entries and verify Storefront queries can read only published, storefront-accessible records.
4. Upload CMS-managed images/media to Shopify Files; populate file references and meaningful alt text. Keep current `public/` assets until each component's Shopify-managed replacement is tested.
5. Create one homepage registry with explicit order and visibility; validate its type values against the approved component registry in React. Shopify content supplies structured data, never executable code.

## 8. Shopify Markets, INR, shipping and taxes

1. Confirm the store's legal country, base currency, business address and tax registrations with the account owner.
2. Configure India as the intended market and verify the store supports INR display and INR checkout with the chosen payment provider and selling plan. Do not infer settlement currency from display currency.
3. Validate rounding, compare-at prices, discount application, refunds, invoices and provider settlement in a development checkout. The Cart API's returned amounts and Shopify checkout are authoritative.
4. Configure Indian shipping zones and rates, remote-area rules, serviceability, dispatch/fulfillment locations, free-shipping rules and delivery estimates.
5. Configure taxes only after confirming GST registrations, applicable rates, product tax categories/HSN classification and tax-inclusive/exclusive pricing policy with the merchant's tax adviser.
6. Verify tax and shipping totals in Shopify checkout; React must not calculate the payable order total.

## 9. Razorpay and COD

1. In Shopify Admin, open **Settings → Payments** and check whether Razorpay is offered for this store's country, plan, account and business category. Provider availability and eligibility are account-specific.
2. The account owner must complete Razorpay's merchant onboarding/KYC and activate the official Shopify payment provider using provider-issued configuration. Never embed Razorpay secret keys or create a separate client-side payment flow for Shopify orders.
3. Use the provider's test mode/test credentials for development if offered. Confirm whether the provider is direct or external checkout and verify the complete Shopify-hosted checkout flow, refunds, cancellations, settlements, fees and order payment status.
4. Do not assume Shopify Payments is available. If Razorpay is unavailable, stop and have the account owner choose an eligible Shopify-supported provider before commerce cutover.
5. Configure COD as a Shopify manual payment method only after the merchant approves serviceability, limits, fees and operational handling. Verify COD orders remain Shopify orders and are not marked paid prematurely.
6. Phase 2 does not modify or replace the alleged existing Razorpay setup. Repository evidence does not show one; reconcile the Admin-side provider state before implementation or testing.

## 10. Verification and hand-off

- [ ] Development store is separate from production.
- [ ] Public Storefront token is issued with minimum access; no private token is in the browser.
- [ ] API version is explicitly pinned to `2026-10`.
- [ ] Customer Account public client and redirect URIs are configured.
- [ ] Metaobject definitions are created, validated, and public-read only where needed.
- [ ] Vercel environments are isolated and secrets are set in Vercel, not committed.
- [ ] Markets/INR, shipping, tax and checkout have owner sign-off.
- [ ] Razorpay provider eligibility and COD have owner sign-off.
- [ ] No production order/payment was created as part of this phase.
- [ ] No existing UI/component was changed by this documentation phase.

## References

- [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning)
- [Storefront API](https://shopify.dev/docs/api/storefront/2026-10)
- [Storefront API access](https://shopify.dev/docs/api/storefront/latest#authentication)
- [Customer Account API](https://shopify.dev/docs/api/customer/2026-10)
- [Shopify API access scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Metaobjects](https://shopify.dev/docs/apps/build/metaobjects)
- [Shopify third-party payment providers](https://help.shopify.com/en/manual/payments/third-party-providers)
