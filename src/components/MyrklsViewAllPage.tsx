import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  X,
  Droplets,
  FlaskConical,
  Globe,
  ShoppingBag,
  Star,
  Heart
} from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';
import { useCart } from '../context/MyrklsCartContext';

import { ALL_MYRKLS_PRODUCTS } from '../data/products';
import type { MyrklsProductDetail } from '../types';
export { ALL_MYRKLS_PRODUCTS };
export type { MyrklsProductDetail };

const getCategoryFromHash = (): string => {
  if (typeof window === 'undefined') return 'ALL';
  const hash = (window.location.hash || '').toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const catParam = (search.get('category') || '').toUpperCase();
  if (catParam) {
    if (catParam === 'MOISTURIZERS' || catParam === 'CREAMS') return 'CREAMS';
    if (catParam === 'SUNSCREEN' || catParam === 'SUN PROTECTION') return 'SUN PROTECTION';
    return catParam;
  }
  if (hash.includes('serum')) return 'SERUMS';
  if (hash.includes('moisturizer') || hash.includes('cream')) return 'CREAMS';
  if (hash.includes('cleanser')) return 'CLEANSERS';
  if (hash.includes('sunscreen') || hash.includes('sun')) return 'SUN PROTECTION';
  return 'ALL';
};

interface MyrklsViewAllPageProps {
  onBackToHome: () => void;
  onNavigatePdp?: (productId: string) => void;
  onNavigateAccount?: () => void;
}

