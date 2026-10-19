import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, ArrowRight, ShieldCheck, ThumbsUp, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  location: string;
  skinType: string;
  age: string;
  product: 'all' | 'incarnation' | 'sentinel' | 'restoration' | 'awakening';
  productName: string;
  rating: number;
  duration: string;
  title: string;
  content: string;
  helpfulCount: number;
  verified: boolean;
  date: string;
}

const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    author: 'Dr. Ananya S.',
    location: 'Mumbai, IN',
    skinType: 'Reactive / Hyperpigmentation',
    age: '34',
    product: 'incarnation',
    productName: 'INCARNATION™ Retinal Serum',
    rating: 5,
    duration: '6 Weeks Daily PM',
    title: 'Zero purging, 10× the radiance of standard retinol.',
    content:
      'As a clinical dermatologist, I am notoriously skeptical of over-the-counter retinoids. INCARNATION surprised me entirely. The stabilized 0.1% retinaldehyde converted visibly faster than prescription adapalene for post-inflammatory marks, with zero flaking or barrier disruption. My skin texture is uniformly glassy.',
    helpfulCount: 42,
    verified: true,
    date: '2 weeks ago',
  },
  {
    id: 'rev-2',
    author: 'Marcus V.',
    location: 'Berlin, DE',
    skinType: 'Combination / UV-Exposed',
    age: '29',
    product: 'sentinel',
    productName: 'SENTINEL™ Aqua Sunscreen',
    rating: 5,
    duration: '4 Weeks Daily AM',
    title: 'The first SPF 50+ that actually feels like water on bare skin.',
    content:
      'I spend 4+ hours outdoors cycling and have tested dozens of European and Japanese sunscreens. SENTINEL disappears in 10 seconds. No ghost white cast, no stung eyes when sweating, and zero slick shine under direct sun. The in-vivo PA++++ shield gave me zero burning on high UV index days.',
    helpfulCount: 38,
    verified: true,
    date: '3 weeks ago',
  },
  {
    id: 'rev-3',
    author: 'Priya K.',
    location: 'Bangalore, IN',
    skinType: 'Dry / Compromised Lipid Barrier',
    age: '38',
    product: 'restoration',
    productName: 'RESTORATION Pigment Cream',
    rating: 5,
    duration: '8 Weeks Morning & Night',
    title: 'Melted away chronic dullness and stubborn hormonal spots.',
    content:
      'The multi-pathway botanical approach is pure formulation brilliance. Within two weeks of pairing RESTORATION with my routine, stubborn melasma patches on my upper cheekbones began softening into an even, rested glow. It delivers deep lipid moisture without clogging pores.',
    helpfulCount: 29,
    verified: true,
    date: '1 month ago',
  },
  {
    id: 'rev-4',
    author: 'Elena R.',
    location: 'Milan, IT',
    skinType: 'Sensitive / Normal-to-Dry',
    age: '41',
    product: 'awakening',
    productName: 'AWAKENING Gel Cleanser',
    rating: 5,
    duration: '5 Weeks Everyday',
    title: 'Purifies deeply without stripping that vital moisture barrier.',
    content:
      'Most foaming cleansers leave my skin feeling tight like parchment paper. AWAKENING cleanses off sunscreen and urban pollution completely while leaving a soft, pliant hydration veil behind. The green tea amino-surfactant feels like silk.',
    helpfulCount: 19,
    verified: true,
    date: '1 month ago',
  },
  {
    id: 'rev-5',
    author: 'Rohan M.',
    location: 'New Delhi, IN',
    skinType: 'Oily / Enlarged Pores',
    age: '26',
    product: 'incarnation',
    productName: 'INCARNATION™ Retinal Serum',
    rating: 5,
    duration: '10 Weeks Protocol',
    title: 'Congestion vanished within three weeks of cellular turnover.',
    content:
      'My recurring forehead texture and micro-comedones have completely smoothed out. What I appreciate most is the absence of artificial fragrance—everything feels intentional, clinical, and high-precision.',
    helpfulCount: 24,
    verified: true,
    date: '2 months ago',
  },
  {
    id: 'rev-6',
    author: 'Camille L.',
    location: 'Paris, FR',
    skinType: 'Mature / Sun-Stressed',
    age: '47',
    product: 'sentinel',
    productName: 'SENTINEL™ Aqua Sunscreen',
    rating: 5,
    duration: '7 Weeks Consistent Use',
    title: 'Elegant, invisible, and layers perfectly under makeup.',
    content:
      'Zero pilling, zero greasy sheen. SENTINEL gives skin a satin lit-from-within finish that doubles as a primer. It has earned a permanent place in my morning ritual.',
    helpfulCount: 31,
    verified: true,
    date: '2 months ago',
  },
];

type CategoryFilter = 'all' | 'incarnation' | 'sentinel' | 'restoration' | 'awakening';

