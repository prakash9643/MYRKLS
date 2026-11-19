import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ArrowRight,
  Plus,
  Minus,
  X,
  FileText,
  Package,
  Clock,
  Compass,
  CheckCircle2,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';

export interface MyrklsShippingPolicyPageProps {
  onBackToHome?: () => void;
  onNavigateViewAll?: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateOurScience?: () => void;
  onNavigateAboutUs?: () => void;
  onNavigateContactUs?: () => void;
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'Can I change my shipping address after placing an order?',
    a: "Contact MYRKLS support as soon as possible. Changes depend on the order's processing and dispatch status. If your parcel has not yet been handed over to the courier partner, our team can update the delivery destination.",
  },
  {
    q: 'What if my delivery is delayed?',
    a: 'Check your latest tracking information using the carrier link sent via email or in My Account. If you need further assistance or your tracking has not updated for several days, contact customer support with your order number.',
  },
  {
    q: 'What happens if delivery is unsuccessful?',
    a: "Couriers typically attempt delivery multiple times or contact the recipient. Unclaimed shipments may be returned to our fulfillment warehouse; contact support to arrange re-dispatch or address verification.",
  },
  {
    q: 'What should I do if my package arrives damaged?',
    a: 'Contact customer support within 48 hours with your order details and photos of the package and affected items. Resolution will follow the published policy, including immediate replacement or store refund upon verification.',
  },
  {
    q: 'Do you offer international shipping?',
    a: 'Currently, MYRKLS ships exclusively across serviceable PIN codes in India. International shipping is not currently offered.',
  },
];

