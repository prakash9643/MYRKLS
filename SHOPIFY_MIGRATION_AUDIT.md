# MYRKLS Shopify Migration Audit and Plan

**Audit date:** 2026-11-04  
**Scope:** Read-only audit of the existing React storefront. No application source files were changed.

## Executive summary

The project is a Vite 5 single-page React 18 application written in TypeScript. It has an established MYRKLS visual system and working presentation components, but its commerce and customer behavior is presently a local/demo implementation rather than an integration with a commerce platform.

Keep the current React storefront and its design. Introduce Shopify Storefront API services for catalog and cart operations, Shopify-hosted checkout, Shopify Customer Accounts where account features are required, and a small server-side service for Admin API operations and webhooks. Move editable content to Shopify Metaobjects/Metafields incrementally; preserve existing components and visual behavior while replacing their hardcoded data inputs.

## Existing-project audit

### Framework and tooling

- React 18.3, TypeScript 5.6 (strict mode), Vite 5, Tailwind CSS 3, PostCSS, and Autoprefixer.
- Framer Motion provides animation; Lenis provides smooth scrolling; Lucide React provides icons.
- Build command: `npm run build` (`tsc && vite build`).
- Test command: `npm test` runs `scripts/verify_flows.cjs`, a Puppeteer browser-flow script.
- No router, Shopify SDK/client, API service layer, backend, `.env` file, or Shopify configuration was found.
- No separate component stylesheet system exists beyond `src/index.css` and Tailwind utility classes.

### Current navigation and pages

`src/App.tsx` chooses views from `?view=...`, `?product=...`, category query parameters, and URL hashes. It listens to `hashchange` and `popstate`; it does not use a routing library. Existing page views include home, all products, product detail, checkout, account, science, about, contact, and four policy pages.

The current navigation uses hash/query URLs such as `#product/{id}` and `#checkout`. `MyrklsSEO` emits canonical URLs such as `/products/{id}` and `/collections/all`, but the application itself does not define those as route paths. URL migration therefore needs an explicit compatibility map and deployment-level SPA fallback/redirect strategy.

### Homepage and current design

The home view in `src/App.tsx` composes:

1. Header
2. Hero carousel
3. Clinical product grid
4. Science section
5. Featured innovation
6. Global science network
7. Featured protection
8. FAQ
9. Product reels
10. Reviews
11. Footer

The existing design is implemented mainly in Tailwind classes, with brand colors, font families, and a card radius in `tailwind.config.js`. Animations and responsive behavior are component-level. Preserve these components and styles while changing their data sources.

### Commerce, content, and integrations today

- **Product catalog:** `src/data/products.ts` is the hardcoded source for seven products, prices, images, ingredients, benefits, hero data, search keywords, and related configuration. Product details and supporting PDP content also appear in static component constants.
- **Product discovery:** product grid, collection page, and search modal filter local product arrays. No remote product search, collection query, filtering, sorting, or pagination exists.
- **Cart:** `MyrklsCartContext` resolves items from the local product list, calculates subtotal in the browser, and persists the whole cart in `localStorage`. This is not a Shopify cart and has no Shopify cart ID or checkout URL.
- **Checkout:** the custom checkout page stores customer profiles locally, recognizes hardcoded discount codes, and simulates completion. Its submit handler explicitly says no order is placed and no charge is made. It currently renders card/UPI/bank fields without submitting to a payment provider; these must not be used to collect live payment information. Replace the payment path with Shopify-hosted checkout rather than calculating final order totals in React.
- **Authentication and account:** the auth context seeds a demo customer/order and stores profile, address, wishlist, and orders in `localStorage`. Login, signup, OTP, and Google flows are simulations. No real customer authentication or Shopify order history integration exists.
- **Other network calls:** the only application `fetch` calls found are postal-code lookups against `api.postalpincode.in`; no Shopify, Admin API, or other commerce integration was found.
- **Editable content:** hero slides, FAQs, testimonials/reviews, header categories, featured sections, PDP FAQs/how-to/reviews/reels/recommendations, and most informational page text are embedded in React source.
- **Media:** `public/` has 317 existing files, including product/brand imagery and video. Continue using the current visual assets where appropriate; move selected editable CMS media to Shopify Files rather than mechanically relocating all assets.

### SEO and performance