export const MyrklsReviews: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  const filteredReviews =
    activeFilter === 'all'
      ? REVIEWS_DATA
      : REVIEWS_DATA.filter((r) => r.product === activeFilter);

  // When filter changes, reset slide to 0
  const handleFilterChange = (filter: CategoryFilter) => {
    setActiveFilter(filter);
    setCurrentIndex(0);
  };

  const totalReviews = filteredReviews.length;
  // Maximum scroll step so we don't leave empty space at the end
  const maxIndex = Math.max(0, totalReviews - 1);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const toggleHelpful = (id: string) => {
    setHelpfulLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="clinical-reviews"
      aria-label="MYRKLS Section 08: Verified Clinical Reviews Slider"
      className="w-full bg-[#FAF9F7] text-[#111111] rounded-none select-none border-t border-[#E8E5E0] pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 px-6 sm:px-10 lg:px-16 xl:px-24 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* ======================================================== */}
        {/* TOP EDITORIAL HEADER & QUANTITATIVE METRICS BAR           */}
        {/* ======================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 sm:pb-16 border-b border-[#E8E5E0]">
          
          {/* Left: Heading & Manifesto */}
          <div className="max-w-[720px]">
            <div className="mb-4">
              <span className="text-[11.5px] sm:text-[12px] font-sans tracking-[0.16em] text-[#FF5A1F] uppercase font-bold">
                CLINICAL OBSERVATIONS // 08
              </span>
            </div>

            <h2 className="text-[38px] sm:text-[50px] lg:text-[62px] font-medium tracking-[-0.03em] leading-[1.04] text-[#133429] uppercase">
              PROVEN IN CLINIC.
              <br />
              LOVED IN PRACTICE.
            </h2>

            <p className="text-[16px] sm:text-[17.5px] text-[#4F6357] font-normal leading-relaxed mt-4">
              Documented feedback from 1,280+ verified users across structured 8-week adherence trials. 
              Real biologies, measurable cellular outcomes.
            </p>
          </div>

          {/* Right: Key Quantitative Metrics Box */}
          <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 sm:gap-4 lg:self-end">
            
            {/* Metric 1: Star Rating */}
            <div className="border border-[#E0DCD5] bg-white p-5 sm:p-6 rounded-none flex flex-col justify-between min-w-[160px]">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-[#FF5A1F] text-[#FF5A1F]" />
                ))}
              </div>
              <div className="mt-3">
                <span className="text-[26px] sm:text-[30px] font-bold text-[#133429] tracking-tight">
                  4.9<span className="text-[16px] font-normal text-[#888888]">/5</span>
                </span>
                <p className="text-[10.5px] font-sans uppercase tracking-[0.08em] font-medium text-[#777777] mt-0.5">
                  1,284 Verified Reviews
                </p>
              </div>
            </div>

            {/* Metric 2: Barrier Tolerance */}
            <div className="border border-[#E0DCD5] bg-white p-5 sm:p-6 rounded-none flex flex-col justify-between min-w-[150px]">
              <span className="text-[26px] sm:text-[30px] font-bold text-[#133429] tracking-tight">
                98%
              </span>
              <p className="text-[10.5px] font-sans uppercase tracking-[0.08em] font-medium text-[#777777] mt-0.5 leading-snug">
                Reported Visible Renewal
              </p>
            </div>

            {/* Metric 3: Zero Irritation */}
            <div className="border border-[#E0DCD5] bg-white p-5 sm:p-6 rounded-none flex flex-col justify-between min-w-[150px]">
              <span className="text-[26px] sm:text-[30px] font-bold text-[#FF5A1F] tracking-tight">
                0.0%
              </span>
              <p className="text-[10.5px] font-sans uppercase tracking-[0.08em] font-medium text-[#777777] mt-0.5 leading-snug">
                Erythema Index
              </p>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* FILTER BAR & SLIDER CONTROLS ROW                          */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-8">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-[#777777] mr-2 flex items-center gap-1.5 hidden md:inline-flex">
              <Filter size={13} />
              FILTER:
            </span>

            {[
              { id: 'all', label: 'All Formulations' },
              { id: 'incarnation', label: 'INCARNATION™ Retinal' },
              { id: 'sentinel', label: 'SENTINEL™ Sunscreen' },
              { id: 'restoration', label: 'RESTORATION Cream' },
              { id: 'awakening', label: 'AWAKENING Cleanser' },
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleFilterChange(tab.id as CategoryFilter)}
                  className={`h-10 px-4 sm:px-5 text-[11px] sm:text-[11.5px] font-medium tracking-[0.08em] uppercase rounded-none transition-all duration-200 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                      : 'bg-transparent text-[#111111] border-[#111111] hover:bg-[#FF5A2A] hover:border-[#FF5A2A] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Clean Modern Slider Navigation Buttons & Counter */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* Step Counter */}
            <span className="text-[12px] font-sans font-semibold tracking-wider text-[#777777] uppercase">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalReviews).padStart(2, '0')}
            </span>

            {/* Left / Right Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous review"
                className="w-11 h-11 bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border border-[#111111] hover:border-[#FF5A2A] rounded-none flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
              >
                <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next review"
                className="w-11 h-11 bg-transparent hover:bg-[#FF5A2A] text-[#111111] hover:text-white border border-[#111111] hover:border-[#FF5A2A] rounded-none flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
              >
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* REVIEWS SLIDER TRACK (DRAGGABLE & ANIMATED)              */}
        {/* ======================================================== */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            animate={{
              // Responsive transform: card width + 24px gap
              x: `calc(-${currentIndex} * (min(430px, 100vw - 48px) + 24px))`,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            drag="x"
            dragConstraints={{ left: -2000, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) handleNext();
              else if (info.offset.x > 50) handlePrev();
            }}
            className="flex gap-6 items-stretch w-max cursor-grab active:cursor-grabbing pb-4"
          >
            {filteredReviews.map((rev) => {
              const isLiked = helpfulLiked[rev.id];

              return (
                <div
                  key={rev.id}
                  className="group relative w-[calc(100vw-48px)] sm:w-[380px] lg:w-[420px] shrink-0 bg-white border border-[#E0DCD5] p-7 sm:p-8 rounded-none flex flex-col justify-between transition-all duration-300 hover:border-[#FF5A1F] hover:shadow-[0_14px_40px_rgba(20,40,25,0.08)] select-none"
                >
                  {/* Top hairline orange highlight indicator on card hover */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-[#FF5A1F] transition-colors duration-300" />

                  {/* Card Header & Content */}
                  <div>
                    {/* Top Row: Stars & Product Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-[#FF5A1F] text-[#FF5A1F]" />
                        ))}
                      </div>

                      <span className="text-[10px] font-sans tracking-[0.1em] uppercase text-[#133429] bg-[#F1EFEA] px-2.5 py-1 rounded-none font-semibold">
                        {rev.productName.split(' ')[0]}
                      </span>
                    </div>

                    {/* Review Title */}
                    <h3 className="text-[17px] sm:text-[18px] font-medium text-[#133429] leading-snug tracking-tight">
                      "{rev.title}"
                    </h3>

                    {/* Review Body */}
                    <p className="text-[14px] sm:text-[14.5px] text-[#4F6357] font-normal leading-[1.7] mt-3">
                      {rev.content}
                    </p>
                  </div>

                  {/* Card Footer: Reviewer Metadata & Protocol */}
                  <div className="mt-8 pt-5 border-t border-[#EFECE6] flex flex-col gap-3">
                    
                    {/* Author & Verification */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13.5px] font-semibold text-[#133429]">
                            {rev.author}
                          </span>
                          {rev.verified && (
                            <CheckCircle2 size={13} className="text-[#20382E] fill-[#E7ECE5]" />
                          )}
                        </div>
                        <span className="text-[11.5px] text-[#777777]">
                          {rev.location} · {rev.age} yrs
                        </span>
                      </div>

                      <span className="text-[11px] font-sans text-[#888888]">
                        {rev.date}
                      </span>
                    </div>

                    {/* Skin Profile & Protocol Pill */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-sans text-[#666666]">
                      <span className="text-[#133429] font-medium">
                        {rev.skinType}
                      </span>
                      <span className="text-[#FF5A1F] font-semibold">
                        {rev.duration}
                      </span>
                    </div>

                    {/* Helpful Action */}
                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => toggleHelpful(rev.id)}
                        className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLiked ? 'text-[#FF5A2A] font-semibold' : 'text-[#888888] hover:text-[#FF5A2A]'
                        }`}
                      >
                        <ThumbsUp size={12} className={isLiked ? 'fill-[#FF5A2A]' : ''} />
                        <span>Helpful ({rev.helpfulCount + (isLiked ? 1 : 0)})</span>
                      </button>

                      <span className="text-[#999999] flex items-center gap-1">
                        <ShieldCheck size={12} className="text-[#20382E]" />
                        Verified Purchase
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* SLIDER PROGRESS BAR INDICATOR                            */}
        {/* ======================================================== */}
        <div className="w-full mt-4 flex items-center justify-between gap-4">
          <div className="w-full h-[2px] bg-[#E8E5E0] relative overflow-hidden">
            <motion.div
              className="h-full bg-[#133429]"
              animate={{
                width: `${((currentIndex + 1) / totalReviews) * 100}%`,
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM CALL-TO-ACTION BAR                                 */}
        {/* ======================================================== */}
        <div className="mt-14 sm:mt-16 pt-10 border-t border-[#E8E5E0] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h4 className="text-[18px] sm:text-[20px] font-medium text-[#133429] tracking-tight">
              Ready to begin your biological transformation?
            </h4>
            <p className="text-[13.5px] sm:text-[14.5px] text-[#666666] mt-1">
              Engineered with advanced global actives for visible, biocompatible results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#clinical-serums"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A2A] text-white text-[12px] font-semibold tracking-[0.16em] uppercase rounded-none transition-all duration-300 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
            >
              <span>Explore The Formulations</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MyrklsReviews;
