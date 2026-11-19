import { getCampaignAttribution } from './attribution';
import { readAnalyticsConfig } from './config';
import { pushDataLayerEntry } from './data-layer';
import { sanitizeSearchTerm } from './events';
import { readConsentPreferences } from './consent';
import type { ShopifyProduct } from '../shopify/types';
import type {
  CampaignAttribution,
  ConsentPreferences,
  EcommerceEventName,
  EcommercePayload,
  MetaPixelFunction,
} from './types';

let activeConsent: ConsentPreferences | null = readConsentPreferences();
let gtmLoadedForId: string | null = null;
let metaPixelLoadedForId: string | null = null;
let eventSequence = 0;

const getEventId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  eventSequence += 1;
  return `myrkls-${Date.now()}-${eventSequence}`;
};

const getConsentMode = (consent: ConsentPreferences | null): Record<string, string> => ({
  analytics_storage: consent?.analytics ? 'granted' : 'denied',
  ad_storage: consent?.marketing ? 'granted' : 'denied',
  ad_user_data: consent?.marketing ? 'granted' : 'denied',
  ad_personalization: consent?.marketing ? 'granted' : 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
});

const ensureGtm = (): void => {
  const { enabled, gtmId } = readAnalyticsConfig();
  if (!enabled || !gtmId || !activeConsent?.analytics || gtmLoadedForId === gtmId) return;

  pushDataLayerEntry(['consent', 'default', getConsentMode(null)]);
  pushDataLayerEntry({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  script.dataset.myrklsGtm = gtmId;
  script.onerror = () => {
    gtmLoadedForId = null;
  };
  document.head.appendChild(script);
  gtmLoadedForId = gtmId;
};

const initializeMetaPixel = (pixelId: string): MetaPixelFunction => {
  const pixel = ((...args: unknown[]) => {
    const callable = pixel as MetaPixelFunction;
    if (callable.callMethod) callable.callMethod(...args);
    else (callable.queue ||= []).push(args);
  }) as MetaPixelFunction;
  pixel.queue = [];
  pixel.loaded = true;
  pixel.version = '2.0';
  window.fbq = pixel;
  window._fbq = pixel;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.dataset.myrklsMetaPixel = pixelId;
  script.onerror = () => {
    metaPixelLoadedForId = null;
  };
  document.head.appendChild(script);
  pixel('init', pixelId);
  pixel('consent', 'grant');
  return pixel;
};

const ensureMetaPixel = (): MetaPixelFunction | null => {
  const { enabled, metaPixelId } = readAnalyticsConfig();
  if (!enabled || !metaPixelId || !activeConsent?.marketing) return null;
  if (metaPixelLoadedForId === metaPixelId && window.fbq) {
    window.fbq('consent', 'grant');
    return window.fbq;
  }
  const pixel = initializeMetaPixel(metaPixelId);
  metaPixelLoadedForId = metaPixelId;
  return pixel;
};

export const updateAnalyticsConsent = (consent: ConsentPreferences | null): void => {
  const hadMarketing = activeConsent?.marketing === true;
  activeConsent = consent;

  if (gtmLoadedForId) {
    pushDataLayerEntry(['consent', 'update', getConsentMode(consent)]);
  } else if (consent?.analytics) {
    ensureGtm();
    if (gtmLoadedForId) {
      pushDataLayerEntry(['consent', 'update', getConsentMode(consent)]);
    }
  }

  if (window.fbq && hadMarketing && !consent?.marketing) {
    window.fbq('consent', 'revoke');
  } else if (consent?.marketing) {
    ensureMetaPixel();
  }

};

export const getActiveConsent = (): ConsentPreferences | null => activeConsent;

export const trackPageView = (
  pageTitle: string,
  pageLocation: string,
  pagePath: string,
  campaign: CampaignAttribution = getCampaignAttribution(),
  eventId = getEventId()
): boolean => {
  const config = readAnalyticsConfig();
  if (!config.enabled) return false;
  let sent = false;
  if (activeConsent?.analytics && config.gtmId) {
    ensureGtm();
    pushDataLayerEntry({
      event: 'page_view',
      event_id: eventId,
      page_title: pageTitle.slice(0, 200),
      page_location: pageLocation,
      page_path: pagePath,
      ...campaign,
    });
    sent = true;
  }
  if (activeConsent?.marketing) {
    const pixel = ensureMetaPixel();
    if (pixel) {
      pixel('track', 'PageView', {}, { eventID: eventId });
      sent = true;
    }
  }
  return sent;
};

const toMetaContents = (payload: EcommercePayload) =>
  payload.items.map((item) => ({
    id: item.item_id,
    quantity: item.quantity,
    item_price: item.price,
  }));

export const trackEcommerceEvent = (
  eventName: EcommerceEventName,
  payload: EcommercePayload,
  options: {
    eventId?: string;
    searchTerm?: string;
    campaign?: CampaignAttribution;
  } = {}
): boolean => {
  const config = readAnalyticsConfig();
  if (!config.enabled) return false;
  const eventId = options.eventId || getEventId();
  const campaign = options.campaign || getCampaignAttribution();
  let sent = false;

  if (activeConsent?.analytics && config.gtmId) {
    ensureGtm();
    pushDataLayerEntry({ ecommerce: null });
    pushDataLayerEntry({
      event: eventName,
      event_id: eventId,
      ecommerce: payload,
      ...(options.searchTerm ? { search_term: options.searchTerm } : {}),
      ...campaign,
    });
    sent = true;
  }

  const pixel = activeConsent?.marketing && config.metaPixelId ? ensureMetaPixel() : null;
  if (pixel) {
    const contents = toMetaContents(payload);
    const metaPayload = {
      content_ids: contents.map((content) => content.id),
      contents,
      content_type: 'product',
      ...(payload.currency ? { currency: payload.currency } : {}),
      ...(Number.isFinite(payload.value) ? { value: payload.value } : {}),
      ...(options.searchTerm ? { search_string: options.searchTerm } : {}),
    };
    switch (eventName) {
      case 'view_item':
        pixel('track', 'ViewContent', metaPayload, { eventID: eventId });
        sent = true;
        break;
      case 'search':
        pixel('track', 'Search', metaPayload, { eventID: eventId });
        sent = true;
        break;
      case 'add_to_cart':
        pixel('track', 'AddToCart', metaPayload, { eventID: eventId });
        sent = true;
        break;
      case 'begin_checkout':
        pixel('track', 'InitiateCheckout', metaPayload, { eventID: eventId });
        sent = true;
        break;
      default:
        break;
    }
  }

  return sent;
};

export const trackSearchEvent = (query: string, products: ShopifyProduct[]): boolean => {
  const config = readAnalyticsConfig();
  if (!config.enabled) return false;
  const searchTerm = sanitizeSearchTerm(query);
  if (!searchTerm) return false;
  const eventId = getEventId();
  let sent = false;

  if (activeConsent?.analytics && config.gtmId) {
    ensureGtm();
    pushDataLayerEntry({ ecommerce: null });
    pushDataLayerEntry({
      event: 'search',
      event_id: eventId,
      search_term: searchTerm,
      items: products.slice(0, 20).map((product) => ({
        item_id: product.id,
        item_name: product.title,
        ...(product.vendor ? { item_brand: product.vendor } : {}),
        ...(product.productType ? { item_category: product.productType } : {}),
        price: Number(product.priceRange.minVariantPrice.amount),
      })),
      ...getCampaignAttribution(),
    });
    sent = true;
  }

  const pixel = activeConsent?.marketing && config.metaPixelId ? ensureMetaPixel() : null;
  if (pixel) {
    const contents = products.slice(0, 20).map((product) => ({
      id: product.id,
      quantity: 1,
      item_price: Number(product.priceRange.minVariantPrice.amount),
    }));
    pixel(
      'track',
      'Search',
      {
        search_string: searchTerm,
        content_ids: contents.map((content) => content.id),
        contents,
        content_type: 'product',
      },
      { eventID: eventId }
    );
    sent = true;
  }
  return sent;
};

export const trackAccountEvent = (eventName: 'login' | 'sign_up'): boolean => {
  const config = readAnalyticsConfig();
  if (!config.enabled) return false;
  let sent = false;
  if (activeConsent?.analytics && config.gtmId) {
    ensureGtm();
    pushDataLayerEntry({ event: eventName, event_id: getEventId() });
    sent = true;
  }
  if (eventName === 'sign_up' && activeConsent?.marketing && config.metaPixelId) {
    const pixel = ensureMetaPixel();
    if (pixel) {
      pixel('track', 'CompleteRegistration', {}, { eventID: getEventId() });
      sent = true;
    }
  }
  return sent;
};

export const resetAnalyticsForTests = (): void => {
  activeConsent = null;
  gtmLoadedForId = null;
  metaPixelLoadedForId = null;
  eventSequence = 0;
};
