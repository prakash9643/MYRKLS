import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';

export interface MyrklsOurSciencePageProps {
  onBackToHome: () => void;
  onNavigateViewAll: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateAboutUs?: () => void;
  onNavigateContactUs?: () => void;
}

export const MyrklsOurSciencePage: React.FC<MyrklsOurSciencePageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateAboutUs,
  onNavigateContactUs,
}) => {
  // Smooth scroll handler for Section 01 Hero CTA
  const handleScrollToApproach = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('our-approach');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-[#133429] font-sans antialiased selection:bg-[#173B2B] selection:text-white">
      {/* ======================================================== */}
      {/* SHARED MYRKLS HEADER                                     */}
      {/* ======================================================== */}
      <MyrklsHeader
        onNavigateHome={onBackToHome}
        onNavigateViewAll={onNavigateViewAll}
        onNavigateProduct={onNavigateProduct}
        onNavigateAccount={onNavigateAccount}
        onNavigateAboutUs={onNavigateAboutUs}
        onNavigateContactUs={onNavigateContactUs}
      />

      <main className="w-full">
        {/* ======================================================== */}
        {/* SECTION 01 — EDITORIAL HERO (50/50 SPLIT-SCREEN)         */}
        {/* ======================================================== */}
        <section
          id="section-science-hero"
          aria-label="The Science of Better Skin"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] overflow-hidden"
        >
          <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[520px] lg:min-h-[620px]">
            {/* LEFT: Vertically Centered Editorial Text */}
            <div className="flex flex-col justify-center px-5 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16 lg:py-24">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                MYRKLS / OUR SCIENCE
              </span>

              <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[42px] lg:text-[52px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.06]">
                THE SCIENCE OF<br />BETTER SKIN.
              </h1>

              <p className="mt-4 sm:mt-5 text-[14px] sm:text-[16px] text-[#4A5550] leading-relaxed max-w-[480px]">
                We bring together innovative ingredients from around the world to create thoughtful skincare for everyday skin needs.
              </p>

              <div className="mt-7 sm:mt-8">
                <a
                  href="#our-approach"
                  onClick={handleScrollToApproach}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>DISCOVER OUR APPROACH</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* RIGHT: Large Skincare Science Image (Translucent Green Textures) */}
            <div className="relative w-full h-[280px] sm:h-[340px] lg:h-full min-h-[280px] lg:min-h-[620px] bg-[#E9EDE6]/60 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#E5E0D8]">
              <img
                src="/myrkls-science-hero-droplets.webp"
                alt="Translucent green botanical serum textures with microscopic glass droplet reflections"
                className="w-full h-full object-cover object-center select-none"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 02 — OUR FORMULATION PHILOSOPHY                  */}
        {/* ======================================================== */}
        <section
          id="our-approach"
          aria-label="Our Formulation Philosophy"
          className="w-full bg-[#FFFFFF] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8] scroll-mt-20"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* LEFT: Eyebrow, Heading & Philosophy Intro */}
              <div className="lg:col-span-5">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  OUR APPROACH
                </span>
                <h2 className="font-['Syne',sans-serif] text-[30px] sm:text-[38px] lg:text-[44px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  EVERY INGREDIENT<br />HAS A PURPOSE.
                </h2>
                <p className="mt-4 text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed max-w-[460px]">
                  Good skincare is about more than individual ingredients. It&apos;s about choosing the right combination to support visible results while keeping skin comfort in mind.
                </p>
              </div>

              {/* RIGHT: Three Minimal Numbered Rows with Thin Dividers */}
              <div className="lg:col-span-7 flex flex-col divide-y divide-[#E5E0D8] border-t lg:border-t-0 border-b border-[#E5E0D8]">
                {/* Row 01 */}
                <div className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase shrink-0">
                    01
                  </span>
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold text-[#173B2B] uppercase tracking-tight">
                      TARGETED ACTIVES
                    </h3>
                    <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#55625B] leading-relaxed">
                      Ingredients selected for specific skin concerns.
                    </p>
                  </div>
                </div>

                {/* Row 02 */}
                <div className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase shrink-0">
                    02
                  </span>
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold text-[#173B2B] uppercase tracking-tight">
                      THOUGHTFUL COMBINATIONS
                    </h3>
                    <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#55625B] leading-relaxed">
                      Formulations that bring complementary ingredients together.
                    </p>
                  </div>
                </div>

                {/* Row 03 */}
                <div className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase shrink-0">
                    03
                  </span>
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold text-[#173B2B] uppercase tracking-tight">
                      EVERYDAY SKIN COMFORT
                    </h3>
                    <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#55625B] leading-relaxed">
                      Designed with skin hydration and barrier support in mind.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 03 — GLOBAL INGREDIENT INNOVATION                */}
        {/* ======================================================== */}
        <section
          id="section-global-innovation"
          aria-label="Global Ingredient Innovation"
          className="w-full bg-[#E9EDE6] py-16 sm:py-20 lg:py-24 border-b border-[#DDD8D0]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {/* Header: Centered Eyebrow, Heading & Short Description */}
            <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                GLOBAL INNOVATION
              </span>
              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                GOOD IDEAS COME<br />FROM EVERYWHERE.
              </h2>
              <p className="mt-3.5 text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed">
                Our approach brings together ingredient innovations and botanical knowledge from different parts of the world.
              </p>
            </div>

            {/* 4 Premium Editorial Image Tiles (1 Row on Desktop, 2-Column on Mobile) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* TILE 01 — FRANCE */}
              <div className="group bg-white border border-[#D5DCD0] rounded-none overflow-hidden flex flex-col justify-between shadow-[0_4px_16px_rgba(23,59,43,0.03)] hover:border-[#173B2B]/40 transition-all duration-300">
                <div className="w-full aspect-[4/3] bg-[#F4F6F2] overflow-hidden">
                  <img
                    src="/myrkls-ingredient-matrixyl.webp"
                    alt="European peptide technology research texture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold tracking-tight text-[#173B2B] uppercase">
                      FRANCE
                    </h3>
                    <p className="text-[11.5px] sm:text-[12px] font-sans font-semibold text-[#FF5A1F] mt-1 leading-snug">
                      Advanced peptide technology
                    </p>
                  </div>
                  <p className="text-[12px] sm:text-[12.5px] text-[#55625B] leading-relaxed mt-2.5">
                    Supporting smoother, firmer-looking skin.
                  </p>
                </div>
              </div>

              {/* TILE 02 — GERMANY */}
              <div className="group bg-white border border-[#D5DCD0] rounded-none overflow-hidden flex flex-col justify-between shadow-[0_4px_16px_rgba(23,59,43,0.03)] hover:border-[#173B2B]/40 transition-all duration-300">
                <div className="w-full aspect-[4/3] bg-[#F4F6F2] overflow-hidden">
                  <img
                    src="/stock-skincare-texture.jpg"
                    alt="Translucent brightening serum droplets"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold tracking-tight text-[#173B2B] uppercase">
                      GERMANY
                    </h3>
                    <p className="text-[11.5px] sm:text-[12px] font-sans font-semibold text-[#FF5A1F] mt-1 leading-snug">
                      Brightening ingredient innovation
                    </p>
                  </div>
                  <p className="text-[12px] sm:text-[12.5px] text-[#55625B] leading-relaxed mt-2.5">
                    Supporting a more even-looking skin tone.
                  </p>
                </div>
              </div>

              {/* TILE 03 — KOREA */}
              <div className="group bg-white border border-[#D5DCD0] rounded-none overflow-hidden flex flex-col justify-between shadow-[0_4px_16px_rgba(23,59,43,0.03)] hover:border-[#173B2B]/40 transition-all duration-300">
                <div className="w-full aspect-[4/3] bg-[#F4F6F2] overflow-hidden">
                  <img
                    src="/myrkls-ingredient-ectoin.webp"
                    alt="Biotechnology skin conditioning crystals and fluid"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold tracking-tight text-[#173B2B] uppercase">
                      KOREA
                    </h3>
                    <p className="text-[11.5px] sm:text-[12px] font-sans font-semibold text-[#FF5A1F] mt-1 leading-snug">
                      Modern skincare biotechnology
                    </p>
                  </div>
                  <p className="text-[12px] sm:text-[12.5px] text-[#55625B] leading-relaxed mt-2.5">
                    Exploring ingredients for skin-conditioning care.
                  </p>
                </div>
              </div>

              {/* TILE 04 — INDIA */}
              <div className="group bg-white border border-[#D5DCD0] rounded-none overflow-hidden flex flex-col justify-between shadow-[0_4px_16px_rgba(23,59,43,0.03)] hover:border-[#173B2B]/40 transition-all duration-300">
                <div className="w-full aspect-[4/3] bg-[#F4F6F2] overflow-hidden">
                  <img
                    src="/section3-ginkgo-portrait.jpg"
                    alt="Plant-derived botanical skin care ingredients"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold tracking-tight text-[#173B2B] uppercase">
                      INDIA
                    </h3>
                    <p className="text-[11.5px] sm:text-[12px] font-sans font-semibold text-[#FF5A1F] mt-1 leading-snug">
                      Botanical ingredient knowledge
                    </p>
                  </div>
                  <p className="text-[12px] sm:text-[12.5px] text-[#55625B] leading-relaxed mt-2.5">
                    Thoughtfully selected plant-derived ingredients.
                  </p>
                </div>
              </div>
            </div>

            {/* Sourcing Clarification Note */}
            <div className="mt-10 pt-4 border-t border-[#D5DCD0] text-center">
              <p className="text-[11px] text-[#6B756F] leading-relaxed max-w-[820px] mx-auto">
                These represent ingredient innovation associations from formulation research, not manufacturing origins. Verify supplier provenance before publishing specific sourcing claims.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — INGREDIENTS THAT MATTER                     */}
        {/* ======================================================== */}
        <section
          id="section-ingredients"
          aria-label="Ingredients That Matter"
          className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {/* Header: Left Aligned */}
            <div className="max-w-[620px] mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                INSIDE THE FORMULA
              </span>
              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                POWERFUL INGREDIENTS.<br />CLEAR PURPOSE.
              </h2>
              <p className="mt-3.5 text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed">
                Discover some of the ingredients behind our approach to skincare.
              </p>
            </div>

            {/* 6 Ingredient Cards: 3 Cols on Desktop, 2 Cols on Mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {/* Card 01 — RETINAL */}
              <div className="bg-white border border-[#E5E0D8] p-4 sm:p-6 rounded-none flex flex-col justify-between shadow-[0_2px_10px_rgba(23,59,43,0.02)] hover:border-[#173B2B]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C9890] uppercase">
                      01
                    </span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDD8D0] bg-[#FAF9F7] shrink-0">
                      <img
                        src="/myrkls-ingredient-retinal.webp"
                        alt="Stabilized Retinal"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    RETINAL
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#55625B] leading-relaxed mt-2.5">
                  Supports visible skin renewal and smoother-looking texture.
                </p>
              </div>

              {/* Card 02 — PEPTIDES */}
              <div className="bg-white border border-[#E5E0D8] p-4 sm:p-6 rounded-none flex flex-col justify-between shadow-[0_2px_10px_rgba(23,59,43,0.02)] hover:border-[#173B2B]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C9890] uppercase">
                      02
                    </span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDD8D0] bg-[#FAF9F7] shrink-0">
                      <img
                        src="/myrkls-ingredient-collagen.webp"
                        alt="Peptides"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    PEPTIDES
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#55625B] leading-relaxed mt-2.5">
                  Support the appearance of firmer, smoother skin.
                </p>
              </div>

              {/* Card 03 — NIACINAMIDE */}
              <div className="bg-white border border-[#E5E0D8] p-4 sm:p-6 rounded-none flex flex-col justify-between shadow-[0_2px_10px_rgba(23,59,43,0.02)] hover:border-[#173B2B]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C9890] uppercase">
                      03
                    </span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDD8D0] bg-[#FAF9F7] shrink-0">
                      <img
                        src="/myrkls-ingredient-niacinamide.webp"
                        alt="Niacinamide"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    NIACINAMIDE
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#55625B] leading-relaxed mt-2.5">
                  Supports an even-looking skin tone and skin barrier.
                </p>
              </div>

              {/* Card 04 — ECTOIN® */}
              <div className="bg-white border border-[#E5E0D8] p-4 sm:p-6 rounded-none flex flex-col justify-between shadow-[0_2px_10px_rgba(23,59,43,0.02)] hover:border-[#173B2B]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C9890] uppercase">
                      04
                    </span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDD8D0] bg-[#FAF9F7] shrink-0">
                      <img
                        src="/myrkls-ingredient-ectoin.webp"
                        alt="Ectoin"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    ECTOIN&reg;
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#55625B] leading-relaxed mt-2.5">
                  Helps support hydration and skin comfort.
                </p>
              </div>

              {/* Card 05 — CERAMIDES */}
              <div className="bg-white border border-[#E5E0D8] p-4 sm:p-6 rounded-none flex flex-col justify-between shadow-[0_2px_10px_rgba(23,59,43,0.02)] hover:border-[#173B2B]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C9890] uppercase">
                      05
                    </span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDD8D0] bg-[#FAF9F7] shrink-0">
                      <img
                        src="/myrkls-ingredient-panthenol.webp"
                        alt="Ceramides and Barrier Lipids"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    CERAMIDES
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#55625B] leading-relaxed mt-2.5">
                  Help support the skin&apos;s natural moisture barrier.
                </p>
              </div>

              {/* Card 06 — HYDRATING COMPLEXES */}
              <div className="bg-white border border-[#E5E0D8] p-4 sm:p-6 rounded-none flex flex-col justify-between shadow-[0_2px_10px_rgba(23,59,43,0.02)] hover:border-[#173B2B]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8C9890] uppercase">
                      06
                    </span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#DDD8D0] bg-[#FAF9F7] shrink-0">
                      <img
                        src="/myrkls-droplet-thumb.png"
                        alt="Hydrating Complexes"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[14px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    HYDRATING COMPLEXES
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-[#55625B] leading-relaxed mt-2.5">
                  Help skin feel hydrated, soft and plump.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 05 — FINAL BRAND CTA                             */}
        {/* ======================================================== */}
        <section
          id="section-explore-products"
          aria-label="Explore Our Products"
          className="w-full bg-[#E9EDE6] border-b border-[#DDD8D0] overflow-hidden"
        >
          <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* LEFT: Text & Button */}
            <div className="px-5 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16 lg:py-24">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                THE MYRKLS COLLECTION
              </span>

              <h2 className="font-['Syne',sans-serif] text-[32px] sm:text-[40px] lg:text-[48px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                SCIENCE MEETS<br />YOUR SKIN.
              </h2>

              <p className="mt-4 text-[14px] sm:text-[16px] text-[#4A5550] leading-relaxed max-w-[460px]">
                Explore skincare thoughtfully formulated around your everyday needs.
              </p>

              <div className="mt-7 sm:mt-8">
                <button
                  type="button"
                  onClick={() => onNavigateViewAll('ALL')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2"
                >
                  <span>EXPLORE OUR PRODUCTS</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* RIGHT: Studio Product Collection Image */}
            <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[460px] overflow-hidden border-t lg:border-t-0 lg:border-l border-[#D5DCD0]">
              <img
                src="/myrkls-sec4-incarnation-lab.webp"
                alt="MYRKLS Skincare Collection Formulation in Laboratory Setting"
                className="w-full h-full object-cover object-center select-none"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* SHARED MYRKLS FOOTER                                     */}
      {/* ======================================================== */}
      <MyrklsFooter onNavigateViewAll={onNavigateViewAll} />
    </div>
  );
};

export default MyrklsOurSciencePage;