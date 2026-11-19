# Shopify Routing and SEO Compatibility Plan

**Status:** Canonical React route resolution, legacy aliases, Vercel SPA rewrites, client-side Shopify SEO metadata, structured data and a live-catalog build-time sitemap are implemented. Server-rendered/prerendered route metadata remains a launch requirement; client-side updates do not guarantee crawler/social metadata.

## 1. Existing route behavior

`src/App.tsx` is a custom view switcher; there is no React Router. Initial view selection and listeners inspect `window.location.search` and `window.location.hash`. Navigation writes hashes or query parameters. `src/components/MyrklsSEO.tsx` updates title, description, canonical, Open Graph/Twitter metadata and JSON-LD after React mounts.

The custom route resolver now interprets canonical product, collection and approved informational paths while preserving the original hash/query aliases. `vercel.json` rewrites these routes to the Vite SPA. Shopify product and collection SEO is applied after client hydration; this does not guarantee that crawlers or social scrapers receive the page-specific metadata in initial HTML.

## 2. Existing URL compatibility map

| Existing URL pattern | Current view | Proposed stable route/canonical |
|---|---|---|
| `/`, `/#home`, `/?view=home` | Home | `/` |
| `/?view=view-all`, `/#all-products`, `/#view-all`, `/?category=...`, `/#collection/{category}` | Product catalog/category | `/collections/{shopify-handle}` |
| `/?view=pdp&product={id}`, `/?product={id}`, `/#product/{id}`, `/#pdp/{id}` | Product detail | `/products/{shopify-handle}` |
| `/?view=checkout`, `/#checkout` | Current simulated checkout | `/checkout` only if retaining an app transition; commerce completion must go to Shopify's hosted checkout URL |
| `/?view=account`, `/#account` | Current demo account | Shopify Customer Account experience; avoid competing account route if Shopify owns it |
| `/?view=our-science`, `/?view=science`, `/#our-science`, `/#science` | Science page | Preserve `/our-science`; optionally support `/pages/our-science` |
| `/?view=about`, `/?view=about-us`, `/#about`, `/#about-us` | About page | Preserve `/about-us`; optionally support `/pages/about-us` |
| `/?view=contact`, `/?view=contact-us`, `/#contact`, `/#contact-us` | Contact page | Preserve `/contact-us`; optionally support `/pages/contact-us` |
| `/?view=terms`, `/?view=terms-and-conditions`, `/#terms` | Terms | Preserve `/terms`; optionally support `/pages/terms` |
| `/?view=privacy`, `/?view=privacy-policy`, `/#privacy`, `/#privacy-policy` | Privacy | Preserve `/privacy-policy`; optionally support `/pages/privacy-policy` |
| `/?view=shipping`, `/?view=shipping-policy`, `/#shipping`, `/#shipping-policy` | Shipping | Preserve `/shipping-policy`; optionally support `/pages/shipping-policy` |
| `/?view=returns`, `/?view=returns-refunds`, `/?view=refunds`, `/#returns`, `/#returns-refunds`, `/#refunds` | Returns/refunds | Preserve `/returns-refunds`; optionally support `/pages/returns-refunds` |

Fragments after `#` are never sent to Vercel or Shopify in the HTTP request. Old hash links must therefore remain supported by client-side parsing/redirect logic; a server-side 301 cannot directly inspect a fragment.

## 3. Canonical route rules

1. Use actual published Shopify product handles. The verified development Storefront currently returns `skin-renewal` and `vision-multi-pathway-pigment-corrector`. Legacy `incarnation` and `vision` paths normalize to those corresponding records. Other historic product IDs remain unresolved until the merchant publishes/matches those products; do not render mock product data as Shopify results.
2. Use real Shopify collection handles. Add a verified mapping for current category terms: `serums`, `creams`/`moisturizers`, `cleansers`, `sun-protection`/`sunscreen`. Do not guess Shopify handles from display labels.
3. Product canonicals: `/products/{handle}`. Collection canonicals: `/collections/{handle}`. Informational pages preserve their existing canonicals unless historic analytics/search data supports a planned redirect.
4. Support `/pages/{handle}` for Shopify-managed pages only after adding route resolution. Do not redirect every existing informational URL to `/pages/...` by default; preserve previously indexed URLs.
5. Keep query/hash aliases functional during migration. Once canonical pathname handling exists, optionally replace the visible URL using `history.replaceState`, but do not discard query parameters needed for state or attribution.
6. Cart and checkout are transactional/noindex surfaces. Shopify checkout should own the payment/checkout URL. Customer account URLs should use the configured Customer Account flow, not a second fake account database.
7. Add permanent redirects only for confirmed old path routes/slugs and only after inventorying Search Console, analytics, Shopify handles and existing external links. There is no repository redirect list to migrate.

## 4. Vercel SPA rewrites (implemented)

The Vite app remains a client-rendered SPA. The repository's `vercel.json` contains explicit rewrites for product, collection, page, search, checkout, account and existing informational routes. Static files are not matched by these route-specific rules. Verify rewrite precedence in a Vercel Preview deployment before production.

The exact rules are maintained in [`vercel.json`](./vercel.json): product, collection and page detail routes plus search, account, checkout and existing informational pages rewrite to `/index.html`.

The `App.tsx` route resolver now parses `pathname`, normalizes supported legacy aliases and renders an explicit unknown-path state. Rewrites are route-specific rather than a catch-all, so a future `/api/*` function is not shadowed. A root query/hash URL already serves `/` and needs no server rewrite.

