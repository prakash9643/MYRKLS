import type { ShopifyImage, ShopifyProduct } from './types';

const SHOPIFY_CDN_HOST = 'cdn.shopify.com';

const getTransformedShopifyImageUrl = (source: string, width: number): string => {
  try {
    const url = new URL(source);
    if (url.protocol === 'https:' && url.hostname === SHOPIFY_CDN_HOST) {
      url.searchParams.set('width', String(width));
      return url.toString();
    }
  } catch {
    return source;
  }
  return source;
};

export const getShopifyImageUrl = (
  source: string | null,
  width: number
): string | null => {
  if (!source || !Number.isInteger(width) || width < 1) return source;
  return getTransformedShopifyImageUrl(source, width);
};

export const getShopifyImageSrcSet = (
  source: string | null,
  widths: number[]
): string | undefined => {
  if (!source) return undefined;
  try {
    if (new URL(source).hostname !== SHOPIFY_CDN_HOST) return undefined;
  } catch {
    return undefined;
  }
  const validWidths = [...new Set(widths)]
    .filter((width) => Number.isInteger(width) && width > 0)
    .sort((left, right) => left - right);
  return validWidths.length
    ? validWidths
        .map((width) => `${getTransformedShopifyImageUrl(source, width)} ${width}w`)
        .join(', ')
    : undefined;
};

export const getProductImage = (product: ShopifyProduct): ShopifyImage | null =>
  product.featuredImage || product.images[0] || null;

export const formatShopifyMoney = (amount: string, currencyCode: string): string => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return `${currencyCode} ${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currencyCode} ${amount}`;
  }
};

export const formatProductPrice = (product: ShopifyProduct): string => {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const min = formatShopifyMoney(minVariantPrice.amount, minVariantPrice.currencyCode);
  const max = formatShopifyMoney(maxVariantPrice.amount, maxVariantPrice.currencyCode);
  return min === max ? min : `${min} – ${max}`;
};

export const formatCompareAtPrice = (product: ShopifyProduct): string | null => {
  const { minVariantPrice, maxVariantPrice } = product.compareAtPriceRange;
  if (!minVariantPrice || !maxVariantPrice) return null;
  if (
    Number(minVariantPrice.amount) <= Number(product.priceRange.minVariantPrice.amount) ||
    Number(maxVariantPrice.amount) <= Number(product.priceRange.maxVariantPrice.amount)
  ) {
    return null;
  }
  const min = formatShopifyMoney(minVariantPrice.amount, minVariantPrice.currencyCode);
  const max = formatShopifyMoney(maxVariantPrice.amount, maxVariantPrice.currencyCode);
  return min === max ? min : `${min} – ${max}`;
};
