const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs
    .readFileSync(filename, 'utf8')
    .replaceAll('import.meta.env.VITE_SITE_URL', 'undefined')
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
const routes = require(path.join(root, 'src', 'routing', 'routes.ts'));
const seo = require(path.join(root, 'src', 'seo', 'metadata.ts'));
const origin = 'https://myrkls.com';

const run = () => {
  const encodedProductRoute = routes.resolveAppRoute(
    new URL('https://myrkls.com/products/vision%E2%84%A2')
  );
  assert.equal(encodedProductRoute.view, 'pdp');
  assert.equal(encodedProductRoute.productHandle, 'vision™');
  assert.equal(encodedProductRoute.canonicalPath, '/products/vision%E2%84%A2');

  const encodedCollectionRoute = routes.resolveAppRoute(
    new URL('https://myrkls.com/collections/vision%E2%84%A2')
  );
  assert.equal(encodedCollectionRoute.view, 'view-all');
  assert.equal(encodedCollectionRoute.collectionHandle, 'vision™');
  assert.equal(
    routes.productPath(encodedProductRoute.productHandle),
    '/products/vision%E2%84%A2'
  );
  assert.equal(
    routes.collectionPath(encodedCollectionRoute.collectionHandle),
    '/collections/vision%E2%84%A2'
  );

  const malformedRoute = routes.resolveAppRoute(
    new URL('https://myrkls.com/products/%2Fprivate')
  );
  assert.equal(malformedRoute.notFound, true);
  assert.equal(
    routes.resolveAppRoute(new URL('https://myrkls.com/search?q=serum')).searchQuery,
    'serum'
  );
  assert.equal(
    routes.resolveAppRoute(new URL('https://myrkls.com/#pdp/incarnation')).productHandle,
    'skin-renewal'
  );
  assert.equal(
    routes.resolveAppRoute(new URL('https://myrkls.com/products/vision')).canonicalPath,
    '/products/vision-multi-pathway-pigment-corrector'
  );
  console.log('PASS canonical routes, encoded Shopify handles, and legacy route compatibility');

  const product = {
    id: 'gid://shopify/Product/123',
    handle: 'vision™',
    title: 'VISION™ Serum',
    description: 'Live Shopify product description.',
    productType: 'Serum',
    vendor: 'MYRKLS',
    availableForSale: false,
    featuredImage: {
      url: 'https://cdn.shopify.com/s/files/product.webp',
      altText: 'VISION serum bottle',
      width: 800,
      height: 1000,
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: '1499.00', currencyCode: 'INR' },
      maxVariantPrice: { amount: '1999.00', currencyCode: 'INR' },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: '1799.00', currencyCode: 'INR' },
      maxVariantPrice: { amount: '2299.00', currencyCode: 'INR' },
    },
    options: [{ id: 'option-1', name: 'Size', values: ['30 mL'] }],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/123',
        title: '30 mL',
        sku: 'VISION-30',
        availableForSale: false,
        price: { amount: '1499.00', currencyCode: 'INR' },
        compareAtPrice: { amount: '1799.00', currencyCode: 'INR' },
        selectedOptions: [{ name: 'Size', value: '30 mL' }],
        image: null,
      },
    ],
    variantsPageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    seo: { title: 'Shopify SEO title', description: 'Shopify SEO description.' },
  };
  const productMetadata = seo.buildProductSeo(product, origin);
  assert.equal(productMetadata.title, 'Shopify SEO title');
  assert.equal(productMetadata.description, 'Shopify SEO description.');
  assert.equal(productMetadata.canonicalUrl, 'https://myrkls.com/products/vision%E2%84%A2');
  assert.equal(productMetadata.imageUrl, product.featuredImage.url);
  const graph = productMetadata.structuredData['@graph'];
  const productSchema = graph.find((entry) => entry['@type'] === 'Product');
  const breadcrumb = graph.find((entry) => entry['@type'] === 'BreadcrumbList');
  assert.equal(productSchema.sku, 'VISION-30');
  assert.equal(productSchema.offers.lowPrice, '1499.00');
  assert.equal(productSchema.offers.priceCurrency, 'INR');
  assert.equal(productSchema.offers.availability, 'https://schema.org/OutOfStock');
  assert.equal(breadcrumb.itemListElement[2].item, productMetadata.canonicalUrl);
  assert.equal(JSON.stringify(productSchema).includes('"rating"'), false);

  const collectionMetadata = seo.buildCollectionSeo(
    {
      id: 'gid://shopify/Collection/456',
      handle: 'vision™',
      title: 'VISION Collection',
      description: 'Collection description.',
      image: null,
      seo: { title: 'Shopify collection title', description: 'Shopify collection description.' },
    },
    origin
  );
  assert.equal(collectionMetadata.title, 'Shopify collection title');
  assert.equal(collectionMetadata.canonicalUrl, 'https://myrkls.com/collections/vision%E2%84%A2');
  assert.ok(
    collectionMetadata.structuredData['@graph'].some(
      (entry) => entry['@type'] === 'CollectionPage'
    )
  );
  assert.equal(seo.buildHomepageSeo(origin).structuredData, null);
  assert.equal(seo.buildStaticSeo(origin, '/account', 'Account', 'Account', 'noindex, follow').structuredData, null);
  assert.equal(seo.getSiteOrigin('https://myrkls.com'), origin);
  assert.throws(() => seo.getSiteOrigin('https://attacker.example'));
  assert.throws(() => seo.getSiteOrigin('https://www.myrkls.com'));

  const escapedJson = seo.escapeJsonLd({ text: '</script>&\u2028\u2029' });
  assert.equal(escapedJson.includes('</script>'), false);
  assert.equal(escapedJson.includes('\\u003c/script\\u003e'), true);
  console.log('PASS Shopify-driven SEO, structured data, canonical URLs, and JSON-LD escaping');
};

try {
  run();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
