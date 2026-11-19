# MYRKLS CMS Phase 1 — Repository Audit Report

**Audit type:** Read-only CMS architecture audit (documentation only)  
**Repository:** `C:\Users\DB\Desktop\LV Projects\myrkls-website-new`  
**Audit snapshot:** 2026-11-16  
**CMS implementation status:** Not started; no Shopify definitions or CMS app were created.

## Executive summary

MYRKLS is a 126-file Vite + React 18 + strict TypeScript storefront. It already has a substantial Shopify Storefront integration: catalog/search/collection/PDP services, a real Shopify cart, a validated Shopify-hosted checkout handoff, Customer Account API code, route/SEO helpers, an initial Metaobject reader, consent-gated analytics foundations, and Vercel deployment configuration. These existing commerce paths must remain authoritative and unchanged during a CMS migration.

The repository is **not yet a complete Shopify visual CMS**. It has no embedded Admin app, no server-side Admin API integration, no API function directory, no webhook handler, and no dynamic section registry/renderer wired into the homepage. Shopify content contracts and readers exist, and the homepage hero calls its reader with a static approved-content fallback. The other homepage sections remain component-composed and mostly code-managed. Existing Shopify CMS definitions/entries have not been verified in Admin.

The latest local baseline passed `npm run build`, `npm run test:shopify`, `npm run test:phase9`, and the Chrome live browser journeys. Chrome and Edge journeys exercised real Storefront product/cart data, cart add/update/refresh/remove, and an empty cart. No order was placed. The hosted-checkout handoff terminates at the Shopify store's `/password` gate, so payment, order confirmation and purchase analytics remain unverified. A prior phase report records a 18,004-character customer-facing product description containing pasted implementation instructions; the store owner must correct it in Shopify Admin before launch.

**Important audit warning:** The workspace has no `.git` metadata, so branch and complete change-history verification are unavailable. A preceding Phase 10 test run in this session modified `scripts/verify_flows.cjs` to add cross-platform live cart checks; this was not a CMS-1 edit. CMS-1 itself changes no application code. The public domain probe during this audit returned HTML with canonical `http://localhost:3002`, and `/products/skin-renewal` returned 404 while the homepage and sitemap returned 200. This is inconsistent with this Vite project's production metadata and requires domain/deployment-owner verification before launch; it is not evidence that this Vercel project is deployed there.

## Repository and application structure

The index contains 126 files. Main areas:

| Area | Actual path | Current role |
|---|---|---|
| React/Vite entry and routes | `src/main.tsx`, `src/App.tsx`, `src/routing/routes.ts` | Providers, route resolution, route rendering and shared layout. |
| Storefront UI | `src/components/` | Header/footer, homepage, catalog/search, policy/information pages, PDP, account and cart UI. |
| Shopify API | `src/shopify/` | Typed public Storefront client, query definitions, normalized services, cart services and Customer Account services. |
| Existing content layer | `src/shopify/content/` | Typed Metaobject shapes and read/mapping services; not a full page-builder renderer. |
| Shared state | `src/context/` | `MyrklsCartContext`, legacy auth context and Shopify Customer Account context. |
| Static content | `src/data/products.ts`, component-local arrays | Legacy catalog fallback and editorial/UI data. |
| SEO/analytics | `src/seo/`, `src/analytics/`, `shopify/custom-pixel-checkout-completed.js` | Client metadata/JSON-LD, consent and event foundations, pixel source awaiting Admin setup. |
| Deployment/config | `vite.config.ts`, `vercel.json`, `package.json`, `package-lock.json` | Static Vite build, SPA rewrites, headers, scripts and npm dependency graph. |
| Server/API | `api/` | Not present. There is no current Admin API or webhook backend. |

### Routes and page surfaces identified

`resolveAppRoute` supports 14 route patterns/categories: home; `/products/:handle`; `/collections`, `/collections/:handle`; `/search`; `/checkout`; `/account`; seven named information pages (`/our-science`, `/about-us`, `/contact-us`, `/terms`, `/privacy-policy`, `/shipping-policy`, `/returns-refunds`); and not-found handling. Legacy query/hash aliases remain in `src/routing/routes.ts`. Shopify page routes currently map only the seven known handles; arbitrary `/pages/:handle` routes are not resolved dynamically.

