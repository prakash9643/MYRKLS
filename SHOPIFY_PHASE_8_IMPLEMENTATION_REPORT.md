# Shopify Phase 8 Implementation Report

## Status

Phase 8 storefront analytics and consent foundation is implemented. Local build, scripted integration tests, the Shopify checkout-pixel mock, and local desktop/mobile interaction checks pass. Live GA4, Meta Pixel, and Shopify checkout purchase tracking remain unverified because analytics IDs are not configured, the custom pixel has not been installed in Shopify Admin, and no authorized test order was created.

## Architecture and behavior

- Google Analytics 4 is intended to be configured through Google Tag Manager. The storefront loads GTM only after analytics consent; it does not add a direct `gtag.js` integration.
- Meta Pixel is optional and is loaded only after marketing consent.
- `ConsentProvider` owns versioned necessary/analytics/marketing choices. Users can accept all, reject optional tracking, customize, and reopen preferences from the footer.
- Page and commerce tracking are centralized in `src/analytics/analytics.ts`. Data-layer events are emitted only with the corresponding consent and when analytics is enabled for the deployment.
- Shopify product, collection, search, and cart data are used for ecommerce events. Legacy/static product cards are not sent as Shopify ecommerce events.
- First-touch UTM values are allowlisted, bounded, and screened for common email/phone patterns. They are persisted in session storage only with analytics consent and cleared when that consent is withdrawn. Arbitrary query parameters and fragments are not sent as page locations.
- The React storefront does not emit a purchase event. `shopify/custom-pixel-checkout-completed.js` listens for Shopify's `checkout_completed` customer event, uses the order ID and checkout totals/line items, checks Shopify customer privacy, and deduplicates by order ID with Shopify's browser session-storage API.
- The custom pixel is a Shopify Admin copy/paste source, not a deployed app extension. Its GTM and Meta IDs must be configured by the store owner. GA4 purchase event mapping must be configured in GTM.

## Events wired

| Event | Source | Data/guard |
|---|---|---|
| `page_view` | SPA route changes | Safe route, title, first-touch campaign; analytics consent |
| `view_item` | Shopify product detail | Shopify product and selected variant; analytics or marketing consent |
| `view_item_list` | Homepage grid and catalog/search results | Shopify product list and list metadata; analytics consent |
| `select_item` | Shopify product-card selection | Selected Shopify product and source-list metadata; analytics consent |
| `search` | Successful Shopify search result | Sanitized search term and Shopify results; analytics or marketing consent |
| `view_cart` | Open non-empty Shopify cart | Shopify cart and lines; analytics consent |
| `add_to_cart` | Confirmed Shopify cart mutation | Actual added line and quantity; analytics or marketing consent |
| `remove_from_cart` | Confirmed Shopify cart mutation | Actual removed quantity/line; analytics consent for GA4 |
| `begin_checkout` | Fresh, validated Shopify cart before checkout redirect | Shopify cart totals/lines; analytics or marketing consent |
| `login` | Successful explicit customer login | Analytics consent |
| `purchase` | Shopify `checkout_completed` pixel only | GA4 checks Shopify analytics permission; Meta checks Shopify marketing permission; Shopify order ID, subtotal, currency, actual line items, and order-level deduplication |

`sign_up`, newsletter subscription, and payment-information events are not emitted: the current account UI does not reliably distinguish account creation from login, no newsletter form was found, and payment details are entered only in Shopify-hosted checkout.

## CRO and existing UX review

- The existing homepage hero, featured-product grid, category/catalog navigation, product detail, cart drawer, and hosted-checkout handoff remain in place. No layout or styling redesign was made.
- Product and cart interaction events are connected at existing interaction points; the cart and checkout flow remain Shopify-backed.
- Search terms are not sent if they resemble an email address or phone number.
- Desktop (1440px) and mobile (390px) document widths matched their viewports in local Chromium, with no horizontal overflow. The consent preferences dialog opened and saved the default optional-denied choice.
- Conversion lift, checkout completion, and campaign performance cannot be evaluated until the merchant configures analytics and runs an approved test.

## Environment and security

Added these placeholders to `.env.example`:

```text
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_ENABLE_IN_DEVELOPMENT=false
VITE_GTM_ID=
VITE_META_PIXEL_ID=
```

`.env.local` was checked for variable names only; it contains the three Shopify Storefront settings and no analytics identifiers. Its values were not read or printed. `.gitignore` ignores `*.local`. No Admin API token, Shopify secret, or other credential was added. GTM and Meta IDs are public identifiers, not credentials.

Set the flags/IDs separately for local, Vercel Preview, and Vercel Production. Keep analytics disabled until the corresponding container/pixel is configured. Do not put an Admin token, webhook secret, GA4 Measurement Protocol API secret, or other private credential in a `VITE_` variable.

## Shopify Admin actions required