export const MyrklsShippingPolicyPage: React.FC<MyrklsShippingPolicyPageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateOurScience,
  onNavigateAboutUs,
  onNavigateContactUs,
  onNavigateTerms,
  onNavigatePrivacy,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [returnsModalOpen, setReturnsModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lock body scroll when returns modal is open
  useEffect(() => {
    if (returnsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [returnsModalOpen]);

  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateAccount) {
      onNavigateAccount();
    } else {
      window.location.hash = '#account';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
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

  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-[#111111] selection:bg-[#111111] selection:text-white flex flex-col font-sans">
      {/* ======================================================== */}
      {/* SHARED MYRKLS RETINA HEADER                              */}
      {/* ======================================================== */}
      <MyrklsHeader
        onNavigateHome={onBackToHome}
        onNavigateViewAll={onNavigateViewAll}
        onNavigateProduct={onNavigateProduct}
        onNavigateAccount={onNavigateAccount}
        onNavigateOurScience={onNavigateOurScience}
        onNavigateAboutUs={onNavigateAboutUs}
        onNavigateContactUs={onNavigateContactUs}
      />

      <main className="flex-1 w-full">
        {/* ======================================================== */}
        {/* SECTION 01 — SHIPPING POLICY HERO (TEXT-FIRST COMPACT)   */}
        {/* ======================================================== */}
        <section
          id="section-shipping-hero"
          aria-label="Shipping Policy Hero"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] py-14 sm:py-18 lg:py-22"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[780px]">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                MYRKLS / CUSTOMER CARE
              </span>

              <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[44px] lg:text-[54px] font-bold text-[#173B2B] tracking-tight uppercase leading-[1.06]">
                SHIPPING<br />POLICY.
              </h1>

              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16.5px] text-[#4A5550] leading-relaxed">
                Everything you need to know about how your MYRKLS order makes its way to you.
              </p>

              {/* Verified Last Updated Date & Status Badge */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] sm:text-[12px] font-mono">
                <span className="px-3 py-1.5 bg-white border border-[#DDD8D0] font-bold text-[#173B2B] uppercase tracking-wider">
                  LAST UPDATED: 14 OCTOBER 2026
                </span>
                <span className="px-3 py-1.5 bg-[#FFF4E5] border border-[#FFE0B2] text-[#9A3412] font-semibold uppercase tracking-wider">
                  DRAFT FRAMEWORK FOR BUSINESS & LEGAL REVIEW
                </span>
              </div>

              {/* Notice Banner */}
              <div className="mt-6 p-4 sm:p-5 bg-white border border-[#E2DDD5] flex items-start gap-3.5">
                <ShieldAlert size={18} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                <div className="text-[12.5px] font-sans text-[#55625B] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[#173B2B] block mb-0.5">
                    Notice: Operational Shipping Standards
                  </span>
                  All formulation orders are fulfilled in temperature-conscious protective packaging and dispatched via authorized courier logistics across serviceable Indian postal PIN codes. Confirmed store settings and checkout timeframes apply.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 02 — SHIPPING AT A GLANCE (4 COMPACT BLOCKS)     */}
        {/* ======================================================== */}
        <section
          id="section-shipping-glance"
          aria-label="Shipping at a Glance"
          className="w-full bg-white py-14 sm:py-18 lg:py-20 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {/* Header: Centered Eyebrow & Heading */}
            <div className="text-center max-w-[620px] mx-auto mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                GOOD TO KNOW
              </span>
              <h2 className="font-['Syne',sans-serif] text-[26px] sm:text-[34px] lg:text-[40px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.1]">
                DELIVERY, MADE<br />SIMPLE.
              </h2>
            </div>

            {/* 4 Compact Blocks (1 Row on Desktop, 2-Col Grid on Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Block 01: Order Processing */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">01</span>
                    <Clock size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    ORDER PROCESSING
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Orders are processed Monday through Saturday within 24 to 48 business hours, excluding gazetted national holidays.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  Careful Hand-Inspection
                </div>
              </div>

              {/* Block 02: Delivery Estimates */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">02</span>
                    <Truck size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    DELIVERY ESTIMATES
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Standard delivery typically arrives within 3 to 5 business days. Exact estimates depend on destination PIN code and local courier logistics.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  Priority Transit
                </div>
              </div>

              {/* Block 03: Shipping Charges */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">03</span>
                    <Package size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    SHIPPING CHARGES
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Applicable delivery fees and promotional free-shipping eligibility are displayed during checkout before payment. No hidden surcharges.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  Transparent Pricing
                </div>
              </div>

              {/* Block 04: Order Tracking */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">04</span>
                    <Compass size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    ORDER TRACKING
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Once dispatched, real-time carrier tracking links are delivered via email and SMS, and accessible anytime inside your customer account.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  Live Dispatch Status
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 03 — FROM ORDER TO DOORSTEP (3-STEP PROCESS)     */}
        {/* ======================================================== */}
        <section
          id="section-delivery-journey"
          aria-label="Delivery Journey Process"
          className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[840px] mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  YOUR DELIVERY JOURNEY
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  FROM OUR STORE<br />TO YOUR DOOR.
                </h2>
              </div>

              {/* 3-Step Refined Horizontal Process */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 01 */}
                <div className="bg-white border border-[#E5E0D8] p-6 rounded-none relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">
                      STEP 01
                    </span>
                    <CheckCircle2 size={18} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    ORDER CONFIRMED
                  </h3>
                  <p className="mt-2.5 text-[13.5px] text-[#55625B] leading-relaxed">
                    Once your order is successfully placed, you&apos;ll receive an order confirmation through the channels configured by MYRKLS (instant email and SMS summary).
                  </p>
                </div>

                {/* Step 02 */}
                <div className="bg-white border border-[#E5E0D8] p-6 rounded-none relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">
                      STEP 02
                    </span>
                    <Package size={18} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    ORDER DISPATCHED
                  </h3>
                  <p className="mt-2.5 text-[13.5px] text-[#55625B] leading-relaxed">
                    When your order ships in temperature-conscious packaging, available tracking information will be shared through supported notification channels.
                  </p>
                </div>

                {/* Step 03 */}
                <div className="bg-white border border-[#E5E0D8] p-6 rounded-none relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">
                      STEP 03
                    </span>
                    <Truck size={18} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    OUT FOR DELIVERY
                  </h3>
                  <p className="mt-2.5 text-[13.5px] text-[#55625B] leading-relaxed">
                    Follow the latest delivery updates through the tracking link or your order account, where available, as your package arrives at your doorstep.
                  </p>
                </div>
              </div>

              {/* Two Readable Information Subsections */}
              <div className="mt-12 sm:mt-16 space-y-8 bg-white border border-[#E5E0D8] p-6 sm:p-8 rounded-none">
                <div>
                  <h4 className="font-['Syne',sans-serif] text-[17px] sm:text-[18px] font-bold uppercase tracking-tight text-[#173B2B] mb-2 flex items-center gap-2">
                    <Compass size={16} className="text-[#FF5A1F]" />
                    <span>Shipping Locations & Coverage</span>
                  </h4>
                  <p className="text-[14px] text-[#55625B] leading-relaxed">
                    MYRKLS delivers across serviceable domestic postal PIN codes in India through priority courier networks. You can verify whether your PIN code is serviceable by entering your delivery address during the checkout flow. For remote or special transit zones, delivery feasibility is subject to courier coverage.
                  </p>
                </div>

                <div className="pt-6 border-t border-[#E5E0D8]">
                  <h4 className="font-['Syne',sans-serif] text-[17px] sm:text-[18px] font-bold uppercase tracking-tight text-[#173B2B] mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-[#FF5A1F]" />
                    <span>Delivery Estimates & Potential Variations</span>
                  </h4>
                  <p className="text-[14px] text-[#55625B] leading-relaxed">
                    Estimated delivery dates are displayed during checkout and reflected in your order tracking status. While the vast majority of shipments arrive within 3 to 5 business days, actual transit times may occasionally vary due to courier routing, high-volume festive seasons, severe regional weather, or local logistics disruptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — DELIVERY QUESTIONS (FAQ ACCORDION)          */}
        {/* ======================================================== */}
        <section
          id="section-shipping-faq"
          aria-label="Delivery Questions FAQ"
          className="w-full bg-white py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[840px] mx-auto px-5 sm:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                HELPFUL INFORMATION
              </span>
              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                A FEW THINGS<br />TO KEEP IN MIND.
              </h2>
            </div>

            {/* Compact 1-Column Accordion */}
            <div className="divide-y divide-[#E5E0D8] border-y border-[#E5E0D8]">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={item.q} className="py-4 sm:py-5">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-none"
                    >
                      <span className="font-['Syne',sans-serif] text-[15.5px] sm:text-[17px] font-bold text-[#173B2B] group-hover:text-[#FF5A1F] transition-colors leading-snug">
                        {item.q}
                      </span>
                      <span className="w-7 h-7 shrink-0 flex items-center justify-center border border-[#DDD8D0] group-hover:border-[#FF5A1F] text-[#173B2B] group-hover:text-[#FF5A1F] transition-colors">
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-[14px] sm:text-[14.5px] text-[#55625B] leading-relaxed pr-6">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 05 — NEED HELP WITH YOUR ORDER? (CLOSING BLOCK)  */}
        {/* ======================================================== */}
        <section
          id="section-order-help"
          aria-label="Need Help With Your Order"
          className="w-full bg-[#E9EDE6] py-14 sm:py-18 border-b border-[#DDD8D0]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[680px] mx-auto text-center">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                MYRKLS CUSTOMER CARE
              </span>

              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] font-bold text-[#173B2B] uppercase tracking-tight">
                WE&apos;RE HERE<br />TO HELP.
              </h2>

              <p className="mt-3 text-[14px] sm:text-[15.5px] text-[#4A5550] leading-relaxed">
                Have a question about your delivery? We&apos;re here to help you find the answers.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#account"
                  onClick={handleTrackClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>TRACK YOUR ORDER</span>
                  <ArrowRight size={14} />
                </a>

                <a
                  href="#contact-us"
                  onClick={handleContactClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-[#111111] hover:text-white text-[#111111] border border-[#DDD8D0] text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>CONTACT SUPPORT</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Related Policy Links Row */}
              <div className="mt-8 pt-6 border-t border-[#D5DCD0] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] font-sans font-semibold text-[#173B2B]">
                <a
                  href="#terms"
                  onClick={handleTermsClick}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <FileText size={12} className="text-[#FF5A1F]" />
                  <span>Terms & Conditions</span>
                </a>
                <span className="text-[#C5D0C5]">•</span>
                <a
                  href="#privacy-policy"
                  onClick={handlePrivacyClick}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <FileText size={12} className="text-[#FF5A1F]" />
                  <span>Privacy Policy</span>
                </a>
                <span className="text-[#C5D0C5]">•</span>
                <button
                  type="button"
                  onClick={() => setReturnsModalOpen(true)}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} className="text-[#FF5A1F]" />
                  <span>Returns & Refunds Policy</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* RELATED POLICY MODAL: RETURNS & REFUNDS                  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {returnsModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipping-returns-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs select-text"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#FAF9F7] text-[#111111] rounded-none border border-[#E2DDD5] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5E0] bg-[#F4F1EA]">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-[#FF5A1F] uppercase block">
                    MYRKLS // PUBLISHED POLICIES
                  </span>
                  <h3
                    id="shipping-returns-title"
                    className="font-['Syne',sans-serif] text-[19px] sm:text-[22px] font-bold uppercase tracking-tight text-[#173B2B] mt-0.5"
                  >
                    Returns & Refunds Policy
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setReturnsModalOpen(false)}
                  aria-label="Close modal"
                  className="w-9 h-9 bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#DDD8D0] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 text-[13.5px] font-normal leading-relaxed text-[#444444]">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                    01. Return Eligibility
                  </h4>
                  <p>
                    Due to strict personal cosmetic hygiene standards, formulations are eligible for return only if they remain in their original unopened packaging with tamper-evident seals intact.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                    02. Damaged or Defective Items
                  </h4>
                  <p>
                    If your shipment arrives damaged or defective, please contact our support team within 48 hours with photographic evidence and your order number for an immediate replacement or store refund.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                    03. Refund Processing Timeline
                  </h4>
                  <p>
                    Approved refunds are credited directly back to the original payment source within 3 to 5 business days upon warehouse verification.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#F4F1EA] border-t border-[#E5E0D8] flex items-center justify-between">
                <span className="text-[11.5px] text-[#666666]">
                  Need further clarification? Reach us at concierge@myrkls.com
                </span>
                <button
                  type="button"
                  onClick={() => setReturnsModalOpen(false)}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* SHARED MYRKLS FOOTER                                     */}
      {/* ======================================================== */}
      <MyrklsFooter
        onNavigateViewAll={onNavigateViewAll}
        onNavigateHome={onBackToHome}
        onNavigateAboutUs={onNavigateAboutUs}
        onNavigateContactUs={onNavigateContactUs}
        onNavigateTerms={onNavigateTerms}
        onNavigatePrivacy={onNavigatePrivacy}
      />
    </div>
  );
};

export default MyrklsShippingPolicyPage;
