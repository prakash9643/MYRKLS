import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_MYRKLS_PRODUCTS } from '../data/products';
import type { CartItem, CartContextType, MyrklsProductDetail } from '../types';

export type { CartItem, CartContextType };

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'myrkls_cart';

export const MyrklsCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync to localStorage on cart change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (
    productId: string,
    size?: string,
    quantity: number = 1,
    openDrawer: boolean = true
  ) => {
    const cleanId = productId.toLowerCase().trim();
    const product: MyrklsProductDetail | undefined = ALL_MYRKLS_PRODUCTS.find(
      (p) => p.id.toLowerCase() === cleanId
    );

    if (!product) {
      console.warn(`Product with ID "${productId}" not found in catalog.`);
      return;
    }

    const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const finalSize = size || product.size || '30 mL';
    const itemId = `${cleanId}-${finalSize}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          priceNumber: priceNum,
          originalPrice: product.originalPrice,
          image: product.image,
          size: finalSize,
          quantity: quantity,
        };
        return [...prevItems, newItem];
      }
    });

    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceNumber * item.quantity, 0);
  const formattedSubtotal = `₹${subtotal.toLocaleString('en-IN')}`;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        formattedSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a MyrklsCartProvider');
  }
  return context;
};

export default CartContext;
