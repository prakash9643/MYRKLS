# MYRKLS CMS Phase 2 — Migration Plan

**Status:** Planning and schema foundation only. No content or live schema was migrated.

## 1. Non-destructive migration principles

- Preserve existing Shopify definitions and entries until the owner approves a specific mapping.
- Never rename, overwrite, delete, or duplicate a legacy definition automatically.
- Preserve the current Storefront reader contracts until a separate runtime integration has been reviewed.
- Keep Shopify product, variant, pricing, availability, inventory, cart, checkout, and customer-account state authoritative.
- Treat all uncertain or conflicting mappings as `REQUIRES_REVIEW`.

## 2. Definition rollout sequence

1. **Freeze the baseline.** Save a reviewed snapshot of existing Metaobject and Metafield definitions from the target store. Confirm store domain and API version.
2. **Validate locally.** Run `npm run typecheck:cms`, `npm run cms:schema:check`, and `npm run test:cms-schema`.
3. **Run read-only preflight.** Supply least-privilege read scopes and run `npm run cms:schema:preflight`. No `--apply`.
4. **Triage every result.** Resolve incompatible fields, access mismatches, extra fields, legacy aliases, unsupported types, and unknown content relationships with the merchant.
5. **Review Metafield impact.** Inventory existing unstructured values in namespace `cms` for affected owners. Shopify definition creation may validate and attach matching values.
6. **Approve a specific additive change set.** Record exact store, definitions, requested scopes, and content-value impact. Do not approve unresolved `INCOMPATIBLE`, `REQUIRES_REVIEW`, or `SKIPPED` items.
7. **Create missing definitions only.** Use the CLI's explicit flags and interactive store-name confirmation in a trusted terminal. Definitions are created in reference dependency order.
8. **Read back and compare.** Require every item to be `ALREADY_COMPATIBLE`. Capture the final report for the change record.
9. **Pause before content migration.** Schema existence does not imply content is ready or safe to render. Treat entry creation, publishing, and runtime wiring as separate approvals.

There is no automated rollback by deletion. If an issue occurs, stop further changes and use a separately reviewed recovery plan that preserves data and existing storefront behavior.

## 3. Legacy type crosswalk

Aliases in the manifest signal a possible conflict, not an automatic migration instruction.

| New manifest type | Existing/legacy names recognized for review |
|---|---|
| `site_global_settings` | `global_website_settings` |
| `cms_page` | `custom_landing_page` |
| `cms_section` | `homepage_section`, `homepage_section_block` |
| `cms_page_template` | `cms_template` |
| `header_navigation_settings` | `header_configuration` |
| `footer_settings` | `footer_configuration` |
| `announcement_bar` | `promotional_banner` |
| `faq_entry` | `faq` |
| `testimonial_story` | `testimonial` |
| `brand_story_section` | `brand_story` |

The existing content service reads `homepage_section`, `promotional_banner`, `testimonial`, `faq`, and `brand_story` with its existing field shapes. A type alias does not prove that the new type has equivalent fields or entries. The preflight reports aliases for review rather than creating duplicate types.

## 4. Compatibility map and deferred work

| Surface | Phase 2 schema decision | Migration/runtime work still required |
|---|---|---|
| Homepage hero | Preserve current `homepage_hero_banner` reader keys | Inspect live entries; verify required media and CTA values before any future reader rollout |
| Homepage sections | Add distinct `cms_section` with Phase 1's eight allowed section values | Map current `homepage_section.component_type` values and fields; agree on handling unsupported values; do not change the existing reader in this phase |
| Header/footer menus | Store native menu handles | Validate handles against Shopify Navigation and preserve existing menu-rendering behavior |
| Pages/templates | Define page metadata and section references; rely on native entry handle | Decide route ownership, collision handling, SEO precedence, and fallback before publishing pages |
| Product/collection editorial | Add `cms` namespace presentation-only definitions | Verify current unstructured values and ensure no product commerce field is shadowed |
| FAQs/testimonials/brand stories | Add new editorial definitions and references | Reconcile legacy types and entries, validate claims/consent, and map existing UI contracts |
| Policy content | Add owner-reviewed content definition | No legal-policy route or content replacement without explicit legal/owner approval |

## 5. Section allowlist discrepancy

Phase 1 approves eight values for `cms_section.section_type`: `hero`, `science`, `innovation`, `protect`, `testimonial`, `faq`, `image_grid`, and `product_feature`.

The current homepage reader's component allowlist contains twelve values: `hero`, `featured_products`, `featured_collections`, `science`, `innovation`, `global_science_network`, `featured_protection`, `testimonials`, `faq`, `promotional_banner`, `brand_story`, and `trust_badges`.

These sets are not equivalent. Phase 2 does not widen the Phase 1 allowlist, silently map names, or modify the reader. A future migration must obtain an explicit owner-approved mapping and define treatment of values with no approved equivalent.

## 6. Hero and menu compatibility

- The new hero schema follows the existing reader's field contract, rather than introducing a second naming convention. Do not migrate data between alternate proposed hero keys until existing definitions and entries are reviewed.
- `cms_page.handle` is Shopify's built-in entry handle.
- Navigation remains in Shopify's native menu resources. CMS settings only refer to a menu handle; they do not duplicate or replace menu hierarchy.

## 7. Required go/no-go checks

Go only if the owner approves the target store and manifest, preflight is free of unresolved blockers, existing unstructured values are reviewed, required Admin scopes are approved, and post-creation read-back passes. No-go if any of these conditions is unknown or fails.
