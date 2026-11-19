import { getShopifyClient } from '../graphql-client';
import { SEARCH_PRODUCTS_QUERY } from '../queries/catalog';
import type { ShopifyConnection, ShopifyProduct } from '../types';
import { ShopifyApiError } from '../errors';
import {
  isRecord,
  mapPageInfo,
  mapProduct,
  normalizeCursor,
  normalizePageSize,
} from './shared';

export interface ProductSearchInput {
  query: string;
  first?: number;
  after?: string | null;
  signal?: AbortSignal;
}

interface SearchData {
  search: unknown;
}

interface SearchVariables {
  query: string;
  first: number;
  after: string | null;
}

export const searchProducts = async (
  input: ProductSearchInput
): Promise<ShopifyConnection<ShopifyProduct>> => {
  const query = input.query.trim();
  if (!query) {
    return {
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  }

  const data = await getShopifyClient().query<SearchData, SearchVariables>(
    'ShopifySearchProducts',
    SEARCH_PRODUCTS_QUERY,
    {
      query,
      first: normalizePageSize(input.first),
      after: normalizeCursor(input.after),
    },
    { signal: input.signal }
  );
  if (!isRecord(data.search) || !Array.isArray(data.search.nodes)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid product search results.');
  }

  const products = data.search.nodes
    .filter((node) => isRecord(node) && node.__typename === 'Product')
    .map(mapProduct);
  return { nodes: products, pageInfo: mapPageInfo(data.search.pageInfo) };
};
