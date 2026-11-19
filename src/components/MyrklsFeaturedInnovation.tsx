import React, { useState } from 'react';
import { ArrowRight, Check, Heart } from 'lucide-react';
import { useCart } from '../context/MyrklsCartContext';
import { useAuth } from '../context/MyrklsAuthContext';

interface MyrklsFeaturedInnovationProps {
  onNavigateProduct?: (productId: string) => void;
}

const HIGHLIGHTS = [
  {
    num: '01',
    title: 'FINE LINES & WRINKLES',
    desc: 'Helps improve the appearance of fine lines and wrinkles.',
  },
  {
    num: '02',
    title: 'FIRMNESS & TEXTURE',
    desc: 'Supports firmer-looking skin and smoother texture.',
  },
  {
    num: '03',
    title: 'SKIN RENEWAL',
    desc: 'Supports natural skin turnover and visible renewal.',
  },
];

const INGREDIENTS = [
  'Stabilized Retinal',
  'Matrixyl® 3000',
  'Collagen Peptide Complex',
  'Niacinamide',
  'Ectoin®',
  'Panthenol',
];

export const MyrklsFeaturedInnovation: React.FC<MyrklsFeaturedInnovationProps> = ({
  onNavigateProduct,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isShopifyCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();

  const isWishlisted = wishlist?.includes('incarnation') ?? false;

  const handleAddToCart = () => {
    if (isShopifyCart) {
      if (onNavigateProduct) {
        onNavigateProduct('incarnation');
      } else {
        window.location.hash = '#product/incarnation';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    setIsAdded(true);
    addToCart('incarnation', '30 mL', 1, true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleNavigateToPdp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateProduct) {
      onNavigateProduct('incarnation');
    } else {
      window.location.hash = '#pdp/incarnation';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="featured-innovation"
      aria-label="MYRKLS Section 04: Featured Innovation - INCARNATION"
      className="w-full bg-[#FAF9F7] text-[#111111] rounded-none select-none border-t border-b border-[#E8E5E0] overflow-hidden"
    >
      {/* Split-Screen Layout: Product Visual Left, Editorial Content Right */}
      <div className="w-full flex flex-col lg:flex-row items-stretch">
        
        {/* ================= LEFT SIDE: Product Visual ================= */}
        <div className="w-full lg:w-1/2 relative bg-[#94A37A] aspect-square lg:aspect-auto lg:h-auto lg:min-h-[580px] flex items-center justify-center overflow-hidden group">
          <img
            src="/myrkls-sec4-incarnation-lab.webp"
            alt="MYRKLS INCARNATION™ Retinal Skin Renewal Serum"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />

          {/* Clean Wishlist Action */}
          <button
            type="button"
            onClick={() => toggleWishlist('incarnation')}
            aria-label="Save INCARNATION to wishlist"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-none bg-white/90 hover:bg-white text-[#111111] flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            <Heart
              size={16}
              strokeWidth={2}
              className={isWishlisted ? 'fill-[#FF5A1F] text-[#FF5A1F]' : 'text-[#111111]'}
            />
          </button>
        </div>

        {/* ================= RIGHT SIDE: Compact Editorial Content ================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-[#FAF9F7] border-t lg:border-t-0 lg:border-l border-[#E8E5E0]">
          
          <div className="space-y-4">
            {/* 1. Header Block: Eyebrow, Heading, Subheading */}
            <div>
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] text-[#173B2B] uppercase block">
                FEATURED INNOVATION
              </span>

              <h2 className="text-[32px] sm:text-[40px] xl:text-[44px] font-normal tracking-[-0.03em] leading-[1.05] text-[#111111] uppercase mt-1.5">
                INCARNATION<span className="text-[20px] sm:text-[24px] align-top text-[#777777]">™</span>
              </h2>

              <p className="text-[14px] sm:text-[16px] font-medium text-[#555555] tracking-tight mt-1">
                Retinal Skin Renewal Serum
              </p>
            </div>

            {/* Description */}
            <p className="text-[13px] sm:text-[14px] text-[#333333] font-light leading-relaxed">
              Advanced retinal and peptide-powered nighttime care for smoother-looking, firmer and visibly renewed skin.
            </p>

            {/* Subtle Divider (Desktop only) */}
            <div className="hidden lg:block w-full h-[1px] bg-[#E8E5E0]" />

            {/* 2. Three Compact Highlights: Desktop only */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {HIGHLIGHTS.map((item) => (
                  <div
                    key={item.num}
                    className="bg-white border border-[#E2DDD5] p-3 rounded-none flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">{item.num} —</span>
                      {item.title}
                    </div>
                    <p className="text-[11.5px] text-[#555555] font-light leading-snug mt-1.5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Divider (Desktop only) */}
            <div className="hidden lg:block w-full h-[1px] bg-[#E8E5E0]" />

            {/* 3. The Science Inside: Desktop only */}
            <div className="hidden lg:block space-y-2">
              <span className="text-[10px] sm:text-[10.5px] font-sans font-bold tracking-[0.16em] text-[#173B2B] uppercase block">
                THE SCIENCE INSIDE
              </span>

              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                {INGREDIENTS.map((ing) => (
                  <div
                    key={ing}
                    className="bg-[#F5F2EB] border border-[#E5E0D8] px-2 py-2 rounded-none flex items-center justify-center text-center"
                  >
                    <span className="text-[11px] sm:text-[11.5px] font-sans font-semibold text-[#111111] leading-tight">
                      {ing}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Lower Portion: Price & Two CTA Buttons */}
          <div className="pt-4 sm:pt-5 space-y-3.5 border-t border-[#E8E5E0] mt-4 sm:mt-5">
            {/* Price Block: Actual catalog price and genuine active offer */}
            <div className="flex items-baseline gap-3">
              <span className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-tight">
                ₹1,499
              </span>
              <span className="text-[14px] text-[#888888] line-through font-normal">
                ₹1,799
              </span>
            </div>

            {/* Two Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Primary: SHOP INCARNATION™ → */}
              <a
                href="#pdp/incarnation"
                onClick={handleNavigateToPdp}
                className="w-full sm:flex-1 h-[48px] sm:h-[50px] bg-[#111111] hover:bg-[#FF5A2A] text-white text-[12px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase transition-all duration-200 flex items-center justify-center gap-2 px-6 shadow-sm cursor-pointer rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
              >
                <span>SHOP INCARNATION™</span>
                <ArrowRight size={15} />
              </a>

              {/* Secondary: ADD TO BAG + */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full sm:flex-1 h-[48px] sm:h-[50px] text-[12px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase transition-all duration-200 flex items-center justify-center gap-2 px-6 border rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2 ${
                  isAdded
                    ? 'bg-[#FF5A2A] text-white border-[#FF5A2A]'
                    : 'bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border-[#111111] hover:border-[#FF5A2A]'
                }`}
              >
                {isShopifyCart ? (
                  <span>SELECT OPTIONS</span>
                ) : isAdded ? (
                  <>
                    <Check size={15} strokeWidth={2.5} />
                    <span>ADDED TO BAG</span>
                  </>
                ) : (
                  <span>ADD TO BAG +</span>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
