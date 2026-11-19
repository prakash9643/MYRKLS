# MYRKLS CMS Phase 2 — Schema Reference

**Source of truth:** `src/shopify/cms/schema/definitions.ts` and `src/shopify/cms/schema/manifest.ts`.
**Target Admin API version:** `2026-10`.

## 1. Conventions

- All Metaobjects are merchant-owned, `MERCHANT_READ_WRITE` in Admin, `PUBLIC_READ` in Storefront, and publishable.
- All Metafields are merchant-editable and Storefront read-only.
- `*` means required.
- `text` = `single_line_text_field`; `long text` = `multi_line_text_field`; `rich text` = `rich_text_field`; `image` = image-restricted `file_reference`; `ref<T>` = `metaobject_reference`; `list<ref<T>>` = `list.metaobject_reference`; `int` = `number_integer`; `bool` = `boolean`.
- Unless stated otherwise, optional values are not made required by the Shopify definition.
- Shopify-native Metaobject entry `handle` is not duplicated as a field.

## 2. Metaobject definitions

| Type | Display name / key | Fields and constraints |
|---|---|---|
| `site_global_settings` | Site global settings / `title` | `title*` (text, max 100), `site_name*` (text, max 100), `logo` (image), `footer_logo` (image), `favicon` (image), `primary_color` (color), `secondary_color` (color), `accent_color` (color), `default_seo_title` (text, max 70), `default_seo_description` (long text, max 320), `default_og_image` (image), `contact_email` (text, max 254, email regex), `contact_phone` (text, max 40), `social_links` (`list.link`), `active` (bool). Legacy alias: `global_website_settings`. |
| `cms_page` | CMS page / `title` | `title*` (text, max 160), `page_type*` (text choice: `about`, `campaign`, `contact`, `faq`, `landing`, `policy`, `science`), `template` (`ref<cms_page_template>`), `sections*` (`list<ref<cms_section>>`), `seo_title` (text, max 70), `seo_description` (long text, max 320), `seo_keywords` (`list.single_line_text_field`), `og_image` (image), `canonical_url` (url), `robots_index` (bool), `robots_follow` (bool), `active` (bool), `last_reviewed_at` (date). Native entry handle is the page handle. Legacy alias: `custom_landing_page`. |
| `cms_section` | CMS section / `section_name` | `section_name*` (text, max 120), `section_type*` (text choice from the exact Phase 1 allowlist below), `heading` (text, max 160), `subheading` (text, max 240), `body` (rich text), `desktop_image` (image), `mobile_image` (image), `background_image` (image), `button_text` (text, max 60), `button_url` (url), `secondary_button_text` (text, max 60), `secondary_button_url` (url), `text_alignment` (text choice `left`/`center`/`right`), `background_color` (color), `text_color` (color), `display_order` (int 0–9999), `visible` (bool), `custom_config` (json). Legacy aliases: `homepage_section`, `homepage_section_block`. |
| `cms_page_template` | CMS page template / `template_name` | `template_name*` (text, max 120), `template_handle*` (text, max 100, lowercase hyphenated handle regex), `page_type*` (same page-type choices as `cms_page`), `description` (long text, max 1000), `default_sections` (`list<ref<cms_section>>`), `active` (bool). Legacy alias: `cms_template`. |
| `header_navigation_settings` | Header navigation settings / `menu_reference` | `menu_reference*` (text, max 100; native Shopify menu handle), `logo` (image), `announcement_enabled` (bool), `sticky_header` (bool), `transparent_header` (bool), `active` (bool). Legacy alias: `header_configuration`. |
| `footer_settings` | Footer settings / `copyright_text` | `footer_logo` (image), `footer_description` (long text, max 1000), `footer_menu_reference` (text, max 100; native Shopify menu handle), `newsletter_enabled` (bool), `newsletter_heading` (text, max 120), `copyright_text*` (text, max 160), `social_links` (`list.link`), `active` (bool). Legacy alias: `footer_configuration`. |
| `announcement_bar` | Announcement bar / `announcement_text` | `announcement_text*` (text, max 200), `link_text` (text, max 60), `link_url` (url), `background_color` (color), `text_color` (color), `start_date` (date_time), `end_date` (date_time), `active` (bool). Legacy alias: `promotional_banner`. |
| `homepage_hero_banner` | Homepage hero banner / `internal_name` | `internal_name*` (text, max 100), `enabled*` (bool), `sort_order*` (int 0–9999), `desktop_image*` (image), `mobile_image` (image), `desktop_alt*` (text, max 200), `mobile_alt` (text, max 200), `eyebrow` (text, max 100), `heading*` (text, max 160), `supporting_text` (long text, max 500), `primary_cta_label` (text, max 60), `primary_cta_url` (url), `secondary_cta_label` (text, max 60), `secondary_cta_url` (url), `text_alignment` (choice `left`/`center`/`right`), `text_color` (color), `overlay_color` (color), `overlay_opacity` (int 0–100), `starts_at` (date_time), `ends_at` (date_time). Field keys intentionally match the current hero reader. |
| `faq_entry` | FAQ entry / `question` | `question*` (text, max 240), `answer*` (rich text), `display_order` (int 0–9999), `active` (bool). Legacy alias: `faq`. |
| `testimonial_story` | Testimonial story / `customer_name` | `customer_name*` (text, max 100), `customer_designation` (text, max 100), `testimonial_text*` (long text, max 1500), `customer_image` (image), `rating` (int 1–5), `display_order` (int 0–9999), `active` (bool). Legacy alias: `testimonial`. |
| `brand_story_section` | Brand story section / `heading` | `heading*` (text, max 160), `subheading` (text, max 240), `content` (rich text), `image` (image), `image_position` (choice `left`/`right`/`center`), `display_order` (int 0–9999), `active` (bool). Legacy aliases: `brand_story`. |
| `policy_page_content` | Policy page content / `title` | `title*` (text, max 160), `content*` (rich text), `last_updated` (date), `active` (bool). This definition does not route or publish a policy page automatically. |

