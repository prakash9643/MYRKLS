import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { ShopifyQueryNotice } from './ShopifyQueryNotice';
import { readShopifyConfig } from '../shopify/config';
import { formatProductPrice, getProductImage } from '../shopify/presentation';
import { getShopifyImageSrcSet, getShopifyImageUrl } from '../shopify/presentation';
import { getProducts } from '../shopify/services/products';
import { searchProducts } from '../shopify/services/search';
import { useShopifyQuery } from '../shopify/use-shopify-query';

interface ShopifySearchResultsProps {
  query: string;
  onSelectProduct: (handle: string) => void;
}

export const ShopifySearchResults: React.FC<ShopifySearchResultsProps> = ({
  query,
  onSelectProduct,
}) => {
  const configured = readShopifyConfig().config !== null;
  const result = useShopifyQuery(
    `shopify-search:${query}`,
    (signal) =>
      query
        ? searchProducts({ query, first: 10, signal })
        : getProducts({ first: 4, signal }),
    configured
  );

  if (result.state.status === 'unconfigured') {
    return (
      <ShopifyQueryNotice
        status="error"
        message={result.state.message}
        compact
      />
    );
  }
  if (result.state.status === 'error') {
    return (
      <ShopifyQueryNotice
        status="error"
        message={result.state.message}
        onRetry={result.retry}
        compact
      />
    );
  }
  if (
    result.state.status === 'idle' ||
    result.state.status === 'loading'
  ) {
    return <ShopifyQueryNotice status="loading" compact />;
  }
  if (result.state.data.nodes.length === 0) {
    return (
      <ShopifyQueryNotice
        status="empty"
        message={query ? `No matching product found for “${query}”.` : 'No published products are available.'}
        compact
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]">
        <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-[#FF5A1F]">
          {query ? `SHOPIFY RESULTS (${result.state.data.nodes.length})` : 'FEATURED PRODUCTS'}
        </span>
        <span className="text-[10.5px] font-sans text-[#8C9B93]">Press Escape to close</span>
      </div>
      <div className="space-y-2.5">
        {result.state.data.nodes.map((product) => {
          const image = getProductImage(product);
          return (
            <button
              type="button"
              key={product.id}
              onClick={() => onSelectProduct(product.handle)}
              className="w-full p-3.5 sm:p-4 bg-white border border-[#E5E0D8] hover:border-[#133429] hover:shadow-sm transition-all text-left flex items-center gap-3 sm:gap-4 group"
            >
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[#F4F2ED] border border-[#EAE6DF] shrink-0 overflow-hidden flex items-center justify-center">
                {image ? (
                  <img
                    src={getShopifyImageUrl(image.url, 160) || image.url}
                    srcSet={getShopifyImageSrcSet(image.url, [128, 160, 240])}
                    sizes="72px"
                    alt={image.altText || product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    width={image.width || undefined}
                    height={image.height || undefined}
                  />
                ) : (
                  <Search size={18} className="text-[#8C9B93]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold uppercase text-[#133429] group-hover:text-[#FF5A1F] transition-colors truncate">
                  {product.title}
                </h4>
                {product.productType && (
                  <p className="text-[11.5px] font-sans text-[#5A6660] truncate">
                    {product.productType}
                  </p>
                )}
                <span className="mt-1 block text-[14px] font-bold font-sans text-[#133429]">
                  {formatProductPrice(product)}
                </span>
              </div>
              <span className="shrink-0 flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-[#133429] group-hover:text-[#FF5A1F]">
                <span className="hidden sm:inline">VIEW</span>
                <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
