import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Film, Play } from 'lucide-react';
import { getProductById } from '../../data/products';
import type { MyrklsProductDetail } from '../../types';

export interface ReelItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  price: string;
  originalPrice?: string;
  image: string;
  fallbackImage?: string;
  videoUrl?: string; // Ready for user to drop in MP4/WebM video
  posterImage?: string;
  reelTag?: string;
  headline?: string;
}

/**
 * Automatically calculates discount percentage from price and originalPrice.
 * If originalPrice is missing or <= price, hasDiscount is false.
 */
export function computeDiscount(
  priceStr: string,
  originalPriceStr?: string
): {
  discountPercent: number;
  discountText: string;
  hasDiscount: boolean;
} {
  if (!originalPriceStr) {
    return { discountPercent: 0, discountText: '', hasDiscount: false };
  }
  const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  const orig = parseInt(originalPriceStr.replace(/[^0-9]/g, ''), 10);
  if (isNaN(price) || isNaN(orig) || orig <= price) {
    return { discountPercent: 0, discountText: '', hasDiscount: false };
  }
  const percent = Math.round(((orig - price) / orig) * 100);
  return {
    discountPercent: percent,
    discountText: `${percent}% OFF`,
    hasDiscount: percent > 0,
  };
}

/**
 * Builds master reel catalog using official MYRKLS product data
 */
export function getMasterReels(): ReelItem[] {
  const getProd = (id: string): MyrklsProductDetail | undefined => getProductById(id);

  const pIncarnation = getProd('incarnation');
  const pSentinel = getProd('sentinel');
  const pAwakening = getProd('awakening');
  const pRestoration = getProd('restoration');
  const pVision = getProd('vision');
  const pRebirth = getProd('rebirth');
  const pEternity = getProd('eternity');

  return [
    {
      id: 'reel-incarnation',
      productId: 'incarnation',
      productName: pIncarnation?.name || 'INCARNATION™',
      category: pIncarnation?.category || 'SERUMS',
      price: pIncarnation?.price || '₹1,499',
      originalPrice: pIncarnation?.originalPrice || '₹1,799',
      image: '/myrkls-hero-incarnation-pristine.webp',
      fallbackImage: '/myrkls-prod-incarnation-dew.webp',
      reelTag: 'NIGHT RITUAL',
      headline: '0.1% Retinal Transformation',
    },
    {
      id: 'reel-sentinel',
      productId: 'sentinel',
      productName: pSentinel?.name || 'SENTINEL™',
      category: pSentinel?.category || 'SUN PROTECTION',
      price: pSentinel?.price || '₹1,399',
      originalPrice: pSentinel?.originalPrice || '₹1,649',
      image: '/myrkls-prod-sentinel-model.webp',
      fallbackImage: '/myrkls-sec6-sentinel-sunscreen.jpg',
      reelTag: 'UV DEFENSE',
      headline: 'Zero White Cast Aqua Fluid',
    },
    {
      id: 'reel-awakening',
      productId: 'awakening',
      productName: pAwakening?.name || 'AWAKENING™',
      category: pAwakening?.category || 'CLEANSERS',
      price: pAwakening?.price || '₹1,299',
      originalPrice: pAwakening?.originalPrice || '₹1,499',
      image: '/myrkls-hero-awakening-pristine.webp',
      fallbackImage: '/myrkls-prod-awakening-dew.webp',
      reelTag: 'STEP 01 WET',
      headline: 'Low-pH Amino Purification',
    },
    {
      id: 'reel-restoration',
      productId: 'restoration',
      productName: pRestoration?.name || 'RESTORATION™',
      category: pRestoration?.category || 'CREAMS',
      price: pRestoration?.price || '₹1,349',
      originalPrice: pRestoration?.originalPrice || '₹1,599',
      image: '/myrkls-prod-restoration-model.webp',
      fallbackImage: '/myrkls-prod-restoration-dark.webp',
      reelTag: 'LIPID SEAL',
      headline: 'Squalane Plumping Cream',
    },
    {
      id: 'reel-vision',
      productId: 'vision',
      productName: pVision?.name || 'VISION™',
      category: pVision?.category || 'SERUMS',
      price: pVision?.price || '₹1,449',
      originalPrice: pVision?.originalPrice || '₹1,799',
      image: '/myrkls-prod-vision-dew.webp',
      fallbackImage: '/myrkls-card-vision.png',
      reelTag: 'TONE CORRECTION',
      headline: 'SymWhite 377 Dark Spot Pathway',
    },
    {
      id: 'reel-rebirth',
      productId: 'rebirth',
      productName: pRebirth?.name || 'REBIRTH™',
      category: pRebirth?.category || 'SERUMS',
      price: pRebirth?.price || '₹1,599',
      originalPrice: pRebirth?.originalPrice || '₹1,899',
      image: '/myrkls-prod-rebirth-dew.webp',
      fallbackImage: '/myrkls-card-rebirth.png',
      reelTag: 'BIOTECH CALM',
      headline: 'Ectoin Extremolyte Recovery',
    },
    {
      id: 'reel-eternity',
      productId: 'eternity',
      productName: pEternity?.name || 'ETERNITY™',
      category: pEternity?.category || 'CREAMS',
      price: pEternity?.price || '₹1,649',
      originalPrice: pEternity?.originalPrice || '₹1,999',
      image: '/myrkls-prod-eternity-dew.webp',
      fallbackImage: '/myrkls-card-eternity.png',
      reelTag: 'LONGEVITY',
      headline: 'European Collagen Peptide Matrix',
    },
  ];
}

