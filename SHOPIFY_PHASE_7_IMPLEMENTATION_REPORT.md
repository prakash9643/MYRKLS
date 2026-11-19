# Shopify Phase 7 Implementation Report

## Status

The canonical routing, client-side Shopify SEO, JSON-LD, Vercel SPA rewrites, and build-time live-catalog sitemap foundation are implemented and locally verified. Production SEO acceptance is not complete: the app is still a client-rendered Vite SPA, so product/collection metadata is not guaranteed in the initial HTML. Metaobject definitions and published content entries also remain unverified in Shopify Admin.

No cart, checkout, payment, account, order, Admin API, or webhook behavior was added or changed by this phase.

## Files created

- `src/seo/metadata.ts` — typed route metadata builders, canonical-origin validation, product/collection structured data, and JSON-LD escaping.
- `scripts/generate_sitemap.mjs` — paginated public Storefront API sitemap generation during production builds.
- `scripts/verify_sitemap.mjs` — generated sitemap structure, URL, uniqueness and indexability checks.
- `scripts/verify_phase7.cjs` — unit-style route, SEO, schema and escaping checks.
- `scripts/verify_phase7_browser.cjs` — production-preview responsive and route smoke tests using Chrome/Edge.
- `vercel.json` — route-specific SPA rewrites for canonical storefront paths.
- `SHOPIFY_PHASE_7_IMPLEMENTATION_REPORT.md` — this report.

## Files modified

- `src/App.tsx` — uses the route resolver, canonical product navigation and page-aware SEO props.
- `src/routing/routes.ts` — canonical/legacy route resolution, Unicode Shopify handle support, and verified `vision`/`incarnation` aliases.
- `src/types/index.ts` — not-found route type.
- `src/components/MyrklsSEO.tsx` — Shopify-backed product/collection metadata, route-specific canonical and robots values, and dynamically injected structured data.
- `src/seo/metadata.ts` — created as listed above.
- `src/components/MyrklsHero.tsx` — reads published Shopify hero banners when available; retains the existing animated hero when no valid entries exist; handles short hex overlay colors.
- `src/components/MyrklsShopifyCatalogPage.tsx` — uses canonical collection/product paths and reads collection/search routes.
- `src/components/MyrklsProductGrid.tsx` — Shopify product links use `/products/{handle}`.
- `src/shopify/queries/catalog.ts` — requests collection SEO and variant SKU data.
- `src/shopify/services/collections.ts` — maps collection SEO and exposes collection summary lookup.
- `src/shopify/services/shared.ts` — maps Shopify variant SKU.
- `src/shopify/queries/metaobjects.ts`, `src/shopify/types.ts`, and `src/shopify/services/metaobjects.ts` — typed media/content references and response validation.
- `src/shopify/content/types.ts` and `src/shopify/content/services.ts` — typed Metaobject content mapping, field validation, allowlisted section types and publication/schedule filtering.
- `package.json` — production sitemap generation/verification added to `build`; Phase 7 tests added to `test:shopify`; added `test:phase7:browser`.
- `public/sitemap.xml` and `public/sitemap-pages.xml` — remove stale dated product/collection entries; production sitemap replaces these with Shopify data.
- `public/sitemap-products.xml` and `public/sitemap-collections.xml` — removed; generated from Shopify for each configured build.
- `SHOPIFY_ENVIRONMENT_VARIABLES.md` — documents optional `VITE_SITE_URL` and sitemap build behavior.
- `SHOPIFY_API_ARCHITECTURE.md` — updates the Phase 7 implementation status.
- `SHOPIFY_ROUTING_AND_SEO_PLAN.md` — records implemented routes, aliases, sitemap behavior and remaining crawler requirements.

`public/robots.txt` was verified and already disallows cart, checkout, account, orders and search while referencing `https://myrkls.com/sitemap.xml`; it was not modified.

## Implemented behavior

### Routing

- Supports canonical `/products/{handle}`, `/collections/{handle}`, `/pages/{handle}`, `/search`, `/checkout` and `/account` paths, plus existing informational routes.
- Preserves legacy hash/query navigation and normalizes verified legacy product aliases:
  - `vision` → `vision-multi-pathway-pigment-corrector`
  - `incarnation` → `skin-renewal`
- Supports URI-encoded Unicode handles, including the live `vision™` collection handle.
- Unknown app paths render the existing not-found UI. A requested product/collection that does not exist in Shopify remains an explicit empty/error state and is marked `noindex`.
- `vercel.json` uses explicit route rewrites rather than a catch-all.

### SEO and structured data

- Product title/description use Shopify SEO fields with Shopify product content as fallback. Canonical URL, image, price range, currency, availability, variant SKU/options and breadcrumb data are based on the Storefront response.
- Collection title/description/image and canonical URL use Shopify collection SEO/content. Breadcrumb and collection-page JSON-LD are emitted.
- Search, account, checkout and invalid routes are `noindex`.
- Product schema contains no hardcoded review count, review rating, availability or price.
- Existing Organization/WebSite JSON-LD remains in `index.html`; route-specific JSON-LD is added under one managed script element with script-safe JSON escaping.