export const MyrklsViewAllPage: React.FC<MyrklsViewAllPageProps> = ({
  onBackToHome,
  onNavigatePdp,
  onNavigateAccount
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(getCategoryFromHash);
  const [activeQuickView, setActiveQuickView] = useState<MyrklsProductDetail | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    const handleHashChange = () => {
      setSelectedCategory(getCategoryFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return ALL_MYRKLS_PRODUCTS.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'ALL' || prod.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.consumerBenefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.bestFor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const { addToCart } = useCart();

  const handleAddToCart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    addToCart(id);
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 2200);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#133429] flex flex-col font-sans selection:bg-[#133429] selection:text-white">
      {/* Sticky Top Header */}
      <MyrklsHeader
        onNavigateHome={onBackToHome}
        onNavigateViewAll={(cat) => {
          if (cat && cat !== 'ALL') {
            const key = cat.toLowerCase();
            const resolved = key.includes('moisturizer') || key.includes('cream')
              ? 'CREAMS'
              : key.includes('sun')
              ? 'SUN PROTECTION'
              : key.includes('cleanse')
              ? 'CLEANSERS'
              : 'SERUMS';
            setSelectedCategory(resolved);
            window.location.hash = `#collection/${key}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setSelectedCategory('ALL');
            window.location.hash = '#all-products';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onNavigateProduct={onNavigatePdp}
        onNavigateAccount={onNavigateAccount}
      />

      {/* Sub-Header Breadcrumb & Direct Return Bar */}
      <div className="w-full bg-[#FAF9F7] border-b border-[#DDD8D0] sticky top-[68px] sm:top-[76px] md:top-[86px] z-30 backdrop-blur-md bg-[#FAF9F7]/95">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 py-3.5 flex items-center justify-between text-[11px] font-sans font-medium tracking-wider">
          <button
            type="button"
            onClick={onBackToHome}
            className="group flex items-center gap-2 text-[#133429] hover:text-[#FF5A1F] transition-colors font-semibold uppercase cursor-pointer"
          >
            <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Return to Home</span>
          </button>

          <div className="hidden sm:flex items-center gap-4 text-[#7A857E] uppercase">
            <span>MYRKLS // ALL PRODUCTS</span>
            <span>•</span>
            <span className="text-[#FF5A1F] font-bold">07 FORMULATIONS</span>
          </div>

          <div className="flex items-center gap-2 text-[#5A6660]">
            <Globe size={13} className="text-[#133429]" />
            <span>GLOBAL INNOVATION · CONTEMPORARY SCIENCE</span>
          </div>
        </div>
      </div>

      {/* Hero Editorial Section */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-12 border-b border-[#DDD8D0]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#DDD8D0] text-[10.5px] font-sans tracking-[0.16em] text-[#FF5A1F] uppercase font-bold mb-4 shadow-2xs">
              <Sparkles size={12} className="text-[#FF5A1F]" />
              <span>THE COMPLETE COLLECTION // 07 FORMULATIONS</span>
            </div>

            <h1 className="text-[34px] sm:text-[46px] md:text-[56px] font-bold font-['Syne',sans-serif] tracking-tight leading-[1.05] text-[#133429] uppercase">
              All Formulations
            </h1>

            <p className="mt-4 text-[14px] sm:text-[15.5px] text-[#5A6660] font-normal leading-relaxed max-w-[680px]">
              High-performance skincare engineered with biocompatible active systems. Browse our complete ritual of clinical serums, lipid barrier creams, gel cleansers, and daily UV photoprotection.
            </p>
          </div>

          {/* Quick Commerce Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="border border-[#DDD8D0] bg-white p-3.5 sm:p-4 rounded-none">
              <span className="text-[10.5px] font-sans uppercase tracking-[0.08em] text-[#7A857E] block font-medium">Formulations</span>
              <span className="text-[22px] sm:text-[26px] font-bold font-['Syne',sans-serif] text-[#133429]">07 Rituals</span>
            </div>
            <div className="border border-[#DDD8D0] bg-white p-3.5 sm:p-4 rounded-none">
              <span className="text-[10.5px] font-sans uppercase tracking-[0.08em] text-[#7A857E] block font-medium">Biocompatibility</span>
              <span className="text-[22px] sm:text-[26px] font-bold font-['Syne',sans-serif] text-[#133429]">pH Native</span>
            </div>
            <div className="col-span-2 sm:col-span-1 border border-[#DDD8D0] bg-[#133429] text-white p-3.5 sm:p-4 rounded-none">
              <span className="text-[10.5px] font-sans uppercase tracking-[0.08em] text-[#FF5A1F] block font-bold">Standard</span>
              <span className="text-[22px] sm:text-[26px] font-bold font-['Syne',sans-serif] text-white">Clean Clinical</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="mt-10 pt-6 border-t border-[#DDD8D0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Products', count: 7 },
              { id: 'SERUMS', label: 'Serums', count: 3 },
              { id: 'CREAMS', label: 'Moisturizers', count: 2 },
              { id: 'CLEANSERS', label: 'Cleansers', count: 1 },
              { id: 'SUN PROTECTION', label: 'Sunscreen', count: 1 },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.id);
                  const catHash = tab.id === 'ALL' ? '#all-products' : `#collection/${tab.id.toLowerCase().replace(' ', '-')}`;
                  window.history.replaceState(null, '', catHash);
                }}
                className={`h-10 px-4 text-[12px] font-sans uppercase tracking-[0.06em] font-semibold transition-all duration-200 cursor-pointer rounded-none border flex items-center gap-2 ${
                  selectedCategory === tab.id
                    ? 'bg-[#133429] text-white border-[#133429] shadow-xs'
                    : 'bg-white text-[#2A3B30] border-[#DDD8D0] hover:border-[#133429]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-none font-bold font-sans ${
                    selectedCategory === tab.id ? 'bg-[#FF5A1F] text-white' : 'bg-[#EFECE6] text-[#5A6660]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input Filter */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, concern, or benefit..."
              className="w-full h-10 px-3.5 bg-white border border-[#DDD8D0] focus:border-[#133429] text-[12.5px] font-sans text-[#133429] placeholder-[#9E9B93] rounded-none outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A857E] hover:text-[#133429] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Main Direct Shopping Product Grid */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-14">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-[#DDD8D0] bg-white p-8">
            <ShoppingBag size={36} className="mx-auto text-[#7A857E] mb-3 opacity-60" />
            <h3 className="text-[18px] font-bold text-[#133429] font-['Syne',sans-serif]">No products match criteria</h3>
            <p className="text-[13px] text-[#5A6660] mt-1 font-sans">Clear your search filter to inspect all 07 formulations.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 bg-[#133429] text-white text-[12px] font-sans font-semibold uppercase tracking-[0.08em] cursor-pointer hover:bg-[#FF5A1F] transition-colors rounded-none"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full">
            {filteredProducts.map((prod) => {
              const isAdded = !!addedIds[prod.id];
              const isWishlisted = !!wishlistedIds[prod.id];

              return (
                <article
                  key={prod.id}
                  className="group flex flex-col rounded-none bg-transparent"
                >
                  {/* Product Visual Box: 4:5 Aspect Ratio with Full-Bleed Image (Homepage Sec 2 Style) */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-none bg-[#0B1A10]">
                    {/* Product Image */}
                    <div
                      className="block w-full h-full cursor-pointer"
                      onClick={() => setActiveQuickView(prod)}
                    >
                      <img
                        src={prod.image}
                        alt={`${prod.name} ${prod.categoryTitle}`}
                        className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-[1.03] select-none"
                        loading="lazy"
                      />
                    </div>

                    {/* Top-Left Badges: Category & Discount */}
                    <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10 pointer-events-none">
                      <span className="bg-white text-[#111111] text-[10px] md:text-[11px] font-bold tracking-[0.16em] px-3 py-1.5 uppercase rounded-none shadow-sm">
                        {prod.category}
                      </span>
                      <span className="bg-[#FF5A1F] text-white text-[10px] md:text-[11px] font-bold tracking-[0.1em] px-3 py-0.5 uppercase rounded-none shadow-sm">
                        {prod.discount}
                      </span>
                    </div>

                    {/* Top-Right Wishlist Heart Button (Appears on hover or if wishlisted) */}
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(prod.id, e)}
                      aria-label={`Save ${prod.name} to wishlist`}
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
                        onClick={(e) => handleAddToCart(prod.id, e)}
                        className={`w-full h-12 md:h-13 rounded-none text-[12px] font-bold tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer ${
                          isAdded
                            ? 'bg-[#152B1D] text-[#A5CBAE]'
                            : 'bg-black hover:bg-[#FF5A1F] text-white shadow-sm'
                        }`}
                      >
                        {isAdded ? (
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
                      <div
                        className="group/link block flex-1 cursor-pointer"
                        onClick={() => setActiveQuickView(prod)}
                      >
                        <h3 className="text-[17px] md:text-[19px] font-semibold text-[#111111] tracking-tight leading-snug group-hover/link:text-[#FF5A1F] transition-colors">
                          {prod.name} {prod.categoryTitle}
                        </h3>
                      </div>

                      {/* Price Display */}
                      <div className="flex items-baseline gap-2 shrink-0">
                        <span className="text-[17px] md:text-[19px] font-bold text-[#111111] tracking-tight">
                          {prod.price}
                        </span>
                        <span className="text-[13.5px] md:text-[14.5px] text-[#999999] line-through font-normal">
                          {prod.originalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating & Review Count */}
                    <div className="flex items-center gap-1.5 text-[12.5px] md:text-[13px] mt-1.5">
                      <div className="flex items-center gap-1 text-[#FF5A1F]">
                        <Star size={14} className="fill-[#FF5A1F] text-[#FF5A1F]" />
                        <span className="font-semibold text-[#111111]">{prod.rating}</span>
                      </div>
                      <span className="text-[#888888]">({prod.reviews} reviews)</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* SHOPPING QUICK VIEW SLIDE-OVER DRAWER                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeQuickView && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setActiveQuickView(null)}
              className="fixed inset-0 bg-[#07130B]/70 backdrop-blur-md"
            />

            {/* Slide-over Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-[540px] bg-[#FAF9F7] border-l border-[#DDD8D0] shadow-2xl h-full flex flex-col justify-between overflow-y-auto z-10 p-6 sm:p-8"
            >
              <div>
                {/* Top Bar inside Drawer */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DDD8D0] mb-6">
                  <span className="text-[10.5px] font-sans uppercase tracking-[0.14em] text-[#FF5A1F] font-bold">
                    QUICK VIEW // {activeQuickView.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveQuickView(null)}
                    aria-label="Close"
                    className="w-8 h-8 rounded-none border border-[#DDD8D0] hover:bg-[#FF5A1F] hover:border-[#FF5A1F] hover:text-white text-[#133429] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Product Header */}
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-24 h-24 bg-white border border-[#DDD8D0] p-2 shrink-0 flex items-center justify-center">
                    <img
                      src={activeQuickView.image}
                      alt={activeQuickView.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-sans uppercase tracking-[0.1em] text-[#7A857E] font-medium">
                      {activeQuickView.categoryPill}
                    </span>
                    <h3 className="text-[26px] font-bold font-['Syne',sans-serif] text-[#133429] tracking-tight">
                      {activeQuickView.name}
                    </h3>
                    <p className="text-[13px] text-[#5A6660] font-sans font-medium">
                      {activeQuickView.categoryTitle}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center gap-1 text-[#FF5A1F]">
                        <Star size={12} className="fill-[#FF5A1F] text-[#FF5A1F]" />
                        <span className="font-bold text-[12px] text-[#133429]">{activeQuickView.rating}</span>
                      </div>
                      <span className="text-[11.5px] text-[#7A857E]">({activeQuickView.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Direct Price & Add to Cart Block inside Quick View */}
                <div className="p-4 bg-white border border-[#DDD8D0] mb-6">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[22px] font-bold font-sans text-[#133429]">
                        {activeQuickView.price}
                      </span>
                      <span className="text-[13px] font-sans line-through text-[#9E9B93]">
                        {activeQuickView.originalPrice}
                      </span>
                    </div>
                    <span className="text-[11.5px] font-sans text-[#FF5A1F] font-bold uppercase tracking-wider">
                      {activeQuickView.savings} · {activeQuickView.discount}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(activeQuickView.id, e)}
                    className={`w-full h-12 text-[12.5px] font-sans uppercase tracking-[0.1em] font-bold transition-all duration-200 cursor-pointer rounded-none flex items-center justify-center gap-2 shadow-sm ${
                      addedIds[activeQuickView.id]
                        ? 'bg-[#152B1D] text-[#A5CBAE]'
                        : 'bg-[#133429] hover:bg-[#FF5A1F] text-white'
                    }`}
                  >
                    {addedIds[activeQuickView.id] ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>ADDED TO CART</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        <span>ADD TO CART — {activeQuickView.price}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Key Consumer Benefits */}
                <div className="mb-6">
                  <span className="text-[11px] font-sans uppercase tracking-[0.14em] text-[#133429] font-bold block mb-2.5">
                    WHY SKIN LOVES IT
                  </span>
                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-[#DDD8D0] text-[12.5px] font-sans text-[#2A3B30] flex items-start gap-2.5 leading-relaxed">
                      <Check size={14} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                      <span>{activeQuickView.consumerBenefit}</span>
                    </div>
                    <div className="p-3 bg-white border border-[#DDD8D0] text-[12.5px] font-sans text-[#2A3B30] flex items-start gap-2.5 leading-relaxed">
                      <Check size={14} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                      <span>Formulated for: <strong>{activeQuickView.bestFor}</strong></span>
                    </div>
                  </div>
                </div>

                {/* How to Apply */}
                <div className="mb-6 p-4 bg-white border border-[#DDD8D0]">
                  <span className="text-[10.5px] font-sans uppercase tracking-[0.14em] text-[#FF5A1F] font-bold block mb-1.5 flex items-center gap-1.5">
                    <Droplets size={12} />
                    HOW TO APPLY // {activeQuickView.routineStep}
                  </span>
                  <p className="text-[12.5px] text-[#2A3B30] font-sans leading-relaxed">
                    {activeQuickView.howToUse}
                  </p>
                </div>

                {/* MYRKLS Advanced Science Bridge to PDP */}
                <div className="p-4 bg-[#FAF9F7] border border-[#DDD8D0] text-[11.5px] font-sans leading-relaxed">
                  <span className="text-[10.5px] font-sans uppercase tracking-[0.14em] text-[#133429] font-bold block mb-1 flex items-center gap-1.5">
                    <FlaskConical size={13} className="text-[#FF5A1F]" />
                    ADVANCED SCIENCE & CLINICAL DOSSIER
                  </span>
                  <p className="text-[#5A6660] mt-1">
                    Looking for in-depth cellular pathways, target pH analysis, and clinical formulation data? The complete scientific rationale is detailed on the official Product Detail Page.
                  </p>
                  {onNavigatePdp && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigatePdp(activeQuickView.id);
                        setActiveQuickView(null);
                      }}
                      className="mt-3.5 w-full py-2.5 bg-[#133429] hover:bg-[#FF5A1F] text-white text-[11.5px] font-sans uppercase tracking-[0.08em] font-semibold transition-colors cursor-pointer rounded-none flex items-center justify-center gap-2"
                    >
                      <span>Explore Science on Product Page (PDP)</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Editorial Banner */}
      <section className="w-full bg-[#133429] text-white py-14 sm:py-16 border-t border-[#DDD8D0]">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-[0.16em] text-[#FF5A1F] font-bold block mb-2">
              PERSONALIZED BIO-REGIMEN
            </span>
            <h3 className="text-[26px] sm:text-[34px] font-bold font-['Syne',sans-serif] tracking-tight">
              Need formulation guidance for your skin barrier?
            </h3>
            <p className="text-[13.5px] text-[#C2E5D0] font-sans mt-2 max-w-[560px] leading-relaxed">
              Our clinical skincare concierge assists with active compatibility sequencing, retinoid introduction protocols, and lipid barrier calibration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="mailto:concierge@myrkls.com"
              className="h-12 px-6 bg-[#FF5A1F] hover:bg-[#E54E15] text-white text-[12px] font-sans uppercase tracking-[0.08em] font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 rounded-none shadow-sm"
            >
              <span>Contact Concierge</span>
              <ArrowRight size={13} />
            </a>

            <button
              type="button"
              onClick={onBackToHome}
              className="h-12 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[12px] font-sans uppercase tracking-[0.08em] font-semibold transition-colors rounded-none flex items-center justify-center cursor-pointer"
            >
              <span>Return Home</span>
            </button>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <MyrklsFooter />
    </div>
  );
};

export default MyrklsViewAllPage;
