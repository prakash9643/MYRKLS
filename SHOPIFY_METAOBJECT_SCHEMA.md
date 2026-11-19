# Shopify Metaobject and Metafield Schema

> **Legacy planning reference:** this document is not a deployed schema and is not the active Phase 2 manifest. For Phase 2, use [MYRKLS_CMS_PHASE_2_SCHEMA_REFERENCE.md](./MYRKLS_CMS_PHASE_2_SCHEMA_REFERENCE.md). Existing type names and the homepage hero reader contract are preserved and mapped there; nothing in this document authorizes live Shopify writes.

**Status:** Proposed content model. Definitions are not created in Shopify by this document.

## 1. Common schema rules

- Create definitions in the development store first. Use stable lowercase snake-case type identifiers and stable field keys.
- Set storefront access to **PUBLIC_READ** only for public content records. Keep unpublished/draft state in Shopify; Storefront consumers should read published entries only.
- Treat Shopify Admin as the authoring interface. Only the server-side app may write entries if automated Admin writes are later approved.
- Use Shopify Files and `file_reference` fields for images/video. Every rendered image requires human-written alt text. Do not store base64 or arbitrary HTML.
- Use Shopify's native product, collection, page and Metaobject references instead of duplicating commerce records or storing IDs in unvalidated prose.
- Content records carry presentation data only. The React app maps an allowlisted `component_type` to known components; it never evaluates scripts, code, templates or dynamic component names from Shopify.
- Required fields, max lengths, allowed-choice validation and reference-type validation should be configured in each Shopify definition. Shopify Admin's current field-validation UI/API is authoritative if labels differ.
- Recommendations and legal/policy text require editorial/merchant approval; a `verified` review claim is not a content styling flag and must only be set if the merchant substantiates it.

## 2. Supporting definition: `navigation_link`

Used by header/footer link groups to avoid serialized navigation JSON.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `label` | `single_line_text_field` | Yes | Non-empty; max 80 chars |
| `link_type` | `single_line_text_field` | Yes | Choice: `url`, `product`, `collection`, `page`, `account`, `cart` |
| `url` | `url` | Conditional | Required for `url`; allow only approved `https` or relative internal URL patterns in app validation |
| `product` | `product_reference` | Conditional | Required for `product` |
| `collection` | `collection_reference` | Conditional | Required for `collection` |
| `page` | `page_reference` | Conditional | Required for `page` |
| `open_in_new_tab` | `boolean` | No | Default false; external links only |
| `visible` | `boolean` | Yes | Default true |
| `sort_order` | `number_integer` | Yes | Non-negative integer |

**Storefront access:** `PUBLIC_READ`.

## 3. Supporting definition: `footer_link_group`

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `title` | `single_line_text_field` | Yes | Max 80 chars |
| `links` | `list.metaobject_reference` | Yes | References restricted to `navigation_link`; preserve record order |
| `visible` | `boolean` | Yes | Default true |
| `sort_order` | `number_integer` | Yes | Non-negative integer |

**Storefront access:** `PUBLIC_READ`.

## 4. Requested content definitions

### 4.1 `global_website_settings`

One active record, conventionally handle `default`.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `brand_name` | `single_line_text_field` | Yes | Max 100 chars |
| `site_logo` | `file_reference` | Yes | Image file |
| `mobile_logo` | `file_reference` | No | Image file |
| `favicon` | `file_reference` | No | Image file |
| `support_email` | `single_line_text_field` | Yes | Validate email format in app |
| `support_phone` | `single_line_text_field` | No | Validate/format for display |
| `default_seo_title` | `single_line_text_field` | Yes | Max 70 chars |
| `default_seo_description` | `multi_line_text_field` | Yes | Max 320 chars |
| `instagram_url` | `url` | No | HTTPS URL |
| `facebook_url` | `url` | No | HTTPS URL |
| `youtube_url` | `url` | No | HTTPS URL |
| `linkedin_url` | `url` | No | HTTPS URL |
| `announcement_enabled` | `boolean` | Yes | Default false |
| `announcement_text` | `single_line_text_field` | No | Max 160 chars |
| `announcement_link` | `url` | No | Internal relative or HTTPS URL |

