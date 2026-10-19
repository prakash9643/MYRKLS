import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  date: string;
  status: 'Confirmed' | 'Preparing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  total: string;
  totalNumber: number;
  items: {
    productId: string;
    name: string;
    price: string;
    quantity: number;
    size?: string;
    image: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  tracking?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    currentStep: number; // 1 to 4
  };
}

export interface MyrklsCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  addresses: SavedAddress[];
  orders: CustomerOrder[];
  wishlist: string[]; // product IDs
  marketingPreferences: {
    emailNews: boolean;
    smsAlerts: boolean;
  };
  createdAt: string;
}

interface AuthContextType {
  currentUser: MyrklsCustomer | null;
  isAuthenticated: boolean;
  wishlist: string[];
  login: (phoneOrEmail: string, name?: string) => void;
  signup: (phone: string, email: string, name: string) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<MyrklsCustomer>) => void;
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (id: string, updatedData: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  addOrder: (order: CustomerOrder) => void;
  deleteAccount: () => void;
}

const CURRENT_USER_KEY = 'myrkls_current_user';
const WISHLIST_KEY = 'myrkls_wishlist';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default registered demo customer with real profile data
const DEFAULT_CUSTOMER: MyrklsCustomer = {
  id: 'usr_841920',
  name: 'Alexandra Vance',
  email: 'alexandra.v@domain.com',
  phone: '9876543210',
  isVerified: true,
  addresses: [
    {
      id: 'addr_1',
      firstName: 'Alexandra',
      lastName: 'Vance',
      phone: '9876543210',
      address: '1402, Skyline Residency, MG Road',
      landmark: 'Near Central Park',
      pincode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
      isDefault: true,
    },
    {
      id: 'addr_2',
      firstName: 'Alexandra',
      lastName: 'Vance',
      phone: '9876543210',
      address: 'Penthouse 8B, Sea Green Avenue, Worli',
      landmark: 'Opposite High Street',
      pincode: '400018',
      city: 'Mumbai',
      state: 'Maharashtra',
      isDefault: false,
    },
  ],
  orders: [
    {
      id: 'MYR-982144',
      date: '14 October 2026',
      status: 'Dispatched',
      paymentMethod: 'UPI',
      total: '₹1,499',
      totalNumber: 1499,
      items: [
        {
          productId: 'incarnation',
          name: 'INCARNATION™ Skin Renewal Serum',
          price: '₹1,499',
          quantity: 1,
          size: '30 mL',
          image: '/myrkls-prod-incarnation-dew.webp',
        },
      ],
      shippingAddress: {
        name: 'Alexandra Vance',
        phone: '+91 9876543210',
        address: '1402, Skyline Residency, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      tracking: {
        carrier: 'BlueDart Express',
        trackingNumber: 'BLR-982144701',
        estimatedDelivery: '21 October 2026',
        currentStep: 3,
      },
    },
  ],
  wishlist: ['matrix', 'sentinel'],
  marketingPreferences: {
    emailNews: true,
    smsAlerts: false,
  },
  createdAt: '2026-09-01T10:00:00.000Z',
};

