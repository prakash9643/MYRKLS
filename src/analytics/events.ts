import type { ShopifyCart, ShopifyCartLine, ShopifyProduct, ShopifyVariant } from '../shopify/types';
import type { AnalyticsItem, EcommercePayload } from './types';

const toAmount = (value: string): number => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

export const toAnalyticsItem = (
  product: ShopifyProduct,
  variant?: ShopifyVariant,
  quantity = 1
): AnalyticsItem => ({
  item_id: product.id,
  item_name: product.title,
  ...(product.vendor ? { item_brand: product.vendor } : {}),
  ...(product.productType ? { item_category: product.productType } : {}),
  ...(variant?.title && variant.title !== 'Default Title'
    ? { item_variant: variant.title }
    : {}),
  price: toAmount(variant?.price.amount || product.priceRange.minVariantPrice.amount),
  quantity,
});

export const toAnalyticsCartItem = (
  line: ShopifyCartLine,
  quantity = line.quantity
): AnalyticsItem => ({
  item_id: line.productId || line.merchandiseId,
  item_name: line.productTitle,
  ...(line.vendor ? { item_brand: line.vendor } : {}),
  ...(line.productType ? { item_category: line.productType } : {}),
  ...(line.variantTitle && line.variantTitle !== 'Default Title'
    ? { item_variant: line.variantTitle }
    : {}),
  price: toAmount(line.unitPrice.amount),
  quantity,
});

export const toCartEcommercePayload = (
  cart: ShopifyCart,
  lines = cart.lines,
  quantities: number[] = lines.map((line) => line.quantity)
): EcommercePayload => ({
  currency: cart.cost.totalAmount.currencyCode,
  value:
    lines.length === cart.lines.length &&
    lines.every((line, index) => line.id === cart.lines[index]?.id)
      ? toAmount(cart.cost.subtotalAmount.amount)
      : lines.reduce(
          (sum, line, index) => sum + toCartLineValue(line, quantities[index] || line.quantity),
          0
        ),
  items: lines.map((line, index) => toAnalyticsCartItem(line, quantities[index] || line.quantity)),
});

export const toCartLineValue = (line: ShopifyCartLine, quantity = line.quantity): number =>
  toAmount(line.unitPrice.amount) * quantity;

export const sanitizeSearchTerm = (query: string): string | null => {
  const normalized = query.trim().replace(/\s+/g, ' ').slice(0, 80);
  if (!normalized || /[^\s@]+@[^\s@]+\.[^\s@]+/i.test(normalized)) return null;
  if (/\+?\d[\d\s().-]{7,}\d/.test(normalized)) return null;
  return normalized;
};

export const toSearchEcommercePayload = (
  currency: string,
  query: string,
  products: ShopifyProduct[]
): EcommercePayload | null => {
  const searchTerm = sanitizeSearchTerm(query);
  if (!searchTerm) return null;
  return {
    currency,
    value: 0,
    search_term: searchTerm,
    items: products.map((product) => toAnalyticsItem(product)),
  };
};

export const getProductCurrency = (product: ShopifyProduct): string =>
  product.priceRange.minVariantPrice.currencyCode;

export const getCartLine = (cart: ShopifyCart | null, lineId: string): ShopifyCartLine | null =>
  cart?.lines.find((line) => line.id === lineId) || null;
