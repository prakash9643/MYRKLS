import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ArrowRight, User, ChevronDown, Sparkles, Menu, X, ChevronRight } from 'lucide-react';
import { MyrklsAuthModal } from './MyrklsAuthModal';
import { MyrklsSearchModal } from './MyrklsSearchModal';
import { useCart } from '../context/MyrklsCartContext';
import { useAuth } from '../context/MyrklsAuthContext';

interface ShopCategory {
  id: string;
  categoryKey: string;
  number: string;
  title: string;
  subtitle: string;
  products: string;
  badge: string;
  image: string;
}

const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 'serums',
    categoryKey: 'serums',
    number: '01',
    title: 'SERUMS',
    subtitle: 'Targeted care for your skin concerns.',
    products: 'VISION™, INCARNATION™, REBIRTH™',
    badge: '3 PRODUCTS',
    image: '/myrkls-prod-incarnation-dew.webp',
  },
  {
    id: 'moisturizers',
    categoryKey: 'moisturizers',
    number: '02',
    title: 'MOISTURIZERS',
    subtitle: 'Hydration, nourishment & skin barrier care.',
    products: 'ETERNITY™, RESTORATION™',
    badge: '2 PRODUCTS',
    image: '/myrkls-prod-restoration-model.webp',
  },
  {
    id: 'cleansers',
    categoryKey: 'cleansers',
    number: '03',
    title: 'CLEANSERS',
    subtitle: 'Your first step to fresh, clean skin.',
    products: 'AWAKENING™',
    badge: '1 PRODUCT',
    image: '/myrkls-prod-awakening-dew.webp',
  },
  {
    id: 'sunscreen',
    categoryKey: 'sunscreen',
    number: '04',
    title: 'SUNSCREEN',
    subtitle: 'Everyday broad-spectrum sun protection.',
    products: 'SENTINEL™',
    badge: '1 PRODUCT',
    image: '/myrkls-prod-sentinel-model.webp',
  },
];

interface MyrklsHeaderProps {
  onNavigateViewAll?: (category?: string) => void;
  onNavigateHome?: () => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  cartCount?: number;
}

