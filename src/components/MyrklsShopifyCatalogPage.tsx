import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { MyrklsFooter } from './MyrklsFooter';
import { MyrklsHeader } from './MyrklsHeader';
import { ShopifyQueryNotice } from './ShopifyQueryNotice';
import { readShopifyConfig } from '../shopify/config';
import {
  formatCompareAtPrice,
  formatProductPrice,
  getProductImage,
  getShopifyImageSrcSet,
  getShopifyImageUrl,
} from '../shopify/presentation';
import { getCollectionByHandle, getCollections } from '../shopify/services/collections';
import { getProducts } from '../shopify/services/products';
import { searchProducts } from '../shopify/services/search';
import { useShopifyQuery } from '../shopify/use-shopify-query';
import type { ShopifyConnection, ShopifyProduct } from '../shopify/types';
import { collectionPath, productPath } from '../routing/routes';
import { useAnalyticsConsent } from '../analytics/ConsentProvider';
import { trackEcommerceEvent, trackSearchEvent } from '../analytics/analytics';
import { toAnalyticsItem } from '../analytics/events';

interface MyrklsShopifyCatalogPageProps {
  onBackToHome: () => void;
  onNavigatePdp?: (productHandle: string) => void;
  onNavigateAccount?: () => void;
}

const getRequestedCollection = (): string => {
  if (typeof window === 'undefined') return '';
  const search = new URLSearchParams(window.location.search);
  const pathnameMatch = /^\/collections\/([^/]+)\/?$/i.exec(window.location.pathname);
  if (pathnameMatch) {
    try {
      const handle = decodeURIComponent(pathnameMatch[1]).toLowerCase();
      return handle === 'all' ? '' : handle;
    } catch {
      return '';
    }
  }
  const category = search.get('category');
  if (category) return category.trim().toLowerCase();
  const hashParts = window.location.hash.toLowerCase().split('/');
  return hashParts[0] === '#collection' ? (hashParts[1] || '') : '';
};

const getErrorMessage = (state: { status: string; message?: string | null }): string =>
  state.message || 'The requested Shopify collection could not be found.';

