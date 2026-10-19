import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MyrklsProductDetail } from '../MyrklsViewAllPage';

export interface MyrklsProductSection2Props {
  product?: MyrklsProductDetail;
  onAddToCart?: (productId: string) => void;
}

interface IngredientCardData {
  id: string;
  number: string;
  name: string;
  technology: string;
  benefit: string;
  image: string;
  fallbackImage: string;
}

const INCARNATION_INGREDIENTS: IngredientCardData[] = [
  {
    id: 'retinal',
    number: '01',
    name: 'Stabilized Retinal',
    technology: 'Vitamin A Science',
    benefit: 'Supports visible skin renewal and smoother-looking texture.',
    image: '/myrkls-ingredient-retinal.webp',
    fallbackImage: '/stock-skincare-texture.jpg',
  },
  {
    id: 'matrixyl',
    number: '02',
    name: 'Matrixyl® 3000',
    technology: 'French Peptide Technology',
    benefit: 'Targets the appearance of fine lines and visible aging.',
    image: '/myrkls-ingredient-matrixyl.webp',
    fallbackImage: '/myrkls-sec4-incarnation-lab.webp',
  },
  {
    id: 'collagen',
    number: '03',
    name: 'Collagen Peptide Complex',
    technology: 'Advanced Peptide Science',
    benefit: 'Complements the skin-conditioning formula.',
    image: '/myrkls-ingredient-collagen.webp',
    fallbackImage: '/stock-skincare-texture.jpg',
  },
  {
    id: 'niacinamide',
    number: '04',
    name: 'Niacinamide',
    technology: 'Barrier & Tone Science',
    benefit: 'Supports the skin barrier and even-looking tone.',
    image: '/myrkls-ingredient-niacinamide.webp',
    fallbackImage: '/stock-laboratory-glass.jpg',
  },
  {
    id: 'ectoin',
    number: '05',
    name: 'Ectoin®',
    technology: 'Extremolyte Technology',
    benefit: 'Supports hydration and skin comfort.',
    image: '/myrkls-ingredient-ectoin.webp',
    fallbackImage: '/section6-hydration-full.webp',
  },
  {
    id: 'panthenol',
    number: '06',
    name: 'Panthenol',
    technology: 'Pro-Vitamin B5 Science',
    benefit: 'Conditions skin and supports moisture retention.',
    image: '/myrkls-ingredient-panthenol.webp',
    fallbackImage: '/section6-hydration-smooth.webp',
  },
];

export const MyrklsProductSection2: React.FC<MyrklsProductSection2Props> = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // Update arrow availability based on scroll position
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate index for active indicator
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).clientWidth + 24
      : 300;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveStep(Math.min(Math.max(index, 0), INCARNATION_INGREDIENTS.length - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard ? firstCard.clientWidth + 24 : el.clientWidth * 0.8;
    const scrollAmount = isDesktop ? el.clientWidth : cardWidth;

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="product-section-2"
      aria-label="Global Active Science"
      className="relative w-full bg-[#FAF9F7] text-[#133429] py-16 sm:py-24 border-b border-[#DDD8D0] select-none"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        
        {/* ======================================================== */}
        {/* 1. SECTION HEADING & CONTROLS                            */}
        {/* ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E5E0D8]">
          <div className="max-w-[760px]">
            {/* Eyebrow Label */}
            <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2.5">
              FORMULATION PHILOSOPHY
            </span>

            {/* Section Heading */}
            <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold font-['Syne',sans-serif] tracking-tight text-[#133429] uppercase leading-[1.05]">
              GLOBAL ACTIVE SCIENCE
            </h2>

            {/* Section Description */}
            <p className="mt-3.5 text-[14.5px] sm:text-[15.5px] text-[#5A6660] font-normal leading-relaxed">
              Advanced retinal technology meets French peptide innovation and skin-supporting actives—thoughtfully combined for visible renewal and everyday skin comfort.
            </p>
          </div>

          {/* Navigation Controls: Left & Right Functional Arrows (NO GREEN BUTTON) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Step Counter Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[11px] font-sans font-semibold tracking-wider text-[#7A857E] border border-[#E5E0D8] bg-white rounded-none">
              <span className="text-[#133429] font-bold">0{activeStep + 1}</span>
              <span>/</span>
              <span>06</span>
            </div>

            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous ingredients"
              className={`w-11 h-11 border border-[#111111] bg-white text-[#111111] rounded-none flex items-center justify-center transition-all duration-200 cursor-pointer ${
                canScrollLeft
                  ? 'hover:bg-[#111111] hover:text-white active:scale-95'
                  : 'opacity-30 cursor-not-allowed border-[#DDD8D0]'
              }`}
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Next ingredients"
              className={`w-11 h-11 border border-[#111111] bg-white text-[#111111] rounded-none flex items-center justify-center transition-all duration-200 cursor-pointer ${
                canScrollRight
                  ? 'hover:bg-[#111111] hover:text-white active:scale-95'
                  : 'opacity-30 cursor-not-allowed border-[#DDD8D0]'
              }`}
            >
              <ArrowRight size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. ONE HORIZONTAL ROW SLIDER (6 INGREDIENT CARDS)        */}
        {/* ======================================================== */}
        <div className="pt-8">
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            role="region"
            aria-label="Six Formulation Active Ingredients"
            className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 focus:outline-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {INCARNATION_INGREDIENTS.map((item) => (
              <div
                key={item.id}
                className="w-[85%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-2*1.5rem)/3)] shrink-0 snap-start flex flex-col bg-white border border-[#E5E0D8] rounded-none overflow-hidden group select-none transition-colors duration-200 hover:border-[#111111]"
              >
                {/* Ingredient Image Box: 1:1 Aspect Ratio */}
                <div className="relative w-full aspect-square bg-[#0A1710] overflow-hidden rounded-none">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== item.fallbackImage) {
                        target.src = item.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                {/* Content Box Below Image */}
                <div className="p-5 sm:p-6 flex flex-col justify-start flex-1 bg-white">
                  {/* Technology Category Label */}
                  <span className="text-[10px] font-sans font-bold tracking-[0.14em] uppercase text-[#FF5A1F] block mb-1.5">
                    {item.technology}
                  </span>

                  {/* Ingredient Name */}
                  <h3 className="text-[18px] sm:text-[20px] font-bold font-['Syne',sans-serif] text-[#111111] tracking-tight leading-snug">
                    {item.name}
                  </h3>

                  {/* Single Short Benefit Description */}
                  <p className="mt-2 text-[13px] sm:text-[13.5px] text-[#5A6660] font-sans leading-relaxed">
                    {item.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile / Tablet Progress Track */}
          <div className="flex items-center justify-center gap-1.5 mt-6 lg:hidden">
            {INCARNATION_INGREDIENTS.map((_, i) => (
              <span
                key={i}
                className={`h-1 transition-all duration-300 rounded-none ${
                  activeStep === i
                    ? 'w-6 bg-[#111111]'
                    : 'w-2 bg-[#DDD8D0]'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default MyrklsProductSection2;
