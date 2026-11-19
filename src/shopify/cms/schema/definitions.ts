import type {
  CmsFieldDefinition,
  CmsMetaobjectDefinition,
  CmsMetafieldDefinition,
  SchemaValidation,
} from './types.ts';

export const CMS_SECTION_TYPES = [
  'hero',
  'science',
  'innovation',
  'protect',
  'testimonial',
  'faq',
  'image_grid',
  'product_feature',
] as const;

const PAGE_TYPES = ['about', 'campaign', 'contact', 'faq', 'landing', 'policy', 'science'] as const;

const field = (
  key: string,
  type: CmsFieldDefinition['type'],
  options: {
    required?: boolean;
    description?: string;
    validations?: SchemaValidation[];
    referenceTo?: string;
  } = {}
): CmsFieldDefinition => ({
  key,
  name: key.replace(/_/g, ' '),
  type,
  required: options.required ?? false,
  ...(options.description ? { description: options.description } : {}),
  ...(options.validations ? { validations: options.validations } : {}),
  ...(options.referenceTo ? { referenceTo: options.referenceTo } : {}),
});

const text = (
  key: string,
  required = false,
  maxLength?: number,
  extra: Pick<CmsFieldDefinition, 'description' | 'validations'> = {}
): CmsFieldDefinition =>
  field(key, 'single_line_text_field', {
    required,
    ...extra,
    ...(maxLength
      ? {
          validations: [
            ...(extra.validations || []),
            { name: 'max', value: String(maxLength) },
          ],
        }
      : {}),
  });

const choices = (values: readonly string[]): SchemaValidation[] => [
  { name: 'choices', value: JSON.stringify(values) },
];

const reference = (
  key: string,
  referenceTo: string,
  required = false
): CmsFieldDefinition =>
  field(key, 'metaobject_reference', { required, referenceTo });

const referenceList = (
  key: string,
  referenceTo: string,
  required = false
): CmsFieldDefinition =>
  field(key, 'list.metaobject_reference', { required, referenceTo });

const image = (key: string, required = false): CmsFieldDefinition =>
  field(key, 'file_reference', {
    required,
    validations: [{ name: 'file_type_options', value: '["Image"]' }],
  });

const metaobject = (
  type: string,
  name: string,
  description: string,
  displayNameKey: string,
  fields: CmsFieldDefinition[],
  legacyTypes: string[] = []
): CmsMetaobjectDefinition => ({
  type,
  name,
  description,
  displayNameKey,
  ownership: 'MERCHANT',
  adminAccess: 'MERCHANT_READ_WRITE',
  storefrontAccess: 'PUBLIC_READ',
  publishable: true,
  ...(legacyTypes.length ? { legacyTypes } : {}),
  fields,
});