**Storefront access:** `PUBLIC_READ`.

### 4.2 `header_configuration`

One active record, handle `default`.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `logo` | `file_reference` | Yes | Image |
| `logo_alt` | `single_line_text_field` | Yes | Meaningful accessible text |
| `navigation_links` | `list.metaobject_reference` | Yes | `navigation_link` entries, ordered |
| `shop_links` | `list.metaobject_reference` | No | `navigation_link` entries, ordered |
| `announcement_banner` | `metaobject_reference` | No | `promotional_banner` definition |
| `sticky_header` | `boolean` | Yes | Default true |
| `show_search` | `boolean` | Yes | Default true |
| `show_account` | `boolean` | Yes | Default true |
| `show_cart` | `boolean` | Yes | Default true |

**Storefront access:** `PUBLIC_READ`.

### 4.3 `footer_configuration`

One active record, handle `default`.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `logo` | `file_reference` | No | Image |
| `logo_alt` | `single_line_text_field` | No | Alt text |
| `intro_text` | `multi_line_text_field` | No | Max 600 chars |
| `link_groups` | `list.metaobject_reference` | Yes | `footer_link_group`, ordered |
| `trust_badges` | `list.metaobject_reference` | No | `trust_badge`, ordered |
| `copyright_text` | `single_line_text_field` | Yes | Max 160 chars |
| `newsletter_enabled` | `boolean` | Yes | Default false; form requires approved secure submission integration |
| `background_color` | `color` | No | Restrict in app to approved palette |
| `text_color` | `color` | No | Restrict in app to approved palette |

**Storefront access:** `PUBLIC_READ`.

### 4.4 `homepage_hero_banner`

One entry per slide.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `internal_name` | `single_line_text_field` | Yes | Admin label, max 100 chars |
| `enabled` | `boolean` | Yes | Default true |
| `sort_order` | `number_integer` | Yes | Non-negative integer |
| `desktop_image` | `file_reference` | Yes | Image |
| `mobile_image` | `file_reference` | No | Image; desktop image fallback |
| `desktop_alt` | `single_line_text_field` | Yes | Required meaningful alt |
| `mobile_alt` | `single_line_text_field` | No | Required when mobile image is set |
| `eyebrow` | `single_line_text_field` | No | Max 100 chars |
| `heading` | `single_line_text_field` | Yes | Max 160 chars; plain text |
| `supporting_text` | `multi_line_text_field` | No | Max 500 chars |
| `primary_cta_label` | `single_line_text_field` | No | Max 60 chars |
| `primary_cta_url` | `url` | No | Internal relative or HTTPS URL |
| `secondary_cta_label` | `single_line_text_field` | No | Max 60 chars |
| `secondary_cta_url` | `url` | No | Internal relative or HTTPS URL |
| `text_color` | `color` | No | Approved palette only |
| `overlay_color` | `color` | No | Approved palette only |
| `overlay_opacity` | `number_integer` | No | 0–100; validate in app |
| `starts_at` | `date_time` | No | UTC scheduling |
| `ends_at` | `date_time` | No | Must be after `starts_at` |

**Storefront access:** `PUBLIC_READ`.

### 4.5 `homepage_section`

