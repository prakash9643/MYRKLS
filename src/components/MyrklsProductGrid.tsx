import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Heart, Star, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/MyrklsCartContext';

import { ALL_MYRKLS_PRODUCTS } from '../data/products';
import { readShopifyConfig } from '../shopify/config';
import {
  formatCompareAtPrice,
  formatProductPrice,
  getProductImage,
  getShopifyImageSrcSet,
  getShopifyImageUrl,
} from '../shopify/presentation';
import { getProducts } from '../shopify/services/products';
import { useShopifyQuery } from '../shopify/use-shopify-query';
import type { ShopifyProduct } from '../shopify/types';
import { ShopifyQueryNotice } from './ShopifyQueryNotice';
import { productPath } from '../routing/routes';
import { useAnalyticsConsent } from '../analytics/ConsentProvider';
import { trackEcommerceEvent } from '../analytics/analytics';
import { toAnalyticsItem } from '../analytics/events';

interface Product {
  id: string;
  name: string;
  fullName: string;
  category: string;
  discount: string;
  rating: number;
  reviews: number;
  price: string;
  originalPrice: string;
  image: string | null;
  href: string;
  routeId?: string;
  isShopifyProduct?: boolean;
  availableForSale?: boolean;
  merchandiseId?: string;
  shopifyProduct?: ShopifyProduct;
}

const PRODUCT_NAMES: Record<string, string> = {
  vision: 'Pigment Correct Serum',
  incarnation: 'Skin Renewal Serum',
  rebirth: 'Korean Recovery Serum',
  eternity: 'Advance Longevity Cream',
  restoration: 'Pigment Repair Cream',
  awakening: 'Performance Gel Cleanser',
  sentinel: 'Advanced Aqua Sunscreen',
};

const products: Product[] = ALL_MYRKLS_PRODUCTS.slice(0, 6).map((p) => ({
  id: p.id,
  name: p.name.replace('™', ''),
  fullName: PRODUCT_NAMES[p.id] || p.categoryTitle,
  category: p.category,
  discount: p.discount,
  rating: p.rating,
  reviews: p.reviews,
  price: p.price,
  originalPrice: p.originalPrice,
  image: p.image,
  href: '#all-products',
}));

