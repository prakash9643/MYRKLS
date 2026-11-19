const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs
    .readFileSync(filename, 'utf8')
    .replaceAll(
      'import.meta.env.VITE_SHOPIFY_STORE_DOMAIN',
      'globalThis.__SHOPIFY_TEST_ENV__?.VITE_SHOPIFY_STORE_DOMAIN'
    )
    .replaceAll(
      'import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
      'globalThis.__SHOPIFY_TEST_ENV__?.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN'
    )
    .replaceAll(
      'import.meta.env.VITE_SHOPIFY_API_VERSION',
      'globalThis.__SHOPIFY_TEST_ENV__?.VITE_SHOPIFY_API_VERSION'
    );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(output.outputText, filename);
};

const root = path.resolve(__dirname, '..');
const service = require(path.join(root, 'src', 'shopify', 'services', 'cart.ts'));
const env = {
  VITE_SHOPIFY_STORE_DOMAIN: 'myrkls-dev.myshopify.com',
  VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'public-storefront-test-token',
  VITE_SHOPIFY_API_VERSION: '2026-10',
};
globalThis.__SHOPIFY_TEST_ENV__ = env;

const money = (amount) => ({ amount, currencyCode: 'INR' });
const line = (id = 'gid://shopify/CartLine/line-1', quantity = 2) => ({
  id,
  quantity,
  merchandise: {
    id: 'gid://shopify/ProductVariant/123',
    title: '30 mL',
    availableForSale: true,
    selectedOptions: [{ name: 'Size', value: '30 mL' }],
    product: {
      title: 'Live Test Product',
      handle: 'live-test-product',
      featuredImage: {
        url: 'https://cdn.shopify.com/test.webp',
        altText: 'Test',
        width: 800,
        height: 1000,
      },
    },
  },
  cost: {
    amountPerQuantity: money('1499.00'),
    totalAmount: money((1499 * quantity).toFixed(2)),
  },
});
const cart = (nodes = [line()], overrides = {}) => ({
  id: 'gid://shopify/Cart/cart-1',
  checkoutUrl: 'https://myrkls-dev.myshopify.com/checkouts/c/test',
  totalQuantity: nodes.reduce((total, item) => total + item.quantity, 0),
  cost: {
    subtotalAmount: money('2998.00'),
    totalAmount: money('2998.00'),
    subtotalAmountEstimated: true,
    totalAmountEstimated: true,
  },
  lines: {
    nodes,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: nodes.length ? 'line-start' : null,
      endCursor: nodes.length ? 'line-end' : null,
    },
  },
  ...overrides,
});
const json = (data) =>
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

