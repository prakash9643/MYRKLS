import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ArrowRight,
  X,
  FileText,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';

export interface MyrklsPrivacyPolicyPageProps {
  onBackToHome?: () => void;
  onNavigateViewAll?: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateOurScience?: () => void;
  onNavigateAboutUs?: () => void;
  onNavigateContactUs?: () => void;
  onNavigateTerms?: () => void;
  onNavigateShipping?: () => void;
}

const TABLE_OF_CONTENTS = [
  { id: 'sec-01', number: '01', title: 'Information We Collect' },
  { id: 'sec-02', number: '02', title: 'How We Use Your Information' },
  { id: 'sec-03', number: '03', title: 'Orders, Payments & Delivery' },
  { id: 'sec-04', number: '04', title: 'Cookies & Analytics' },
  { id: 'sec-05', number: '05', title: 'When We Share Information' },
  { id: 'sec-06', number: '06', title: 'Data Security & Retention' },
  { id: 'sec-07', number: '07', title: 'Your Privacy Choices & Rights' },
  { id: 'sec-08', number: '08', title: "Children's Privacy" },
  { id: 'sec-09', number: '09', title: 'Policy Updates' },
  { id: 'sec-10', number: '10', title: 'Contact & Privacy Requests' },
];

export const MyrklsPrivacyPolicyPage: React.FC<MyrklsPrivacyPolicyPageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateOurScience,
  onNavigateAboutUs,
  onNavigateContactUs,
  onNavigateTerms,
  onNavigateShipping,
}) => {
  const [policyModal, setPolicyModal] = useState<'shipping' | 'returns' | null>(null);

  // Scroll to top on mount
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

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateTerms) {
      onNavigateTerms();
    } else {
      window.location.hash = '#terms';
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
        {/* SECTION 01 — PRIVACY POLICY HERO (COMPACT EDITORIAL)     */}
        {/* ======================================================== */}
        <section
          id="section-privacy-hero"
          aria-label="Privacy Policy Hero"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] py-14 sm:py-18 lg:py-22"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[780px]">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                MYRKLS / LEGAL
              </span>

              <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[44px] lg:text-[54px] font-bold text-[#173B2B] tracking-tight uppercase leading-[1.06]">
                PRIVACY<br />POLICY.
              </h1>

              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16.5px] text-[#4A5550] leading-relaxed">
                Your privacy matters to us. This policy explains how MYRKLS handles personal information when you browse our website, shop with us or contact our team.
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

              {/* Framework Notice Banner */}
              <div className="mt-6 p-4 sm:p-5 bg-white border border-[#E2DDD5] flex items-start gap-3.5">
                <ShieldAlert size={18} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                <div className="text-[12.5px] font-sans text-[#55625B] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[#173B2B] block mb-0.5">
                    Notice: Draft Privacy Framework Requiring Formal Corporate Approval
                  </span>
                  This document outlines our operational privacy practices for browsing, customer accounts, and order processing. Statutory grievance officer designations, corporate registration identifiers, and formal data fiduciary details are marked for legal counsel review in accordance with applicable Indian privacy and ecommerce laws (including the Digital Personal Data Protection framework).
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
        {/* SECTION 03 — YOUR DATA & SHOPPING (SUBSECTIONS 01 - 04)   */}
        {/* ======================================================== */}
        <section
          id="section-data-shopping"
          aria-label="Your Data and Shopping Subsections"
          className="w-full bg-[#FAFAF8] py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[820px] mx-auto">
              <div className="mb-10 sm:mb-14 pb-4 border-b border-[#E5E0D8]">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  YOUR INFORMATION
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  HOW YOUR DATA<br />HELPS US SERVE YOU.
                </h2>
              </div>

              {/* Subsections 01 through 04 */}
              <div className="space-y-12 sm:space-y-14">
                {/* 01 — INFORMATION WE COLLECT */}
                <article id="sec-01" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">01</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Information We Collect
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      MYRKLS collects information necessary to deliver personalized skincare experiences, process purchase orders, and provide responsive customer support. The categories of information we collect include:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] sm:text-[14.5px] text-[#4A5550]">
                      <li>
                        <strong>Name & Contact Details:</strong> Your full name, email address, and mobile phone number provided during account registration or checkout.
                      </li>
                      <li>
                        <strong>Delivery & Billing Information:</strong> Shipping addresses, landmark details, city, state, postal PIN code, and recipient telephone numbers.
                      </li>
                      <li>
                        <strong>Account & Login Records:</strong> Profile preferences, secure OTP verification records, and session tokens.
                      </li>
                      <li>
                        <strong>Order History & Transactions:</strong> Formulations purchased, order reference numbers, purchase amounts, order status, and preferred payment mode.
                      </li>
                      <li>
                        <strong>Customer Support Messages:</strong> Inquiries sent through our Contact Us form, email correspondence to our support team, and support ticket records.
                      </li>
                      <li>
                        <strong>Device & Website Usage:</strong> Browser user agent, device screen dimensions, operating system, and IP address collected automatically to ensure responsive display and site integrity.
                      </li>
                      <li>
                        <strong>Marketing Preferences:</strong> Your explicit choices regarding email newsletters and SMS order status alerts.
                      </li>
                    </ul>
                  </div>
                </article>

                {/* 02 — HOW WE USE YOUR INFORMATION */}
                <article id="sec-02" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">02</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      How We Use Your Information
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      We process personal data only for clear, legitimate commercial purposes connected to our skincare offerings:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] sm:text-[14.5px] text-[#4A5550]">
                      <li>
                        <strong>Fulfillment & Logistics:</strong> Processing payments, preparing temperature-conscious packaging, generating invoices, and coordinating courier delivery.
                      </li>
                      <li>
                        <strong>Order Updates:</strong> Sending automated order confirmations, dispatch notices, and carrier tracking links via email or SMS.
                      </li>
                      <li>
                        <strong>Customer Care:</strong> Investigating inquiries, answering formulation questions, and resolving delivery or refund requests.
                      </li>
                      <li>
                        <strong>Account Management:</strong> Allowing you to view past orders, maintain saved delivery addresses, and manage wishlists.
                      </li>
                      <li>
                        <strong>Fraud Prevention & Platform Security:</strong> Deterring payment fraud, detecting unauthorized logins, and safeguarding customer data.
                      </li>
                      <li>
                        <strong>Opt-in Communications:</strong> Sharing skincare insights, product announcements, and routine recommendations strictly when you have consented, with an easy opt-out mechanism.
                      </li>
                    </ul>
                  </div>
                </article>

                {/* 03 — ORDERS, PAYMENTS & DELIVERY */}
                <article id="sec-03" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">03</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Orders, Payments & Delivery
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      When you purchase formulations through MYRKLS, transaction data is handled with strict procedural separation:
                    </p>
                    <p>
                      <strong>Payment Gateway Processing:</strong> Digital payments via UPI, Credit/Debit cards, and Net Banking are executed through authorized, encrypted third-party payment gateways. <strong>MYRKLS does not collect or store full credit or debit card numbers, card security codes (CVV), or bank account passwords on our servers.</strong> All card authentication occurs directly within the certified payment partner&apos;s encrypted interface.
                    </p>
                    <p>
                      <strong>Delivery Partner Handover:</strong> To deliver physical parcels, your recipient name, delivery address, postal PIN code, and contact number are transmitted to our contracted priority logistics partners (such as BlueDart Express). Our delivery partners are authorized to use this data exclusively for parcel transport and delivery coordination.
                    </p>
                  </div>
                </article>

                {/* 04 — COOKIES & ANALYTICS */}
                <article id="sec-04" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">04</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Cookies & Analytics
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      The MYRKLS website uses standard web technologies, including browser cookies and local storage (such as browser <code>localStorage</code>), to deliver core ecommerce features:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] sm:text-[14.5px] text-[#4A5550]">
                      <li>
                        <strong>Essential Storage:</strong> Preserves items in your shopping cart across page transitions, retains session authentication, and stores active interface preferences.
                      </li>
                      <li>
                        <strong>Performance Diagnostics:</strong> Aggregated, non-personally identifiable metrics that help our engineering team monitor server response times and optimize mobile rendering.
                      </li>
                    </ul>
                    <p>
                      You can modify your browser settings at any time to block, limit, or delete cookies and web storage. Please note that disabling essential storage may prevent shopping cart retention, checkout execution, or account login from functioning correctly.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — PRIVACY, SECURITY & CHOICES (05 - 10)       */}
        {/* ======================================================== */}
        <section
          id="section-security-choices"
          aria-label="Privacy, Security and Choices Subsections"
          className="w-full bg-white py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[820px] mx-auto">
              <div className="mb-10 sm:mb-14 pb-4 border-b border-[#E5E0D8]">
                <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                  YOUR PRIVACY
                </span>
                <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                  YOUR INFORMATION.<br />YOUR CHOICES.
                </h2>
              </div>

              {/* Subsections 05 through 10 */}
              <div className="space-y-12 sm:space-y-14">
                {/* 05 — WHEN WE SHARE INFORMATION */}
                <article id="sec-05" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">05</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      When We Share Information
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      MYRKLS does not sell, rent, or trade your personal information to external third parties or data brokers. Personal data is shared strictly in the following operational scenarios:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] sm:text-[14.5px] text-[#4A5550]">
                      <li>
                        <strong>Authorized Service Providers:</strong> Trusted third-party entities who support our operations (payment gateway operators, priority courier partners, secure cloud hosting providers, and customer support infrastructure).
                      </li>
                      <li>
                        <strong>Statutory & Legal Requirements:</strong> If required to do so by applicable Indian law, valid court order, or formal government regulation, or to protect the safety, rights, and property of MYRKLS, our customers, or the public.
                      </li>
                      <li>
                        <strong>Business Transitions:</strong> In the event of a merger, acquisition, or restructuring, customer information may be transferred as an operational asset subject to equivalent privacy protections.
                      </li>
                    </ul>
                  </div>
                </article>

                {/* 06 — DATA SECURITY & RETENTION */}
                <article id="sec-06" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">06</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Data Security & Retention
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      We employ reasonable administrative, technical, and physical safeguards designed to protect personal data against accidental loss, unauthorized access, alteration, and misuse. These measures include TLS/SSL encryption for data in transit, OTP verification protocols, and restricted internal access controls.
                    </p>
                    <p>
                      However, no method of transmission over the Internet or digital data storage system can be guaranteed completely invulnerable. While we strive to protect your personal information, customers acknowledge the inherent security risks of digital communications.
                    </p>
                    <p>
                      <strong>Retention Standard:</strong> We retain personal information for as long as your account remains active, as needed to fulfill purchase orders, or as required to meet statutory accounting, tax, and legal obligations under applicable Indian laws.
                    </p>
                  </div>
                </article>

                {/* 07 — YOUR PRIVACY CHOICES & RIGHTS */}
                <article id="sec-07" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">07</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Your Privacy Choices & Rights
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      You maintain direct control over your personal information through several accessible mechanisms:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] sm:text-[14.5px] text-[#4A5550]">
                      <li>
                        <strong>Account Self-Service:</strong> You can review your order history, modify profile details, and add or delete saved delivery addresses at any time through the <a href="#account" onClick={() => onNavigateAccount?.()} className="text-[#173B2B] font-bold underline hover:text-[#FF5A1F]">My Account</a> dashboard.
                      </li>
                      <li>
                        <strong>Marketing Opt-Out:</strong> You may manage email newsletter preferences inside your account or by clicking the &quot;Unsubscribe&quot; link in any promotional email.
                      </li>
                      <li>
                        <strong>Access, Correction & Deletion:</strong> You may request confirmation of personal data held, submit corrections to inaccurate records, or request account and data deletion by contacting customer care at <a href="mailto:concierge@myrkls.com" className="text-[#173B2B] font-bold underline hover:text-[#FF5A1F]">concierge@myrkls.com</a>.
                      </li>
                    </ul>
                  </div>
                </article>

                {/* 08 — CHILDREN'S PRIVACY */}
                <article id="sec-08" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">08</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Children&apos;s Privacy
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      The MYRKLS website and skincare formulations are intended solely for individuals who have attained the age of majority (18 years and older in India). We do not knowingly solicit or collect personal data from minors.
                    </p>
                    <p>
                      If a parent, guardian, or representative becomes aware that a minor has provided personal details without verified parental consent, please contact our support team immediately so that we can delete the information from our records.
                    </p>
                  </div>
                </article>

                {/* 09 — POLICY UPDATES */}
                <article id="sec-09" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">09</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Policy Updates
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      We may periodically update this Privacy Policy to reflect enhancements in our formulation services, operational changes, or statutory developments under Indian privacy laws (including applicable rules under the Digital Personal Data Protection Act).
                    </p>
                    <p>
                      When material changes occur, we will revise the &quot;Last Updated&quot; date at the top of this policy. Continued browsing or placing orders following the publication of revised terms constitutes acknowledgment of the updated framework.
                    </p>
                  </div>
                </article>

                {/* 10 — CONTACT & PRIVACY REQUESTS */}
                <article id="sec-10" className="scroll-mt-28">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#FF5A1F]">10</span>
                    <h3 className="font-['Syne',sans-serif] text-[18px] sm:text-[20px] font-bold uppercase text-[#173B2B] tracking-tight">
                      Contact & Privacy Requests
                    </h3>
                  </div>
                  <div className="text-[14px] sm:text-[15px] text-[#4A5550] leading-relaxed space-y-3.5 pl-6 sm:pl-7 border-l-2 border-[#DDD8D0]">
                    <p>
                      If you have questions, comments, or formal requests regarding this Privacy Policy or your personal information, please contact our customer care team:
                    </p>
                    <div className="bg-[#FAF9F7] border border-[#E5E0D8] p-4 sm:p-5 rounded-none space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Mail size={16} className="text-[#173B2B]" />
                        <span className="font-bold text-[#173B2B] text-[13px] sm:text-[14px]">
                          Official Privacy & Support Email:
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
                        page to submit a privacy inquiry.
                      </p>
                      <p className="text-[11.5px] text-[#888888] italic pt-1 border-t border-[#E5E0D8]">
                        [Statutory Grievance Redressal Officer, Data Protection Officer & Registered Corporate Address: Placeholders designated for formal corporate legal counsel sign-off in compliance with the Digital Personal Data Protection framework and applicable Indian laws.]
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 05 — PRIVACY QUESTIONS? (CLOSING SAGE BLOCK)     */}
        {/* ======================================================== */}
        <section
          id="section-privacy-clarification"
          aria-label="Privacy Questions Support Section"
          className="w-full bg-[#E9EDE6] py-14 sm:py-18 border-b border-[#DDD8D0]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="max-w-[680px] mx-auto text-center">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                NEED HELP?
              </span>

              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] font-bold text-[#173B2B] uppercase tracking-tight">
                HAVE A PRIVACY<br />QUESTION?
              </h2>

              <p className="mt-3 text-[14px] sm:text-[15.5px] text-[#4A5550] leading-relaxed">
                Have a question about your personal information or how it&apos;s handled? Get in touch with our team.
              </p>

              <div className="mt-7">
                <a
                  href="#contact-us"
                  onClick={handleContactClick}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                >
                  <span>CONTACT US</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Related Links Row */}
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
      {/* RELATED POLICY MODAL (SHIPPING / RETURNS)                */}
      {/* ======================================================== */}
      <AnimatePresence>
        {policyModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-modal-title"
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
                    id="privacy-policy-modal-title"
                    className="font-['Syne',sans-serif] text-[19px] sm:text-[22px] font-bold uppercase tracking-tight text-[#173B2B] mt-0.5"
                  >
                    {policyModal === 'shipping'
                      ? 'Shipping & Delivery Policy'
                      : 'Returns & Refunds Policy'}
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
                ) : (
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
        onNavigateTerms={onNavigateTerms}
        onNavigatePrivacy={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
};

export default MyrklsPrivacyPolicyPage;
