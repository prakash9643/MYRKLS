import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Heart,
  HelpCircle,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  ShoppingBag,
  FileText,
  Truck,
  AlertCircle,
  X,
  Phone,
  Mail,
  Lock
} from 'lucide-react';
import { useAuth, SavedAddress, CustomerOrder } from '../../context/MyrklsAuthContext';
import { useCart } from '../../context/MyrklsCartContext';
import { ALL_MYRKLS_PRODUCTS } from '../../data/products';
import { MyrklsAuthModal } from '../MyrklsAuthModal';

export interface MyrklsAccountDashboardProps {
  onBackToStore?: () => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateViewAll?: () => void;
}

type AccountTab = 'orders' | 'addresses' | 'profile' | 'wishlist' | 'support' | 'privacy';

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

export const MyrklsAccountDashboard: React.FC<MyrklsAccountDashboardProps> = ({
  onBackToStore,
  onNavigateProduct,
  onNavigateViewAll,
}) => {
  const {
    currentUser,
    isAuthenticated,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    wishlist,
    removeFromWishlist,
    deleteAccount,
  } = useAuth();

  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    state: 'Maharashtra',
    isDefault: false,
  });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [sensitiveOtpPending, setSensitiveOtpPending] = useState(false);
  const [generatedSensitiveOtp, setGeneratedSensitiveOtp] = useState('');
  const [enteredSensitiveOtp, setEnteredSensitiveOtp] = useState('');
  const [otpVerifyError, setOtpVerifyError] = useState('');

  // Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<CustomerOrder | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<CustomerOrder | null>(null);

  // Account Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Help Ticket Submitted State
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportTopic, setSupportTopic] = useState('Order Tracking');

  // Trigger feedback toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleReturn = () => {
    if (onBackToStore) {
      onBackToStore();
    } else {
      window.location.hash = '#home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================
  // ADDRESS HELPERS
  // ==========================================
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrForm({
      firstName: currentUser?.name.split(' ')[0] || '',
      lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
      phone: currentUser?.phone || '',
      address: '',
      landmark: '',
      pincode: '',
      city: '',
      state: 'Maharashtra',
      isDefault: (currentUser?.addresses.length || 0) === 0,
    });
    setAddrErrors({});
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.address,
      landmark: addr.landmark || '',
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault,
    });
    setAddrErrors({});
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!addrForm.firstName.trim()) errs.firstName = 'First name required';
    if (!addrForm.lastName.trim()) errs.lastName = 'Last name required';
    if (!addrForm.phone.trim() || addrForm.phone.replace(/\D/g, '').length !== 10)
      errs.phone = 'Valid 10-digit phone required';
    if (!addrForm.address.trim()) errs.address = 'Street address required';
    if (!addrForm.pincode.trim() || addrForm.pincode.replace(/\D/g, '').length !== 6)
      errs.pincode = 'Valid 6-digit PIN required';
    if (!addrForm.city.trim()) errs.city = 'City required';

    if (Object.keys(errs).length > 0) {
      setAddrErrors(errs);
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addrForm);
      showToast('Address updated successfully');
    } else {
      addAddress(addrForm);
      showToast('New address saved to your account');
    }
    setIsAddressModalOpen(false);
  };

  // ==========================================
  // PROFILE UPDATE WITH SENSITIVE VERIFICATION
  // ==========================================
  const handleInitiateProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!profileForm.name.trim()) errs.name = 'Full name required';
    if (!profileForm.email.trim() || !profileForm.email.includes('@'))
      errs.email = 'Valid email required';
    if (profileForm.phone.replace(/\D/g, '').length !== 10)
      errs.phone = '10-digit phone number required';

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    const emailChanged = profileForm.email.trim() !== currentUser?.email;
    const phoneChanged = profileForm.phone.replace(/\D/g, '') !== currentUser?.phone;

    // If sensitive contact detail changed, require verification OTP
    if (emailChanged || phoneChanged) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedSensitiveOtp(code);
      setEnteredSensitiveOtp('');
      setOtpVerifyError('');
      setSensitiveOtpPending(true);
    } else {
      // Only non-sensitive changes (like name)
      updateProfile({ name: profileForm.name.trim() });
      setIsEditingProfile(false);
      showToast('Profile updated successfully');
    }
  };

  const handleConfirmSensitiveOtp = () => {
    if (enteredSensitiveOtp !== generatedSensitiveOtp) {
      setOtpVerifyError('Invalid verification code. Please enter the demo code shown.');
      return;
    }

    updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.replace(/\D/g, ''),
    });

    setSensitiveOtpPending(false);
    setIsEditingProfile(false);
    showToast('Contact details verified and updated');
  };

  // Wishlist products
  const wishlistedProducts = ALL_MYRKLS_PRODUCTS.filter((prod) =>
    wishlist.includes(prod.id.toLowerCase())
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
    }
  }, [currentUser]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] text-[#111111] flex flex-col justify-between selection:bg-[#111111] selection:text-white">
        {/* TOP MINIMAL HEADER */}
        <header className="sticky top-0 z-30 w-full bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E0D8] py-4 px-4 sm:px-8">
          <div className="max-w-[1240px] mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={handleReturn}
              className="flex items-center gap-2 text-[12px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">RETURN TO STORE</span>
              <span className="sm:hidden">STORE</span>
            </button>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleReturn();
              }}
              className="flex items-center select-none"
            >
              <img src="/myrkls-logo-black-retina.png" alt="MYRKLS Logo" className="h-7 sm:h-8 w-auto object-contain" />
            </a>

            <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#555555]">
              <Shield size={13} className="text-[#111111]" />
              <span className="hidden sm:inline">SECURE ACCESS</span>
            </div>
          </div>
        </header>

        {/* PAGE HEADING */}
        <section className="w-full bg-[#FAF9F7] pt-8 sm:pt-12 pb-6 px-4 sm:px-8 border-b border-[#E5E0D8]">
          <div className="max-w-[1240px] mx-auto">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#FF5A1F] block mb-1">
              MYRKLS / YOUR SPACE
            </span>
            <h1 className="font-['Syne',sans-serif] text-[28px] sm:text-[38px] font-bold text-[#111111] uppercase tracking-tight">
              YOUR ACCOUNT.
            </h1>
            <p className="mt-1 text-[13.5px] sm:text-[14.5px] font-sans text-[#666666]">
              Everything you need, in one place.
            </p>
          </div>
        </section>

        {/* AUTH PROMPT CARD */}
        <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="max-w-md w-full bg-white border border-[#E5E0D8] p-8 sm:p-10 shadow-xs space-y-6">
            <div className="w-14 h-14 bg-[#FAF9F7] border border-[#E5E0D8] mx-auto flex items-center justify-center text-[#111111]">
              <User size={24} />
            </div>
            <div>
              <h2 className="font-['Syne',sans-serif] text-[20px] font-bold text-[#111111] uppercase tracking-tight">
                Authentication Required
              </h2>
              <p className="text-[13px] font-sans text-[#666666] mt-2 leading-relaxed">
                Please sign in or create an account to view your past orders, manage delivery addresses, edit profile information and access your wishlist.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[12.5px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In / Create Account →
            </button>
            <button
              type="button"
              onClick={handleReturn}
              className="w-full text-center text-[12px] font-sans text-[#777777] hover:text-[#111111] uppercase tracking-wider font-semibold cursor-pointer"
            >
              ← Continue Shopping
            </button>
          </div>
        </main>

        <footer className="border-t border-[#E5E0D8] bg-[#FAF9F7] py-6 px-4 sm:px-8 text-center text-[12px] font-sans text-[#888888]">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} MYRKLS® LABORATORY SCIENCES. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider font-semibold text-[#555555]">
              <span>Support Concierge</span>
              <span>•</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </footer>

        <MyrklsAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] flex flex-col justify-between selection:bg-[#111111] selection:text-white">
      {/* 1. TOP MINIMAL HEADER */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#E5E0D8] py-4 px-4 sm:px-8">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturn}
            className="flex items-center gap-2 text-[12px] font-sans font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">RETURN TO STORE</span>
            <span className="sm:hidden">STORE</span>
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleReturn();
            }}
            className="flex items-center select-none"
          >
            <img src="/myrkls-logo-black-retina.png" alt="MYRKLS Logo" className="h-7 sm:h-8 w-auto object-contain" />
          </a>

          <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#555555]">
            <Shield size={13} className="text-[#111111]" />
            <span className="hidden sm:inline">SECURE ACCOUNT</span>
          </div>
        </div>
      </header>

      {/* FEEDBACK TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-3 shadow-lg border border-[#333333] flex items-center gap-2 text-[12.5px] font-sans animate-fadeIn">
          <Check size={14} className="text-[#FF5A1F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. PAGE HEADING */}
      <section className="w-full bg-[#FAF9F7] pt-8 sm:pt-12 pb-6 px-4 sm:px-8 border-b border-[#E5E0D8]">
        <div className="max-w-[1240px] mx-auto">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#FF5A1F] block mb-1">
            MYRKLS / YOUR SPACE
          </span>
          <h1 className="font-['Syne',sans-serif] text-[28px] sm:text-[38px] font-bold text-[#111111] uppercase tracking-tight">
            YOUR ACCOUNT.
          </h1>
          <p className="mt-1 text-[13.5px] sm:text-[14.5px] font-sans text-[#666666]">
            Everything you need, in one place.
          </p>
        </div>
      </section>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-1">
        {/* MOBILE HORIZONTAL TAB SWITCHER */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#E5E0D8] scrollbar-none">
          {[
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'support', label: 'Help', icon: HelpCircle },
            { id: 'privacy', label: 'Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AccountTab)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[12px] font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#111111] text-white'
                    : 'bg-white border border-[#DDD8D0] text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Icon size={13} className={active ? 'text-[#FF5A1F]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDEBAR NAVIGATION (Desktop: 4 Cols)                 */}
          {/* ======================================================== */}
          <aside className="hidden lg:block lg:col-span-4 bg-white border border-[#E5E0D8] p-6 shadow-xs sticky top-24 space-y-6">
            {/* Customer Profile Header Badge */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-[#F0EDE6]">
              <div className="w-12 h-12 bg-[#111111] text-white font-['Syne',sans-serif] font-bold text-[15px] flex items-center justify-center">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-['Syne',sans-serif] text-[15px] font-bold text-[#111111] truncate uppercase">
                  {currentUser?.name || 'Valued Member'}
                </h3>
                <p className="text-[12px] font-sans text-[#777777] truncate">
                  {currentUser?.email || '+91 ' + currentUser?.phone}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {[
                { id: 'orders', label: '01 / MY ORDERS', icon: Package, count: currentUser?.orders.length },
                { id: 'addresses', label: '02 / SAVED ADDRESSES', icon: MapPin, count: currentUser?.addresses.length },
                { id: 'profile', label: '03 / MY PROFILE', icon: User },
                { id: 'wishlist', label: '04 / MY WISHLIST', icon: Heart, count: wishlist.length },
                { id: 'support', label: '05 / HELP & SUPPORT', icon: HelpCircle },
                { id: 'privacy', label: '06 / PRIVACY & SECURITY', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as AccountTab)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-[12.5px] font-sans font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      active
                        ? 'bg-[#111111] text-white font-semibold'
                        : 'text-[#444444] hover:bg-[#F5F2EB] hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={active ? 'text-[#FF5A1F]' : 'text-[#777777]'} />
                      <span>{tab.label}</span>
                    </div>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 ${
                          active ? 'bg-white/20 text-white' : 'bg-[#EAE6DF] text-[#555555]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="pt-4 border-t border-[#F0EDE6]">
              <button
                type="button"
                onClick={() => {
                  logout();
                  handleReturn();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-sans font-bold uppercase tracking-wider text-[#777777] hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT CONTENT AREA (8 Cols)                              */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
                  <div>
                    <h2 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111] uppercase tracking-tight">
                      Order History
                    </h2>
                    <p className="text-[12.5px] font-sans text-[#666666]">
                      Review current shipments, tracking timelines and tax invoices.
                    </p>
                  </div>
                </div>

                {currentUser?.orders && currentUser.orders.length > 0 ? (
                  <div className="space-y-4">
                    {currentUser.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-[#E5E0D8] p-5 sm:p-6 shadow-xs space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#F0EDE6] text-[12px] font-sans">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[#111111] text-[13px]">
                              {order.id}
                            </span>
                            <span className="text-[#777777]">{order.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'Delivered'
                                  ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                  : order.status === 'Dispatched'
                                  ? 'bg-[#E3F2FD] text-[#1565C0]'
                                  : 'bg-[#FFF3E0] text-[#E65100]'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="font-bold text-[#111111] text-[13px]">{order.total}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-[12.5px]">
                              <div
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => onNavigateProduct?.(item.productId)}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 bg-[#FAF9F7] border border-[#DDD8D0] object-cover shrink-0"
                                />
                                <div>
                                  <h4 className="font-bold text-[#111111] group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <span className="text-[#777777] text-[11px]">
                                    Qty: {item.quantity} {item.size ? `• ${item.size}` : ''}
                                  </span>
                                </div>
                              </div>
                              <span className="font-sans font-bold text-[#111111] shrink-0">{item.price}</span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#F0EDE6] flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            className="px-4 py-2 border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            VIEW ORDER DETAILS
                          </button>
                          {order.tracking && (
                            <button
                              type="button"
                              onClick={() => setTrackingOrder(order)}
                              className="px-4 py-2 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Truck size={12} />
                              <span>TRACK ORDER</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3.5 py-2 border border-[#DDD8D0] hover:border-[#111111] text-[#666666] hover:text-[#111111] text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <FileText size={12} />
                            <span>INVOICE</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#E5E0D8] p-10 text-center space-y-4">
                    <div className="w-14 h-14 bg-[#FAF9F7] border border-[#DDD8D0] mx-auto flex items-center justify-center">
                      <Package size={24} className="text-[#888888]" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#111111] uppercase">
                      No Orders Placed Yet
                    </h3>
                    <p className="text-[13px] font-sans text-[#666666] max-w-[380px] mx-auto leading-relaxed">
                      Your placed orders, shipment status and downloadable tax invoices will appear here.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigateViewAll?.() || handleReturn()}
                      className="px-6 py-3 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      EXPLORE PRODUCTS →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
                  <div>
                    <h2 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111] uppercase tracking-tight">
                      Delivery Addresses
                    </h2>
                    <p className="text-[12.5px] font-sans text-[#666666]">
                      Saved destinations automatically sync with checkout 1-click autofill.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="px-4 py-2 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>ADD ADDRESS</span>
                  </button>
                </div>

                {currentUser?.addresses && currentUser.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-white border p-5 space-y-3 relative ${
                          addr.isDefault ? 'border-[#111111] shadow-xs' : 'border-[#E5E0D8]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#111111] text-[13.5px]">
                            {addr.firstName} {addr.lastName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <div className="text-[12.5px] font-sans text-[#555555] space-y-0.5 leading-relaxed">
                          <p>{addr.address}</p>
                          {addr.landmark && <p className="text-[#777777]">{addr.landmark}</p>}
                          <p>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="pt-1 text-[#333333] font-mono text-[12px]">+91 {addr.phone}</p>
                        </div>

                        <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between text-[11px] font-sans">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="font-bold text-[#111111] hover:text-[#FF5A1F] flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteAddress(addr.id);
                                showToast('Address deleted');
                              }}
                              className="font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => {
                                setDefaultAddress(addr.id);
                                showToast('Default address updated');
                              }}
                              className="text-[#666666] hover:text-[#111111] underline cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#E5E0D8] p-10 text-center space-y-4">
                    <div className="w-14 h-14 bg-[#FAF9F7] border border-[#DDD8D0] mx-auto flex items-center justify-center">
                      <MapPin size={24} className="text-[#888888]" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#111111] uppercase">
                      No Saved Addresses
                    </h3>
                    <p className="text-[13px] font-sans text-[#666666] max-w-[360px] mx-auto">
                      Save your home, clinic or office address for instant 1-click checkout.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="px-6 py-3 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      + ADD ADDRESS
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: MY PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-[#E5E0D8] p-6 sm:p-8 space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EDE6]">
                  <div>
                    <h2 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111] uppercase tracking-tight">
                      Personal Profile
                    </h2>
                    <p className="text-[12.5px] font-sans text-[#666666]">
                      Manage your official customer details. Sensitive changes require verification.
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      EDIT PROFILE
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[13px] font-sans">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                        FULL NAME
                      </span>
                      <p className="font-bold text-[#111111] text-[14.5px]">{currentUser?.name}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                        EMAIL ADDRESS
                      </span>
                      <p className="font-bold text-[#111111] text-[14.5px]">{currentUser?.email}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                        MOBILE NUMBER
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#111111] text-[14.5px] font-mono">+91 {currentUser?.phone}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5">
                          VERIFIED
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                        MEMBER SINCE
                      </span>
                      <p className="text-[#555555]">
                        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active Member'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleInitiateProfileSave} className="space-y-4 max-w-[500px]">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full h-10 px-3.5 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[13px] text-[#111111] focus:outline-none"
                      />
                      {profileErrors.name && (
                        <p className="text-[11px] text-red-600 font-sans mt-0.5">{profileErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full h-10 px-3.5 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[13px] text-[#111111] focus:outline-none"
                      />
                      {profileErrors.email && (
                        <p className="text-[11px] text-red-600 font-sans mt-0.5">{profileErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                        MOBILE NUMBER *
                      </label>
                      <div className="flex">
                        <span className="h-10 px-3 bg-[#F5F2EC] border border-r-0 border-[#DDD8D0] flex items-center text-[12.5px] font-mono text-[#555555]">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })
                          }
                          className="flex-1 h-10 px-3.5 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[13px] font-mono text-[#111111] focus:outline-none"
                        />
                      </div>
                      {profileErrors.phone && (
                        <p className="text-[11px] text-red-600 font-sans mt-0.5">{profileErrors.phone}</p>
                      )}
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        SAVE CHANGES
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2.5 border border-[#DDD8D0] text-[#666666] hover:text-[#111111] text-[11px] font-sans uppercase transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* SENSITIVE CHANGE OTP MODAL */}
                {sensitiveOtpPending && (
                  <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white max-w-[420px] w-full p-6 border border-[#111111] shadow-2xl space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
                        <span className="font-['Syne',sans-serif] text-[14px] font-bold text-[#111111] uppercase flex items-center gap-2">
                          <Lock size={14} className="text-[#FF5A1F]" />
                          SECURITY VERIFICATION
                        </span>
                        <button
                          type="button"
                          onClick={() => setSensitiveOtpPending(false)}
                          aria-label="Close dialog"
                          className="text-[#777777] hover:text-[#111111] cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <p className="text-[12.5px] font-sans text-[#555555] leading-relaxed">
                        To protect your account security, enter the 4-digit verification code before modifying sensitive contact details.
                      </p>

                      <div className="p-3 bg-[#FAF9F7] border border-[#DDD8D0] space-y-2 text-center">
                        <span className="text-[10.5px] font-sans font-bold text-[#777777] uppercase tracking-wider block">
                          DEMO VERIFICATION CODE
                        </span>
                        <span className="text-[18px] font-mono font-bold text-[#111111] tracking-[0.2em]">
                          {generatedSensitiveOtp}
                        </span>
                      </div>

                      <input
                        type="text"
                        maxLength={4}
                        value={enteredSensitiveOtp}
                        onChange={(e) => setEnteredSensitiveOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full h-11 px-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[16px] font-mono text-center tracking-[0.3em] focus:outline-none"
                      />

                      {otpVerifyError && (
                        <p className="text-[11px] text-red-600 font-sans text-center">{otpVerifyError}</p>
                      )}

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={handleConfirmSensitiveOtp}
                          className="flex-1 py-3 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          CONFIRM & UPDATE
                        </button>
                        <button
                          type="button"
                          onClick={() => setSensitiveOtpPending(false)}
                          className="px-4 py-3 border border-[#DDD8D0] text-[#666666] text-[11px] font-sans transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: MY WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
                  <div>
                    <h2 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111] uppercase tracking-tight">
                      Saved Wishlist ({wishlistedProducts.length})
                    </h2>
                    <p className="text-[12.5px] font-sans text-[#666666]">
                      Formulations you've bookmarked for your skincare routine.
                    </p>
                  </div>
                </div>

                {wishlistedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white border border-[#E5E0D8] p-4 flex flex-col justify-between space-y-4 hover:border-[#111111] transition-colors"
                      >
                        <div
                          className="flex gap-3.5 cursor-pointer group"
                          onClick={() => onNavigateProduct?.(prod.id)}
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-20 h-20 bg-[#FAF9F7] border border-[#DDD8D0] object-cover shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-[#FF5A1F]">
                              {prod.categoryTitle}
                            </span>
                            <h4 className="font-bold text-[#111111] text-[13.5px] group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] font-sans text-[#777777] line-clamp-1">{prod.consumerBenefit}</p>
                            <span className="font-bold text-[#111111] text-[13px] block pt-1">{prod.price}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(prod.id, undefined, 1, true);
                              showToast(`${prod.name} added to cart`);
                            }}
                            className="flex-1 py-2 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag size={12} />
                            <span>ADD TO BAG</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeFromWishlist(prod.id);
                              showToast('Removed from wishlist');
                            }}
                            className="px-3 py-2 border border-[#DDD8D0] hover:border-red-600 text-[#777777] hover:text-red-600 text-[11px] font-sans transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#E5E0D8] p-10 text-center space-y-4">
                    <div className="w-14 h-14 bg-[#FAF9F7] border border-[#DDD8D0] mx-auto flex items-center justify-center">
                      <Heart size={24} className="text-[#888888]" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#111111] uppercase">
                      Your Wishlist is Empty
                    </h3>
                    <p className="text-[13px] font-sans text-[#666666] max-w-[360px] mx-auto">
                      Explore our clinical formulations and save items to build your personalized regimen.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigateViewAll?.() || handleReturn()}
                      className="px-6 py-3 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      EXPLORE CATALOG →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 5: HELP & SUPPORT */}
            {activeTab === 'support' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-[#E5E0D8]">
                  <h2 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111] uppercase tracking-tight">
                    Help & Support
                  </h2>
                  <p className="text-[12.5px] font-sans text-[#666666]">
                    Dedicated concierge support, order modifications and policy information.
                  </p>
                </div>

                {/* Contact Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-[#E5E0D8] p-5 space-y-2.5">
                    <div className="w-9 h-9 bg-[#111111] text-white flex items-center justify-center">
                      <Mail size={16} />
                    </div>
                    <h4 className="font-bold text-[#111111] text-[14px]">Concierge Email</h4>
                    <p className="text-[12px] font-sans text-[#666666] leading-relaxed">
                      Questions regarding active orders, clinical protocols or returns.
                    </p>
                    <a
                      href="mailto:concierge@myrkls.com"
                      className="text-[#FF5A1F] hover:underline font-bold text-[12px] block pt-1"
                    >
                      concierge@myrkls.com →
                    </a>
                  </div>

                  <div className="bg-white border border-[#E5E0D8] p-5 space-y-2.5">
                    <div className="w-9 h-9 bg-[#133429] text-white flex items-center justify-center">
                      <Phone size={16} />
                    </div>
                    <h4 className="font-bold text-[#111111] text-[14px]">WhatsApp & Phone</h4>
                    <p className="text-[12px] font-sans text-[#666666] leading-relaxed">
                      Direct WhatsApp assistance: Mon – Sat, 9:00 AM – 7:00 PM IST.
                    </p>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#133429] hover:underline font-bold text-[12px] block pt-1"
                    >
                      +91 98765 43210 →
                    </a>
                  </div>
                </div>

                {/* Direct Order Support Ticket Form */}
                <div className="bg-white border border-[#E5E0D8] p-6 space-y-4">
                  <h3 className="font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#111111]">
                    Submit an Order Inquiry
                  </h3>

                  {supportSubmitted ? (
                    <div className="p-4 bg-[#F0F7F2] border border-[#C5E5D0] text-[#133429] text-[13px] font-sans space-y-1">
                      <p className="font-bold">Inquiry Registered (Ref #SUP-7419)</p>
                      <p className="text-[12px]">Our concierge team will respond via email within 2-4 business hours.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSupportSubmitted(false);
                          setSupportMessage('');
                        }}
                        className="text-[11px] underline pt-2 cursor-pointer font-bold"
                      >
                        Send another inquiry
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!supportMessage.trim()) return;
                        setSupportSubmitted(true);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555] mb-1">
                          TOPIC
                        </label>
                        <select
                          value={supportTopic}
                          onChange={(e) => setSupportTopic(e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#DDD8D0] text-[13px] text-[#111111] focus:outline-none"
                        >
                          <option value="Order Tracking">Order Tracking & Delivery Status</option>
                          <option value="Address Correction">Modify Shipping Address</option>
                          <option value="Damaged Shipment">Damaged or Incorrect Formulation</option>
                          <option value="Return / Refund">Returns & Refund Consultation</option>
                          <option value="Product Advisory">Product Suitability Advisory</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#555555] mb-1">
                          MESSAGE
                        </label>
                        <textarea
                          rows={3}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Please provide details regarding your inquiry..."
                          className="w-full p-3 bg-white border border-[#DDD8D0] focus:border-[#111111] text-[13px] text-[#111111] focus:outline-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        SUBMIT INQUIRY
                      </button>
                    </form>
                  )}
                </div>

                {/* Policies Accordion */}
                <div className="bg-white border border-[#E5E0D8] p-6 space-y-3">
                  <h3 className="font-['Syne',sans-serif] text-[15px] font-bold uppercase tracking-tight text-[#111111] pb-2 border-b border-[#F0EDE6]">
                    Store Policies
                  </h3>

                  <div className="space-y-2 text-[12.5px] font-sans text-[#555555]">
                    <div className="p-3 bg-[#FAF9F7] border border-[#DDD8D0]">
                      <span className="font-bold text-[#111111] block mb-0.5">30-Day Satisfaction Protocol</span>
                      <p className="leading-relaxed">
                        If an active formulation proves unsuitable to your skin barrier, you may request an exchange within 30 days of receiving your order.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF9F7] border border-[#DDD8D0]">
                      <span className="font-bold text-[#111111] block mb-0.5">Refund Processing Timeline</span>
                      <p className="leading-relaxed">
                        Approved refunds are credited back to the original payment source within 3-5 business days upon warehouse verification.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF9F7] border border-[#DDD8D0]">
                      <span className="font-bold text-[#111111] block mb-0.5">Shipping & Cold-Chain Protocol</span>
                      <p className="leading-relaxed">
                        Orders are dispatched in temperature-controlled packaging via priority couriers across all serviceable Indian PIN codes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: PRIVACY & SECURITY */}
            {activeTab === 'privacy' && (
              <div className="bg-white border border-[#E5E0D8] p-6 sm:p-8 space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-[#E5E0D8]">
                  <h2 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111] uppercase tracking-tight">
                    Privacy & Security
                  </h2>
                  <p className="text-[12.5px] font-sans text-[#666666]">
                    Manage communication preferences, device authentication and personal data rights.
                  </p>
                </div>

                {/* Marketing Preferences */}
                <div className="space-y-3 pb-6 border-b border-[#F0EDE6]">
                  <h3 className="font-bold text-[#111111] text-[14px]">Communication Preferences</h3>

                  <label className="flex items-start gap-3 text-[12.5px] font-sans text-[#444444] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentUser?.marketingPreferences.emailNews ?? true}
                      onChange={(e) => {
                        updateProfile({
                          marketingPreferences: {
                            ...currentUser?.marketingPreferences,
                            emailNews: e.target.checked,
                            smsAlerts: currentUser?.marketingPreferences.smsAlerts ?? false,
                          },
                        });
                        showToast('Email preference updated');
                      }}
                      className="w-4 h-4 rounded-none accent-[#111111] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#111111] block">Email News & Breakthroughs</span>
                      <span className="text-[#777777]">Receive updates regarding new active bio-conjugates and seasonal releases.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-[12.5px] font-sans text-[#444444] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentUser?.marketingPreferences.smsAlerts ?? false}
                      onChange={(e) => {
                        updateProfile({
                          marketingPreferences: {
                            ...currentUser?.marketingPreferences,
                            emailNews: currentUser?.marketingPreferences.emailNews ?? true,
                            smsAlerts: e.target.checked,
                          },
                        });
                        showToast('SMS preference updated');
                      }}
                      className="w-4 h-4 rounded-none accent-[#111111] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#111111] block">WhatsApp & SMS Order Alerts</span>
                      <span className="text-[#777777]">Receive tracking updates and courier OTP directly via WhatsApp.</span>
                    </div>
                  </label>
                </div>

                {/* Session Actions */}
                <div className="space-y-3 pb-6 border-b border-[#F0EDE6]">
                  <h3 className="font-bold text-[#111111] text-[14px]">Device Authentication</h3>
                  <p className="text-[12.5px] font-sans text-[#666666]">
                    You are currently authenticated on this browser session.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      handleReturn();
                    }}
                    className="px-5 py-2.5 border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    LOG OUT FROM THIS DEVICE
                  </button>
                </div>

                {/* Account Deletion Request */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-red-600 text-[14px]">Delete Account</h3>
                  <p className="text-[12.5px] font-sans text-[#666666] leading-relaxed">
                    Permanently delete your MYRKLS profile, saved delivery addresses and private records. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    REQUEST ACCOUNT DELETION
                  </button>
                </div>

                {/* Account Deletion Modal */}
                {isDeleteModalOpen && (
                  <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white max-w-[420px] w-full p-6 border-2 border-red-600 shadow-2xl space-y-4 animate-fadeIn">
                      <div className="flex items-center gap-2 text-red-600 font-['Syne',sans-serif] text-[15px] font-bold uppercase">
                        <AlertCircle size={18} />
                        <span>Confirm Account Deletion</span>
                      </div>

                      <p className="text-[13px] font-sans text-[#444444] leading-relaxed">
                        Are you sure you want to permanently delete your account? All saved addresses, order references and preferences will be permanently wiped.
                      </p>

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            deleteAccount();
                            setIsDeleteModalOpen(false);
                            handleReturn();
                          }}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          CONFIRM DELETE
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeleteModalOpen(false)}
                          className="px-4 py-2.5 border border-[#DDD8D0] text-[#666666] text-[11px] font-sans uppercase transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 4. ADDRESS ADD/EDIT MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-[500px] w-full p-6 sm:p-7 border border-[#111111] shadow-2xl space-y-4 my-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
              <h3 className="font-['Syne',sans-serif] text-[15px] font-bold text-[#111111] uppercase tracking-tight">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Close dialog"
                className="text-[#777777] hover:text-[#111111] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                    FIRST NAME *
                  </label>
                  <input
                    type="text"
                    value={addrForm.firstName}
                    onChange={(e) => setAddrForm({ ...addrForm, firstName: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] text-[#111111] focus:outline-none"
                  />
                  {addrErrors.firstName && (
                    <p className="text-[10px] text-red-600 font-sans">{addrErrors.firstName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                    LAST NAME *
                  </label>
                  <input
                    type="text"
                    value={addrForm.lastName}
                    onChange={(e) => setAddrForm({ ...addrForm, lastName: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] text-[#111111] focus:outline-none"
                  />
                  {addrErrors.lastName && (
                    <p className="text-[10px] text-red-600 font-sans">{addrErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                  STREET ADDRESS *
                </label>
                <input
                  type="text"
                  value={addrForm.address}
                  onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })}
                  placeholder="Flat, House no., Building, Street"
                  className="w-full h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] text-[#111111] focus:outline-none"
                />
                {addrErrors.address && (
                  <p className="text-[10px] text-red-600 font-sans">{addrErrors.address}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#777777]">
                  APARTMENT / LANDMARK (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={addrForm.landmark}
                  onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                  placeholder="Apartment, suite, landmark"
                  className="w-full h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                    PIN CODE *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setAddrForm({ ...addrForm, pincode: val });
                      if (val.length === 6) {
                        try {
                          fetch(`https://api.postalpincode.in/pincode/${val}`)
                            .then((res) => res.json())
                            .then((data) => {
                              if (Array.isArray(data) && data[0]?.PostOffice?.length > 0) {
                                const po = data[0].PostOffice[0];
                                setAddrForm((prev) => ({
                                  ...prev,
                                  city: po.District || prev.city,
                                  state: po.State || prev.state,
                                }));
                              }
                            })
                            .catch(() => {});
                        } catch {}
                      }
                    }}
                    placeholder="6 digits"
                    className="w-full h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] font-mono text-[#111111] focus:outline-none"
                  />
                  {addrErrors.pincode && (
                    <p className="text-[10px] text-red-600 font-sans">{addrErrors.pincode}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                    CITY *
                  </label>
                  <input
                    type="text"
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] text-[#111111] focus:outline-none"
                  />
                  {addrErrors.city && (
                    <p className="text-[10px] text-red-600 font-sans">{addrErrors.city}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                    STATE *
                  </label>
                  <select
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full h-9 px-2 bg-white border border-[#DDD8D0] text-[11.5px] text-[#111111] focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10.5px] font-sans font-bold uppercase tracking-wider text-[#555555]">
                  PHONE NUMBER (FOR COURIER OTP) *
                </label>
                <div className="flex">
                  <span className="h-9 px-2.5 bg-[#F5F2EC] border border-r-0 border-[#DDD8D0] flex items-center text-[12px] font-mono text-[#555555]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit number"
                    className="flex-1 h-9 px-3 bg-white border border-[#DDD8D0] text-[12.5px] font-mono text-[#111111] focus:outline-none"
                  />
                </div>
                {addrErrors.phone && (
                  <p className="text-[10px] text-red-600 font-sans">{addrErrors.phone}</p>
                )}
              </div>

              <label className="flex items-center gap-2 pt-1 text-[12px] font-sans text-[#555555] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded-none accent-[#111111]"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  SAVE ADDRESS
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 border border-[#DDD8D0] text-[#666666] text-[11px] font-sans transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-[560px] w-full p-6 sm:p-7 border border-[#111111] shadow-2xl space-y-4 my-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#FF5A1F] block">
                  ORDER SPECIFICATION
                </span>
                <h3 className="font-['Syne',sans-serif] text-[17px] font-bold text-[#111111]">
                  {viewingOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                aria-label="Close dialog"
                className="text-[#777777] hover:text-[#111111] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-[12px] font-sans text-[#666666] flex justify-between">
              <span>Date Placed: {viewingOrder.date}</span>
              <span className="font-bold text-[#111111]">Payment: {viewingOrder.paymentMethod}</span>
            </div>

            {/* Items */}
            <div className="py-2 border-y border-[#F0EDE6] space-y-3">
              {viewingOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-[12.5px]">
                  <div className="flex items-center gap-3">
                    <img src={it.image} alt={it.name} className="w-11 h-11 border border-[#DDD8D0] object-cover" />
                    <div>
                      <p className="font-bold text-[#111111]">{it.name}</p>
                      <p className="text-[11px] text-[#777777]">
                        Qty: {it.quantity} {it.size ? `• ${it.size}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#111111]">{it.price}</span>
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            <div className="text-[12px] font-sans space-y-1">
              <span className="font-bold text-[#111111] uppercase tracking-wider text-[10.5px]">
                DELIVERY DESTINATION
              </span>
              <p className="text-[#333333] font-medium">{viewingOrder.shippingAddress.name}</p>
              <p className="text-[#555555]">{viewingOrder.shippingAddress.address}</p>
              <p className="text-[#555555]">
                {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} -{' '}
                {viewingOrder.shippingAddress.pincode}
              </p>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-[#F0EDE6] flex items-center justify-between">
              <span className="font-bold text-[#111111] uppercase text-[12px]">TOTAL AMOUNT</span>
              <span className="font-['Syne',sans-serif] text-[18px] font-bold text-[#111111]">
                {viewingOrder.total}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="w-full py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TRACK ORDER MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-[480px] w-full p-6 border border-[#111111] shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#FF5A1F] block">
                  LIVE CONCIERGE TRACKING
                </span>
                <h3 className="font-['Syne',sans-serif] text-[16px] font-bold text-[#111111]">
                  {trackingOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                aria-label="Close dialog"
                className="text-[#777777] hover:text-[#111111] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {trackingOrder.tracking && (
              <div className="space-y-4 text-[12.5px] font-sans">
                <div className="p-3 bg-[#FAF9F7] border border-[#DDD8D0] flex justify-between text-[12px]">
                  <div>
                    <span className="text-[#777777] block text-[10.5px]">Courier Partner</span>
                    <span className="font-bold text-[#111111]">{trackingOrder.tracking.carrier}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block text-[10.5px]">AWB / Docket</span>
                    <span className="font-mono font-bold text-[#111111]">
                      {trackingOrder.tracking.trackingNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#777777] block text-[10.5px]">Estimated Delivery</span>
                    <span className="font-bold text-[#133429]">{trackingOrder.tracking.estimatedDelivery}</span>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-3 pt-2">
                  {[
                    { step: 1, label: 'Order Confirmed & Formulation Allocated', done: true },
                    { step: 2, label: 'Quality Verification & Sealed Packaging', done: trackingOrder.tracking.currentStep >= 2 },
                    { step: 3, label: 'Handed Over to Courier (In Transit)', done: trackingOrder.tracking.currentStep >= 3 },
                    { step: 4, label: 'Out for Delivery to Destination', done: trackingOrder.tracking.currentStep >= 4 },
                  ].map((st) => (
                    <div key={st.step} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          st.done ? 'bg-[#111111] text-white' : 'bg-[#EAE6DF] text-[#888888]'
                        }`}
                      >
                        {st.done ? <Check size={12} /> : st.step}
                      </div>
                      <span className={`text-[12px] ${st.done ? 'font-bold text-[#111111]' : 'text-[#888888]'}`}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="w-full py-2.5 bg-[#111111] hover:bg-[#FF5A1F] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                CLOSE TRACKING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="w-full py-5 text-center border-t border-[#E5E0D8] text-[11px] font-sans text-[#888888]">
        © 2026 MYRKLS Inc. Global Science. All rights reserved.
      </footer>
    </div>
  );
};

export default MyrklsAccountDashboard;
