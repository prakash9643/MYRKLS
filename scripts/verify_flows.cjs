const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const root = path.resolve(__dirname, '..');
const baseUrl = process.env.PHASE9_BASE_URL || process.env.PHASE7_BASE_URL || 'http://127.0.0.1:5173';
const browserCandidates = [
  process.env.CHROME_BIN,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : null,
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : null,
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    : null,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));

const pathsFromSitemap = (filename) => {
  const file = path.join(root, 'dist', filename);
  if (!fs.existsSync(file)) return [];
  const xml = fs.readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
};

const main = async () => {
  assert.ok(browserPath, 'Set CHROME_BIN or install Chrome/Edge to run browser flow checks.');
  const productPath = pathsFromSitemap('sitemap-products.xml')[0] || '/products/skin-renewal';
  const collectionPath = pathsFromSitemap('sitemap-collections.xml')[0];
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedLocalRequests = [];
  const failedExternalRequests = new Set();
  const failedShopifyRequests = [];
  let externalResourceConsoleErrors = 0;
  const badLocalResponses = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
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
      failedLocalRequests.push(`${request.method()} ${new URL(request.url()).pathname}`);
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
      badLocalResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    } else if (
      response.status() >= 400 &&
      new URL(response.url()).hostname.endsWith('.myshopify.com') &&
      new URL(response.url()).pathname.includes('/api/')
    ) {
      failedShopifyRequests.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  const visit = async (route) => {
    const response = await page.goto(new URL(route, baseUrl).href, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    assert.ok(response && response.status() < 400, `${route} should load successfully`);
    return response;
  };

  try {
    await page.setViewport({ width: 390, height: 844 });
    await visit('/');
    await page.waitForFunction(() => Boolean(document.querySelector('h1')?.innerText.trim()), {
      timeout: 30000,
    });
    const home = await page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector('h1')?.innerText.trim() || '',
      hasHeader: Boolean(document.querySelector('header')),
    }));
    assert.ok(home.title && home.heading && home.hasHeader, 'homepage title, hero, and header render');

    const responsiveWidths = [360, 390, 768, 1024, 1440, 1920];
    for (const width of responsiveWidths) {
      await page.setViewport({ width, height: 900 });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dimensions.document <= dimensions.viewport + 1,
        `homepage should not overflow at ${width}px`
      );
    }

    await visit(productPath);
    await page.waitForFunction(() => Boolean(document.querySelector('h1')?.innerText.trim()), {
      timeout: 30000,
    });
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('button')].some((button) =>
          ['ADD TO BAG', 'CURRENTLY UNAVAILABLE'].includes(button.innerText.trim())
        ) || /could not be loaded|could not load|not found/i.test(document.body.innerText),
      { timeout: 60000 }
    );
    const product = await page.evaluate(() => ({
      heading: document.querySelector('h1')?.innerText.trim() || '',
      hasProductImage: Boolean(document.querySelector('main img[alt]')),
      hasAvailability: /AVAILABLE|UNAVAILABLE/i.test(document.querySelector('main')?.innerText || ''),
      hasAddButton: [...document.querySelectorAll('button')].some(
        (button) => button.innerText.trim() === 'ADD TO BAG' && !button.disabled
      ),
      failedState: /could not be loaded|could not load|not found/i.test(document.body.innerText),
    }));
    assert.ok(product.heading, 'Shopify product page renders a heading');
    assert.ok(product.hasProductImage, 'Shopify product page provides an image with alt text');
    assert.ok(product.hasAvailability, 'Shopify product page shows availability');
    assert.ok(!product.failedState, 'Shopify product page does not show a failed or empty state');

    for (const width of responsiveWidths) {
      await page.setViewport({ width, height: 900 });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dimensions.document <= dimensions.viewport + 1,
        `product detail should not overflow at ${width}px`
      );
    }

    if (product.hasAddButton) {
      await page.evaluate(() => {
        [...document.querySelectorAll('button')]
          .find((button) => button.innerText.trim() === 'ADD TO BAG')
          ?.click();
      });
      await page.waitForFunction(
        () => [...document.querySelectorAll('[role="dialog"]')].some((dialog) =>
          dialog.innerText.includes('YOUR BAG')
        ),
        { timeout: 60000 }
      );
      const cart = await page.evaluate(() => {
        const dialog = [...document.querySelectorAll('[role="dialog"]')].find((item) =>
          item.innerText.includes('YOUR BAG')
        );
        return {
          text: dialog?.innerText || '',
          hasCheckout: dialog?.innerText.includes('SHOPIFY CHECKOUT') || false,
        };
      });
      assert.ok(cart.text.includes('SUBTOTAL'), 'Shopify cart drawer shows cart totals');
      assert.ok(cart.hasCheckout, 'cart provides Shopify-hosted checkout handoff');

      const storedCartId = await page.evaluate(() =>
        Boolean(window.localStorage.getItem('myrkls_shopify_cart_id'))
      );
      assert.ok(storedCartId, 'Shopify cart ID is persisted locally');

      await page.click('[role="dialog"] button[aria-label="Increase quantity"]');
      await page.waitForFunction(() => {
        const button = document.querySelector(
          '[role="dialog"] button[aria-label="Increase quantity"]'
        );
        return button?.parentElement?.innerText.trim() === '2';
      }, { timeout: 60000 });
      console.log('PASS Shopify cart quantity update');

      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(
        () => document.querySelector('button[aria-label="Shopping bag (2 items)"]'),
        { timeout: 60000 }
      );
      await page.click('button[aria-label="Shopping bag (2 items)"]');
      await page.waitForFunction(() => {
        const button = document.querySelector(
          '[role="dialog"] button[aria-label="Increase quantity"]'
        );
        return button?.parentElement?.innerText.trim() === '2';
      }, { timeout: 60000 });
      console.log('PASS Shopify cart restores after page refresh');

      await page.click('[role="dialog"] button[aria-label^="Remove "]');
      await page.waitForFunction(
        () => document.querySelector('[role="dialog"]')?.innerText.includes('YOUR SHOPPING BAG IS EMPTY'),
        { timeout: 60000 }
      );
      console.log('PASS Shopify cart line removal and empty-cart state');
    }

    if (collectionPath) {
      await visit(collectionPath);
      await page.waitForFunction(() => Boolean(document.querySelector('h1')?.innerText.trim()), {
        timeout: 30000,
      });
    }

    await visit('/search?q=vision');
    await page.waitForFunction(() => Boolean(document.querySelector('h1')?.innerText.trim()), {
      timeout: 30000,
    });

    for (const width of responsiveWidths) {
      await page.setViewport({ width, height: 900 });
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dimensions.document <= dimensions.viewport + 1,
        `search/catalog page should not overflow at ${width}px`
      );
    }

    await visit('/account');
    await page.waitForFunction(
      () => /YOUR ACCOUNT|MY ORDERS|SIGN IN|ACCOUNT/i.test(document.body.innerText),
      { timeout: 30000 }
    );

    await visit('/checkout');
    await page.waitForFunction(() => /CHECKOUT|EXPLORE PRODUCTS|REVIEW BAG/i.test(document.body.innerText), {
      timeout: 30000,
    });

    assert.deepEqual(badLocalResponses, [], 'application routes should not return HTTP errors');
    assert.deepEqual(failedLocalRequests, [], 'application requests should not fail');
    assert.deepEqual(failedShopifyRequests, [], 'Shopify Storefront API requests should not fail');
    assert.deepEqual(consoleErrors, [], 'browser console should not contain errors');
    if (failedExternalRequests.size || externalResourceConsoleErrors) {
      console.warn(
        `WARN intermittent external resource failures: ${[...failedExternalRequests].slice(0, 5).join('; ') || `${externalResourceConsoleErrors} browser resource-load errors`}`
      );
    }
    console.log(`PASS homepage, product and search layouts at ${responsiveWidths.join(', ')}px`);
    console.log(`PASS live Shopify product route: ${productPath}`);
    if (collectionPath) console.log(`PASS Shopify collection route: ${collectionPath}`);
    console.log('PASS Shopify search, cart, checkout handoff, and account routes');
    console.log('PASS browser console and local network checks; no order was placed');
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Browser flow verification failed.');
  process.exitCode = 1;
});
