import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SciencePillar {
  id: string;
  number: string;
  title: string;
  desc: string;
  image: string;
}

const pillars: SciencePillar[] = [
  {
    id: 'active-intelligence',
    number: '01 / SCIENCE',
    title: 'ACTIVE INTELLIGENCE',
    desc: 'Globally sourced technologies, selected for a reason.',
    image: '/myrkls-sec3-active-intelligence.webp',
  },
  {
    id: 'precision-chemistry',
    number: '02 / SCIENCE',
    title: 'PRECISION CHEMISTRY',
    desc: 'Multiple actives. Thoughtfully combined.',
    image: '/myrkls-sec3-active-intelligence.webp',
  },
  {
    id: 'skin-longevity',
    number: '03 / SCIENCE',
    title: 'SKIN LONGEVITY',
    desc: 'Science-led care for renewal, recovery and protection.',
    image: '/myrkls-sec3-active-intelligence.webp',
  },
];

export const MyrklsScienceSection: React.FC = () => {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <section
      id="about-us"
      aria-label="Science and Molecules"
      className="w-full my-12 md:my-24 select-none bg-[#07130B] scroll-mt-24"
    >
      <div id="our-formulation-philosophy" className="sr-only" />
      {/* Container: h-auto on mobile, fixed 720px on desktop */}
      <div className="w-full h-auto md:h-[720px] rounded-none overflow-hidden relative shadow-[0_20px_60px_rgba(11,23,16,0.18)]">
        {/* Background Image: Desktop only full-bleed edge-to-edge */}
        <div className="hidden md:block absolute inset-0 w-full h-full pointer-events-none">
          <img
            src="/myrkls-sec3-bg-full.webp"
            alt="MYRKLS Molecular Science Background"
            className="w-full h-full object-cover select-none"
          />
          {/* Desktop subtle dark gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(6, 14, 10, 0.94) 0%, rgba(6, 14, 10, 0.78) 50%, rgba(6, 14, 10, 0.2) 100%)',
            }}
          />
        </div>

        {/* Flush Split Layout: 1:1 image on mobile (<768px), 50/50 split on desktop (>=768px) */}
        <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-stretch p-0">
          
          {/* Content Column: Hidden on mobile (<768px), Left side on desktop (>=768px) */}
          <div className="hidden md:flex md:w-1/2 md:h-full flex-col justify-between md:py-14 md:pl-12 md:pl-20 md:pr-12">
            
            {/* Header Block */}
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] text-[#A5CBAE] uppercase mb-2.5 drop-shadow-sm">
                OUR FORMULATION PHILOSOPHY
              </p>
              <h2 className="text-[34px] font-normal text-white leading-[1.12] tracking-[-0.03em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                NOT MAGIC.<br />
                <span className="text-[#A5CBAE]">JUST MOLECULES.</span>
              </h2>
              <p className="text-[13.5px] text-[#D2E2D6] font-normal leading-relaxed mt-2.5 drop-shadow-sm">
                Advanced chemistry. Global innovation. Formulated with purpose.
              </p>
            </div>

            {/* Science Rows: Desktop Interactive Pillars (>=768px) */}
            <div className="space-y-3 my-auto py-2">
              {pillars.map((pillar, idx) => {
                const isActive = activePillar === idx;
                return (
                  <div
                    key={pillar.id}
                    onClick={() => setActivePillar(idx)}
                    className={`group cursor-pointer rounded-none p-3 transition-all duration-200 border ${
                      isActive
                        ? 'bg-white/[0.12] border-white/25 shadow-sm backdrop-blur-md'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-sans font-bold tracking-wider uppercase transition-colors ${
                              isActive ? 'text-[#A5CBAE]' : 'text-white/60 group-hover:text-white/80'
                            }`}
                          >
                            {pillar.number}
                          </span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-none bg-[#A5CBAE] animate-pulse" />
                          )}
                        </div>
                        <h3 className="text-[13px] font-semibold text-white tracking-wide uppercase mt-0.5">
                          {pillar.title}
                        </h3>
                        <p className="text-[11.5px] text-[#C2D6C8] leading-snug mt-0.5">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div>
              <a
                href="#our-science"
                className="inline-flex items-center justify-center h-[46px] min-h-[44px] px-7 rounded-none bg-[#111111] text-white text-[13px] font-medium tracking-tight hover:bg-[#FF5A2A] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.25)] gap-2 group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
              >
                <span>EXPLORE OUR SCIENCE</span>
                <span className="text-[13px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Molecular Image: 1:1 Aspect Ratio on mobile, Right half on desktop */}
          <div className="w-full aspect-square md:aspect-auto md:w-1/2 md:h-full relative overflow-hidden md:border-l border-white/10 bg-[#E9F3EC]">
            <motion.div
              key={pillars[activePillar].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full relative"
            >
              <img
                src={pillars[activePillar].image}
                alt={pillars[activePillar].title}
                className="w-full h-full object-cover object-center select-none"
              />

              {/* Floating Outlined Diagonal Arrow Badge (Desktop only) */}
              <div className="hidden md:flex absolute right-5 bottom-5 w-9 h-9 rounded-none border border-black/10 bg-white/85 backdrop-blur-md items-center justify-center text-[#111111] shadow-md hover:bg-[#FF5A2A] hover:text-white transition-all">
                <ArrowUpRight size={15} strokeWidth={2} />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
