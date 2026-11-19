# Shopify API and TypeScript Architecture

**Status:** Storefront catalog/cart, Shopify-hosted checkout handoff, Customer Account integration, and the Phase 7 canonical routing/client-side SEO/sitemap foundation are implemented. Product-specific metadata remains client-rendered; SSR/prerendering is still required for reliable initial crawler/social HTML. Shopify Metaobject definitions and published content entries remain unverified/unavailable. Payment-provider, COD, shipping, tax and order configuration still require authorized Shopify Admin verification. No Admin API, payment processing or order mutation implementation is included.

## 1. Existing project facts and exact file mapping

At the Phase 1 audit baseline, the repository was React 18 + Vite 5 + strict TypeScript, hosted on Vercel by user confirmation, without a router, Shopify service/client, serverless API directory or `vercel.json`. The 40 source paths below were checked against that baseline. The `public/` directory contains 317 existing assets; keep them while migrating selected editable media to Shopify Files.

| Existing file | Verified current role | Proposed integration point |
|---|---|---|
| `src/main.tsx` | React root and global CSS | Keep; initialize providers only when implemented |
| `src/App.tsx` | Query/hash view parsing and page composition | Keep UI composition; canonical pathname parsing and legacy alias resolution are implemented |
| `src/index.css` | Tailwind directives and global/Lenis styles | Keep unchanged |
| `src/types/index.ts` | Existing product, cart, customer, order and view types | Add Shopify/domain types in proposed integration modules; retire demo types as flows migrate |
| `src/data/products.ts` | Hardcoded catalog, product metadata, search keywords and hero configs | Stop using as commerce source after products integration |
| `src/context/MyrklsCartContext.tsx` | LocalStorage cart and local subtotal | Replace internals with Shopify cart operations and cart ID |
| `src/context/MyrklsAuthContext.tsx` | Demo identity, local addresses/orders/wishlist | Replace real account data/auth with Customer Account API; no duplicate orders/customers |
| `src/components/MyrklsHeader.tsx` | Header/menu, static categories, account/search/cart controls | Preserve component; read config and collections from Shopify |
| `src/components/MyrklsHero.tsx` | Animated static hero carousel | Preserve animation; load hero-banner Metaobjects |
| `src/components/MyrklsProductGrid.tsx` | Homepage cards, local wishlist, add-to-cart | Storefront product/collection data and cart service |
| `src/components/MyrklsScienceSection.tsx` | Static home science section | Homepage-section Metaobject |
| `src/components/MyrklsFeaturedInnovation.tsx` | Static innovation section | Homepage-section/Metaobject data |
| `src/components/MyrklsGlobalScienceNetwork.tsx` | Static network section/diagram | Structured content while retaining diagram presentation |
| `src/components/MyrklsFeaturedProtection.tsx` | Static protection promotion/product | Shopify product plus section content |
| `src/components/MyrklsFAQ.tsx` | Static homepage FAQ | FAQ Metaobjects |
| `src/components/MyrklsReviews.tsx` | Static testimonials/reviews | Testimonial Metaobjects or approved reviews provider |
| `src/components/MyrklsFooter.tsx` | Footer navigation/content | Footer/global settings Metaobjects |
| `src/components/MyrklsCartDrawer.tsx` | Cart drawer and local totals | Keep design; Shopify cart lines/totals/checkout URL |
| `src/components/MyrklsSearchModal.tsx` | Local keyword/product search | Storefront search service |
| `src/components/MyrklsAuthModal.tsx` | Simulated email/phone/OTP/social auth | Replace with Customer Account OAuth/PKCE flow |
| `src/components/MyrklsViewAllPage.tsx` | Local collection/product filtering and quick view | Storefront collection/search/filter/sort/pagination |
| `src/components/MyrklsSEO.tsx` | Client-side metadata and structured data | Shopify-sourced route metadata implemented; SSR/prerender still required for initial HTML |
| `src/components/MyrklsAboutUsPage.tsx` | Static brand-story page | Shopify page/brand-story content |
| `src/components/MyrklsContactUsPage.tsx` | Static contact page; local inquiry storage | Page content; any submissions through secure backend/support provider |
| `src/components/MyrklsOurSciencePage.tsx` | Static science page | Shopify page/Metaobject |
| `src/components/MyrklsPrivacyPolicyPage.tsx` | Static privacy page | Content migration subject to legal approval |
| `src/components/MyrklsReturnsRefundsPage.tsx` | Static returns page/FAQ | Shopify page/FAQ content subject to policy approval |
| `src/components/MyrklsShippingPolicyPage.tsx` | Static shipping page/FAQ | Shopify page/FAQ content subject to policy approval |
| `src/components/MyrklsTermsPage.tsx` | Static terms page | Content migration subject to legal approval |
| `src/components/SmoothScroll.tsx` | Lenis wrapper | Keep unchanged |
| `src/components/account/MyrklsAccountDashboard.tsx` | Local account, address and demo order UI | Shopify Customer Account API data; preserve/adjust UI after audit |
| `src/components/checkout/MyrklsCheckoutPage.tsx` | Local checkout form and simulated submission | Shopify-hosted checkout handoff; do not collect card data in React |
| `src/components/pdp/MyrklsProductDetailPage.tsx` | PDP section composition/local product lookup | Storefront product/variant resolver |
| `src/components/pdp/MyrklsProductFaqSection.tsx` | Static PDP FAQ map | Product-linked FAQs |
| `src/components/pdp/MyrklsProductHeroSection.tsx` | Product gallery/variant/cart actions | Storefront product/variant/media and cart |
| `src/components/pdp/MyrklsProductHowToUseSection.tsx` | Static ritual/how-to content | Product Metafields/Metaobjects |
| `src/components/pdp/MyrklsProductReelsSection.tsx` | Static product media/reels | Shopify Files and product media content |
| `src/components/pdp/MyrklsProductReviewSection.tsx` | Static product review data | Approved review provider or clearly labeled editorial testimonial content |
| `src/components/pdp/MyrklsProductSection2.tsx` | Static ingredient/science content | Product Metafields/Metaobjects |
| `src/components/pdp/MyrklsProductSection3.tsx` | Static recommendations | Storefront recommendations/collection configuration |
| `package.json` | Scripts/dependencies; no Shopify dependencies | Keep; add only after implementation choice requires a dependency |
| `vite.config.ts` | Vite React build and chunk config | Keep; public env consumed at build time |
| `index.html` | Baseline SEO, Organization/WebSite JSON-LD, preload/fonts | Preserve baseline; do not rely on it for per-product SEO |
| `tailwind.config.js` | Existing design tokens | Keep unchanged |
| `postcss.config.js` | Tailwind/Autoprefixer | Keep unchanged |
| `tsconfig.json` | Strict app TS config | Preserve strictness |
| `tsconfig.node.json` | Node-side TS config | Reuse/extend for Vercel functions only if appropriate |
| `.gitignore` | Generated/dependency exclusions | Ensure env secrets/server outputs remain ignored |
| `scripts/verify_flows.cjs` | Puppeteer browser flows; hardcoded macOS Chrome path | Update in a later implementation phase for Shopify dev flows and configurable browser |
| `public/` | Existing public visual assets (317 files) | Retain and migrate editable media incrementally |