export const MyrklsShopifyCatalogPage: React.FC<MyrklsShopifyCatalogPageProps> = ({
  onBackToHome,
  onNavigatePdp,
  onNavigateAccount,
}) => {
  const configured = readShopifyConfig().config !== null;
  const [selectedCollection, setSelectedCollection] = useState(getRequestedCollection);
  const initialSearchQuery = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('q')?.trim() || ''
    : '';
  const [searchText, setSearchText] = useState(initialSearchQuery);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null]);
  const { consent } = useAnalyticsConsent();
  const lastListKeyRef = useRef('');
  const lastSearchKeyRef = useRef('');
  const after = cursorStack[cursorStack.length - 1] || null;

  const collectionsResult = useShopifyQuery(
    'shopify-collections',
    (signal) => getCollections({ first: 50, signal }),
    configured
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchText.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const syncRoute = () => {
      setSelectedCollection(getRequestedCollection());
      const query = new URLSearchParams(window.location.search).get('q')?.trim() || '';
      setSearchText(query);
      setSearchQuery(query);
      setCursorStack([null]);
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (searchQuery) {
      const query = new URLSearchParams({ q: searchQuery });
      if (currentUrl.pathname !== '/search' || currentUrl.searchParams.get('q') !== searchQuery) {
        window.history.replaceState(null, '', `/search?${query}`);
      }
    } else if (currentUrl.pathname === '/search') {
      window.history.replaceState(null, '', '/collections/all');
    }
  }, [searchQuery]);

  useEffect(() => {
    setCursorStack([null]);
  }, [selectedCollection, searchQuery]);

  const productsKey = useMemo(
    () => `shopify-catalog:${selectedCollection}:${searchQuery}:${after || 'first'}`,
    [selectedCollection, searchQuery, after]
  );

  const productsResult = useShopifyQuery<ShopifyConnection<ShopifyProduct> | null>(
    productsKey,
    (signal) => {
      if (searchQuery) {
        return searchProducts({ query: searchQuery, first: 12, after, signal });
      }
      if (selectedCollection) {
        return getCollectionByHandle(selectedCollection, { first: 12, after, signal }).then(
          (collection) => collection?.products || null
        );
      }
      return getProducts({ first: 12, after, signal });
    },
    configured
  );

  const collections =
    collectionsResult.state.status === 'success'
      ? collectionsResult.state.data.nodes
      : [];
  const collectionMissing =
    selectedCollection &&
    collectionsResult.state.status === 'success' &&
    !collections.some((collection) => collection.handle === selectedCollection);
  const products =
    productsResult.state.status === 'success' ? productsResult.state.data?.nodes || [] : [];
  const pageInfo =
    productsResult.state.status === 'success'
      ? productsResult.state.data?.pageInfo
      : undefined;

  useEffect(() => {
    if (productsResult.state.status !== 'success') return;
    const resultProducts = productsResult.state.data?.nodes || [];
    if (searchQuery) {
      const searchKey = `${searchQuery}|${resultProducts.map((product) => product.id).join('|')}`;
      if (lastSearchKeyRef.current !== searchKey) {
        if (trackSearchEvent(searchQuery, resultProducts)) lastSearchKeyRef.current = searchKey;
      }
    } else {
      lastSearchKeyRef.current = '';
    }
    if (resultProducts.length === 0) return;

    const listId = searchQuery ? 'search_results' : selectedCollection || 'all_products';
    const listName = searchQuery
      ? 'Search results'
      : collections.find((collection) => collection.handle === selectedCollection)?.title ||
        'All products';
    const listKey = `${listId}|${resultProducts.map((product) => product.id).join('|')}`;
    if (lastListKeyRef.current === listKey) return;
    const items = resultProducts.map((product) => toAnalyticsItem(product));
    if (
      trackEcommerceEvent('view_item_list', {
        item_list_id: listId,
        item_list_name: listName,
        items,
      })
    ) {
      lastListKeyRef.current = listKey;
    }
  }, [
    collections,
    consent?.analytics,
    consent?.marketing,
    productsResult.state,
    searchQuery,
    selectedCollection,
  ]);

  const goToProduct = (handle: string) => {
    const product = products.find((entry) => entry.handle === handle);
    if (product) {
      const item = toAnalyticsItem(product);
      trackEcommerceEvent('select_item', {
        item_list_id: searchQuery ? 'search_results' : selectedCollection || 'all_products',
        item_list_name: searchQuery
          ? 'Search results'
          : collections.find((entry) => entry.handle === selectedCollection)?.title || 'All products',
        items: [item],
      });
    }
    if (onNavigatePdp) onNavigatePdp(handle);
    else window.history.pushState(null, '', productPath(handle));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#133429] flex flex-col font-sans selection:bg-[#133429] selection:text-white">
      <MyrklsHeader
        onNavigateHome={onBackToHome}
        onNavigateViewAll={(category) => {
          setSelectedCollection((category || '').trim().toLowerCase());
          setSearchText('');
          setSearchQuery('');
          setCursorStack([null]);
        }}
        onNavigateProduct={goToProduct}
        onNavigateAccount={onNavigateAccount}
      />

      <div className="w-full bg-[#FAF9F7] border-b border-[#DDD8D0] sticky top-[68px] sm:top-[76px] md:top-[86px] z-30 backdrop-blur-md bg-[#FAF9F7]/95">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 py-3.5 flex items-center justify-between text-[11px] font-sans font-medium tracking-wider">
          <button
            type="button"
            onClick={onBackToHome}
            className="group flex items-center gap-2 text-[#133429] hover:text-[#FF5A1F] transition-colors font-semibold uppercase"
          >
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </button>
          <span className="hidden sm:block text-[#7A857E] uppercase">MYRKLS // SHOPIFY CATALOG</span>
          <span className="flex items-center gap-2 text-[#5A6660]">
            <Globe size={13} className="text-[#133429]" />
            <span>LIVE STORE CATALOG</span>
          </span>
        </div>
      </div>

      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-12 border-b border-[#DDD8D0]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#DDD8D0] text-[10.5px] font-sans tracking-[0.16em] text-[#FF5A1F] uppercase font-bold mb-4">
              <Sparkles size={12} />
              <span>SHOPIFY STOREFRONT</span>
            </div>
            <h1 className="text-[34px] sm:text-[46px] md:text-[56px] font-bold font-['Syne',sans-serif] tracking-tight leading-[1.05] text-[#133429] uppercase">
              {selectedCollection
                ? collections.find((collection) => collection.handle === selectedCollection)?.title ||
                  'Collection'
                : 'All Formulations'}
            </h1>
            <p className="mt-4 text-[14px] sm:text-[15.5px] text-[#5A6660] leading-relaxed max-w-[680px]">
              Product details, availability and pricing are provided by the Shopify Storefront API.
            </p>
          </div>
          <div className="w-full lg:w-[360px]">
            <label htmlFor="shopify-catalog-search" className="sr-only">
              Search products
            </label>
            <input
              id="shopify-catalog-search"
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCursorStack([null]);
              }}
              placeholder="Search products..."
              className="w-full h-11 px-3.5 bg-white border border-[#DDD8D0] focus:border-[#133429] text-[13px] font-sans text-[#133429] placeholder-[#9E9B93] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-7" aria-label="Collections">
          <button
            type="button"
            onClick={() => {
              setSelectedCollection('');
              setCursorStack([null]);
              setSearchText('');
              setSearchQuery('');
              window.history.pushState(null, '', '/collections/all');
            }}
            className={`px-3 py-2 border text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
              !selectedCollection
                ? 'border-[#133429] bg-[#133429] text-white'
                : 'border-[#DDD8D0] bg-white text-[#133429] hover:border-[#133429]'
            }`}
          >
            All products
          </button>
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => {
                setSelectedCollection(collection.handle);
                setSearchText('');
                setSearchQuery('');
                setCursorStack([null]);
                window.history.pushState(null, '', collectionPath(collection.handle));
              }}
              className={`px-3 py-2 border text-[10.5px] font-bold uppercase tracking-wider transition-colors ${
                selectedCollection === collection.handle
                  ? 'border-[#133429] bg-[#133429] text-white'
                  : 'border-[#DDD8D0] bg-white text-[#133429] hover:border-[#133429]'
              }`}
            >
              {collection.title}
            </button>
          ))}
          {collectionsResult.state.status === 'error' && (
            <span role="alert" className="self-center text-xs text-[#B54732]">
              Collections unavailable: {collectionsResult.state.message}
            </span>
          )}
        </div>
      </section>

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-14">
        {collectionMissing ? (
          <ShopifyQueryNotice
            status="error"
            message={`Shopify collection “${selectedCollection}” was not found. Choose an available collection above or select All products.`}
          />
        ) : productsResult.state.status === 'unconfigured' ||
          productsResult.state.status === 'idle' ||
          productsResult.state.status === 'loading' ? (
          <ShopifyQueryNotice status="loading" />
        ) : productsResult.state.status === 'error' ? (
          <ShopifyQueryNotice
            status="error"
            message={getErrorMessage(productsResult.state)}
            onRetry={productsResult.retry}
          />
        ) : products.length === 0 ? (
          <ShopifyQueryNotice status="empty" message="Try another search or collection." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full">
              {products.map((product) => {
                const image = getProductImage(product);
                const compareAtPrice = formatCompareAtPrice(product);
                return (
                  <article key={product.id} className="group flex flex-col bg-transparent">
                    <button
                      type="button"
                      onClick={() => goToProduct(product.handle)}
                      className="relative block w-full aspect-[4/5] overflow-hidden bg-[#0B1A10] text-left"
                      aria-label={`View ${product.title}`}
                    >
                      {image ? (
                        <img
                          src={getShopifyImageUrl(image.url, 720) || image.url}
                          srcSet={getShopifyImageSrcSet(image.url, [360, 720, 1080])}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          alt={image.altText || product.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                          decoding="async"
                          width={image.width || undefined}
                          height={image.height || undefined}
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center px-6 text-center font-['Syne',sans-serif] text-lg font-bold uppercase text-white">
                          {product.title}
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-black/80 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors group-hover:bg-[#FF5A1F]">
                        View product
                      </span>
                    </button>
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => goToProduct(product.handle)}
                          className="flex-1 text-left text-[17px] md:text-[19px] font-semibold tracking-tight leading-snug text-[#111111] transition-colors hover:text-[#FF5A1F]"
                        >
                          {product.title}
                          {product.productType && (
                            <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-[#7A857E]">
                              {product.productType}
                            </span>
                          )}
                        </button>
                        <div className="shrink-0 text-right">
                          <span className="block text-[17px] md:text-[19px] font-bold tracking-tight text-[#111111]">
                            {formatProductPrice(product)}
                          </span>
                          {compareAtPrice && compareAtPrice !== formatProductPrice(product) && (
                            <span className="block text-[13px] text-[#999999] line-through">
                              {compareAtPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                          product.availableForSale ? 'text-[#43624C]' : 'text-[#9B4A3F]'
                        }`}
                      >
                        {product.availableForSale ? 'Available' : 'Currently unavailable'}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                disabled={!pageInfo?.hasNextPage || !pageInfo.endCursor}
                onClick={() => {
                  if (pageInfo?.hasNextPage && pageInfo.endCursor) {
                    setCursorStack((stack) => [...stack, pageInfo.endCursor]);
                  }
                }}
                className="inline-flex items-center gap-2 border border-[#133429] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#133429] transition-colors hover:bg-[#133429] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Load more
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </main>
      <MyrklsFooter onNavigateViewAll={() => setSelectedCollection('')} onNavigateHome={onBackToHome} />
    </div>
  );
};