export const MyrklsAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MyrklsCustomer | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.orders) {
          parsed.orders.forEach((o: any) => {
            o.items?.forEach((i: any) => {
              if (i.productId === 'incarnation' && (!i.image || i.image.includes('model.webp'))) {
                i.image = '/myrkls-prod-incarnation-dew.webp';
              }
            });
          });
        }
        return parsed;
      }
      // Auto-login default customer for initial preview if none set
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_CUSTOMER));
      return DEFAULT_CUSTOMER;
    } catch {
      return DEFAULT_CUSTOMER;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) return JSON.parse(stored);
      return ['matrix', 'sentinel'];
    } catch {
      return ['matrix', 'sentinel'];
    }
  });

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        // Also sync saved profiles for checkout smart autofill
        if (currentUser.addresses.length > 0) {
          const defaultAddr = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];
          const names = currentUser.name.split(' ');
          const savedProfile = {
            phone: currentUser.phone,
            email: currentUser.email,
            firstName: names[0] || currentUser.name,
            lastName: names.slice(1).join(' ') || '',
            address: defaultAddr.address,
            landmark: defaultAddr.landmark,
            pincode: defaultAddr.pincode,
            city: defaultAddr.city,
            state: defaultAddr.state,
          };
          localStorage.setItem('myrkls_saved_customer_profiles', JSON.stringify([savedProfile]));
        }
      } catch (err) {
        console.warn('Failed to persist user to localStorage:', err);
      }
    } else {
      try {
        localStorage.removeItem(CURRENT_USER_KEY);
      } catch {
        // ignore
      }
    }
  }, [currentUser]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const login = (phoneOrEmail: string, name?: string) => {
    const isEmail = phoneOrEmail.includes('@');
    const existing = currentUser || DEFAULT_CUSTOMER;
    const user: MyrklsCustomer = {
      ...existing,
      id: `usr_${Date.now().toString().slice(-6)}`,
      email: isEmail ? phoneOrEmail : existing.email,
      phone: !isEmail ? phoneOrEmail.replace(/\D/g, '') : existing.phone,
      name: name || (isEmail ? phoneOrEmail.split('@')[0] : existing.name),
      isVerified: true,
    };
    setCurrentUser(user);
  };

  const signup = (phone: string, email: string, name: string) => {
    const newUser: MyrklsCustomer = {
      id: `usr_${Date.now().toString().slice(-6)}`,
      name: name.trim() || 'Valued Member',
      email: email.trim(),
      phone: phone.replace(/\D/g, ''),
      isVerified: true,
      addresses: [],
      orders: [],
      wishlist: [],
      marketingPreferences: {
        emailNews: true,
        smsAlerts: false,
      },
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updatedData: Partial<MyrklsCustomer>) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      ...updatedData,
    });
  };

  const addAddress = (address: Omit<SavedAddress, 'id'>) => {
    if (!currentUser) return;
    const newAddress: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };

    let updatedAddresses = [...currentUser.addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    // If first address, make it default automatically
    if (updatedAddresses.length === 0) {
      newAddress.isDefault = true;
    }

    updatedAddresses.push(newAddress);
    setCurrentUser({
      ...currentUser,
      addresses: updatedAddresses,
    });
  };

  const updateAddress = (id: string, updatedData: Partial<SavedAddress>) => {
    if (!currentUser) return;
    let updatedAddresses = currentUser.addresses.map((addr) => {
      if (addr.id === id) {
        return { ...addr, ...updatedData };
      }
      if (updatedData.isDefault) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    setCurrentUser({
      ...currentUser,
      addresses: updatedAddresses,
    });
  };

  const deleteAddress = (id: string) => {
    if (!currentUser) return;
    const filtered = currentUser.addresses.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setCurrentUser({
      ...currentUser,
      addresses: filtered,
    });
  };

  const setDefaultAddress = (id: string) => {
    if (!currentUser) return;
    const updated = currentUser.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setCurrentUser({
      ...currentUser,
      addresses: updated,
    });
  };

  const addToWishlist = (productId: string) => {
    const cleanId = productId.toLowerCase();
    if (!wishlist.includes(cleanId)) {
      const updated = [...wishlist, cleanId];
      setWishlist(updated);
      if (currentUser) {
        setCurrentUser({ ...currentUser, wishlist: updated });
      }
    }
  };

  const removeFromWishlist = (productId: string) => {
    const cleanId = productId.toLowerCase();
    const updated = wishlist.filter((id) => id !== cleanId);
    setWishlist(updated);
    if (currentUser) {
      setCurrentUser({ ...currentUser, wishlist: updated });
    }
  };

  const toggleWishlist = (productId: string) => {
    const cleanId = productId.toLowerCase();
    if (wishlist.includes(cleanId)) {
      removeFromWishlist(cleanId);
    } else {
      addToWishlist(cleanId);
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlist.includes(productId.toLowerCase());
  };

  const addOrder = (order: CustomerOrder) => {
    if (!currentUser) return;
    const updatedOrders = [order, ...currentUser.orders];
    setCurrentUser({
      ...currentUser,
      orders: updatedOrders,
    });
  };

  const deleteAccount = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(WISHLIST_KEY);
      localStorage.removeItem('myrkls_saved_customer_profiles');
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        wishlist,
        login,
        signup,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        addOrder,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a MyrklsAuthProvider');
  }
  return context;
};

export default AuthContext;