### Sitemap

- `npm run build` queries the configured Storefront API using the approved version, follows product and collection cursors, and generates sitemap XML in `dist/`.
- The current live development store returned **2 products**, **2 collections**, and the build includes **9 implemented static routes**. Live product handles: `skin-renewal`, `vision-multi-pathway-pigment-corrector`. Live collection handles: `frontpage`, `vision™`.
- Product URLs include available Shopify image URLs and `updatedAt` dates. Utility routes are excluded.
- If Storefront configuration is missing, the generator warns and emits only static routes. If configured Shopify calls fail or return malformed data, the build fails instead of publishing stale or fabricated product URLs.

## Metaobject status and manual Shopify Admin actions

Read-only Storefront probes found no published entries for the proposed content types queried: `homepage_hero_banner`, `homepage_section`, `promotional_banner`, `testimonial`, `faq`, `brand_story`, `trust_badge`, `custom_landing_page`, `global_website_settings`, `header_configuration`, and `footer_configuration`. This does not establish whether the definitions exist; it only establishes that no published entries were returned.

- The homepage hero reads validated `homepage_hero_banner` entries and safely retains the existing hero when none are published.
- Typed readers/mappers exist for homepage sections, promotions, testimonials, FAQs and brand stories, but the full homepage section-order/visibility registry and all those editorial components are not yet connected to the React page. They remain on their existing approved content until definitions, permissions and published entries can be verified.
- In Shopify Admin, confirm each proposed definition and field key in `SHOPIFY_METAOBJECT_SCHEMA.md`, enable storefront `PUBLIC_READ`, publish approved entries and reference images through Shopify Files. Do not create definitions or content by code in this phase.
- Decide which of the historic product URLs not matching the two live products should be redirected, republished, or remain unavailable. No unverified mapping was invented.

## Environment and security

The build reads `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `VITE_SHOPIFY_API_VERSION` (default `2026-10`). `VITE_SITE_URL` is optional and restricted to the MYRKLS production origin. No `.env.local` or `.env.example` file was modified, and no credentials are printed by build or tests.

Only the intended public Storefront token is used in browser calls. No Admin token, Shopify app secret, webhook secret or private credential was added to Vite variables or source. No unrestricted proxy or server-side Admin endpoint was added.

## Verification

| Check | Result |
|---|---|
| `npm run build` | **PASS** — TypeScript and Vite production build succeeded; live sitemap generation and XML checks passed. |
| Live build-time catalog query | **PASS** — 2 products, 2 collections; all cursors completed. |
| `npm run test:shopify` | **PASS** — existing Storefront, cart, Customer Account tests plus Phase 7 route/SEO tests. |
| `npm run test:phase7:browser` | **PASS** — Chrome production preview at 390, 768 and 1440 px; no horizontal overflow. |
| Direct browser routes | **PASS** — live product, Unicode collection, legacy alias, search, invalid product, account and checkout pages rendered. No order was submitted. |
| Browser console/local requests | **PASS** — no console errors, failed local requests or local HTTP error responses. |
| `npm test` legacy flow suite | **BLOCKED** — its existing `scripts/verify_flows.cjs` hardcodes a macOS Chrome path and exits before running. The Phase 7 Chrome browser suite was run separately and passed. |
| Vercel deployment/rewrite verification | **NOT RUN** — no production deployment was requested; verify route precedence in a Vercel Preview before release. |
| Initial-HTML/crawler SEO verification | **NOT PASSING / NOT IMPLEMENTED** — route metadata is applied after client hydration. |

The Vite build reports an existing advisory that the main JavaScript chunk is slightly above 500 kB. It does not fail the build.

## Known issues and launch blockers

1. **SSR/prerender remains required for dependable SEO.** The server initially returns the shared Vite `index.html`; product/collection metadata is updated client-side and therefore does not guarantee crawlable initial metadata or social-sharing previews. Select SSR or route prerendering and test raw HTML before launch.
2. **Metaobject setup is pending.** Definitions, storefront permissions and published entries are not confirmed. Only the hero is connected to its Metaobject reader; homepage section visibility/order and remaining editorial components are not fully integrated.
3. **Live catalog is smaller than the old static catalog.** Shopify currently returns two products. Other historical product IDs have no verified live match and must not be presented as live Shopify products.
4. **Vercel rewrites have only been locally reviewed.** Confirm real deployment behavior and static-file precedence in Preview.
5. **The existing `npm test` script is platform-specific.** It hardcodes a macOS Chrome path. This phase added a separate cross-platform browser test rather than changing the legacy test's product-flow assumptions.

## Deliberately postponed

- Full homepage Metaobject section registry and content rendering after Admin definitions/entries are configured.
- Remaining CMS-backed header, footer, promotion, testimonial, FAQ, brand-story, trust-badge and landing-page UI integrations.
- SSR/prerender solution, route-specific initial HTML, deployment rewrites verification and production redirects.
- Cart/checkout/payment/customer-account/order changes, Admin API, webhooks and production deployment.