Repository verification found no `vercel.json`, `.env*`, `api/`, Shopify client/config, or Razorpay SDK/integration/config. Razorpay appears only as generic payment-gateway text in policy copy. The user reports an existing Razorpay gateway; its Admin/provider configuration is not represented in this checkout and needs owner verification.

## 2. Version selection

Pin **Shopify API version `2026-10`** for Storefront, Admin GraphQL and Customer Account GraphQL calls where a versioned endpoint applies. Shopify's official versioning page lists `2026-10` as latest stable on November 4, 2026, supported through October 16, 2027. Do not use `/latest`, `/unstable`, or a floating API version in application requests.

Check Shopify's version table and changelog at each quarterly upgrade; test the next stable version before changing the pin. API support dates are not a guarantee of application compatibility.

## 3. Source layout and Phase 3 implementation

The Phase 3 implementation follows the real repository structure:

```text
src/
  shopify/
    config.ts
    errors.ts
    graphql-client.ts
    presentation.ts
    types.ts
    use-shopify-query.ts
    queries/
      catalog.ts
      metaobjects.ts
    services/
      shared.ts
      products.ts
      collections.ts
      search.ts
      metaobjects.ts
  components/
    ShopifyQueryNotice.tsx
    ShopifySearchResults.tsx
    MyrklsShopifyCatalogPage.tsx
  vite-env.d.ts
```

`.env.example` contains blank public Storefront domain/token placeholders and defaults `VITE_SHOPIFY_API_VERSION` to `2026-10`. The API version remains configurable and is validated for `YYYY-MM` format; it is not restricted to that one version in code. The actual existing pages conditionally use Shopify when the public configuration is valid, and retain legacy product UI when configuration is absent. If configured requests fail, the UI shows an explicit error instead of presenting local demo data as Shopify results.

The following existing surfaces are connected where safe: homepage product grid, catalog/view-all, search modal, and product detail by handle. Shopify product detail is read-only in this phase. Metaobject services are available but not connected to homepage sections pending owner configuration of definitions, storefront access and published entries.

The remaining proposed architecture layout is:

