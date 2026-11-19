# MYRKLS CMS Phase 4 Implementation Report

## Outcome

Added a Shopify Admin Page Builder UI foundation in `apps/shopify-admin`. It is an authenticated route with a schema-derived section library, a responsive page canvas, section inspector, local page settings, and in-memory draft editing.

This phase is **not a connected or production-ready page builder**. Save Draft is intentionally disabled; no Shopify content read or write is performed.

## Mandatory prerequisite review

- **Phase 1:** the audit, architecture, and schema plan documents are present. They require a strict approved section allowlist and preserve Shopify commerce as the source of truth.
- **Phase 2:** the implementation report, schema reference, and protection report are present. The local manifest defines `cms_page`, `cms_page_template`, and `cms_section`; `cms_page` uses native Metaobject entry handles, references an ordered list of `cms_section` entries, and stores page type, template, SEO, and robots fields. `cms_section` has generic editorial, media-reference, CTA, visibility, order, and JSON configuration fields. It does **not** define all of the type-specific fields shown in the Phase 4 prompt. The eight supported section identifiers are taken directly from the Phase 2 manifest. Live definition deployment/compatibility remains unknown: the Phase 2 preflight was blocked for missing Admin credentials.
- **Phase 3:** the implementation report is present. The app source includes Shopify SDK authentication, persistent Prisma session storage, authenticated request/store-context validation, and a read-only Admin GraphQL layer. However, the app is not linked or installed, PostgreSQL is not configured, and live OAuth/API behavior has not been verified. Its current requested scopes are only `read_metaobject_definitions` and `read_metafield_definitions`; it has no CMS Metaobject entry read/write operations or file picker.
- The requested `MYRKLS_CMS_PHASE_3_AUTHENTICATION_ARCHITECTURE.md`, `MYRKLS_CMS_PHASE_3_SECURITY_REPORT.md`, and `MYRKLS_CMS_PHASE_3_PROTECTION_REPORT.md` files are missing. Actual app source and the Phase 3 implementation report were inspected instead; their absence remains a documentation gap.

Because live prerequisites are incomplete, no protected Shopify integration was bypassed and no fake Shopify pages, templates, files, or entries were supplied.

## Implemented UI foundation

- Added `/app/page-builder`, `/app/page-builder/new`, and `/app/page-builder/:pageId` routes beneath the existing authenticated app layout, plus the Page Builder App Bridge navigation item.
- The page list states that live pages were not loaded and does not imply the store has no CMS pages. Search and existing-page editing are unavailable until authenticated entry reads are authorized and implemented.
- The new-page editor provides:
  - Searchable section cards and category filters for the exact eight Phase 1/2 section types.
  - An in-memory canvas with selection, stable client IDs, insert-between, duplicate, confirmed removal, visibility controls, native drag-and-drop, and accessible move-up/down actions.
  - Desktop/mobile canvas width selection and controlled inspector/page fields based on the actual local manifest.
  - Page type and SEO controls matching `cms_page`; template and Shopify file/reference pickers remain disabled because no authenticated resource reads are available.
  - Local handle/field/JSON validation, a plain-text-only rich-text adapter, and rejection of commerce keys in section JSON configuration.
  - Dirty-state indication and navigation/unload warnings. No draft is written to Shopify or browser storage.
- The snapshot and rich-text adapters operate only on local editor structures. They are not Shopify GraphQL mutation payloads; resource/reference resolution and verified Shopify serialization remain blocked.
- No dependency or Shopify scope was added. Existing storefront, cart, checkout, customer-account, Vercel, and Shopify integration source was not changed.

## Verification

- Admin app `npm run typecheck`: passed.
- Admin app `npm test`: passed, 9 test files and 31 tests.
- Admin app `npm run build`: passed; React Router printed future-flag notices and server-only route modules produced empty client chunks.
- VS Code diagnostics for `apps/shopify-admin`: no diagnostics.
- No dependencies or Shopify scopes were added.
- The existing storefront was not changed. Its build and `npm run test:shopify` passed in the preceding Phase 3 validation. Its browser `npm test` remains a known failure at cart-line removal (`Node is either not clickable or not an Element`); that test was not rerun in Phase 4.

## Blockers before enabling persistence

1. Link the app to the authorized Shopify Dev Dashboard record, provision PostgreSQL, install on an approved development store, and verify OAuth, Admin API access, store isolation, and session restoration.
2. Read back the live `cms_page`, `cms_page_template`, and `cms_section` definitions and compatible entry data; do not infer deployed schema from the local manifest.
3. Obtain owner approval for least-privilege CMS entry/file scopes. Implement and test server-only list/template/reference/create/update operations, handle uniqueness checks, draft semantics, Shopify `userErrors`, and partial failures against the actual API version.
4. Implement server-side field/reference validation, safe serialization to the real schema, and image/template pickers. Confirm drafts remain unpublished and preview does not expose them publicly.
5. Add integration tests against an authorized development store before enabling Save Draft. Do not publish content in this phase.

