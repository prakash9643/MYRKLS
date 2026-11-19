# Shopify Security Plan

**Status:** Phase 6 public Customer Account OAuth/PKCE and authenticated browser API calls are implemented. Admin functions/webhooks are not implemented. Customer Account client registration, permissions and live verification remain pending.

## 1. Security boundaries

```text
Browser / Vercel static React
  ├─ Public Storefront token: allowed, scoped, observable
  └─ Customer Account public OAuth client: PKCE, no client secret

Vercel server functions
  ├─ Shopify Admin API token: private
  ├─ Shopify app secret for webhook HMAC: private
  ├─ Authenticated, minimal Admin operations only
  └─ Webhook signature/idempotency and redacted logs

Shopify
  └─ Products, inventory, customers, orders, checkout remain authoritative
```

The browser must never call Admin GraphQL. It must not receive Admin access tokens, private Storefront tokens, Shopify app secrets, webhook HMAC keys or server session secrets. `VITE_*` means public and must never contain a secret.

## 2. Credentials and least privilege

- Keep separate Development/Preview/Production credentials and Shopify stores.
- Use a public Storefront token in the browser only; its visibility is expected, so restrict its scopes and rotate/revoke if abused.
- Keep Admin credentials in Vercel server-only environment settings. Request minimum scopes for implemented server functions, not all scopes mentioned in future plans.
- Avoid customer/order Admin scopes when Customer Account API or webhook payloads suffice. Do not request write orders/products/inventory/fulfillment/payment scopes unless a separately approved business operation demonstrably requires them.
- Do not store Shopify customer/order/inventory copies. Any webhook dedupe ledger contains delivery identifiers/status only, not a shadow commerce database.
- Review access periodically; revoke unused tokens and remove preview deployments/credentials after testing.

## 3. Secure Admin GraphQL operations

If implemented, each Vercel function must:

1. Authenticate and authorize its caller; Admin credentials are never a substitute for caller auth.
2. Validate request method, content type, size, input schema, resource ownership and allowed operation.
3. Use server-side fixed GraphQL documents or strict operation allowlists. Do not accept arbitrary client-supplied GraphQL text.
4. Call only the pinned Admin GraphQL endpoint (`2026-10`) and only the minimum fields needed.
5. Handle HTTP errors, GraphQL `errors`, mutation `userErrors`, rate limits and timeouts explicitly.
6. Redact access tokens, cookies, HMAC headers, personal information and payment data from logs/traces.
7. Return minimal, typed public responses; never echo raw Admin responses by default.
8. Apply same-origin/CSRF protections appropriate to cookie-authenticated mutations and rate limiting to public endpoints.

No public product/content read requires the Admin API; prefer Storefront API for those reads.

## 4. Customer Account API security

- Use the public OAuth authorization-code flow with PKCE for the SPA; no client secret is embedded.
- Validate unpredictable OAuth `state`, nonce and PKCE verifier/challenge; verify ID-token signature using discovered JWKS and check issuer, audience/authorized party and expiry. Require a same-origin HTTPS callback URI and validate callback errors.
- Use Shopify discovery metadata for authorization/token/API endpoints.
- Request only approved Customer Account scopes. Do not use legacy customer-password auth.
- Never log authorization codes, access tokens, cookies or profile/order payloads. Avoid third-party analytics on callback pages.
- Do not put customer credentials/tokens in the existing `localStorage` profile model. Access and ID tokens remain in memory; `sessionStorage` is limited to transient OAuth PKCE state and a non-secret session-restoration marker.
- Clear local legacy demo customer/address/order storage; keep the wishlist separate from customer/order data.
- Clear in-memory/session state on logout and handle expired/invalid tokens explicitly. No refresh-token flow is assumed.
- The SPA uses only authenticated Customer Account API operations and does not expose Admin API credentials. Shopify Admin must approve customer/profile read and name/address write, order read permissions, and protected customer data access.

## 5. Webhook signature verification