### Legacy aliases

- Query aliases such as `/?view=pdp&product=vision` remain supported and normalize to the verified canonical Shopify product route.
- Hash aliases such as `/#product/vision` are handled client-side because fragments are absent from server requests.
- `/collections/...` and `/products/...` need Vercel SPA rewrites until an SSR/SSG renderer serves them directly.
- Test browser back/forward, direct navigation, reload, old campaign links, and Vercel preview/production behavior.

## 5. SEO and rendering recommendation

`index.html` has baseline site metadata and `MyrklsSEO.tsx` updates metadata client-side. Dynamic product/collection metadata is not guaranteed to be present in the initial HTML. Before launch, choose and test one of:

1. **SSR on Vercel:** render request-specific product/collection/page metadata and structured data on the server. This is the strongest option for fresh dynamic catalog content but requires an SSR-capable React architecture/runtime, data loading and cache policy.
2. **Build-time or scheduled prerendering:** pre-render known product, collection and editorial routes from Shopify at build time and rebuild/revalidate after content changes. This can leave stale pages until the next render and requires a complete route inventory.
3. **Hybrid:** prerender stable editorial/content pages and SSR product/collection routes, retaining the existing React client UI for hydration.

The existing Vite SPA alone should not be represented as guaranteed crawlable for dynamic metadata. Google may render JavaScript, but that is not a substitute for validating HTML responses, indexing, social previews, canonical tags and structured data. Shopify's native SEO fields should be the source for product/page SEO values.

Client-side output per product/collection route:

- Unique HTML title and description in initial response.
- Canonical URL using the approved MYRKLS URL, not a Shopify admin URL.
- Open Graph/Twitter title, description, image and URL.
- Product JSON-LD with Shopify-returned price, currency and availability; do not publish stale or fabricated review data.
- Breadcrumb JSON-LD matching visible hierarchy.
- Image alt text and responsive Shopify CDN media URLs.
- Correct noindex policy for account/checkout/utility pages.
- Sitemap and robots behavior consistent with Vercel route strategy.

The component currently applies these values after React runs. The initial `dist/index.html` still contains homepage metadata, so this is not yet a crawler-safe implementation for product/collection previews.

## 6. Redirect plan and review gate

Before any permanent redirect:

1. Export existing indexed URLs/Shopify URL redirects and compare with analytics/Search Console.
2. Preserve unchanged routes; map old slugs/IDs to current Shopify handles.
3. Add a single-hop 301 for confirmed changed paths; avoid redirect chains and redirecting all pages to the homepage.
4. Keep hash/query aliases working during rollout, then monitor 404s and canonical selection.
5. Owner approves launch date, redirect table, canonical domain (`https://myrkls.com` per existing SEO) and sitemap ownership.

## 7. Route verification matrix

- [ ] Direct-load and refresh `/products/vision`, every product, all collection handles, and every editorial route.
- [ ] Existing query/hash product and category links resolve to the same content.
- [ ] Unknown handle returns a real not-found state/status where rendering architecture allows; it must not masquerade as home.
- [ ] Account and hosted-checkout redirects remain secure and are not indexed.
- [ ] Vercel rewrites do not intercept `/assets/*`, static public files, or `/api/*`.
- [ ] Initial HTML includes route-specific metadata in crawler and social preview tests.
- [ ] Canonical, breadcrumbs, sitemap, robots, redirects and Shopify handles agree.

## 8. Phase 7 implementation and verification notes

- `src/routing/routes.ts` resolves `/products/{handle}`, `/collections/{handle}`, approved `/pages/{handle}` aliases and legacy hash/query routes. Shopify handles are URI-encoded and may contain Unicode; the live collection handle `vision™` is supported. Only confirmed legacy aliases are mapped.
- `src/components/MyrklsSEO.tsx` updates title, description, canonical, robots, Open Graph/Twitter tags and a single route JSON-LD script. Product SEO uses Shopify SEO/title/description/image/price/currency/SKU/availability. Collection SEO uses Shopify collection SEO/title/description/image. It does not emit fabricated rating/review data. Search, account, checkout and invalid routes are `noindex`.
- `src/seo/metadata.ts` builds route metadata and escapes JSON-LD for script embedding. `index.html` remains the single owner of baseline Organization/WebSite JSON-LD.
- `scripts/generate_sitemap.mjs` paginates published products and collections during production builds, uses Shopify update timestamps and product images, and includes only implemented static routes. `public/sitemap*.xml` no longer contains stale hardcoded product/collection entries. Missing Storefront configuration yields a warning plus a static-only sitemap; a configured API error fails the build.
- `public/robots.txt` disallows cart, checkout, account, orders and search and references the sitemap index.
- `vercel.json` contains route-specific SPA rewrites; static assets and future API routes are not captured by a catch-all.
- Live Storefront verification found two products and two collections. Historic product IDs without a published Shopify match are not rendered from mock product data.
- Build and browser tests do not establish SSR/crawler metadata. Before launch, choose SSR or a tested route-prerender strategy and validate raw HTTP HTML and social previews. Product routes are not guaranteed to return unique metadata before JavaScript hydration.

## References

- [Vercel `vercel.json` configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning)
- [Shopify Storefront API 2026-10](https://shopify.dev/docs/api/storefront/2026-10)
