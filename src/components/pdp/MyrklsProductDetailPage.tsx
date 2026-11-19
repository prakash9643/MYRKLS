import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MyrklsHeader } from '../MyrklsHeader';
import { MyrklsFooter } from '../MyrklsFooter';
import { MyrklsProductHeroSection } from './MyrklsProductHeroSection';
import { MyrklsProductSection2 } from './MyrklsProductSection2';
import { MyrklsProductSection3 } from './MyrklsProductSection3';
import { MyrklsProductHowToUseSection } from './MyrklsProductHowToUseSection';
import { MyrklsProductFaqSection } from './MyrklsProductFaqSection';
import { MyrklsProductReelsSection } from './MyrklsProductReelsSection';
import { MyrklsProductReviewSection } from './MyrklsProductReviewSection';
import { useCart } from '../../context/MyrklsCartContext';
import { ALL_MYRKLS_PRODUCTS, getProductById } from '../../data/products';
import type { MyrklsProductDetail } from '../../types';
import { readShopifyConfig } from '../../shopify/config';
import {
  formatShopifyMoney,
  getProductImage,
  getShopifyImageSrcSet,
  getShopifyImageUrl,
} from '../../shopify/presentation';
import { getProductByHandle } from '../../shopify/services/products';
import { useShopifyQuery } from '../../shopify/use-shopify-query';
import type { ShopifyProduct, ShopifyVariant } from '../../shopify/types';
import { ShopifyQueryNotice } from '../ShopifyQueryNotice';
import { useAnalyticsConsent } from '../../analytics/ConsentProvider';
import { trackEcommerceEvent } from '../../analytics/analytics';
import { toAnalyticsItem } from '../../analytics/events';

export interface MyrklsProductDetailPageProps {
  productId?: string;
  onBackToHome?: () => void;
  onNavigateViewAll?: () => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateCheckout?: () => void;
  onAddToCart?: (productId: string, size?: string) => void;
}

