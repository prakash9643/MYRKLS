import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Instagram, Youtube, Linkedin, Twitter, ShieldCheck, Mail } from 'lucide-react';

interface MyrklsFooterProps {
  onNavigateViewAll?: () => void;
}

export const MyrklsFooter: React.FC<MyrklsFooterProps> = ({ onNavigateViewAll }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3500);
  };

  return (
    <footer
      id="contact-us"
      aria-label="MYRKLS Footer — Advanced Global Skin Science"
      className="relative w-full text-white overflow-hidden rounded-none select-none border-t border-[#E8E5E0] bg-[#0A160D] scroll-mt-24"
    >
      <div id="myrkls-footer" className="sr-only" />
      {/* ======================================================== */}
      {/* BACKGROUND IMAGE 1: Futuristic Lime/Olive Sunbeam Room   */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/myrkls-footer-bg.webp"
          alt="MYRKLS Futuristic Architectural Laboratory Stage"
          className="w-full h-full object-cover object-center brightness-[0.88] contrast-[1.06]"
          loading="lazy"
          decoding="async"
        />

        {/* Top Vignette Gradient for seamless transition from the page above */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#FAF9F7]/40 via-transparent to-transparent pointer-events-none mix-blend-overlay" />

        {/* Ambient Atmospheric Tint Overlay: Subtle, balanced tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09140B]/70 via-[#09140B]/44 to-[#030804]/92 pointer-events-none" />

        {/* Cinematic Deep Dark Bottom Shadow behind Logo for Razor-Sharp Contrast */}
        <div className="absolute inset-x-0 bottom-0 h-[380px] sm:h-[480px] bg-gradient-to-t from-[#020503] via-[#020503]/85 to-transparent pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* FOREGROUND CONTENT CONTAINER                             */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 sm:pt-24 lg:pt-28">
        
        {/* ======================================================== */}
        {/* TOP FROSTED GLASS ROW: NEWSLETTER & PROTOCOL ACCESS      */}
        {/* Section 1 Glass Effect: bg-white/[0.14] backdrop-blur-xl border-white/25 */}
        {/* ======================================================== */}
        <div className="w-full bg-white/[0.12] backdrop-blur-xl border border-white/25 shadow-[0_16px_40px_rgba(0,0,0,0.35)] rounded-none p-8 sm:p-10 lg:p-12 mb-14 sm:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Newsletter Manifesto */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-none bg-[#FF5A1F] animate-pulse" />
                <span className="text-[11px] font-sans tracking-[0.16em] text-[#C2E5D0] uppercase font-bold">
                  PRIVATE FORMULATION REGISTRY
                </span>
              </div>

              <h3 className="text-[26px] sm:text-[34px] lg:text-[38px] font-normal tracking-[-0.03em] text-white leading-tight uppercase drop-shadow-sm">
                JOIN THE MOLECULAR CIRCLE.
              </h3>

              <p className="text-[14.5px] sm:text-[15.5px] text-[#E2EFE7] font-normal leading-relaxed mt-2 max-w-[580px] drop-shadow-sm">
                Receive private allocations for small-batch clinical drops, peptide longevity whitepapers, and seasonal ritual adjustments.
              </p>
            </div>

            {/* Right: Glass Input & Submit Button */}
            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="w-full flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/60">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter clinical email address..."
                    className="w-full h-[48px] pl-10 pr-4 bg-black/50 border border-white/30 rounded-none text-white placeholder-white/60 text-[13.5px] font-normal focus:outline-none focus:border-white focus:bg-black/70 transition-all backdrop-blur-md"
                  />
                </div>

                <button
                  type="submit"
                  className={`h-[48px] px-7 ${
                    subscribed ? 'bg-[#FF5A2A] text-white' : 'bg-[#111111] hover:bg-[#FF5A2A] text-white'
                  } text-[12px] font-bold tracking-[0.16em] uppercase rounded-none transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#FF5A2A] focus:ring-offset-2`}
                >
                  {subscribed ? (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      <span>SUBSCRIBED</span>
                    </>
                  ) : (
                    <>
                      <span>SUBSCRIBE</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 text-[11.5px] text-white/80 font-sans tracking-wide mt-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={12} className="text-[#C2E5D0]" />
                  Zero Spam · Encrypted Data
                </span>
                <span>·</span>
                <span>Unsubscribe Anytime</span>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* MIDDLE EDITORIAL NAVIGATION GRID (FROSTED GLASS PANELS)   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 sm:gap-12 pb-16 border-b border-white/15">
          
          {/* Column 1: Brand Philosophy & Global Origins */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4 pr-0 lg:pr-6">
            <span className="text-[12px] font-sans tracking-[0.14em] text-[#C2E5D0] uppercase font-bold block mb-4">
              ADVANCED GLOBAL SKIN SCIENCE
            </span>
            <p className="text-[14.5px] text-white/95 font-normal leading-relaxed mb-6 drop-shadow-sm">
              MYRKLS is an advanced laboratory collective synthesizing European peptide technologies, Swiss cellular chronobiology, Korean nanovesicle bio-delivery, and standardized Indian botanicals into high-performance skin systems.
            </p>

            {/* Social Links Row with Frosted Glass Icons */}
            <div className="space-y-2">
              <span className="text-[11px] font-sans tracking-[0.14em] text-[#C2E5D0] uppercase font-semibold block">
                FOLLOW OUR RESEARCH //
              </span>
              <div className="flex items-center gap-2.5">
                {[
                  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
                  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
                  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
                  { name: 'Twitter / X', icon: Twitter, href: 'https://x.com' },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit MYRKLS on ${social.name}`}
                      className="w-10 h-10 rounded-none bg-white/[0.12] hover:bg-white text-white hover:text-[#09140B] border border-white/25 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer group"
                    >
                      <Icon size={16} className="transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Formulations / Shop */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <h4 className="text-[12px] font-sans tracking-[0.14em] text-[#C2E5D0] uppercase font-bold mb-5">
              FORMULATIONS // 01
            </h4>
            <ul className="space-y-3 text-[14px] font-normal text-white/95">
              <li>
                <a href="#incarnation" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  INCARNATION™ Retinal Serum
                </a>
              </li>
              <li>
                <a href="#sentinel" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  SENTINEL™ Aqua Sunscreen SPF 50+
                </a>
              </li>
              <li>
                <a href="#clinical-serums" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  AWAKENING Gel Cleanser
                </a>
              </li>
              <li>
                <a href="#clinical-serums" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  RESTORATION Pigment Cream
                </a>
              </li>
              <li>
                <a href="#clinical-serums" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  VISION™ Pigment Corrector
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateViewAll) {
                      onNavigateViewAll();
                    } else {
                      window.location.hash = '#all-products';
                    }
                  }}
                  className="text-[#FF5A1F] hover:underline transition-colors flex items-center gap-1 font-semibold pt-1 cursor-pointer text-left"
                >
                  <span>View All Clinical Protocols (7)</span>
                  <ArrowRight size={13} />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Science & Philosophy */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h4 className="text-[12px] font-sans tracking-[0.14em] text-[#C2E5D0] uppercase font-bold mb-5">
              SCIENCE // 02
            </h4>
            <ul className="space-y-3 text-[14px] font-normal text-white/95">
              <li>
                <a href="#our-science" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Active Intelligence
                </a>
              </li>
              <li>
                <a href="#our-science" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Precision Chemistry
                </a>
              </li>
              <li>
                <a href="#our-science" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Skin Longevity Matrix
                </a>
              </li>
              <li>
                <a href="#global-science-network" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Global Science Network
                </a>
              </li>
              <li>
                <a href="#featured-protection" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  In-Vivo Clinical Trials
                </a>
              </li>
              <li>
                <a href="#good-to-know" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Ingredient Transparency
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Concierge & Client Support */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <h4 className="text-[12px] font-sans tracking-[0.14em] text-[#C2E5D0] uppercase font-bold mb-5">
              CONCIERGE // 03
            </h4>
            <ul className="space-y-3 text-[14px] font-normal text-white/95">
              <li>
                <a href="#good-to-know" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#clinical-reviews" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Verified Patient Reviews
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Clinical Consultation Support
                </a>
              </li>
              <li>
                <a href="#track-order" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Track Order Status
                </a>
              </li>
              <li>
                <a href="#protocols" className="hover:text-white hover:underline transition-colors block drop-shadow-sm">
                  Active Sequencing Protocol
                </a>
              </li>
              <li className="pt-2">
                <div className="p-3 bg-white/[0.08] border border-white/20 backdrop-blur-md text-[11.5px] font-sans text-[#E2EFE7] leading-relaxed">
                  <span className="text-white font-bold block mb-0.5">DIRECT LAB INQUIRIES:</span>
                  concierge@myrkls.com
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* ======================================================== */}
        {/* LEGAL & CERTIFICATIONS SUB-ROW                           */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 text-[12px] font-sans text-white/85 font-medium">
          <div>
            © 2026 MYRKLS Inc. All rights reserved. Global Science. Visible Results.
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Ritual</a>
            <span>·</span>
            <a href="#compliance" className="hover:text-white transition-colors">Clinical Compliance</a>
            <span>·</span>
            <a href="#sitemap" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MONUMENTAL LOGO AT BOTTOM                                */}
      {/* Responsive padding and vertical bottom fade               */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full pt-8 pb-0 px-6 sm:px-12 lg:px-20 flex justify-center items-end pointer-events-none select-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full relative flex justify-center items-end"
        >
          {/* Logo with Bottom Fade Gradient Mask */}
          <img
            src="/myrkls-logo-exact-retina.png"
            alt="MYRKLS Global Science Visible Results Monumental Logo"
            className="w-full h-auto object-contain relative z-10 drop-shadow-[0_12px_35px_rgba(0,0,0,0.7)]"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0) 98%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0) 98%)',
            }}
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>

    </footer>
  );
};

export default MyrklsFooter;
