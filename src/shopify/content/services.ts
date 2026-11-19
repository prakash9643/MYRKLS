import { getMetaobjects } from '../services/metaobjects';
import { ShopifyApiError } from '../errors';
import type {
  ShopifyConnection,
  ShopifyImage,
  ShopifyMetaobject,
  ShopifyMetaobjectField,
  ShopifyMetaobjectReference,
} from '../types';
import type {
  HomepageHeroBanner,
  HomepageSection,
  HomepageSectionComponent,
  PromotionalBanner,
  ShopifyBrandStory,
  ShopifyFaq,
  ShopifyTestimonial,
} from './types';

const COMPONENT_TYPES = new Set<HomepageSectionComponent>([
  'hero',
  'featured_products',
  'featured_collections',
  'science',
  'innovation',
  'global_science_network',
  'featured_protection',
  'testimonials',
  'faq',
  'promotional_banner',
  'brand_story',
  'trust_badges',
]);

const fieldMap = (entry: ShopifyMetaobject): Map<string, ShopifyMetaobjectField> =>
  new Map(entry.fields.map((field) => [field.key, field]));

const fieldValue = (fields: Map<string, ShopifyMetaobjectField>, key: string): string | null =>
  fields.get(key)?.value ?? null;

const requiredText = (fields: Map<string, ShopifyMetaobjectField>, key: string): string => {
  const value = fieldValue(fields, key)?.trim();
  if (!value) {
    throw new ShopifyApiError('invalid-response', `Shopify content is missing required “${key}” text.`);
  }
  return value;
};

const optionalText = (fields: Map<string, ShopifyMetaobjectField>, key: string): string =>
  fieldValue(fields, key)?.trim() || '';

const requiredBoolean = (fields: Map<string, ShopifyMetaobjectField>, key: string): boolean => {
  const value = fieldValue(fields, key)?.toLowerCase();
  if (value !== 'true' && value !== 'false') {
    throw new ShopifyApiError('invalid-response', `Shopify content has an invalid “${key}” boolean.`);
  }
  return value === 'true';
};

const requiredInteger = (fields: Map<string, ShopifyMetaobjectField>, key: string): number => {
  const value = Number(fieldValue(fields, key));
  if (!Number.isInteger(value) || value < 0) {
    throw new ShopifyApiError('invalid-response', `Shopify content has an invalid “${key}” integer.`);
  }
  return value;
};

const optionalInteger = (
  fields: Map<string, ShopifyMetaobjectField>,
  key: string,
  min: number,
  max: number
): number | null => {
  const raw = fieldValue(fields, key);
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ShopifyApiError('invalid-response', `Shopify content has an invalid “${key}” value.`);
  }
  return value;
};

const optionalDate = (fields: Map<string, ShopifyMetaobjectField>, key: string): string | null => {
  const value = fieldValue(fields, key);
  if (value === null || value.trim() === '') return null;
  if (!Number.isFinite(Date.parse(value))) {
    throw new ShopifyApiError('invalid-response', `Shopify content has an invalid “${key}” date.`);
  }
  return value;
};

const optionalUrl = (fields: Map<string, ShopifyMetaobjectField>, key: string): string => {
  const value = optionalText(fields, key);
  if (!value) return '';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url.toString();
  } catch {
    // Invalid CMS URLs are rejected below.
  }
  throw new ShopifyApiError('invalid-response', `Shopify content has an unsafe “${key}” URL.`);
};

const optionalColor = (fields: Map<string, ShopifyMetaobjectField>, key: string): string | null => {
  const value = fieldValue(fields, key)?.trim() || '';
  if (!value) return null;
  if (!/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value)) {
    throw new ShopifyApiError('invalid-response', `Shopify content has an invalid “${key}” color.`);
  }
  return value;
};

const mediaImage = (
  fields: Map<string, ShopifyMetaobjectField>,
  key: string,
  required: boolean
): ShopifyImage | null => {
  const reference = fields.get(key)?.reference;
  const image = reference?.kind === 'image' ? reference.image : null;
  if (image?.url) return image;
  if (required) {
    throw new ShopifyApiError('invalid-response', `Shopify content is missing the “${key}” image reference.`);
  }
  return null;
};

const fieldReferences = (
  fields: Map<string, ShopifyMetaobjectField>,
  key: string
): ShopifyMetaobjectReference[] => fields.get(key)?.references ?? [];

const entryFields = (
  entry: ShopifyMetaobject,
  expectedType: string
): Map<string, ShopifyMetaobjectField> => {
  if (entry.type !== expectedType) {
    throw new ShopifyApiError(
      'invalid-response',
      `Shopify returned content type “${entry.type}” where “${expectedType}” was expected.`
    );
  }
  return fieldMap(entry);
};

