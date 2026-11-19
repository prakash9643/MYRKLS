import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  RefreshCw,
  HelpCircle,
  Mail,
  ShieldCheck,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { MyrklsHeader } from './MyrklsHeader';
import { MyrklsFooter } from './MyrklsFooter';
import { useAuth } from '../context/MyrklsAuthContext';

export interface MyrklsContactUsPageProps {
  onBackToHome?: () => void;
  onNavigateViewAll?: (category?: string) => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateOurScience?: () => void;
  onNavigateAboutUs?: () => void;
}

const FAQ_ITEMS = [
  {
    q: 'How can I track my MYRKLS order?',
    a: 'Use the tracking link in your order confirmation or visit My Account → My Orders when tracking is available.',
  },
  {
    q: 'Can I change my delivery address?',
    a: 'Contact support as soon as possible. Address changes depend on whether your order has already been processed or shipped.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Estimated delivery dates are shown during checkout or in your order updates when available.',
  },
  {
    q: 'How do I request a return or refund?',
    a: 'Contact customer support with your order details. Eligibility follows the published Returns & Refunds Policy.',
  },
  {
    q: 'How do I choose the right MYRKLS product?',
    a: 'Explore our product pages or send our team a question about your skincare needs.',
  },
];

const HELP_TOPICS = [
  'Order Issue',
  'Delivery',
  'Return/Refund',
  'Product Question',
  'Payment',
  'Other',
];

