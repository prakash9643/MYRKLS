import { getShopifyClient } from '../graphql-client';
import { METAOBJECTS_QUERY, METAOBJECT_BY_HANDLE_QUERY } from '../queries/metaobjects';
import type {
  ShopifyConnection,
  ShopifyMetaobject,
  ShopifyMetaobjectReference,
} from '../types';
import { ShopifyApiError } from '../errors';
import {
  isRecord,
  mapImage,
  mapPageInfo,
  normalizeCursor,
  normalizePageSize,
  requiredString,
} from './shared';

export interface MetaobjectPageInput {
  type: string;
  first?: number;
  after?: string | null;
  signal?: AbortSignal;
}

interface MetaobjectsData {
  metaobjects: unknown;
}

interface MetaobjectData {
  metaobject: unknown;
}

const mapReference = (value: unknown): ShopifyMetaobjectReference | null => {
  if (value === null || value === undefined) return null;
  if (!isRecord(value) || typeof value.__typename !== 'string') {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid Metaobject reference.');
  }
  const id = requiredString(value.id, 'Metaobject reference ID');
  switch (value.__typename) {
    case 'MediaImage':
      return { kind: 'image', id, image: mapImage(value.image) };
    case 'GenericFile':
      return {
        kind: 'file',
        id,
        url: requiredString(value.url, 'Metaobject file URL'),
        mimeType: typeof value.mimeType === 'string' ? value.mimeType : null,
      };
    case 'Metaobject':
      return {
        kind: 'metaobject',
        id,
        type: requiredString(value.type, 'referenced Metaobject type'),
        handle: requiredString(value.handle, 'referenced Metaobject handle'),
      };
    case 'Product':
    case 'Collection':
    case 'Page':
      return {
        kind: value.__typename.toLowerCase() as 'product' | 'collection' | 'page',
        id,
        handle: requiredString(value.handle, 'referenced resource handle'),
        title: requiredString(value.title, 'referenced resource title'),
      };
    default:
      return null;
  }
};

const mapMetaobject = (value: unknown): ShopifyMetaobject => {
  if (!isRecord(value) || !Array.isArray(value.fields)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid Metaobject.');
  }
  return {
    id: requiredString(value.id, 'Metaobject ID'),
    type: requiredString(value.type, 'Metaobject type'),
    handle: requiredString(value.handle, 'Metaobject handle'),
    fields: value.fields.map((field, index) => {
      if (!isRecord(field)) {
        throw new ShopifyApiError(
          'invalid-response',
          `Shopify returned an invalid Metaobject field at index ${index}.`
        );
      }
      const references = isRecord(field.references) ? field.references : {};
      const referenceNodes = Array.isArray(references.nodes) ? references.nodes : [];
      const pageInfo = isRecord(references.pageInfo) ? references.pageInfo : {};
      if (pageInfo.hasNextPage === true) {
        throw new ShopifyApiError(
          'invalid-response',
          `Shopify Metaobject reference list for ${String(field.key)} exceeds the supported page size.`
        );
      }
      return {
        key: requiredString(field.key, `Metaobject field key ${index}`),
        type: typeof field.type === 'string' ? field.type : '',
        value: typeof field.value === 'string' ? field.value : null,
        reference: mapReference(field.reference),
        references: referenceNodes
          .map(mapReference)
          .filter((reference): reference is ShopifyMetaobjectReference => reference !== null),
        referencesPageInfo: {
          hasNextPage: pageInfo.hasNextPage === true,
          endCursor: typeof pageInfo.endCursor === 'string' ? pageInfo.endCursor : null,
        },
      };
    }),
  };
};

const normalizeType = (type: string): string => {
  const normalized = type.trim();
  if (!/^[a-z][a-z0-9_]{0,99}$/.test(normalized)) {
    throw new ShopifyApiError('configuration', 'Metaobject type must be a valid Shopify type key.');
  }
  return normalized;
};

export const getMetaobjects = async (
  input: MetaobjectPageInput
): Promise<ShopifyConnection<ShopifyMetaobject>> => {
  const type = normalizeType(input.type);
  const data = await getShopifyClient().query<
    MetaobjectsData,
    { type: string; first: number; after: string | null }
  >('ShopifyMetaobjects', METAOBJECTS_QUERY, {
    type,
    first: normalizePageSize(input.first, 50),
    after: normalizeCursor(input.after),
  }, { signal: input.signal });
  if (!isRecord(data.metaobjects) || !Array.isArray(data.metaobjects.nodes)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid Metaobjects.');
  }
  return {
    nodes: data.metaobjects.nodes.map(mapMetaobject),
    pageInfo: mapPageInfo(data.metaobjects.pageInfo),
  };
};

export const getMetaobjectByHandle = async (
  typeValue: string,
  handle: string,
  signal?: AbortSignal
): Promise<ShopifyMetaobject | null> => {
  const type = normalizeType(typeValue);
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) return null;
  const data = await getShopifyClient().query<
    MetaobjectData,
    { type: string; handle: string }
  >('ShopifyMetaobjectByHandle', METAOBJECT_BY_HANDLE_QUERY, {
    type,
    handle: normalizedHandle,
  }, { signal });
  return data.metaobject === null ? null : mapMetaobject(data.metaobject);
};