```text
src/
  shopify/
    config.ts                 # Validated public storefront/account configuration
    graphql-client.ts         # Typed fetch, HTTP/GraphQL errors, abort handling
    errors.ts                 # ShopifyApiError, GraphQL error data, safe messages
    types.ts                  # Shared Storefront/domain response types
    queries/
      catalog.ts              # Implemented products, collections and search documents
      cart.ts
      metaobjects.ts
      pages.ts
    services/
      products.ts             # Implemented product and variant mappers
      collections.ts          # Implemented collection services
      search.ts               # Implemented Storefront product search
      metaobjects.ts          # Implemented public read-only Metaobject access
      cart.ts                 # Cart create/read/add/update/remove/discount
      pages.ts                # Pages/blogs only if required
      customer-account/
        auth.ts               # Discovery, OAuth/PKCE, ID-token verification and logout
        service.ts            # Customer profile, addresses and scoped order API
        types.ts              # Customer Account config and normalized view models
  context/
    ShopifyCustomerAccountContext.tsx # In-memory account session and authenticated actions
  components/account/
    ShopifyCustomerAccountPage.tsx    # Profile, order, tracking and address UI
    use-shopify-query.ts      # Implemented React read-state adapter
api/
  webhooks/
    shopify.ts                # Vercel function: raw-body validation, dispatch/queue
  shopify/                    # Only owner-approved, authenticated Admin operations
```

`api/` is a proposal, not a current repository path. Before creating it, verify Vercel Node runtime constraints, package/module format, body parsing behavior and request-duration limits. Keep Admin operations narrowly scoped; do not create order, customer or inventory persistence.

## 4. Client and service contracts

### GraphQL client

Use native `fetch`; no Shopify dependency is required. The implemented client:

- Constructs the endpoint from a validated `.myshopify.com` store domain and the configured API version, defaulting to `2026-10`.
- Accept a typed GraphQL document string, typed variables and an `AbortSignal`.
- For public Storefront requests, attach only `X-Shopify-Storefront-Access-Token`.
- Parse HTTP status and `errors[]` separately; throw a typed error retaining safe request metadata, GraphQL paths/extensions, and HTTP status.
- Reject malformed JSON, non-JSON responses and missing expected `data`; do not turn errors into empty products/carts.
- Redact tokens, customer data and request bodies from logs.
- Use request de-duplication/short-lived cache only for public read queries. Never cache cart mutations or authenticated customer data in shared caches.
- Keep pagination explicit via `PageInfo` and `endCursor`; never silently return only the first page when more results exist.

Phase 3 verification uses deterministic mocked responses only. It does not claim that a real store, API token, Metaobject permission or live catalog has been tested.

For browser UI, expose `idle/loading/success/error` states. Services return typed data or throw a typed error; React components decide how to render loading, empty and error states.

### API/service ownership

| Concern | API | Client or server | Source of truth |
|---|---|---|---|
| Product, variant, price, media, availability | Storefront GraphQL | Browser with public Storefront token | Shopify |
| Collection, product search and filters | Storefront GraphQL | Browser with public Storefront token | Shopify |
| Cart lines, quantity, discounts, cost and checkout URL | Storefront GraphQL Cart API | Browser with public Storefront token | Shopify |
| Pages, blogs and public Metaobjects | Storefront GraphQL | Browser/public read | Shopify |
| Customer auth, profile, addresses, orders | Customer Account API OAuth/GraphQL | Public OAuth client with PKCE; access tokens treated as secrets | Shopify |
| Admin GraphQL or protected integration | Admin GraphQL | Vercel server functions only | Shopify |
| Webhooks | Shopify HTTPS delivery | Vercel server function | Shopify event; optional idempotency ledger stores event IDs only |

### Suggested strict TypeScript boundaries

- Use generated GraphQL operation types if the project adopts code generation; otherwise define operation-specific `Variables` and `Data` interfaces next to each query.
- Model `MoneyV2` values as `{ amount: string; currencyCode: string }`; do not parse currency text to calculate order totals.
- Model GraphQL connections with `edges/node/pageInfo` and use cursors as opaque strings.
- Model Cart IDs, Product IDs and Variant IDs as distinct branded string types if helpful; do not accept SKU/slug where a Shopify GID is required.
- Model API failures as discriminated data (transport, HTTP, GraphQL, validation, auth/expired token) with no `any`.
- Treat untrusted JSON/Metaobject values as `unknown`; validate against local schemas and an allowlist before rendering.
- Normalize Storefront data into UI view models in services, not by making the presentation components understand GraphQL response shapes.

## 5. Operation coverage

### Products and variants

- Fetch products by handle and paginated collection/product connection.
- Request title, handle, description, SEO, product type, tags only when needed, product options/variants, images/media with alt text, availability, price and compare-at price in the active market context.
- Resolve selected variant IDs from Shopify; only a purchasable available variant can be added.
- Keep ingredient, usage and MYRKLS-specific editorial details in approved Shopify metafields/Metaobjects rather than keeping commerce data in `src/data/products.ts`.

