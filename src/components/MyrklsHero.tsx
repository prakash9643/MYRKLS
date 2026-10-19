import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface SlideData {
  id: string;
  image: string;
  eyebrow: string;
  headline: React.ReactNode;
  supporting: string;
  ctaText: string;
  ctaLink: string;
  microCard: {
    thumb: string;
    title: string;
    subtitle: string;
  };
}

const slides: SlideData[] = [
  {
    id: 'awakening',
    image: '/myrkls-hero-awakening-sphere.webp',
    eyebrow: 'ADVANCED GLOBAL SKIN SCIENCE',
    headline: (
      <>
        THE WORLD'S SCIENCE.<br />
        YOUR SKIN'S FUTURE.
      </>
    ),
    supporting: 'Advanced active technologies. Precision formulation.',
    ctaText: 'Explore MYRKLS',
    ctaLink: '#explore',
    microCard: {
      thumb: '/myrkls-droplet-thumb.png',
      title: 'Global Innovation',
      subtitle: 'Powered by science. Inspired by you.',
    },
  },
  {
    id: 'incarnation-spheres',
    image: '/myrkls-hero-incarnation-sphere.webp',
    eyebrow: 'MOLECULAR BIO-ACTIVE SUSPENSION',
    headline: (
      <>
        SKIN RENEWAL.<br />
        REDEFINED.
      </>
    ),
    supporting: 'Encapsulated cellular actives suspended in micro bio-spheres.',
    ctaText: 'Experience Incarnation',
    ctaLink: '#incarnation-spheres',
    microCard: {
      thumb: '/myrkls-sphere-thumb.png',
      title: 'Bio-Sphere Delivery',
      subtitle: 'Targeted lipid encapsulation for optimal cellular uptake.',
    },
  },
];

const SLIDE_DURATION = 5000; // 5s cinematic loop