**Homepage:** `src/App.tsx` composes nine major sections in fixed code order: `MyrklsHero`, `MyrklsProductGrid`, `MyrklsScienceSection`, `MyrklsFeaturedInnovation`, `MyrklsGlobalScienceNetwork`, `MyrklsFeaturedProtection`, `MyrklsFAQ`, `MyrklsProductReelsSection`, and `MyrklsReviews`. `MyrklsHeader`, `MyrklsFooter`, cart drawer, cookie-consent UI and page SEO surround the route. There is no runtime homepage registry/ordering renderer.

**Other routes:** `MyrklsViewAllPage` switches to `MyrklsShopifyCatalogPage` in Shopify mode; `/search` uses the catalog/search path. `MyrklsProductDetailPage` uses Shopify product fields in configured mode and a legacy static editorial layout otherwise. `ShopifyCustomerAccountPage` is the active account surface. `/checkout` is a guarded entry/handoff page; payment form and payment processing belong to Shopify-hosted checkout. Named legal/information routes use individual React components.

## Existing Shopify implementation inventory

| Capability | Actual implementation evidence | Audit status |
|---|---|---|
| Storefront configuration | `src/shopify/config.ts`; reads public `VITE_SHOPIFY_*`, validates domain/version, defaults API version to `2026-10`. | Implemented; `.env.local` key names exist. Values were not printed. |
| Typed GraphQL transport | `src/shopify/graphql-client.ts`, `src/shopify/errors.ts`; typed request/error mapping, cache/dedup/abort/timeout/retry behavior documented in Phase 9 report. | Implemented; service tests pass. Public token is intentionally browser-visible; no Admin token belongs here. |
| Products/variants/images/prices | `src/shopify/services/products.ts`, `queries/catalog.ts`, `types.ts`, `presentation.ts`; homepage, catalog/search, PDP map normalized models. | Live product route verified for `skin-renewal`; current build sitemap has two products. |
| Collections/search/pagination | `src/shopify/services/collections.ts`, `search.ts`, catalog page and `ShopifySearchResults.tsx`. | Automated tests and live collection/search routes pass. |
| Metaobjects | `src/shopify/services/metaobjects.ts`, `src/shopify/content/services.ts`, `content/types.ts`, `queries/metaobjects.ts`. Allowlisted section type literals include 12 values. | Read/query/mapping exists. Definitions/entries/access have not been confirmed in Admin. Only hero is actively wired into the homepage; other content readers are not a complete CMS. |
| Homepage hero | `src/components/MyrklsHero.tsx` calls `getHomepageHeroBanners`; it uses static hero slides if no usable Shopify result. Reduced-motion/keyboard/touch behavior is code-controlled. | Reader/render path implemented; live Metaobject records and permissions unverified. |
| Cart | `src/context/MyrklsCartContext.tsx`, `src/shopify/services/cart.ts`, `queries/cart.ts`, `src/components/MyrklsCartDrawer.tsx`. Includes create/get/add/update/remove, local cart-ID persistence/restoration and cart line pagination. | Live Chrome and Edge add/update/refresh/remove journeys passed. Expired cart/inventory race and rapid multi-click scenarios were not part of this browser run. |
| Checkout | `src/App.tsx`, cart service/context and `MyrklsCartDrawer.tsx`; checkout URL comes from Shopify and is URL-validated; redirect requires explicit customer click. | Live handoff reached `https://myrkls.myshopify.com/password`; checkout form/provider/payment/order were not reached. |
| Customer accounts | `src/shopify/customer-account/{auth,service,types}.ts`, `src/context/ShopifyCustomerAccountContext.tsx`, `ShopifyCustomerAccountPage.tsx`. OAuth PKCE and token/claim verification tests. | Mocked security/service tests pass. Shopify OAuth registration/configuration and real-customer journeys are pending. |
| SEO/routing | `src/seo/metadata.ts`, `MyrklsSEO.tsx`, `routes.ts`, `scripts/generate_sitemap.mjs`, Vercel rewrites. | Client metadata, JSON-LD, sitemap and direct routes verified locally. Initial HTML for dynamic product/collection metadata is not generated; reliable crawler/social metadata needs SSR/prerender. |
| Analytics/consent | `src/analytics/`, `shopify/custom-pixel-checkout-completed.js`. | Local payload, consent, attribution and pixel-mock tests pass. IDs, GTM/Meta setup, Shopify pixel installation and actual purchase are not verified. |
| Admin API/webhooks | No `api/` folder or server-side Shopify app in repository. | Not implemented. No credentials or store writes observed. |

