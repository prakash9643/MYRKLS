import React, { useState } from 'react';
import { ArrowRight, Check, Heart } from 'lucide-react';
import { useCart } from '../context/MyrklsCartContext';
import { useAuth } from '../context/MyrklsAuthContext';

interface MyrklsFeaturedInnovationProps {
  onNavigateProduct?: (productId: string) => void;
}

export const MyrklsFeaturedInnovation: React.FC<MyrklsFeaturedInnovationProps> = ({
  onNavigateProduct,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();

  const isWishlisted = wishlist?.includes('incarnation') ?? false;

  const handleAddToCart = () => {
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
        
        {/* ================= LEFT SIDE: Large Product Visual ================= */}
        <div className="w-full lg:w-1/2 relative bg-[#94A37A] min-h-[480px] sm:min-h-[580px] lg:min-h-[760px] flex items-center justify-center overflow-hidden group">
          <img
            src="/myrkls-sec4-incarnation-lab.webp"
            alt="MYRKLS INCARNATION™ Retinal Skin Renewal Serum"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />

          {/* Clean Wishlist Action */}
          <button
            type="button"
            onClick={() => toggleWishlist('incarnation')}
            aria-label="Save INCARNATION to wishlist"
            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-none bg-white/90 hover:bg-white text-[#111111] flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            <Heart
              size={16}
              strokeWidth={2}
              className={isWishlisted ? 'fill-[#FF5A1F] text-[#FF5A1F]' : 'text-[#111111]'}
            />
          </button>
        </div>

        {/* ================= RIGHT SIDE: Content in Exact Order ================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-7 sm:p-10 lg:p-12 xl:p-14 bg-[#FAF9F7] border-t lg:border-t-0 lg:border-l border-[#E8E5E0]">
          
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Header Block: Eyebrow, Heading, Subheading */}
            <div>
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] text-[#173B2B] uppercase block">
                FEATURED INNOVATION
              </span>

              <h2 className="text-[36px] sm:text-[44px] xl:text-[48px] font-normal tracking-[-0.03em] leading-[1.04] text-[#111111] uppercase mt-2">
                INCARNATION<span className="text-[22px] sm:text-[26px] align-top text-[#777777]">™</span>
              </h2>

              <p className="text-[15px] sm:text-[17px] font-normal text-[#555555] tracking-tight mt-1.5">
                Retinal Skin Renewal Serum
              </p>
            </div>

            {/* Description */}
            <p className="text-[13.5px] sm:text-[14.5px] text-[#333333] font-light leading-relaxed">
              Your nighttime essential for smoother-looking, renewed skin. Powered by stabilized retinal, advanced peptides and skin-conditioning ingredients.
            </p>

            {/* Subtle Divider */}
            <div className="w-full h-[1px] bg-[#E8E5E0]" />

            {/* 2. Six Benefit Cards — 3×2 Grid */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {/* Benefit Card 01 */}
                <div className="bg-white border border-[#E2DDD5] p-2.5 sm:p-3 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">01 —</span>FINE LINE REDUCTION
                    </div>
                    <span className="text-[10px] font-sans font-medium text-[#173B2B] block mt-0.5 leading-tight">
                      Retinal + Matrixyl® 3000
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] font-light leading-snug mt-1.5">
                    Helps visibly soften the appearance of fine lines.
                  </p>
                </div>

                {/* Benefit Card 02 */}
                <div className="bg-white border border-[#E2DDD5] p-2.5 sm:p-3 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">02 —</span>WRINKLE APPEARANCE
                    </div>
                    <span className="text-[10px] font-sans font-medium text-[#173B2B] block mt-0.5 leading-tight">
                      Retinal + Peptide Complex
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] font-light leading-snug mt-1.5">
                    Targets the appearance of deeper-looking wrinkles.
                  </p>
                </div>

                {/* Benefit Card 03 */}
                <div className="bg-white border border-[#E2DDD5] p-2.5 sm:p-3 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">03 —</span>SKIN FIRMNESS
                    </div>
                    <span className="text-[10px] font-sans font-medium text-[#173B2B] block mt-0.5 leading-tight">
                      Matrixyl® 3000 + Collagen Peptide Complex
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] font-light leading-snug mt-1.5">
                    Supports firmer, smoother-looking skin.
                  </p>
                </div>

                {/* Benefit Card 04 */}
                <div className="bg-white border border-[#E2DDD5] p-2.5 sm:p-3 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">04 —</span>TEXTURE REFINEMENT
                    </div>
                    <span className="text-[10px] font-sans font-medium text-[#173B2B] block mt-0.5 leading-tight">
                      Stabilized Retinal
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] font-light leading-snug mt-1.5">
                    Helps improve uneven texture and roughness.
                  </p>
                </div>

                {/* Benefit Card 05 */}
                <div className="bg-white border border-[#E2DDD5] p-2.5 sm:p-3 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">05 —</span>SKIN CELL TURNOVER
                    </div>
                    <span className="text-[10px] font-sans font-medium text-[#173B2B] block mt-0.5 leading-tight">
                      Stabilized Retinal
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] font-light leading-snug mt-1.5">
                    Supports the skin's natural renewal process.
                  </p>
                </div>

                {/* Benefit Card 06 */}
                <div className="bg-white border border-[#E2DDD5] p-2.5 sm:p-3 rounded-none flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-sans font-bold text-[#111111] uppercase tracking-wide leading-snug">
                      <span className="font-mono text-[#173B2B] mr-1">06 —</span>BARRIER & RECOVERY SUPPORT
                    </div>
                    <span className="text-[10px] font-sans font-medium text-[#173B2B] block mt-0.5 leading-tight">
                      Niacinamide + Ectoin® + Panthenol
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] font-light leading-snug mt-1.5">
                    Helps maintain hydration and skin comfort.
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="w-full h-[1px] bg-[#E8E5E0]" />

            {/* 3. Hero Ingredients: Small heading THE SCIENCE INSIDE + 6 compact highlights in 3×2 grid */}
            <div className="space-y-2.5">
              <span className="text-[10.5px] font-sans font-bold tracking-[0.16em] text-[#173B2B] uppercase block">
                THE SCIENCE INSIDE
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {/* 1. Stabilized Retinal */}
                <div className="bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-2 rounded-none">
                  <span className="text-[12px] font-sans font-bold text-[#111111] block leading-tight">
                    Stabilized Retinal
                  </span>
                  <span className="text-[11px] font-sans text-[#666666] block mt-0.5">
                    Skin Renewal
                  </span>
                </div>

                {/* 2. Matrixyl® 3000 */}
                <div className="bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-2 rounded-none">
                  <span className="text-[12px] font-sans font-bold text-[#111111] block leading-tight">
                    Matrixyl® 3000
                  </span>
                  <span className="text-[11px] font-sans text-[#666666] block mt-0.5">
                    French Peptide Technology
                  </span>
                </div>

                {/* 3. Collagen Peptide Complex */}
                <div className="bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-2 rounded-none">
                  <span className="text-[12px] font-sans font-bold text-[#111111] block leading-tight">
                    Collagen Peptide Complex
                  </span>
                  <span className="text-[11px] font-sans text-[#666666] block mt-0.5">
                    Advanced Peptide Science
                  </span>
                </div>

                {/* 4. Niacinamide */}
                <div className="bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-2 rounded-none">
                  <span className="text-[12px] font-sans font-bold text-[#111111] block leading-tight">
                    Niacinamide
                  </span>
                  <span className="text-[11px] font-sans text-[#666666] block mt-0.5">
                    Barrier & Tone Support
                  </span>
                </div>

                {/* 5. Ectoin® */}
                <div className="bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-2 rounded-none">
                  <span className="text-[12px] font-sans font-bold text-[#111111] block leading-tight">
                    Ectoin®
                  </span>
                  <span className="text-[11px] font-sans text-[#666666] block mt-0.5">
                    Hydration & Skin Comfort
                  </span>
                </div>

                {/* 6. Panthenol */}
                <div className="bg-[#F5F2EB] border border-[#E5E0D8] px-3 py-2 rounded-none">
                  <span className="text-[12px] font-sans font-bold text-[#111111] block leading-tight">
                    Panthenol
                  </span>
                  <span className="text-[11px] font-sans text-[#666666] block mt-0.5">
                    Pro-Vitamin B5 Care
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Lower Portion: Price & Two CTA Buttons */}
          <div className="pt-5 sm:pt-6 space-y-3.5 border-t border-[#E8E5E0] mt-5">
            {/* Price Block: Actual catalog price and genuine active offer */}
            <div className="flex items-baseline gap-3">
              <span className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-tight">
                ₹1,499
              </span>
              <span className="text-[14.5px] text-[#888888] line-through font-normal">
                ₹1,799
              </span>
              <span className="bg-[#FF5A1F] text-white text-[9.5px] font-bold tracking-[0.1em] px-2 py-0.5 uppercase rounded-none">
                18% OFF
              </span>
            </div>

            {/* Two Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Primary: SHOP INCARNATION™ → */}
              <a
                href="#pdp/incarnation"
                onClick={handleNavigateToPdp}
                className="w-full sm:flex-1 h-[52px] bg-[#111111] hover:bg-[#FF5A2A] text-white text-[12px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase transition-all duration-200 flex items-center justify-center gap-2.5 px-6 shadow-sm cursor-pointer rounded-none focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
              >
                <span>SHOP INCARNATION™</span>
                <ArrowRight size={15} />
              </a>

              {/* Secondary: ADD TO BAG + */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full sm:flex-1 h-[52px] text-[12px] sm:text-[12.5px] font-bold tracking-[0.16em] uppercase transition-all duration-200 flex items-center justify-center gap-2 px-6 border rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2 ${
                  isAdded
                    ? 'bg-[#FF5A2A] text-white border-[#FF5A2A]'
                    : 'bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border-[#111111] hover:border-[#FF5A2A]'
                }`}
              >
                {isAdded ? (
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
