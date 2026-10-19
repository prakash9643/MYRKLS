import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, RotateCcw, Smartphone, Mail } from 'lucide-react';
import { useAuth } from '../context/MyrklsAuthContext';

interface MyrklsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
];

export const MyrklsAuthModal: React.FC<MyrklsAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  
  // Phone inputs
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Email inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState('');

  // OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset modal state upon opening
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('input');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setFullName('');
      setOtp(['', '', '', '', '', '']);
      setPhoneError('');
      setEmailError('');
      setOtpError('');
      setResendTimer(30);
      setIsVerifying(false);
    }
  }, [isOpen, initialMode]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // OTP Resend Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Phone submission handler -> transitions to OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 8 || cleanNumber.length > 15) {
      setPhoneError('Please enter a valid mobile number');
      return;
    }
    setPhoneError('');
    setStep('otp');
    setResendTimer(30);
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);
  };

  // Email form handler
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setEmailError('Password must be at least 6 characters');
      return;
    }
    setEmailError('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (mode === 'signup') {
        signup('+919876543210', email, fullName || email.split('@')[0]);
      } else {
        login(email, fullName);
      }
      setStep('success');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    }, 700);
  };

  // OTP digit handler
  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      if (pasted.length === 6) {
        verifyOtp(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  // OTP backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Verify OTP simulation
  const verifyOtp = (_code?: string) => {
    setIsVerifying(true);
    setOtpError('');
    setTimeout(() => {
      setIsVerifying(false);
      const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
      if (mode === 'signup') {
        signup(fullPhone, email || `${phoneNumber}@domain.com`, fullName || 'Valued Member');
      } else {
        login(fullPhone, fullName);
      }
      setStep('success');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    }, 700);
  };

  // Resend OTP
  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    otpInputsRef.current[0]?.focus();
  };

  // Google Login simulation
  const handleGoogleAuth = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      login('alexandra.v@domain.com', 'Alexandra Vance');
      setStep('success');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    }, 700);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          
          {/* ======================================================== */}
          {/* CINEMATIC BACKDROP BLUR MATCHING HOME PAGE PALETTE       */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#07130B]/75 backdrop-blur-xl"
          />

          {/* ======================================================== */}
          {/* ARCHITECTURAL SHARP SPLIT CARD (STRICT ROUNDED-NONE)     */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[920px] bg-[#FAF9F7] border border-[#DDD8D0] shadow-[0_30px_90px_rgba(7,19,11,0.45)] rounded-none overflow-hidden z-10 my-auto grid grid-cols-1 md:grid-cols-12"
          >
            {/* Top Hairline Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5A1F] to-transparent opacity-80 z-40" />

            {/* Architectural Close Button with Orange Hover */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-none border border-[#DDD8D0] md:border-white/30 bg-white/90 md:bg-[#133429]/40 hover:bg-[#FF5A1F] md:hover:bg-[#FF5A1F] hover:border-[#FF5A1F] text-[#133429] md:text-white hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer z-40 group shadow-xs"
            >
              <X size={15} strokeWidth={1.8} className="transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* ====================================================== */}
            {/* LEFT COLUMN: HOME PAGE THEMED FORM (7 cols)            */}
            {/* ====================================================== */}
            <div className="md:col-span-7 bg-[#FAF9F7] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[500px]">
              
              <div>
                {/* Brand Header: Crisp Logo */}
                <div className="flex items-center mb-6 sm:mb-8 pr-10">
                  <img
                    src="/myrkls-logo-black-retina.png"
                    alt="MYRKLS"
                    className="h-5 sm:h-5.5 w-auto max-w-[130px] object-contain"
                  />
                </div>

                {/* Main Heading & Subtitle */}
                <div className="mb-6">
                  <h2 className="text-[25px] sm:text-[29px] font-bold text-[#133429] tracking-tight font-['Syne',sans-serif]">
                    {step === 'otp'
                      ? 'Verify Your Identity'
                      : mode === 'login'
                      ? 'Welcome to MYRKLS'
                      : 'Join the Ritual'}
                  </h2>
                  <p className="text-[13px] sm:text-[13.5px] text-[#5A6660] font-normal leading-relaxed mt-1.5 font-sans">
                    {step === 'otp'
                      ? `Enter the 6-digit verification code sent to ${countryCode} ${phoneNumber}`
                      : mode === 'login'
                      ? 'Experience the new science in your daily ritual.'
                      : 'Create your private member account to unlock formulation ledger allocations.'}
                  </p>
                </div>

                {/* ==================================================== */}
                {/* STEP: INPUT (PHONE OTP OR EMAIL/PASSWORD)            */}
                {/* ==================================================== */}
                {step === 'input' && (
                  <div>
                    {/* Seamless Hairline Tabs (No Filled Box Background!) */}
                    <div className="flex items-center gap-7 border-b border-[#DDD8D0] mb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('phone');
                          setPhoneError('');
                          setEmailError('');
                        }}
                        className={`pb-2.5 text-[13px] font-sans transition-all duration-200 relative cursor-pointer flex items-center gap-2 ${
                          authMethod === 'phone'
                            ? 'text-[#133429] font-semibold'
                            : 'text-[#7A857E] hover:text-[#133429] font-normal'
                        }`}
                      >
                        <Smartphone size={14} />
                        <span>Phone OTP</span>
                        {authMethod === 'phone' && (
                          <motion.div
                            layoutId="activeTabHairline"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#133429]"
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('email');
                          setPhoneError('');
                          setEmailError('');
                        }}
                        className={`pb-2.5 text-[13px] font-sans transition-all duration-200 relative cursor-pointer flex items-center gap-2 ${
                          authMethod === 'email'
                            ? 'text-[#133429] font-semibold'
                            : 'text-[#7A857E] hover:text-[#133429] font-normal'
                        }`}
                      >
                        <Mail size={14} />
                        <span>Email</span>
                        {authMethod === 'email' && (
                          <motion.div
                            layoutId="activeTabHairline"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#133429]"
                          />
                        )}
                      </button>
                    </div>

                    {/* ------------------------------------------------ */}
                    {/* OPTION A: PHONE NUMBER & OTP (SEAMLESS INPUT)    */}
                    {/* ------------------------------------------------ */}
                    {authMethod === 'phone' && (
                      <form onSubmit={handleSendOtp} className="space-y-4">
                        {mode === 'signup' && (
                          <div>
                            <label className="block text-[12px] font-sans font-medium text-[#133429] mb-1.5">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full h-11 px-3.5 bg-transparent border border-[#DDD8D0] focus:border-[#133429] text-[#133429] font-sans placeholder-[#9E9B93] rounded-none text-[13.5px] outline-none transition-colors"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[12px] font-sans font-medium text-[#133429] mb-1.5 flex items-center justify-between">
                            <span>Mobile Number</span>
                            <span className="text-[11px] font-sans text-[#5A6660] font-normal">Fast 1-Click OTP</span>
                          </label>

                          {/* Unified Seamless Input Bar (No Separated Harsh Fill Boxes) */}
                          <div className="flex items-center h-11 bg-transparent border border-[#DDD8D0] focus-within:border-[#133429] transition-colors rounded-none">
                            {/* Country Dial Code */}
                            <div className="relative flex items-center h-full px-3 border-r border-[#DDD8D0] shrink-0">
                              <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="bg-transparent text-[#133429] text-[12.5px] font-sans font-medium rounded-none outline-none appearance-none cursor-pointer pr-4"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <span className="absolute right-2 text-[#133429]/50 pointer-events-none text-[8px]">
                                ▼
                              </span>
                            </div>

                            {/* Phone Input */}
                            <input
                              type="tel"
                              required
                              autoFocus
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="98765 43210"
                              className="flex-1 h-full px-3.5 bg-transparent text-[#133429] font-sans placeholder-[#9E9B93] rounded-none text-[13.5px] outline-none"
                            />
                          </div>
                          {phoneError && (
                            <p className="text-[11.5px] text-[#C2410C] mt-1.5 font-sans font-medium">
                              {phoneError}
                            </p>
                          )}
                        </div>

                        {/* Send OTP CTA Button (Changes to Orange on Hover) */}
                        <button
                          type="submit"
                          className="w-full h-11 mt-1 bg-[#133429] hover:bg-[#FF5A1F] text-white rounded-none text-[13px] font-sans font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm group"
                        >
                          <span>{mode === 'login' ? 'Send OTP & Log In' : 'Send Verification OTP'}</span>
                          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                      </form>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* OPTION B: EMAIL & PASSWORD (CINEMATIC MINIMAL)  */}
                    {/* ------------------------------------------------ */}
                    {authMethod === 'email' && (
                      <form onSubmit={handleEmailAuth} className="space-y-3.5">
                        {mode === 'signup' && (
                          <div>
                            <label className="block text-[12px] font-sans font-medium text-[#133429] mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full h-10.5 px-3.5 bg-transparent border border-[#DDD8D0] focus:border-[#133429] text-[#133429] font-sans placeholder-[#9E9B93] rounded-none text-[13px] outline-none transition-colors"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[12px] font-sans font-medium text-[#133429] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@domain.com"
                            className="w-full h-10.5 px-3.5 bg-transparent border border-[#DDD8D0] focus:border-[#133429] text-[#133429] font-sans placeholder-[#9E9B93] rounded-none text-[13px] outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-sans font-medium text-[#133429] mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full h-10.5 px-3.5 bg-transparent border border-[#DDD8D0] focus:border-[#133429] text-[#133429] font-sans placeholder-[#9E9B93] rounded-none text-[13px] outline-none transition-colors"
                          />
                        </div>

                        {emailError && (
                          <p className="text-[11.5px] text-[#C2410C] font-sans font-medium">
                            {emailError}
                          </p>
                        )}

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-[12px] font-sans text-[#5A6660] pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-3.5 h-3.5 rounded-none border-[#DDD8D0] text-[#133429] focus:ring-[#133429] accent-[#133429]"
                            />
                            <span>Remember me</span>
                          </label>

                          <button
                            type="button"
                            className="text-[#5A6660] hover:text-[#FF5A1F] hover:underline cursor-pointer transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>

                        {/* Log In Button (Changes to Orange on Hover) */}
                        <button
                          type="submit"
                          disabled={isVerifying}
                          className="w-full h-11 bg-[#133429] hover:bg-[#FF5A1F] text-white rounded-none text-[13px] font-sans font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm mt-1"
                        >
                          {isVerifying ? (
                            <span className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Verifying...
                            </span>
                          ) : (
                            <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Google One-Tap Social Button (Transparent Seamless Styling) */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isVerifying}
                        className="w-full h-11 px-4 bg-transparent hover:bg-black/[0.04] text-[#133429] border border-[#DDD8D0] rounded-none text-[13px] font-sans font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    </div>

                    {/* Mode Switcher: Login <-> Signup */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-[12.5px] font-sans text-[#5A6660] hover:text-[#133429] transition-colors cursor-pointer"
                      >
                        {mode === 'login' ? (
                          <span>
                            New to MYRKLS?{' '}
                            <strong className="text-[#133429] hover:text-[#FF5A1F] font-semibold underline underline-offset-2 transition-colors">
                              Create an account
                            </strong>
                          </span>
                        ) : (
                          <span>
                            Already registered?{' '}
                            <strong className="text-[#133429] hover:text-[#FF5A1F] font-semibold underline underline-offset-2 transition-colors">
                              Log In
                            </strong>
                          </span>
                        )}
                      </button>
                    </div>

                  </div>
                )}

                {/* ==================================================== */}
                {/* STEP: OTP 6-DIGIT VERIFICATION                       */}
                {/* ==================================================== */}
                {step === 'otp' && (
                  <div>
                    <div className="flex items-center justify-between mb-3 text-[12px] font-sans">
                      <span className="font-semibold text-[#133429]">ENTER 6-DIGIT CODE</span>
                      <button
                        type="button"
                        onClick={() => setStep('input')}
                        className="text-[#133429] hover:text-[#FF5A1F] hover:underline font-medium cursor-pointer transition-colors"
                      >
                        Change number
                      </button>
                    </div>

                    {/* 6 Digit Inputs (Seamless, No Harsh Background Fill) */}
                    <div className="grid grid-cols-6 gap-2 sm:gap-2.5 my-4">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputsRef.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-full h-12 sm:h-13 text-center text-[20px] sm:text-[22px] font-bold font-sans text-[#133429] bg-transparent border border-[#DDD8D0] focus:border-[#FF5A1F] rounded-none outline-none transition-all"
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-[12px] text-[#C2410C] text-center my-2 font-sans font-medium">
                        {otpError}
                      </p>
                    )}

                    {/* Verify CTA (Changes to Orange on Hover) */}
                    <button
                      type="button"
                      onClick={() => verifyOtp(otp.join(''))}
                      disabled={isVerifying || otp.some((d) => d === '')}
                      className="w-full h-11 mt-3 bg-[#133429] hover:bg-[#FF5A1F] disabled:opacity-40 disabled:hover:bg-[#133429] text-white rounded-none text-[13px] font-sans font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm group"
                    >
                      {isVerifying ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Validating Code...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>Verify & Complete</span>
                          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      )}
                    </button>

                    {/* Resend Countdown */}
                    <div className="mt-5 pt-3 border-t border-[#DDD8D0] flex items-center justify-between text-[12px] font-sans">
                      <span className="text-[#5A6660]">
                        {resendTimer > 0 ? (
                          <span>Resend code in <strong className="text-[#133429]">{resendTimer}s</strong></span>
                        ) : (
                          <span className="text-[#C2410C]">Code expired</span>
                        )}
                      </span>

                      <button
                        type="button"
                        disabled={resendTimer > 0}
                        onClick={handleResend}
                        className="inline-flex items-center gap-1.5 text-[#133429] hover:text-[#FF5A1F] disabled:text-[#A7AEA9] hover:underline cursor-pointer disabled:cursor-not-allowed font-medium transition-colors"
                      >
                        <RotateCcw size={12} />
                        <span>Resend Code</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ==================================================== */}
                {/* STEP: SUCCESS CELEBRATION                            */}
                {/* ==================================================== */}
                {step === 'success' && (
                  <div className="py-8 text-center flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                      className="w-14 h-14 bg-[#FF5A1F] text-white flex items-center justify-center mb-4 shadow-[0_8px_20px_rgba(255,90,31,0.3)] rounded-none"
                    >
                      <Check size={28} strokeWidth={2.5} />
                    </motion.div>

                    <h3 className="text-[20px] font-bold text-[#133429] font-['Syne',sans-serif] mb-1">
                      Welcome to MYRKLS
                    </h3>

                    <p className="text-[13px] text-[#5A6660] font-sans mb-5 max-w-[280px]">
                      Your member access has been verified. Welcome to your personalized skincare ledger.
                    </p>

                    <div className="flex items-center gap-2 text-[11.5px] font-sans text-[#FF5A1F] font-medium">
                      <span className="w-1.5 h-1.5 bg-[#FF5A1F] rounded-full animate-ping" />
                      <span>Opening your clinical dashboard...</span>
                    </div>
                  </div>
                )}

              </div>

              {/* ==================================================== */}
              {/* FOOTER LINKS (CLEAN MINIMAL, NO EXTRA BADGES)        */}
              {/* ==================================================== */}
              <div className="pt-6 border-t border-[#DDD8D0] flex items-center justify-between text-[11.5px] font-sans text-[#7A857E]">
                <div className="flex items-center gap-2">
                  <span className="hover:text-[#FF5A1F] cursor-pointer transition-colors">Terms & Conditions</span>
                  <span>•</span>
                  <span className="hover:text-[#FF5A1F] cursor-pointer transition-colors">Privacy Policy</span>
                </div>
              </div>

            </div>

            {/* ====================================================== */}
            {/* RIGHT COLUMN: PURE CINEMATIC PRODUCT HERO (5 cols)    */}
            {/* ====================================================== */}
            <div className="hidden md:flex md:col-span-5 relative bg-[#133429] text-white flex-col justify-center items-center overflow-hidden select-none min-h-[500px]">
              
              {/* Deep Cinematic Forest Canvas with Dewdrop Studio Shot */}
              <div className="absolute inset-0">
                <img
                  src="/myrkls-prod-awakening-dew.webp"
                  alt="MYRKLS Formulation"
                  className="w-full h-full object-cover object-center scale-[1.03]"
                />
                {/* Subtle cinematic gradient framing */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07130B]/55 via-transparent to-[#07130B]/35 pointer-events-none" />
                <div className="absolute inset-0 border-l border-white/10 pointer-events-none" />
              </div>

            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};

export default MyrklsAuthModal;