One entry per approved homepage section. This is the ordered registry; content values remain data, never executable code.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `internal_name` | `single_line_text_field` | Yes | Max 100 chars |
| `section_key` | `single_line_text_field` | Yes | Unique stable key, e.g. `featured-products` |
| `component_type` | `single_line_text_field` | Yes | Choice allowlist: `hero`, `featured_products`, `featured_collections`, `science`, `innovation`, `global_science_network`, `featured_protection`, `testimonials`, `faq`, `promotional_banner`, `brand_story`, `trust_badges` |
| `visible` | `boolean` | Yes | Default true |
| `sort_order` | `number_integer` | Yes | Non-negative integer; React applies stable tie-break by `section_key` |
| `eyebrow` | `single_line_text_field` | No | Max 100 chars |
| `heading` | `single_line_text_field` | No | Max 160 chars |
| `body` | `multi_line_text_field` | No | Max 1,500 chars; no arbitrary HTML |
| `desktop_image` | `file_reference` | No | Image |
| `mobile_image` | `file_reference` | No | Image; desktop fallback |
| `image_alt` | `single_line_text_field` | No | Required in app if an image is rendered |
| `cta_label` | `single_line_text_field` | No | Max 60 chars |
| `cta_url` | `url` | No | Internal relative or HTTPS URL |
| `background_color` | `color` | No | Approved palette only |
| `text_color` | `color` | No | Approved palette only |
| `products` | `list.product_reference` | No | Only for approved product-driven sections |
| `collections` | `list.collection_reference` | No | Only for approved collection-driven sections |
| `hero_banners` | `list.metaobject_reference` | No | `homepage_hero_banner`; used only for `hero` |
| `promotional_banner` | `metaobject_reference` | No | `promotional_banner`; used only for promo component |
| `testimonials` | `list.metaobject_reference` | No | `testimonial`; used only for testimonial component |
| `faqs` | `list.metaobject_reference` | No | `faq`; used only for FAQ component |
| `brand_story` | `metaobject_reference` | No | `brand_story`; used only for brand story component |
| `trust_badges` | `list.metaobject_reference` | No | `trust_badge`; used only for trust badges |

**Storefront access:** `PUBLIC_READ`. App validation must require fields appropriate to each `component_type`, ignore invalid/unknown types, and render only the fixed local component registry.

### 4.6 `testimonial`

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `quote` | `multi_line_text_field` | Yes | Max 1,500 chars |
| `display_name` | `single_line_text_field` | Yes | Max 100 chars; obtain consent |
| `role_or_context` | `single_line_text_field` | No | Max 100 chars |
| `rating` | `number_integer` | No | 1–5 |
| `product` | `product_reference` | No | Shopify product |
| `avatar` | `file_reference` | No | Image |
| `avatar_alt` | `single_line_text_field` | No | Required if avatar is rendered |
| `review_date` | `date` | No | Original/approved date |
| `verified_purchase` | `boolean` | Yes | Default false; only true when substantiated |
| `visible` | `boolean` | Yes | Default false pending approval |
| `sort_order` | `number_integer` | Yes | Non-negative integer |

**Storefront access:** `PUBLIC_READ`.

### 4.7 `faq`

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `question` | `single_line_text_field` | Yes | Max 240 chars |
| `answer` | `rich_text_field` | Yes | Approved rich text only; sanitize/render safe structured output |
| `group` | `single_line_text_field` | Yes | Choice such as `homepage`, `product`, `shipping`, `returns` |
| `product` | `product_reference` | No | Optional product-specific FAQ |
| `visible` | `boolean` | Yes | Default true |
| `sort_order` | `number_integer` | Yes | Non-negative integer |

**Storefront access:** `PUBLIC_READ`.

### 4.8 `brand_story`

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `title` | `single_line_text_field` | Yes | Max 160 chars |
| `eyebrow` | `single_line_text_field` | No | Max 100 chars |
| `summary` | `multi_line_text_field` | Yes | Max 1,000 chars |
| `body` | `rich_text_field` | Yes | Approved structured rich text |
| `image` | `file_reference` | No | Image |
| `mobile_image` | `file_reference` | No | Image |
| `image_alt` | `single_line_text_field` | No | Required if image is rendered |
| `cta_label` | `single_line_text_field` | No | Max 60 chars |
| `cta_url` | `url` | No | Internal relative or HTTPS URL |
| `visible` | `boolean` | Yes | Default true |

**Storefront access:** `PUBLIC_READ`.

