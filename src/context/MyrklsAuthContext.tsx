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

export const MyrklsAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MyrklsCustomer | null>(null);

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

  useEffect(() => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem('myrkls_saved_customer_profiles');
    } catch {
      // Storage may be unavailable in private browsing contexts.
    }
  }, []);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const login = (_phoneOrEmail: string, _name?: string) => {
    setCurrentUser(null);
  };

  const signup = (_phone: string, _email: string, _name: string) => {
    setCurrentUser(null);
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