1. Configure the public analytics variables in the desired Vercel environments. Set the real GTM container ID and, if used, the real Meta Pixel ID. No IDs are currently configured in `.env.local`.
2. In GTM, configure GA4 tags/events for the storefront's data-layer schema. Disable automatic page-view emission in the GA4 configuration tag if using the explicit SPA `page_view` event, to avoid duplicate page views. Set consent checks for analytics tags and test with GTM Preview/GA4 DebugView.
3. If using Meta, verify that the Pixel/catalog content IDs match the Shopify IDs emitted by this storefront before enabling campaigns.
4. In Shopify Admin, open **Settings → Customer events**, add a custom pixel, paste `shopify/custom-pixel-checkout-completed.js`, replace its GTM placeholder with the same GTM container ID, and enter the Meta Pixel ID only if Meta purchase tracking is desired. Activate only after reviewing the code and privacy settings.
5. Configure Shopify customer-privacy behavior for the hosted checkout. The custom pixel checks `init.customerPrivacy` and subsequent `visitorConsentCollected` updates; Shopify checkout privacy consent is separate from the React storefront's local consent UI and must be configured/tested by the merchant.
6. Confirm GTM Preview receives one `purchase` event from a Shopify `checkout_completed` event and that repeat delivery is deduplicated. Use an authorized development/test order only. No order was created for this implementation.
7. Obtain merchant/legal review of consent copy, regional requirements, retention, and any privacy-policy disclosures. This implementation is not a legal-compliance certification.

## Verification results

| Check | Result |
|---|---|
| `npm run build` | PASS — TypeScript, Vite production build, sitemap generation and verification succeeded. Existing Rollup warning remains: the main JS chunk is about 536 KB minified. |
| `npm run test:shopify` | PASS — Shopify client/cart/customer-account/Phase 7 checks plus analytics consent, config, UTM, event, and purchase-pixel mock checks passed. |
| `node --check shopify/custom-pixel-checkout-completed.js` | PASS |
| `node --check scripts/verify_analytics.cjs` | PASS |
| Headless Chromium local UI check | PASS — consent dialog opened and saved, no horizontal overflow at 1440px or 390px, and no uncaught page JavaScript errors. |
| Browser console | One existing React warning reports the `fetchPriority` prop in `MyrklsHero`; no uncaught page errors were observed. |
| Browser network | Shopify Storefront requests to `https://myrkls.myshopify.com` failed in this local browser environment; a Pinterest resource also failed in an initial run. The local page itself returned HTTP 200. No live Shopify catalog/browser-network verification is claimed here. |
| `npm test` | BLOCKED by the existing script's hardcoded macOS Chrome path (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) on this Windows environment. |
| Live GA4/Meta or Shopify purchase test | NOT RUN — no GTM/Meta IDs or dashboard access were provided, the custom pixel is not installed in Shopify Admin, and no authorized test order was available. |

## Files created

- `src/analytics/config.ts`
- `src/analytics/types.ts`
- `src/analytics/attribution.ts`
- `src/analytics/consent.ts`
- `src/analytics/events.ts`
- `src/analytics/data-layer.ts`
- `src/analytics/analytics.ts`
- `src/analytics/ConsentProvider.tsx`
- `src/analytics/use-page-tracking.ts`
- `src/analytics/CookieConsentBanner.tsx`
- `shopify/custom-pixel-checkout-completed.js`
- `scripts/verify_analytics.cjs`
- `SHOPIFY_PHASE_8_IMPLEMENTATION_REPORT.md`

## Files modified

- `.env.example`
- `package.json`
- `src/main.tsx`
- `src/App.tsx`
- `src/components/MyrklsFooter.tsx`
- `src/components/MyrklsCartDrawer.tsx`
- `src/components/MyrklsProductGrid.tsx`
- `src/components/MyrklsShopifyCatalogPage.tsx`
- `src/components/pdp/MyrklsProductDetailPage.tsx`
- `src/context/MyrklsCartContext.tsx`
- `src/context/ShopifyCustomerAccountContext.tsx`
- `src/shopify/queries/cart.ts`
- `src/shopify/types.ts`
- `src/shopify/services/cart.ts`

## Known issues and deliberately unverified items

- Analytics IDs, GTM container configuration, Meta catalog-ID mapping, Shopify custom-pixel installation, and Shopify checkout privacy settings require merchant action.
- The Shopify purchase pixel is covered by a mocked customer-event test, not a live Shopify checkout. Shopify's sandbox behavior and actual event payload must be verified in the store's Customer Events test console before activation.
- Consent saved by the React storefront does not automatically configure Shopify-hosted checkout privacy consent; the checkout experience needs its own Shopify privacy configuration.
- The local browser could not reach Shopify's Storefront API, so live products and catalog-driven UI were not verified in this run.
- No SSR/prerendering or SEO behavior was changed in this analytics phase.
- The existing npm end-to-end script remains platform-specific and requires a Windows-compatible Chrome path before it can run on this machine.
