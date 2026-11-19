# MYRKLS CMS Phase 1 — Schema Plan

**Status:** Planning only. No Shopify schema or app code is created in this phase.

## 1. Purpose

This document defines a safe, future-facing CMS content model that preserves the existing Shopify commerce layer. The goal is to allow editorial and layout content to be managed in Shopify Admin without replacing, weakening, or duplicating Shopify product, cart, checkout, or customer-account behavior.

The schema below is intentionally conservative. It separates:

- Commerce data owned by Shopify and kept authoritative
- CMS-managed presentation data for layout/content
- App-only operational metadata that must never be exposed to the public storefront

## 2. Design invariants

1. Storefront product, variant, inventory, pricing, cart, checkout, and customer account behavior remain controlled by the existing Shopify implementation.
2. CMS schema may control layout blocks, text content, media references, CTA labels, page ordering, and section visibility.
3. The storefront must never trust unvalidated Shopify CMS content.
4. Only allowlisted section types may render.
5. No private Admin credentials or app secrets may be stored in `VITE_*` variables or public content.

## 3. Commerce source-of-truth map

| Domain | Source of truth | CMS role | Protected |
|---|---|---|---|
| Product catalog | Shopify Product/Variant/Inventory | choose references, ordering, feature badges | Yes |
| Pricing and compare-at price | Shopify Storefront API | no writeback or override | Yes |
| Collections and membership | Shopify Collection | choose banner/layout references | Yes |
| Cart and checkout | Shopify Cart API and checkout URL | read-only UI CTA labels only | Yes |
| Customer account | Shopify Customer Account API | no writing to customer data | Yes |
| SEO and canonical URLs | existing route and Shopify SEO metadata | approved metadata fields only | Yes |
| Images and video | Shopify Files and approved media URLs | editorial references only | Yes |

## 4. Future CMS resource strategy

### 4.1 Shopify native resources preferred

- Pages for informational content
- Menus for navigation hierarchy
- Files for brand and editorial media
- Metafields for resource-specific content
- Metaobjects for reusable structured content

### 4.2 App-only resources

The following should remain private to the Admin app backend and should never be rendered into the public storefront directly:

- app installation records
- OAuth sessions
- preview tokens
- idempotency keys
- webhook verification secrets
- admin user role metadata

## 5. Proposed public content types

### 5.1 `site_global_settings`

Purpose: shared branding and static site defaults.

Fields:
- `site_name` (single line text)
- `support_email` (email)
- `support_phone` (single line text)
- `default_cta_label` (single line text)
- `announcement_bar_enabled` (boolean)
- `brand_primary_color` (color)
- `brand_secondary_color` (color)
- `logo_image` (file reference)
- `favicon_image` (file reference)
- `social_links` (JSON or structured list)

Protection notes:
- This data may configure presentation language and brand surfaces.
- It may not override checkout or customer-account logic.

### 5.2 `header_navigation_settings`

Purpose: header navigation and utility links.

Fields:
- `navigation_items` (list of links)
- `promo_label` (single line text)
- `mobile_menu_title` (single line text)
- `account_label` (single line text)
- `search_placeholder` (single line text)

Rules:
- Link destinations must be validated against app allowlists.
- Only `product`, `collection`, `page`, `external`, or `hash` destinations are allowed.
- Redirects and arbitrary URLs must be sanitized.

### 5.3 `footer_settings`

Purpose: footer content and contact information.

Fields:
- `columns` (structured list of links)
- `copyright_text` (rich text)
- `social_links` (list)
- `newsletter_copy` (single line text)

Rules:
- No payment or shipping claims may be inserted here without Shopify checkout authority.

### 5.4 `announcement_bar`

Purpose: temporary promotional message above the header.

Fields:
- `enabled` (boolean)
- `text` (single line text)
- `link_url` (URL)
- `link_label` (single line text)
- `foreground_color` (color)
- `background_color` (color)