Subscribe only to the required topics after the account owner approves them:

- `orders/create` for a specific external operational side effect, not to copy orders into a duplicate database.
- `products/update` only if a real downstream cache/reindexing action exists.
- `inventory_levels/update` only if a real downstream action exists.

For each HTTPS delivery:

1. Receive the **raw unparsed request body** and relevant Shopify headers before JSON middleware mutates the body.
2. Read `X-Shopify-Hmac-SHA256`. Compute HMAC-SHA256 over the exact raw body using the Shopify app client secret, base64 encode, and compare in constant time. Reject malformed or mismatched signatures before parsing/trusting payload fields.
3. Validate topic, shop domain and expected endpoint configuration; never trust a body-supplied shop identifier alone.
4. Read `X-Shopify-Webhook-Id` for delivery deduplication. Use `X-Shopify-Event-Id` only for correlation because separate subscriptions can produce distinct delivery IDs for one merchant event.
5. Atomically claim the delivery ID in a durable, TTL-capable store before scheduling side effects. An in-memory Vercel instance variable is not persistent and does not provide idempotency.
6. If already processed, return success without repeating the side effect. If in progress, respond according to the retry/queue contract rather than duplicating work.
7. Acknowledge valid deliveries quickly (Shopify expects a 200 response; HTTPS webhook processing has short timeouts), then queue slow work. Persist enough event status for retry/reconciliation without persisting duplicate orders/customers.
8. Log delivery ID, topic, shop and result only; redact body, PII and signature. Alert on repeated failures and reconcile missed events from Shopify if downstream side effects require it.

Account owner must approve the durable idempotency/queue provider and its retention. If no downstream work requires webhooks, do not configure or deploy them merely for completeness.

## 6. Vercel endpoint protections

- Expose one narrowly routed webhook endpoint and separate authenticated Admin endpoints.
- Webhook endpoint is unauthenticated at HTTP level by design but must require valid Shopify HMAC; no permissive CORS is needed.
- Apply body-size limits and content-type checks before expensive processing.
- Return 401/400 for invalid signature/schema, 200 for confirmed duplicate/accepted event, and a retryable failure for transient queue/storage errors.
- Ensure Vercel rewrites do not route `/api/*` to `index.html`.
- Avoid logging raw requests in Vercel function logs or error monitoring.
- Protect internal Admin endpoints with real authentication/authorization, rate limits and CSRF controls where applicable; never expose a generic Admin GraphQL proxy.

## 7. Content safety and storefront resilience

- Validate public Metaobject data against strict TypeScript/runtime schemas.
- Render only a local allowlist of `component_type`; unknown types are omitted and reported safely.
- Render Shopify rich-text values with a safe structured renderer; never use arbitrary `dangerouslySetInnerHTML` from CMS text.
- Allow only approved internal relative links or HTTPS CTA URLs; reject `javascript:`, `data:` and unexpected schemes.
- Limit nesting/reference depth and number of records to avoid excessive API queries or rendering.
- Escape text by default and treat external media/URLs as untrusted inputs.
- Do not use client-provided totals, product prices, discounts, inventory or checkout state as authoritative; Shopify's cart/checkout is authoritative.

## 8. Secret incident response

If a token/secret is exposed:

1. Revoke/rotate it in Shopify Admin/Dev Dashboard and update the affected Vercel environments.
2. Redeploy and invalidate leaked build artifacts/caches.
3. Review Shopify app access, webhook deliveries, Vercel logs and unusual API activity.
4. Remove committed credentials from repository history using the organization's approved incident process; deleting a file alone does not revoke a token.
5. Notify the account owner and follow applicable privacy/security incident obligations.

## References

- [Shopify webhook verification](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries)
- [Shopify API authentication](https://shopify.dev/docs/api/usage/authentication)
- [Shopify access scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Customer Account API 2026-10](https://shopify.dev/docs/api/customer/2026-10)
- [Vercel Functions](https://vercel.com/docs/functions)
