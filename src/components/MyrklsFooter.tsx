import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, Youtube, Linkedin, Twitter, X, ShieldAlert } from 'lucide-react';
import { useAnalyticsConsent } from '../analytics/ConsentProvider';

export interface MyrklsFooterProps {
  onNavigateViewAll?: () => void;
  onNavigateHome?: () => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAboutUs?: () => void;
  onNavigateContactUs?: () => void;
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateShipping?: () => void;
  onNavigateReturns?: () => void;
}

export const MyrklsFooter: React.FC<MyrklsFooterProps> = ({
  onNavigateViewAll,
  onNavigateHome,
  onNavigateAboutUs,
  onNavigateContactUs,
  onNavigateTerms,
  onNavigatePrivacy,
  onNavigateShipping,
  onNavigateReturns,
}) => {
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | null>(null);
  const { openPreferences } = useAnalyticsConsent();

  // Sync hash navigation with legal view
  useEffect(() => {
    const handleHash = () => {
      // Internal pages now handle #terms and #privacy-policy as full routes
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Lock body scroll when legal view is open
  useEffect(() => {
    if (legalView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [legalView]);

  const closeLegalView = () => {
    setLegalView(null);
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.includes('terms') || hash.includes('privacy')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else if (window.location.pathname === '/' && (!window.location.hash || window.location.hash === '#home')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/#home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOurProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateViewAll) {
      onNavigateViewAll();
    } else {
      window.location.hash = '#all-products';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAboutUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateAboutUs) {
      onNavigateAboutUs();
    } else {
      window.location.hash = '#about-us';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateContactUs) {
      onNavigateContactUs();
    } else {
      window.location.hash = '#contact-us';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateTerms) {
      onNavigateTerms();
    } else {
      window.location.hash = '#terms';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigatePrivacy) {
      onNavigatePrivacy();
    } else {
      window.location.hash = '#privacy-policy';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShippingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateShipping) {
      onNavigateShipping();
    } else {
      window.location.hash = '#shipping-policy';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReturnsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateReturns) {
      onNavigateReturns();
    } else {
      window.location.hash = '#returns-refunds';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="contact-us"
      aria-label="MYRKLS Footer — Advanced Global Skin Science"
      className="relative w-full text-white overflow-hidden rounded-none select-none border-t border-[#E8E5E0] bg-[#0A160D] scroll-mt-24"
    >
      <div id="myrkls-footer" className="sr-only" />

      {/* ======================================================== */}
      {/* BACKGROUND: FOREST-GREEN GRADIENT & ATMOSPHERIC LAYERS   */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/myrkls-footer-bg.webp"
          alt="MYRKLS Futuristic Architectural Laboratory Stage"
          className="w-full h-full object-cover object-center brightness-[0.85] contrast-[1.08]"
          loading="lazy"
          decoding="async"
        />

        {/* Top Vignette Gradient for seamless transition from the page above */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#FAF9F7]/30 via-transparent to-transparent pointer-events-none mix-blend-overlay" />

        {/* Ambient Forest-Green Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09140B]/80 via-[#0A180E]/70 to-[#040905]/95 pointer-events-none" />

        {/* Subtle Bottom Deep Shadow */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#020503] via-[#020503]/70 to-transparent pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* FOREGROUND CONTENT CONTAINER                             */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[1320px] mx-auto">

        {/* ======================================================== */}
        {/* MOBILE FOOTER (< 768px / md:hidden)                      */}
        {/* Compact, 40-50% height reduction, 2-col nav, icon row    */}
        {/* ======================================================== */}
        <div className="md:hidden px-5 py-8">
          {/* 1. Compact Brand Intro */}
          <div>
            <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.18em] text-[#C2E5D0] uppercase block">
              MYRKLS / GLOBAL SKIN SCIENCE
            </span>
            <h2 className="font-['Syne',sans-serif] text-[26px] sm:text-[30px] font-bold tracking-tight text-white uppercase leading-[1.12] mt-2">
              BETTER SKIN.<br />
              BACKED BY SCIENCE.
            </h2>
            <p className="mt-2 text-[13px] sm:text-[14px] text-[#E2EFE7]/85 font-normal leading-relaxed">
              Advanced skincare, powered by global ingredient innovation.
            </p>
          </div>

          {/* Divider 1: After Brand Intro */}
          <div className="w-full h-px bg-white/10 my-5" />

          {/* 2. Two-Column Navigation: EXPLORE + LEGAL Side by Side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column — EXPLORE */}
            <div>
              <h3 className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#C2E5D0] uppercase mb-3">
                EXPLORE
              </h3>
              <ul className="space-y-1.5 text-[14px] sm:text-[15px] font-normal text-white/85">
                <li>
                  <a
                    href="#home"
                    onClick={handleHomeClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#all-products"
                    onClick={handleOurProductsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Our Products
                  </a>
                </li>
                <li>
                  <a
                    href="#about-us"
                    onClick={handleAboutUsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact-us"
                    onClick={handleContactUsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Column — LEGAL */}
            <div>
              <h3 className="text-[11px] font-sans font-bold tracking-[0.16em] text-[#C2E5D0] uppercase mb-3">
                LEGAL
              </h3>
              <ul className="space-y-1.5 text-[14px] sm:text-[15px] font-normal text-white/85">
                <li>
                  <a
                    href="#terms"
                    onClick={handleTermsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy-policy"
                    onClick={handlePrivacyClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Cookie preferences
                  </button>
                </li>
                <li>
                  <a
                    href="#shipping-policy"
                    onClick={handleShippingClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#returns-refunds"
                    onClick={handleReturnsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Returns & Refunds
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Social Icon Row (Icons ONLY, 20px size, accessible 44px touch targets) */}
          <div className="mt-5 pt-1">
            <div className="flex items-center gap-1 -ml-2">
              {[
                { name: 'Instagram', icon: Instagram },
                { name: 'Facebook', icon: Facebook },
                { name: 'YouTube', icon: Youtube },
                { name: 'LinkedIn', icon: Linkedin },
                { name: 'X (Twitter)', icon: Twitter },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    aria-label={`MYRKLS on ${social.name}`}
                    title={`${social.name} — Official profile coming soon`}
                    className="w-11 h-11 flex items-center justify-center text-white/75 hover:text-[#FF5A2A] transition-colors cursor-pointer"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Divider 2: Before Bottom Bar */}
          <div className="w-full h-px bg-white/10 my-5" />

          {/* 4. Bottom Bar (Center-Aligned with Minimal Spacing) */}
          <div className="text-center space-y-1.5 text-[11.5px] font-sans text-white/65">
            <div>
              © 2026 MYRKLS. All Rights Reserved.
            </div>
            <div>
              Designed by{' '}
              <a
                href="https://launchveda.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF5A2A] transition-colors underline-offset-4 hover:underline font-medium"
              >
                Launchveda
              </a>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP FOOTER (>= 768px / hidden md:block)              */}
        {/* 100% UNCHANGED SIGNATURE EDITORIAL CONCEPT               */}
        {/* ======================================================== */}
        <div className="hidden md:block px-6 sm:px-10 lg:px-16 pt-16 sm:pt-20 pb-8 sm:pb-10">

          {/* TOP AREA — BRAND STATEMENT */}
          <div className="max-w-3xl">
            <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] text-[#C2E5D0] uppercase block">
              MYRKLS / ADVANCED GLOBAL SKIN SCIENCE
            </span>

            <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[38px] md:text-[44px] font-bold tracking-tight text-white uppercase leading-[1.12] mt-3">
              BETTER SKIN. BACKED BY SCIENCE.
            </h2>

            <p className="mt-3.5 text-[14.5px] sm:text-[15.5px] text-[#E2EFE7]/85 font-normal leading-relaxed max-w-xl">
              Thoughtfully formulated skincare, powered by global ingredient innovation.
            </p>
          </div>

          {/* SUBTLE HORIZONTAL DIVIDER */}
          <div className="w-full h-px bg-white/10 my-10 sm:my-12" />

          {/* MIDDLE AREA — BALANCED NAVIGATION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12 md:gap-16 lg:gap-24">
            
            {/* 01: EXPLORE */}
            <div>
              <h3 className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#C2E5D0] uppercase mb-4 sm:mb-5">
                EXPLORE
              </h3>
              <ul className="space-y-3 text-[14px] font-normal text-white/85">
                <li>
                  <a
                    href="#home"
                    onClick={handleHomeClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#all-products"
                    onClick={handleOurProductsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Our Products
                  </a>
                </li>
                <li>
                  <a
                    href="#about-us"
                    onClick={handleAboutUsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact-us"
                    onClick={handleContactUsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* 02: LEGAL */}
            <div>
              <h3 className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#C2E5D0] uppercase mb-4 sm:mb-5">
                LEGAL
              </h3>
              <ul className="space-y-3 text-[14px] font-normal text-white/85">
                <li>
                  <a
                    href="#terms"
                    onClick={handleTermsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy-policy"
                    onClick={handlePrivacyClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-flex items-center min-h-[38px] py-1"
                  >
                    Cookie preferences
                  </button>
                </li>
                <li>
                  <a
                    href="#shipping-policy"
                    onClick={handleShippingClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Shipping Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#returns-refunds"
                    onClick={handleReturnsClick}
                    className="hover:text-[#FF5A2A] transition-colors cursor-pointer inline-block"
                  >
                    Returns & Refunds
                  </a>
                </li>
              </ul>
            </div>

            {/* 03: SOCIAL */}
            <div>
              <h3 className="text-[11px] font-sans font-bold tracking-[0.18em] text-[#C2E5D0] uppercase mb-4 sm:mb-5">
                SOCIAL
              </h3>
              <ul className="space-y-3 text-[14px] font-normal text-white/85">
                {[
                  { name: 'Instagram', icon: Instagram },
                  { name: 'Facebook', icon: Facebook },
                  { name: 'YouTube', icon: Youtube },
                  { name: 'LinkedIn', icon: Linkedin },
                  { name: 'X (Twitter)', icon: Twitter },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <li key={social.name}>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        aria-label={`MYRKLS on ${social.name}`}
                        title={`${social.name} — Official profile coming soon`}
                        className="inline-flex items-center gap-2.5 text-white/85 hover:text-[#FF5A2A] transition-colors cursor-pointer group"
                      >
                        <Icon size={15} className="text-white/60 group-hover:text-[#FF5A2A] transition-colors shrink-0" />
                        <span>{social.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>

          {/* SUBTLE HORIZONTAL DIVIDER */}
          <div className="w-full h-px bg-white/10 mt-10 sm:mt-12 mb-6 sm:mb-8" />

          {/* BOTTOM BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-sans text-white/65">
            <div>
              © 2026 MYRKLS. All Rights Reserved.
            </div>
            <div>
              Designed by{' '}
              <a
                href="https://launchveda.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF5A2A] transition-colors underline-offset-4 hover:underline font-medium"
              >
                Launchveda
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* DEDICATED LEGAL PAGE MODAL (TERMS & CONDITIONS / PRIVACY) */}
      {/* Clearly marked draft content requiring approval          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {legalView && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-page-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-text"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-[#FAF9F7] text-[#111111] rounded-none border border-[#E2DDD5] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5E0] bg-[#F4F1EA]">
                <div>
                  <span className="text-[10px] font-sans font-bold tracking-[0.18em] text-[#173B2B] uppercase block">
                    MYRKLS // DRAFT POLICY FRAMEWORK
                  </span>
                  <h2
                    id="legal-page-title"
                    className="font-['Syne',sans-serif] text-[20px] sm:text-[24px] font-bold uppercase tracking-tight text-[#111111] mt-0.5"
                  >
                    {legalView === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeLegalView}
                  aria-label="Close legal document"
                  className="w-10 h-10 rounded-none bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#DDD8D0] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Legal Notice Warning Banner */}
              <div className="bg-[#FFF4E5] border-b border-[#FFE0B2] px-6 py-3.5 flex items-start gap-3">
                <ShieldAlert size={18} className="text-[#E65100] shrink-0 mt-0.5" />
                <div className="text-[12px] font-sans text-[#794500] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block">
                    Notice: Draft Content Requiring Approval Before Publication
                  </span>
                  This document serves as a placeholder draft framework. Official company terms, legal jurisdiction, and business policies must be reviewed and formally approved by authorized MYRKLS counsel before public release.
                </div>
              </div>

              {/* Scrollable Document Body */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6 text-[13.5px] font-normal leading-relaxed text-[#444444]">
                {legalView === 'terms' ? (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        01. General Framework & Acceptance
                      </h4>
                      <p>
                        By accessing or using the MYRKLS website and purchasing formulations, you acknowledge that this platform is provided for informational and direct purchasing purposes. These terms represent a standard framework outlining user obligations and service guidelines.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        02. Dermatological & Cosmetic Disclaimer
                      </h4>
                      <p>
                        MYRKLS cosmetic formulations are developed for topical skincare care and aesthetic maintenance. They do not constitute pharmaceutical treatments, medical advice, or therapeutic cures for dermatological diseases. Individual results vary; patch testing is recommended prior to introducing new active bio-conjugates.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        03. Intellectual Property Rights
                      </h4>
                      <p>
                        All brand assets, names (including VISION™, INCARNATION™, REBIRTH™, ETERNITY™, RESTORATION™, AWAKENING™, SENTINEL™), laboratory design systems, editorial imagery, and digital assets remain the proprietary property of MYRKLS. Unauthorized reproduction or commercial re-distribution is prohibited.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        04. Orders, Pricing & Fulfillment
                      </h4>
                      <p>
                        All formulation prices are listed in Indian Rupees (₹) inclusive of applicable taxes unless specified otherwise. We reserve the right to correct pricing errors or update product availability without prior notice.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        05. Regulatory Jurisdiction
                      </h4>
                      <p className="italic text-[#777777]">
                        [Draft Note: Specific governing law, dispute resolution venue, and arbitration clauses to be finalized and inserted by MYRKLS legal counsel.]
                      </p>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        01. Information Collection Framework
                      </h4>
                      <p>
                        MYRKLS collects necessary customer data exclusively to deliver secure order fulfillment, OTP-verified authentication, and customer support. This includes contact details (mobile number, delivery address, email) provided willingly during checkout or account management.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        02. Use of Authorized Customer Data
                      </h4>
                      <p>
                        Personal details are utilized strictly for order processing, logistics dispatch via certified courier partners, and transactional notifications. Customer information is never sold, leased, or distributed to third-party marketing brokers.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        03. Data Security & Storage
                      </h4>
                      <p>
                        All sensitive customer data is handled through encrypted protocols and authorized tokenization. We enforce strict administrative access controls to safeguard customer accounts against unauthorized disclosure.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        04. User Privacy Rights
                      </h4>
                      <p>
                        Customers maintain full access to their saved addresses and contact profiles through the MY ACCOUNT dashboard. You may request data modification or deletion by contacting customer support.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[12px]">
                        05. Regulatory Compliance
                      </h4>
                      <p className="italic text-[#777777]">
                        [Draft Note: Statutory compliance clauses in accordance with applicable Digital Personal Data Protection legislation to be inserted by MYRKLS legal counsel.]
                      </p>
                    </section>
                  </>
                )}
              </div>

              {/* Modal Footer Action */}
              <div className="px-6 py-4 border-t border-[#E8E5E0] bg-[#F4F1EA] flex justify-end">
                <button
                  type="button"
                  onClick={closeLegalView}
                  className="h-10 px-6 bg-[#111111] hover:bg-[#FF5A2A] text-white text-[12px] font-bold tracking-[0.14em] uppercase transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default MyrklsFooter;
