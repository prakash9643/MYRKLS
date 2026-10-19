/**
 * MYRKLS Global Type Definitions
 */

export type ProductCategory = 'SERUMS' | 'CREAMS' | 'CLEANSERS' | 'SUN PROTECTION';

export interface KeyIngredient {
  name: string;
  percentage?: string;
  role: string;
}

export interface MyrklsProductDetail {
  id: string;
  name: string;
  categoryTitle: string;
  category: ProductCategory;
  categoryPill: string;
  number: string;
  size: string;
  targetPh?: string;
  packagingNote?: string;
  price: string;
  originalPrice: string;
  savings: string;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
  consumerBenefit: string;
  routineStep: string;
  bestFor: string;
  globalTechTag: string;
  globalTechOrigin: string;
  systemSummary: string;
  keyIngredients: KeyIngredient[];
  additionalIngredients: string[];
  primaryConcerns: string[];
  scienceMechanism: string;
  howToUse: string;
}

export interface ProductHeroConfig {
  category: string;
  name: string;
  shortDescription: string;
  sizeLabel: string;
  ingredients: KeyIngredient[];
  bestFor: string[];
}

export interface CartItem {
  id: string; // unique item id: `${productId}-${size || 'default'}`
  productId: string;
  name: string;
  category: string;
  price: string;
  priceNumber: number;
  originalPrice?: string;
  image: string;
  size?: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (productId: string, size?: string, quantity?: number, openDrawer?: boolean) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  formattedSubtotal: string;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  savedAddresses: CustomerAddress[];
  defaultAddressId?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingAddress: CustomerAddress;
  trackingNumber?: string;
}

export type ViewState = 'home' | 'view-all' | 'pdp' | 'checkout' | 'account';
