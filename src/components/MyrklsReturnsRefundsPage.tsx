import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Plus,
  Minus,
  FileText,
  Package,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Truck,
  Mail,
  Camera,
} from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';

export interface MyrklsReturnsRefundsPageProps {
  onBackToHome?: () => void;
  onNavigateViewAll?: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateOurScience?: () => void;
  onNavigateAboutUs?: () => void;
  onNavigateContactUs?: () => void;
  onNavigateTerms?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateShipping?: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'Can I return a MYRKLS skincare product?',
    a: 'Due to strict personal cosmetic hygiene standards and formulation safety, products are eligible for return if they remain in their original, unopened packaging with all tamper-evident seals intact. If you experience an adverse formulation issue or receive an incorrect or defective item, our concierge team will assist you under applicable consumer protection rights.',
  },
  {
    q: 'What if I receive a damaged, defective or incorrect product?',
    a: 'Please notify our customer concierge team within 48 hours of delivery with clear photographs of the outer packaging, affected product, and your order number. Once confirmed, we will immediately arrange a complimentary replacement dispatch or process a full refund without requiring you to pay return shipping fees.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'You may request an order cancellation provided your parcel has not yet been processed and handed over to our courier partner. Because our warehouse fulfills orders within 24 to 48 business hours, please reach out to customer support immediately with your order ID. Once dispatched, an order cannot be recalled in transit and must follow the standard return process upon arrival.',
  },
  {
    q: 'How will I receive my refund?',
    a: 'Approved refunds are credited directly back to the original payment method used during checkout (Credit Card, Debit Card, Net Banking, or UPI). For orders placed via Cash on Delivery (COD), our support team will provide a secure verification channel to process your refund directly to your verified bank account or UPI ID.',
  },
  {
    q: 'How long does a refund take?',
    a: 'Once your returned parcel is received and inspected at our fulfillment facility, MYRKLS initiates the refund within 3 to 5 business days. Depending on your bank, credit card issuer, or payment provider, it typically takes an additional 2 to 7 business days for the funds to reflect on your statement.',
  },
  {
    q: 'Can I exchange a product?',
    a: 'We provide direct replacements for items that arrive damaged, defective, or incorrect. Because skincare regimens are individualized and cosmetic hygiene seals must remain preserved, we do not support direct swaps for different product formulas. If you wish to try a different formulation, eligible unopened items may be returned for a refund and a new order placed.',
  },
];

