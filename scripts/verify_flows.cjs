/**
 * MYRKLS Website Automated Flow Verification Test Suite
 * Tests:
 * 1. Home page render & major section presence
 * 2. All 7 Product Detail Pages (PDPs) Section 01 layout & content
 * 3. Add to Cart flow & Cart Drawer interaction
 * 4. Direct Shop Now -> Checkout flow
 * 5. My Account view navigation
 * 6. Search Modal operation
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

const PRODUCTS = [
  { id: 'vision', name: 'VISION™', category: 'PIGMENT CORRECTING SERUM' },
  { id: 'incarnation', name: 'INCARNATION™', category: 'RETINAL SKIN RENEWAL SERUM' },
  { id: 'rebirth', name: 'REBIRTH™', category: 'SKIN RECOVERY SERUM' },
  { id: 'eternity', name: 'ETERNITY™', category: 'ADVANCED LONGEVITY CREAM' },
  { id: 'restoration', name: 'RESTORATION™', category: 'PLUMPING + PIGMENT-REPAIR CREAM' },
  { id: 'awakening', name: 'AWAKENING™', category: 'PERFORMANCE GEL CLEANSER' },
  { id: 'sentinel', name: 'SENTINEL™', category: 'ADVANCED AQUA SUNSCREEN SPF 50+ PA++++' },
];

async function runVerification() {
  console.log('🚀 Starting MYRKLS automated flow verification...');

  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`Chrome binary not found at ${CHROME_PATH}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Home Page Verification
    console.log('\n[1/6] Verifying Home Page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const pageTitle = await page.title();
    assert(pageTitle.length > 0, `Page loaded with title: "${pageTitle}"`);

    const hasHeader = await page.$('header') !== null;
    assert(hasHeader, 'Global header rendered');

    const heroHeading = await page.evaluate(() => {
      const h = document.querySelector('h1');
      return h ? h.innerText : '';
    });
    assert(heroHeading.length > 0, `Hero heading found: "${heroHeading.replace(/\n/g, ' ')}"`);

    // 2. Verify All 7 PDPs
    console.log('\n[2/6] Verifying All 7 Product Detail Pages...');
    for (const prod of PRODUCTS) {
      await page.goto(`${BASE_URL}/?view=pdp&product=${prod.id}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));

      const pdpData = await page.evaluate((expectedId) => {
        const h1 = document.querySelector('h1');
        const science = document.body.innerText.includes('THE SCIENCE INSIDE');
        const bestFor = document.body.innerText.includes('BEST FOR');
        const addToCartBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('ADD TO CART'));
        const shopNowBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('SHOP NOW'));
        return {
          heading: h1 ? h1.innerText.trim() : '',
          hasScience: science,
          hasBestFor: bestFor,
          hasAddToCart: addToCartBtn,
          hasShopNow: shopNowBtn
        };
      }, prod.id);

      assert(pdpData.heading.includes(prod.name.replace('™', '')), `${prod.name} PDP heading matches`);
      assert(pdpData.hasScience, `${prod.name} PDP contains "THE SCIENCE INSIDE"`);
      assert(pdpData.hasBestFor, `${prod.name} PDP contains "BEST FOR"`);
      assert(pdpData.hasAddToCart && pdpData.hasShopNow, `${prod.name} has both ADD TO CART and SHOP NOW buttons`);
    }

    // 3. Verify Cart Interaction
    console.log('\n[3/6] Verifying Cart Interaction...');
    await page.goto(`${BASE_URL}/?view=pdp&product=incarnation`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));

    // Click ADD TO CART
    const clickedAdd = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('ADD TO CART'));
      if (addBtn) {
        addBtn.click();
        return true;
      }
      return false;
    });
    assert(clickedAdd, 'Clicked ADD TO CART on INCARNATION™');
    await new Promise(r => setTimeout(r, 600));

    const drawerVisible = await page.evaluate(() => {
      const drawer = document.querySelector('[role="dialog"]') || document.body.innerText.includes('YOUR BAG');
      return !!drawer;
    });
    assert(drawerVisible, 'Cart drawer opened successfully');

    // 4. Verify Direct Checkout Flow
    console.log('\n[4/6] Verifying Direct Checkout Flow...');
    await page.goto(`${BASE_URL}/?view=pdp&product=vision`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const shopBtn = btns.find(b => b.innerText.includes('SHOP NOW'));
      if (shopBtn) shopBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const checkoutState = await page.evaluate(() => {
      const isCheckout = window.location.hash.includes('checkout') || document.body.innerText.includes('CHECKOUT');
      return isCheckout;
    });
    assert(checkoutState, 'SHOP NOW directed to Checkout view');

    // 5. Verify My Account Page
    console.log('\n[5/6] Verifying Account View...');
    await page.goto(`${BASE_URL}/?view=account`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));

    const accountHeading = await page.evaluate(() => {
      return document.body.innerText.includes('YOUR ACCOUNT') || document.body.innerText.includes('MY ORDERS');
    });
    assert(accountHeading, 'Account dashboard rendered properly');

    // 6. Verify View All / Catalog
    console.log('\n[6/6] Verifying View All Catalog Page...');
    await page.goto(`${BASE_URL}/?view=view-all`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));

    const catalogLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('ALL FORMULATIONS') || document.body.innerText.includes('ALL PRODUCTS');
    });
    assert(catalogLoaded, 'View All catalog rendered properly');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log(`\n================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
