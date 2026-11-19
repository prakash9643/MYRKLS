// Configure the non-secret IDs in Shopify Admin before activating this custom pixel.
const gtmId = 'GTM-REPLACEME';
const metaPixelId = '';
const purchaseKeyPrefix = 'myrkls_purchase_sent_v1:';
const sentOrders = new Set();

let customerPrivacyStatus = init.customerPrivacy;

api.customerPrivacy.subscribe('visitorConsentCollected', (event) => {
  customerPrivacyStatus = event.customerPrivacy;
});

const loadGoogleTagManager = () => {
  if (!/^GTM-[A-Z0-9]+$/i.test(gtmId) || typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  if (window.__myrklsGtmLoaded === gtmId) return true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  script.dataset.myrklsGtm = gtmId;
  document.head.appendChild(script);
  window.__myrklsGtmLoaded = gtmId;
  return true;
};

const loadMetaPixel = () => {
  if (!/^\d{5,20}$/.test(metaPixelId) || typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  if (window.fbq) return window.fbq;
  const pixel = function (...args) {
    const callable = pixel;
    if (callable.callMethod) callable.callMethod(...args);
    else (callable.queue ||= []).push(args);
  };
  pixel.queue = [];
  pixel.loaded = true;
  pixel.version = '2.0';
  window.fbq = pixel;
  window._fbq = pixel;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  pixel('init', metaPixelId);
  pixel('consent', 'grant');
  return pixel;
};

const getPurchase = (event) => {
  const checkout = event && event.data && event.data.checkout;
  if (!checkout || !checkout.order || !checkout.order.id) return null;

  const value = Number(checkout.subtotalPrice && checkout.subtotalPrice.amount);
  const currency = checkout.currencyCode ||
    (checkout.subtotalPrice && checkout.subtotalPrice.currencyCode);
  if (!Number.isFinite(value) || value < 0 || typeof currency !== 'string' || !currency) {
    return null;
  }

  const items = (Array.isArray(checkout.lineItems) ? checkout.lineItems : [])
    .map((line) => {
      const variant = line && line.variant;
      const product = variant && variant.product;
      const quantity = Number(line && line.quantity);
      const price = Number(variant && variant.price && variant.price.amount);
      if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
        return null;
      }

      const discountTotal = (Array.isArray(line.discountAllocations)
        ? line.discountAllocations
        : []
      ).reduce((total, allocation) => {
        const amount = Number(allocation && allocation.amount && allocation.amount.amount);
        return Number.isFinite(amount) && amount >= 0 ? total + amount : total;
      }, 0);

      return {
        item_id: (variant && variant.id) || line.id,
        item_name: (product && product.title) || line.title || (variant && variant.title),
        ...(product && product.vendor ? { item_brand: product.vendor } : {}),
        ...(variant && variant.title && variant.title !== 'Default Title'
          ? { item_variant: variant.title }
          : {}),
        price,
        ...(discountTotal > 0 ? { discount: discountTotal / quantity } : {}),
        quantity,
      };
    })
    .filter((item) => item && typeof item.item_id === 'string' && typeof item.item_name === 'string');

  if (items.length === 0) return null;
  return {
    transaction_id: checkout.order.id,
    currency,
    value,
    items,
  };
};

analytics.subscribe('checkout_completed', async (event) => {
  if (!customerPrivacyStatus || customerPrivacyStatus.analyticsProcessingAllowed !== true) return;
  const purchase = getPurchase(event);
  if (!purchase) return;
  if (!loadGoogleTagManager()) return;

  const storageKey = `${purchaseKeyPrefix}${purchase.transaction_id}`;
  if (sentOrders.has(purchase.transaction_id)) return;

  try {
    if (await browser.sessionStorage.getItem(storageKey)) return;
    await browser.sessionStorage.setItem(storageKey, '1');
  } catch (error) {
    console.warn('[MYRKLS analytics] Purchase deduplication storage unavailable; deduplicating in this pixel session only.');
  }

  sentOrders.add(purchase.transaction_id);
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event: 'purchase', ecommerce: purchase });

  if (customerPrivacyStatus.marketingAllowed === true) {
    const pixel = loadMetaPixel();
    if (pixel) {
      pixel(
        'track',
        'Purchase',
        {
          content_ids: purchase.items.map((item) => item.item_id),
          contents: purchase.items.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
          content_type: 'product',
          currency: purchase.currency,
          value: purchase.value,
        },
        { eventID: purchase.transaction_id }
      );
    }
  }
});
