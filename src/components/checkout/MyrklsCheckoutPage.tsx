import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  Truck,
  Tag,
  X,
  Info,
  Check,
  Sparkles
} from 'lucide-react';
import { useCart, CartItem } from '../../context/MyrklsCartContext';

export interface MyrklsCheckoutPageProps {
  onBackToStore?: () => void;
  onNavigateHome?: () => void;
  onNavigateViewAll?: () => void;
  onNavigateProduct?: (productId: string) => void;
}

export interface SavedCustomerProfile {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
}

const PROFILES_STORAGE_KEY = 'myrkls_saved_customer_profiles';

const DEFAULT_AUTHORIZED_PROFILE: SavedCustomerProfile = {
  phone: '9876543210',
  email: 'alexandra.v@domain.com',
  firstName: 'Alexandra',
  lastName: 'Vance',
  address: '1402, Skyline Residency, MG Road',
  landmark: 'Near Central Park',
  pincode: '560001',
  city: 'Bengaluru',
  state: 'Karnataka'
};

const getSavedProfiles = (): SavedCustomerProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify([DEFAULT_AUTHORIZED_PROFILE]));
      return [DEFAULT_AUTHORIZED_PROFILE];
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_AUTHORIZED_PROFILE];
  }
};

const saveProfile = (profile: SavedCustomerProfile) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedProfiles().filter((p) => p.phone !== profile.phone);
    existing.push(profile);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to save profile to localStorage', err);
  }
};

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const PIN_PREFIX_MAP: Record<string, { city: string; state: string }> = {
  // Delhi NCR & North
  '11': { city: 'New Delhi', state: 'Delhi NCR' },
  '12': { city: 'Gurugram', state: 'Haryana' },
  '13': { city: 'Ambala', state: 'Haryana' },
  '14': { city: 'Ludhiana', state: 'Punjab' },
  '15': { city: 'Bathinda', state: 'Punjab' },
  '16': { city: 'Chandigarh', state: 'Chandigarh' },
  '17': { city: 'Shimla', state: 'Himachal Pradesh' },
  '18': { city: 'Jammu', state: 'Jammu and Kashmir' },
  '19': { city: 'Srinagar', state: 'Jammu and Kashmir' },
  // UP & Uttarakhand
  '20': { city: 'Noida', state: 'Uttar Pradesh' },
  '21': { city: 'Prayagraj', state: 'Uttar Pradesh' },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '23': { city: 'Varanasi', state: 'Uttar Pradesh' },
  '24': { city: 'Dehradun', state: 'Uttarakhand' },
  '25': { city: 'Meerut', state: 'Uttar Pradesh' },
  '26': { city: 'Bareilly', state: 'Uttar Pradesh' },
  '27': { city: 'Gorakhpur', state: 'Uttar Pradesh' },
  '28': { city: 'Agra', state: 'Uttar Pradesh' },
  // Rajasthan
  '30': { city: 'Jaipur', state: 'Rajasthan' },
  '31': { city: 'Udaipur', state: 'Rajasthan' },
  '32': { city: 'Kota', state: 'Rajasthan' },
  '33': { city: 'Bikaner', state: 'Rajasthan' },
  '34': { city: 'Jodhpur', state: 'Rajasthan' },
  // Gujarat
  '36': { city: 'Rajkot', state: 'Gujarat' },
  '37': { city: 'Jamnagar', state: 'Gujarat' },
  '38': { city: 'Ahmedabad', state: 'Gujarat' },
  '39': { city: 'Surat', state: 'Gujarat' },
  // Maharashtra & Goa
  '400': { city: 'Mumbai', state: 'Maharashtra' },
  '401': { city: 'Thane', state: 'Maharashtra' },
  '402': { city: 'Raigad', state: 'Maharashtra' },
  '403': { city: 'Panaji', state: 'Goa' },
  '41': { city: 'Pune', state: 'Maharashtra' },
  '42': { city: 'Nashik', state: 'Maharashtra' },
  '43': { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  '44': { city: 'Nagpur', state: 'Maharashtra' },
  // MP & Chhattisgarh
  '45': { city: 'Indore', state: 'Madhya Pradesh' },
  '46': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '47': { city: 'Gwalior', state: 'Madhya Pradesh' },
  '48': { city: 'Jabalpur', state: 'Madhya Pradesh' },
  '49': { city: 'Raipur', state: 'Chhattisgarh' },
  // Andhra & Telangana
  '50': { city: 'Hyderabad', state: 'Telangana' },
  '51': { city: 'Tirupati', state: 'Andhra Pradesh' },
  '52': { city: 'Vijayawada', state: 'Andhra Pradesh' },
  '53': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  // Karnataka
  '56': { city: 'Bengaluru', state: 'Karnataka' },
  '57': { city: 'Mangaluru', state: 'Karnataka' },
  '58': { city: 'Hubli', state: 'Karnataka' },
  '59': { city: 'Belagavi', state: 'Karnataka' },
  // Tamil Nadu & Puducherry
  '60': { city: 'Chennai', state: 'Tamil Nadu' },
  '61': { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  '62': { city: 'Madurai', state: 'Tamil Nadu' },
  '63': { city: 'Vellore', state: 'Tamil Nadu' },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu' },
  // Kerala
  '67': { city: 'Kozhikode', state: 'Kerala' },
  '68': { city: 'Kochi', state: 'Kerala' },
  '69': { city: 'Thiruvananthapuram', state: 'Kerala' },
  // West Bengal, Odisha & East
  '70': { city: 'Kolkata', state: 'West Bengal' },
  '71': { city: 'Howrah', state: 'West Bengal' },
  '72': { city: 'Midnapore', state: 'West Bengal' },
  '73': { city: 'Siliguri', state: 'West Bengal' },
  '74': { city: 'North 24 Parganas', state: 'West Bengal' },
  '75': { city: 'Bhubaneswar', state: 'Odisha' },
  '76': { city: 'Cuttack', state: 'Odisha' },
  '78': { city: 'Guwahati', state: 'Assam' },
  '79': { city: 'Shillong', state: 'Meghalaya' },
  // Bihar & Jharkhand
  '80': { city: 'Patna', state: 'Bihar' },
  '81': { city: 'Bhagalpur', state: 'Bihar' },
  '82': { city: 'Gaya', state: 'Bihar' },
  '83': { city: 'Ranchi', state: 'Jharkhand' },
  '84': { city: 'Muzaffarpur', state: 'Bihar' },
  '85': { city: 'Purnia', state: 'Bihar' }
};

export const MyrklsCheckoutPage: React.FC<MyrklsCheckoutPageProps> = ({
  onBackToStore,
  onNavigateHome,
  onNavigateViewAll,
  onNavigateProduct
}) => {
  const { items, subtotal, formattedSubtotal, totalCount } = useCart();

  // Mobile order summary accordion
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // 01 / CONTACT
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribeMarketing, setSubscribeMarketing] = useState(false);

  // Smart Autofill & OTP State
  const [otpStep, setOtpStep] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [savedProfileFound, setSavedProfileFound] = useState<SavedCustomerProfile | null>(null);
  const [isAutofilled, setIsAutofilled] = useState(false);

  // 02 / DELIVERY ADDRESS
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(false);

  // 03 / PAYMENT
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Coupon code
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Form Errors & Gateway Status Notice
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gatewayNotice, setGatewayNotice] = useState<{
    type: 'payment_pending' | 'cod_pending';
    message: string;
  } | null>(null);

  // Ensure default profile is seeded on mount
  useEffect(() => {
    getSavedProfiles();
  }, []);

  // Totals Calculation
  const discountAmount = appliedDiscount ? Math.round((subtotal * appliedDiscount.percent) / 100) : 0;
  const finalTotalNumber = Math.max(0, subtotal - discountAmount);
  const formattedFinalTotal = `₹${finalTotalNumber.toLocaleString('en-IN')}`;

  const handleReturnToStore = () => {
    if (onBackToStore) {
      onBackToStore();
    } else if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.hash = '#home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    if (onNavigateViewAll) {
      onNavigateViewAll();
    } else {
      handleReturnToStore();
    }
  };

  const handleItemClick = (productId: string) => {
    if (onNavigateProduct) {
      onNavigateProduct(productId);
    }
  };

  // Phone input handling with OTP reset on change
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));

    if (otpStep !== 'idle' && clean !== savedProfileFound?.phone) {
      setOtpStep('idle');
      setSavedProfileFound(null);
    }
  };

  // Trigger real OTP generation for verification
  const handleSendOtp = () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) {
      setErrors((prev) => ({ ...prev, phone: 'Enter a valid 10-digit mobile number' }));
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError(null);
    setOtpStep('sent');
  };

  // Verify OTP & check for authorized saved profile
  const handleVerifyOtp = () => {
    if (enteredOtp !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the 4-digit code shown.');
      return;
    }
    setOtpError(null);
    setOtpStep('verified');

    const profiles = getSavedProfiles();
    const match = profiles.find((p) => p.phone === phone);
    if (match) {
      setSavedProfileFound(match);
    } else {
      setSavedProfileFound(null);
    }
  };

  // Customer confirmed: apply saved profile details
  const handleApplySavedDetails = () => {
    if (!savedProfileFound) return;
    setFirstName(savedProfileFound.firstName);
    setLastName(savedProfileFound.lastName);
    setEmail(savedProfileFound.email);
    setAddress(savedProfileFound.address);
    setLandmark(savedProfileFound.landmark || '');
    setPincode(savedProfileFound.pincode);
    setCity(savedProfileFound.city);
    setState(savedProfileFound.state);
    setIsAutofilled(true);
    setSavedProfileFound(null);
    // Clear errors on populated fields
    setErrors({});
  };

  // PIN code change with auto-population of city and state
  const handlePincodeChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, '').slice(0, 6);
    setPincode(cleanDigits);

    if (errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: '' }));
    }

    if (cleanDigits.length === 6) {
      // 1. Instant local prefix lookup
      const prefix3 = cleanDigits.slice(0, 3);
      const prefix2 = cleanDigits.slice(0, 2);
      const matched = PIN_PREFIX_MAP[prefix3] || PIN_PREFIX_MAP[prefix2];

      if (matched) {
        if (!city) setCity(matched.city);
        if (!state || state === 'Maharashtra') setState(matched.state);
      }

      // 2. Reliable asynchronous postal API lookup
      try {
        fetch(`https://api.postalpincode.in/pincode/${cleanDigits}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
              const po = data[0].PostOffice[0];
              if (po.District) setCity(po.District);
              if (po.State) {
                if (INDIAN_STATES.includes(po.State)) {
                  setState(po.State);
                } else if (po.State === 'Delhi') {
                  setState('Delhi NCR');
                }
              }
            }
          })
          .catch(() => {
            // Prefix map already applied
          });
      } catch {
        // Ignore
      }
    }
  };

  // Coupon handling
  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError(null);
    const cleanCode = discountCode.trim().toUpperCase();

    if (!cleanCode) {
      setDiscountError('Please enter a discount code.');
      return;
    }

    if (cleanCode === 'MYRKLS10' || cleanCode === 'SCIENCE10') {
      setAppliedDiscount({ code: cleanCode, percent: 10 });
      setDiscountError(null);
    } else {
      setDiscountError('Invalid discount code.');
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    // 01 / CONTACT
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Mobile number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }

    // 02 / DELIVERY ADDRESS
    if (!firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      errs.lastName = 'Last name is required';
    }
    if (!address.trim()) {
      errs.address = 'Street address is required';
    }
    if (!pincode.trim()) {
      errs.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errs.pincode = 'Enter a valid 6-digit PIN code';
    }
    if (!city.trim()) {
      errs.city = 'City is required';
    }
    if (!state.trim()) {
      errs.state = 'State is required';
    }

    // 03 / PAYMENT
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        errs.cardNumber = 'Enter a valid card number';
      }
      if (!cardExpiry.trim()) {
        errs.cardExpiry = 'MM/YY required';
      }
      if (cardCvv.trim().length < 3) {
        errs.cardCvv = 'CVV required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    if (!validateForm()) {
      const firstErrorEl = document.querySelector('.input-error-field');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Save profile for next time if opted in
    if (saveAddressForNextTime) {
      saveProfile({
        phone: phone.replace(/\D/g, ''),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        pincode: pincode.trim(),
        city: city.trim(),
        state: state.trim()
      });
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (paymentMethod === 'cod') {
        setGatewayNotice({
          type: 'cod_pending',
          message:
            'Order details verified. Cash on Delivery order placement requires backend configuration. No order has been placed.'
        });
      } else {
        setGatewayNotice({
          type: 'payment_pending',
          message:
            'Payment gateway integration is currently pending live credentials. No financial charge has been made.'
        });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // ==========================================
  // EMPTY CART CHECKOUT GUARD VIEW
  // ==========================================
  if (items.length === 0 && !gatewayNotice) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] text-[#111111] flex flex-col justify-between selection:bg-[#111111] selection:text-white">
        <header className="w-full bg-[#FAF9F7] border-b border-[#E5E0D8] py-4 px-4 sm:px-8">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={handleReturnToStore}
              className="flex items-center gap-2 text-[12px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO STORE</span>
            </button>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleReturnToStore();
              }}
              className="flex items-center"
            >
              <img src="/myrkls-logo-black-retina.png" alt="MYRKLS Logo" className="h-7 w-auto object-contain" />
            </a>
            <div className="w-20" />
          </div>
        </header>

        <main className="max-w-[480px] mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border border-[#DDD8D0] bg-white flex items-center justify-center mb-5">
            <ShoppingBag size={26} className="text-[#888888]" strokeWidth={1.25} />
          </div>
          <h1 className="font-['Syne',sans-serif] text-[22px] font-bold text-[#111111] uppercase tracking-tight">
            YOUR CART IS EMPTY
          </h1>
          <p className="mt-2 text-[13.5px] font-sans text-[#666666] leading-relaxed">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            type="button"
            onClick={handleExplore}
            className="mt-6 px-8 py-3.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer"
          >
            CONTINUE SHOPPING →
          </button>
        </main>

        <footer className="w-full py-5 text-center border-t border-[#E5E0D8] text-[11px] font-sans text-[#888888]">
          © 2026 MYRKLS Inc. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] flex flex-col justify-between selection:bg-[#111111] selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E0D8] py-4 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturnToStore}
            className="flex items-center gap-2 text-[12px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">RETURN TO STORE</span>
            <span className="sm:hidden">BACK</span>
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleReturnToStore();
            }}
            className="flex items-center select-none"
          >
            <img src="/myrkls-logo-black-retina.png" alt="MYRKLS Logo" className="h-7 sm:h-8 w-auto object-contain" />
          </a>

          <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#555555]">
            <Lock size={13} className="text-[#111111]" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* 2. MOBILE ORDER SUMMARY ACCORDION */}
      <div className="lg:hidden w-full bg-[#F3F0EA] border-b border-[#E2DDD5] px-4 py-3">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-[#111111]" />
            <span className="text-[12px] font-sans font-bold uppercase tracking-wider text-[#111111]">
              {isMobileSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}
            </span>
            {isMobileSummaryOpen ? <ChevronUp size={14} className="text-[#666666]" /> : <ChevronDown size={14} className="text-[#666666]" />}
          </div>
          <span className="font-['Syne',sans-serif] text-[15px] font-bold text-[#111111]">
            {formattedFinalTotal}
          </span>
        </button>

        {isMobileSummaryOpen && (
          <div className="mt-3 pt-3 border-t border-[#E2DDD5] space-y-3 pb-1 animate-fadeIn">
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-[12px]">
                <div
                  className={`flex items-center gap-2.5 ${onNavigateProduct ? 'cursor-pointer group' : ''}`}
                  onClick={() => handleItemClick(item.productId)}
                >
                  <div className="relative w-12 h-12 bg-white border border-[#DDD8D0] shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#111111] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111111] line-clamp-1 group-hover:text-[#FF5A1F] transition-colors">{item.name}</h4>
                    <span className="text-[#777777] text-[11px]">{item.size}</span>
                  </div>
                </div>
                <span className="font-bold text-[#111111] font-sans">{item.price}</span>
              </div>
            ))}

            <div className="pt-3 border-t border-[#E2DDD5] space-y-1.5 text-[12px] font-sans">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="font-medium text-[#111111]">{formattedSubtotal}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-[#FF5A1F]">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#666666]">
                <span>Shipping</span>
                <span className="font-semibold text-[#111111]">FREE</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold text-[#111111] pt-2 border-t border-[#E2DDD5]">
                <span>Total</span>
                <span>{formattedFinalTotal}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN CHECKOUT BODY */}
      <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-1">
        {/* GATEWAY STATUS NOTICE */}
        {gatewayNotice && (
          <div className="mb-8 p-5 bg-white border border-[#111111] shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <Info size={20} className="text-[#FF5A1F] shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h2 className="font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#111111]">
                  {gatewayNotice.type === 'cod_pending' ? 'ORDER PLACEMENT PENDING' : 'PAYMENT GATEWAY PENDING'}
                </h2>
                <p className="text-[13px] font-sans text-[#555555] leading-relaxed">
                  {gatewayNotice.message}
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleReturnToStore}
                    className="px-5 py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    RETURN TO STORE
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayNotice(null)}
                    className="px-5 py-2.5 border border-[#DDD8D0] hover:border-[#111111] text-[#111111] text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    EDIT DETAILS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: ONLY 3 SECTIONS (7 Cols)                    */}
          {/* ======================================================== */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* SECTION 01 / CONTACT */}
              <div className="bg-white border border-[#E5E0D8] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
                  <h3 className="font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#111111]">
                    01 / CONTACT
                  </h3>
                  <span className="text-[11px] font-sans text-[#777777]">
                    Guest Checkout Available
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Email address */}
                  <div className="space-y-1">
                    <label htmlFor="checkout-email" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="checkout-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="alexandra@example.com"
                      className={`w-full h-10 px-3.5 bg-white border ${
                        errors.email ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                      } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                        <AlertCircle size={11} /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile number with optional OTP verification */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="checkout-phone" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        MOBILE NUMBER *
                      </label>
                      {otpStep === 'verified' ? (
                        <span className="text-[10.5px] font-sans font-medium text-[#133429] flex items-center gap-1">
                          <Check size={12} /> Verified
                        </span>
                      ) : phone.replace(/\D/g, '').length === 10 && otpStep === 'idle' ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[10.5px] font-sans font-bold text-[#FF5A1F] hover:text-[#111111] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles size={11} /> Verify for Saved Details
                        </button>
                      ) : null}
                    </div>

                    <div className="flex">
                      <span className="h-10 px-3 bg-[#F5F2EC] border border-r-0 border-[#DDD8D0] flex items-center text-[12.5px] font-mono text-[#555555]">
                        +91
                      </span>
                      <input
                        id="checkout-phone"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="10-digit mobile number"
                        className={`flex-1 h-10 px-3.5 bg-white border ${
                          errors.phone ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                        } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors font-mono`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                        <AlertCircle size={11} /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* SMART AUTOFILL STEP: OTP Verification Box */}
                  {otpStep === 'sent' && (
                    <div className="p-3.5 bg-[#FAF9F7] border border-[#DDD8D0] space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#111111]">
                          ENTER VERIFICATION CODE
                        </span>
                        <span className="text-[10px] font-mono font-medium text-[#444444] bg-white px-2 py-0.5 border border-[#E0DCD5]">
                          TEST OTP: {generatedOtp}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          id="checkout-otp-input"
                          type="text"
                          maxLength={4}
                          value={enteredOtp}
                          onChange={(e) => {
                            setEnteredOtp(e.target.value.replace(/\D/g, ''));
                            if (otpError) setOtpError(null);
                          }}
                          placeholder="••••"
                          className="w-32 h-9 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[13px] font-mono text-center tracking-[0.25em] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-4 h-9 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          VERIFY OTP
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpStep('idle')}
                          className="px-3 h-9 border border-[#DDD8D0] text-[#777777] hover:text-[#111111] text-[11px] font-sans transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {otpError && (
                        <p className="text-[10.5px] text-red-600 font-sans flex items-center gap-1">
                          <AlertCircle size={10} /> {otpError}
                        </p>
                      )}
                      <p className="text-[10.5px] font-sans text-[#777777]">
                        Verifying allows retrieving your securely saved address on this store.
                      </p>
                    </div>
                  )}

                  {/* SMART AUTOFILL STEP: Saved Profile Prompt */}
                  {otpStep === 'verified' && savedProfileFound && (
                    <div className="p-4 bg-[#F7F5F0] border-2 border-[#111111] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-sans font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                          <Sparkles size={13} className="text-[#FF5A1F]" />
                          SAVED CUSTOMER PROFILE FOUND
                        </span>
                        <span className="text-[10px] font-sans font-semibold text-[#133429] bg-white px-2 py-0.5 border border-[#DDD8D0]">
                          VERIFIED
                        </span>
                      </div>

                      <div className="text-[12px] font-sans text-[#333333] bg-white p-3 border border-[#E0DCD5] space-y-0.5">
                        <p className="font-bold text-[#111111] text-[13px]">{savedProfileFound.firstName} {savedProfileFound.lastName}</p>
                        <p>{savedProfileFound.address}{savedProfileFound.landmark ? `, ${savedProfileFound.landmark}` : ''}</p>
                        <p>{savedProfileFound.city}, {savedProfileFound.state} - {savedProfileFound.pincode}</p>
                        <p className="text-[#666666] text-[11px] pt-1 border-t border-[#F0EDE6] mt-1">{savedProfileFound.email}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={handleApplySavedDetails}
                          className="flex-1 py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          USE SAVED DETAILS
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavedProfileFound(null)}
                          className="px-3.5 py-2.5 border border-[#DDD8D0] hover:border-[#111111] text-[#666666] hover:text-[#111111] text-[11px] font-sans transition-colors cursor-pointer"
                        >
                          Enter Different
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Optional email marketing checkbox (unchecked by default) */}
                  <label className="flex items-center gap-2.5 pt-1 text-[12px] font-sans text-[#666666] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={subscribeMarketing}
                      onChange={(e) => setSubscribeMarketing(e.target.checked)}
                      className="w-4 h-4 rounded-none accent-[#111111]"
                    />
                    <span>Email me with news and special offers</span>
                  </label>
                </div>
              </div>

              {/* SECTION 02 / DELIVERY ADDRESS */}
              <div className="bg-white border border-[#E5E0D8] p-5 sm:p-6 space-y-4">
                <div className="pb-3 border-b border-[#F0EDE6] flex items-center justify-between">
                  <h3 className="font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#111111]">
                    02 / DELIVERY ADDRESS
                  </h3>
                  <span className="text-[11px] font-sans font-medium text-[#777777]">
                    Country: India
                  </span>
                </div>

                {/* Autofill Notification Pill */}
                {isAutofilled && (
                  <div className="flex items-center justify-between text-[11.5px] font-sans bg-[#F0F7F2] border border-[#C5E5D0] px-3.5 py-2 text-[#133429] animate-fadeIn">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check size={13} />
                      Details prefilled from saved profile. You can edit any field below.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAutofilled(false)}
                      className="text-[#666666] hover:text-[#111111] text-[10.5px] uppercase font-bold tracking-wider"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="checkout-first-name" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        FIRST NAME *
                      </label>
                      <input
                        id="checkout-first-name"
                        name="given-name"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                        }}
                        placeholder="First Name"
                        className={`w-full h-10 px-3.5 bg-white border ${
                          errors.firstName ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                        } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors`}
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle size={11} /> {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="checkout-last-name" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        LAST NAME *
                      </label>
                      <input
                        id="checkout-last-name"
                        name="family-name"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                        }}
                        placeholder="Last Name"
                        className={`w-full h-10 px-3.5 bg-white border ${
                          errors.lastName ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                        } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors`}
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle size={11} /> {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label htmlFor="checkout-address" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                      ADDRESS *
                    </label>
                    <input
                      id="checkout-address"
                      name="street-address"
                      type="text"
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                      }}
                      placeholder="Flat, House no., Building, Street address"
                      className={`w-full h-10 px-3.5 bg-white border ${
                        errors.address ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                      } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors`}
                    />
                    {errors.address && (
                      <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                        <AlertCircle size={11} /> {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Apartment / Landmark (optional) */}
                  <div className="space-y-1">
                    <label htmlFor="checkout-landmark" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#777777]">
                      APARTMENT / LANDMARK (OPTIONAL)
                    </label>
                    <input
                      id="checkout-landmark"
                      name="address-line2"
                      type="text"
                      autoComplete="address-line2"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Apartment, suite, landmark"
                      className="w-full h-10 px-3.5 bg-white border border-[#DDD8D0] focus:border-[#111111] rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* PIN Code, City & State (with automatic postal lookup) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="checkout-pincode" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        PIN CODE *
                      </label>
                      <input
                        id="checkout-pincode"
                        name="postal-code"
                        type="text"
                        autoComplete="postal-code"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="6 digits"
                        className={`w-full h-10 px-3.5 bg-white border ${
                          errors.pincode ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                        } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors font-mono`}
                      />
                      {errors.pincode && (
                        <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle size={11} /> {errors.pincode}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="checkout-city" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        CITY *
                      </label>
                      <input
                        id="checkout-city"
                        name="address-level2"
                        type="text"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        placeholder="City"
                        className={`w-full h-10 px-3.5 bg-white border ${
                          errors.city ? 'border-red-500 input-error-field' : 'border-[#DDD8D0] focus:border-[#111111]'
                        } rounded-none text-[13px] text-[#111111] focus:outline-none transition-colors`}
                      />
                      {errors.city && (
                        <p className="text-[11px] text-red-600 font-sans flex items-center gap-1 mt-1">
                          <AlertCircle size={11} /> {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="checkout-state" className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        STATE *
                      </label>
                      <select
                        id="checkout-state"
                        name="address-level1"
                        autoComplete="address-level1"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full h-10 px-2.5 bg-white border border-[#DDD8D0] focus:border-[#111111] rounded-none text-[12.5px] text-[#111111] focus:outline-none transition-colors cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SAVE ADDRESS FOR NEXT TIME checkbox (unchecked by default) */}
                  <label className="flex items-center gap-2.5 pt-2 text-[12px] font-sans text-[#666666] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAddressForNextTime}
                      onChange={(e) => setSaveAddressForNextTime(e.target.checked)}
                      className="w-4 h-4 rounded-none accent-[#111111]"
                    />
                    <span>Save address for next time</span>
                  </label>
                </div>
              </div>

              {/* SECTION 03 / PAYMENT */}
              <div className="bg-white border border-[#E5E0D8] p-5 sm:p-6 space-y-4">
                <div className="pb-3 border-b border-[#F0EDE6]">
                  <h3 className="font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#111111]">
                    03 / PAYMENT
                  </h3>
                  <p className="text-[11.5px] font-sans text-[#777777] mt-0.5">
                    All transactions are secure and encrypted.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: UPI */}
                  <label
                    className={`block p-3.5 border transition-all cursor-pointer ${
                      paymentMethod === 'upi' ? 'border-[#111111] bg-[#FAF9F7]' : 'border-[#DDD8D0] bg-white hover:border-[#999999]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="w-4 h-4 accent-[#111111]"
                        />
                        <div>
                          <span className="text-[13px] font-sans font-bold text-[#111111] block">
                            UPI
                          </span>
                          <span className="text-[11px] font-sans text-[#777777]">
                            Google Pay, PhonePe, Paytm, BHIM
                          </span>
                        </div>
                      </div>
                      <Smartphone size={17} className="text-[#555555]" />
                    </div>

                    {paymentMethod === 'upi' && (
                      <div className="mt-3 pt-3 border-t border-[#EAE6DF] space-y-2 animate-fadeIn">
                        <label htmlFor="checkout-upi-id" className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#666666]">
                          ENTER UPI ID (OPTIONAL)
                        </label>
                        <input
                          id="checkout-upi-id"
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okhdfcbank"
                          className="w-full h-9 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[12.5px] text-[#111111] focus:outline-none"
                        />
                        <p className="text-[10.5px] font-sans text-[#777777]">
                          You can also choose your UPI app or scan a QR code on the payment step.
                        </p>
                      </div>
                    )}
                  </label>

                  {/* Option 2: Credit / Debit Card */}
                  <label
                    className={`block p-3.5 border transition-all cursor-pointer ${
                      paymentMethod === 'card' ? 'border-[#111111] bg-[#FAF9F7]' : 'border-[#DDD8D0] bg-white hover:border-[#999999]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 accent-[#111111]"
                        />
                        <div>
                          <span className="text-[13px] font-sans font-bold text-[#111111] block">
                            Credit / Debit Card
                          </span>
                          <span className="text-[11px] font-sans text-[#777777]">
                            Visa, Mastercard, RuPay, American Express
                          </span>
                        </div>
                      </div>
                      <CreditCard size={17} className="text-[#555555]" />
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="mt-3 pt-3 border-t border-[#EAE6DF] space-y-2.5 animate-fadeIn">
                        <div>
                          <label htmlFor="checkout-card-num" className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#666666] mb-1">
                            CARD NUMBER
                          </label>
                          <input
                            id="checkout-card-num"
                            name="cc-number"
                            type="text"
                            autoComplete="cc-number"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, '')
                                .replace(/(\d{4})(?=\d)/g, '$1 ');
                              setCardNumber(val);
                              if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }));
                            }}
                            placeholder="4000 1234 5678 9010"
                            className="w-full h-9 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[12.5px] font-mono text-[#111111] focus:outline-none"
                          />
                          {errors.cardNumber && (
                            <p className="text-[10.5px] text-red-600 font-sans mt-0.5">{errors.cardNumber}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="checkout-card-expiry" className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#666666] mb-1">
                              EXPIRY (MM/YY)
                            </label>
                            <input
                              id="checkout-card-expiry"
                              name="cc-exp"
                              type="text"
                              autoComplete="cc-exp"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="12/28"
                              className="w-full h-9 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[12.5px] font-mono text-[#111111] focus:outline-none"
                            />
                            {errors.cardExpiry && (
                              <p className="text-[10.5px] text-red-600 font-sans mt-0.5">{errors.cardExpiry}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="checkout-card-cvv" className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#666666] mb-1">
                              CVV
                            </label>
                            <input
                              id="checkout-card-cvv"
                              name="cc-csc"
                              type="password"
                              autoComplete="cc-csc"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full h-9 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[12.5px] font-mono text-[#111111] focus:outline-none"
                            />
                            {errors.cardCvv && (
                              <p className="text-[10.5px] text-red-600 font-sans mt-0.5">{errors.cardCvv}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="checkout-card-name" className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#666666] mb-1">
                            NAME ON CARD
                          </label>
                          <input
                            id="checkout-card-name"
                            name="cc-name"
                            type="text"
                            autoComplete="cc-name"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name as printed on card"
                            className="w-full h-9 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[12.5px] text-[#111111] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Option 3: Net Banking */}
                  <label
                    className={`block p-3.5 border transition-all cursor-pointer ${
                      paymentMethod === 'netbanking' ? 'border-[#111111] bg-[#FAF9F7]' : 'border-[#DDD8D0] bg-white hover:border-[#999999]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                          className="w-4 h-4 accent-[#111111]"
                        />
                        <div>
                          <span className="text-[13px] font-sans font-bold text-[#111111] block">
                            Net Banking
                          </span>
                          <span className="text-[11px] font-sans text-[#777777]">
                            HDFC, ICICI, SBI, Axis, Kotak and more
                          </span>
                        </div>
                      </div>
                      <Building2 size={17} className="text-[#555555]" />
                    </div>

                    {paymentMethod === 'netbanking' && (
                      <div className="mt-3 pt-3 border-t border-[#EAE6DF] space-y-2 animate-fadeIn">
                        <label htmlFor="checkout-bank" className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#666666]">
                          SELECT BANK
                        </label>
                        <select
                          id="checkout-bank"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full h-9 px-2.5 bg-white border border-[#DDD8D0] text-[12.5px] text-[#111111] focus:outline-none"
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </select>
                      </div>
                    )}
                  </label>

                  {/* Option 4: Cash on Delivery */}
                  <label
                    className={`block p-3.5 border transition-all cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-[#111111] bg-[#FAF9F7]' : 'border-[#DDD8D0] bg-white hover:border-[#999999]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 accent-[#111111]"
                        />
                        <div>
                          <span className="text-[13px] font-sans font-bold text-[#111111] block">
                            Cash on Delivery
                          </span>
                          <span className="text-[11px] font-sans text-[#777777]">
                            Pay via Cash or UPI upon delivery
                          </span>
                        </div>
                      </div>
                      <Truck size={17} className="text-[#555555]" />
                    </div>
                  </label>
                </div>
              </div>

              {/* BOTTOM CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-4 bg-[#111111] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[12.5px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>PROCESSING...</span>
                  ) : paymentMethod === 'cod' ? (
                    <span>PLACE ORDER</span>
                  ) : (
                    <span>CONTINUE TO PAYMENT →</span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: ORDER SUMMARY (5 Cols, Desktop)            */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white border border-[#E5E0D8] p-5 shadow-sm rounded-none space-y-4">
              
              <div className="pb-3 border-b border-[#F0EDE6] flex items-center justify-between">
                <h3 className="font-['Syne',sans-serif] text-[14px] font-bold uppercase tracking-tight text-[#111111]">
                  ORDER SUMMARY ({totalCount})
                </h3>
              </div>

              {/* Products List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-[12px]">
                    <div
                      className={`flex items-center gap-3 ${onNavigateProduct ? 'cursor-pointer group' : ''}`}
                      onClick={() => handleItemClick(item.productId)}
                    >
                      <div className="relative w-12 h-12 bg-white border border-[#DDD8D0] shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-[#111111] text-white text-[9px] font-bold flex items-center justify-center px-1">
                          {item.quantity}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-[#111111] line-clamp-1 leading-snug group-hover:text-[#FF5A1F] transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-sans text-[#777777]">
                          {item.size}
                        </span>
                      </div>
                    </div>

                    <span className="font-sans font-bold text-[#111111] text-[12.5px] shrink-0">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <form onSubmit={handleApplyDiscount} className="pt-3 border-t border-[#F0EDE6] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 h-9 px-3 bg-[#FAF9F7] border border-[#DDD8D0] focus:border-[#111111] text-[12px] uppercase text-[#111111] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 h-9 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[10.5px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>

                {discountError && (
                  <p className="text-[10.5px] text-red-600 font-sans flex items-center gap-1">
                    <AlertCircle size={10} /> {discountError}
                  </p>
                )}

                {appliedDiscount && (
                  <div className="p-2 bg-[#F3F0EA] border border-[#DDD8D0] flex items-center justify-between text-[11px] font-sans text-[#111111]">
                    <span className="flex items-center gap-1 font-semibold">
                      <Tag size={11} className="text-[#FF5A1F]" />
                      '{appliedDiscount.code}' applied ({appliedDiscount.percent}% off)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedDiscount(null)}
                      className="text-[10px] text-red-600 hover:underline cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-[#F0EDE6] space-y-2 text-[12px] font-sans">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#111111]">{formattedSubtotal}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-[#FF5A1F]">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#666666]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#111111]">FREE</span>
                </div>

                <div className="pt-3 border-t border-[#111111] flex items-baseline justify-between">
                  <span className="text-[12px] font-sans font-bold uppercase tracking-wider text-[#111111]">
                    TOTAL
                  </span>
                  <span className="font-['Syne',sans-serif] text-[20px] font-bold text-[#111111]">
                    {formattedFinalTotal}
                  </span>
                </div>
              </div>

            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleReturnToStore}
                className="text-[11px] font-sans font-bold tracking-wider uppercase text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
              >
                ← Return to store
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="w-full py-4 text-center border-t border-[#E5E0D8] text-[11px] font-sans text-[#888888]">
        © 2026 MYRKLS Inc. All rights reserved.
      </footer>
    </div>
  );
};