export const MyrklsHero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Cinematic Auto-Slide: continuous loop every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [totalSlides, currentSlide]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const slide = slides[currentSlide];

  // Touch swipe support for mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <section
      aria-label="Hero Section"
      className="w-full select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-[580px] sm:h-[640px] md:h-[680px] lg:h-[740px] rounded-none overflow-hidden relative shadow-[0_12px_40px_rgba(11,23,16,0.12)] bg-[#07130B]">
        {/* Cinematic Auto-Slide Background: Pristine Zero-Crop Cross-Dissolve */}
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: 1.15,
                ease: [0.25, 0.1, 0.25, 1.0],
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.9,
                ease: [0.25, 0.1, 0.25, 1.0],
              },
            }}
            className="absolute inset-0 w-full h-full pointer-events-none transform-gpu overflow-hidden"
            style={{ willChange: 'opacity' }}
          >
            <img
              src={slide.image}
              alt={slide.id}
              className="w-full h-full object-cover object-center select-none"
              draggable={false}
              loading={currentSlide === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </motion.div>
        </AnimatePresence>

        {/* Desktop left-side gradient: keeps center bottle 100% uncovered */}
        <div
          className="hidden lg:block absolute inset-y-0 left-0 w-[460px] pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(to right, rgba(6, 14, 10, 0.82) 0%, rgba(6, 14, 10, 0.40) 65%, transparent 100%)',
          }}
        />

        {/* Mobile/Tablet ambient gradient: ensures 100% text readability */}
        <div
          className="lg:hidden absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'linear-gradient(to top, rgba(6, 14, 10, 0.92) 0%, rgba(6, 14, 10, 0.55) 55%, rgba(6, 14, 10, 0.25) 100%)',
          }}
        />

        {/* Hero Content - Vertically centered on desktop, comfortably positioned on mobile */}
        <div className="absolute left-6 right-6 sm:left-10 sm:right-10 md:left-[48px] md:right-auto top-1/2 -translate-y-1/2 max-w-[480px] z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.22em' }}
                animate={{ opacity: 1, letterSpacing: '0.18em' }}
                transition={{ duration: 0.6 }}
                className="text-[10px] sm:text-[11px] font-medium tracking-[0.18em] text-[#A5CBAE] uppercase mb-3 sm:mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
              >
                {slide.eyebrow}
              </motion.p>

              {/* Headline */}
              <h1 className="text-[27px] sm:text-[34px] md:text-[38px] lg:text-[43px] font-normal text-white leading-[1.14] tracking-[-0.035em] mb-3 sm:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {slide.headline}
              </h1>

              {/* Supporting line */}
              <p className="text-[13.5px] sm:text-[15px] lg:text-[16px] font-normal text-[#D2E2D6] leading-relaxed mb-6 sm:mb-7 max-w-[420px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                {slide.supporting}
              </p>

              {/* CTA Button */}
              <div>
                <a
                  href={slide.ctaLink}
                  className="inline-flex items-center justify-center h-[42px] sm:h-[46px] px-[22px] sm:px-[28px] rounded-none bg-[#111111] text-white text-[12.5px] sm:text-[13.5px] font-medium tracking-tight hover:bg-[#FF5A2A] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)] gap-2 group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
                >
                  <span>{slide.ctaText}</span>
                  <span className="text-[15px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Feature Card (Desktop only, right side) - Luminous Frosted Glass */}
        <div className="hidden lg:flex absolute right-[48px] top-[105px] w-[245px] h-[425px] rounded-none bg-white/[0.14] backdrop-blur-xl border border-white/25 shadow-[0_16px_40px_0_rgba(0,0,0,0.35)] p-6 flex-col justify-between z-20">
          {/* Card Header (Clean white typography) */}
          <div>
            <div className="flex items-baseline">
              <span className="text-[17px] font-medium tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                VISION
              </span>
              <span className="text-[9.5px] font-semibold text-white ml-0.5 align-super drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                TM
              </span>
            </div>
            <div className="mt-1">
              <p className="text-[13px] font-semibold text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                Multi-Pathway
              </p>
              <p className="text-[13px] font-normal text-white/95 leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                Pigment Corrector
              </p>
            </div>
            <p className="text-[11.5px] font-normal text-white/80 mt-1.5 tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
              30 mL
            </p>
          </div>

          {/* Centered Isolated Serum Packshot */}
          <div className="flex-1 flex items-center justify-center my-2 relative">
            <img
              src="/myrkls-vision-bottle.png"
              alt="MYRKLS VISION Multi-Pathway Pigment Corrector 30 mL"
              className="h-[215px] w-auto object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)] pointer-events-none"
            />
          </div>

          {/* Small Outlined Circular Diagonal-Arrow Icon Lower-Right */}
          <div className="flex justify-end items-center">
            <button
              aria-label="View VISION Product Details"
              type="button"
              className="w-8 h-8 rounded-none border border-white/30 bg-white/25 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#FF5A2A] hover:border-[#FF5A2A] hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2A]"
            >
              <ArrowUpRight size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Bottom Left Micro Card (Tablet & Desktop only) - Luminous Frosted Glass */}
        <div className="hidden md:flex absolute left-6 md:left-[48px] bottom-6 md:bottom-[48px] w-[340px] md:w-[390px] h-[84px] md:h-[92px] rounded-none bg-white/[0.14] backdrop-blur-xl border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.25)] px-3.5 py-3 items-center gap-4 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-4 w-full"
            >
              <img
                src={slide.microCard.thumb}
                alt={slide.microCard.title}
                className="w-[66px] h-[66px] rounded-none object-cover flex-shrink-0 shadow-inner border border-white/15"
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-[14px] font-semibold text-white tracking-[-0.01em] leading-snug drop-shadow-sm">
                  {slide.microCard.title}
                </h3>
                <p className="text-[12px] font-normal text-[#D2E2D6] leading-snug mt-0.5 drop-shadow-sm">
                  {slide.microCard.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtle Minimalist Slide Indicators (Hidden on mobile for pure clean visual) */}
        <div className="hidden sm:flex absolute right-6 bottom-6 md:right-[48px] md:bottom-[48px] items-center gap-2 z-20 pointer-events-none select-none">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-[2px] transition-all duration-500 rounded-none ${
                currentSlide === idx ? 'w-7 bg-white' : 'w-2.5 bg-white/35'
              }`}
            />
          ))}
          <span className="text-[10.5px] sm:text-[11.5px] font-sans font-semibold tracking-wider text-white/70 ml-1.5">
            0{currentSlide + 1} / 0{totalSlides}
          </span>
        </div>
      </div>
    </section>
  );
};
