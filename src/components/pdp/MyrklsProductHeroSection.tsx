import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  ShoppingBag,
  Maximize2,
  X,
  ChevronRight
} from 'lucide-react';
import { MyrklsProductDetail } from '../MyrklsViewAllPage';
import { useCart } from '../../context/MyrklsCartContext';

export interface MyrklsProductHeroSectionProps {
  product: MyrklsProductDetail;
  onBackToCollection?: () => void;
  onBackToHome?: () => void;
  onAddToCart?: (productId: string, size: string) => void;
  onNavigateCheckout?: () => void;
  onProceedToSec2?: () => void;
}

import { PRODUCT_HERO_CONFIGS } from '../../data/products';
import type { ProductHeroConfig } from '../../types';
export { PRODUCT_HERO_CONFIGS };
export type { ProductHeroConfig };

export const MyrklsProductHeroSection: React.FC<MyrklsProductHeroSectionProps> = ({
  product,
  onBackToCollection,
  onBackToHome,
  onAddToCart,
  onNavigateCheckout,
  onProceedToSec2,
}) => {
  const { items, openCart, closeCart, addToCart } = useCart();

  const cleanId = (product.id || '').toLowerCase();
  const config: ProductHeroConfig = PRODUCT_HERO_CONFIGS[cleanId] || {
    category: product.categoryTitle || 'CLINICAL FORMULATION',
    name: product.name,
    shortDescription: product.systemSummary || product.consumerBenefit,
    sizeLabel: `1 UNIT — ${product.size}`,
    ingredients: (product.keyIngredients || []).map((ing) => ({
      name: ing.name,
      percentage: ing.percentage,
      role: ing.role,
    })),
    bestFor: (product.primaryConcerns || []).slice(0, 4),
  };

  // Gallery state (4 curated high-definition views for the formulation)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.size);
  const [isAdded, setIsAdded] = useState(false);

  // Multi-view visual asset array for Section 1 Hero
  const mediaGallery = [
    {
      id: 'studio-bottle',
      title: 'Studio Formulation',
      type: 'image',
      src: product.image,
      tag: '01 // STUDIO BOTTLE',
      caption: `${product.name} — ${product.size} in precision packaging`,
    },
    {
      id: 'texture-matrix',
      title: 'Active Texture',
      type: 'image',
      src: '/stock-skincare-texture.jpg',
      tag: '02 // TEXTURE MATRIX',
      caption: 'Rapid-absorption biocompatible fluid vehicle · Zero residue',
    },
    {
      id: 'lab-synthesis',
      title: 'Formulation Synthesis',
      type: 'image',
      src: '/myrkls-sec4-incarnation-lab.webp',
      tag: '03 // SYNTHESIS',
      caption: 'Biocatalytic clean formulation synthesis',
    },
    {
      id: 'dermal-glow',
      title: 'Clinical Outcome',
      type: 'image',
      src: '/stock-natural-skin.jpg',
      tag: '04 // DERMAL OUTCOME',
      caption: 'Visible cellular renewal & lipid barrier reinforcement',
    },
  ];

  const currentMedia = mediaGallery[activeMediaIndex];

  // Button 1: ADD TO CART +
  const handleAddToCartClick = () => {
    setIsAdded(true);
    const finalSize = selectedSize || product.size;
    if (onAddToCart) {
      onAddToCart(product.id, finalSize);
    } else {
      addToCart(product.id, finalSize, 1, true);
    }
    openCart();
    setTimeout(() => {
      setIsAdded(false);
    }, 2200);
  };

  // Button 2: SHOP NOW → (Adds to checkout order without duplicate, closes cart drawer, navigates directly to checkout)
  const handleShopNow = () => {
    const finalSize = selectedSize || product.size;
    const itemId = `${product.id.toLowerCase()}-${finalSize}`;
    const alreadyInCart = items.some((it) => it.id === itemId);
    if (!alreadyInCart) {
      addToCart(product.id, finalSize, 1, false);
    }
    closeCart();
    if (onNavigateCheckout) {
      onNavigateCheckout();
    } else {
      window.location.hash = '#checkout';
    }
  };

  return (
    <section className="relative w-full bg-[#FAF9F7] text-[#133429] border-b border-[#DDD8D0]">
      {/* ======================================================== */}
      {/* 1. TOP ARCHITECTURAL BREADCRUMB & RETURN BAR              */}
      {/* ======================================================== */}
      <div className="w-full bg-[#FAF9F7] border-b border-[#DDD8D0] sticky top-[68px] sm:top-[76px] md:top-[86px] z-30 backdrop-blur-md bg-[#FAF9F7]/95">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between text-[11px] font-sans font-medium">
          
          {/* Left: Direct Return to Collection */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCollection || onBackToHome}
              className="group flex items-center gap-2 text-[#133429] hover:text-[#FF5A1F] transition-colors font-semibold uppercase cursor-pointer"
            >
              <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Collection</span>
            </button>

            <span className="text-[#DDD8D0] hidden sm:inline">|</span>

            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-[#7A857E] uppercase text-[10.5px]">
              <button
                type="button"
                onClick={onBackToHome}
                className="hover:text-[#133429] transition-colors cursor-pointer"
              >
                Home
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={onBackToCollection}
                className="hover:text-[#133429] transition-colors cursor-pointer"
              >
                Products
              </button>
              <span>/</span>
              <span className="text-[#133429] font-bold">{product.name}</span>
            </nav>
          </div>

          {/* Right: Clean Formulation Status */}
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-[#7A857E]">
            <span className="w-1.5 h-1.5 bg-[#133429] rounded-full" />
            <span>Official Formulation</span>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MASTER 2-COLUMN SECTION 1 HERO STAGE                   */}
      {/* ======================================================== */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ------------------------------------------------------ */}
          {/* LEFT: CINEMATIC VISUAL SHOWCASE & INTERACTIVE GALLERY  */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-7 flex flex-col gap-4 sticky top-[140px]">
            
            {/* Master Photographic Frame */}
            <div className="relative w-full aspect-[4/5] bg-[#0A1710] border border-[#DDD8D0] rounded-none overflow-hidden group select-none shadow-[0_12px_40px_rgba(7,19,11,0.06)]">
              
              {/* Product Visual */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMedia.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full relative cursor-zoom-in"
                  onClick={() => setIsZoomed(true)}
                >
                  <img
                    src={currentMedia.src}
                    alt={currentMedia.caption}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="eager"
                    decoding="async"
                  />

                  {/* Cinematic subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* Top-Left Floating HUD Badge */}
              <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2 pointer-events-none">
                <div className="bg-black/85 backdrop-blur-md text-white text-[10px] font-bold tracking-[0.16em] uppercase px-3 py-1.5 rounded-none shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF5A1F] rounded-full" />
                  <span>{currentMedia.tag}</span>
                </div>
              </div>

              {/* Top-Right Wishlist Button & Zoom Trigger */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  aria-label="Inspect formulation full screen"
                  className="w-9 h-9 bg-black/75 hover:bg-black text-white rounded-none flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-sm"
                >
                  <Maximize2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Save to private ritual registry"
                  className="w-9 h-9 bg-white/90 hover:bg-white text-[#133429] rounded-none flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <Heart
                    size={16}
                    className={`transition-colors ${
                      isWishlisted ? 'fill-[#FF5A1F] text-[#FF5A1F]' : 'text-[#133429]'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Information Overlay */}
              <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between text-white pointer-events-none">
                <p className="text-[12px] font-medium text-white/90 drop-shadow-md max-w-[70%] truncate">
                  {currentMedia.caption}
                </p>
                <span className="text-[11px] font-bold tracking-widest text-[#A5CBAE] uppercase bg-black/60 px-2 py-0.5 backdrop-blur-md">
                  {product.size}
                </span>
              </div>

            </div>

            {/* 4 Multi-View Thumbnail Trackers */}
            <div className="grid grid-cols-4 gap-3 w-full">
              {mediaGallery.map((m, index) => {
                const isActive = activeMediaIndex === index;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMediaIndex(index)}
                    className={`group relative text-left border p-2 bg-white rounded-none transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'border-[#133429] shadow-sm ring-1 ring-[#133429]'
                        : 'border-[#DDD8D0] hover:border-[#133429]/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Thumbnail Photo */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#ECE8E1] mb-2">
                      <img
                        src={m.src}
                        alt={m.title}
                        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-[#FF5A1F]/15 pointer-events-none" />
                      )}
                    </div>

                    {/* Label */}
                    <span className={`text-[10px] uppercase font-bold tracking-wider block truncate ${
                      isActive ? 'text-[#FF5A1F]' : 'text-[#133429]'
                    }`}>
                      {m.title}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* ------------------------------------------------------ */}
          {/* RIGHT: MINIMAL, MODERN & SCIENTIFIC COMMERCE PANEL     */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            {/* 1. PRODUCT CATEGORY */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 bg-[#FF5A1F] rounded-full" />
              <span className="text-[11px] font-sans font-bold tracking-[0.16em] uppercase text-[#FF5A1F]">
                {config.category}
              </span>
            </div>

            {/* 2. PRODUCT NAME */}
            <h1 className="text-[40px] sm:text-[48px] xl:text-[54px] font-bold font-['Syne',sans-serif] tracking-tight leading-[1.02] text-[#133429] uppercase">
              {config.name}
            </h1>

            {/* 3. SHORT, CUSTOMER-FRIENDLY BENEFIT DESCRIPTION */}
            <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-[#4F6357] font-normal leading-relaxed">
              {config.shortDescription}
            </p>

            {/* 4. ACTUAL PRICE AND GENUINE OFFER */}
            <div className="mt-5 py-5 border-y border-[#DDD8D0] flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-[32px] sm:text-[36px] font-bold font-sans text-[#133429] tracking-tight">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[16px] font-sans line-through text-[#9E9B93]">
                    {product.originalPrice}
                  </span>
                )}
                {product.discount && (
                  <span className="px-2.5 py-0.5 bg-[#FF5A1F] text-white text-[11px] font-bold uppercase tracking-wider rounded-none">
                    {product.discount}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#133429] block">
                  {product.size}
                </span>
                <span className="text-[10px] text-[#7A857E] block">
                  Inclusive of all taxes
                </span>
              </div>
            </div>

            {/* 5. THE SCIENCE INSIDE — 4–6 KEY INGREDIENTS WITH SHORT BENEFITS */}
            <div className="pt-6">
              <div className="flex items-center justify-between border-b border-[#DDD8D0] pb-2 mb-3">
                <span className="text-[12px] font-sans uppercase font-bold tracking-[0.12em] text-[#133429]">
                  THE SCIENCE INSIDE
                </span>
                <span className="text-[10.5px] text-[#7A857E] uppercase tracking-wider">
                  {config.ingredients.length} Key Actives
                </span>
              </div>

              <div className="p-3.5 bg-white border border-[#DDD8D0] rounded-none">
                <div className="space-y-2 text-[12px]">
                  {config.ingredients.map((ing) => (
                    <div
                      key={ing.name}
                      className="flex items-start justify-between gap-3 pb-2 border-b border-[#F2EEE5] last:border-0 last:pb-0"
                    >
                      <div className="pr-2">
                        <span className="font-bold text-[#133429] block text-[13px]">
                          {ing.name}
                        </span>
                        <span className="text-[11.5px] text-[#5A6660] leading-snug">
                          {ing.role}
                        </span>
                      </div>
                      {ing.percentage && (
                        <span className="text-[11.5px] font-bold text-[#FF5A1F] bg-[#FAF9F7] px-2.5 py-0.5 border border-[#DDD8D0] shrink-0">
                          {ing.percentage}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. PRODUCT SIZE / QUANTITY SELECTION */}
            <div className="mt-5 mb-1">
              <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.14em] text-[#7A857E] block mb-2">
                CHOOSE YOUR QUANTITY
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSize(product.size)}
                  className="h-11 px-3.5 text-[11.5px] font-sans font-semibold tracking-wider uppercase border transition-all cursor-pointer rounded-none flex items-center justify-between bg-[#111111] text-white border-[#111111] shadow-xs"
                >
                  <span>{config.sizeLabel}</span>
                  <span className="text-[#FF5A1F] font-bold">
                    {product.price}
                  </span>
                </button>
              </div>
            </div>

            {/* 7. TWO SHOPPING BUTTONS — SIDE BY SIDE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* Button 1: ADD TO CART + */}
              <button
                type="button"
                onClick={handleAddToCartClick}
                className={`w-full h-13 sm:h-14 text-[12px] sm:text-[12.5px] font-sans uppercase tracking-[0.14em] font-bold transition-all duration-200 cursor-pointer rounded-none flex items-center justify-center gap-2 border border-[#111111] ${
                  isAdded
                    ? 'bg-[#111111] text-[#FF5A1F] border-[#FF5A1F]/40'
                    : 'bg-white hover:bg-[#FF5A2A] hover:border-[#FF5A2A] text-[#111111] hover:text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    <span>ADDED TO CART</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    <span>ADD TO CART +</span>
                  </>
                )}
              </button>

              {/* Button 2: SHOP NOW → */}
              <button
                type="button"
                onClick={handleShopNow}
                className="w-full h-13 sm:h-14 text-[12px] sm:text-[12.5px] font-sans uppercase tracking-[0.14em] font-bold transition-all duration-200 cursor-pointer rounded-none flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#FF5A2A] text-white shadow-md group"
              >
                <span>SHOP NOW</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>

            {/* 8. BEST FOR — 3–4 RELEVANT SKIN CONCERNS */}
            <div className="mt-6 pt-5 border-t border-[#DDD8D0]">
              <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.14em] text-[#133429] block mb-2.5">
                BEST FOR
              </span>
              <div className="flex flex-wrap gap-1.5">
                {config.bestFor.map((concern) => (
                  <span
                    key={concern}
                    className="text-[11px] font-sans font-medium text-[#2A3B30] bg-white border border-[#DDD8D0] px-2.5 py-1 rounded-none"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>

            {/* Teaser Indicator to Section 2 */}
            <div className="mt-8 pt-4 border-t border-[#DDD8D0]">
              <button
                type="button"
                onClick={onProceedToSec2}
                className="group w-full py-2.5 flex items-center justify-between text-[11px] font-sans font-semibold tracking-[0.12em] uppercase text-[#7A857E] hover:text-[#FF5A1F] transition-colors cursor-pointer"
              >
                <span>SECTION 02: MOLECULAR PATHWAYS & BIOCHEMICAL STUDIES</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FULL-SCREEN LIGHTBOX ZOOM MODAL                        */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 select-none"
          >
            {/* Top Bar inside Modal */}
            <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto text-white">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold tracking-widest text-[#FF5A1F] uppercase">
                  {product.name}
                </span>
                <span className="text-white/40">/</span>
                <span className="text-[12px] font-medium text-white/80">
                  {currentMedia.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                aria-label="Close high-resolution zoom"
                className="w-10 h-10 border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer rounded-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Central High-Res Showcase */}
            <div className="flex-1 w-full max-w-[900px] max-h-[75vh] mx-auto my-auto flex items-center justify-center overflow-hidden">
              <img
                src={currentMedia.src}
                alt={currentMedia.caption}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Bottom Controls inside Modal */}
            <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between text-white/70 text-[11.5px]">
              <span>{currentMedia.caption}</span>
              <div className="flex items-center gap-2">
                {mediaGallery.map((m, idx) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`h-8 px-3 text-[11px] font-semibold uppercase tracking-wider border rounded-none transition-colors cursor-pointer ${
                      activeMediaIndex === idx
                        ? 'bg-white text-black border-white'
                        : 'border-white/20 text-white/70 hover:border-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MyrklsProductHeroSection;
