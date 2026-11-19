const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const root = path.resolve(__dirname, '..');
const baseUrl = process.env.PHASE7_BASE_URL || 'http://127.0.0.1:4173';
const browserCandidates = [
  process.env.CHROME_PATH,
  path.join(process.env.ProgramFiles || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env['ProgramFiles(x86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));

const listUrls = (filename) => {
  const xml = fs.readFileSync(path.join(root, 'dist', filename), 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
};

const main = async () => {
  assert.ok(browserPath, 'Set CHROME_PATH or install Chrome/Edge to run responsive browser checks.');
  const productPaths = listUrls('sitemap-products.xml');
  const collectionPaths = listUrls('sitemap-collections.xml');
  assert.ok(productPaths.length > 0, 'Build the sitemap with Shopify credentials before browser checks.');
  assert.ok(collectionPaths.length > 0, 'Build the sitemap with Shopify credentials before browser checks.');

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const failedShopifyRequests = [];
  const failedExternalRequests = new Set();
  let externalResourceConsoleErrors = 0;
  const badResponses = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (/^Failed to load resource: net::ERR_/.test(message.text())) {
      externalResourceConsoleErrors += 1;
    } else {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith(baseUrl)) {
      failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`);
    } else {
      const url = new URL(request.url());
      const failure = `${url.origin}${url.pathname}: ${request.failure()?.errorText || 'failed'}`;
      if (url.hostname.endsWith('.myshopify.com') && url.pathname.includes('/api/')) {
        failedShopifyRequests.push(failure);
      } else {
        failedExternalRequests.add(failure);
      }
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(baseUrl)) {
      badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    } else if (
      response.status() >= 400 &&
      new URL(response.url()).hostname.endsWith('.myshopify.com') &&
      new URL(response.url()).pathname.includes('/api/')
    ) {
      failedShopifyRequests.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  const visit = async (route, waitForHeading = true) => {
    const response = await page.goto(new URL(route, baseUrl).href, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    if (waitForHeading) {
      await page.waitForFunction(
        () => Boolean(document.querySelector('h1')?.innerText.trim()),
        { timeout: 45000 }
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
    assert.ok(response && response.status() < 400, `${route} should load successfully`);
    return page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector('h1')?.innerText.trim() || '',
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      pathname: window.location.pathname,
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      robots: document.querySelector('meta[name="robots"]')?.content || '',
      structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        (script) => script.textContent || ''
      ),
      bodyText: document.body.innerText,
    }));
  };

  try {
    for (const width of [390, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      const home = await visit('/');
      assert.ok(home.heading, `homepage heading should render at ${width}px`);
      assert.ok(home.scrollWidth <= width + 1, `homepage should not overflow at ${width}px`);
      assert.equal(home.canonical, 'https://myrkls.com/');
      console.log(`PASS homepage renders at ${width}px without horizontal overflow`);
    }

    await page.setViewport({ width: 1440, height: 900 });
    const productPath = productPaths[0];
    const product = await visit(productPath);
    assert.ok(product.heading, 'Shopify product page should show a product heading');
    assert.ok(product.title && !product.title.startsWith('MYRKLS — Advanced Global Skin Science'));
    assert.equal(product.canonical, `https://myrkls.com${productPath}`);
    assert.match(product.robots, /index/);
    assert.ok(
      product.structuredData.some((json) => JSON.parse(json)['@graph']?.some((entry) => entry['@type'] === 'Product'))
    );
    console.log(`PASS live product route and Shopify SEO: ${productPath}`);

    const legacyProduct = await visit('/products/incarnation');
    assert.equal(legacyProduct.pathname, '/products/skin-renewal');
    assert.equal(
      legacyProduct.canonical,
      'https://myrkls.com/products/skin-renewal'
    );
    console.log('PASS legacy product URL normalizes to the verified Shopify product handle');

    const collectionPath = collectionPaths[collectionPaths.length - 1];
    const collection = await visit(collectionPath);
    assert.ok(collection.heading, 'Shopify collection page should show a heading');
    assert.equal(collection.canonical, `https://myrkls.com${collectionPath}`);
    console.log(`PASS live collection route: ${collectionPath}`);

    const search = await visit('/search?q=vision');
    assert.match(search.robots, /noindex/);
    assert.ok(search.heading, 'search route should render');
    console.log('PASS search route renders and is excluded from indexing');

    await visit('/products/phase-seven-nonexistent-product', false);
    await page.waitForFunction(
      () => document.querySelector('meta[name="robots"]')?.content.includes('noindex'),
      { timeout: 45000 }
    );
    const invalidProduct = await page.evaluate(() => ({
      robots: document.querySelector('meta[name="robots"]')?.content || '',
      bodyText: document.body.innerText,
    }));
    assert.match(invalidProduct.robots, /noindex/);
    assert.ok(
      /not found|unavailable|could not be loaded|no product/i.test(invalidProduct.bodyText),
      'unknown product should show an explicit empty/error state'
    );
    console.log('PASS invalid Shopify product has a non-indexable, explicit empty state');

    const account = await visit('/account');
    assert.ok(account.heading || account.bodyText.length > 80, 'account route should render');
    const checkout = await visit('/checkout');
    assert.ok(checkout.heading || checkout.bodyText.length > 80, 'checkout route should render');
    console.log('PASS account and checkout routes render without creating an order');

    assert.deepEqual(badResponses, [], 'local application routes should not return HTTP errors');
    assert.deepEqual(failedRequests, [], 'local application requests should not fail');
    assert.deepEqual(failedShopifyRequests, [], 'Shopify Storefront API requests should not fail');
    assert.deepEqual(consoleErrors, [], 'browser console should not contain errors');
    console.log('PASS browser console and local network checks');
    if (failedExternalRequests.size || externalResourceConsoleErrors) {
      console.warn(
        `WARN intermittent external resource failures: ${[...failedExternalRequests].slice(0, 5).join('; ') || `${externalResourceConsoleErrors} browser resource-load errors`}`
      );
    }
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Phase 7 browser checks failed.');
  process.exitCode = 1;
});
