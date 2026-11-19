export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
}

export type OptionalConsent = Pick<ConsentPreferences, 'analytics' | 'marketing'>;

export interface CampaignAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
}

export interface EcommercePayload {
  currency?: string;
  value?: number;
  items: AnalyticsItem[];
  item_list_id?: string;
  item_list_name?: string;
  search_term?: string;
}

export type EcommerceEventName =
  | 'view_item'
  | 'view_item_list'
  | 'select_item'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout';

export type AnalyticsDataLayerEntry =
  | Record<string, unknown>
  | readonly [string, string, Record<string, string>];

export interface MetaPixelFunction {
  (command: string, ...args: unknown[]): void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    dataLayer?: AnalyticsDataLayerEntry[];
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}