export const MyrklsProductDetailPage: React.FC<MyrklsProductDetailPageProps> = ({
  productId = 'incarnation',
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateCheckout,
  onAddToCart,
}) => {
  const [cartCount, setCartCount] = useState(0);

  // Retrieve matching product from Master Product Knowledge Base (defaults to INCARNATION™)
  const product: MyrklsProductDetail = useMemo(() => {
    return getProductById(productId) || ALL_MYRKLS_PRODUCTS[1]; // default to INCARNATION
  }, [productId]);

  const shopifyConfig = readShopifyConfig();
  const shopifyMode = shopifyConfig.config !== null || shopifyConfig.error !== null;
  const shopifyProduct = useShopifyQuery(
    `shopify-product:${productId}`,
    (signal) => getProductByHandle(productId, signal),
    shopifyConfig.config !== null
  );

  const { addToCart } = useCart();

  const handleAddToCart = (pId: string, size?: string) => {
    addToCart(pId, size);
    setCartCount((c) => c + 1);
    if (onAddToCart) {
      onAddToCart(pId, size);
    }
  };

  const handleProceedToSec2 = () => {
    // Smooth scroll down to upcoming Section 2 area or alert
    const sec2 = document.getElementById('product-section-2');
    if (sec2) {
      sec2.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (shopifyMode) {
    return (
      <div className="relative w-full min-h-screen bg-[#FAF9F7] text-[#133429] flex flex-col justify-between selection:bg-[#133429] selection:text-white">
        <MyrklsHeader
          onNavigateHome={onBackToHome}
          onNavigateViewAll={onNavigateViewAll}
          onNavigateProduct={onNavigateProduct}
          onNavigateAccount={onNavigateAccount}
        />
        <main className="flex-1 w-full">
          {shopifyProduct.state.status === 'error' ? (
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-16">
              <ShopifyQueryNotice
                status="error"
                message={shopifyProduct.state.message}
                onRetry={shopifyProduct.retry}
              />
            </section>
          ) : shopifyProduct.state.status !== 'success' ? (
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-16">
              <ShopifyQueryNotice status="loading" />
            </section>
          ) : !shopifyProduct.state.data ? (
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-16">
              <ShopifyQueryNotice
                status="empty"
                message="This product handle was not found in the Shopify catalog."
              />
            </section>
          ) : (
            <ShopifyProductDetail product={shopifyProduct.state.data} />
          )}
        </main>
        <MyrklsFooter onNavigateViewAll={onNavigateViewAll} onNavigateHome={onBackToHome} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#FAF9F7] text-[#133429] flex flex-col justify-between selection:bg-[#133429] selection:text-white">
      {/* 1. Official MYRKLS Global Header */}
      <MyrklsHeader
        cartCount={cartCount}
        onNavigateHome={onBackToHome}
        onNavigateViewAll={onNavigateViewAll}
        onNavigateProduct={onNavigateProduct}
        onNavigateAccount={onNavigateAccount}
      />

      {/* 2. Main Product Content Stage */}
      <main className="flex-1 w-full">
        {/* ======================================================== */}
        {/* SECTION 1: MASTER HERO SHOWCASE & FORMULATION COMMERCE   */}
        {/* ======================================================== */}
        <MyrklsProductHeroSection
          product={product}
          onBackToCollection={onNavigateViewAll}
          onBackToHome={onBackToHome}
          onAddToCart={handleAddToCart}
          onNavigateCheckout={onNavigateCheckout}
          onProceedToSec2={handleProceedToSec2}
        />

        {/* ======================================================== */}
        {/* SECTION: RECOMMENDED PRODUCTS — BETTER TOGETHER          */}
        {/* ======================================================== */}
        <MyrklsProductSection3
          onAddToCart={(pId) => handleAddToCart(pId)}
        />

        {/* ======================================================== */}
        {/* SECTION: FORMULATION PHILOSOPHY — GLOBAL ACTIVE SCIENCE   */}
        {/* ======================================================== */}
        <MyrklsProductSection2
          product={product}
          onAddToCart={(pId) => handleAddToCart(pId)}
        />

        {/* ======================================================== */}
        {/* SECTION 04: HOW TO USE — THE RITUAL                      */}
        {/* ======================================================== */}
        <MyrklsProductHowToUseSection productId={product.id} />

        {/* ======================================================== */}
        {/* SECTION 05: FAQ — GOOD QUESTIONS. CLEAR ANSWERS.         */}
        {/* ======================================================== */}
        <MyrklsProductFaqSection productId={product.id} />

        {/* ======================================================== */}
        {/* SECTION 06: SHOP THE REELS — SEE IT IN ACTION            */}
        {/* ======================================================== */}
        <MyrklsProductReelsSection
          productId={product.id}
          onNavigateProduct={onNavigateProduct}
        />

        {/* ======================================================== */}
        {/* SECTION 07: VERIFIED REVIEWS — REAL VOICES IN SMALL      */}
        {/* ======================================================== */}
        <MyrklsProductReviewSection productId={product.id} />
      </main>

      {/* 3. Official MYRKLS Global Footer */}
      <MyrklsFooter onNavigateViewAll={onNavigateViewAll} />
    </div>
  );
};

const ShopifyProductDetail: React.FC<{ product: ShopifyProduct }> = ({ product }) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { consent } = useAnalyticsConsent();
  const viewedProductRef = useRef('');
  const {
    addShopifyVariant,
    isCartAdding,
    cartError,
    dismissCartError,
  } = useCart();
  const images = useMemo(() => {
    const candidates = [product.featuredImage, ...product.images].filter(
      (image): image is NonNullable<typeof image> => image !== null
    );
    return candidates.filter(
      (image, index) => candidates.findIndex((entry) => entry.url === image.url) === index
    );
  }, [product.featuredImage, product.images]);
  const selectedVariant: ShopifyVariant | null =
    product.variants.find((variant) => variant.id === selectedVariantId) ||
    product.variants.find((variant) => variant.availableForSale) ||
    product.variants[0] ||
    null;
  const activeImage = images[activeImageIndex] || getProductImage(product);
  const handleAddToCart = async () => {
    if (!selectedVariant?.availableForSale || !Number.isInteger(quantity) || quantity < 1) return;
    await addShopifyVariant(selectedVariant.id, quantity);
  };

  useEffect(() => {
    if (viewedProductRef.current === product.id) return;
    const item = toAnalyticsItem(product, selectedVariant || undefined);
    if (
      trackEcommerceEvent('view_item', {
        currency: product.priceRange.minVariantPrice.currencyCode,
        value: item.price,
        items: [item],
      })
    ) {
      viewedProductRef.current = product.id;
    }
  }, [consent?.analytics, consent?.marketing, product, product.id, selectedVariant]);

  return (
    <section className="relative w-full bg-[#FAF9F7] text-[#133429]">
      <div className="w-full bg-[#FAF9F7] border-b border-[#DDD8D0] sticky top-[68px] sm:top-[76px] md:top-[86px] z-30 backdrop-blur-md bg-[#FAF9F7]/95">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between text-[11px] font-sans font-medium">
          <a
            href="#all-products"
            className="font-semibold uppercase text-[#133429] transition-colors hover:text-[#FF5A1F]"
          >
            Back to Collection
          </a>
          <span className="text-[#7A857E] uppercase">{product.productType || 'MYRKLS FORMULATION'}</span>
        </div>
      </div>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden bg-[#0B1A10] border border-[#DDD8D0]">
              {activeImage ? (
                <img
                  src={getShopifyImageUrl(activeImage.url, 1200) || activeImage.url}
                  srcSet={getShopifyImageSrcSet(activeImage.url, [800, 1200, 1600])}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  alt={activeImage.altText || product.title}
                  className="w-full h-full object-cover"
                  decoding="async"
                  width={activeImage.width || undefined}
                  height={activeImage.height || undefined}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center font-['Syne',sans-serif] text-2xl font-bold uppercase text-white">
                  {product.title}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    type="button"
                    key={image.url}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                    className={`aspect-[4/3] overflow-hidden border bg-white ${
                      activeImageIndex === index ? 'border-[#133429]' : 'border-[#DDD8D0]'
                    }`}
                  >
                    <img
                      src={getShopifyImageUrl(image.url, 480) || image.url}
                      srcSet={getShopifyImageSrcSet(image.url, [320, 480, 640])}
                      sizes="(min-width: 1024px) 12vw, 25vw"
                      alt={image.altText || `${product.title} image ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={image.width || undefined}
                      height={image.height || undefined}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 bg-[#FF5A1F] rounded-full" />
              <span className="text-[11px] font-sans font-bold tracking-[0.16em] uppercase text-[#FF5A1F]">
                {product.productType || product.vendor || 'SHOPIFY PRODUCT'}
              </span>
            </div>
            <h1 className="text-[40px] sm:text-[48px] xl:text-[54px] font-bold font-['Syne',sans-serif] tracking-tight leading-[1.02] text-[#133429] uppercase">
              {product.title}
            </h1>
            {product.vendor && (
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#7A857E]">
                {product.vendor}
              </p>
            )}
            {product.description && (
              <p className="mt-4 text-[14.5px] sm:text-[15.5px] text-[#4F6357] leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="mt-5 py-5 border-y border-[#DDD8D0] flex items-baseline justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[28px] sm:text-[34px] font-bold font-sans text-[#133429] tracking-tight">
                  {selectedVariant
                    ? formatShopifyMoney(
                        selectedVariant.price.amount,
                        selectedVariant.price.currencyCode
                      )
                    : formatShopifyMoney(
                        product.priceRange.minVariantPrice.amount,
                        product.priceRange.minVariantPrice.currencyCode
                      )}
                </span>
                {selectedVariant?.compareAtPrice &&
                  Number(selectedVariant.compareAtPrice.amount) >
                    Number(selectedVariant.price.amount) && (
                    <span className="text-[15px] font-sans line-through text-[#9E9B93]">
                      {formatShopifyMoney(
                        selectedVariant.compareAtPrice.amount,
                        selectedVariant.compareAtPrice.currencyCode
                      )}
                    </span>
                  )}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  selectedVariant?.availableForSale
                    ? 'text-[#43624C]'
                    : 'text-[#9B4A3F]'
                }`}
              >
                {selectedVariant
                  ? selectedVariant.availableForSale
                    ? 'Available'
                    : 'Unavailable'
                  : product.availableForSale
                    ? 'Available'
                    : 'Unavailable'}
              </span>
            </div>

            {product.variants.length > 1 && (
              <div className="mt-5">
                <label
                  htmlFor="shopify-product-variant"
                  className="text-[10.5px] font-sans font-bold uppercase tracking-[0.14em] text-[#7A857E] block mb-2"
                >
                  Product option
                </label>
                <select
                  id="shopify-product-variant"
                  value={selectedVariant?.id || ''}
                  onChange={(event) => setSelectedVariantId(event.target.value)}
                  className="h-11 w-full border border-[#DDD8D0] bg-white px-3 text-[12px] text-[#133429] outline-none focus:border-[#133429]"
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
                      {variant.title} —{' '}
                      {formatShopifyMoney(variant.price.amount, variant.price.currencyCode)}
                      {!variant.availableForSale ? ' (Unavailable)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {product.options.length > 0 && (
              <dl className="mt-5 border border-[#DDD8D0] bg-white p-4">
                {product.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#7A857E]">
                      {option.name}
                    </dt>
                    <dd className="text-right text-[12px] text-[#133429]">
                      {option.values.join(', ')}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-5 flex items-center justify-between gap-4">
              <label
                htmlFor="shopify-product-quantity"
                className="text-[10.5px] font-sans font-bold uppercase tracking-[0.14em] text-[#7A857E]"
              >
                Quantity
              </label>
              <input
                id="shopify-product-quantity"
                type="number"
                min={1}
                max={999}
                step={1}
                value={quantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setQuantity(Number.isInteger(value) && value >= 1 && value <= 999 ? value : 1);
                  dismissCartError();
                }}
                className="h-10 w-20 border border-[#DDD8D0] bg-white px-2 text-center text-[13px] text-[#133429] outline-none focus:border-[#133429]"
              />
            </div>

            {cartError && (
              <p role="alert" className="mt-4 border-l-2 border-[#B54732] bg-white px-4 py-3 text-[12px] leading-relaxed text-[#8F382E]">
                {cartError}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={!selectedVariant?.availableForSale || isCartAdding}
              className="mt-4 w-full h-13 sm:h-14 bg-[#111111] hover:bg-[#FF5A2A] disabled:bg-[#9E9B93] disabled:cursor-not-allowed text-white text-[12px] sm:text-[12.5px] font-sans uppercase tracking-[0.14em] font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isCartAdding
                ? 'ADDING TO BAG…'
                : selectedVariant?.availableForSale
                  ? 'ADD TO BAG'
                  : 'CURRENTLY UNAVAILABLE'}
            </button>

            <p className="mt-5 border-l-2 border-[#FF5A1F] bg-white px-4 py-3 text-[12px] leading-relaxed text-[#5A6660]">
              Product details, availability and pricing are read directly from Shopify. Final shipping, taxes and applicable discounts are confirmed at Shopify checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyrklsProductDetailPage;
