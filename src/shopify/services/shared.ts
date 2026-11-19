import { ShopifyApiError } from '../errors';
import type {
  ShopifyConnection,
  ShopifyImage,
  ShopifyMoney,
  ShopifyPageInfo,
  ShopifyProduct,
  ShopifyVariant,
  ShopifyProductOption,
  ShopifySelectedOption,
} from '../types';

export type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

export const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ShopifyApiError('invalid-response', `Shopify response is missing ${field}.`);
  }
  return value;
};

export const optionalString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

export const mapImage = (value: unknown): ShopifyImage | null => {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid product image.');
  }
  return {
    url: requiredString(value.url, 'image URL'),
    altText: typeof value.altText === 'string' ? value.altText : null,
    width: typeof value.width === 'number' ? value.width : null,
    height: typeof value.height === 'number' ? value.height : null,
  };
};

export const mapMoney = (value: unknown, field: string): ShopifyMoney => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', `Shopify response is missing ${field}.`);
  }
  const amount = requiredString(value.amount, `${field} amount`);
  if (!Number.isFinite(Number(amount))) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${field} amount.`);
  }
  return {
    amount,
    currencyCode: requiredString(value.currencyCode, `${field} currency`),
  };
};

export const mapOptionalMoney = (value: unknown, field: string): ShopifyMoney | null =>
  value === null || value === undefined ? null : mapMoney(value, field);

export const mapPageInfo = (value: unknown): ShopifyPageInfo => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify response is missing pagination data.');
  }
  if (typeof value.hasNextPage !== 'boolean' || typeof value.hasPreviousPage !== 'boolean') {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid pagination flags.');
  }
  return {
    hasNextPage: value.hasNextPage,
    hasPreviousPage: value.hasPreviousPage,
    startCursor: typeof value.startCursor === 'string' ? value.startCursor : null,
    endCursor: typeof value.endCursor === 'string' ? value.endCursor : null,
  };
};

const mapSelectedOptions = (value: unknown): ShopifySelectedOption[] => {
  if (!Array.isArray(value)) return [];
  return value.map((option, index) => {
    if (!isRecord(option)) {
      throw new ShopifyApiError(
        'invalid-response',
        `Shopify returned an invalid selected option at index ${index}.`
      );
    }
    return {
      name: requiredString(option.name, 'selected option name'),
      value: requiredString(option.value, 'selected option value'),
    };
  });
};

export const mapVariant = (value: unknown): ShopifyVariant => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid product variant.');
  }
  if (typeof value.availableForSale !== 'boolean') {
    throw new ShopifyApiError(
      'invalid-response',
      'Shopify returned an invalid variant availability value.'
    );
  }
  return {
    id: requiredString(value.id, 'variant ID'),
    title: requiredString(value.title, 'variant title'),
    sku: typeof value.sku === 'string' && value.sku.trim() ? value.sku : null,
    availableForSale: value.availableForSale,
    price: mapMoney(value.price, 'variant price'),
    compareAtPrice: mapOptionalMoney(value.compareAtPrice, 'variant compare-at price'),
    selectedOptions: mapSelectedOptions(value.selectedOptions),
    image: mapImage(value.image),
  };
};

const mapOptions = (value: unknown): ShopifyProductOption[] => {
  if (!Array.isArray(value)) return [];
  return value.map((option, index) => {
    if (!isRecord(option) || !Array.isArray(option.values)) {
      throw new ShopifyApiError(
        'invalid-response',
        `Shopify returned an invalid product option at index ${index}.`
      );
    }
    return {
      id: requiredString(option.id, 'product option ID'),
      name: requiredString(option.name, 'product option name'),
      values: option.values.map((entry, valueIndex) =>
        requiredString(entry, `product option value ${valueIndex}`)
      ),
    };
  });
};

const mapVariantConnection = (
  value: unknown
): { variants: ShopifyVariant[]; pageInfo: ShopifyPageInfo } => {
  if (!isRecord(value) || !Array.isArray(value.nodes)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid product variants.');
  }
  return {
    variants: value.nodes.map(mapVariant),
    pageInfo: mapPageInfo(value.pageInfo),
  };
};

const mapImageList = (value: unknown): ShopifyImage[] => {
  if (!isRecord(value) || !Array.isArray(value.nodes)) return [];
  return value.nodes.map((image) => {
    const mapped = mapImage(image);
    if (!mapped) {
      throw new ShopifyApiError('invalid-response', 'Shopify returned a null image in its image list.');
    }
    return mapped;
  });
};

const mapMoneyRange = (
  value: unknown,
  field: string,
  allowNull: boolean
): { minVariantPrice: ShopifyMoney | null; maxVariantPrice: ShopifyMoney | null } => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', `Shopify response is missing ${field}.`);
  }
  const minVariantPrice = mapOptionalMoney(value.minVariantPrice, `${field} minimum`);
  const maxVariantPrice = mapOptionalMoney(value.maxVariantPrice, `${field} maximum`);
  if (!allowNull && (!minVariantPrice || !maxVariantPrice)) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an incomplete ${field}.`);
  }
  return { minVariantPrice, maxVariantPrice };
};

