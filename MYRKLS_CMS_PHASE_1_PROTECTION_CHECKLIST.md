# MYRKLS CMS Phase 1 — Protection Checklist

**Purpose:** confirm that the existing Shopify functionality stays protected while the CMS is planned.

## 1. Critical no-change rule

This phase does not authorize any source-code modification to the live storefront or Shopify integration. The existing system is considered production-protected until a separate approved implementation phase is authorized.

## 2. Required protections

### 2.1 Storefront configuration

- [ ] Do not rename or remove `VITE_SHOPIFY_STORE_DOMAIN`
- [ ] Do not rename or remove `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- [ ] Do not rename or remove `VITE_SHOPIFY_API_VERSION`
- [ ] Do not add private Admin credentials to the frontend
- [ ] Keep Storefront API validation logic in `src/shopify/config.ts`
- [ ] Keep public-token-only access separated from any admin flow

### 2.2 GraphQL and API client integrity

- [ ] Do not replace the public GraphQL client in `src/shopify/graphql-client.ts`
- [ ] Do not remove timeout/retry/cache protection
- [ ] Do not bypass error normalization in `src/shopify/errors.ts`
- [ ] Keep Storefront requests limited to public product/catalog data

### 2.3 Product and collection behavior

- [ ] Keep product queries in `src/shopify/services/products.ts`
- [ ] Keep collection logic in `src/shopify/services/collections.ts`
- [ ] Keep product/variant image handling in the existing mapping pipeline
- [ ] Keep product price, variant, compare-at, and inventory as Shopify-owned data
- [ ] Do not create CMS fields that duplicate product commerce data

### 2.4 Search and discovery

- [ ] Preserve product search and indexing behavior in `src/shopify/services/search.ts`
- [ ] Keep UI search flows in the storefront and not in CMS content
- [ ] Do not expose CMS-defined search logic as a replacement for Shopify search

### 2.5 Cart and checkout

- [ ] Preserve cart creation, retrieval, update, remove, and restore logic
- [ ] Preserve local cart-ID persistence semantics for Shopify cart recovery
- [ ] Preserve Shopify checkout URL validation and redirect flow
- [ ] Keep checkout provider and payment flow inside Shopify-hosted checkout
- [ ] Do not allow CMS content to construct or overwrite checkout URLs
- [ ] Do not add mock payment flows or fake checkout success states

### 2.6 Customer accounts

- [ ] Keep OAuth workflow and session validation in `src/shopify/customer-account/auth.ts`
- [ ] Keep account profile/order/address logic in the Shopify customer-account service layer
- [ ] Do not expose customer tokens, IDs, or session markers in CMS content
- [ ] Keep customer account UI separate from CMS rendering
- [ ] Do not allow external CMS editors to manipulate account data or session state

### 2.7 Routing and SEO

- [ ] Preserve `src/routing/routes.ts` canonical route handling
- [ ] Preserve SPA rewrites in `vercel.json`
- [ ] Keep Shopify product and collection route resolution intact
- [ ] Do not allow CMS handles to override canonical commerce routes without validation
- [ ] Keep metadata generation in `src/seo/metadata.ts` and `MyrklsSEO.tsx`
- [ ] No arbitrary canonical or noindex values should be set from unapproved CMS content

### 2.8 Analytics and consent

- [ ] Preserve consent gating in `src/analytics/`
- [ ] Keep event contracts controlled by code, not CMS entries
- [ ] Keep tracking IDs and pixel configuration separate from public content
- [ ] Do not allow draft or preview content to trigger production analytics by default

### 2.9 Deployment and hosting

- [ ] Keep Vercel security headers and rewrites unchanged during CMS planning
- [ ] Do not add admin tokens or secrets into the client build
- [ ] Do not treat the frontend as a private Admin app backend
- [ ] Keep server-side CMS logic out of the public storefront bundle

### 2.10 Content protection

- [ ] CMS content may only configure editorial sections and approved static metadata
- [ ] CMS content may not contain scripts, inline CSS, or executable templates
- [ ] CMS content may not inject arbitrary URLs or redirect payloads
- [ ] CMS content may not replace product or collections with fake commerce data
- [ ] CMS content may not override legal, shipping, or payment policy content without explicit owner approval

## 3. Approval gate before CMS implementation

Do not proceed to CMS implementation until all of the following are approved:

- [ ] Shopify store domain and production environment are confirmed
- [ ] Public Storefront token is verified and separate from admin credentials
- [ ] A merchant-approved list of editable content surfaces exists
- [ ] Metaobject and page schema are reviewed by the owner
- [ ] A private backend and preview flow are approved
- [ ] Product and legal-review risk areas are explicitly signed off
- [ ] The storefront build remains passing before and after any CMS integration work

## 4. Failure conditions

The implementation is unsafe if any of the following occur:

- public content starts to store private app or customer data
- checkout or customer account logic is replaced by a CMS-owned layer
- product prices/variants are duplicated or modified outside Shopify
- arbitrary CMS code or script is executed in the storefront
- unvalidated admin content is allowed to affect route resolution or SEO output

## 5. Signoff summary

This checklist is the protection boundary for Phase 1. Any future CMS implementation must preserve these conditions exactly and must be treated as a separate, explicit change set, not an incremental mutation of the current Shopify commerce layer.
