const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const analyticsEnv = {
  MODE: 'production',
  PROD: true,
  VITE_ANALYTICS_ENABLED: 'true',
  VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT: 'false',
  VITE_GTM_ID: 'GTM-TEST123',
  VITE_META_PIXEL_ID: '1234567890',
};

const storage = new Map();
const scripts = [];
global.window = {
  dataLayer: [],
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  sessionStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
};
global.document = {
  head: {
    appendChild: (script) => scripts.push(script),
  },
  createElement: () => ({ dataset: {} }),
};
globalThis.__ANALYTICS_TEST_ENV__ = analyticsEnv;

require.extensions['.ts'] = (module, filename) => {
  const source = fs
    .readFileSync(filename, 'utf8')
    .replaceAll('import.meta.env.MODE', 'globalThis.__ANALYTICS_TEST_ENV__?.MODE')
    .replaceAll('import.meta.env.PROD', 'globalThis.__ANALYTICS_TEST_ENV__?.PROD')
    .replaceAll(
      'import.meta.env.VITE_ANALYTICS_ENABLED',
      'globalThis.__ANALYTICS_TEST_ENV__?.VITE_ANALYTICS_ENABLED'
    )
    .replaceAll(
      'import.meta.env.VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT',
      'globalThis.__ANALYTICS_TEST_ENV__?.VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT'
    )
    .replaceAll('import.meta.env.VITE_GTM_ID', 'globalThis.__ANALYTICS_TEST_ENV__?.VITE_GTM_ID')
    .replaceAll(
      'import.meta.env.VITE_META_PIXEL_ID',
      'globalThis.__ANALYTICS_TEST_ENV__?.VITE_META_PIXEL_ID'
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

const loadAnalytics = (file) => require(path.join(root, 'src', 'analytics', file));

async function verifyClientTracking() {
  const { readAnalyticsConfig } = loadAnalytics('config.ts');
  assert.equal(readAnalyticsConfig().enabled, true);
  assert.equal(readAnalyticsConfig().gtmId, 'GTM-TEST123');
  assert.equal(
    readAnalyticsConfig({
      MODE: 'development',
      VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT: 'false',
    }).enabled,
    false
  );

  const { trackEcommerceEvent, trackPageView, trackSearchEvent, updateAnalyticsConsent } =
    loadAnalytics('analytics.ts');
  assert.equal(trackPageView('Home', 'https://store.test/', '/', {}), false);
  assert.equal(window.dataLayer.length, 0);

  const marketingOnly = {
    necessary: true,
    analytics: false,
    marketing: true,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  updateAnalyticsConsent(marketingOnly);
  assert.equal(trackPageView('Home', 'https://store.test/', '/', {}), true);
  assert.equal(window.dataLayer.some((entry) => entry.event === 'page_view'), false);
  assert.ok(window.fbq);

  const analyticsConsent = { ...marketingOnly, analytics: true };
  updateAnalyticsConsent(analyticsConsent);
  const product = {
    id: 'gid://shopify/Product/123',
    handle: 'serum',
    title: 'Test Serum',
    description: '',
    productType: 'Serum',
    vendor: 'MYRKLS',
    availableForSale: true,
    featuredImage: null,
    images: [],
    priceRange: {
      minVariantPrice: { amount: '1499.00', currencyCode: 'INR' },
      maxVariantPrice: { amount: '1499.00', currencyCode: 'INR' },
    },
    compareAtPriceRange: { minVariantPrice: null, maxVariantPrice: null },
    options: [],
    variants: [],
  };
  assert.equal(trackSearchEvent('test@example.com', [product]), false);
  assert.equal(
    trackEcommerceEvent('add_to_cart', {
      currency: 'INR',
      value: 1499,
      items: [{ item_id: product.id, item_name: product.title, price: 1499, quantity: 1 }],
    }),
    true
  );
  assert.ok(window.dataLayer.some((entry) => entry.event === 'add_to_cart'));
  assert.ok(window.fbq.queue.some((entry) => entry[1] === 'AddToCart'));
  const configuredIds = [analyticsEnv.VITE_GTM_ID, analyticsEnv.VITE_META_PIXEL_ID];
  analyticsEnv.VITE_GTM_ID = '';
  analyticsEnv.VITE_META_PIXEL_ID = '';
  const beforeMissingProviders = window.dataLayer.length;
  assert.equal(trackPageView('Home', 'https://store.test/', '/', {}), false);
  assert.equal(
    trackEcommerceEvent('add_to_cart', {
      currency: 'INR',
      value: 1499,
      items: [{ item_id: product.id, item_name: product.title, price: 1499, quantity: 1 }],
    }),
    false
  );
  assert.equal(window.dataLayer.length, beforeMissingProviders);
  [analyticsEnv.VITE_GTM_ID, analyticsEnv.VITE_META_PIXEL_ID] = configuredIds;
  console.log('PASS analytics configuration, consent gating, provider availability, and PII-safe search');

  const { captureCampaignAttribution, getCampaignAttribution, persistCampaignAttribution } =
    loadAnalytics('attribution.ts');
  const campaign = captureCampaignAttribution('?utm_source=launch&utm_campaign=spring&email=a%40b.com');
  assert.deepEqual(campaign, { utm_source: 'launch', utm_campaign: 'spring' });
  persistCampaignAttribution(true);
  assert.ok(storage.has('myrkls_campaign_attribution_v1'));
  persistCampaignAttribution(false);
  assert.deepEqual(getCampaignAttribution(), {});
  assert.equal(storage.has('myrkls_campaign_attribution_v1'), false);
  console.log('PASS consent-gated first-touch UTM persistence and revocation');

  storage.set(
    'myrkls_privacy_consent_v1',
    JSON.stringify({ ...marketingOnly, updatedAt: new Date().toISOString() })
  );
  delete require.cache[require.resolve(path.join(root, 'src', 'analytics', 'analytics.ts'))];
  window.fbq = undefined;
  window._fbq = undefined;
  scripts.length = 0;
  const restoredAnalytics = loadAnalytics('analytics.ts');
  restoredAnalytics.updateAnalyticsConsent(marketingOnly);
  assert.ok(scripts.some((script) => script.src.includes('connect.facebook.net')));
  console.log('PASS stored marketing consent restores Meta Pixel on page load');
}

async function verifyShopifyPurchasePixel() {
  let checkoutSubscriber;
  let privacySubscriber;
  const pixelStorage = new Map();
  const scriptsLoaded = [];
  const sandbox = {
    init: {
      customerPrivacy: { analyticsProcessingAllowed: true, marketingAllowed: true },
    },
    api: {
      customerPrivacy: {
        subscribe: (eventName, callback) => {
          assert.equal(eventName, 'visitorConsentCollected');
          privacySubscriber = callback;
        },
      },
    },
    analytics: {
      subscribe: (eventName, callback) => {
        assert.equal(eventName, 'checkout_completed');
        checkoutSubscriber = callback;
      },
    },
    browser: {
      sessionStorage: {
        getItem: async (key) => pixelStorage.get(key) || null,
        setItem: async (key, value) => pixelStorage.set(key, value),
      },
    },
    window: {},
    document: {
      head: { appendChild: (script) => scriptsLoaded.push(script) },
      createElement: () => ({ dataset: {} }),
    },
    console,
    Date,
    encodeURIComponent,
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'shopify', 'custom-pixel-checkout-completed.js'), 'utf8'),
    sandbox
  );

  const completedEvent = {
    data: {
      checkout: {
        order: { id: 'gid://shopify/Order/456' },
        currencyCode: 'INR',
        subtotalPrice: { amount: '1499.00', currencyCode: 'INR' },
        email: 'must-not-be-sent@example.com',
        lineItems: [
          {
            id: 'line-1',
            title: 'Test Serum',
            quantity: 1,
            discountAllocations: [],
            variant: {
              id: 'gid://shopify/ProductVariant/789',
              title: '30 ml',
              price: { amount: '1499.00' },
              product: { title: 'Test Serum', vendor: 'MYRKLS' },
            },
          },
        ],
      },
    },
  };

  await checkoutSubscriber(completedEvent);
  await checkoutSubscriber(completedEvent);
  const purchases = sandbox.window.dataLayer.filter((entry) => entry.event === 'purchase');
  assert.equal(purchases.length, 1);
  assert.equal(purchases[0].ecommerce.transaction_id, 'gid://shopify/Order/456');
  assert.equal(purchases[0].ecommerce.value, 1499);
  assert.equal(purchases[0].ecommerce.items[0].item_id, 'gid://shopify/ProductVariant/789');
  assert.equal(JSON.stringify(purchases[0]).includes('must-not-be-sent@example.com'), false);

  privacySubscriber({
    customerPrivacy: { analyticsProcessingAllowed: false, marketingAllowed: false },
  });
  await checkoutSubscriber({
    data: {
      checkout: {
        ...completedEvent.data.checkout,
        order: { id: 'gid://shopify/Order/blocked' },
      },
    },
  });
  assert.equal(
    sandbox.window.dataLayer.filter((entry) => entry.event === 'purchase').length,
    1
  );
  assert.ok(scriptsLoaded.some((script) => script.src.includes('googletagmanager.com')));
  console.log('PASS Shopify checkout_completed purchase payload, consent, and order deduplication');
}

verifyClientTracking()
  .then(verifyShopifyPurchasePixel)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