export const CMS_METAOBJECT_DEFINITIONS: CmsMetaobjectDefinition[] = [
  metaobject(
    'site_global_settings',
    'Site global settings',
    'Public brand and site defaults. Never store credentials or customer data.',
    'title',
    [
      text('title', true, 100),
      text('site_name', true, 100),
      image('logo'),
      image('footer_logo'),
      image('favicon'),
      field('primary_color', 'color'),
      field('secondary_color', 'color'),
      field('accent_color', 'color'),
      text('default_seo_title', false, 70),
      field('default_seo_description', 'multi_line_text_field', {
        validations: [{ name: 'max', value: '320' }],
      }),
      image('default_og_image'),
      text('contact_email', false, 254, {
        validations: [{ name: 'regex', value: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' }],
      }),
      text('contact_phone', false, 40),
      field('social_links', 'list.link'),
      field('active', 'boolean'),
    ],
    ['global_website_settings']
  ),
  metaobject(
    'cms_page',
    'CMS page',
    'Page metadata and ordered references to approved CMS sections. The entry handle is Shopify’s native handle.',
    'title',
    [
      text('title', true, 160),
      text('page_type', true, 40, { validations: choices(PAGE_TYPES) }),
      reference('template', 'cms_page_template'),
      referenceList('sections', 'cms_section', true),
      text('seo_title', false, 70),
      field('seo_description', 'multi_line_text_field', {
        validations: [{ name: 'max', value: '320' }],
      }),
      field('seo_keywords', 'list.single_line_text_field'),
      image('og_image'),
      field('canonical_url', 'url'),
      field('robots_index', 'boolean'),
      field('robots_follow', 'boolean'),
      field('active', 'boolean'),
      field('last_reviewed_at', 'date'),
    ],
    ['custom_landing_page']
  ),
  metaobject(
    'cms_section',
    'CMS section',
    'Reusable editorial content. section_type is restricted to the Phase 1 allowlist; content is never executable.',
    'section_name',
    [
      text('section_name', true, 120),
      text('section_type', true, 40, { validations: choices(CMS_SECTION_TYPES) }),
      text('heading', false, 160),
      text('subheading', false, 240),
      field('body', 'rich_text_field'),
      image('desktop_image'),
      image('mobile_image'),
      image('background_image'),
      text('button_text', false, 60),
      field('button_url', 'url'),
      text('secondary_button_text', false, 60),
      field('secondary_button_url', 'url'),
      text('text_alignment', false, 20, {
        validations: choices(['left', 'center', 'right']),
      }),
      field('background_color', 'color'),
      field('text_color', 'color'),
      field('display_order', 'number_integer', {
        validations: [{ name: 'min', value: '0' }, { name: 'max', value: '9999' }],
      }),
      field('visible', 'boolean'),
      field('custom_config', 'json'),
    ],
    ['homepage_section', 'homepage_section_block']
  ),
  metaobject(
    'cms_page_template',
    'CMS page template',
    'Reusable page grouping that references only approved CMS sections.',
    'template_name',
    [
      text('template_name', true, 120),
      text('template_handle', true, 100, {
        validations: [{ name: 'regex', value: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }],
      }),
      text('page_type', true, 40, { validations: choices(PAGE_TYPES) }),
      field('description', 'multi_line_text_field', {
        validations: [{ name: 'max', value: '1000' }],
      }),
      referenceList('default_sections', 'cms_section'),
      field('active', 'boolean'),
    ],
    ['cms_template']
  ),
  metaobject(
    'header_navigation_settings',
    'Header navigation settings',
    'Presentation settings only. menu_reference stores a native Shopify menu handle; the full menu remains managed in Shopify Navigation.',
    'menu_reference',
    [
      text('menu_reference', true, 100),
      image('logo'),
      field('announcement_enabled', 'boolean'),
      field('sticky_header', 'boolean'),
      field('transparent_header', 'boolean'),
      field('active', 'boolean'),
    ],
    ['header_configuration']
  ),
  metaobject(
    'footer_settings',
    'Footer settings',
    'Public footer copy and native menu handle; does not store payment or checkout behavior.',
    'copyright_text',
    [
      image('footer_logo'),
      field('footer_description', 'multi_line_text_field', {
        validations: [{ name: 'max', value: '1000' }],
      }),
      text('footer_menu_reference', false, 100),
      field('newsletter_enabled', 'boolean'),
      text('newsletter_heading', false, 120),
      text('copyright_text', true, 160),
      field('social_links', 'list.link'),
      field('active', 'boolean'),
    ],
    ['footer_configuration']
  ),
  metaobject(
    'announcement_bar',
    'Announcement bar',
    'Time-bounded public announcement copy with safe link handling deferred to the storefront boundary.',
    'announcement_text',
    [
      text('announcement_text', true, 200),
      text('link_text', false, 60),
      field('link_url', 'url'),
      field('background_color', 'color'),
      field('text_color', 'color'),
      field('start_date', 'date_time'),
      field('end_date', 'date_time'),
      field('active', 'boolean'),
    ],
    ['promotional_banner']
  ),
  metaobject(
    'homepage_hero_banner',
    'Homepage hero banner',
    'Uses the field contract already consumed by the Storefront hero reader; mapped Phase 2 names are documented in the schema reference.',
    'internal_name',
    [
      text('internal_name', true, 100),
      field('enabled', 'boolean', { required: true }),
      field('sort_order', 'number_integer', {
        required: true,
        validations: [{ name: 'min', value: '0' }, { name: 'max', value: '9999' }],
      }),
      image('desktop_image', true),
      image('mobile_image'),
      text('desktop_alt', true, 200),
      text('mobile_alt', false, 200),
      text('eyebrow', false, 100),
      text('heading', true, 160),
      field('supporting_text', 'multi_line_text_field', {
        validations: [{ name: 'max', value: '500' }],
      }),
      text('primary_cta_label', false, 60),
      field('primary_cta_url', 'url'),
      text('secondary_cta_label', false, 60),
      field('secondary_cta_url', 'url'),
      text('text_alignment', false, 20, {
        validations: choices(['left', 'center', 'right']),
      }),
      field('text_color', 'color'),
      field('overlay_color', 'color'),
      field('overlay_opacity', 'number_integer', {
        validations: [{ name: 'min', value: '0' }, { name: 'max', value: '100' }],
      }),
      field('starts_at', 'date_time'),
      field('ends_at', 'date_time'),
    ]
  ),
  metaobject(
    'faq_entry',
    'FAQ entry',
    'Public, publishable FAQ content. Rich text must be rendered through a safe structured renderer.',
    'question',
    [
      text('question', true, 240),
      field('answer', 'rich_text_field', { required: true }),
      field('display_order', 'number_integer', {
        validations: [{ name: 'min', value: '0' }, { name: 'max', value: '9999' }],
      }),
      field('active', 'boolean'),
    ],
    ['faq']
  ),
  metaobject(
    'testimonial_story',
    'Testimonial story',
    'Editorial testimonial. Rating is bounded; customer consent and substantiation remain an owner responsibility.',
    'customer_name',
    [
      text('customer_name', true, 100),
      text('customer_designation', false, 100),
      field('testimonial_text', 'multi_line_text_field', {
        required: true,
        validations: [{ name: 'max', value: '1500' }],
      }),
      image('customer_image'),
      field('rating', 'number_integer', {
        validations: [{ name: 'min', value: '1' }, { name: 'max', value: '5' }],
      }),
      field('display_order', 'number_integer', {
        validations: [{ name: 'min', value: '0' }, { name: 'max', value: '9999' }],
      }),
      field('active', 'boolean'),
    ],
    ['testimonial']
  ),
  metaobject(
    'brand_story_section',
    'Brand story section',
    'Public editorial story content, separate from product commerce data.',
    'heading',
    [
      text('heading', true, 160),
      text('subheading', false, 240),
      field('content', 'rich_text_field'),
      image('image'),
      text('image_position', false, 20, {
        validations: choices(['left', 'right', 'center']),
      }),
      field('display_order', 'number_integer', {
        validations: [{ name: 'min', value: '0' }, { name: 'max', value: '9999' }],
      }),
      field('active', 'boolean'),
    ],
    ['brand_story']
  ),
  metaobject(
    'policy_page_content',
    'Policy page content',
    'Owner-reviewed policy copy. This definition does not publish or route policy pages by itself.',
    'title',
    [
      text('title', true, 160),
      field('content', 'rich_text_field', { required: true }),
      field('last_updated', 'date'),
      field('active', 'boolean'),
    ]
  ),
];

export const CMS_METAFIELD_DEFINITIONS: CmsMetafieldDefinition[] = [
  {
    ownerType: 'PRODUCT',
    namespace: 'cms',
    key: 'enable_custom_sections',
    name: 'Enable custom sections',
    description: 'Editorial display toggle only; it cannot change product commerce behavior.',
    type: 'boolean',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
  },
  {
    ownerType: 'PRODUCT',
    namespace: 'cms',
    key: 'product_intro',
    name: 'Product intro',
    description: 'Supplemental editorial introduction; never replaces Shopify product description or commerce values.',
    type: 'rich_text_field',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
  },
  {
    ownerType: 'PRODUCT',
    namespace: 'cms',
    key: 'product_faqs',
    name: 'Product FAQs',
    description: 'References to publishable FAQ entries.',
    type: 'list.metaobject_reference',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    referenceTo: 'faq_entry',
  },
  {
    ownerType: 'PRODUCT',
    namespace: 'cms',
    key: 'related_editorial_content',
    name: 'Related editorial content',
    description: 'References to CMS sections; no product price, variant, or inventory data.',
    type: 'list.metaobject_reference',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    referenceTo: 'cms_section',
  },
  {
    ownerType: 'PRODUCT',
    namespace: 'cms',
    key: 'product_badges',
    name: 'Product badges',
    description: 'Editorial labels only; not availability, SKU, or inventory signals.',
    type: 'list.single_line_text_field',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    validations: [{ name: 'list.max', value: '12' }],
  },
  {
    ownerType: 'COLLECTION',
    namespace: 'cms',
    key: 'collection_banner',
    name: 'Collection banner',
    description: 'Supplemental editorial image; does not change collection membership.',
    type: 'file_reference',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    validations: [{ name: 'file_type_options', value: '["Image"]' }],
  },
  {
    ownerType: 'COLLECTION',
    namespace: 'cms',
    key: 'collection_subtitle',
    name: 'Collection subtitle',
    description: 'Supplemental presentation text.',
    type: 'single_line_text_field',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    validations: [{ name: 'max', value: '240' }],
  },
  {
    ownerType: 'COLLECTION',
    namespace: 'cms',
    key: 'collection_intro',
    name: 'Collection intro',
    description: 'Supplemental structured editorial content.',
    type: 'rich_text_field',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
  },
  {
    ownerType: 'COLLECTION',
    namespace: 'cms',
    key: 'collection_sections',
    name: 'Collection sections',
    description: 'Ordered CMS section references; rendering remains out of Phase 2 scope.',
    type: 'list.metaobject_reference',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    referenceTo: 'cms_section',
  },
  {
    ownerType: 'COLLECTION',
    namespace: 'cms',
    key: 'collection_faqs',
    name: 'Collection FAQs',
    description: 'References to publishable FAQ entries.',
    type: 'list.metaobject_reference',
    adminAccess: 'MERCHANT_READ_WRITE',
    storefrontAccess: 'PUBLIC_READ',
    referenceTo: 'faq_entry',
  },
];