export const MyrklsReturnsRefundsPage: React.FC<MyrklsReturnsRefundsPageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateOurScience,
  onNavigateAboutUs,
  onNavigateContactUs,
  onNavigateTerms,
  onNavigatePrivacy,
  onNavigateShipping,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateContactUs) {
      onNavigateContactUs();
    } else {
      window.location.hash = '#contact-us';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateAccount) {
      onNavigateAccount();
    } else {
      window.location.hash = '#account';
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
        {/* SECTION 01 — RETURNS & REFUNDS HERO (COMPACT EDITORIAL)  */}
        {/* ======================================================== */}
        <section
          id="section-returns-hero"
          aria-label="Returns and Refunds Policy Hero"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] py-14 sm:py-18 lg:py-22"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[780px]">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                MYRKLS / CUSTOMER CARE
              </span>

              <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[44px] lg:text-[54px] font-bold text-[#173B2B] tracking-tight uppercase leading-[1.06]">
                RETURNS &<br />REFUNDS.
              </h1>

              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16.5px] text-[#4A5550] leading-relaxed">
                Everything you need to know about returns, refunds and getting help with your MYRKLS order.
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

              {/* Operational Standards Notice */}
              <div className="mt-6 p-4 sm:p-5 bg-white border border-[#E2DDD5] flex items-start gap-3.5">
                <ShieldAlert size={18} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                <div className="text-[12.5px] font-sans text-[#55625B] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[#173B2B] block mb-0.5">
                    Notice: Personal Hygiene & Statutory Standards
                  </span>
                  All MYRKLS orders are dispatched in tamper-evident protective packaging. In accordance with personal cosmetic hygiene standards and applicable consumer rights, unopened eligible formulations or orders with verified transit discrepancies are supported through our concierge care team.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 02 — POLICY AT A GLANCE (4 COMPACT COLUMNS)      */}
        {/* ======================================================== */}
        <section
          id="section-returns-glance"
          aria-label="Returns Policy at a Glance"
          className="w-full bg-white py-14 sm:py-18 lg:py-20 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {/* Header: Centered Eyebrow & Heading */}
            <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                GOOD TO KNOW
              </span>
              <h2 className="font-['Syne',sans-serif] text-[26px] sm:text-[34px] lg:text-[40px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.1]">
                THE IMPORTANT<br />DETAILS.
              </h2>
              <p className="mt-3 text-[14px] sm:text-[15px] text-[#55625B] leading-relaxed">
                Clear, transparent guidance on eligibility, condition, refunds and support.
              </p>
            </div>

            {/* 4 Compact Blocks (1 Row on Desktop, 2-Col Grid on Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Block 01: Return Eligibility */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">01</span>
                    <ShieldCheck size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    RETURN ELIGIBILITY
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Due to strict personal cosmetic hygiene standards, formulations qualify for return if unopened with all tamper-evident seals intact, or where non-conforming or defective items were delivered.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  Seal Integrity Required
                </div>
              </div>

              {/* Block 02: Product Condition */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">02</span>
                    <Package size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    PRODUCT CONDITION
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Products must remain in their original external packaging with barcode labels and batch numbers legible. A valid MYRKLS order confirmation or tax invoice is required as proof of purchase.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  Original Packaging & Invoice
                </div>
              </div>

              {/* Block 03: Refund Process */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">03</span>
                    <RotateCcw size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    REFUND PROCESS
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    Approved refunds are initiated within 3 to 5 business days upon warehouse verification. Credited directly back to original payment methods, or via verified bank transfer for COD.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  3 to 5 Business Days
                </div>
              </div>

              {/* Block 04: Customer Support */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">04</span>
                    <Headphones size={19} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    CUSTOMER SUPPORT
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[#55625B] leading-relaxed">
                    For transit damage, defective pumps, or incorrect shipments, report the issue within 48 hours of delivery with clear photographs so our concierge team can prioritize replacement dispatch.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#888888] uppercase">
                  48-Hour Reporting Window
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 03 — HOW TO REQUEST A RETURN (3-STEP PROCESS)    */}
        {/* ======================================================== */}
        <section
          id="section-returns-steps"
          aria-label="How to Request a Return or Report an Issue"
          className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[880px] mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  HOW IT WORKS
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  WE&apos;LL HELP YOU<br />SORT IT OUT.
                </h2>
                <p className="mt-3.5 text-[14px] sm:text-[15.5px] text-[#55625B] leading-relaxed max-w-xl mx-auto">
                  Simple, structured assistance for every order query, defect report, or eligible return.
                </p>
              </div>

              {/* 3-Step Refined Horizontal Process */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Step 01 */}
                <div className="bg-white border border-[#E5E0D8] p-6 rounded-none relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">
                        STEP 01
                      </span>
                      <Mail size={18} className="text-[#173B2B]" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                      CONTACT OUR TEAM
                    </h3>
                    <p className="mt-2.5 text-[13.5px] text-[#55625B] leading-relaxed">
                      Reach out through our verified Contact Us form or email concierge@myrkls.com. Provide your order number, mobile number, and a brief description of the issue.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#F0EBE3] text-[11px] font-mono text-[#888888] uppercase">
                    Initial Verification
                  </div>
                </div>

                {/* Step 02 */}
                <div className="bg-white border border-[#E5E0D8] p-6 rounded-none relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">
                        STEP 02
                      </span>
                      <Camera size={18} className="text-[#173B2B]" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                      SHARE ORDER DETAILS
                    </h3>
                    <p className="mt-2.5 text-[13.5px] text-[#55625B] leading-relaxed">
                      If reporting transit damage, a defective pump, or an incorrect item, our concierge team will request clear photos of the shipping box, product packaging, and batch details.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#F0EBE3] text-[11px] font-mono text-[#888888] uppercase">
                    Photo Documentation
                  </div>
                </div>

                {/* Step 03 */}
                <div className="bg-white border border-[#E5E0D8] p-6 rounded-none relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF5A1F] uppercase">
                        STEP 03
                      </span>
                      <CheckCircle2 size={18} className="text-[#173B2B]" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                      NEXT STEPS
                    </h3>
                    <p className="mt-2.5 text-[13.5px] text-[#55625B] leading-relaxed">
                      Upon warehouse and support review, our team coordinates the applicable resolution—arranging priority replacement dispatch, return courier pickup, or direct payment refund.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#F0EBE3] text-[11px] font-mono text-[#888888] uppercase">
                    Resolution Handled
                  </div>
                </div>
              </div>

              {/* Compact CTA Below Steps */}
              <div className="mt-10 sm:mt-12 text-center">
                <a
                  href="#contact-us"
                  onClick={handleContactClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>REQUEST SUPPORT</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — RETURNS & REFUNDS EXPLAINED (FAQ ACCORDION) */}
        {/* ======================================================== */}
        <section
          id="section-returns-faq"
          aria-label="Frequently Asked Questions on Returns and Refunds"
          className="w-full bg-white py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[760px] mx-auto">
              <div className="text-center mb-10 sm:mb-14">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  COMMON QUESTIONS
                </span>
                <h2 className="font-['Syne',sans-serif] text-[26px] sm:text-[34px] lg:text-[40px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.1]">
                  GOOD TO KNOW<br />BEFORE YOU REQUEST.
                </h2>
                <p className="mt-3 text-[14px] sm:text-[15px] text-[#55625B] leading-relaxed">
                  Clear answers to the most frequent questions regarding our return and refund policies.
                </p>
              </div>

              {/* Clean Single-Column Accordion */}
              <div className="divide-y divide-[#E8E4DC] border-y border-[#E8E4DC]">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full py-5 sm:py-6 flex items-center justify-between text-left gap-4 hover:text-[#173B2B] transition-colors cursor-pointer group"
                      >
                        <span className="font-['Syne',sans-serif] text-[15px] sm:text-[17px] font-bold text-[#173B2B] tracking-tight group-hover:text-[#FF5A1F] transition-colors">
                          {item.q}
                        </span>
                        <div className="shrink-0 w-7 h-7 rounded-none border border-[#DDD8D0] bg-[#FAFAF8] flex items-center justify-center text-[#173B2B] group-hover:border-[#FF5A1F] group-hover:text-[#FF5A1F] transition-colors">
                          {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="pb-6 text-[13.5px] sm:text-[14.5px] text-[#55625B] font-normal leading-relaxed pr-6">
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
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 05 — NEED HELP WITH AN ORDER? (SOFT SAGE BLOCK)  */}
        {/* ======================================================== */}
        <section
          id="section-returns-help"
          aria-label="Need Help with an Order Support Section"
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
                Something not right with your order? Get in touch with our team and we&apos;ll help you understand the next steps.
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#contact-us"
                  onClick={handleContactClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>CONTACT SUPPORT</span>
                  <ArrowRight size={14} />
                </a>

                <a
                  href="#account"
                  onClick={handleTrackClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-[#111111] hover:text-white text-[#111111] border border-[#DDD8D0] text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>TRACK YOUR ORDER</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Related Policy Links Row */}
              <div className="mt-8 pt-6 border-t border-[#D5DCD0] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] font-sans font-semibold text-[#173B2B]">
                <a
                  href="#shipping-policy"
                  onClick={handleShippingClick}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Truck size={12} className="text-[#FF5A1F]" />
                  <span>Shipping Policy</span>
                </a>
                <span className="text-[#C5D0C5]">•</span>
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
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* SHARED MYRKLS RETINA FOOTER                              */}
      {/* ======================================================== */}
      <MyrklsFooter
        onNavigateHome={onBackToHome}
        onNavigateViewAll={onNavigateViewAll}
        onNavigateProduct={onNavigateProduct}
        onNavigateAboutUs={onNavigateAboutUs}
        onNavigateContactUs={onNavigateContactUs}
        onNavigateTerms={onNavigateTerms}
        onNavigatePrivacy={onNavigatePrivacy}
      />
    </div>
  );
};

export default MyrklsReturnsRefundsPage;
