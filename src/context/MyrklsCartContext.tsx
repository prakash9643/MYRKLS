import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_MYRKLS_PRODUCTS } from '../data/products';
import type { CartItem, CartContextType, MyrklsProductDetail } from '../types';
import { readShopifyConfig } from '../shopify/config';
import { ShopifyApiError, ShopifyCartError } from '../shopify/errors';
import { formatShopifyMoney } from '../shopify/presentation';
import {
  addCartLines,
  createCart,
  getFreshCartForCheckout,
  getCart,
  getShopifyCartErrorMessage,
  removeCartLine,
  updateCartLine,
} from '../shopify/services/cart';
import type { ShopifyCart } from '../shopify/types';
import { trackEcommerceEvent } from '../analytics/analytics';
import { getCartLine, toCartEcommercePayload } from '../analytics/events';

export type { CartItem, CartContextType };

const CartContext = createContext<CartContextType | undefined>(undefined);

const LEGACY_STORAGE_KEY = 'myrkls_cart';
export const SHOPIFY_CART_STORAGE_KEY = 'myrkls_shopify_cart_id';

const isCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
};

const readLegacyItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
};

const mapShopifyCartItems = (cart: ShopifyCart | null): CartItem[] =>
  cart
    ? cart.lines.map((line) => ({
        id: line.id,
        productId: line.productHandle,
        name: line.productTitle,
        category: '',
        price: formatShopifyMoney(line.unitPrice.amount, line.unitPrice.currencyCode),
        priceNumber: Number(line.unitPrice.amount),
        image: line.image?.url || '',
        size: line.variantTitle === 'Default Title' ? undefined : line.variantTitle,
        quantity: line.quantity,
        merchandiseId: line.merchandiseId,
        lineTotal: formatShopifyMoney(line.lineTotal.amount, line.lineTotal.currencyCode),
      }))
    : [];

const formatCurrencyAmount = (money: ShopifyCart['cost']['subtotalAmount'] | null): number =>
  money ? Number(money.amount) : 0;

const getStoredCartId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SHOPIFY_CART_STORAGE_KEY);
};

const persistCartId = (id: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SHOPIFY_CART_STORAGE_KEY, id);
};

const clearStoredCartId = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SHOPIFY_CART_STORAGE_KEY);
};

const getCartErrorMessage = (error: unknown): string => {
  if (error instanceof ShopifyCartError) return error.message;
  if (error instanceof ShopifyApiError && error.kind === 'configuration') {
    return 'Shopify cart is not configured. Please contact the store.';
  }
  return getShopifyCartErrorMessage(error);
};