### 4.9 `promotional_banner`

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `internal_name` | `single_line_text_field` | Yes | Max 100 chars |
| `enabled` | `boolean` | Yes | Default false |
| `message` | `single_line_text_field` | Yes | Max 200 chars |
| `desktop_image` | `file_reference` | No | Image |
| `mobile_image` | `file_reference` | No | Image |
| `image_alt` | `single_line_text_field` | No | Required if image is rendered |
| `cta_label` | `single_line_text_field` | No | Max 60 chars |
| `cta_url` | `url` | No | Internal relative or HTTPS URL |
| `background_color` | `color` | No | Approved palette only |
| `text_color` | `color` | No | Approved palette only |
| `starts_at` | `date_time` | No | UTC scheduling |
| `ends_at` | `date_time` | No | Must be after `starts_at` |

**Storefront access:** `PUBLIC_READ`.

### 4.10 `trust_badge`

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `label` | `single_line_text_field` | Yes | Max 100 chars |
| `icon` | `file_reference` | Yes | Shopify Files image/SVG; validate format and safe rendering |
| `icon_alt` | `single_line_text_field` | Yes | Meaningful alt or empty only if decorative |
| `description` | `multi_line_text_field` | No | Max 300 chars |
| `link_url` | `url` | No | HTTPS or approved internal route |
| `visible` | `boolean` | Yes | Default true |
| `sort_order` | `number_integer` | Yes | Non-negative integer |

**Storefront access:** `PUBLIC_READ`.

### 4.11 `custom_landing_page`

Supports structured campaign/landing content without executable page templates.

| Field key | Shopify type | Required | Validation / meaning |
|---|---|---:|---|
| `title` | `single_line_text_field` | Yes | Max 160 chars |
| `handle` | Shopify entry handle | Yes | Unique, lowercase URL slug |
| `seo_title` | `single_line_text_field` | No | Max 70 chars |
| `seo_description` | `multi_line_text_field` | No | Max 320 chars |
| `sections` | `list.metaobject_reference` | Yes | `homepage_section` entries, ordered; same allowlist/validation |
| `visible` | `boolean` | Yes | Default false pending approval |

**Storefront access:** `PUBLIC_READ`.

## 5. Product Metafields (not another product database)

Use product metafields only for MYRKLS product-specific editorial attributes that Shopify's standard product/variant fields do not already represent:

| Namespace/key | Type | Use |
|---|---|---|
| `myrkls.category_title` | `single_line_text_field` | PDP/category display label |
| `myrkls.consumer_benefit` | `multi_line_text_field` | Approved product benefit copy |
| `myrkls.best_for` | `multi_line_text_field` | Skin concerns |
| `myrkls.routine_step` | `single_line_text_field` | Routine ordering |
| `myrkls.science_summary` | `multi_line_text_field` | PDP science summary |
| `myrkls.how_to_use` | `rich_text_field` | Approved usage directions |
| `myrkls.ingredients` | `list.metaobject_reference` | Optional ingredient records if ingredient structure needs reuse |
| `myrkls.related_faqs` | `list.metaobject_reference` | FAQ records, restricted to `faq` |

Prices, compare-at prices, inventory, availability, product identity, variant options, media and SEO fields should use Shopify's native product/variant data, not duplicated metafields.

## 6. Storefront publication and validation checklist

- All public definitions have Storefront read access; administrative/customer-only types do not.
- Entries and referenced files are published/available to the correct market.
- Reference fields are type-restricted where supported; application validates the expected type as defense in depth.
- Homepage sections sort deterministically by `sort_order`, then `section_key`; hidden, unpublished, expired and invalid records are omitted.
- CTA URLs reject unsafe schemes; only internal relative routes and approved HTTPS destinations render.
- Rich text is rendered through a safe structured renderer, not injected as arbitrary HTML.
- `file_reference` values resolve to Shopify CDN media with alt text and responsive sizing.
- Product and collection references resolve using the active market/currency context.
- A malformed or unknown record displays a controlled content error/fallback, not executable content.

## References

- [Shopify Metaobjects](https://shopify.dev/docs/apps/build/metaobjects)
- [Shopify Metafields](https://shopify.dev/docs/apps/build/metafields)
- [Storefront API 2026-10](https://shopify.dev/docs/api/storefront/2026-10)
