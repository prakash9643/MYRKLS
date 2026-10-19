import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { ALL_MYRKLS_PRODUCTS, PRODUCT_KEYWORDS_MAP, SUGGESTED_SEARCHES } from '../data/products';

export interface MyrklsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export const MyrklsSearchModal: React.FC<MyrklsSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter matching products across all 7 products
  const matchingProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return ALL_MYRKLS_PRODUCTS.filter((prod) => {
      const prodId = prod.id.toLowerCase();
      const name = prod.name.toLowerCase();
      const category = prod.category.toLowerCase();
      const categoryTitle = prod.categoryTitle.toLowerCase();
      const benefit = (prod.consumerBenefit || '').toLowerCase();
      const bestFor = (prod.bestFor || '').toLowerCase();
      const concerns = (prod.primaryConcerns || []).join(' ').toLowerCase();
      const ingredients = (prod.keyIngredients || [])
        .map((k) => `${k.name} ${k.role}`)
        .join(' ')
        .toLowerCase();
      const keywords = (PRODUCT_KEYWORDS_MAP[prodId] || []).join(' ').toLowerCase();

      // Check if search tokens match
      const searchableString = `${name} ${category} ${categoryTitle} ${benefit} ${bestFor} ${concerns} ${ingredients} ${keywords}`;
      
      // Match query or individual words in query
      const tokens = q.split(/\s+/).filter(Boolean);
      return tokens.every((token) => searchableString.includes(token));
    });
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (productId: string) => {
    onSelectProduct(productId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Formulations"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 sm:px-6 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[680px] bg-[#FAF9F7] border border-[#DDD8D0] shadow-2xl rounded-none overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. SEARCH INPUT HEADER                                   */}
        {/* ======================================================== */}
        <div className="relative p-4 sm:p-5 bg-white border-b border-[#E5E0D8] flex items-center gap-3">
          <Search size={20} className="text-[#133429] shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, active, skin concern (e.g. Retinal, SPF, Cleanser)..."
            className="w-full bg-transparent text-[14px] sm:text-[15px] font-sans text-[#133429] placeholder:text-[#8C9B93] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              className="w-6 h-6 flex items-center justify-center text-[#8C9B93] hover:text-[#133429] transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search overlay"
            className="w-8 h-8 flex items-center justify-center text-[#133429] hover:text-[#FF5A1F] border border-[#E5E0D8] hover:border-[#133429] rounded-none transition-colors cursor-pointer shrink-0 ml-1"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. RESULTS / SUGGESTIONS BODY (SCROLLABLE)               */}
        {/* ======================================================== */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          {query.trim() === '' ? (
            /* DEFAULT STATE: POPULAR SEARCHES & CURATED FORMULATIONS */
            <div>
              {/* Popular Search Pills */}
              <div>
                <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-[#FF5A1F] block mb-2.5">
                  POPULAR SEARCHES
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border border-[#111111] hover:border-[#FF5A2A] text-[11px] font-sans font-medium uppercase tracking-wider rounded-none transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Formulations Preview */}
              <div className="mt-6 pt-5 border-t border-[#E5E0D8]">
                <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-[#7A8A82] block mb-3">
                  FEATURED FORMULATIONS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_MYRKLS_PRODUCTS.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelect(prod.id)}
                      className="p-3 bg-white border border-[#E5E0D8] hover:border-[#133429] transition-all cursor-pointer flex items-center gap-3 group"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-14 h-14 object-cover border border-[#EFECE6] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-sans font-bold tracking-[0.14em] uppercase text-[#FF5A1F] block truncate">
                          {prod.category}
                        </span>
                        <h4 className="font-['Syne',sans-serif] text-[13.5px] font-bold uppercase text-[#133429] group-hover:text-[#FF5A1F] transition-colors truncate">
                          {prod.name}
                        </h4>
                        <span className="text-[12.5px] font-bold font-sans text-[#133429] block mt-0.5">
                          {prod.price}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-[#8C9B93] group-hover:text-[#133429] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : matchingProducts.length > 0 ? (
            /* SEARCH RESULTS FOUND */
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D8]">
                <span className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase text-[#FF5A1F]">
                  MATCHING FORMULATIONS ({matchingProducts.length})
                </span>
                <span className="text-[10.5px] font-sans text-[#8C9B93]">
                  Press Escape to close
                </span>
              </div>

              <div className="space-y-2.5">
                {matchingProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelect(prod.id)}
                    className="p-3.5 sm:p-4 bg-white border border-[#E5E0D8] hover:border-[#133429] hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 sm:gap-4 group"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#F4F2ED] border border-[#EAE6DF] shrink-0 overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-sans font-bold tracking-[0.14em] uppercase text-[#FF5A1F]">
                          {prod.category}
                        </span>
                        {prod.discount && (
                          <span className="text-[8.5px] font-sans font-bold text-white bg-[#FF5A1F] px-1.5 py-0.5 rounded-none uppercase">
                            {prod.discount}
                          </span>
                        )}
                      </div>

                      <h4 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold uppercase text-[#133429] group-hover:text-[#FF5A1F] transition-colors truncate">
                        {prod.name}
                      </h4>

                      <p className="text-[11.5px] font-sans text-[#5A6660] truncate">
                        {prod.categoryTitle}
                      </p>

                      {/* Pricing */}
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-[14px] font-bold font-sans text-[#133429]">
                          {prod.price}
                        </span>
                        {prod.originalPrice && prod.originalPrice !== prod.price && (
                          <span className="text-[11.5px] font-sans text-[#8C9B93] line-through">
                            {prod.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-[#133429] group-hover:text-[#FF5A1F] transition-colors">
                      <span className="hidden sm:inline">VIEW</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* NO PRODUCTS FOUND */
            <div className="py-10 text-center">
              <div className="w-12 h-12 border border-[#DDD8D0] bg-white flex items-center justify-center mx-auto mb-3">
                <Search size={22} className="text-[#8C9B93]" strokeWidth={1.5} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-[16px] sm:text-[17px] font-bold uppercase text-[#133429]">
                No Formulations Found
              </h4>
              <p className="text-[13px] font-sans text-[#5A6660] mt-1 max-w-sm mx-auto">
                No matching product found for &ldquo;<span className="text-[#133429] font-medium">{query}</span>&rdquo;. Check your spelling or try one of our suggested keywords.
              </p>

              {/* Suggestions */}
              <div className="mt-6 pt-5 border-t border-[#E5E0D8]">
                <span className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-[#7A8A82] block mb-2.5">
                  TRY SEARCHING FOR
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border border-[#111111] hover:border-[#FF5A2A] text-[11px] font-sans font-medium uppercase tracking-wider rounded-none transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. MODAL FOOTER NOTE                                     */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 py-3 bg-white border-t border-[#E5E0D8] flex items-center justify-between text-[10.5px] font-sans text-[#7A8A82]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#FF5A1F]" />
            Official MYRKLS Formulation Catalog · 7 Clinical Systems
          </span>
          <span className="hidden sm:inline">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};

export default MyrklsSearchModal;