Phase reports found: Phase 3 and Phases 5–9. No Phase 4 implementation report, no Phase 10 final launch report, and no CMS Phase 1 reports existed at audit start. Phase 2 setup and the API/schema/environment/routing/security planning documents exist.

## Content classification and hardcoded content inventory

| Content surface | Current source | Category and future CMS ownership |
|---|---|---|
| Hero slide copy/images/order | Static `slides` in `MyrklsHero.tsx`, plus optional `homepage_hero_banner` Metaobjects. | Hybrid. CMS may own copy, media and order; React owns carousel, touch/keyboard/reduced-motion behavior. Existing fallback must remain during rollout. |
| Header category labels, descriptions, badges, imagery and menu arrangement | `SHOP_CATEGORIES` in `MyrklsHeader.tsx`; logo/assets and route handlers remain code. | CMS-editable links/labels/images where useful; React keeps menu interaction, search/account/cart actions and route allowlisting. Prefer Shopify native menus for actual navigation. |
| Homepage featured products/prices/availability | Shopify `getProducts` when configured; `src/data/products.ts` fallback if unconfigured. | Hybrid. Storefront is sole source of product, variant, price, compare-at, inventory, availability and product image. CMS can configure selection/order/layout and editorial label only. |
| Science, innovation, network, featured-protection story, FAQs/reviews/reels | Primarily component-local content and `public/` media. Homepage section Metaobject types/readers exist, but no universal section renderer is connected. | CMS-editable text/media/order; complex animation, diagrams, accessible accordions, deferred external media, verified-review behavior remain code/integration controlled. |
| Shopify-mode PDP | Live title, description, images, options/variants, availability and price in `MyrklsProductDetailPage.tsx`. | Commerce-critical fields remain Shopify product/variant data. CMS may provide validated product editorial blocks/layout/FAQ references; never override price or variant. |
| Legacy/offline product/PDP content | `src/data/products.ts` and PDP component static datasets/section modules. | Transitional fallback only. Must not silently appear as Shopify data when Storefront is configured. |
| Policies/about/science/contact | Individual page components; terms/privacy/shipping/returns copy is code-held. | Candidate for native Shopify Pages plus structured page-section content. Legal/business text needs owner/legal approval; this audit makes no compliance claim. |
| Cart, customer, order, checkout | Shopify responses via cart/account services; cart ID only is persisted for Shopify cart. | Commerce/security behavior remains code and Shopify-owned; no CMS override. |
| SEO | Native product/collection data where queried plus React metadata/JSON-LD and static base HTML. | Use Shopify native Page/Product/Collection SEO plus code-owned canonical routing/structured data. Avoid duplicate SEO truth. |

## Hosting, configuration and security observations