const isCurrentlyActive = (startsAt: string | null, endsAt: string | null, now: number): boolean =>
  (!startsAt || Date.parse(startsAt) <= now) && (!endsAt || Date.parse(endsAt) >= now);

const mapHomepageHeroBanner = (entry: ShopifyMetaobject): HomepageHeroBanner => {
  const fields = entryFields(entry, 'homepage_hero_banner');
  const desktopImage = mediaImage(fields, 'desktop_image', true);
  if (!desktopImage) {
    throw new ShopifyApiError('invalid-response', 'Shopify hero content has no desktop image.');
  }
  const startsAt = optionalDate(fields, 'starts_at');
  const endsAt = optionalDate(fields, 'ends_at');
  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new ShopifyApiError('invalid-response', 'Shopify hero content has an invalid scheduling range.');
  }
  return {
    id: entry.id,
    handle: entry.handle,
    enabled: requiredBoolean(fields, 'enabled'),
    sortOrder: requiredInteger(fields, 'sort_order'),
    desktopImage,
    mobileImage: mediaImage(fields, 'mobile_image', false),
    desktopAlt: requiredText(fields, 'desktop_alt'),
    mobileAlt: optionalText(fields, 'mobile_alt') || null,
    eyebrow: optionalText(fields, 'eyebrow'),
    heading: requiredText(fields, 'heading'),
    supportingText: optionalText(fields, 'supporting_text'),
    primaryCtaLabel: optionalText(fields, 'primary_cta_label'),
    primaryCtaUrl: optionalUrl(fields, 'primary_cta_url'),
    secondaryCtaLabel: optionalText(fields, 'secondary_cta_label'),
    secondaryCtaUrl: optionalUrl(fields, 'secondary_cta_url'),
    textColor: optionalColor(fields, 'text_color'),
    overlayColor: optionalColor(fields, 'overlay_color'),
    overlayOpacity: optionalInteger(fields, 'overlay_opacity', 0, 100),
    startsAt,
    endsAt,
  };
};

const mapHomepageSection = (entry: ShopifyMetaobject): HomepageSection | null => {
  const fields = entryFields(entry, 'homepage_section');
  const component = requiredText(fields, 'component_type');
  if (!isAllowedHomepageComponent(component)) return null;
  const image = mediaImage(fields, 'desktop_image', false);
  return {
    id: entry.id,
    handle: entry.handle,
    sectionKey: requiredText(fields, 'section_key'),
    componentType: component,
    visible: requiredBoolean(fields, 'visible'),
    sortOrder: requiredInteger(fields, 'sort_order'),
    eyebrow: optionalText(fields, 'eyebrow'),
    heading: optionalText(fields, 'heading'),
    body: optionalText(fields, 'body'),
    image,
    imageAlt: optionalText(fields, 'image_alt'),
    ctaLabel: optionalText(fields, 'cta_label'),
    ctaUrl: optionalUrl(fields, 'cta_url'),
    backgroundColor: optionalColor(fields, 'background_color'),
    textColor: optionalColor(fields, 'text_color'),
    products: fieldReferences(fields, 'products'),
    collections: fieldReferences(fields, 'collections'),
    heroBanners: fieldReferences(fields, 'hero_banners'),
  };
};

const mapPromotionalBanner = (entry: ShopifyMetaobject): PromotionalBanner => {
  const fields = entryFields(entry, 'promotional_banner');
  const startsAt = optionalDate(fields, 'starts_at');
  const endsAt = optionalDate(fields, 'ends_at');
  if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
    throw new ShopifyApiError('invalid-response', 'Shopify promotion has an invalid scheduling range.');
  }
  return {
    id: entry.id,
    handle: entry.handle,
    enabled: requiredBoolean(fields, 'enabled'),
    message: requiredText(fields, 'message'),
    desktopImage: mediaImage(fields, 'desktop_image', false),
    mobileImage: mediaImage(fields, 'mobile_image', false),
    imageAlt: optionalText(fields, 'image_alt'),
    ctaLabel: optionalText(fields, 'cta_label'),
    ctaUrl: optionalUrl(fields, 'cta_url'),
    backgroundColor: optionalColor(fields, 'background_color'),
    textColor: optionalColor(fields, 'text_color'),
    startsAt,
    endsAt,
  };
};

