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
const load = (file) => require(path.join(root, 'src', 'shopify', file));
const env = {
  VITE_SHOPIFY_STORE_DOMAIN: 'myrkls-dev.myshopify.com',
  VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'public-storefront-test-token',
  VITE_SHOPIFY_API_VERSION: '2026-10',
};

const image = {
  url: 'https://cdn.shopify.com/s/files/test/product.webp',
  altText: 'Test product',
  width: 800,
  height: 1000,
};

const product = {
  id: 'gid://shopify/Product/123',
  handle: 'test-product',
  title: 'Test Product',
  description: 'A development fixture.',
  productType: 'Serum',
  vendor: 'MYRKLS',
  availableForSale: true,
  featuredImage: image,
  images: { nodes: [image] },
  priceRange: {
    minVariantPrice: { amount: '1499.00', currencyCode: 'INR' },
    maxVariantPrice: { amount: '1499.00', currencyCode: 'INR' },
  },
  compareAtPriceRange: {
    minVariantPrice: { amount: '1799.00', currencyCode: 'INR' },
    maxVariantPrice: { amount: '1799.00', currencyCode: 'INR' },
  },
  options: [{ id: 'gid://shopify/ProductOption/1', name: 'Size', values: ['30 mL'] }],
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/456',
        title: '30 mL',
        availableForSale: true,
        price: { amount: '1499.00', currencyCode: 'INR' },
        compareAtPrice: { amount: '1799.00', currencyCode: 'INR' },
        selectedOptions: [{ name: 'Size', value: '30 mL' }],
        image,
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: 'variant-cursor',
      endCursor: 'variant-cursor',
    },
  },
  seo: { title: 'Test Product SEO', description: 'Test SEO description' },
};

const pageInfo = {
  hasNextPage: true,
  hasPreviousPage: false,
  startCursor: 'cursor-first',
  endCursor: 'cursor-next',
};

const okResponse = (data) =>
  new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

