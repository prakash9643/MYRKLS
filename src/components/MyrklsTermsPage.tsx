import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ArrowRight,
  ArrowUpRight,
  X,
  FileText,
  Mail,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';

export interface MyrklsTermsPageProps {
  onBackToHome?: () => void;
  onNavigateViewAll?: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateOurScience?: () => void;
  onNavigateAboutUs?: () => void;
  onNavigateContactUs?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateShipping?: () => void;
}

const TABLE_OF_CONTENTS = [
  { id: 'sec-01', number: '01', title: 'About These Terms' },
  { id: 'sec-02', number: '02', title: 'Eligibility & Accounts' },
  { id: 'sec-03', number: '03', title: 'Products & Information' },
  { id: 'sec-04', number: '04', title: 'Pricing & Payments' },
  { id: 'sec-05', number: '05', title: 'Orders & Cancellations' },
  { id: 'sec-06', number: '06', title: 'Shipping & Delivery' },
  { id: 'sec-07', number: '07', title: 'Returns & Refunds' },
  { id: 'sec-08', number: '08', title: 'Website Use & Intellectual Property' },
  { id: 'sec-09', number: '09', title: 'Liability & Legal Terms' },
  { id: 'sec-10', number: '10', title: 'Contact Information' },
];

export const MyrklsTermsPage: React.FC<MyrklsTermsPageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateOurScience,
  onNavigateAboutUs,
  onNavigateContactUs,
  onNavigatePrivacy,
  onNavigateShipping,
}) => {
  const [policyModal, setPolicyModal] = useState<'shipping' | 'returns' | 'privacy' | null>(null);

  // Scroll to top on initial page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lock body scroll when policy modal is open
  useEffect(() => {
    if (policyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [policyModal]);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
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

  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-[#111111] selection:bg-[#111111] selection:text-white flex flex-col font-sans">
      {/* ======================================================== */}
      {/* SHARED MYRKLS HEADER                                     */}
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
        {/* SECTION 01 — LEGAL HERO (TEXT-FIRST COMPACT)             */}
        {/* ======================================================== */}
        <section
          id="section-legal-hero"
          aria-label="Terms and Conditions Legal Hero"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] py-14 sm:py-18 lg:py-22"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[780px]">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                MYRKLS / LEGAL
              </span>

              <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[44px] lg:text-[54px] font-bold text-[#173B2B] tracking-tight uppercase leading-[1.06]">
                TERMS &<br />CONDITIONS.
              </h1>

              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16.5px] text-[#4A5550] leading-relaxed">
                Please read these terms carefully before using our website or placing an order with MYRKLS.
              </p>

              {/* Verified Last Updated Date & Status Badge */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] sm:text-[12px] font-mono">
                <span className="px-3 py-1.5 bg-white border border-[#DDD8D0] font-bold text-[#173B2B] uppercase tracking-wider">
                  LAST UPDATED: 14 OCTOBER 2026
                </span>
                <span className="px-3 py-1.5 bg-[#FFF4E5] border border-[#FFE0B2] text-[#9A3412] font-semibold uppercase tracking-wider">
                  DRAFT FRAMEWORK FOR LEGAL REVIEW
                </span>
              </div>

              {/* Notice Banner */}
              <div className="mt-6 p-4 sm:p-5 bg-white border border-[#E2DDD5] flex items-start gap-3.5">
                <ShieldAlert size={18} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                <div className="text-[12.5px] font-sans text-[#55625B] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[#173B2B] block mb-0.5">
                    Notice: Draft Framework Requiring Formal Corporate Approval
                  </span>
                  This document serves as an operational draft framework governing website use and product ordering. Official corporate identification numbers, registered office addresses, and formal dispute resolution venues are designated for final legal counsel sign-off prior to commercial publication.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 02 — QUICK NAVIGATION (TABLE OF CONTENTS)        */}
        {/* ======================================================== */}
        <section
          id="section-quick-nav"
          aria-label="Table of Contents Quick Navigation"
          className="w-full bg-white py-12 sm:py-16 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[880px] mx-auto">
              <div className="mb-8">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-1.5">
                  ON THIS PAGE
                </span>
                <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[30px] font-bold text-[#173B2B] uppercase tracking-tight">
                  FIND WHAT YOU NEED.
                </h2>
              </div>

              {/* 2-Column Responsive Link Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {TABLE_OF_CONTENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScrollToSection(item.id)}
                    className="p-3.5 sm:p-4 bg-[#FAFAF8] border border-[#E5E0D8] hover:border-[#173B2B] hover:bg-white text-left transition-all duration-150 flex items-center justify-between group cursor-pointer rounded-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-bold text-[#FF5A1F] tracking-wider">
                        {item.number}
                      </span>
                      <span className="text-[13px] sm:text-[14px] font-sans font-semibold text-[#173B2B] group-hover:text-[#FF5A1F] transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-[#888888] group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 03 — SHOPPING WITH MYRKLS (SUBSECTIONS 01 - 06)   */}
        {/* ======================================================== */}
        <section
          id="section-shopping-terms"
          aria-label="Shopping With MYRKLS Terms"
          className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[820px] mx-auto">
              <div className="mb-10 sm:mb-14 pb-4 border-b border-[#E5E0D8]">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  SHOPPING TERMS
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  BEFORE YOU ORDER.
                </h2>
              </div>

              {/* Subsections 01 through 06 */}
              <div className="space-y-12 sm:space-y-14">
                {/* 01 — ABOUT THESE TERMS */}
                <article id="sec-01" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">01</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      About These Terms
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      These Terms & Conditions govern your access to and use of the MYRKLS digital ecommerce platform (the &quot;Website&quot;) and all purchases of MYRKLS skincare formulations made through it. By browsing the Website, registering an account, or placing an order, you agree to be bound by these Terms and our published policies.
                    </p>
                    <p>
                      The store is operated on behalf of the MYRKLS brand. <em>[Operating Legal Entity Name & Corporate Registered Entity: Placeholder for formal corporate identifier and registration details upon final counsel review.]</em>
                    </p>
                  </div>
                </article>

                {/* 02 — ELIGIBILITY & ACCOUNTS */}
                <article id="sec-02" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">02</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Eligibility & Accounts
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      To purchase formulations through the Website, you must be at least 18 years of age or possess the requisite legal capacity under applicable laws to enter into binding agreements.
                    </p>
                    <p>
                      When registering an account or placing an order, you agree to provide truthful, accurate, and current contact and delivery information. You are solely responsible for maintaining the confidentiality of your account credentials, login OTPs, and any activity executed through your account. Please notify customer support immediately if you suspect unauthorized account access.
                    </p>
                  </div>
                </article>

                {/* 03 — PRODUCTS & INFORMATION */}
                <article id="sec-03" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">03</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Products & Information
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      We make every reasonable effort to display our formulation bottles, textures, and product specifications accurately. However, actual physical packaging and formulation color may exhibit minor variations depending on display monitors, photographic lighting, and natural botanical ingredient harvest lots.
                    </p>
                    <p>
                      <strong>Cosmetic Nature Disclaimer:</strong> MYRKLS formulations are developed strictly for topical skincare and cosmetic maintenance (supporting hydration, smooth texture, skin renewal, and moisture barrier integrity). They do not constitute pharmaceutical remedies, drugs, or medical cures for pathological skin disorders. Individual skin responses vary. We advise customers to review full ingredient listings and perform a 24-hour patch test prior to introducing new active bio-conjugates.
                    </p>
                  </div>
                </article>

                {/* 04 — PRICING & PAYMENTS */}
                <article id="sec-04" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">04</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Pricing & Payments
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      All prices listed on the Website are in Indian Rupees (₹) and include applicable Goods and Services Tax (GST) unless explicitly noted otherwise. Prices and promotional offers are subject to adjustment without prior notice, but price changes will not affect orders that have already received payment confirmation.
                    </p>
                    <p>
                      We support verified payment channels including Unified Payments Interface (UPI), Credit/Debit cards, Net Banking, and Cash on Delivery (COD) for eligible serviceable PIN codes. Payments are processed through secure, encrypted payment gateways.
                    </p>
                    <p>
                      In the rare event of an inadvertent typographical or system error where a product is listed at an incorrect price, MYRKLS reserves the right to decline or cancel the affected order and issue a full refund to the original payment source.
                    </p>
                  </div>
                </article>

                {/* 05 — ORDERS & CANCELLATIONS */}
                <article id="sec-05" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">05</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Orders & Cancellations
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      After completing checkout, you will receive an automated order confirmation via email or SMS. This confirmation acknowledges receipt of your purchase request but does not signify formal acceptance of your order. Formal contract acceptance occurs when the items are packaged and handed over to our delivery logistics partner.
                    </p>
                    <p>
                      <strong>Order Cancellation:</strong> You may request order cancellation provided your parcel has not yet been processed and dispatched from our fulfillment center. Once an order is handed over to the courier partner, cancellation is no longer possible and the parcel must be processed under our standard Returns & Refunds procedure.
                    </p>
                  </div>
                </article>

                {/* 06 — SHIPPING & DELIVERY */}
                <article id="sec-06" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">06</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Shipping & Delivery
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      Orders are packaged in secure, temperature-conscious materials and dispatched via priority courier services across all serviceable Indian PIN codes. Orders are processed Monday through Saturday, excluding gazetted national holidays.
                    </p>
                    <p>
                      Estimated delivery timelines typically range between 3 to 5 business days from dispatch. Customers are responsible for providing an accurate delivery address and accessible contact phone number.
                    </p>
                    <p className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPolicyModal('shipping')}
                        className="inline-flex items-center gap-1.5 text-[12px] font-sans font-bold uppercase tracking-wider text-[#173B2B] hover:text-[#FF5A1F] underline cursor-pointer"
                      >
                        <span>View Published Shipping & Delivery Policy</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — POLICIES & RESPONSIBILITIES (07 - 10)       */}
        {/* ======================================================== */}
        <section
          id="section-policies-responsibilities"
          aria-label="Policies and Responsibilities"
          className="w-full bg-white py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[820px] mx-auto">
              <div className="mb-10 sm:mb-14 pb-4 border-b border-[#E5E0D8]">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  IMPORTANT INFORMATION
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  A FEW MORE THINGS<br />TO KNOW.
                </h2>
              </div>

              {/* Subsections 07 through 10 */}
              <div className="space-y-12 sm:space-y-14">
                {/* 07 — RETURNS & REFUNDS */}
                <article id="sec-07" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">07</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Returns & Refunds
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      Due to strict personal cosmetic hygiene standards, formulations are eligible for return only if they remain in their original, unopened packaging with all tamper-evident seals intact.
                    </p>
                    <p>
                      If your parcel arrives damaged, defective, or contains an incorrect item, please notify our customer support team within 48 hours of delivery with photographic evidence and your order number. Approved refunds are credited to the original payment source within 3 to 5 business days upon warehouse verification.
                    </p>
                    <p className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPolicyModal('returns')}
                        className="inline-flex items-center gap-1.5 text-[12px] font-sans font-bold uppercase tracking-wider text-[#173B2B] hover:text-[#FF5A1F] underline cursor-pointer"
                      >
                        <span>View Published Returns & Refunds Policy</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </p>
                  </div>
                </article>

                {/* 08 — WEBSITE USE & INTELLECTUAL PROPERTY */}
                <article id="sec-08" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">08</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Website Use & Intellectual Property
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      All intellectual property, proprietary assets, formulation trademarks (including VISION™, INCARNATION™, REBIRTH™, ETERNITY™, RESTORATION™, AWAKENING™, and SENTINEL™), logos, design systems, editorial imagery, and digital code remain the exclusive property of MYRKLS.
                    </p>
                    <p>
                      You are granted a limited, personal, non-commercial license to access the Website. You agree not to copy, reproduce, scrape, mirror, reverse-engineer, or commercially exploit any content without prior written authorization from MYRKLS.
                    </p>
                  </div>
                </article>

                {/* 09 — LIABILITY & LEGAL TERMS */}
                <article id="sec-09" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">09</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Liability & Legal Terms
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      To the maximum extent permitted by applicable Indian law, the Website and formulations are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied.
                    </p>
                    <p>
                      MYRKLS does not accept liability for indirect, incidental, or consequential damages resulting from website downtime or improper cosmetic application contrary to published instructions. Nothing in these Terms excludes or limits statutory consumer rights that cannot be waived under Indian consumer protection regulations.
                    </p>
                    <p>
                      <em>[Governing Law, Dispute Jurisdiction & Legal Arbitration Forum: Placeholder to be formally inserted upon legal counsel sign-off in accordance with applicable laws in India.]</em>
                    </p>
                  </div>
                </article>

                {/* 10 — CONTACT INFORMATION */}
                <article id="sec-10" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">10</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Contact Information
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      For any questions regarding these Terms & Conditions, order status, or consumer inquiries, please reach out through our official customer care channel:
                    </p>
                    <div className="bg-[#FAF9F7] border border-[#E5E0D8] p-4 sm:p-5 rounded-none space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Mail size={16} className="text-[#173B2B]" />
                        <span className="font-bold text-[#173B2B] text-[13px] sm:text-[14px]">
                          Official Support Email:
                        </span>
                        <a
                          href="mailto:concierge@myrkls.com"
                          className="text-[#FF5A1F] hover:underline font-mono font-bold text-[13px]"
                        >
                          concierge@myrkls.com
                        </a>
                      </div>
                      <p className="text-[12.5px] text-[#666666]">
                        Direct message form: Visit our{' '}
                        <a
                          href="#contact-us"
                          onClick={handleContactClick}
                          className="text-[#173B2B] underline font-bold hover:text-[#FF5A1F]"
                        >
                          Contact Us
                        </a>{' '}
                        page to submit an inquiry.
                      </p>
                      <p className="text-[11.5px] text-[#888888] italic pt-1 border-t border-[#E5E0D8]">
                        [Registered Office Address, Corporate Identification Number (CIN), GSTIN & Statutory Grievance Redressal Officer to be finalized following legal review.]
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 05 — NEED CLARIFICATION? (CLOSING SAGE SECTION)  */}
        {/* ======================================================== */}
        <section
          id="section-clarification"
          aria-label="Need Clarification Support Section"
          className="w-full bg-[#E9EDE6] py-14 sm:py-18 border-b border-[#DDD8D0]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[680px] mx-auto text-center">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                WE&apos;RE HERE TO HELP
              </span>

              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] font-bold text-[#173B2B] uppercase tracking-tight">
                HAVE A QUESTION?
              </h2>

              <p className="mt-3 text-[14px] sm:text-[15.5px] text-[#4A5550] leading-relaxed">
                Need help understanding our policies or have a question about your order? Our team is here to help.
              </p>

              <div className="mt-7">
                <a
                  href="#contact-us"
                  onClick={handleContactClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>CONTACT SUPPORT</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Related Policy Links Row */}
              <div className="mt-8 pt-6 border-t border-[#D5DCD0] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] font-sans font-semibold text-[#173B2B]">
                <a
                  href="#privacy-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigatePrivacy) {
                      onNavigatePrivacy();
                    } else {
                      window.location.hash = '#privacy-policy';
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Lock size={12} className="text-[#FF5A1F]" />
                  <span>Privacy Policy</span>
                </a>
                <span className="text-[#C5D0C5]">•</span>
                <a
                  href="#shipping-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateShipping) {
                      onNavigateShipping();
                    } else {
                      window.location.hash = '#shipping-policy';
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <FileText size={12} className="text-[#FF5A1F]" />
                  <span>Shipping & Delivery Policy</span>
                </a>
                <span className="text-[#C5D0C5]">•</span>
                <button
                  type="button"
                  onClick={() => setPolicyModal('returns')}
                  className="hover:text-[#FF5A1F] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <FileText size={12} className="text-[#FF5A1F]" />
                  <span>Returns & Refunds Policy</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* RELATED POLICY MODAL (SHIPPING / RETURNS / PRIVACY)      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {policyModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-policy-title"
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
                    id="terms-policy-title"
                    className="font-['Syne',sans-serif] text-[19px] sm:text-[22px] font-bold uppercase tracking-tight text-[#173B2B] mt-0.5"
                  >
                    {policyModal === 'shipping'
                      ? 'Shipping & Delivery Policy'
                      : policyModal === 'returns'
                      ? 'Returns & Refunds Policy'
                      : 'Privacy Policy'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setPolicyModal(null)}
                  aria-label="Close modal"
                  className="w-9 h-9 bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#DDD8D0] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#E5E0D8] bg-[#EAE7DF]/40 text-[11.5px] font-sans font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setPolicyModal('shipping')}
                  className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer ${
                    policyModal === 'shipping'
                      ? 'bg-white text-[#173B2B] border-b-2 border-[#173B2B]'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Shipping & Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyModal('returns')}
                  className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer ${
                    policyModal === 'returns'
                      ? 'bg-white text-[#173B2B] border-b-2 border-[#173B2B]'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Returns & Refunds
                </button>
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer ${
                    policyModal === 'privacy'
                      ? 'bg-white text-[#173B2B] border-b-2 border-[#173B2B]'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Privacy Policy
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 text-[13.5px] font-normal leading-relaxed text-[#444444]">
                {policyModal === 'shipping' ? (
                  <>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        01. Processing & Dispatch
                      </h4>
                      <p>
                        All MYRKLS formulations are dispatched in secure, temperature-conscious packaging via priority courier partners across all serviceable Indian PIN codes.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        02. Estimated Delivery Timelines
                      </h4>
                      <p>
                        Standard priority delivery typically arrives within 3 to 5 business days depending on location. Exact estimated delivery dates and tracking carrier links are provided upon dispatch and accessible through your order updates.
                      </p>
                    </div>
                  </>
                ) : policyModal === 'returns' ? (
                  <>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        01. Return Eligibility
                      </h4>
                      <p>
                        To ensure formulation hygiene and safety, products must be in their original unopened packaging with tamper-evident seals intact. If your order arrives damaged or defective, please contact support within 48 hours.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        02. Refund Processing Timeline
                      </h4>
                      <p>
                        Approved refunds are credited directly back to the original payment source within 3 to 5 business days upon warehouse verification.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        01. Information Collection Framework
                      </h4>
                      <p>
                        MYRKLS collects necessary customer data exclusively to deliver secure order fulfillment, OTP-verified authentication, and customer support. This includes contact details (mobile number, delivery address, email) provided willingly during checkout.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        02. Customer Data Rights
                      </h4>
                      <p>
                        Customers maintain full access to their saved addresses and contact profiles through the MY ACCOUNT dashboard. You may request data modification or deletion by contacting customer support.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#F4F1EA] border-t border-[#E5E0D8] flex items-center justify-between">
                <span className="text-[11.5px] text-[#666666]">
                  Need further clarification? Reach us at concierge@myrkls.com
                </span>
                <button
                  type="button"
                  onClick={() => setPolicyModal(null)}
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
        onNavigateTerms={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigatePrivacy={onNavigatePrivacy}
      />
    </div>
  );
};

export default MyrklsTermsPage;
