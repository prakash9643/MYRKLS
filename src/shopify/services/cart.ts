import { getShopifyClient } from '../graphql-client';
import { readShopifyConfig } from '../config';
import { ShopifyApiError, ShopifyCartError } from '../errors';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  SHOP_PRIMARY_DOMAIN_QUERY,
} from '../queries/cart';
import type {
  ShopifyCart,
  ShopifyCartLine,
  ShopifyCartUserError,
  ShopifyImage,
  ShopifyMoney,
  ShopifyPageInfo,
  ShopifySelectedOption,
} from '../types';
import { isRecord, mapPageInfo, optionalString } from './shared';

const CART_LINE_PAGE_SIZE = 250;

interface CartPage {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: ShopifyCart['cost'];
  lines: {
    nodes: unknown[];
    pageInfo: ShopifyPageInfo;
  };
}

interface CartQueryData {
  cart: unknown;
}

interface CartQueryVariables {
  id: string;
  first: number;
  after: string | null;
}

interface PrimaryDomainData {
  shop: unknown;
}

interface CreateCartVariables {
  input: {
    lines: Array<{ merchandiseId: string; quantity: number }>;
  };
}

interface AddLinesVariables {
  cartId: string;
  lines: Array<{ merchandiseId: string; quantity: number }>;
}

interface UpdateLinesVariables {
  cartId: string;
  lines: Array<{ id: string; quantity: number }>;
}

interface RemoveLinesVariables {
  cartId: string;
  lineIds: string[];
}

const requiredString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${label}.`);
  }
  return value;
};

const requiredNumber = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${label}.`);
  }
  return value;
};

const requiredBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== 'boolean') {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${label}.`);
  }
  return value;
};

const mapMoney = (value: unknown, label: string): ShopifyMoney => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${label}.`);
  }
  const amount = requiredString(value.amount, `${label} amount`);
  if (!/^-?\d+(?:\.\d+)?$/.test(amount)) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${label} amount.`);
  }
  return {
    amount,
    currencyCode: requiredString(value.currencyCode, `${label} currency`),
  };
};

const mapImage = (value: unknown): ShopifyImage | null => {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid cart image.');
  }
  return {
    url: requiredString(value.url, 'cart image URL'),
    altText: typeof value.altText === 'string' ? value.altText : null,
    width: typeof value.width === 'number' ? value.width : null,
    height: typeof value.height === 'number' ? value.height : null,
  };
};

const mapSelectedOptions = (value: unknown): ShopifySelectedOption[] => {
  if (!Array.isArray(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid cart variant options.');
  }
  return value.map((option, index) => {
    if (!isRecord(option)) {
      throw new ShopifyApiError(
        'invalid-response',
        `Shopify returned an invalid cart variant option at index ${index}.`
      );
    }
    return {
      name: requiredString(option.name, `cart option name ${index}`),
      value: requiredString(option.value, `cart option value ${index}`),
    };
  });
};

const mapCartLine = (value: unknown): ShopifyCartLine => {
  if (!isRecord(value) || !isRecord(value.cost) || !isRecord(value.merchandise)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid cart line.');
  }
  const merchandise = value.merchandise;
  if (!isRecord(merchandise.product)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid cart product details.');
  }
  return {
    id: requiredString(value.id, 'cart line ID'),
    merchandiseId: requiredString(merchandise.id, 'cart variant ID'),
    productId:
      typeof merchandise.product.id === 'string' ? merchandise.product.id : null,
    productTitle: requiredString(merchandise.product.title, 'cart product title'),
    productHandle: requiredString(merchandise.product.handle, 'cart product handle'),
    vendor: optionalString(merchandise.product.vendor),
    productType: optionalString(merchandise.product.productType),
    variantTitle: requiredString(merchandise.title, 'cart variant title'),
    selectedOptions: mapSelectedOptions(merchandise.selectedOptions),
    availableForSale: requiredBoolean(merchandise.availableForSale, 'cart variant availability'),
    quantity: requiredNumber(value.quantity, 'cart line quantity'),
    image: mapImage(merchandise.product.featuredImage),
    unitPrice: mapMoney(value.cost.amountPerQuantity, 'cart unit price'),
    lineTotal: mapMoney(value.cost.totalAmount, 'cart line total'),
  };
};

const getPrimaryDomainHost = async (): Promise<string> => {
  const data = await getShopifyClient().query<PrimaryDomainData, Record<string, never>>(
    'ShopifyPrimaryDomain',
    SHOP_PRIMARY_DOMAIN_QUERY,
    {},
    { cacheTtlMs: 300_000 }
  );
  if (!isRecord(data.shop) || !isRecord(data.shop.primaryDomain)) {
    throw new ShopifyApiError(
      'invalid-response',
      'Shopify did not return its primary checkout domain.'
    );
  }
  const host = requiredString(data.shop.primaryDomain.host, 'primary domain host').toLowerCase();
  if (host.includes('/') || host.includes(':') || host.includes('@')) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid primary domain.');
  }
  return host;
};

const validateCheckoutUrl = async (value: unknown): Promise<string> => {
  const rawUrl = requiredString(value, 'checkout URL');
  const { config } = readShopifyConfig();
  if (!config) {
    throw new ShopifyApiError('configuration', 'Shopify checkout configuration is unavailable.');
  }
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid checkout URL.');
  }
  if (
    url.protocol !== 'https:' ||
    (url.port !== '' && url.port !== '443') ||
    url.username !== '' ||
    url.password !== ''
  ) {
    throw new ShopifyApiError(
      'invalid-response',
      'Shopify returned a checkout URL outside the approved store domain.'
    );
  }
  const checkoutHost = url.hostname.toLowerCase();
  const allowedHosts = new Set([config.storeDomain.toLowerCase()]);
  if (!allowedHosts.has(checkoutHost)) {
    allowedHosts.add(await getPrimaryDomainHost());
  }
  if (!allowedHosts.has(checkoutHost)) {
    throw new ShopifyApiError(
      'invalid-response',
      'Shopify returned a checkout URL outside the approved store domain.'
    );
  }
  return url.toString();
};

const mapCartPage = async (value: unknown): Promise<CartPage> => {
  if (!isRecord(value) || !isRecord(value.cost) || !isRecord(value.lines)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid cart.');
  }
  const nodes = value.lines.nodes;
  if (!Array.isArray(nodes)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid cart lines.');
  }
  const pageInfo = mapPageInfo(value.lines.pageInfo);
  if (!isRecord(value.cost)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid cart costs.');
  }
  return {
    id: requiredString(value.id, 'cart ID'),
    checkoutUrl: await validateCheckoutUrl(value.checkoutUrl),
    totalQuantity: requiredNumber(value.totalQuantity, 'cart quantity'),
    cost: {
      subtotalAmount: mapMoney(value.cost.subtotalAmount, 'cart subtotal'),
      totalAmount: mapMoney(value.cost.totalAmount, 'cart total'),
      subtotalAmountEstimated: requiredBoolean(
        value.cost.subtotalAmountEstimated,
        'estimated subtotal flag'
      ),
      totalAmountEstimated: requiredBoolean(
        value.cost.totalAmountEstimated,
        'estimated total flag'
      ),
    },
    lines: {
      nodes,
      pageInfo,
    },
  };
};

const safeUserErrorMessage = (code: string | null): string => {
  switch (code) {
    case 'MAXIMUM_EXCEEDED':
    case 'MINIMUM_NOT_MET':
    case 'INVALID_INCREMENT':
      return 'Shopify could not accept that quantity. Update it and try again.';
    case 'INVALID_MERCHANDISE_LINE':
      return 'This cart item is no longer available. Refresh your cart and try again.';
    case 'MERCHANDISE_NOT_APPLICABLE':
    case 'VARIANT_REQUIRES_SELLING_PLAN':
    case 'SELLING_PLAN_NOT_APPLICABLE':
      return 'This product variant is no longer available for this cart.';
    case 'CART_TOO_LARGE':
      return 'Your cart has reached Shopify’s item limit. Remove an item and try again.';
    case 'SERVICE_UNAVAILABLE':
      return 'Shopify is temporarily unable to save your cart. Please try again.';
    case 'INVALID':
      return 'Shopify could not apply this cart change. Refresh the cart and try again.';
    default:
      return 'Shopify could not apply this cart change. Please try again.';
  }
};

const parseUserErrors = (value: unknown): ShopifyCartUserError[] => {
  if (!Array.isArray(value)) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned invalid cart errors.');
  }
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new ShopifyApiError(
        'invalid-response',
        `Shopify returned an invalid cart error at index ${index}.`
      );
    }
    return {
      code: typeof entry.code === 'string' ? entry.code : null,
      field: Array.isArray(entry.field)
        ? entry.field.filter((part): part is string => typeof part === 'string')
        : [],
      message: requiredString(entry.message, `cart error message ${index}`),
    };
  });
};

const throwCartUserErrors = (errors: ShopifyCartUserError[]): void => {
  if (errors.length === 0) return;
  const firstError = errors[0];
  throw new ShopifyCartError(safeUserErrorMessage(firstError.code), {
    code: firstError.code,
  });
};

const mapCart = (page: CartPage, lines: ShopifyCartLine[]): ShopifyCart => ({
  id: page.id,
  checkoutUrl: page.checkoutUrl,
  totalQuantity: page.totalQuantity,
  lines,
  pageInfo: {
    ...page.lines.pageInfo,
    hasNextPage: false,
  },
  cost: page.cost,
});

const queryCartPage = async (
  id: string,
  after: string | null,
  signal?: AbortSignal
): Promise<CartPage | null> => {
  const data = await getShopifyClient().query<CartQueryData, CartQueryVariables>(
    'ShopifyCart',
    CART_QUERY,
    { id, first: CART_LINE_PAGE_SIZE, after },
    { signal, cacheTtlMs: 0 }
  );
  if (data.cart === null) return null;
  return mapCartPage(data.cart);
};

export const getCart = async (
  id: string,
  signal?: AbortSignal
): Promise<ShopifyCart | null> => {
  const normalizedId = id.trim();
  if (!normalizedId) return null;

  const firstPage = await queryCartPage(normalizedId, null, signal);
  if (!firstPage) return null;

  const lines = firstPage.lines.nodes.map(mapCartLine);
  let pageInfo = firstPage.lines.pageInfo;
  const seenCursors = new Set<string>();
  while (pageInfo.hasNextPage) {
    const cursor = pageInfo.endCursor;
    if (!cursor || seenCursors.has(cursor)) {
      throw new ShopifyApiError('invalid-response', 'Shopify returned an invalid cart pagination cursor.');
    }
    seenCursors.add(cursor);
    const page = await queryCartPage(normalizedId, cursor, signal);
    if (!page) return null;
    if (page.id !== firstPage.id) {
      throw new ShopifyApiError('invalid-response', 'Shopify returned inconsistent cart pages.');
    }
    lines.push(...page.lines.nodes.map(mapCartLine));
    pageInfo = page.lines.pageInfo;
  }
  return mapCart(firstPage, lines);
};

const completeMutationCart = async (value: unknown): Promise<ShopifyCart> => {
  const page = await mapCartPage(value);
  const lines = page.lines.nodes.map(mapCartLine);
  if (!page.lines.pageInfo.hasNextPage) return mapCart(page, lines);

  const fullCart = await getCart(page.id);
  if (!fullCart) {
    throw new ShopifyApiError('invalid-response', 'Shopify returned an expired cart after an update.');
  }
  return fullCart;
};

export const getFreshCartForCheckout = async (
  cartId: string,
  signal?: AbortSignal
): Promise<ShopifyCart> => {
  const cart = await getCart(cartId, signal);
  if (!cart) {
    throw new ShopifyCartError('Your Shopify cart could not be found. Add your items again.', {
      code: 'INVALID',
    });
  }
  if (cart.totalQuantity < 1 || cart.lines.length === 0) {
    throw new ShopifyCartError('Your cart is empty. Add an item before continuing to checkout.', {
      code: 'INVALID',
    });
  }
  if (cart.lines.some((line) => !line.availableForSale)) {
    throw new ShopifyCartError(
      'An item in your cart is no longer available. Update your cart before checkout.',
      { code: 'INVALID' }
    );
  }
  return cart;
};

const parseMutationPayload = async (
  value: unknown,
  operation: string
): Promise<ShopifyCart> => {
  if (!isRecord(value)) {
    throw new ShopifyApiError('invalid-response', `Shopify returned an invalid ${operation} response.`);
  }
  const errors = parseUserErrors(value.userErrors);
  throwCartUserErrors(errors);
  if (value.cart === null) {
    throw new ShopifyApiError('invalid-response', `Shopify returned no cart after ${operation}.`);
  }
  return completeMutationCart(value.cart);
};

const validateQuantity = (quantity: number): void => {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new ShopifyCartError('Choose a quantity between 1 and 999.', { code: 'INVALID' });
  }
};

const validateVariantId = (id: string): string => {
  const variantId = id.trim();
  if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)) {
    throw new ShopifyCartError('Select a valid product variant before adding it.', {
      code: 'INVALID',
    });
  }
  return variantId;
};

export const createCart = async (
  lines: Array<{ merchandiseId: string; quantity: number }>,
  signal?: AbortSignal
): Promise<ShopifyCart> => {
  if (lines.length > 250) {
    throw new ShopifyCartError('A cart can contain no more than 250 lines per request.', {
      code: 'INVALID',
    });
  }
  const normalizedLines = lines.map((line) => {
    validateQuantity(line.quantity);
    return { merchandiseId: validateVariantId(line.merchandiseId), quantity: line.quantity };
  });
  const data = await getShopifyClient().query<
    { cartCreate: unknown },
    CreateCartVariables
  >(
    'ShopifyCartCreate',
    CART_CREATE_MUTATION,
    { input: { lines: normalizedLines } },
    { signal, cacheTtlMs: 0 }
  );
  return parseMutationPayload(data.cartCreate, 'cart creation');
};

export const addCartLines = async (
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
  signal?: AbortSignal
): Promise<ShopifyCart> => {
  const normalizedCartId = requiredString(cartId.trim(), 'cart ID');
  if (lines.length === 0 || lines.length > 250) {
    throw new ShopifyCartError('Select at least one product to add to your cart.', {
      code: 'INVALID',
    });
  }
  const normalizedLines = lines.map((line) => {
    validateQuantity(line.quantity);
    return { merchandiseId: validateVariantId(line.merchandiseId), quantity: line.quantity };
  });
  const data = await getShopifyClient().query<{ cartLinesAdd: unknown }, AddLinesVariables>(
    'ShopifyCartLinesAdd',
    CART_LINES_ADD_MUTATION,
    { cartId: normalizedCartId, lines: normalizedLines },
    { signal, cacheTtlMs: 0 }
  );
  return parseMutationPayload(data.cartLinesAdd, 'cart update');
};

export const updateCartLine = async (
  cartId: string,
  lineId: string,
  quantity: number,
  signal?: AbortSignal
): Promise<ShopifyCart> => {
  validateQuantity(quantity);
  const normalizedLineId = requiredString(lineId.trim(), 'cart line ID');
  const data = await getShopifyClient().query<
    { cartLinesUpdate: unknown },
    UpdateLinesVariables
  >(
    'ShopifyCartLinesUpdate',
    CART_LINES_UPDATE_MUTATION,
    {
      cartId: requiredString(cartId.trim(), 'cart ID'),
      lines: [{ id: normalizedLineId, quantity }],
    },
    { signal, cacheTtlMs: 0 }
  );
  return parseMutationPayload(data.cartLinesUpdate, 'cart update');
};

export const removeCartLine = async (
  cartId: string,
  lineId: string,
  signal?: AbortSignal
): Promise<ShopifyCart> => {
  const normalizedLineId = requiredString(lineId.trim(), 'cart line ID');
  const data = await getShopifyClient().query<
    { cartLinesRemove: unknown },
    RemoveLinesVariables
  >(
    'ShopifyCartLinesRemove',
    CART_LINES_REMOVE_MUTATION,
    { cartId: requiredString(cartId.trim(), 'cart ID'), lineIds: [normalizedLineId] },
    { signal, cacheTtlMs: 0 }
  );
  return parseMutationPayload(data.cartLinesRemove, 'cart update');
};

export const getShopifyCartErrorMessage = (error: unknown): string => {
  if (error instanceof ShopifyCartError || error instanceof ShopifyApiError) {
    return error.message;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return 'The cart request was cancelled. Please try again.';
  }
  return 'Your cart could not be updated. Please try again.';
};
