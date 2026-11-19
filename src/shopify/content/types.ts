import type { ShopifyImage, ShopifyMetaobject, ShopifyMetaobjectReference } from '../types';

export interface HomepageHeroBanner {
  id: string;
  handle: string;
  enabled: boolean;
  sortOrder: number;
  desktopImage: ShopifyImage;
  mobileImage: ShopifyImage | null;
  desktopAlt: string;
  mobileAlt: string | null;
  eyebrow: string;
  heading: string;
  supportingText: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  textColor: string | null;
  overlayColor: string | null;
  overlayOpacity: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export type HomepageSectionComponent =
  | 'hero'
  | 'featured_products'
  | 'featured_collections'
  | 'science'
  | 'innovation'
  | 'global_science_network'
  | 'featured_protection'
  | 'testimonials'
  | 'faq'
  | 'promotional_banner'
  | 'brand_story'
  | 'trust_badges';

export interface HomepageSection {
  id: string;
  handle: string;
  sectionKey: string;
  componentType: HomepageSectionComponent;
  visible: boolean;
  sortOrder: number;
  eyebrow: string;
  heading: string;
  body: string;
  image: ShopifyImage | null;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  backgroundColor: string | null;
  textColor: string | null;
  products: ShopifyMetaobjectReference[];
  collections: ShopifyMetaobjectReference[];
  heroBanners: ShopifyMetaobjectReference[];
}

export interface PromotionalBanner {
  id: string;
  handle: string;
  enabled: boolean;
  message: string;
  desktopImage: ShopifyImage | null;
  mobileImage: ShopifyImage | null;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  backgroundColor: string | null;
  textColor: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface ShopifyTestimonial {
  id: string;
  handle: string;
  quote: string;
  displayName: string;
  roleOrContext: string;
  rating: number | null;
  product: ShopifyMetaobjectReference | null;
  avatar: ShopifyImage | null;
  avatarAlt: string;
  reviewDate: string | null;
  verifiedPurchase: boolean;
  visible: boolean;
  sortOrder: number;
}

export interface ShopifyFaq {
  id: string;
  handle: string;
  question: string;
  answerRichText: string;
  group: string;
  product: ShopifyMetaobjectReference | null;
  visible: boolean;
  sortOrder: number;
}

export interface ShopifyBrandStory {
  id: string;
  handle: string;
  title: string;
  eyebrow: string;
  summary: string;
  bodyRichText: string;
  image: ShopifyImage | null;
  mobileImage: ShopifyImage | null;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  visible: boolean;
}

export interface ShopifyCmsEntry extends ShopifyMetaobject {
  type:
    | 'homepage_hero_banner'
    | 'homepage_section'
    | 'promotional_banner'
    | 'testimonial'
    | 'faq'
    | 'brand_story'
    | 'trust_badge'
    | 'custom_landing_page'
    | 'global_website_settings'
    | 'header_configuration'
    | 'footer_configuration';
}
