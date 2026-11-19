# MYRKLS CMS Phase 2 — Protection Report

**Outcome:** The CMS schema foundation is additive and isolated. Existing Shopify commerce behavior remains the source of truth. This report does not certify a live Shopify deployment.

## 1. Protected domains

| Domain | Protection boundary |
|---|---|
| Product and variant catalog | Shopify product/variant data remains authoritative; no CMS price, compare-at, SKU, inventory, availability, or variant fields were added |
| Collections | Shopify membership remains authoritative; the CMS banner and editorial content do not change collection membership |
| Cart and checkout | Existing Shopify cart state, cart identifiers, checkout URL validation, and Shopify-hosted checkout handoff are untouched |
| Customer accounts | Customer tokens, addresses, order history, profile data, and OAuth/session logic are excluded from CMS fields |
| Storefront API | Existing public GraphQL client, endpoint configuration, retry/cancellation behavior, and token are not changed |
| Routing and SEO | No route, canonical path, metadata renderer, or policy route was connected to CMS |
| Analytics and consent | No event contract, consent gate, tracking configuration, or analytics runtime was changed |
| Secrets | Admin token is process-environment-only in the CLI; it is not a `VITE_*` setting, manifest field, or public value |

## 2. Additive write safeguards

The schema CLI:

- Validates the local manifest before network access.
- Uses the Admin API only from the server-side Node process.
- Sends no Admin request when required process environment values are missing.
- Uses read-only behavior unless `--apply` is present.
- Requires `SHOPIFY_CMS_SCHEMA_APPROVED=true`, an interactive exact-store confirmation, no blocking comparison results, and a separate `SHOPIFY_CMS_SCHEMA_METAFIELD_DATA_REVIEWED=true` gate when creating Metafield definitions.
- Creates only missing definitions, in reference dependency order.
- Does not update, delete, rename, migrate, or publish definitions or entries.
- Reads definitions back after creation and fails if any do not compare as compatible.
- Redacts the configured token and Shopify token-shaped strings from error text.

Metafield definition creation can validate and attach matching unstructured values. The dedicated owner-review gate is therefore required for any Metafield creation.

## 3. Content and rendering protections

- Metaobjects are merchant-editable and Storefront public-read only.
- Schema content is editorial; it is not executable code, a template engine, or a script/style injection channel.
- Media fields are image-restricted where the manifest declares image references.
- Section types are restricted to the exact Phase 1 allowlist.
- Native menu content is not copied into CMS fields.
- Rich text is represented as Shopify rich text; safe rendering and runtime validation remain requirements for any future integration.
- Policy content does not automatically override Shopify policy pages or existing application routes.

This phase adds no runtime renderer. The existing reader retains its independent validation and allowlist behavior; the new schema must not be treated as connected or trusted by the frontend solely because definitions exist.

## 4. Verification evidence

- CMS-specific strict TypeScript check passed.
- Manifest validation passed with 12 Metaobject definitions, 10 Metafield definitions, and 8 approved section types.
- Focused CMS tests passed, including validation failure cases, incompatible comparison, legacy alias review, idempotent comparison, and token redaction.
- Production build and existing Shopify-focused tests passed.
- Live preflight reported `PENDING_APPROVAL`: all 22 definitions were skipped because `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, and `SHOPIFY_ADMIN_API_VERSION` were missing. The output confirmed no Admin API request was sent.
- No Shopify write operation or change to a live store occurred.

The existing `npm test` browser-flow check did not pass in this verification: it exited on `Node is either not clickable or not an Element` while attempting cart-line removal, after earlier quantity-update and refresh-restoration checks passed. It did not reach its final aggregate network assertions. The test was not modified or suppressed.

## 5. Residual risks and gates

- The existing Storefront reader and the new CMS schema have intentionally not been unified. The eight Phase 1 section types differ from the current 12-value reader allowlist.
- Existing legacy definitions and unstructured Metafield values have not been inspected on the live store because no Admin credentials are configured.
- The Storefront `homepage_hero_banner` field contract is preserved locally, but live definition compatibility remains unverified.
- Merchant approval, least-privilege Admin access, live read-only preflight, content review, and post-deployment read-back remain mandatory.
- A later storefront integration requires a separate change review for rich-text safety, URL allowlisting, route/SEO behavior, cache/fallback behavior, published-only reads, and visual/commerce regression tests.

## 6. Failure conditions

Stop rollout if CMS data could modify commerce state, Admin credentials can enter a client bundle, an unknown/legacy schema is overwritten, an incompatible preflight is bypassed, or unvalidated content can control routes or execute code. Do not resolve the existing browser test failure by weakening its assertions or changing Shopify behavior as part of this schema-only work.
