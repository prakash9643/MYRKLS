import { getShopifyClient } from '../graphql-client';
import { ShopifyApiError } from '../errors';
import {
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_VARIANTS_QUERY,
} from '../queries/catalog';
import type { ShopifyConnection, ShopifyProduct, ShopifyVariant } from '../types';
import {
  isRecord,
  mapConnection,
  mapPageInfo,
  mapProduct,
  mapVariant,
  normalizeCursor,
  normalizePageSize,
} from './shared';

export interface ProductPageInput {
  first?: number;
  after?: string | null;
  signal?: AbortSignal;
}

interface ProductsData {
  products: unknown;
}

interface ProductData {
  product: unknown;
}

interface ProductVariantsData {
  node: unknown;
}

interface ProductVariantsVariables {
  id: string;
  first: number;
  after: string | null;
}

export const getProducts = async (
  input: ProductPageInput = {}
): Promise<ShopifyConnection<ShopifyProduct>> => {
  const data = await getShopifyClient().query<ProductsData, { first: number; after: string | null }>(
    'ShopifyProducts',
    PRODUCTS_QUERY,
    { first: normalizePageSize(input.first), after: normalizeCursor(input.after) },
    { signal: input.signal }
  );
  return mapConnection<unknown, ShopifyProduct>(data.products, mapProduct, 'products');
};

export const getProductByHandle = async (
  handle: string,
  signal?: AbortSignal
): Promise<ShopifyProduct | null> => {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) return null;
  const data = await getShopifyClient().query<ProductData, { handle: string }>(
    'ShopifyProductByHandle',
    PRODUCT_BY_HANDLE_QUERY,
    { handle: normalizedHandle },
    { signal }
  );
  return data.product === null ? null : mapProduct(data.product);
};

export const getProductVariants = async (
  productId: string,
  input: ProductPageInput = {}
): Promise<ShopifyConnection<ShopifyVariant> | null> => {
  const data = await getShopifyClient().query<ProductVariantsData, ProductVariantsVariables>(
    'ShopifyProductVariants',
    PRODUCT_VARIANTS_QUERY,
    {
      id: productId,
      first: normalizePageSize(input.first),
      after: normalizeCursor(input.after),
    },
    { signal: input.signal }
  );
  if (data.node === null) return null;
  if (!isRecord(data.node) || data.node.variants === undefined) {
    throw new ShopifyApiError(
      'invalid-response',
      'Shopify returned an invalid product variant response.'
    );
  }
  return mapConnection<unknown, ShopifyVariant>(
    data.node.variants,
    mapVariant,
    'product variants'
  );
};

export const getProductPageInfo = (value: unknown) => mapPageInfo(value);
