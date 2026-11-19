import { getShopifyClient } from '../graphql-client';
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTION_SEO_BY_HANDLE_QUERY,
} from '../queries/catalog';
import type {
  ShopifyCollection,
  ShopifyCollectionSummary,
  ShopifyConnection,
} from '../types';
import { ShopifyApiError } from '../errors';
import {
  isRecord,
  mapConnection,
  mapImage,
  mapPageInfo,
  mapProduct,
  normalizeCursor,
  normalizePageSize,
  optionalString,
  requiredString,
} from './shared';

export interface CollectionPageInput {
  first?: number;
  after?: string | null;
  signal?: AbortSignal;
}

interface CollectionsData {
  collections: unknown;
}

interface CollectionData {
  collection: unknown;
}

interface CollectionSeoData {
  collection: unknown;
}

interface CollectionVariables {
  handle: string;
  first: number;
  after: string | null;
}

const mapCollectionSummary = (value: unknown): ShopifyCollectionSummary => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid collection.');
  }
  const seo = isRecord(value.seo) ? value.seo : {};
  return {
    id: requiredString(value.id, 'collection ID'),
    handle: requiredString(value.handle, 'collection handle'),
    title: requiredString(value.title, 'collection title'),
    description: optionalString(value.description),
    image: mapImage(value.image),
    seo: {
      title: typeof seo.title === 'string' ? seo.title : null,
      description: typeof seo.description === 'string' ? seo.description : null,
    },
  };
};

export const getCollections = async (
  input: CollectionPageInput = {}
): Promise<ShopifyConnection<ShopifyCollectionSummary>> => {
  const data = await getShopifyClient().query<
    CollectionsData,
    { first: number; after: string | null }
  >('ShopifyCollections', COLLECTIONS_QUERY, {
    first: normalizePageSize(input.first, 50),
    after: normalizeCursor(input.after),
  }, { signal: input.signal });
  return mapConnection<unknown, ShopifyCollectionSummary>(
    data.collections,
    mapCollectionSummary,
    'collections'
  );
};

export const getCollectionByHandle = async (
  handle: string,
  input: CollectionPageInput = {}
): Promise<ShopifyCollection | null> => {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) return null;

  const data = await getShopifyClient().query<CollectionData, CollectionVariables>(
    'ShopifyCollectionByHandle',
    COLLECTION_BY_HANDLE_QUERY,
    {
      handle: normalizedHandle,
      first: normalizePageSize(input.first),
      after: normalizeCursor(input.after),
    },
    { signal: input.signal }
  );
  if (data.collection === null) return null;
  if (!isRecord(data.collection)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid collection.');
  }

  const summary = mapCollectionSummary(data.collection);
  const products = mapConnection<unknown, ShopifyCollection['products']['nodes'][number]>(
    data.collection.products,
    mapProduct,
    'collection products'
  );
  return { ...summary, products };
};

export const getCollectionSummaryByHandle = async (
  handle: string,
  signal?: AbortSignal
): Promise<ShopifyCollectionSummary | null> => {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) return null;
  const data = await getShopifyClient().query<CollectionSeoData, { handle: string }>(
    'ShopifyCollectionSeoByHandle',
    COLLECTION_SEO_BY_HANDLE_QUERY,
    { handle: normalizedHandle },
    { signal }
  );
  return data.collection === null ? null : mapCollectionSummary(data.collection);
};

export const getCollectionProductPageInfo = (value: unknown) => mapPageInfo(value);