Rules:
- URL must be relative, same-site, or allowlisted HTTPS.
- No arbitrary script or HTML content.

### 5.5 `homepage_hero_banner`

Purpose: homepage hero variation.

Fields:
- `title` (single line text)
- `subtitle` (single line text)
- `eyebrow` (single line text)
- `primary_cta_label` (single line text)
- `primary_cta_target` (URL)
- `secondary_cta_label` (single line text)
- `secondary_cta_target` (URL)
- `desktop_media` (file reference)
- `mobile_media` (file reference)
- `content_alignment` (enum)
- `text_color` (color)
- `background_color` (color)

Rules:
- The app may choose one of the existing approved hero layouts.
- The storefront must never insert arbitrary HTML or script.

### 5.6 `homepage_section_block`

Purpose: reusable editorial section content.

Fields:
- `section_type` (enum)
- `title` (single line text)
- `body` (rich text)
- `features` (list of text entries)
- `media` (file reference)
- `cta_label` (single line text)
- `cta_target` (URL)
- `display_order` (number)
- `is_visible` (boolean)

Allowed section types:
- hero
- science
- innovation
- protect
- testimonial
- faq
- image_grid
- product_feature

Disallowed section types:
- arbitrary component names
- executable HTML
- raw CSS/JS strings
- custom script blocks

### 5.7 `faq_entry`

Purpose: reusable FAQ content.

Fields:
- `question` (single line text)
- `answer` (rich text)
- `display_order` (number)
- `is_visible` (boolean)

Rules:
- Rich text must be sanitized.
- No embedded scripts or external media embedding.

### 5.8 `testimonial_story`

Purpose: approved customer or brand testimonials.

Fields:
- `quote` (single line text or rich text)
- `author_name` (single line text)
- `author_role` (single line text)
- `photo` (file reference)
- `display_order` (number)

Rules:
- Use only approved editorial reviews.
- No fake pricing, medical claims, or unauthorized success claims.

### 5.9 `brand_story_section`

Purpose: about/science page editorial storytelling.

Fields:
- `heading` (single line text)
- `body` (rich text)
- `image` (file reference)
- `stats` (list)

Rules:
- Legal and regulatory text should be reviewed by the owner.

### 5.10 `policy_page_content`

Purpose: policy/legal page data.

Fields:
- `page_type` (enum)
- `heading` (single line text)
- `body` (rich text)
- `last_reviewed_at` (date)
- `owner_reviewed` (boolean)

Rules:
- This type is suitable for non-legal content only.
- Actual legal review remains a business requirement.

## 6. Validation rules required before rendering

Validate at the runtime boundary that incoming CMS content matches the allowlist:

- field keys are expected keys only
- unknown section types are rejected
- media URLs must be HTTPS and from approved hostnames
- CTA URLs must be relative or allowlisted HTTPS
- numbers are bounded to safe ranges
- rich text is sanitized for allowed tags only
- boolean/enum values are restricted
- duplicate keys and malformed JSON metadata are rejected

## 7. Protected data exclusions

The schema must not duplicate or replace the following fields:

- Shopify product title, body, variants, pricing, compare-at price
- product inventory and availability
- product IDs and merchandise IDs
- cart IDs and checkout URLs
- customer access tokens and session data
- address data and order history
- checkout shipping and payment details
- Admin app secrets and private OAuth tokens

## 8. Recommended rollout strategy

1. Use only published content for storefront reads.
2. Keep static fallback markup when CMS data is missing or invalid.
3. Add a typed loader and allowlist registry before rendering any CMS-driven page.
4. Publish and verify one section type at a time.
5. Require a content owner sign-off before enabling legal, shipping, or customer-facing claims.

## 9. Decision gate for future implementation

A Phase 2 or later CMS implementation should only proceed after:

- the actual Shopify store domain is confirmed
- admin and public content permissions are reviewed
- the merchant approves the schema and page sections
- the app backend and preview flow are approved
- the product and legal-review risk areas are explicitly signed off