async function run() {
  const calls = [];
  const defaultFetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    switch (body.operationName) {
      case 'ShopifyCartCreate':
        return json({
          cartCreate: {
            cart: cart([line('gid://shopify/CartLine/new', body.variables.input.lines[0].quantity)]),
            userErrors: [],
          },
        });
      case 'ShopifyCart':
        return json({ cart: cart() });
      case 'ShopifyCartLinesAdd':
        return json({ cartLinesAdd: { cart: cart(), userErrors: [] } });
      case 'ShopifyCartLinesUpdate':
        return json({
          cartLinesUpdate: {
            cart: cart([line('gid://shopify/CartLine/line-1', body.variables.lines[0].quantity)]),
            userErrors: [],
          },
        });
      case 'ShopifyCartLinesRemove':
        return json({ cartLinesRemove: { cart: cart([]), userErrors: [] } });
      default:
        throw new Error(`Unexpected operation ${body.operationName}`);
    }
  };
  globalThis.fetch = defaultFetch;

  const created = await service.createCart([
    { merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 },
  ]);
  assert.equal(created.id, 'gid://shopify/Cart/cart-1');
  assert.equal(created.lines[0].productHandle, 'live-test-product');
  assert.equal(calls[0].variables.input.lines[0].merchandiseId, 'gid://shopify/ProductVariant/123');
  console.log('PASS cart creation and merchandise input');

  const fetched = await service.getCart('gid://shopify/Cart/cart-1');
  assert.equal(fetched.totalQuantity, 2);
  assert.equal(fetched.lines[0].availableForSale, true);
  assert.equal(fetched.lines[0].unitPrice.amount, '1499.00');
  assert.equal(fetched.lines[0].lineTotal.amount, '2998.00');
  assert.equal(fetched.cost.subtotalAmount.currencyCode, 'INR');
  assert.match(fetched.checkoutUrl, /^https:\/\/myrkls-dev\.myshopify\.com\//);
  console.log('PASS cart mapping, money, line details and approved checkout URL');

  let checkoutFetchCount = 0;
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    checkoutFetchCount += 1;
    assert.equal(body.operationName, 'ShopifyCart');
    return json({ cart: cart() });
  };
  const checkoutCart = await service.getFreshCartForCheckout('gid://shopify/Cart/cart-1');
  assert.equal(checkoutFetchCount, 1);
  assert.equal(checkoutCart.totalQuantity, 2);
  assert.match(checkoutCart.checkoutUrl, /^https:\/\/myrkls-dev\.myshopify\.com\//);
  console.log('PASS checkout preparation fetches a fresh, non-empty Shopify cart');

  globalThis.fetch = async () => json({ cart: cart([]) });
  await assert.rejects(
    service.getFreshCartForCheckout('gid://shopify/Cart/cart-1'),
    (error) => error.name === 'ShopifyCartError' && error.message.includes('empty')
  );
  globalThis.fetch = async () => {
    throw new TypeError('network unavailable');
  };
  await assert.rejects(
    service.getFreshCartForCheckout('gid://shopify/Cart/cart-1'),
    (error) => error.kind === 'network'
  );
  console.log('PASS checkout preparation surfaces network failures');

  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.operationName === 'ShopifyPrimaryDomain') {
      return json({ shop: { primaryDomain: { host: 'www.myrkls.com' } } });
    }
    return json({
      cart: cart([], { checkoutUrl: 'https://www.myrkls.com/checkouts/c/test' }),
    });
  };
  const customDomainCart = await service.getCart('gid://shopify/Cart/cart-1');
  assert.equal(new URL(customDomainCart.checkoutUrl).hostname, 'www.myrkls.com');
  console.log('PASS verified Shopify primary checkout domain is accepted');

  globalThis.fetch = defaultFetch;
  const added = await service.addCartLines('gid://shopify/Cart/cart-1', [
    { merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 2 },
  ]);
  assert.equal(added.lines.length, 1);
  const updated = await service.updateCartLine(
    'gid://shopify/Cart/cart-1',
    'gid://shopify/CartLine/line-1',
    3
  );
  assert.equal(updated.totalQuantity, 3);
  const removed = await service.removeCartLine(
    'gid://shopify/Cart/cart-1',
    'gid://shopify/CartLine/line-1'
  );
  assert.equal(removed.lines.length, 0);
  assert.equal(calls.filter((call) => call.operationName.startsWith('ShopifyCartLines')).length, 3);
  console.log('PASS add, update and remove cart line operations');

  let pageCallCount = 0;
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    pageCallCount += 1;
    const first = body.variables.after === null;
    return json({
      cart: cart(
        [line(first ? 'line-page-1' : 'line-page-2', 1)],
        {
          lines: {
            nodes: [line(first ? 'line-page-1' : 'line-page-2', 1)],
            pageInfo: {
              hasNextPage: first,
              hasPreviousPage: !first,
              startCursor: first ? 'cursor-1' : 'cursor-2',
              endCursor: first ? 'cursor-1' : 'cursor-2',
            },
          },
        }
      ),
    });
  };
  const paginated = await service.getCart('gid://shopify/Cart/cart-1');
  assert.equal(pageCallCount, 2);
  assert.equal(paginated.lines.length, 2);
  assert.equal(paginated.pageInfo.hasNextPage, false);
  console.log('PASS cart lines paginate until complete without silent truncation');

  globalThis.fetch = async () =>
    json({
      cartLinesAdd: {
        cart: null,
        userErrors: [
          {
            code: 'INVALID_MERCHANDISE_LINE',
            field: ['lines', '0', 'merchandiseId'],
            message: 'raw Shopify internal message',
          },
        ],
      },
    });
  await assert.rejects(
    service.addCartLines('gid://shopify/Cart/cart-1', [
      { merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 },
    ]),
    (error) =>
      error.name === 'ShopifyCartError' &&
      error.message.includes('cart item') &&
      !error.message.includes('raw Shopify internal message')
  );

  await assert.rejects(
    service.updateCartLine('gid://shopify/Cart/cart-1', 'line-1', 0),
    (error) => error.name === 'ShopifyCartError'
  );
  await assert.rejects(
    service.updateCartLine('gid://shopify/Cart/cart-1', '  ', 1),
    (error) => error.kind === 'invalid-response'
  );
  await assert.rejects(
    service.createCart([{ merchandiseId: 'not-a-variant-id', quantity: 1 }]),
    (error) => error.name === 'ShopifyCartError'
  );
  console.log('PASS Shopify userErrors are sanitized; invalid quantities and variant IDs are rejected');

  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.operationName === 'ShopifyPrimaryDomain') {
      return json({ shop: { primaryDomain: { host: 'www.myrkls.com' } } });
    }
    return json({
      cart: {
        ...cart([]),
        checkoutUrl: 'https://attacker.example/checkout',
      },
    });
  };
  await assert.rejects(
    service.getCart('gid://shopify/Cart/cart-1'),
    (error) => error.kind === 'invalid-response'
  );
  console.log('PASS checkout URL is restricted to HTTPS and the configured store host');

  globalThis.fetch = async () => json({ cart: null });
  assert.equal(await service.getCart('gid://shopify/Cart/expired'), null);
  console.log('PASS expired/unknown cart IDs return null for context recovery');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