- `package.json` uses npm scripts; `build` runs `tsc`, Vite production build, Shopify sitemap generation and sitemap verification. No lint script or dedicated test framework script is present; `npm test` is a Puppeteer-based browser flow.
- `vercel.json` contains response security headers and 14 SPA rewrites. Output directory is not explicitly set; standard Vite `dist` default is expected. No API/serverless functions directory exists.
- `vite.config.ts` binds dev server to `127.0.0.1`. `.gitignore` ignores `*.local` and `node_modules`/`dist`. `.env.example` contains the three Shopify variable names; values classified without exposure: store/token keys are empty and API version is set to `2026-10`. `.env.local` exists with required variable names; no values were read/printed. Vercel Preview/Production variables cannot be inspected from this workspace.
- There is no `.git` directory, so branch, tracked files, committed-secret scan and full change diff cannot be verified. No GitHub/Vercel CLI deployment credentials were supplied or used.
- `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` is a public Storefront token by design, not an Admin token. No Admin API token, client secret, webhook secret, secure backend, or server-side scope boundary exists today.
- `vercel.json` CSP is statically checked, not observed on Vercel. CSP permits `unsafe-inline` for current styles/animation; it omits `unsafe-eval` and broad wildcard sources.
- Cart ID is browser-persisted; Customer Account transient/session handling is separate. CMS drafts must never be exposed via public Storefront credentials or public Metaobject reads.
- Existing product description contamination, not-live-tested payment settings, absent OAuth settings/analytics IDs and the production-domain mismatch are launch-critical content/configuration risks.

## Baseline checks and evidence

| Command/check | Result from latest Phase 10 audit run |
|---|---|
| `npm run build` | PASS: TypeScript + Vite 7.3.8 build + sitemap generation/validation; 2 products, 2 collections and 9 static pages in generated sitemap. |
| `npm run test:shopify` | PASS: client, error/retry/cache tests, product/collection/search/metaobject mapping, cart service, OAuth/claims mock, routing/SEO and analytics/pixel mocks. |
| `npm run test:phase9` | PASS: static Vercel headers/CSP/cache/rewrites/Node checks. |
| `npm test` with local production preview | PASS in Chrome and Edge; live product/cart add, quantity update, refresh restoration, removal, empty state, collection/search/account/checkout routes, no order. Chrome had two aborted CDN image requests during route changes; Edge did not. No local or Shopify API failures. |
| `npm run test:phase7:browser` | PASS in Chrome for homepage/product/collection/search/error/account/checkout routes, canonical/JSON-LD and console checks. Edge attempt timed out after responsive-home checks; not counted as a pass. |
| `npm audit` | PASS: zero vulnerabilities for installed npm lockfile graph. |
| `npm run` / diagnostics | No lint script exists; build includes TypeScript. VS Code diagnostics returned no errors. |
| Lighthouse / Firefox | Not available (Lighthouse package not installed; Firefox binary absent). Not installed as part of this audit. |
| Shopify Admin and actual payment/order | Not verified; no Admin access and no authorized test order. Live checkout reached store password page. |
| Production domain | HTTPS homepage, robots and sitemap responded 200; production page response exposed canonical `http://localhost:3002`; `/products/skin-renewal` returned 404; www and apex did not demonstrate a preferred-domain redirect. Requires owner/provider investigation. |

## Missing information and technical risks

1. Shopify Admin owner confirmation of store/domain, product content, Markets, shipping, taxes, payment provider/COD, password protection, Customer Account OAuth, Metaobject definitions/permissions and customer privacy settings.
2. Vercel project/team access, correct Git branch/repository link, production/preview environment variable presence, deployment history and actual headers are unknown.
3. Merchant approval of an embedded CMS app, its ownership model, required scopes, user roles, editorial workflow and preview method is needed before CMS-2.
4. Content migration inventory must identify approved content and asset owners; don't migrate unverified reviews, legal claims, product benefits, price claims or customer-facing business facts.
5. Store API content can be stale and current public content is inconsistent/contaminated. Separate content validation/fallback from commerce error handling.
6. Existing fixed route allowlist and client-only rendering constrain arbitrary CMS pages and SEO. CMS routes must add not-found protection and no arbitrary executable HTML/templates.
7. A durable Admin-app session store, webhook idempotency store/queue and preview authorization are absent. A stateless browser-to-Admin design is unsafe.

## Audit conclusion

The existing Shopify commerce integration is a protected foundation, not a replaceable CMS. CMS work should begin only after the owner confirms the correct Shopify store/domain, cleans the public product description, unlocks authorized test checkout, and approves a custom embedded Admin app plus secure backend/session-store approach. Proceed to CMS-2 only as a separate approved phase; no Shopify schema changes are authorized by this audit.