/**
 * Individual Reel Card: 9:16 aspect ratio, ready for video replacement
 */
const ReelCard: React.FC<{
  reel: ReelItem;
  onNavigate: (productId: string) => void;
}> = ({ reel, onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Calculate discount automatically
  const discount = computeDiscount(reel.price, reel.originalPrice);

  // IntersectionObserver: Pause when out of viewport, play when in viewport
  useEffect(() => {
    if (!reel.videoUrl || !videoRef.current) return;
    const video = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [reel.videoUrl]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white overflow-hidden rounded-none border border-[#E5E0D8] group select-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* ======================================================== */}
      {/* 1. MEDIA LAYER: EXACT 9:16 ASPECT RATIO (NO CROPPING)    */}
      {/* ======================================================== */}
      <div
        className="relative w-full aspect-[9/16] bg-[#0E1A14] overflow-hidden cursor-pointer shrink-0"
        onClick={togglePlay}
      >
        {reel.videoUrl ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.posterImage || reel.image}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={reel.image}
            alt={reel.productName}
            onError={(e) => {
              const target = e.currentTarget;
              if (reel.fallbackImage && target.src !== reel.fallbackImage) {
                target.src = reel.fallbackImage;
              }
            }}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {/* Subtle top gradient for high badge legibility */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Top Bar: Reel Tag, Discount Badge & Mute Toggle */}
        <div className="absolute top-0 inset-x-0 z-10 p-3 sm:p-3.5 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-black/75 backdrop-blur-md text-white text-[9px] font-sans font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-none border border-white/20 flex items-center gap-1.5">
              <Film size={11} className="text-[#FF5A1F]" />
              {reel.reelTag || 'ACTION'}
            </span>
            {discount.hasDiscount && (
              <span className="bg-[#FF5A1F] text-white text-[9px] font-sans font-bold tracking-[0.14em] uppercase px-2 py-1 rounded-none">
                {discount.discountText}
              </span>
            )}
          </div>

          {reel.videoUrl && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
              className="w-7 h-7 bg-black/75 backdrop-blur-md text-white hover:text-[#FF5A1F] border border-white/20 rounded-none flex items-center justify-center cursor-pointer transition-colors"
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          )}
        </div>

        {/* Play/Pause Overlay indicator when video is paused */}
        {reel.videoUrl && !isPlaying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-12 h-12 rounded-none bg-black/80 border border-white/30 flex items-center justify-center text-white">
              <Play size={20} className="fill-white translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DOCKED COMMERCE DRAWER: PRODUCT, PRICE & SHOP NOW     */}
      {/* ======================================================== */}
      <div className="relative z-10 p-3.5 sm:p-4 bg-white border-t border-[#E5E0D8] flex flex-col justify-between flex-grow">
        <div>
          <span className="text-[9.5px] font-sans font-bold tracking-[0.16em] uppercase text-[#FF5A1F] block mb-0.5 truncate">
            {reel.category}
          </span>
          <button
            type="button"
            onClick={() => onNavigate(reel.productId)}
            className="text-left font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#133429] hover:text-[#FF5A1F] transition-colors truncate block w-full cursor-pointer"
          >
            {reel.productName}
          </button>
        </div>

        {/* Price Line: Offer Price Highlighted + Strikethrough Original Price */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-[16px] font-bold font-sans text-[#133429]">
            {reel.price}
          </span>
          {discount.hasDiscount && (
            <span className="text-[12.5px] font-sans text-[#8C9B93] line-through">
              {reel.originalPrice}
            </span>
          )}
        </div>

        {/* Full-width SHOP NOW -> Button */}
        <button
          type="button"
          onClick={() => onNavigate(reel.productId)}
          className="w-full mt-3 py-2.5 bg-[#111111] hover:bg-[#FF5A2A] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
        >
          SHOP NOW &rarr;
        </button>
      </div>
    </div>
  );
};

export interface MyrklsProductReelsSectionProps {
  productId?: string;
  onNavigateProduct?: (productId: string) => void;
}

export const MyrklsProductReelsSection: React.FC<MyrklsProductReelsSectionProps> = ({
  productId = 'incarnation',
  onNavigateProduct,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Arrange master reels so the current product and its routine partners lead the carousel
  const allReels = getMasterReels();
  const sortedReels = React.useMemo(() => {
    const currentKey = productId.toLowerCase();
    const primary = allReels.filter((r) => r.productId.toLowerCase() === currentKey);
    const others = allReels.filter((r) => r.productId.toLowerCase() !== currentKey);
    return [...primary, ...others];
  }, [productId]);

  const updateScrollButtons = () => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = sliderRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        el.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [sortedReels]);

  const scroll = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement;
    const cardWidth = firstCard ? firstCard.clientWidth + 24 : el.clientWidth / 2;
    // Scroll 1 card on small screen, 2 cards on desktop
    const scrollAmount = window.innerWidth >= 1024 ? cardWidth * 2 : cardWidth;

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleNavigate = (targetProductId: string) => {
    if (onNavigateProduct) {
      onNavigateProduct(targetProductId);
    } else {
      window.location.hash = `#product/${targetProductId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="product-section-reels"
      aria-label="Shop the Reels - Myrkls in Motion"
      className="relative w-full bg-[#FAF9F7] text-[#133429] py-16 sm:py-24 border-b border-[#DDD8D0] select-none"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        {/* ======================================================== */}
        {/* 1. SECTION HEADER: EYEBROW, HEADING & ARROWS             */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 sm:pb-10 border-b border-[#E5E0D8]">
          <div className="max-w-[700px]">
            <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
              06 / MYRKLS IN MOTION
            </span>
            <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold font-['Syne',sans-serif] tracking-tight text-[#133429] uppercase leading-[1.05]">
              SEE IT IN ACTION.
            </h2>
            <p className="mt-3 text-[14px] sm:text-[15px] text-[#5A6660] font-sans leading-relaxed">
              Explore real textures, application protocols, and clinical skin finishes in real time.
            </p>
          </div>

          {/* Navigation Controls: Left & Right Functional Arrows (Sharp Corners, Ivory/Forest Identity) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous reels"
              className={`w-11 h-11 border rounded-none flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? 'border-[#111111] text-[#111111] hover:bg-[#FF5A2A] hover:border-[#FF5A2A] hover:text-white cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]'
                  : 'border-[#DDD8D0] text-[#DDD8D0] opacity-40 cursor-not-allowed'
              }`}
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next reels"
              className={`w-11 h-11 border rounded-none flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? 'border-[#111111] text-[#111111] hover:bg-[#FF5A2A] hover:border-[#FF5A2A] hover:text-white cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]'
                  : 'border-[#DDD8D0] text-[#DDD8D0] opacity-40 cursor-not-allowed'
              }`}
            >
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. REELS CAROUSEL: 4 CARDS PER ROW ON 1440PX DESKTOP     */}
        {/* ======================================================== */}
        <div className="pt-8 sm:pt-10">
          <div
            ref={sliderRef}
            tabIndex={0}
            role="region"
            aria-label="Shoppable video reels carousel"
            className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 focus:outline-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {sortedReels.map((reel) => (
              <div
                key={reel.id}
                className="w-[78vw] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] shrink-0 snap-start"
              >
                <ReelCard reel={reel} onNavigate={handleNavigate} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyrklsProductReelsSection;
