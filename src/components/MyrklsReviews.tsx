import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  productName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Priya K.',
    productName: 'Pigment Repair Cream',
    rating: 5,
    title: 'Melted away stubborn spots and chronic dullness.',
    content:
      'Within two weeks of using it, stubborn spots on my cheekbones softened into an even, rested glow. It delivers deep moisture without clogging pores.',
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Marcus V.',
    productName: 'Advanced Aqua Sunscreen',
    rating: 5,
    title: 'Feels like water on bare skin with zero white cast.',
    content:
      'Disappears in 10 seconds. No ghost white cast, no stung eyes when sweating, and zero slick shine under direct sun.',
    verified: true,
  },
  {
    id: 'rev-3',
    author: 'Elena R.',
    productName: 'Performance Gel Cleanser',
    rating: 5,
    title: 'Purifies deeply without stripping the moisture barrier.',
    content:
      'Cleanses off sunscreen and urban impurities completely while leaving a soft, pliant hydration veil behind.',
    verified: true,
  },
  {
    id: 'rev-4',
    author: 'Rohan M.',
    productName: 'Skin Renewal Serum',
    rating: 5,
    title: 'Smoothed my uneven skin texture and congestion.',
    content:
      'My recurring forehead texture and roughness smoothed out significantly within three weeks. Gentle, effective, and completely fragrance-free.',
    verified: true,
  },
  {
    id: 'rev-5',
    author: 'Camille L.',
    productName: 'Advanced Aqua Sunscreen',
    rating: 5,
    title: 'Elegant, invisible finish that layers perfectly.',
    content:
      'Zero pilling, zero greasy sheen. Gives skin a satin lit-from-within finish that doubles as a primer and wears comfortably all day.',
    verified: true,
  },
  {
    id: 'rev-6',
    author: 'Ananya S.',
    productName: 'Skin Renewal Serum',
    rating: 5,
    title: 'Visibly faster texture renewal with zero flaking.',
    content:
      'Surpassed my expectations completely. Noticeable improvement in skin radiance and smooth texture with zero flaking or barrier disruption.',
    verified: true,
  },
];

const GAP_DESKTOP = 20;
const GAP_MOBILE = 16;

export const MyrklsReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      if (sliderRef.current) {
        const containerWidth = sliderRef.current.offsetWidth;
        if (desktop) {
          // Exactly 3 cards visible with 2 gaps of 20px
          const calculatedWidth = (containerWidth - GAP_DESKTOP * 2) / 3;
          setCardWidth(Math.floor(calculatedWidth));
        } else {
          // Exactly 1 card visible
          setCardWidth(containerWidth);
        }
      }

      const currentMax = desktop
        ? Math.max(0, REVIEWS_DATA.length - 3)
        : Math.max(0, REVIEWS_DATA.length - 1);
      setCurrentIndex((prev) => Math.min(prev, currentMax));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const totalReviews = REVIEWS_DATA.length;
  const maxIndex = isDesktop ? Math.max(0, totalReviews - 3) : Math.max(0, totalReviews - 1);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const stepDistance = isDesktop ? cardWidth + GAP_DESKTOP : cardWidth + GAP_MOBILE;

  return (
    <section
      id="clinical-reviews"
      aria-label="Customer Reviews"
      className="w-full bg-[#FAF9F7] text-[#111111] rounded-none select-none border-t border-b border-[#E8E5E0] py-14 sm:py-18 lg:py-20 px-6 sm:px-10 lg:px-16 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-[1320px] mx-auto w-full">
        
        {/* ======================================================== */}
        {/* HEADER BLOCK & SLIDER CONTROLS                           */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-[#E8E5E0]">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-[0.2em] text-[#173B2B] uppercase block">
              REAL EXPERIENCES
            </span>
            <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] md:text-[42px] font-bold tracking-tight text-[#133429] uppercase mt-1.5 leading-[1.08]">
              LOVED BY YOUR SKIN.
            </h2>
            <p className="text-[14px] sm:text-[15.5px] text-[#55665C] font-normal mt-1.5 leading-relaxed">
              Discover what customers are saying about MYRKLS.
            </p>
          </div>

          {/* Slider Arrow Controls */}
          <div className="flex items-center gap-2.5 self-start sm:self-end">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous reviews"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border border-[#111111] hover:border-[#FF5A2A] rounded-none flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next reviews"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border border-[#111111] hover:border-[#FF5A2A] rounded-none flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
            >
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COMPACT TESTIMONIAL SLIDER TRACK                         */}
        {/* ======================================================== */}
        <div ref={sliderRef} className="relative w-full overflow-hidden">
          <motion.div
            animate={{
              x: -(currentIndex * stepDistance),
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-stretch w-max"
            style={{
              gap: isDesktop ? `${GAP_DESKTOP}px` : `${GAP_MOBILE}px`,
            }}
          >
            {REVIEWS_DATA.map((rev) => (
              <div
                key={rev.id}
                style={{
                  width: cardWidth > 0 ? `${cardWidth}px` : undefined,
                }}
                className="shrink-0 bg-white border border-[#E0DCD5] hover:border-[#111111] p-6 sm:p-7 rounded-none flex flex-col justify-between transition-all duration-300 select-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <div>
                  {/* Top Row: 5 Stars & Product Tag */}
                  <div className="flex items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-[#FF5A2A] text-[#FF5A2A]" />
                      ))}
                    </div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#173B2B] bg-[#EDF3EF] px-2.5 py-1 rounded-none">
                      {rev.productName}
                    </span>
                  </div>

                  {/* Short Review Headline */}
                  <h3 className="text-[15.5px] sm:text-[16.5px] font-bold text-[#133429] tracking-tight leading-snug line-clamp-1">
                    "{rev.title}"
                  </h3>

                  {/* Review Text (2–3 lines) */}
                  <p className="text-[13px] sm:text-[13.5px] text-[#4F6357] font-normal leading-relaxed mt-2.5 line-clamp-3">
                    {rev.content}
                  </p>
                </div>

                {/* Card Bottom: Reviewer Name & Verified Badge */}
                <div className="mt-6 pt-4 border-t border-[#EFECE6] flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#111111]">
                    {rev.author}
                  </span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-[#666666]">
                      <CheckCircle2 size={13} className="text-[#173B2B] fill-[#E7ECE5]" />
                      <span>Verified Purchase</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE PAGINATION DOTS                                   */}
        {/* ======================================================== */}
        <div className="flex lg:hidden items-center justify-center gap-1.5 mt-6">
          {REVIEWS_DATA.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to review ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${
                currentIndex === idx ? 'w-6 bg-[#133429]' : 'w-1.5 bg-[#D8D3CA]'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default MyrklsReviews;