interface MyrklsProductGridProps {
  onNavigateViewAll?: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const MyrklsProductGrid: React.FC<MyrklsProductGridProps> = ({
  onNavigateViewAll,
  onSelectProduct,
}) => {
  const [addedId, setAddedId] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const { addToCart, addShopifyVariant, isCartAdding } = useCart();
  const { consent } = useAnalyticsConsent();
  const viewedListRef = useRef('');
  const shopifyConfig = readShopifyConfig();
  const shopifyMode = shopifyConfig.config !== null || shopifyConfig.error !== null;
  const shopifyProducts = useShopifyQuery(
    'homepage-featured-products',
    (signal) => getProducts({ first: 6, signal }),
    shopifyConfig.config !== null
  );
  const displayedProducts: Product[] =
    shopifyProducts.state.status === 'success'
      ? shopifyProducts.state.data.nodes.map((product: ShopifyProduct) => ({
          id: product.id,
          routeId: product.handle,
          name: product.title,
          fullName: product.productType || product.title,
          category: product.productType,
          discount: '',
          rating: 0,
          reviews: 0,
          price: formatProductPrice(product),
          originalPrice: formatCompareAtPrice(product) || '',
          image: getProductImage(product)?.url || null,
          href: productPath(product.handle),
          isShopifyProduct: true,
          availableForSale: product.availableForSale,
          merchandiseId:
            product.variants.length === 1 && product.variants[0].availableForSale
              ? product.variants[0].id
              : undefined,
          shopifyProduct: product,
        }))
      : shopifyMode
        ? []
        : products;

  useEffect(() => {
    if (shopifyProducts.state.status !== 'success') return;
    const shopifyItems = shopifyProducts.state.data.nodes;
    if (shopifyItems.length === 0) return;
    const listKey = shopifyItems.map((product) => product.id).join('|');
    if (viewedListRef.current === listKey) return;
    const items = shopifyItems.map((product) => toAnalyticsItem(product));
    const sent = trackEcommerceEvent('view_item_list', {
      item_list_id: 'homepage_featured_products',
      item_list_name: 'Homepage featured products',
      items,
    });
    if (sent) viewedListRef.current = listKey;
  }, [consent?.analytics, consent?.marketing, shopifyProducts.state]);

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedId(id);
    addToCart(id);
    setTimeout(() => {
      setAddedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="clinical-serums"
      aria-label="Clinical Serums and Formulations"
      className="w-full py-16 px-6 md:px-12 lg:px-16 select-none bg-[#FAF9F7]"
    >
      {/* Top Header Bar: Title on Left, View All Button on Right */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[26px] md:text-[32px] font-semibold text-[#111111] tracking-[-0.025em]">
          Clinical Serums
        </h2>

        <button
          type="button"
          onClick={() => {
            if (onNavigateViewAll) {
              onNavigateViewAll();
            } else {
              window.location.hash = '#all-products';
            }
          }}
          className="bg-transparent border border-[#111111] text-[#111111] hover:bg-[#FF5A2A] hover:border-[#FF5A2A] hover:text-white px-5 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-200 rounded-none inline-flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
        >
          {shopifyMode && shopifyProducts.state.status === 'success'
            ? `VIEW ALL (${String(shopifyProducts.state.data.nodes.length).padStart(2, '0')})`
            : 'VIEW ALL (07)'}
        </button>
      </div>

      {/* 3-Column × 2-Row Edge-to-Edge Grid (3*2 Editorial Product Cards) */}
      {shopifyMode &&
      shopifyProducts.state.status !== 'success' ? (
        <ShopifyQueryNotice
          compact
          status={
            shopifyProducts.state.status === 'error'
              ? 'error'
              : 'loading'
          }
          message={
            shopifyProducts.state.status === 'error'
              ? shopifyProducts.state.message
              : undefined
          }
          onRetry={shopifyProducts.state.status === 'error' ? shopifyProducts.retry : undefined}
        />
      ) : shopifyMode && displayedProducts.length === 0 ? (
        <ShopifyQueryNotice
          compact
          status="empty"
          message="No published Shopify products are available."
        />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full">
        {displayedProducts.map((product) => {
          const isAdded = addedId === product.id;
          const isWishlisted = !!wishlisted[product.id];
          const routeId = product.routeId || product.id;
          const shopifyImage = product.shopifyProduct
            ? getProductImage(product.shopifyProduct)
            : null;
          const trackSelection = () => {
            if (!product.shopifyProduct) return;
            const item = toAnalyticsItem(product.shopifyProduct);
            trackEcommerceEvent(
              'select_item',
              {
                item_list_id: 'homepage_featured_products',
                item_list_name: 'Homepage featured products',
                items: [item],
              }
            );
          };

          return (
            <article
              key={product.id}
              className="group flex flex-col rounded-none bg-transparent"
            >
              {/* Product Visual Box: 4:5 Aspect Ratio with Full-Bleed Image */}
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-none bg-[#0B1A10]">
                {/* Product Image */}
                <a
                  href={product.href}
                  onClick={(e) => {
                    if (onSelectProduct) {
                      e.preventDefault();
                      trackSelection();
                      onSelectProduct(routeId);
                    }
                  }}
                  className="block w-full h-full cursor-pointer"
                >
                  {product.image ? (
                    <img
                      src={
                        shopifyImage
                          ? getShopifyImageUrl(shopifyImage.url, 720) || product.image || ''
                          : product.image || ''
                      }
                      srcSet={
                        shopifyImage
                          ? getShopifyImageSrcSet(shopifyImage.url, [360, 720, 1080])
                          : undefined
                      }
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      alt={product.fullName}
                      className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03] select-none"
                      loading="lazy"
                      decoding="async"
                      width={shopifyImage?.width || undefined}
                      height={shopifyImage?.height || undefined}
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-6 text-center font-['Syne',sans-serif] text-lg font-bold uppercase text-white">
                      {product.name}
                    </span>
                  )}
                </a>

                {/* Top-Right Wishlist Heart Button (Appears on hover or if wishlisted) */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(product.id, e)}
                  aria-label={`Save ${product.name} to wishlist`}
                  className={`absolute top-4 right-4 w-9 h-9 md:w-10 md:h-10 rounded-none bg-white/95 hover:bg-white text-[#111111] flex items-center justify-center shadow-md transition-all z-10 cursor-pointer ${
                    isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart
                    size={17}
                    strokeWidth={2}
                    className={isWishlisted ? 'fill-[#FF5A1F] text-[#FF5A1F]' : 'text-[#111111]'}
                  />
                </button>

                {/* Bottom Add to Cart Bar (Reveals on card hover or when item is added) */}
                <div
                  className={`absolute bottom-0 inset-x-0 z-10 transition-all duration-300 ease-out transform ${
                    isAdded
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      if (product.isShopifyProduct) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (product.merchandiseId) {
                          void addShopifyVariant(product.merchandiseId);
                        } else {
                          trackSelection();
                          onSelectProduct?.(routeId);
                        }
                      } else {
                        handleAddToCart(product.id, e);
                      }
                    }}
                    disabled={
                      product.isShopifyProduct
                        ? !product.availableForSale || isCartAdding
                        : false
                    }
                    className={`w-full h-12 md:h-13 rounded-none text-[12px] font-bold tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] ${
                      isAdded
                        ? 'bg-[#FF5A2A] text-white shadow-sm'
                        : 'bg-[#111111] hover:bg-[#FF5A2A] text-white shadow-sm'
                    }`}
                  >
                    {product.isShopifyProduct && product.merchandiseId ? (
                      <>
                        <ShoppingBag size={15} strokeWidth={2} />
                        <span>{isCartAdding ? 'ADDING…' : 'ADD TO CART'}</span>
                      </>
                    ) : product.isShopifyProduct ? (
                      <>
                        <ArrowRight size={15} />
                        <span>
                          {product.availableForSale ? 'SELECT OPTIONS' : 'UNAVAILABLE'}
                        </span>
                      </>
                    ) : isAdded ? (
                      <>
                        <Check size={15} strokeWidth={2.5} />
                        <span>ADDED TO CART</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} strokeWidth={2} />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Content: Product Title, Rating, Price */}
              <div className="mt-4 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <a
                    href={product.href}
                    onClick={(e) => {
                      if (onSelectProduct) {
                        e.preventDefault();
                        trackSelection();
                        onSelectProduct(routeId);
                      }
                    }}
                    className="group/link block flex-1 cursor-pointer"
                  >
                    <h3 className="text-[17px] md:text-[19px] font-semibold text-[#111111] tracking-tight leading-snug group-hover/link:text-[#FF5A1F] transition-colors">
                      {product.fullName}
                    </h3>
                  </a>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-[17px] md:text-[19px] font-bold text-[#111111] tracking-tight">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[13.5px] md:text-[14.5px] text-[#999999] line-through font-normal">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Star Rating & Review Count */}
                {!product.isShopifyProduct && (
                <div className="flex items-center gap-1.5 text-[12.5px] md:text-[13px] mt-1.5">
                  <div className="flex items-center gap-1 text-[#FF5A1F]">
                    <Star size={14} className="fill-[#FF5A1F] text-[#FF5A1F]" />
                    <span className="font-semibold text-[#111111]">{product.rating}</span>
                  </div>
                  <span className="text-[#888888]">({product.reviews} reviews)</span>
                </div>
                )}
                {product.isShopifyProduct && (
                  <span
                    className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      product.availableForSale ? 'text-[#43624C]' : 'text-[#9B4A3F]'
                    }`}
                  >
                    {product.availableForSale ? 'Available' : 'Currently unavailable'}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
      )}
    </section>
  );
};