export const MyrklsCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configuration = readShopifyConfig();
  const isShopifyCart =
    configuration.config !== null || configuration.error !== null;
  const [legacyItems, setLegacyItems] = useState<CartItem[]>(() =>
    isShopifyCart ? [] : readLegacyItems()
  );
  const [isOpen, setIsOpen] = useState(false);
  const [shopifyCart, setShopifyCart] = useState<ShopifyCart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(isShopifyCart);
  const [isCartAdding, setIsCartAdding] = useState(false);
  const [isCartMutating, setIsCartMutating] = useState(false);
  const [cartError, setCartError] = useState<string | null>(configuration.error);
  const shopifyCartRef = useRef<ShopifyCart | null>(null);
  const restorePromiseRef = useRef<Promise<ShopifyCart | null> | null>(null);
  const mutationInFlightRef = useRef(false);
  const refreshSequenceRef = useRef(0);

  const applyShopifyCart = useCallback((cart: ShopifyCart | null) => {
    shopifyCartRef.current = cart;
    setShopifyCart(cart);
  }, []);

  useEffect(() => {
    if (isShopifyCart) return;
    try {
      window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyItems));
    } catch {
      // The in-memory cart remains usable when browser storage is unavailable.
    }
  }, [isShopifyCart, legacyItems]);

  useEffect(() => {
    if (!isShopifyCart) return;
    let active = true;
    const sequence = ++refreshSequenceRef.current;
    setIsCartLoading(true);
    if (!restorePromiseRef.current) {
      restorePromiseRef.current = (async () => {
        const cartId = getStoredCartId();
        if (!cartId) return null;
        const cart = await getCart(cartId);
        if (!cart) clearStoredCartId();
        return cart;
      })();
    }
    restorePromiseRef.current
      .then((cart) => {
        if (!active || sequence !== refreshSequenceRef.current) return;
        applyShopifyCart(cart);
        setCartError(null);
      })
      .catch((error: unknown) => {
        if (!active || sequence !== refreshSequenceRef.current) return;
        setCartError(getCartErrorMessage(error));
      })
      .finally(() => {
        if (active && sequence === refreshSequenceRef.current) setIsCartLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applyShopifyCart, isShopifyCart]);

  const refreshShopifyCart = useCallback(async () => {
    if (!isShopifyCart || mutationInFlightRef.current) return;
    const sequence = ++refreshSequenceRef.current;
    setIsCartLoading(true);
    setCartError(null);
    try {
      const cartId = getStoredCartId();
      if (!cartId) {
        applyShopifyCart(null);
        return;
      }
      const cart = await getCart(cartId);
      if (sequence !== refreshSequenceRef.current) return;
      if (!cart) clearStoredCartId();
      applyShopifyCart(cart);
    } catch (error) {
      if (sequence === refreshSequenceRef.current) {
        setCartError(getCartErrorMessage(error));
      }
    } finally {
      if (sequence === refreshSequenceRef.current) setIsCartLoading(false);
    }
  }, [applyShopifyCart, isShopifyCart]);

  const prepareShopifyCheckout = useCallback(async (): Promise<string> => {
    if (!isShopifyCart) {
      throw new ShopifyCartError('Shopify checkout is not configured for this store.', {
        code: 'INVALID',
      });
    }
    const cartId = shopifyCartRef.current?.id || getStoredCartId();
    if (!cartId) {
      throw new ShopifyCartError('Your Shopify cart is not available. Add your items again.', {
        code: 'INVALID',
      });
    }
    const sequence = ++refreshSequenceRef.current;
    setCartError(null);
    try {
      const cart = await getFreshCartForCheckout(cartId);
      if (sequence !== refreshSequenceRef.current) {
        throw new ShopifyCartError('Your cart changed. Please try checkout again.', {
          code: 'INVALID',
        });
      }
      applyShopifyCart(cart);
      trackEcommerceEvent('begin_checkout', toCartEcommercePayload(cart));
      return cart.checkoutUrl;
    } catch (error) {
      setCartError(getCartErrorMessage(error));
      throw error;
    }
  }, [applyShopifyCart, isShopifyCart]);

  const runCartMutation = useCallback(
    async (operation: () => Promise<ShopifyCart>, openAfterSuccess = false) => {
      if (!isShopifyCart || mutationInFlightRef.current) return;
      mutationInFlightRef.current = true;
      const sequence = ++refreshSequenceRef.current;
      setIsCartMutating(true);
      setCartError(null);
      try {
        const cart = await operation();
        if (sequence !== refreshSequenceRef.current) return;
        applyShopifyCart(cart);
        try {
          persistCartId(cart.id);
        } catch {
          setCartError('Your cart updated, but this browser could not save it for your next visit.');
        }
        if (openAfterSuccess) setIsOpen(true);
      } catch (error) {
        if (sequence !== refreshSequenceRef.current) return;
        setCartError(getCartErrorMessage(error));
      } finally {
        mutationInFlightRef.current = false;
        setIsCartMutating(false);
      }
    },
    [applyShopifyCart, isShopifyCart]
  );

  const addShopifyVariant = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        setCartError('Choose a quantity between 1 and 999.');
        return;
      }
      if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(merchandiseId.trim())) {
        setCartError('Select a valid product variant before adding it.');
        return;
      }
      if (!isShopifyCart || mutationInFlightRef.current) return;
      setIsCartAdding(true);
      const previousCart = shopifyCartRef.current;
      const previousQuantity =
        previousCart?.lines.find((line) => line.merchandiseId === merchandiseId)?.quantity || 0;
      await runCartMutation(async () => {
        const currentCart = shopifyCartRef.current;
        const cartId = currentCart?.id || getStoredCartId();
        if (cartId) {
          if (!currentCart) {
            const restoredCart = await getCart(cartId);
            if (!restoredCart) {
              clearStoredCartId();
              return createCart([{ merchandiseId, quantity }]);
            }
          }
          return addCartLines(cartId, [{ merchandiseId, quantity }]);
        }
        return createCart([{ merchandiseId, quantity }]);
      }, true);
      const updatedCart = shopifyCartRef.current;
      const addedLine = updatedCart?.lines.find((line) => line.merchandiseId === merchandiseId);
      if (updatedCart && addedLine && addedLine.quantity > previousQuantity) {
        const addedQuantity = addedLine.quantity - previousQuantity;
        trackEcommerceEvent(
          'add_to_cart',
          toCartEcommercePayload(updatedCart, [addedLine], [addedQuantity])
        );
      }
      setIsCartAdding(false);
    },
    [isShopifyCart, runCartMutation]
  );

  const updateShopifyCartLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        setCartError('Choose a quantity between 1 and 999.');
        return;
      }
      const cartId = shopifyCartRef.current?.id;
      if (!cartId) {
        setCartError('Your cart is not available. Refresh it and try again.');
        return;
      }
      const previousCart = shopifyCartRef.current;
      const previousLine = getCartLine(previousCart, lineId);
      await runCartMutation(() => updateCartLine(cartId, lineId, quantity));
      const updatedCart = shopifyCartRef.current;
      const updatedLine = getCartLine(updatedCart, lineId);
      if (previousLine && updatedCart && updatedLine && updatedLine.quantity < previousLine.quantity) {
        trackEcommerceEvent(
          'remove_from_cart',
          toCartEcommercePayload(updatedCart, [updatedLine], [
            previousLine.quantity - updatedLine.quantity,
          ])
        );
      }
    },
    [runCartMutation]
  );

  const removeShopifyCartLine = useCallback(
    async (lineId: string) => {
      const previousCart = shopifyCartRef.current;
      const previousLine = getCartLine(previousCart, lineId);
      const cartId = shopifyCartRef.current?.id;
      if (!cartId) {
        setCartError('Your cart is not available. Refresh it and try again.');
        return;
      }
      await runCartMutation(() => removeCartLine(cartId, lineId));
      const updatedCart = shopifyCartRef.current;
      if (
        previousCart &&
        previousLine &&
        !getCartLine(updatedCart, lineId)
      ) {
        trackEcommerceEvent(
          'remove_from_cart',
          toCartEcommercePayload(previousCart, [previousLine])
        );
      }
    },
    [runCartMutation]
  );

  const addToCart = (
    productId: string,
    size?: string,
    quantity = 1,
    openDrawer = true
  ) => {
    if (isShopifyCart) {
      setCartError('Open the Shopify product page and select a variant before adding it.');
      setIsOpen(true);
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) return;
    const cleanId = productId.toLowerCase().trim();
    const product: MyrklsProductDetail | undefined = ALL_MYRKLS_PRODUCTS.find(
      (item) => item.id.toLowerCase() === cleanId
    );
    if (!product) return;

    const priceNum = parseInt(product.price.replace(/[^0-9]/g, ''), 10) || 0;
    const finalSize = size || product.size || '30 mL';
    const itemId = `${cleanId}-${finalSize}`;
    setLegacyItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...previous];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...previous,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          priceNumber: priceNum,
          originalPrice: product.originalPrice,
          image: product.image,
          size: finalSize,
          quantity,
        },
      ];
    });
    if (openDrawer) setIsOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (isShopifyCart) {
      const line = shopifyCartRef.current?.lines.find((item) => item.id === itemId);
      if (!line) return;
      if (quantity <= 0) {
        void removeShopifyCartLine(itemId);
      } else {
        void updateShopifyCartLine(itemId, quantity);
      }
      return;
    }
    if (quantity <= 0) {
      setLegacyItems((previous) => previous.filter((item) => item.id !== itemId));
      return;
    }
    setLegacyItems((previous) =>
      previous.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    if (isShopifyCart) {
      void removeShopifyCartLine(itemId);
      return;
    }
    setLegacyItems((previous) => previous.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    if (isShopifyCart) {
      try {
        clearStoredCartId();
      } catch {
        setCartError('The cart could not be cleared from this browser.');
      }
      applyShopifyCart(null);
      return;
    }
    setLegacyItems([]);
  };

  const clearShopifyCart = useCallback(() => {
    if (!isShopifyCart) return;
    try {
      clearStoredCartId();
      applyShopifyCart(null);
      setCartError(null);
      restorePromiseRef.current = Promise.resolve(null);
    } catch {
      setCartError('The cart could not be cleared from this browser.');
    }
  }, [applyShopifyCart, isShopifyCart]);

  const dismissCartError = useCallback(() => setCartError(null), []);
  const items = useMemo(
    () => (isShopifyCart ? mapShopifyCartItems(shopifyCart) : legacyItems),
    [isShopifyCart, legacyItems, shopifyCart]
  );
  const totalCount = isShopifyCart
    ? shopifyCart?.totalQuantity || 0
    : legacyItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = isShopifyCart
    ? formatCurrencyAmount(shopifyCart?.cost.subtotalAmount || null)
    : legacyItems.reduce((sum, item) => sum + item.priceNumber * item.quantity, 0);
  const formattedSubtotal = isShopifyCart && shopifyCart
    ? formatShopifyMoney(
        shopifyCart.cost.subtotalAmount.amount,
        shopifyCart.cost.subtotalAmount.currencyCode
      )
    : `₹${subtotal.toLocaleString('en-IN')}`;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((previous) => !previous),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        formattedSubtotal,
        isShopifyCart,
        isCartLoading,
        isCartAdding,
        isCartMutating,
        cartError,
        checkoutUrl: shopifyCart?.checkoutUrl || null,
        shopifyCart,
        addShopifyVariant,
        refreshShopifyCart,
        prepareShopifyCheckout,
        updateShopifyCartLine,
        removeShopifyCartLine,
        clearShopifyCart,
        dismissCartError,
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