### Approved `cms_section.section_type` choices

`hero`, `science`, `innovation`, `protect`, `testimonial`, `faq`, `image_grid`, `product_feature`.

This is the Phase 1 allowlist. It differs from the current Storefront `homepage_section` reader's component list; there is no runtime mapping in Phase 2.

## 3. Product and collection Metafields

All definitions use namespace `cms`, Admin access `MERCHANT_READ_WRITE`, and Storefront access `PUBLIC_READ`.

| Owner | Key | Type | Constraints / reference |
|---|---|---|---|
| Product | `enable_custom_sections` | `boolean` | Presentation toggle only |
| Product | `product_intro` | `rich_text_field` | Supplemental editorial text |
| Product | `product_faqs` | `list.metaobject_reference` | References `faq_entry` |
| Product | `related_editorial_content` | `list.metaobject_reference` | References `cms_section` |
| Product | `product_badges` | `list.single_line_text_field` | Maximum list length 12; not inventory or availability |
| Collection | `collection_banner` | `file_reference` | Image-only file validation |
| Collection | `collection_subtitle` | `single_line_text_field` | Maximum 240 characters |
| Collection | `collection_intro` | `rich_text_field` | Supplemental editorial content |
| Collection | `collection_sections` | `list.metaobject_reference` | References `cms_section` |
| Collection | `collection_faqs` | `list.metaobject_reference` | References `faq_entry` |

No Metafield in the manifest writes collection membership, product details, variants, price, inventory, availability, SKU, or checkout state.

## 4. Compatibility and legacy notes

- The current Storefront hero mapper consumes `enabled`, `sort_order`, `supporting_text`, and CTA names. The manifest preserves those keys instead of adopting differently named proposal fields such as `title`, `subtitle`, or `desktop_media`.
- A legacy type match is classified for manual review; the tool never renames or duplicates it.
- The legacy `homepage_section` reader expects `component_type`, `section_key`, and other existing fields. The new `cms_section` is a distinct schema and must not be assumed compatible.
- Native Shopify menus remain the source of truth; the schema stores only menu handles.
- The legacy `SHOPIFY_METAOBJECT_SCHEMA.md` is a proposal, not the live manifest. Use this file and the TypeScript manifest as the Phase 2 reference.
