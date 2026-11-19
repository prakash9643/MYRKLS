import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHomepageHeroBanners } from '../shopify/content/services';
import type { HomepageHeroBanner } from '../shopify/content/types';
import { readShopifyConfig } from '../shopify/config';
import { useShopifyQuery } from '../shopify/use-shopify-query';

interface SlideData {
  id: string;
  image: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
  mobileImage?: string | null;
  imageAlt: string;
  eyebrow: string;
  headline: React.ReactNode;
  supporting: string;
  ctaText: string | null;
  ctaLink: string;
  textColor?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
}

const slides: SlideData[] = [
  {
    id: 'awakening',
    image: '/myrkls-hero-awakening-sphere.webp',
    imageAlt: 'MYRKLS skincare presented in a softly lit scientific setting',
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
  },
  {
    id: 'incarnation-spheres',
    image: '/myrkls-hero-incarnation-sphere.webp',
    imageAlt: 'Encapsulated skincare active spheres',
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
  },
];

const SLIDE_DURATION = 5000; // 5s cinematic loop

const colorWithOpacity = (color: string, opacity: number): string => {
  const rawHex = color.slice(1);
  const hex = rawHex.length === 3 ? rawHex.replace(/./g, (digit) => digit + digit) : rawHex;
  const alpha = Math.round((Math.min(100, Math.max(0, opacity)) / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${hex}${alpha}`;
};

const mapContentSlide = (banner: HomepageHeroBanner): SlideData => ({
  id: banner.handle,
  image: banner.desktopImage.url,
  imageWidth: banner.desktopImage.width,
  imageHeight: banner.desktopImage.height,
  mobileImage: banner.mobileImage?.url,
  imageAlt: banner.mobileImage ? banner.mobileAlt || banner.desktopAlt : banner.desktopAlt,
  eyebrow: banner.eyebrow,
  headline: banner.heading,
  supporting: banner.supportingText,
  ctaText: banner.primaryCtaLabel || null,
  ctaLink: banner.primaryCtaUrl,
  textColor: banner.textColor,
  overlayColor: banner.overlayColor,
  overlayOpacity: banner.overlayOpacity,
});

export const MyrklsHero: React.FC = () => {
  const shopifyConfig = readShopifyConfig();
  const cmsResult = useShopifyQuery(
    'homepage-hero-banners',
    (signal) => getHomepageHeroBanners(signal),
    shopifyConfig.config !== null
  );
  const contentSlides = cmsResult.state.status === 'success'
    ? cmsResult.state.data.map(mapContentSlide)
    : [];
  const activeSlides = contentSlides.length > 0 ? contentSlides : slides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = activeSlides.length;
  const safeSlideIndex = Math.min(currentSlide, totalSlides - 1);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Cinematic Auto-Slide: continuous loop every 5 seconds
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  const slide = activeSlides[safeSlideIndex];

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
      {cmsResult.state.status === 'error' && (
        <p role="status" className="sr-only">
          Shopify hero content could not be loaded. The approved existing hero content is shown instead.
        </p>
      )}
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
            <picture>
              {slide.mobileImage && <source media="(max-width: 639px)" srcSet={slide.mobileImage} />}
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="w-full h-full object-cover object-center select-none"
                draggable={false}
                loading={safeSlideIndex === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={slide.imageWidth || undefined}
                height={slide.imageHeight || undefined}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Desktop left-side gradient: keeps center bottle 100% uncovered */}
        <div
          className="hidden lg:block absolute inset-y-0 left-0 w-[460px] pointer-events-none z-10"
          style={{
            background: slide.overlayColor
              ? `linear-gradient(to right, ${colorWithOpacity(slide.overlayColor, slide.overlayOpacity ?? 75)} 0%, transparent 100%)`
              : 'linear-gradient(to right, rgba(6, 14, 10, 0.82) 0%, rgba(6, 14, 10, 0.40) 65%, transparent 100%)',
          }}
        />

        {/* Mobile/Tablet ambient gradient: ensures 100% text readability */}
        <div
          className="lg:hidden absolute inset-0 pointer-events-none z-10"
          style={{
            background: slide.overlayColor
              ? `linear-gradient(to top, ${colorWithOpacity(slide.overlayColor, slide.overlayOpacity ?? 75)} 0%, transparent 100%)`
              : 'linear-gradient(to top, rgba(6, 14, 10, 0.92) 0%, rgba(6, 14, 10, 0.55) 55%, rgba(6, 14, 10, 0.25) 100%)',
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
              <h1
                style={slide.textColor ? { color: slide.textColor } : undefined}
                className="whitespace-pre-line text-[27px] sm:text-[34px] md:text-[38px] lg:text-[43px] font-normal text-white leading-[1.14] tracking-[-0.035em] mb-3 sm:mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              >
                {slide.headline}
              </h1>

              {/* Supporting line */}
              <p
                style={slide.textColor ? { color: slide.textColor } : undefined}
                className="text-[13.5px] sm:text-[15px] lg:text-[16px] font-normal text-[#D2E2D6] leading-relaxed mb-6 sm:mb-7 max-w-[420px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              >
                {slide.supporting}
              </p>

              {/* CTA Button */}
              <div>
                {slide.ctaText && slide.ctaLink && (
                  <a
                    href={slide.ctaLink}
                    className="inline-flex items-center justify-center h-[42px] sm:h-[46px] px-[22px] sm:px-[28px] rounded-none bg-[#111111] text-white text-[12.5px] sm:text-[13.5px] font-medium tracking-tight hover:bg-[#FF5A2A] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)] gap-2 group focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2"
                  >
                    <span>{slide.ctaText}</span>
                    <span className="text-[15px] leading-none transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                )}
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
                safeSlideIndex === idx ? 'w-7 bg-white' : 'w-2.5 bg-white/35'
              }`}
            />
          ))}
          <span className="text-[10.5px] sm:text-[11.5px] font-sans font-semibold tracking-wider text-white/70 ml-1.5">
            0{safeSlideIndex + 1} / 0{totalSlides}
          </span>
        </div>
      </div>
    </section>
  );
};