- `index.html` contains the initial title, description, canonical, Open Graph/Twitter tags, Organization/WebSite JSON-LD, font preconnects, and a hero image preload.
- `MyrklsSEO.tsx` updates title, description, canonical, Open Graph/Twitter metadata, robots directives, and page/product JSON-LD on the client.
- The project is an SPA. Client-side metadata updates may not be visible to all crawlers/social scrapers without rendering support; validate the production rendering/deployment approach before promising dynamic SEO.
- The baseline production build passes. Vite reports a 529.18 kB minified main application JS chunk (107.72 kB gzip), above its 500 kB advisory threshold.
- The browser-flow test script hardcodes a macOS Chrome path (`/Applications/Google Chrome.app/...`); it is not portable to the current Windows environment without configuration changes. It also expects a running local app at port 5173.

## Existing file-to-responsibility mapping

### Application entry, navigation, shared state, and styling

| Existing file | Current responsibility | Migration role |
|---|---|---|
| `src/main.tsx` | React root and global CSS entry | Keep; initialize app/providers as needed |
| `src/App.tsx` | View parsing, navigation, page composition, global providers | Preserve pages; connect route compatibility and shared Shopify-backed providers |
| `src/index.css` | Tailwind directives, global reset, Lenis and rendering utilities | Preserve |
| `tailwind.config.js` | Brand palette and font/theme configuration | Preserve |
| `vite.config.ts` | Vite React plugin, build chunking, dev server | Add only necessary public env/build configuration |
| `index.html` | Initial document metadata, organization schema, fonts, preload | Keep baseline SEO; align with final rendering strategy |
| `src/types/index.ts` | Product/cart/customer/page-view types | Add Shopify/domain types; remove demo-only models as migration completes |

### Shared storefront and homepage sections

| Existing file | Current role | Intended Shopify source |
|---|---|---|
| `src/components/MyrklsHeader.tsx` | Header, shop menu, account/search/cart controls; static category data | Header/global settings and collection data |
| `src/components/MyrklsHero.tsx` | Animated static hero slides | Hero-banner Metaobjects |
| `src/components/MyrklsProductGrid.tsx` | Homepage product cards, add-to-cart and local wishlist | Storefront product/collection service; Shopify cart |
| `src/components/MyrklsScienceSection.tsx` | Static homepage science content | Homepage section/brand content Metaobject |
| `src/components/MyrklsFeaturedInnovation.tsx` | Static innovation feature | Homepage section Metaobject |
| `src/components/MyrklsGlobalScienceNetwork.tsx` | Static science-network visual/content | Homepage section Metaobject; preserve diagram presentation |
| `src/components/MyrklsFeaturedProtection.tsx` | Featured sunscreen content/product callout | Product plus homepage section Metaobject |
| `src/components/MyrklsFAQ.tsx` | Static FAQ accordion | FAQ Metaobjects |
| `src/components/MyrklsReviews.tsx` | Static review/testimonial content | Testimonial Metaobjects or a selected review integration |
| `src/components/MyrklsFooter.tsx` | Footer navigation and content | Footer configuration and global settings Metaobjects |
| `src/components/MyrklsCartDrawer.tsx` | Cart drawer UI, quantities, subtotal, checkout navigation | Keep UI; use Shopify cart mutations, totals, and checkout URL |
| `src/components/MyrklsSearchModal.tsx` | Local product/keyword search UI | Keep UI; use Storefront product search |
| `src/components/MyrklsAuthModal.tsx` | Simulated phone/email/OTP/social auth | Replace or adapt to Shopify Customer Account API flow |
| `src/components/SmoothScroll.tsx` | Lenis lifecycle wrapper | Preserve |

### Catalog and product detail

| Existing file | Current role | Migration role |
|---|---|---|
| `src/components/MyrklsViewAllPage.tsx` | Catalog, category filtering, quick view, local wishlist | Storefront collection/product query, filtering, sorting, pagination |
| `src/components/pdp/MyrklsProductDetailPage.tsx` | PDP shell and section composition | Resolve Shopify product/variant; preserve section layout |
| `src/components/pdp/MyrklsProductHeroSection.tsx` | PDP hero, gallery, variant/size selection, add and buy now | Storefront product/variant data and cart actions |
| `src/components/pdp/MyrklsProductSection2.tsx` | Static science/ingredient section | Product metafields/Metaobjects |
| `src/components/pdp/MyrklsProductSection3.tsx` | Static recommendations | Shopify product recommendations/collection configuration |
| `src/components/pdp/MyrklsProductHowToUseSection.tsx` | Static ritual/how-to content | Product metafields or structured Metaobject content |
| `src/components/pdp/MyrklsProductFaqSection.tsx` | Static product FAQ mapping | Product-linked FAQ Metaobjects |
| `src/components/pdp/MyrklsProductReelsSection.tsx` | Static product media/reels | Shopify Files and product/section content |
| `src/components/pdp/MyrklsProductReviewSection.tsx` | Static product reviews | Review integration or managed review content; confirm source of truth |
| `src/data/products.ts` | Hardcoded catalog, product descriptions, prices, search terms and hero config | Retire as commerce source after Storefront API migration; keep only genuinely non-commerce UI constants if needed |

