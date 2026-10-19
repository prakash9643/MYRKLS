import React from 'react';

interface CountryItem {
  country: string;
  domain?: string;
  actives: string;
}

const leftNodes: CountryItem[] = [
  {
    country: 'GERMANY',
    domain: 'Pigment Science',
    actives: 'SymWhite® 377 · Ectoin®',
  },
  {
    country: 'FRANCE',
    domain: 'Peptide Innovation',
    actives: 'Matrixyl® · AQUAXYL™',
  },
  {
    country: 'SOUTH KOREA',
    actives: 'Nanovesicles',
  },
];

const rightNodes: CountryItem[] = [
  {
    country: 'SWITZERLAND',
    domain: 'Longevity Technology',
    actives: 'Neodermyl®',
  },
  {
    country: 'INDIA',
    domain: 'Botanical Intelligence',
    actives: 'Standardized Haritaki',
  },
  {
    country: 'SPAIN',
    domain: 'Peptide Science',
    actives: 'Juveleven™',
  },
];

export const MyrklsGlobalScienceNetwork: React.FC = () => {
  return (
    <section
      id="global-science-network"
      aria-label="Global Science Network"
      className="w-full relative overflow-hidden pt-12 md:pt-16 pb-16 md:pb-20 px-4 sm:px-8 lg:px-12 border-t border-white/20 rounded-none select-none bg-[#05160E] mt-14 md:mt-20 lg:mt-24"
    >
      {/* ================= HORIZONTAL FLUTED WAVE GLASS BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/myrkls-sec5-bg-wave.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center scale-[1.01]"
        />
        {/* Ambient Darkening Gradient to Ensure Superior Text Contrast & Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030E08]/35 via-transparent to-[#030E08]/45" />
        <div className="absolute inset-0 bg-[#041009]/15 backdrop-blur-[0.5px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1480px] mx-auto">
        
        {/* ================= COMPACT HEADER: SIDE ALIGNED ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 lg:mb-8 pb-4 border-b border-white/20">
          <div className="max-w-[540px]">
            <h2 className="text-[26px] sm:text-[34px] lg:text-[38px] font-normal tracking-[-0.03em] leading-[1.08] text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              Global Science Network
            </h2>
          </div>
          <div className="max-w-[460px]">
            <p className="text-[13px] sm:text-[14px] text-[#D8EADB] font-normal leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              From European peptide technology to Korean biotech and Indian botanicals. Different origins. One formulation philosophy.
            </p>
          </div>
        </div>

        {/* ================= NETWORK DIAGRAM: GENEROUS BREATHING ROOM + PROPORTIONAL HEIGHT ================= */}
        <div className="relative w-full py-4">
          
          {/* Desktop SVG Connecting Lines */}
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1400 480"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="lineGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(74, 222, 128, 0.2)" />
                <stop offset="100%" stopColor="rgba(74, 222, 128, 0.9)" />
              </linearGradient>
              <linearGradient id="lineGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(45, 212, 191, 0.2)" />
                <stop offset="100%" stopColor="rgba(45, 212, 191, 0.9)" />
              </linearGradient>
            </defs>

            {/* Left Node 1 (Germany) -> Center Ring */}
            <path
              d="M 375 75 C 440 75, 490 95, 547 112"
              stroke="url(#lineGradLeft)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Left Node 2 (France) -> Center Ring */}
            <path
              d="M 375 240 L 500 240"
              stroke="url(#lineGradLeft)"
              strokeWidth="1.5"
            />
            {/* Left Node 3 (South Korea) -> Center Ring */}
            <path
              d="M 375 405 C 440 405, 490 385, 547 368"
              stroke="url(#lineGradLeft)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Right Node 1 (Switzerland) -> Center Ring */}
            <path
              d="M 1025 75 C 960 75, 910 95, 853 112"
              stroke="url(#lineGradRight)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Right Node 2 (India) -> Center Ring */}
            <path
              d="M 1025 240 L 900 240"
              stroke="url(#lineGradRight)"
              strokeWidth="1.5"
            />
            {/* Right Node 3 (Spain) -> Center Ring */}
            <path
              d="M 1025 405 C 960 405, 910 385, 853 368"
              stroke="url(#lineGradRight)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* 3-Column Split: col-span-3 (Left) - col-span-6 (Center Spacious) - col-span-3 (Right) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-center">
            
            {/* ================= LEFT NODES (3 COUNTRIES) ================= */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-5 lg:gap-8 lg:items-end">
              {leftNodes.map((item) => (
                <div
                  key={item.country}
                  className="w-full lg:w-auto flex flex-col lg:items-end"
                >
                  <div className="group relative w-full lg:w-auto inline-flex flex-col lg:items-end justify-center px-5 py-3 rounded-none bg-[#06180E]/80 hover:bg-[#06180E]/95 backdrop-blur-xl border border-white/25 hover:border-[#6EE7B7]/60 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300">
                    {/* Country Name */}
                    <h3 className="text-[17px] sm:text-[19px] font-semibold tracking-[-0.01em] uppercase text-white group-hover:text-[#6EE7B7] transition-colors leading-tight drop-shadow-sm">
                      {item.country}
                    </h3>

                    {/* Domain (if present) */}
                    {item.domain && (
                      <p className="text-[12px] sm:text-[12.5px] text-[#86EFAC] font-medium mt-0.5">
                        {item.domain}
                      </p>
                    )}

                    {/* Actives */}
                    <div className="mt-1.5 inline-flex items-center">
                      <span className="text-[11.5px] sm:text-[12px] text-white font-bold tracking-tight bg-white/10 hover:bg-white/15 px-2.5 py-0.5 border border-white/20 shadow-xs">
                        {item.actives}
                      </span>
                    </div>

                    {/* Visual Connection Anchor (Desktop) */}
                    <span
                      className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#4ADE80] ring-4 ring-[#06180E] shadow-[0_0_10px_#4ADE80]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ================= CENTER CIRCULAR RING VIDEO (ENLARGED & BALANCED) ================= */}
            <div className="lg:col-span-6 flex items-center justify-center my-4 lg:my-0">
              <div className="relative flex items-center justify-center">
                
                {/* Main Circular Ring Frame: Enlarged to 400px/420px with Multi-Layer Shadow & Ambient Glow */}
                <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] lg:w-[390px] lg:h-[390px] xl:w-[410px] xl:h-[410px] rounded-full p-3 sm:p-3.5 bg-black/40 backdrop-blur-xl border border-white/35 shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_45px_rgba(74,222,128,0.22)] transition-transform duration-500 hover:scale-[1.015]">
                  
                  {/* Inner Video Container */}
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-[#040C07] border border-[#4ADE80]/40 shadow-inner">
                    <video
                      src="https://v1.pinimg.com/videos/iht/expMp4/96/f0/6d/96f06d4d5e05edc919bb7aae9baeaddc_540w.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover rounded-full"
                    />

                    {/* Luminous Specular Ring */}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* ================= RIGHT NODES (3 COUNTRIES) ================= */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-4 lg:gap-6 lg:items-start">
              {rightNodes.map((item) => (
                <div
                  key={item.country}
                  className="w-full lg:w-auto flex flex-col lg:items-start"
                >
                  <div className="group relative w-full lg:w-auto inline-flex flex-col lg:items-start justify-center px-5 py-3 rounded-none bg-[#06180E]/80 hover:bg-[#06180E]/95 backdrop-blur-xl border border-white/25 hover:border-[#6EE7B7]/60 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300">
                    {/* Country Name */}
                    <h3 className="text-[17px] sm:text-[19px] font-semibold tracking-[-0.01em] uppercase text-white group-hover:text-[#6EE7B7] transition-colors leading-tight drop-shadow-sm">
                      {item.country}
                    </h3>

                    {/* Domain (if present) */}
                    {item.domain && (
                      <p className="text-[12px] sm:text-[12.5px] text-[#86EFAC] font-medium mt-0.5">
                        {item.domain}
                      </p>
                    )}

                    {/* Actives */}
                    <div className="mt-1.5 inline-flex items-center">
                      <span className="text-[11.5px] sm:text-[12px] text-white font-bold tracking-tight bg-white/10 hover:bg-white/15 px-2.5 py-0.5 border border-white/20 shadow-xs">
                        {item.actives}
                      </span>
                    </div>

                    {/* Visual Connection Anchor (Desktop) */}
                    <span
                      className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#4ADE80] ring-4 ring-[#06180E] shadow-[0_0_10px_#4ADE80]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* ================= SOURCING NOTE / DISCLAIMER ================= */}
        <div className="mt-10 pt-5 border-t border-white/20 flex justify-center text-center">
          <p className="text-[11px] sm:text-[11.5px] text-[#D8EADB]/80 font-normal tracking-wide max-w-[880px] leading-relaxed drop-shadow-sm">
            The countries represent preferred ingredient-technology origins from the development brief. Confirm actual suppliers and provenance before publishing these as verified sourcing claims.
          </p>
        </div>

      </div>
    </section>
  );
};