export const mapProduct = (value: unknown): ShopifyProduct => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid product.');
  }
  if (typeof value.availableForSale !== 'boolean') {
    throw new ShopifyApiError(
      'invalid-response',
      'Shopify returned an invalid product availability value.'
    );
  }
  const variants = mapVariantConnection(value.variants);
  const priceRange = mapMoneyRange(value.priceRange, 'product price range', false);
  const compareAtPriceRange = mapMoneyRange(
    value.compareAtPriceRange,
    'product compare-at price range',
    true
  );
  const minVariantPrice = priceRange.minVariantPrice;
  const maxVariantPrice = priceRange.maxVariantPrice;
  if (!minVariantPrice || !maxVariantPrice) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an incomplete product price range.');
  }
  const seo = isRecord(value.seo) ? value.seo : {};

  return {
    id: requiredString(value.id, 'product ID'),
    handle: requiredString(value.handle, 'product handle'),
    title: requiredString(value.title, 'product title'),
    description: optionalString(value.description),
    productType: optionalString(value.productType),
    vendor: optionalString(value.vendor),
    availableForSale: value.availableForSale,
    featuredImage: mapImage(value.featuredImage),
    images: mapImageList(value.images),
    priceRange: {
      minVariantPrice,
      maxVariantPrice,
    },
    compareAtPriceRange: {
      minVariantPrice: compareAtPriceRange.minVariantPrice,
      maxVariantPrice: compareAtPriceRange.maxVariantPrice,
    },
    options: mapOptions(value.options),
    variants: variants.variants,
    variantsPageInfo: variants.pageInfo,
    seo: {
      title: typeof seo.title === 'string' ? seo.title : null,
      description: typeof seo.description === 'string' ? seo.description : null,
    },
  };
};

export const mapConnection = <TRaw, TMapped>(
  value: unknown,
  mapNode: (node: TRaw) => TMapped,
  field: string
): ShopifyConnection<TMapped> => {
  if (!isRecord(value) || !Array.isArray(value.nodes)) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${field} connection.`);
  }
  return {
    nodes: value.nodes.map((node) => mapNode(node as TRaw)),
    pageInfo: mapPageInfo(value.pageInfo),
  };
};

export const normalizePageSize = (first: number | undefined, defaultSize = 12): number => {
  if (first === undefined) return defaultSize;
  if (!Number.isInteger(first) || first < 1) {
    throw new ShopifyApiError('configuration', 'Shopify page size must be a positive integer.');
  }
  return Math.min(first, 250);
};

export const normalizeCursor = (after: string | null | undefined): string | null =>
  typeof after === 'string' && after.trim().length > 0 ? after : null;