const mapTestimonial = (entry: ShopifyMetaobject): ShopifyTestimonial => {
  const fields = entryFields(entry, 'testimonial');
  const rating = optionalInteger(fields, 'rating', 1, 5);
  return {
    id: entry.id,
    handle: entry.handle,
    quote: requiredText(fields, 'quote'),
    displayName: requiredText(fields, 'display_name'),
    roleOrContext: optionalText(fields, 'role_or_context'),
    rating,
    product: fields.get('product')?.reference ?? null,
    avatar: mediaImage(fields, 'avatar', false),
    avatarAlt: optionalText(fields, 'avatar_alt'),
    reviewDate: optionalDate(fields, 'review_date'),
    verifiedPurchase: requiredBoolean(fields, 'verified_purchase'),
    visible: requiredBoolean(fields, 'visible'),
    sortOrder: requiredInteger(fields, 'sort_order'),
  };
};

const mapFaq = (entry: ShopifyMetaobject): ShopifyFaq => {
  const fields = entryFields(entry, 'faq');
  return {
    id: entry.id,
    handle: entry.handle,
    question: requiredText(fields, 'question'),
    answerRichText: requiredText(fields, 'answer'),
    group: requiredText(fields, 'group'),
    product: fields.get('product')?.reference ?? null,
    visible: requiredBoolean(fields, 'visible'),
    sortOrder: requiredInteger(fields, 'sort_order'),
  };
};

const mapBrandStory = (entry: ShopifyMetaobject): ShopifyBrandStory => {
  const fields = entryFields(entry, 'brand_story');
  return {
    id: entry.id,
    handle: entry.handle,
    title: requiredText(fields, 'title'),
    eyebrow: optionalText(fields, 'eyebrow'),
    summary: requiredText(fields, 'summary'),
    bodyRichText: requiredText(fields, 'body'),
    image: mediaImage(fields, 'image', false),
    mobileImage: mediaImage(fields, 'mobile_image', false),
    imageAlt: optionalText(fields, 'image_alt'),
    ctaLabel: optionalText(fields, 'cta_label'),
    ctaUrl: optionalUrl(fields, 'cta_url'),
    visible: requiredBoolean(fields, 'visible'),
  };
};

const getEntries = async (
  type: string,
  signal?: AbortSignal
): Promise<ShopifyMetaobject[]> => {
  const entries: ShopifyMetaobject[] = [];
  let after: string | null = null;
  do {
    const page: ShopifyConnection<ShopifyMetaobject> = await getMetaobjects({
      type,
      first: 100,
      after,
      signal,
    });
    entries.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    if (page.pageInfo.hasNextPage && !after) {
      throw new ShopifyApiError('invalid-response', `Shopify ${type} content returned no pagination cursor.`);
    }
  } while (after);
  return entries;
};

const sortByOrder = <T extends { sortOrder: number; handle: string }>(entries: T[]): T[] =>
  entries.sort((a, b) => a.sortOrder - b.sortOrder || a.handle.localeCompare(b.handle));

export const getHomepageHeroBanners = async (
  signal?: AbortSignal,
  now = Date.now()
): Promise<HomepageHeroBanner[]> =>
  sortByOrder((await getEntries('homepage_hero_banner', signal))
    .map(mapHomepageHeroBanner)
    .filter((entry) => entry.enabled && isCurrentlyActive(entry.startsAt, entry.endsAt, now)));

export const getHomepageSections = async (
  signal?: AbortSignal
): Promise<HomepageSection[]> =>
  sortByOrder((await getEntries('homepage_section', signal))
    .map(mapHomepageSection)
    .filter((entry): entry is HomepageSection => entry !== null && entry.visible));

export const getPromotionalBanners = async (
  signal?: AbortSignal,
  now = Date.now()
): Promise<PromotionalBanner[]> =>
  (await getEntries('promotional_banner', signal))
    .map(mapPromotionalBanner)
    .filter((entry) => entry.enabled && isCurrentlyActive(entry.startsAt, entry.endsAt, now));

export const getTestimonials = async (signal?: AbortSignal): Promise<ShopifyTestimonial[]> =>
  sortByOrder((await getEntries('testimonial', signal))
    .map(mapTestimonial)
    .filter((entry) => entry.visible));

export const getFaqs = async (
  group?: string,
  signal?: AbortSignal
): Promise<ShopifyFaq[]> =>
  sortByOrder((await getEntries('faq', signal))
    .map(mapFaq)
    .filter((entry) => entry.visible && (!group || entry.group === group)));

export const getBrandStories = async (signal?: AbortSignal): Promise<ShopifyBrandStory[]> =>
  (await getEntries('brand_story', signal)).map(mapBrandStory).filter((entry) => entry.visible);

export const isAllowedHomepageComponent = (value: string): value is HomepageSectionComponent =>
  COMPONENT_TYPES.has(value as HomepageSectionComponent);