### Checkout, customer, and other pages

| Existing file | Current role | Migration role |
|---|---|---|
| `src/context/MyrklsCartContext.tsx` | Local cart state, product lookup, browser totals/storage | Replace internals with Shopify Cart API and persistent cart ID |
| `src/context/MyrklsAuthContext.tsx` | Demo identity, local orders/addresses/wishlist | Replace real identity/order behavior with Shopify Customer Accounts; avoid duplicate customer/order DB |
| `src/components/checkout/MyrklsCheckoutPage.tsx` | Custom address/payment form and simulated order/discount flow | Keep only if it leads into Shopify checkout; otherwise route to hosted checkout |
| `src/components/account/MyrklsAccountDashboard.tsx` | Local profile, addresses, wishlist, demo order history | Customer Account API auth and Shopify-provided account/order experience |
| `src/components/MyrklsSEO.tsx` | Client-side metadata and structured data | Source product SEO from Shopify; preserve page SEO and validate crawlable output |
| `src/components/MyrklsOurSciencePage.tsx` | Static science page | Shopify Page/Metaobject content |
| `src/components/MyrklsAboutUsPage.tsx` | Static brand story | Brand story Metaobject/Shopify page |
| `src/components/MyrklsContactUsPage.tsx` | Static contact page and locally persisted inquiries | Shopify page content; send submissions to a secure backend/support provider |
| `src/components/MyrklsTermsPage.tsx` | Static terms content | Shopify page/content; confirm legal publishing workflow |
| `src/components/MyrklsPrivacyPolicyPage.tsx` | Static privacy content | Shopify page/content; confirm legal publishing workflow |
| `src/components/MyrklsShippingPolicyPage.tsx` | Static shipping policy and FAQs | Shopify page/content |
| `src/components/MyrklsReturnsRefundsPage.tsx` | Static returns policy and FAQs | Shopify page/content |
| `src/types/index.ts` | Cart, customer, order and view types | Migrate domain types with the corresponding features |

### Scripts and configuration

| Existing file | Current responsibility | Migration role |
|---|---|---|
| `package.json` | Scripts and current React/UI dependencies | Add dependencies only when required by the selected architecture |
| `scripts/verify_flows.cjs` | Puppeteer home/PDP/cart/checkout/account/catalog flow checks | Update assertions for Storefront data and hosted-checkout handoff; make browser path configurable |
| `postcss.config.js` | Tailwind and Autoprefixer setup | Preserve |
| `tsconfig.json`, `tsconfig.node.json` | TypeScript configuration | Extend only as needed |
| `.gitignore` | Generated/dependency exclusions | Ensure secret env files and server build outputs are excluded |
| `public/` | Current static brand/product assets | Reuse where appropriate; transfer editable CMS media to Shopify Files |

## Recommended target architecture

```text
React + Vite storefront
  ├─ Public Storefront API client (environment-configured, pinned API version)
  ├─ Product, collection, search, cart, metaobject, page/blog services
  ├─ Existing MYRKLS UI components and route compatibility
  └─ Shopify-hosted checkout URL

Small Node/serverless backend
  ├─ Shopify Admin GraphQL client (server-only credentials)
  ├─ Authenticated, minimal management endpoints where required
  ├─ Verified Shopify webhooks + idempotency + structured logs
  └─ No parallel customer/order/inventory database

Shopify
  ├─ Products, variants, inventory, collections, discounts and orders
  ├─ Customer Accounts
  ├─ Pages/blogs where required
  ├─ Files for CMS media
  └─ Metaobjects/Metafields for editable storefront content
```

Only explicitly approved component types should be rendered from CMS configuration. CMS records should contain data/configuration, never executable code.

## Incremental migration plan and exit gates

### Phase 1 — Audit and architecture (complete)

- Inventory existing routes, components, styles, data, integrations, SEO and test setup.
- Preserve the current design and record source-to-Shopify mappings.
- **Exit gate:** approve the migration boundaries and confirm unresolved deployment/account decisions below.

### Phase 2 — Storefront API foundation