async function run() {
  const { readShopifyConfig } = load('config.ts');
  const missing = readShopifyConfig({});
  assert.equal(missing.config, null);
  assert.deepEqual(missing.missing, [
    'VITE_SHOPIFY_STORE_DOMAIN',
    'VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  ]);
  assert.equal(
    readShopifyConfig({
      ...env,
      VITE_SHOPIFY_STORE_DOMAIN: 'https://myrkls-dev.myshopify.com',
    }).config,
    null
  );
  assert.equal(
    readShopifyConfig({ ...env, VITE_SHOPIFY_API_VERSION: 'latest' }).config,
    null
  );
  assert.equal(readShopifyConfig(env).config.apiVersion, '2026-10');
  console.log('PASS environment configuration validation and missing-variable reporting');

  const { ShopifyGraphQLClient } = load('graphql-client.ts');
  const { ShopifyApiError } = load('errors.ts');
  let fetchCount = 0;
  let requestUrl = '';
  let requestHeaders;
  let requestBody;
  const validClient = new ShopifyGraphQLClient(
    readShopifyConfig(env).config,
    async (url, init) => {
      fetchCount += 1;
      requestUrl = url;
      requestHeaders = init.headers;
      requestBody = JSON.parse(init.body);
      return okResponse({ shop: { name: 'MYRKLS dev' } });
    }
  );
  const shopResponse = await validClient.query(
    'ShopQuery',
    'query ShopQuery { shop { name } }',
    { key: 'value' }
  );
  await validClient.query('ShopQuery', 'query ShopQuery { shop { name } }', { key: 'value' });
  assert.equal(shopResponse.shop.name, 'MYRKLS dev');
  assert.equal(fetchCount, 1, 'successful read requests should use the short cache');
  assert.equal(
    requestUrl,
    'https://myrkls-dev.myshopify.com/api/2026-10/graphql.json'
  );
  assert.equal(requestHeaders['X-Shopify-Storefront-Access-Token'], env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  assert.equal(requestBody.operationName, 'ShopQuery');
  console.log('PASS typed GraphQL request, endpoint/version headers, and read cache');

  let deduplicatedFetchCount = 0;
  const deduplicatedClient = new ShopifyGraphQLClient(
    readShopifyConfig(env).config,
    async () => {
      deduplicatedFetchCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return okResponse({ shop: { name: 'MYRKLS dev' } });
    }
  );
  const deduplicatedResults = await Promise.all([
    deduplicatedClient.query('ShopQuery', 'query ShopQuery { shop { name } }', {}),
    deduplicatedClient.query('ShopQuery', 'query ShopQuery { shop { name } }', {}),
  ]);
  assert.equal(deduplicatedFetchCount, 1);
  assert.equal(deduplicatedResults[0].shop.name, 'MYRKLS dev');
  console.log('PASS concurrent public read request deduplication');

  let retryFetchCount = 0;
  const retryClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () => {
    retryFetchCount += 1;
    return retryFetchCount === 1
      ? new Response('temporarily unavailable', { status: 503 })
      : okResponse({ shop: { name: 'MYRKLS dev' } });
  });
  assert.equal(
    (await retryClient.query('ShopQuery', 'query ShopQuery { shop { name } }', {})).shop.name,
    'MYRKLS dev'
  );
  assert.equal(retryFetchCount, 2);

  let throttledFetchCount = 0;
  const throttledClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () => {
    throttledFetchCount += 1;
    return throttledFetchCount === 1
      ? new Response(
          JSON.stringify({ errors: [{ message: 'Throttled', extensions: { code: 'THROTTLED' } }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      : okResponse({ shop: { name: 'MYRKLS dev' } });
  });
  assert.equal(
    (await throttledClient.query('ShopQuery', 'query ShopQuery { shop { name } }', {})).shop.name,
    'MYRKLS dev'
  );
  assert.equal(throttledFetchCount, 2);

  let mutationFetchCount = 0;
  const mutationClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () => {
    mutationFetchCount += 1;
    return new Response('temporarily unavailable', { status: 503 });
  });
  await assert.rejects(
    mutationClient.query('CartMutation', 'mutation CartMutation { cartCreate { cart { id } } }', {}, {
      cacheTtlMs: 0,
    }),
    (error) => error instanceof ShopifyApiError && error.status === 503
  );
  assert.equal(mutationFetchCount, 1, 'non-idempotent mutations must not be retried');
  console.log('PASS bounded retries for transient reads; mutations are never retried');

  const timeoutClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () => new Promise(() => {}));
  await assert.rejects(
    timeoutClient.query('SlowQuery', 'query SlowQuery { shop { name } }', {}, {
      timeoutMs: 10,
      maxRetries: 0,
    }),
    (error) => error instanceof ShopifyApiError && error.kind === 'timeout'
  );
  console.log('PASS request timeout surfaces as a typed Shopify API error');

  let finishSharedRequest;
  const sharedAbortClient = new ShopifyGraphQLClient(
    readShopifyConfig(env).config,
    () => new Promise((resolve) => { finishSharedRequest = resolve; })
  );
  const firstSubscriberController = new AbortController();
  const firstSubscriber = sharedAbortClient.query(
    'ShopQuery',
    'query ShopQuery { shop { name } }',
    {},
    { signal: firstSubscriberController.signal }
  );
  const secondSubscriber = sharedAbortClient.query(
    'ShopQuery',
    'query ShopQuery { shop { name } }',
    {}
  );
  firstSubscriberController.abort();
  await assert.rejects(firstSubscriber, (error) => error.name === 'AbortError');
  finishSharedRequest(okResponse({ shop: { name: 'MYRKLS dev' } }));
  assert.equal((await secondSubscriber).shop.name, 'MYRKLS dev');
  console.log('PASS cancelling one deduplicated request subscriber preserves the other');

  let generation = 0;
  const cancelledClient = new ShopifyGraphQLClient(
    readShopifyConfig(env).config,
    async () => {
      generation += 1;
      if (generation === 1) return new Promise(() => {});
      return okResponse({ shop: { name: 'MYRKLS dev' } });
    }
  );
  const cancelledController = new AbortController();
  const cancelledRequest = cancelledClient.query(
    'ShopQuery',
    'query ShopQuery { shop { name } }',
    {},
    { signal: cancelledController.signal }
  );
  cancelledController.abort();
  await assert.rejects(cancelledRequest, (error) => error.name === 'AbortError');
  assert.equal(
    (await cancelledClient.query('ShopQuery', 'query ShopQuery { shop { name } }', {})).shop.name,
    'MYRKLS dev'
  );
  assert.equal(generation, 2, 'a new subscriber should not reuse an aborted in-flight read');
  console.log('PASS cancelled shared reads are removed so React StrictMode can safely retry');

  const graphqlClient = new ShopifyGraphQLClient(
    readShopifyConfig(env).config,
    async () =>
      new Response(JSON.stringify({ data: { ignored: true }, errors: [{ message: 'denied' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
  );
  await assert.rejects(
    graphqlClient.query('ErrorQuery', 'query ErrorQuery { shop { name } }', {}),
    (error) => error instanceof ShopifyApiError && error.kind === 'graphql'
  );

  const httpClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () =>
    new Response(JSON.stringify({ errors: [{ message: 'unauthorized' }] }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  await assert.rejects(
    httpClient.query('HttpQuery', 'query HttpQuery { shop { name } }', {}),
    (error) =>
      error instanceof ShopifyApiError &&
      error.kind === 'http' &&
      error.status === 401 &&
      !error.message.includes(env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN)
  );

  const invalidJsonClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () =>
    new Response('not json', { status: 200 })
  );
  await assert.rejects(
    invalidJsonClient.query('InvalidQuery', 'query InvalidQuery { shop { name } }', {}),
    (error) => error instanceof ShopifyApiError && error.kind === 'invalid-response'
  );

  const networkClient = new ShopifyGraphQLClient(readShopifyConfig(env).config, async () => {
    throw new Error('test network failure');
  });
  await assert.rejects(
    networkClient.query('NetworkQuery', 'query NetworkQuery { shop { name } }', {}),
    (error) => error instanceof ShopifyApiError && error.kind === 'network'
  );
  console.log('PASS GraphQL, HTTP, invalid JSON, and network error handling');

  const { mapProduct } = load('services/shared.ts');
  const mappedProduct = mapProduct({
    ...product,
    vendor: null,
    description: null,
    featuredImage: null,
    images: { nodes: [] },
    compareAtPriceRange: {
      minVariantPrice: null,
      maxVariantPrice: null,
    },
    seo: null,
  });
  assert.equal(mappedProduct.title, 'Test Product');
  assert.equal(mappedProduct.vendor, '');
  assert.equal(mappedProduct.description, '');
  assert.equal(mappedProduct.featuredImage, null);
  assert.equal(mappedProduct.images.length, 0);
  assert.equal(mappedProduct.compareAtPriceRange.minVariantPrice, null);
  assert.equal(mappedProduct.variants[0].availableForSale, true);
  const { formatCompareAtPrice } = load('presentation.ts');
  assert.equal(formatCompareAtPrice(mappedProduct), null);
  assert.equal(formatCompareAtPrice(mapProduct(product)), '₹1,799.00');
  const { getShopifyImageUrl, getShopifyImageSrcSet } = load('presentation.ts');
  assert.equal(
    new URL(getShopifyImageUrl(image.url, 640)).searchParams.get('width'),
    '640'
  );
  assert.equal(
    getShopifyImageUrl('https://images.example.test/product.webp', 640),
    'https://images.example.test/product.webp'
  );
  assert.equal(
    getShopifyImageSrcSet(image.url, [320, 640]),
    `${new URL(image.url).origin}${new URL(image.url).pathname}?width=320 320w, ${new URL(image.url).origin}${new URL(image.url).pathname}?width=640 640w`
  );
  assert.throws(() => mapProduct({ ...product, availableForSale: 'yes' }), ShopifyApiError);
  console.log('PASS product mapping, optional fields, availability, compare-at prices, and invalid-data checks');

  globalThis.__SHOPIFY_TEST_ENV__ = env;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url, body });
    if (body.operationName === 'ShopifyProducts') {
      return okResponse({
        products: { nodes: [product], pageInfo },
      });
    }
    if (body.operationName === 'ShopifyProductByHandle') {
      return okResponse({ product: body.variables.handle === 'test-product' ? product : null });
    }
    if (body.operationName === 'ShopifyCollections') {
      return okResponse({
        collections: {
          nodes: [
            {
              id: 'gid://shopify/Collection/789',
              handle: 'serums',
              title: 'Serums',
              description: 'Serum collection',
              image,
            },
          ],
          pageInfo: { ...pageInfo, hasNextPage: false },
        },
      });
    }
    if (body.operationName === 'ShopifyCollectionByHandle') {
      return okResponse({
        collection: {
          id: 'gid://shopify/Collection/789',
          handle: 'serums',
          title: 'Serums',
          description: 'Serum collection',
          image,
          products: { nodes: [product], pageInfo },
        },
      });
    }
    if (body.operationName === 'ShopifySearchProducts') {
      return okResponse({
        search: {
          nodes: [{ __typename: 'Product', ...product }],
          pageInfo: { ...pageInfo, hasNextPage: false },
        },
      });
    }
    if (body.operationName === 'ShopifyMetaobjects') {
      return okResponse({
        metaobjects: {
          nodes: [
            {
              id: 'gid://shopify/Metaobject/1',
              type: 'homepage_section',
              handle: 'featured-products',
              fields: [{ key: 'visible', value: 'true' }],
            },
          ],
          pageInfo: { ...pageInfo, hasNextPage: false },
        },
      });
    }
    if (body.operationName === 'ShopifyMetaobjectByHandle') {
      return okResponse({
        metaobject: {
          id: 'gid://shopify/Metaobject/1',
          type: 'homepage_section',
          handle: body.variables.handle,
          fields: [{ key: 'visible', value: 'true' }],
        },
      });
    }
    throw new Error(`Unexpected operation ${body.operationName}`);
  };

  const productsService = load('services/products.ts');
  const productsPage = await productsService.getProducts({ first: 2, after: 'cursor-in' });
  assert.equal(productsPage.nodes[0].handle, 'test-product');
  assert.equal(productsPage.pageInfo.endCursor, 'cursor-next');
  assert.equal(calls.at(-1).body.variables.after, 'cursor-in');
  assert.equal((await productsService.getProductByHandle('TEST-PRODUCT')).handle, 'test-product');
  const collectionsService = load('services/collections.ts');
  assert.equal((await collectionsService.getCollections()).nodes[0].handle, 'serums');
  assert.equal((await collectionsService.getCollectionByHandle('serums')).products.nodes.length, 1);
  const searchService = load('services/search.ts');
  assert.equal((await searchService.searchProducts({ query: 'serum' })).nodes[0].title, 'Test Product');
  const metaobjectsService = load('services/metaobjects.ts');
  assert.equal(
    (await metaobjectsService.getMetaobjects({ type: 'homepage_section' })).nodes[0].handle,
    'featured-products'
  );
  assert.equal(
    (await metaobjectsService.getMetaobjectByHandle('homepage_section', 'featured-products')).type,
    'homepage_section'
  );
  console.log('PASS product, collection, search, pagination, and Metaobject services');

  globalThis.__SHOPIFY_TEST_ENV__ = {};
  const { getShopifyClient } = load('graphql-client.ts');
  assert.throws(
    () => getShopifyClient(),
    (error) =>
      error instanceof ShopifyApiError &&
      error.kind === 'configuration' &&
      error.message.includes('VITE_SHOPIFY_STORE_DOMAIN')
  );
  console.log('PASS missing-environment client failure; no mock catalog fallback');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
