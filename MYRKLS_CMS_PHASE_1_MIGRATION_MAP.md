# MYRKLS CMS Phase 1 — Migration Map

**Scope:** read-only audit and migration planning only.

## 1. Objective

This map identifies the current Shopify-protected implementation and the safe future CMS boundary. It is not a request to refactor or replace working commerce code.

## 2. Protected storefront areas

| Area | Existing implementation | Current source of truth | CMS boundary |
|---|---|---|---|
| Storefront config | `src/shopify/config.ts` | `VITE_SHOPIFY_*` env values | Public config only; no Admin secrets |
| Products | `src/shopify/services/products.ts` | Shopify Storefront API | CMS can select references; not replace product data |
| Collections | `src/shopify/services/collections.ts` | Shopify Collection data | CMS may add section/banner metadata |
| Product detail pages | `src/components/pdp/MyrklsProductDetailPage.tsx` | Shopify product and variant data | CMS may add editorial layout refs |
| Search | `src/shopify/services/search.ts` and `ShopifySearchResults.tsx` | Shopify product search | CMS may configure empty-state copy only |
| Cart | `src/context/MyrklsCartContext.tsx` and `src/shopify/services/cart.ts` | Shopify cart API | CMS must not overwrite cart state or checkout logic |
| Checkout | `src/App.tsx` and cart drawer handoff | Shopify-hosted checkout URL | Rewrite or redirect must remain code-controlled |
| Customer accounts | `src/context/ShopifyCustomerAccountContext.tsx` | Shopify Customer Account API | no CMS override |
| Routing | `src/routing/routes.ts` and `src/App.tsx` | canonical route mapping | CMS can later add allowlisted page handles |
| SEO metadata | `src/seo/metadata.ts` and `MyrklsSEO.tsx` | existing route logic + Shopify product data | CMS may provide approved page metadata |
| Analytics | `src/analytics/` | consent-aware analytics layer | no CMS event override |

## 3. Repository file-to-CMS mapping

| Repository file | Current role | CMS ownership recommendation | Protection status |
|---|---|---|---|
| `src/App.tsx` | route resolution, page composition, app providers | route-level CMS hooks only; no commerce replacement | Protected |
| `src/routing/routes.ts` | canonical paths and legacy route normalization | add allowlisted page handles only | Protected |
| `src/components/MyrklsHeader.tsx` | header and menu UI | navigation labels and links can become CMS-driven later | Protected |
| `src/components/MyrklsFooter.tsx` | footer content | copy/links may be CMS-managed later | Protected |
| `src/components/MyrklsHero.tsx` | homepage hero carousel | hero banner content can be CMS-managed later | Protected |
| `src/components/MyrklsProductGrid.tsx` | homepage product cards | CMS may select featured product references | Protected |
| `src/components/pdp/MyrklsProductDetailPage.tsx` | product detail layout | CMS may add editorial blocks but not override product data | Protected |
| `src/components/MyrklsViewAllPage.tsx` | collection and catalog view | CMS may configure layout/template references | Protected |
| `src/components/MyrklsSearchModal.tsx` | product search modal | empty-state text may later be CMS-driven | Protected |
| `src/components/MyrklsCartDrawer.tsx` | cart drawer UI | no layout takeover; keep cart action semantics | Protected |
| `src/components/account/ShopifyCustomerAccountPage.tsx` | account UI | no CMS override of login/session flow | Protected |
| `src/shopify/graphql-client.ts` | public Storefront API transport | do not replace with CMS data fetcher | Protected |
| `src/shopify/services/cart.ts` | cart mutations and checkout URL generation | no replacement with CMS logic | Protected |
| `src/shopify/customer-account/auth.ts` | OAuth and token validation | no replacement or CMS rewriting | Protected |
| `src/shopify/services/metaobjects.ts` | public metaobject reads | future CMS fetch layer | Protected |
| `src/data/products.ts` | legacy fallback product data | fallback only; not a future source of truth | Protected |
| `index.html` and `src/seo/metadata.ts` | base SEO and metadata | page metadata can be later validated and expanded | Protected |
| `vercel.json` | security headers and SPA rewrites | keep as deployment protection boundary | Protected |

## 4. Existing content that can be migrated later

The following content is suitable for later Shopify-managed editing, but only behind a typed allowlist and validation layer:

- announcement bar message
- global site branding copy and social links
- header navigation labels and destinations
- footer contact columns and text
- homepage hero text and media
- homepage science/innovation/featured sections
- FAQ blocks
- testimonial content
- policy/legal text after owner review
- section ordering and visibility

## 5. Content that must never be migrated to CMS writeable fields

- price and compare-at price
- variant inventory and stock status
- merchandise IDs
- product identifiers
- cart IDs
- checkout URL
- customer access tokens or session payloads
- order history, addresses, and customer profile data
- payment/shipping provider configuration
- arbitrary scripts, CSS, component names, or code execution payloads

## 6. Recommended migration sequence

1. Lock current Shopify commerce implementation.
2. Define public CMS content types and allowlists.
3. Add typed readers and validation for published content only.
4. Connect approved homepage sections to the registry one at a time.
5. Add header/footer/page content after route protections are verified.
6. Only then consider product or collection editorial overlays.
7. Keep cart/account/checkout unmodified until the final signoff.

## 7. Non-goals for this audit

- no UI visual changes
- no dependency changes
- no checkout/cart logic changes
- no customer account flow changes
- no new Admin app or database setup
- no private token exposure

## 8. Exit criteria for a safe CMS phase

A CMS implementation may proceed only when all of the following are true:

- all existing Shopify services remain untouched and passing
- route and SEO protections remain in place
- content validation is implemented before render
- preview and draft handling keeps private data off the public storefront
- no code execution is possible through CMS content
- legal, product, and shipping claims are reviewed by the merchant
