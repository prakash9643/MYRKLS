export const DEFAULT_SHOPIFY_API_VERSION = '2026-10';

export interface ShopifyEnvironment {
  VITE_SHOPIFY_STORE_DOMAIN?: string;
  VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN?: string;
  VITE_SHOPIFY_API_VERSION?: string;
}

export interface ShopifyConfig {
  storeDomain: string;
  storefrontAccessToken: string;
  apiVersion: string;
}

export interface ShopifyConfigResult {
  config: ShopifyConfig | null;
  missing: string[];
  error: string | null;
}

const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;
const API_VERSION_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const readShopifyConfig = (
  environment: ShopifyEnvironment = {
    VITE_SHOPIFY_STORE_DOMAIN: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
    VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    VITE_SHOPIFY_API_VERSION: import.meta.env.VITE_SHOPIFY_API_VERSION,
  }
): ShopifyConfigResult => {
  const storeDomain = environment.VITE_SHOPIFY_STORE_DOMAIN?.trim().toLowerCase() || '';
  const storefrontAccessToken =
    environment.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() || '';
  const apiVersion =
    environment.VITE_SHOPIFY_API_VERSION?.trim() || DEFAULT_SHOPIFY_API_VERSION;
  const missing: string[] = [];

  if (!storeDomain) missing.push('VITE_SHOPIFY_STORE_DOMAIN');
  if (!storefrontAccessToken) {
    missing.push('VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  if (missing.length > 0) {
    return { config: null, missing, error: null };
  }

  if (!SHOP_DOMAIN_PATTERN.test(storeDomain)) {
    return {
      config: null,
      missing: [],
      error: 'VITE_SHOPIFY_STORE_DOMAIN must be a *.myshopify.com hostname.',
    };
  }

  if (!API_VERSION_PATTERN.test(apiVersion)) {
    return {
      config: null,
      missing: [],
      error: 'VITE_SHOPIFY_API_VERSION must use the YYYY-MM format.',
    };
  }

  return {
    config: { storeDomain, storefrontAccessToken, apiVersion },
    missing: [],
    error: null,
  };
};
