import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';

export interface MyrklsAboutUsPageProps {
  onBackToHome: () => void;
  onNavigateViewAll: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateOurScience?: () => void;
  onNavigateContactUs?: () => void;
}

export const MyrklsAboutUsPage: React.FC<MyrklsAboutUsPageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateOurScience,
  onNavigateContactUs,
}) => {
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
        onNavigateOurScience={onNavigateOurScience}
        onNavigateContactUs={onNavigateContactUs}
      />

      <main className="w-full">
        {/* ======================================================== */}
        {/* SECTION 01 — ABOUT US HERO (50/50 SPLIT-SCREEN)          */}
        {/* ======================================================== */}
        <section
          id="section-about-hero"
          aria-label="About MYRKLS - Skincare With Intention"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] overflow-hidden"
        >
          <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px] lg:min-h-[580px]">
            {/* LEFT: Vertically Centered Editorial Text */}
            <div className="flex flex-col justify-center px-5 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16 lg:py-20">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                MYRKLS / ABOUT US
              </span>

              <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[42px] lg:text-[52px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.06]">
                SKINCARE,<br />WITH INTENTION.
              </h1>

              <p className="mt-4 sm:mt-5 text-[14.5px] sm:text-[16px] text-[#4A5550] leading-relaxed max-w-[480px]">
                We believe skincare should feel thoughtful, effective and easy to make part of everyday life.
              </p>

              <p className="mt-3 sm:mt-4 text-[12px] sm:text-[13px] font-medium text-[#173B2B]/85 tracking-wide uppercase font-mono">
                Global ingredient innovation. Made for modern skin.
              </p>
            </div>

            {/* RIGHT: Large Skincare Lifestyle Image (Natural Skin, Soft Sage Glow) */}
            <div className="relative w-full h-[280px] sm:h-[340px] lg:h-full min-h-[280px] lg:min-h-[580px] bg-[#E9EDE6]/60 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#E5E0D8]">
              <img
                src="/myrkls-prod-sentinel-model.webp"
                alt="Radiant natural skin model in soft daylight with subtle sage-green background"
                className="w-full h-full object-cover object-center select-none"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 02 — THE MYRKLS STORY (EDITORIAL 2-COLUMN)       */}
        {/* ======================================================== */}
        <section
          id="section-story"
          aria-label="The MYRKLS Story"
          className="w-full bg-[#FFFFFF] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* LEFT: Skincare Texture Photography */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="aspect-[4/3] sm:aspect-[5/4] lg:aspect-[1/1] overflow-hidden border border-[#E5E0D8] bg-[#FAFAF8] shadow-[0_4px_20px_rgba(23,59,43,0.03)]">
                  <img
                    src="/stock-skincare-texture.jpg"
                    alt="Refined translucent serum texture and botanical droplets"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* RIGHT: Editorial Story Content */}
              <div className="lg:col-span-7 order-1 lg:order-2">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  OUR STORY
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.1]">
                  A DIFFERENT WAY<br />TO THINK ABOUT SKINCARE.
                </h2>
                <div className="mt-5 space-y-4 text-[14.5px] sm:text-[15.5px] text-[#4A5550] leading-relaxed max-w-[540px]">
                  <p>
                    MYRKLS was built around a simple idea: great skincare brings together smart ingredients, thoughtful formulation and everyday usability.
                  </p>
                  <p>
                    We look beyond trends to explore ingredient innovations from around the world, creating skincare designed around the needs of modern skin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 03 — WHAT WE BELIEVE (LIGHT SAGE BACKGROUND)     */}
        {/* ======================================================== */}
        <section
          id="section-philosophy"
          aria-label="What We Believe"
          className="w-full bg-[#E9EDE6] py-16 sm:py-20 lg:py-24 border-b border-[#DDD8D0]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {/* Header: Centered Eyebrow & Heading */}
            <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                OUR PHILOSOPHY
              </span>
              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                THOUGHTFUL BY DESIGN.
              </h2>
            </div>

            {/* Three Clean Editorial Columns with Subtle Dividers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Column 01 */}
              <div className="bg-white border border-[#D5DCD0] p-6 sm:p-8 rounded-none shadow-[0_4px_16px_rgba(23,59,43,0.03)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase block mb-3">
                    01
                  </span>
                  <h3 className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold text-[#173B2B] uppercase tracking-tight">
                    PURPOSE IN EVERY FORMULA
                  </h3>
                </div>
                <p className="mt-3 text-[13.5px] sm:text-[14px] text-[#55625B] leading-relaxed">
                  We choose ingredients with a clear role in the skincare experience.
                </p>
              </div>

              {/* Column 02 */}
              <div className="bg-white border border-[#D5DCD0] p-6 sm:p-8 rounded-none shadow-[0_4px_16px_rgba(23,59,43,0.03)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase block mb-3">
                    02
                  </span>
                  <h3 className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold text-[#173B2B] uppercase tracking-tight">
                    INNOVATION WITHOUT BORDERS
                  </h3>
                </div>
                <p className="mt-3 text-[13.5px] sm:text-[14px] text-[#55625B] leading-relaxed">
                  We explore ingredient technologies and ideas from around the world.
                </p>
              </div>

              {/* Column 03 */}
              <div className="bg-white border border-[#D5DCD0] p-6 sm:p-8 rounded-none shadow-[0_4px_16px_rgba(23,59,43,0.03)] flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase block mb-3">
                    03
                  </span>
                  <h3 className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold text-[#173B2B] uppercase tracking-tight">
                    CARE FOR EVERYDAY SKIN
                  </h3>
                </div>
                <p className="mt-3 text-[13.5px] sm:text-[14px] text-[#55625B] leading-relaxed">
                  We value formulas that balance targeted skincare benefits with comfort.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — MADE FOR REAL SKIN (SPLIT-SCREEN)           */}
        {/* ======================================================== */}
        <section
          id="section-real-skin"
          aria-label="Made for Real Skin"
          className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* LEFT: Large Editorial Lifestyle Image (Realistic Skin Texture, Soft Daylight) */}
              <div className="lg:col-span-6">
                <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[480px] overflow-hidden border border-[#E5E0D8] bg-[#E9EDE6]/50 shadow-[0_4px_24px_rgba(23,59,43,0.04)]">
                  <img
                    src="/stock-woman-glow.jpg"
                    alt="Authentic natural skin texture in soft natural sunlight"
                    className="w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* RIGHT: Perspective Content */}
              <div className="lg:col-span-6">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  OUR PERSPECTIVE
                </span>

                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.1]">
                  REAL SKIN.<br />REAL ROUTINES.
                </h2>

                <p className="mt-4 text-[14.5px] sm:text-[15.5px] text-[#4A5550] leading-relaxed max-w-[460px]">
                  Skin changes with time, environment and everyday life. We believe skincare should support your routine, not complicate it.
                </p>

                <div className="mt-6 pt-5 border-t border-[#E5E0D8] max-w-[460px]">
                  <p className="font-['Syne',sans-serif] text-[15px] sm:text-[17px] font-bold text-[#173B2B] uppercase tracking-wide">
                    Less noise. More intention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 05 — EXPLORE MYRKLS (FINAL BRAND CTA)            */}
        {/* ======================================================== */}
        <section
          id="section-explore-myrkls"
          aria-label="Explore MYRKLS Skincare"
          className="w-full bg-[#E9EDE6] border-b border-[#DDD8D0] overflow-hidden"
        >
          <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* LEFT: Text & Button */}
            <div className="px-5 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16 lg:py-24">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                DISCOVER MYRKLS
              </span>

              <h2 className="font-['Syne',sans-serif] text-[30px] sm:text-[38px] lg:text-[46px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                FIND YOUR<br />EVERYDAY ESSENTIALS.
              </h2>

              <p className="mt-4 text-[14px] sm:text-[16px] text-[#4A5550] leading-relaxed max-w-[460px]">
                Explore skincare thoughtfully formulated for different skin needs and routines.
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
                alt="MYRKLS Skincare Essentials in Studio Setting"
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

export default MyrklsAboutUsPage;