export const MyrklsContactUsPage: React.FC<MyrklsContactUsPageProps> = ({
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateOurScience,
  onNavigateAboutUs,
}) => {
  const { currentUser } = useAuth();

  // Scroll to top on initial mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobile, setMobile] = useState(currentUser?.phone || '');
  const [helpTopic, setHelpTopic] = useState('Product Question');
  const [orderNumber, setOrderNumber] = useState(currentUser?.orders?.[0]?.id || '');
  const [message, setMessage] = useState('');

  // Form Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    ticketId: string;
    topic: string;
  } | null>(null);

  // Accordion state (only one open at a time)
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Policy Modal State ('shipping' | 'returns' | null)
  const [policyModal, setPolicyModal] = useState<'shipping' | 'returns' | null>(null);

  // Refs for smooth scrolling & focus
  const formRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync user details if auth state updates
  useEffect(() => {
    if (currentUser) {
      if (!fullName && currentUser.name) setFullName(currentUser.name);
      if (!email && currentUser.email) setEmail(currentUser.email);
      if (!mobile && currentUser.phone) setMobile(currentUser.phone);
      if (!orderNumber && currentUser.orders?.[0]?.id) setOrderNumber(currentUser.orders[0].id);
    }
  }, [currentUser]);

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

  // Scroll to contact form and set topic to "Product Question"
  const handleProductHelpClick = () => {
    setHelpTopic('Product Question');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      }, 500);
    }
  };

  // Track order click handler
  const handleTrackOrderClick = () => {
    if (onNavigateAccount) {
      onNavigateAccount();
    } else {
      window.location.hash = '#account';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    }

    if (!email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!helpTopic) {
      errs.helpTopic = 'Please select a topic.';
    }

    if ((helpTopic === 'Order Issue' || helpTopic === 'Return/Refund') && !orderNumber.trim()) {
      errs.orderNumber = 'Order number is required for order issues or returns.';
    }

    if (!message.trim()) {
      errs.message = 'Please enter your message.';
    } else if (message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Generate reference ticket ID
    const ticketId = `MYR-SPT-${Math.floor(100000 + Math.random() * 900000)}`;

    // Store inquiry in localStorage
    try {
      const existingInquiries = JSON.parse(
        localStorage.getItem('myrkls_support_tickets') || '[]'
      );
      const newInquiry = {
        ticketId,
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        helpTopic,
        orderNumber: orderNumber.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'Open',
      };
      existingInquiries.push(newInquiry);
      localStorage.setItem('myrkls_support_tickets', JSON.stringify(existingInquiries));
    } catch (err) {
      console.warn('Failed to persist ticket to localStorage:', err);
    }

    // Realistic API dispatch simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess({
        ticketId,
        topic: helpTopic,
      });
      setMessage('');
    }, 700);
  };

  const handleResetForm = () => {
    setSubmissionSuccess(null);
    setErrors({});
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAF8] text-[#111111] selection:bg-[#111111] selection:text-white flex flex-col font-sans">
      {/* ======================================================== */}
      {/* SHARED MYRKLS RETINA HEADER                              */}
      {/* ======================================================== */}
      <MyrklsHeader
        onNavigateViewAll={onNavigateViewAll}
        onNavigateHome={onBackToHome}
        onNavigateProduct={onNavigateProduct}
        onNavigateAccount={onNavigateAccount}
        onNavigateOurScience={onNavigateOurScience}
        onNavigateAboutUs={onNavigateAboutUs}
        onNavigateContactUs={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <main className="flex-1 w-full">
        {/* ======================================================== */}
        {/* SECTION 01 — CONTACT HERO (SPLIT LAYOUT)                 */}
        {/* ======================================================== */}
        <section
          id="section-contact-hero"
          aria-label="Contact Us Hero"
          className="w-full bg-[#FAFAF8] border-b border-[#E5E0D8] overflow-hidden"
        >
          <div className="w-full max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px]">
              {/* LEFT: Text & Eyebrow */}
              <div className="lg:col-span-6 flex flex-col justify-center px-5 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16 lg:py-24">
                <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                  MYRKLS / CONTACT US
                </span>

                <h1 className="font-['Syne',sans-serif] text-[34px] sm:text-[44px] lg:text-[54px] font-bold text-[#173B2B] tracking-tight uppercase leading-[1.05]">
                  WE&apos;RE HERE<br />TO HELP.
                </h1>

                <p className="mt-4 sm:mt-5 text-[14.5px] sm:text-[16px] text-[#4A5550] leading-relaxed max-w-[480px]">
                  Questions about your order, delivery or skincare? Our team is here to make things easier.
                </p>

                <div className="mt-8 flex items-center gap-3">
                  <a
                    href="#how-can-we-help"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs"
                  >
                    <span>EXPLORE SUPPORT OPTIONS</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>

              {/* RIGHT: Skincare Lifestyle Image */}
              <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-[#E5E0D8] bg-[#E9EDE6]/40 flex items-center justify-center overflow-hidden">
                <div className="w-full h-[240px] sm:h-[300px] lg:h-full relative overflow-hidden">
                  <img
                    src="/myrkls-prod-awakening-dew.webp"
                    alt="MYRKLS Skincare Formulation Bottle with Fresh Water Droplets"
                    className="w-full h-full object-cover object-center select-none"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 02 — HOW CAN WE HELP? (4 COMPACT OPTIONS)        */}
        {/* ======================================================== */}
        <section
          id="how-can-we-help"
          aria-label="How Can We Help Support Options"
          className="w-full bg-white py-14 sm:py-18 lg:py-20 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            {/* Header: Centered Eyebrow & Heading */}
            <div className="text-center max-w-[620px] mx-auto mb-10 sm:mb-12">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                QUICK SUPPORT
              </span>
              <h2 className="font-['Syne',sans-serif] text-[26px] sm:text-[34px] lg:text-[40px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.1]">
                HOW CAN WE HELP?
              </h2>
              <p className="mt-2.5 text-[14px] sm:text-[15px] text-[#55625B]">
                Find the right help in just a few clicks.
              </p>
            </div>

            {/* 4 Clickable Support Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Option 01: Track My Order */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none hover:border-[#173B2B] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">01</span>
                    <Package size={20} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    TRACK MY ORDER
                  </h3>
                  <p className="mt-2 text-[13px] text-[#55625B] leading-relaxed">
                    Check your order status and delivery updates.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E5E0D8]">
                  <button
                    type="button"
                    onClick={handleTrackOrderClick}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <span>TRACK ORDER</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Option 02: Shipping & Delivery */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none hover:border-[#173B2B] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">02</span>
                    <Clock size={20} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    SHIPPING & DELIVERY
                  </h3>
                  <p className="mt-2 text-[13px] text-[#55625B] leading-relaxed">
                    Find information about shipping and delivery.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E5E0D8]">
                  <button
                    type="button"
                    onClick={() => setPolicyModal('shipping')}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <span>VIEW DETAILS</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Option 03: Returns & Refunds */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none hover:border-[#173B2B] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">03</span>
                    <RefreshCw size={20} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    RETURNS & REFUNDS
                  </h3>
                  <p className="mt-2 text-[13px] text-[#55625B] leading-relaxed">
                    Learn about returns, cancellations and refunds.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E5E0D8]">
                  <button
                    type="button"
                    onClick={() => setPolicyModal('returns')}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <span>VIEW POLICY</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Option 04: Product Help */}
              <div className="bg-[#FAFAF8] border border-[#E5E0D8] p-6 flex flex-col justify-between rounded-none hover:border-[#173B2B] transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF5A1F]">04</span>
                    <HelpCircle size={20} className="text-[#173B2B]" />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-[15px] sm:text-[16px] font-bold text-[#173B2B] uppercase tracking-tight">
                    PRODUCT HELP
                  </h3>
                  <p className="mt-2 text-[13px] text-[#55625B] leading-relaxed">
                    Questions about MYRKLS products or your routine?
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#E5E0D8]">
                  <button
                    type="button"
                    onClick={handleProductHelpClick}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <span>ASK US</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 03 — GET IN TOUCH (BALANCED TWO-COLUMN)          */}
        {/* ======================================================== */}
        <section
          id="get-in-touch"
          aria-label="Get In Touch and Contact Form"
          className="w-full bg-[#E9EDE6] py-16 sm:py-20 lg:py-24 border-b border-[#DDD8D0]"
        >
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 md:px-14 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* LEFT: Customer Support Info */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                    CUSTOMER CARE
                  </span>
                  <h2 className="font-['Syne',sans-serif] text-[30px] sm:text-[38px] lg:text-[44px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                    LET&apos;S TALK.
                  </h2>
                  <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-[#4A5550] leading-relaxed">
                    Need a little more help? Send us a message and we&apos;ll get back to you.
                  </p>
                </div>

                {/* Official Support Channel Card */}
                <div className="bg-white border border-[#D5DCD0] p-6 rounded-none space-y-3 shadow-[0_4px_16px_rgba(23,59,43,0.03)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#173B2B] text-white flex items-center justify-center shrink-0 rounded-none">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#FF5A1F] uppercase block">
                        OFFICIAL SUPPORT EMAIL
                      </span>
                      <a
                        href="mailto:concierge@myrkls.com"
                        className="font-['Syne',sans-serif] text-[16px] sm:text-[17px] font-bold text-[#173B2B] hover:text-[#FF5A1F] transition-colors"
                      >
                        concierge@myrkls.com
                      </a>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#55625B] leading-relaxed pt-1">
                    For inquiries regarding orders, formulation questions, or general assistance.
                  </p>
                </div>

                {/* Genuine Customer Care Guarantee Card */}
                <div className="bg-white/70 border border-[#D5DCD0] p-5 rounded-none">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="text-[#173B2B] shrink-0 mt-0.5" />
                    <p className="text-[12.5px] text-[#4A5550] leading-relaxed">
                      Every message is reviewed by our dedicated support team. Customer privacy and order details are handled with strict confidentiality.
                    </p>
                  </div>
                </div>

                {/* Helpful Self-Service Note */}
                <div className="pt-2">
                  <p className="text-[12.5px] text-[#55625B] leading-relaxed">
                    Already placed an order? Visit{' '}
                    <button
                      type="button"
                      onClick={handleTrackOrderClick}
                      className="font-bold text-[#173B2B] hover:text-[#FF5A1F] underline cursor-pointer"
                    >
                      My Account
                    </button>{' '}
                    to review order history, invoices, and saved delivery addresses.
                  </p>
                </div>
              </div>

              {/* RIGHT: Contact Form Card */}
              <div
                ref={formRef}
                className="lg:col-span-7 bg-white border border-[#D5DCD0] p-6 sm:p-8 lg:p-10 rounded-none shadow-[0_4px_24px_rgba(23,59,43,0.04)]"
              >
                <div className="mb-6 pb-4 border-b border-[#E5E0D8]">
                  <span className="text-[10.5px] font-mono font-bold tracking-wider uppercase text-[#FF5A1F] block mb-1">
                    DIRECT MESSAGE
                  </span>
                  <h3 className="font-['Syne',sans-serif] text-[20px] sm:text-[24px] font-bold uppercase tracking-tight text-[#173B2B]">
                    SEND A MESSAGE
                  </h3>
                </div>

                {submissionSuccess ? (
                  <div className="p-6 bg-[#F3F7F2] border border-[#C5DAC8] text-[#173B2B] space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={24} className="text-[#173B2B] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-['Syne',sans-serif] text-[17px] font-bold uppercase tracking-tight text-[#173B2B]">
                          MESSAGE RECEIVED
                        </h4>
                        <p className="mt-1 text-[13px] text-[#34483E] leading-relaxed">
                          Thank you for reaching out. Your inquiry has been registered under ticket reference{' '}
                          <span className="font-mono font-bold text-[#173B2B]">{submissionSuccess.ticketId}</span>.
                        </p>
                        <p className="mt-1.5 text-[12.5px] text-[#4A5E53]">
                          Our customer support team will reply directly to <span className="font-semibold">{email}</span>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#D0E2D3] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] hover:text-[#FF5A1F] underline cursor-pointer"
                      >
                        Send another message
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateViewAll?.('ALL')}
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#FF5A1F] hover:underline cursor-pointer"
                      >
                        <span>Continue Browsing</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                    {/* Full Name & Email Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] mb-1.5"
                        >
                          Full Name <span className="text-[#FF5A1F]">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) setErrors({ ...errors, fullName: '' });
                          }}
                          placeholder="Your full name"
                          className={`w-full h-11 px-3.5 bg-[#FAF9F7] border text-[14px] text-[#111111] placeholder:text-[#999999] rounded-none focus:outline-none focus:bg-white transition-colors ${
                            errors.fullName
                              ? 'border-[#D9381E] focus:border-[#D9381E]'
                              : 'border-[#DDD8D0] focus:border-[#173B2B]'
                          }`}
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-[11.5px] text-[#D9381E] flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>{errors.fullName}</span>
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] mb-1.5"
                        >
                          Email Address <span className="text-[#FF5A1F]">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: '' });
                          }}
                          placeholder="your.email@example.com"
                          className={`w-full h-11 px-3.5 bg-[#FAF9F7] border text-[14px] text-[#111111] placeholder:text-[#999999] rounded-none focus:outline-none focus:bg-white transition-colors ${
                            errors.email
                              ? 'border-[#D9381E] focus:border-[#D9381E]'
                              : 'border-[#DDD8D0] focus:border-[#173B2B]'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-[11.5px] text-[#D9381E] flex items-center gap-1">
                            <AlertCircle size={12} />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mobile Number & Help Topic */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mobile Number (optional) */}
                      <div>
                        <label
                          htmlFor="mobile"
                          className="block text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] mb-1.5"
                        >
                          Mobile Number <span className="text-[#888888] font-normal normal-case">(optional)</span>
                        </label>
                        <input
                          id="mobile"
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full h-11 px-3.5 bg-[#FAF9F7] border border-[#DDD8D0] text-[14px] text-[#111111] placeholder:text-[#999999] rounded-none focus:outline-none focus:bg-white focus:border-[#173B2B] transition-colors"
                        />
                      </div>

                      {/* Help Topic */}
                      <div>
                        <label
                          htmlFor="helpTopic"
                          className="block text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] mb-1.5"
                        >
                          Help Topic <span className="text-[#FF5A1F]">*</span>
                        </label>
                        <select
                          id="helpTopic"
                          value={helpTopic}
                          onChange={(e) => {
                            setHelpTopic(e.target.value);
                            if (errors.helpTopic) setErrors({ ...errors, helpTopic: '' });
                          }}
                          className="w-full h-11 px-3 bg-[#FAF9F7] border border-[#DDD8D0] text-[14px] text-[#111111] rounded-none focus:outline-none focus:bg-white focus:border-[#173B2B] transition-colors cursor-pointer"
                        >
                          {HELP_TOPICS.map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Order Number (conditional requirement if order-related) */}
                    <div>
                      <label
                        htmlFor="orderNumber"
                        className="block text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] mb-1.5"
                      >
                        Order Number{' '}
                        {helpTopic === 'Order Issue' || helpTopic === 'Return/Refund' ? (
                          <span className="text-[#FF5A1F]">*</span>
                        ) : (
                          <span className="text-[#888888] font-normal normal-case">(optional)</span>
                        )}
                      </label>
                      <input
                        id="orderNumber"
                        type="text"
                        value={orderNumber}
                        onChange={(e) => {
                          setOrderNumber(e.target.value);
                          if (errors.orderNumber) setErrors({ ...errors, orderNumber: '' });
                        }}
                        placeholder="e.g. MYR-982144"
                        className={`w-full h-11 px-3.5 bg-[#FAF9F7] border text-[14px] text-[#111111] placeholder:text-[#999999] rounded-none focus:outline-none focus:bg-white transition-colors ${
                          errors.orderNumber
                            ? 'border-[#D9381E] focus:border-[#D9381E]'
                            : 'border-[#DDD8D0] focus:border-[#173B2B]'
                        }`}
                      />
                      {errors.orderNumber && (
                        <p className="mt-1 text-[11.5px] text-[#D9381E] flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>{errors.orderNumber}</span>
                        </p>
                      )}
                    </div>

                    {/* Message Area */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#173B2B] mb-1.5"
                      >
                        Message <span className="text-[#FF5A1F]">*</span>
                      </label>
                      <textarea
                        id="message"
                        ref={messageInputRef}
                        rows={4}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (errors.message) setErrors({ ...errors, message: '' });
                        }}
                        placeholder="How can we assist you today? Please share any relevant details."
                        className={`w-full p-3.5 bg-[#FAF9F7] border text-[14px] text-[#111111] placeholder:text-[#999999] rounded-none focus:outline-none focus:bg-white transition-colors resize-y min-h-[110px] ${
                          errors.message
                            ? 'border-[#D9381E] focus:border-[#D9381E]'
                            : 'border-[#DDD8D0] focus:border-[#173B2B]'
                        }`}
                      />
                      {errors.message && (
                        <p className="mt-1 text-[11.5px] text-[#D9381E] flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11.5px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer disabled:opacity-60 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>SENDING MESSAGE...</span>
                          </>
                        ) : (
                          <>
                            <span>SEND MESSAGE</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 04 — QUICK ANSWERS (FAQ ACCORDION)               */}
        {/* ======================================================== */}
        <section
          id="quick-answers"
          aria-label="Frequently Asked Questions"
          className="w-full bg-white py-16 sm:py-20 lg:py-24 border-b border-[#E5E0D8]"
        >
          <div className="w-full max-w-[840px] mx-auto px-5 sm:px-8">
            {/* Header: Centered Eyebrow & Heading */}
            <div className="text-center mb-10 sm:mb-14">
              <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
                GOOD TO KNOW
              </span>
              <h2 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                QUICK ANSWERS.
              </h2>
            </div>

            {/* Compact 1-Column Accordion (Only one answer open at a time) */}
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
        {/* SECTION 05 — BACK TO YOUR ROUTINE (SPLIT BRAND CTA)      */}
        {/* ======================================================== */}
        <section
          id="section-routine-cta"
          aria-label="Discover MYRKLS Essentials"
          className="w-full bg-[#E9EDE6] border-b border-[#DDD8D0] overflow-hidden"
        >
          <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* LEFT: CTA Text & Action */}
            <div className="px-5 sm:px-10 md:px-14 lg:px-20 py-12 sm:py-16 lg:py-24">
              <span className="text-[11px] sm:text-[12px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-3">
                DISCOVER MYRKLS
              </span>

              <h2 className="font-['Syne',sans-serif] text-[30px] sm:text-[38px] lg:text-[46px] font-bold tracking-tight text-[#173B2B] uppercase leading-[1.08]">
                YOUR NEXT SKINCARE<br />ESSENTIAL AWAITS.
              </h2>

              <p className="mt-4 text-[14px] sm:text-[16px] text-[#4A5550] leading-relaxed max-w-[460px]">
                Explore skincare thoughtfully formulated for your everyday routine.
              </p>

              <div className="mt-7 sm:mt-8">
                <button
                  type="button"
                  onClick={() => onNavigateViewAll?.('ALL')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2"
                >
                  <span>EXPLORE OUR PRODUCTS</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* RIGHT: Studio Product Collection Image */}
            <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[460px] overflow-hidden border-t lg:border-t-0 lg:border-l border-[#D5DCD0]">
              <img
                src="/myrkls-sec4-incarnation-lab.webp"
                alt="MYRKLS Skincare Products Collection in Editorial Setting"
                className="w-full h-full object-cover object-center select-none"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* PUBLISHED POLICY MODAL (SHIPPING & DELIVERY / RETURNS)   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {policyModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-dialog-title"
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
                    id="policy-dialog-title"
                    className="font-['Syne',sans-serif] text-[20px] sm:text-[22px] font-bold uppercase tracking-tight text-[#173B2B] mt-0.5"
                  >
                    {policyModal === 'shipping' ? 'Shipping & Delivery' : 'Returns & Refunds'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setPolicyModal(null)}
                  aria-label="Close policy modal"
                  className="w-9 h-9 bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#DDD8D0] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#E5E0D8] bg-[#EAE7DF]/40 text-[12px] font-sans font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setPolicyModal('shipping')}
                  className={`flex-1 py-3 px-4 text-center transition-colors cursor-pointer ${
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
                  className={`flex-1 py-3 px-4 text-center transition-colors cursor-pointer ${
                    policyModal === 'returns'
                      ? 'bg-white text-[#173B2B] border-b-2 border-[#173B2B]'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Returns & Refunds
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5 text-[13.5px] font-normal leading-relaxed text-[#444444]">
                {policyModal === 'shipping' ? (
                  <>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        01. Processing & Dispatch
                      </h4>
                      <p>
                        All MYRKLS formulations are dispatched in secure, temperature-controlled packaging via priority couriers across all serviceable Indian PIN codes. Orders are processed Monday through Saturday.
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

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        03. Address Modifications
                      </h4>
                      <p>
                        If you need to change your delivery address after placing an order, please contact customer support immediately. Address updates are accommodated provided the shipment has not yet been handed over to the courier partner.
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
                        To ensure formulation hygiene and safety, products must be in their original unopened packaging with tamper-evident seals intact. If your order arrives damaged, defective, or incorrect, please reach out to customer support with photographs and your order number.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        02. Refund Processing Timeline
                      </h4>
                      <p>
                        Approved refunds are credited directly back to the original payment source within 3 to 5 business days upon warehouse verification. For Cash on Delivery orders, refunds are processed via secure UPI or direct bank transfer.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-[#173B2B] uppercase tracking-wide text-[12.5px]">
                        03. How to Request a Return
                      </h4>
                      <p>
                        Contact customer support via the contact form above (selecting Help Topic: Return/Refund) or email{' '}
                        <a href="mailto:concierge@myrkls.com" className="text-[#173B2B] font-bold underline">
                          concierge@myrkls.com
                        </a>{' '}
                        with your order reference number.
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
        onNavigateContactUs={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
};

export default MyrklsContactUsPage;