export const MyrklsHeader: React.FC<MyrklsHeaderProps> = ({
  onNavigateViewAll,
  onNavigateHome,
  onNavigateProduct,
  onNavigateAccount,
  cartCount = 0,
}) => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileShopExpanded, setIsMobileShopExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openCart, totalCount: contextTotalCount } = useCart();
  const displayCartCount = cartCount > 0 ? cartCount : contextTotalCount;
  const shopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      if (onNavigateAccount) {
        onNavigateAccount();
      } else {
        window.location.hash = '#account';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setAuthMode('login');
      setIsAuthOpen(true);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    if (onNavigateProduct) {
      onNavigateProduct(productId);
    } else {
      window.location.hash = `#product/${productId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Track scroll position for subtle elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile navigation drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  // Handle Escape key to close mega menu and mobile nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsShopMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    };
  }, []);

  const handleShopMouseEnter = () => {
    if (shopTimeoutRef.current) {
      clearTimeout(shopTimeoutRef.current);
      shopTimeoutRef.current = null;
    }
    setIsShopMenuOpen(true);
  };

  const handleShopMouseLeave = () => {
    if (shopTimeoutRef.current) {
      clearTimeout(shopTimeoutRef.current);
    }
    shopTimeoutRef.current = setTimeout(() => {
      setIsShopMenuOpen(false);
    }, 200);
  };

  const handleCategoryClick = (categoryKey: string) => {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setIsShopMenuOpen(false);
    if (onNavigateViewAll) {
      onNavigateViewAll(categoryKey);
    } else {
      window.location.hash = `#collection/${categoryKey.toLowerCase()}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMobileNavClick = (href: string) => {
    setIsMobileNavOpen(false);
    const targetEl = document.querySelector(href);
    if (!targetEl) {
      if (onNavigateHome) {
        onNavigateHome();
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* CINEMATIC STICKY HEADER BAR                              */}
      {/* ======================================================== */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF9F7]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-b border-[#E8E5E2]/80'
            : 'bg-[#FAF9F7] border-b border-transparent'
        }`}
      >
        <div className="w-full max-w-[1360px] mx-auto h-[68px] sm:h-[72px] lg:h-[86px] px-4 sm:px-6 md:px-12 flex items-center justify-between">
          
          {/* Left: Mobile Hamburger Toggle + MYRKLS official black retina logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Mobile Hamburger Menu Button (lg:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open mobile navigation menu"
              className="lg:hidden w-10 h-10 -ml-1 flex items-center justify-center text-[#1C1C1C] hover:text-[#FF5A1F] active:scale-95 transition-all cursor-pointer"
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>

            {/* MYRKLS official black retina logo */}
            <a
              href="/"
              onClick={(e) => {
                if (onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                }
              }}
              aria-label="MYRKLS Home"
              className="flex items-center select-none group py-1 cursor-pointer"
            >
              <img
                src="/myrkls-logo-black-retina.png"
                alt="MYRKLS Global Science Visible Results Logo"
                className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                loading="eager"
                decoding="async"
              />
            </a>
          </div>

          {/* Center: Cinematic Floating Navigation Capsule (Desktop Only) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-7 px-7 py-2 border border-[#E2DFD8] bg-white/70 backdrop-blur-md rounded-none shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          >
            {/* Shop item with hover trigger and Chevron */}
            <div
              onMouseEnter={handleShopMouseEnter}
              onMouseLeave={handleShopMouseLeave}
              className="relative py-1"
            >
              <button
                type="button"
                onClick={() => setIsShopMenuOpen((prev) => !prev)}
                className={`relative text-[12px] font-sans uppercase tracking-[0.08em] transition-colors py-0.5 flex items-center gap-1.5 group select-none font-semibold cursor-pointer ${
                  isShopMenuOpen ? 'text-[#FF5A1F]' : 'text-[#2A3B30] hover:text-[#FF5A1F]'
                }`}
              >
                <span>Shop</span>
                <ChevronDown
                  size={11}
                  strokeWidth={2}
                  className={`transition-transform duration-250 ${
                    isShopMenuOpen ? 'rotate-180 text-[#FF5A1F]' : 'text-[#2A3B30]/60 group-hover:text-[#FF5A1F]'
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] bg-[#FF5A1F] transition-all duration-200 ${
                    isShopMenuOpen ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            </div>

            {[
              { name: 'Our Science', href: '#our-formulation-philosophy' },
              { name: 'Innovations', href: '#featured-innovation' },
              { name: 'About Us', href: '#about-us' },
              { name: 'Contact Us', href: '#contact-us' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (onNavigateHome) {
                    const targetEl = document.querySelector(link.href);
                    if (!targetEl) {
                      e.preventDefault();
                      onNavigateHome();
                      setTimeout(() => {
                        const el = document.querySelector(link.href);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 120);
                    }
                  }
                }}
                onMouseEnter={handleShopMouseLeave}
                className="relative text-[12px] font-sans uppercase tracking-[0.08em] text-[#2A3B30] hover:text-[#FF5A1F] transition-colors py-1 group select-none font-semibold"
              >
                <span>{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#FF5A1F] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              type="button"
              className="w-10 h-10 flex items-center justify-center text-[#1C1C1C] hover:text-[#FF5A1F] transition-colors cursor-pointer"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* User Account / Login Button (Desktop only) */}
            <button
              onClick={handleAccountClick}
              aria-label="Account Login or Registration"
              type="button"
              className="hidden lg:flex w-9 h-9 items-center justify-center text-[#1C1C1C] hover:text-[#FF5A1F] transition-colors cursor-pointer relative"
            >
              <User size={18} strokeWidth={1.5} />
              {isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A1F] rounded-full" />
              )}
            </button>

            {/* Shopping Bag Icon with dynamic live badge */}
            <button
              onClick={openCart}
              aria-label={`Shopping bag (${displayCartCount} items)`}
              type="button"
              className="w-10 h-10 flex items-center justify-center text-[#1C1C1C] hover:text-[#FF5A1F] transition-colors relative cursor-pointer"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {displayCartCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-[#FF5A1F] text-white text-[9.5px] font-bold font-sans flex items-center justify-center rounded-none shadow-xs">
                  {displayCartCount}
                </span>
              ) : (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF5A1F] rounded-full" />
              )}
            </button>

          </div>
        </div>

        {/* ======================================================== */}
        {/* CINEMATIC CATEGORY MEGA MENU (DROPDOWN ON SHOP HOVER)    */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isShopMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={handleShopMouseEnter}
              onMouseLeave={handleShopMouseLeave}
              className="absolute top-full left-0 right-0 w-full bg-[#FAF9F7] border-b border-[#DDD8D0] shadow-[0_32px_80px_rgba(7,19,11,0.16)] z-40 overflow-hidden"
            >
              {/* Top Hairline Gradient Accent */}
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF5A1F] to-transparent opacity-85" />

              <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-12 py-7 sm:py-8">
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DDD8D0] mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-[#FF5A1F] rounded-full animate-pulse" />
                    <span className="text-[11px] font-sans uppercase tracking-[0.14em] text-[#133429] font-bold">
                      SHOP BY CATEGORY
                    </span>
                  </div>
                </div>

                {/* 12-Column Grid: 9 cols Category Cards + 3 cols Curated Suite */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Categories Grid (9 cols on lg, 8 on md) */}
                  <div className="md:col-span-8 lg:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {SHOP_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.categoryKey)}
                        className="group text-left border border-[#DDD8D0] hover:border-[#133429] bg-white rounded-none overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-[0_8px_24px_rgba(7,19,11,0.06)]"
                      >
                        {/* Photo Container */}
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#ECE8E1]">
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-108"
                            loading="lazy"
                            decoding="async"
                          />
                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                            <span className="text-[9px] font-sans uppercase tracking-[0.08em] font-bold px-1.5 py-0.5 bg-[#FAF9F7]/95 text-[#133429] border border-[#DDD8D0] backdrop-blur-xs">
                              {cat.badge}
                            </span>
                            <span className="text-[10px] font-sans text-[#5A6660] bg-[#FAF9F7]/90 px-1.5 py-0.5 font-bold">
                              {cat.number}
                            </span>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Content Box */}
                        <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-[14px] font-bold text-[#133429] group-hover:text-[#FF5A1F] font-['Syne',sans-serif] tracking-tight transition-colors">
                                <span className="font-mono text-[#7A857E] mr-1.5">{cat.number} —</span>
                                <span>{cat.title}</span>
                              </h3>
                              <ArrowRight
                                size={13}
                                className="text-[#133429]/40 group-hover:text-[#FF5A1F] transition-all duration-200 group-hover:translate-x-1 shrink-0"
                              />
                            </div>
                            <p className="text-[11px] text-[#5A6660] font-sans mt-1 line-clamp-2 leading-relaxed">
                              {cat.subtitle}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-[#F0ECE6] flex items-center justify-between text-[11px] font-sans font-medium text-[#7A857E]">
                            <span className="text-[#133429] font-medium group-hover:text-[#FF5A1F] transition-colors truncate">
                              {cat.products}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Right Featured Product Card */}
                  <div
                    onClick={() => {
                      if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
                      setIsShopMenuOpen(false);
                      if (onNavigateProduct) {
                        onNavigateProduct('incarnation');
                      } else {
                        window.location.hash = '#product/incarnation';
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="md:col-span-4 lg:col-span-3 group relative border border-[#133429] bg-[#133429] text-white p-4 sm:p-5 rounded-none flex flex-col justify-between overflow-hidden cursor-pointer shadow-sm"
                  >
                    {/* Ambient backlight */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF5A1F]/20 rounded-full blur-2xl pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-[#FF5A1F] flex items-center gap-1">
                          <Sparkles size={11} className="text-[#FF5A1F]" />
                          FEATURED PRODUCT
                        </span>
                        <span className="text-[10px] font-sans text-white bg-white/15 px-2 py-0.5 uppercase tracking-[0.08em] font-bold">
                          18% OFF
                        </span>
                      </div>

                      <div className="relative w-full h-28 sm:h-32 overflow-hidden mb-3 bg-[#07130B] border border-white/10">
                        <img
                          src="/myrkls-sec4-incarnation-lab.webp"
                          alt="MYRKLS INCARNATION Retinal Skin Renewal Serum"
                          className="w-full h-full object-cover object-center transition-transform duration-600 ease-out group-hover:scale-106"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#133429]/80 via-transparent to-transparent pointer-events-none" />
                      </div>

                      <h3 className="text-[15px] font-bold text-white group-hover:text-[#FF5A1F] font-['Syne',sans-serif] tracking-tight transition-colors">
                        INCARNATION™
                      </h3>
                      <span className="text-[11px] font-sans text-[#A5CBAE] font-medium block mt-0.5">
                        Retinal Skin Renewal Serum
                      </span>
                      <p className="text-[11.5px] text-[#C5D3CA] font-sans mt-1.5 line-clamp-2 leading-relaxed">
                        Your nighttime essential for smoother-looking skin, fine line care and visible renewal.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[15px] font-bold font-sans text-white">₹1,499</span>
                          <span className="text-[12px] font-sans line-through text-white/40">₹1,799</span>
                        </div>
                      </div>

                      <span className="h-8 px-3.5 bg-[#111111] group-hover:bg-[#FF5A2A] text-white text-[11px] font-sans uppercase tracking-[0.08em] font-semibold inline-flex items-center gap-1.5 transition-all rounded-none shadow-xs">
                        <span>SHOP NOW</span>
                        <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer Bar inside Mega Menu */}
                <div className="mt-6 pt-4 border-t border-[#DDD8D0] flex flex-col sm:flex-row items-center justify-end gap-3 text-[11.5px] font-sans text-[#5A6660]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsShopMenuOpen(false);
                      if (onNavigateViewAll) {
                        onNavigateViewAll('ALL');
                      } else {
                        window.location.hash = '#all-products';
                      }
                    }}
                    className="group text-[12px] font-sans font-semibold text-[#133429] hover:text-[#FF5A1F] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>VIEW ALL PRODUCTS (7)</span>
                    <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cinematic Backdrop Overlay for Mega Menu */}
      <AnimatePresence>
        {isShopMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsShopMenuOpen(false)}
            className="fixed inset-0 top-[68px] sm:top-[72px] lg:top-[86px] bg-[#07130B]/25 backdrop-blur-[2px] z-30"
          />
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MOBILE NAVIGATION DRAWER (SLIDING FROM LEFT)            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-[#07130B]/60 backdrop-blur-[3px] z-50 lg:hidden"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed inset-y-0 left-0 w-[86vw] max-w-[340px] bg-[#FAF9F7] z-50 lg:hidden shadow-[12px_0_40px_rgba(0,0,0,0.18)] flex flex-col justify-between border-r border-[#E5E0D8]"
            >
              {/* Drawer Top Header */}
              <div className="h-[68px] sm:h-[72px] px-5 flex items-center justify-between border-b border-[#E8E4DC] shrink-0">
                <a
                  href="/"
                  onClick={(e) => {
                    setIsMobileNavOpen(false);
                    if (onNavigateHome) {
                      e.preventDefault();
                      onNavigateHome();
                    }
                  }}
                  className="flex items-center select-none"
                >
                  <img
                    src="/myrkls-logo-black-retina.png"
                    alt="MYRKLS Logo"
                    className="h-7 w-auto object-contain"
                  />
                </a>

                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 -mr-2 flex items-center justify-center text-[#111111] hover:text-[#FF5A1F] active:scale-95 transition-all cursor-pointer"
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>

              {/* Drawer Scrollable Navigation Links */}
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-[#7A857E] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FF5A1F] rounded-full" />
                  <span>NAVIGATION PROTOCOLS</span>
                </div>

                <nav className="flex flex-col space-y-1">
                  {/* 1. SHOP (Expandable accordion) */}
                  <div className="border-b border-[#EAE6DF] pb-2">
                    <button
                      type="button"
                      onClick={() => setIsMobileShopExpanded(!isMobileShopExpanded)}
                      className="w-full flex items-center justify-between py-3 text-left font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-[11px] font-mono text-[#7A857E] font-medium">01</span>
                        <span>SHOP</span>
                      </span>
                      <ChevronDown
                        size={17}
                        className={`transition-transform duration-250 text-[#7A857E] ${
                          isMobileShopExpanded ? 'rotate-180 text-[#FF5A1F]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isMobileShopExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden bg-[#F2EFE8]/70 border-l-2 border-[#FF5A1F] pl-3.5 pr-2 py-2 mt-1 space-y-1"
                        >
                          {SHOP_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setIsMobileNavOpen(false);
                                handleCategoryClick(cat.categoryKey);
                              }}
                              className="w-full flex items-center justify-between py-2 text-left text-[13px] font-sans font-semibold text-[#2A3B30] hover:text-[#FF5A1F] transition-colors"
                            >
                              <span>{cat.number} — {cat.title}</span>
                              <ArrowRight size={12} className="text-[#888888] opacity-70" />
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              setIsMobileNavOpen(false);
                              if (onNavigateViewAll) {
                                onNavigateViewAll('ALL');
                              } else {
                                window.location.hash = '#all-products';
                              }
                            }}
                            className="w-full pt-2.5 pb-1 border-t border-[#DDD8D0] text-left text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#FF5A1F] hover:underline flex items-center justify-between"
                          >
                            <span>VIEW ALL PRODUCTS (7)</span>
                            <ArrowRight size={12} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. OUR SCIENCE */}
                  <button
                    type="button"
                    onClick={() => handleMobileNavClick('#our-formulation-philosophy')}
                    className="w-full flex items-center justify-between py-3.5 text-left font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors border-b border-[#EAE6DF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-[#7A857E] font-medium">02</span>
                      <span>OUR SCIENCE</span>
                    </span>
                    <ChevronRight size={17} className="text-[#8C9890]" />
                  </button>

                  {/* 3. INNOVATIONS */}
                  <button
                    type="button"
                    onClick={() => handleMobileNavClick('#featured-innovation')}
                    className="w-full flex items-center justify-between py-3.5 text-left font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors border-b border-[#EAE6DF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-[#7A857E] font-medium">03</span>
                      <span>INNOVATIONS</span>
                    </span>
                    <ChevronRight size={17} className="text-[#8C9890]" />
                  </button>

                  {/* 4. ABOUT US */}
                  <button
                    type="button"
                    onClick={() => handleMobileNavClick('#about-us')}
                    className="w-full flex items-center justify-between py-3.5 text-left font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors border-b border-[#EAE6DF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-[#7A857E] font-medium">04</span>
                      <span>ABOUT US</span>
                    </span>
                    <ChevronRight size={17} className="text-[#8C9890]" />
                  </button>

                  {/* 5. CONTACT US */}
                  <button
                    type="button"
                    onClick={() => handleMobileNavClick('#contact-us')}
                    className="w-full flex items-center justify-between py-3.5 text-left font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors border-b border-[#EAE6DF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-[#7A857E] font-medium">05</span>
                      <span>CONTACT US</span>
                    </span>
                    <ChevronRight size={17} className="text-[#8C9890]" />
                  </button>

                  {/* 6. MY ACCOUNT */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      handleAccountClick();
                    }}
                    className="w-full flex items-center justify-between py-3.5 text-left font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors border-b border-[#EAE6DF]"
                  >
                    <span className="flex items-center gap-2.5">
                      <User size={17} strokeWidth={1.75} className="text-[#FF5A1F]" />
                      <span>MY ACCOUNT</span>
                    </span>
                    <ChevronRight size={17} className="text-[#8C9890]" />
                  </button>
                </nav>
              </div>

              {/* Drawer Bottom Bar */}
              <div className="p-5 border-t border-[#E8E4DC] bg-[#F4F1EA]/70 space-y-3 shrink-0">
                <div className="text-[12px] font-sans text-[#5A6660]">
                  <span className="font-bold text-[#133429] block mb-0.5">DIRECT LAB INQUIRIES</span>
                  <a href="mailto:concierge@myrkls.com" className="hover:text-[#FF5A1F] transition-colors font-medium">
                    concierge@myrkls.com
                  </a>
                </div>

                <div className="flex items-center justify-between text-[10.5px] font-sans text-[#7A857E] pt-2 border-t border-[#E5E0D8]">
                  <span>© 2026 MYRKLS Inc.</span>
                  <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#133429]">
                    Global Skin Science
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* CINEMATIC AUTHENTICATION POPUP MODAL                     */}
      {/* ======================================================== */}
      <MyrklsAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          if (onNavigateAccount) {
            onNavigateAccount();
          } else {
            window.location.hash = '#account';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* ======================================================== */}
      {/* PREMIUM PRODUCT SEARCH OVERLAY MODAL                    */}
      {/* ======================================================== */}
      <MyrklsSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />
    </>
  );
};

export default MyrklsHeader;