- Select and pin a currently supported Storefront API version.
- Configure public Storefront credentials through Vite environment variables; add a centralized typed GraphQL client with explicit GraphQL/HTTP error handling.
- Add reusable services for products, variants, collections, search, carts, metaobjects/metafields, pages and blogs as required.
- Define pagination and a small request cache/loading/error contract without unnecessary duplicate requests.
- **Exit gate:** service-level tests for pagination, API errors, cache behavior, and representative product/collection/cart response mapping.

### Phase 3 — Shopify content model

- Define validated Metaobject schemas and storefront access for global settings, header, footer, hero banners, homepage sections, promotions, testimonials, FAQs, brand story, trust badges and landing pages.
- Store images/video in Shopify Files and define responsive desktop/mobile media fields.
- **Exit gate:** schema/content access reviewed in Shopify and representative records render in a non-production environment.

### Phase 4 — Dynamic shared content

- Add a typed, approved-component homepage section registry supporting order, visibility, content, media, CTA, background/color, and responsive settings.
- Connect header, footer, hero, announcement, featured content, testimonials and FAQ components while preserving their existing markup/animations.
- **Exit gate:** content edits in Shopify visibly update the app; unknown section types are ignored safely and no arbitrary CMS code is executed.

### Phase 5 — Products and collections

- Replace local product source and matching in product cards, collection view, search, PDP, recommendations and product SEO.
- Support variants, availability, compare-at prices, sorting, filters and cursor pagination.
- **Exit gate:** all seven products and representative collection/search/filter/sort/pagination cases agree with Shopify data.

### Phase 6 — Cart and checkout

- Replace local cart item persistence with Shopify Cart API operations and persisted cart ID.
- Use Shopify-returned amounts and discount validation; never make client-calculated totals authoritative.
- Send customers to Shopify's hosted checkout URL. Remove the simulated payment/card collection path.
- **Exit gate:** create/add/update/remove/restore/discount/checkout-handoff flows verified against a Shopify development store.

### Phase 7 — Secure backend and webhooks

- Add a small Node/serverless service with Admin API credentials exclusively on the server.
- Add only required scopes, authenticated management routes, Shopify HMAC verification, idempotency, structured logging and explicit error responses.
- Implement order-created, product-updated and inventory-updated webhooks only where a real downstream action requires them.
- **Exit gate:** signature, replay/idempotency and failure-path tests pass; no Admin token appears in client bundles or logs.

### Phase 8 — Customer accounts and order management

- Replace demo login, fake OTP, local order data and address behavior with the Shopify Customer Account API flow if these customer features remain in scope.
- Keep Shopify authoritative for customers, orders, inventory and fulfilment.
- **Exit gate:** real authentication and account/order experience verified with test customers without duplicate customer/order storage.

### Phase 9 — SEO and URL compatibility

- Map legacy hash/query navigation to stable product, collection and content URLs; configure host rewrites/redirects and sitemap compatibility.
- Populate dynamic title, description, canonical, Open Graph, alt text and Product/Breadcrumb JSON-LD from Shopify data.
- Validate the chosen rendering solution with crawler/social previews; SPA-only metadata changes are not assumed to be crawlable.
- **Exit gate:** route/redirect matrix, canonical/structured-data checks, and representative crawler output pass.

### Phase 10 — Performance, accessibility and release validation

- Test responsive layouts, keyboard/dialog behavior, image loading, loading/error/empty states, request volume, console output and API caching.
- Reduce the current large application chunk where justified, without removing existing animation or UI behavior.
- Run the updated browser flow suite against a test store and document deployment, Shopify admin content editing and rollback.
- **Exit gate:** agreed functionality and performance checks pass before production cutover.

## Decisions needed before implementation

1. **Deployment target:** which host should run the React site and Node/serverless backend (for example, Vercel, Netlify, or an existing server)? This determines runtime, routing rewrites, secret configuration, and webhook endpoints.
2. **Customer accounts:** are login, saved addresses, wishlist, and account order history required at launch, or should the first commerce release use Shopify checkout without a custom account dashboard?
3. **Content authority:** should existing legal/policy text remain in React until manually moved, or should all informational pages be Shopify-managed in the first CMS release?
4. **Commerce setup:** confirm the Shopify store/domain, market/currency configuration, and the development store or test credentials that will be used. No credentials should be sent in chat or committed.

## Verification snapshot

- `npm run build`: **passes** (`tsc` and Vite production build).
- Existing build advisory: main `index` JavaScript chunk is 529.18 kB minified (107.72 kB gzip), over Vite's 500 kB warning threshold.
- `npm test`: **not run** during the read-only audit; the script expects the app to be running and points to a macOS-only Chrome executable path.
- No Shopify API integration or backend has been configured or verified yet.
