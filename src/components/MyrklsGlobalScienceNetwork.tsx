import React, { useEffect, useRef } from 'react';

const SCIENCE_NETWORK_VIDEO =
  'https://v1.pinimg.com/videos/iht/expMp4/96/f0/6d/96f06d4d5e05edc919bb7aae9baeaddc_540w.mp4';

const DeferredScienceVideo: React.FC<{ className: string }> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const loadVideo = () => {
      if (video.src) return;
      video.src = SCIENCE_NETWORK_VIDEO;
      video.load();
      void video.play().catch(() => undefined);
    };

    if (!('IntersectionObserver' in window)) {
      loadVideo();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadVideo();
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      poster="/video-frame.webp"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
};

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
  // Ordered mobile pairs for balanced 2-column display
  const mobileNodes = [
    { ...leftNodes[0], color: '#4ADE80' },
    { ...rightNodes[0], color: '#2DD4BF' },
    { ...leftNodes[1], color: '#4ADE80' },
    { ...rightNodes[1], color: '#2DD4BF' },
    { ...leftNodes[2], color: '#4ADE80' },
    { ...rightNodes[2], color: '#2DD4BF' },
  ];

  return (
    <section
      id="global-science-network"
      aria-label="Global Science Network"
      className="w-full relative overflow-hidden py-8 sm:py-12 lg:pt-16 lg:pb-20 px-4 sm:px-8 lg:px-12 border-t border-white/20 rounded-none select-none bg-[#05160E] mt-8 sm:mt-14 lg:mt-24"
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 mb-4 sm:mb-6 lg:mb-8 pb-3 sm:pb-4 border-b border-white/20">
          <div className="max-w-[540px]">
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#4ADE80] block mb-1 lg:hidden">
              GLOBAL SOURCING
            </span>
            <h2 className="text-[22px] sm:text-[34px] lg:text-[38px] font-normal tracking-[-0.03em] leading-[1.1] sm:leading-[1.08] text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              Global Science Network
            </h2>
          </div>
          <div className="max-w-[460px]">
            <p className="text-[12px] sm:text-[14px] text-[#D8EADB] font-normal leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              From European peptide technology to Korean biotech and Indian botanicals. Different origins. One formulation philosophy.
            </p>
          </div>
        </div>

        {/* ================= MOBILE LAYOUT (< lg): ULTRA COMPACT ================= */}
        <div className="block lg:hidden w-full">
          {/* Compact Centered Video Ring */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] rounded-full p-2 bg-black/45 backdrop-blur-xl border border-white/35 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(74,222,128,0.22)]">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-[#040C07] border border-[#4ADE80]/40 shadow-inner">
                <DeferredScienceVideo
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 2-Column Balanced Country Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {mobileNodes.map((item) => (
              <div
                key={item.country}
                className="p-2.5 sm:p-3 rounded-none bg-[#06180E]/85 backdrop-blur-xl border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-[12px] sm:text-[13px] font-semibold tracking-tight uppercase text-white leading-tight">
                      {item.country}
                    </h3>
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 6px ${item.color}`,
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  {item.domain ? (
                    <p className="text-[10px] sm:text-[10.5px] text-[#86EFAC] font-medium mt-0.5 line-clamp-1">
                      {item.domain}
                    </p>
                  ) : (
                    <p className="text-[10px] sm:text-[10.5px] text-[#86EFAC] font-medium mt-0.5 opacity-0 select-none">
                      &nbsp;
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <span
                    className="text-[9px] sm:text-[10px] text-white/95 font-medium bg-white/10 px-1.5 py-0.5 border border-white/15 block truncate text-center"
                    title={item.actives}
                  >
                    {item.actives}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= DESKTOP LAYOUT (>= lg): PRESERVED 100% UNCHANGED ================= */}
        <div className="hidden lg:block relative w-full py-4">
          
          {/* Desktop SVG Connecting Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
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
          <div className="relative z-10 grid grid-cols-12 gap-0 items-center">
            
            {/* ================= LEFT NODES (3 COUNTRIES) ================= */}
            <div className="col-span-3 flex flex-col justify-between gap-5 lg:gap-8 items-end">
              {leftNodes.map((item) => (
                <div
                  key={item.country}
                  className="w-auto flex flex-col items-end"
                >
                  <div className="group relative w-auto inline-flex flex-col items-end justify-center px-5 py-3 rounded-none bg-[#06180E]/80 hover:bg-[#06180E]/95 backdrop-blur-xl border border-white/25 hover:border-[#6EE7B7]/60 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300">
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
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#4ADE80] ring-4 ring-[#06180E] shadow-[0_0_10px_#4ADE80]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ================= CENTER CIRCULAR RING VIDEO (ENLARGED & BALANCED) ================= */}
            <div className="col-span-6 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                
                {/* Main Circular Ring Frame: Enlarged to 400px/420px with Multi-Layer Shadow & Ambient Glow */}
                <div className="relative w-[390px] h-[390px] xl:w-[410px] xl:h-[410px] rounded-full p-3.5 bg-black/40 backdrop-blur-xl border border-white/35 shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_45px_rgba(74,222,128,0.22)] transition-transform duration-500 hover:scale-[1.015]">
                  
                  {/* Inner Video Container */}
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-[#040C07] border border-[#4ADE80]/40 shadow-inner">
                    <DeferredScienceVideo
                      className="w-full h-full object-cover rounded-full"
                    />

                    {/* Luminous Specular Ring */}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* ================= RIGHT NODES (3 COUNTRIES) ================= */}
            <div className="col-span-3 flex flex-col justify-between gap-5 lg:gap-8 items-start">
              {rightNodes.map((item) => (
                <div
                  key={item.country}
                  className="w-auto flex flex-col items-start"
                >
                  <div className="group relative w-auto inline-flex flex-col items-start justify-center px-5 py-3 rounded-none bg-[#06180E]/80 hover:bg-[#06180E]/95 backdrop-blur-xl border border-white/25 hover:border-[#6EE7B7]/60 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300">
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
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#2DD4BF] ring-4 ring-[#06180E] shadow-[0_0_10px_#2DD4BF]"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* ================= SOURCING NOTE / DISCLAIMER ================= */}
        <div className="mt-6 sm:mt-8 lg:mt-10 pt-3 sm:pt-4 lg:pt-5 border-t border-white/15 lg:border-white/20 flex justify-center text-center">
          <p className="text-[10px] sm:text-[11.5px] text-[#D8EADB]/75 font-normal tracking-wide max-w-[880px] leading-relaxed drop-shadow-sm">
            The countries represent preferred ingredient-technology origins from the development brief. Confirm actual suppliers and provenance before publishing these as verified sourcing claims.
          </p>
        </div>

      </div>
    </section>
  );
};