### Collections and search

- Query collection by Shopify handle; use Storefront search for query terms.
- Pass supported query/sort/filter values through explicit typed allowlists.
- Paginate with cursors and render the next page without pretending results are complete.
- Do not locally filter a partial first page and label it as a complete Shopify collection.

### Cart and checkout

- Implement `cartCreate`, `cart`, `cartLinesAdd`, `cartLinesUpdate` and `cartLinesRemove` with the pinned schema.
- Persist only Shopify's opaque cart ID; re-read the cart after mutations and immediately before checkout.
- Respect `userErrors` and GraphQL errors; surface actionable messages rather than showing success.
- Use Shopify-returned `cost`/subtotal/total and fresh `checkoutUrl`; do not calculate the final payable total in React.
- Validate the checkout URL over HTTPS against the configured store domain or the primary domain returned by the Storefront API. Redirect only after an explicit customer click.
- Discount-code mutation, payment-provider setup and order management remain unimplemented; Shopify checkout owns those concerns.

### Metaobjects and pages/blogs

- Read only published, Storefront-accessible entries.
- Resolve nested references with bounded query depth; avoid N+1 API requests.
- Filter homepage sections to a strict locally defined component-type union and stable order; do not execute content or dynamic markup from Shopify.
- Query Shopify pages/blogs only for routes actually required by the approved migration scope.

### Customer Account API

- Use the current Customer Account API, OAuth authorization-code flow with PKCE for the public storefront client.
- Discover authorization, token, logout and API endpoints from Shopify's OpenID/Customer Account discovery responses; do not guess endpoint hosts.
- Validate OAuth `state`, PKCE verifier/challenge, same-origin HTTPS callback URI and error responses.
- Use Shopify discovery endpoints for OAuth metadata and Customer Account GraphQL URL; require HTTPS for all discovered endpoints.
- Validate the nonce and ID-token signature/issuer/audience/expiry. Keep access and ID tokens in memory; use `sessionStorage` only for short-lived OAuth state and a non-secret marker for Shopify silent session restoration. Do not assume refresh tokens.
- Read profile/addresses/orders through the authenticated `customer` root. Address create/update/delete mutations affect only that Shopify customer. Order details are looked up through that customer's own `orders` connection, not a browser-supplied customer identifier.
- Shopify Admin must approve the Customer Account API capabilities needed for `customer_read_customers`, `customer_read_orders` and `customer_write_customers` (first/last-name and address updates); these are not Admin API credentials/scopes.
- An app client ID is public; do not ship a client secret. Do not use the legacy customer-password flow.
- Confirm token lifetime/storage and refresh behavior against current Customer Account API docs; do not invent a refresh-token flow or place credentials in application logs.

## 6. Caching, loading and error policy

- Cache/de-duplicate public catalog/content GET-like reads for a short configurable TTL, keyed by operation, variables and market context. Start conservatively and invalidate after webhook or an explicit refresh.
- Never share cached authenticated customer responses between buyers.
- Never cache mutation responses as if they were fresh authoritative cart state.
- Do not add a persistent product cache until cache invalidation and Shopify's freshness expectations are agreed.
- Surface loading, empty, unavailable, auth-required and API-error states separately.
- For webhook-triggered revalidation, invalidate only the relevant product/collection/content keys; Shopify remains the canonical database.

## 7. Required tests before the first data cutover

- Client: valid response, HTTP non-2xx, GraphQL `errors`, `userErrors`, malformed response, timeout/abort, missing config, token redaction.
- Mapping: product/variant/money/media/alt-text and missing optional fields.
- Pagination: first, intermediate, final, empty and repeated-cursor guard.
- Search/filter/sort: allowlist and empty result behavior.
- Cart: create, restore, add, update, remove, discount failure/success, stale ID, unavailable variant and checkout URL.
- Content: draft/private/unapproved type excluded; missing reference/media handled; invalid `component_type` never renders.
- Customer: state mismatch, callback error, PKCE mismatch, expired access and authorized order/address access.

## References

- [Shopify API versioning and support schedule](https://shopify.dev/docs/api/usage/versioning)
- [Storefront GraphQL API 2026-10](https://shopify.dev/docs/api/storefront/2026-10)
- [Storefront API token types](https://shopify.dev/docs/api/storefront/latest#authentication)
- [Customer Account GraphQL API 2026-10](https://shopify.dev/docs/api/customer/2026-10)
- [Customer Account OAuth flow](https://shopify.dev/docs/api/customer/2026-10#authentication)
- [Shopify API access scopes](https://shopify.dev/docs/api/usage/access-scopes)
