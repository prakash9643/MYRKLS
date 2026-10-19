import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const MyrklsFeaturedProtection: React.FC = () => {
  return (
    <section
      id="featured-protection"
      aria-label="MYRKLS Section 06: Featured Protection - SENTINEL Advanced Aqua Sunscreen"
      className="w-full bg-[#FAF9F7] text-[#111111] rounded-none select-none border-t border-b border-[#E8E5E0] overflow-hidden mt-14 md:mt-20 lg:mt-24"
    >
      {/* Edge-to-Edge Split Layout exactly like Section 04 */}
      <div className="w-full flex flex-col lg:flex-row items-stretch">
        
        {/* ================= LEFT SIDE: Editorial Content ================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-[#FAF9F7]">
          
          {/* Top Editorial Block */}
          <div>
            {/* 1. Category Tagline in Brand Orange */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.16em] text-[#FF5A1F] uppercase flex items-center gap-2">
                <Sparkles size={13} className="text-[#FF5A1F]" />
                FEATURED PROTECTION / 02
              </span>
              <span className="text-[10px] font-sans font-bold tracking-[0.1em] uppercase text-[#777777] bg-[#EFECE6] px-2.5 py-1 rounded-none">
                FORMULA NO. 042 // SPF 50+
              </span>
            </div>

            {/* 2. Headline */}
            <h2 className="text-[38px] sm:text-[48px] xl:text-[56px] font-medium tracking-[-0.03em] leading-[1.06] text-[#133429] uppercase">
              DEFENCE,
              <br />
              BUT MAKE IT ELEGANT.
            </h2>

            {/* 3. Product Subtitle */}
            <h3 className="text-[18px] sm:text-[20px] font-medium text-[#1B3831] tracking-tight mt-6 sm:mt-8">
              SENTINEL™ — Advanced Aqua Sunscreen
            </h3>

            {/* 4. Body Description */}
            <p className="text-[15px] sm:text-[16px] text-[#495850] font-normal leading-relaxed max-w-[540px] mt-4">
              High-performance daily protection with a lightweight feel, elegant finish, and advanced broad-spectrum defence.
            </p>

            {/* 5. Horizontal Split Line like Section 4 */}
            <div className="mt-8 pt-6 border-t border-[#ECE8E1]">
              <div className="flex flex-wrap items-center gap-2 text-[12.5px] sm:text-[13.5px] font-sans font-bold tracking-[0.12em] uppercase">
                <span className="text-[#133429]">IN-VIVO TESTED</span>
                <span className="text-[#C7C0B5]">·</span>
                <span className="text-[#FF5A1F] font-extrabold">SPF 50+</span>
                <span className="text-[#C7C0B5]">·</span>
                <span className="text-[#FF5A1F] font-extrabold">UVA / PA++++</span>
              </div>
            </div>

            {/* Gen Z Technical Quick Highlights (like Section 4) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-7">
              <div className="border border-[#E0DCD5] bg-white p-3.5 rounded-none flex flex-col justify-between">
                <span className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[#FF5A1F]">50+</span>
                <span className="text-[10px] sm:text-[10.5px] text-[#666666] font-medium uppercase tracking-wider mt-1 leading-snug">
                  Broad UVB Shield
                </span>
              </div>
              <div className="border border-[#E0DCD5] bg-white p-3.5 rounded-none flex flex-col justify-between">
                <span className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[#FF5A1F]">PA++++</span>
                <span className="text-[10px] sm:text-[10.5px] text-[#666666] font-medium uppercase tracking-wider mt-1 leading-snug">
                  Maximum UVA Filter
                </span>
              </div>
              <div className="border border-[#E0DCD5] bg-white p-3.5 rounded-none flex flex-col justify-between">
                <span className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[#133429]">0.0%</span>
                <span className="text-[10px] sm:text-[10.5px] text-[#666666] font-medium uppercase tracking-wider mt-1 leading-snug">
                  White Cast Index
                </span>
              </div>
            </div>
          </div>

          {/* Action Button & Product Highlights */}
          <div className="space-y-4 pt-2">
            <a
              href="#sentinel"
              className="group inline-flex items-center gap-3.5 px-8 sm:px-10 py-4 bg-[#111111] hover:bg-[#FF5A2A] text-white text-[12.5px] sm:text-[13px] font-medium tracking-[0.1em] rounded-none transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
            >
              <span>Discover SENTINEL</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </a>

            <div className="flex items-center gap-5 text-[11px] text-[#777777] font-medium pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#20382E]" />
                In-Vivo Clinically Tested
              </span>
              <span>Aqua Lightweight Finish</span>
              <span>Zero Greasiness</span>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDE: Edge-to-Edge Hero Image Visual with Section 4 Split Border ================= */}
        <div className="w-full lg:w-1/2 relative bg-[#E7ECE5] min-h-[480px] sm:min-h-[600px] lg:min-h-[760px] flex items-center justify-center overflow-hidden group border-t lg:border-t-0 lg:border-l border-[#E8E5E0]">
          <img
            src="/myrkls-sec6-sentinel-sunscreen.jpg"
            alt="MYRKLS Sentinel Advanced Aqua Sunscreen SPF 50+ PA++++"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            loading="lazy"
            decoding="async"
          />

          {/* Top-Left Editorial Micro-Badge */}
          <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
            <span className="bg-black/90 text-white text-[9.5px] font-sans font-bold tracking-[0.14em] uppercase px-3 py-1.5 rounded-none shadow-sm backdrop-blur-md">
              SEC · 06 // PROTECTION
            </span>
            <span className="bg-[#FF5A1F] text-white text-[9.5px] font-bold tracking-[0.14em] uppercase px-2.5 py-1.5 rounded-none shadow-sm backdrop-blur-md">
              SPF 50+ · PA++++
            </span>
          </div>

          {/* Bottom Floating Spec Chip */}
          <div className="absolute bottom-5 inset-x-5 z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-black/85 backdrop-blur-md text-white px-3.5 py-2 rounded-none border border-white/10 text-[10px] font-sans font-semibold tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-[#FF5A1F] animate-pulse" />
              <span>AQUA GEL MATRIX // 50 ML</span>
            </div>
            <div className="hidden sm:flex bg-white/90 backdrop-blur-md text-[#111111] px-3 py-2 rounded-none text-[10px] font-bold tracking-widest uppercase shadow-sm">
              BROAD SPECTRUM
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
