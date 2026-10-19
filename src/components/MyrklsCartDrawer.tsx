import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/MyrklsCartContext';

export interface MyrklsCartDrawerProps {
  onNavigateViewAll?: () => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateCheckout?: () => void;
}

export const MyrklsCartDrawer: React.FC<MyrklsCartDrawerProps> = ({
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateCheckout,
}) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalCount,
    formattedSubtotal,
  } = useCart();

  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCheckoutNotice(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    closeCart();
    if (onNavigateCheckout) {
      onNavigateCheckout();
    } else {
      window.location.hash = '#checkout';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueShopping = () => {
    closeCart();
  };

  const handleExplore = () => {
    closeCart();
    if (onNavigateViewAll) {
      onNavigateViewAll();
    } else {
      window.location.hash = '#all-products';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemClick = (productId: string) => {
    closeCart();
    if (onNavigateProduct) {
      onNavigateProduct(productId);
    } else {
      window.location.hash = `#product/${productId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* 1. Backdrop Overlay */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
      />

      {/* 2. Sliding Drawer Panel (Strict Black & Orange Palette) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-full sm:w-[420px] bg-[#FAFAF8] text-[#111111] shadow-2xl border-l border-[#E5E0D8] flex flex-col justify-between transition-transform duration-300 ease-out animate-slideInRight select-none">
          {/* ======================================================== */}
          {/* DRAWER HEADER: TITLE & CLOSE BUTTON                      */}
          {/* ======================================================== */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E5E0D8] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="font-['Syne',sans-serif] text-[16px] sm:text-[18px] font-bold uppercase tracking-tight text-[#111111]">
                YOUR BAG
              </span>
              <span className="bg-[#FF5A1F] text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-none tracking-wider">
                {totalCount}
              </span>
            </div>

            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="w-8 h-8 flex items-center justify-center border border-[#DDD8D0] hover:border-[#000000] text-[#111111] hover:text-[#FF5A1F] rounded-none transition-colors cursor-pointer"
            >
              <X size={17} strokeWidth={1.5} />
            </button>
          </div>

          {/* ======================================================== */}
          {/* DRAWER BODY: ITEMS LIST OR CLEAN EMPTY STATE            */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              /* EMPTY CART VIEW */
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 border border-[#DDD8D0] bg-white flex items-center justify-center mb-4 rounded-none">
                  <ShoppingBag size={26} className="text-[#888888]" strokeWidth={1.25} />
                </div>

                <h3 className="font-['Syne',sans-serif] text-[17px] sm:text-[18px] font-bold uppercase text-[#111111] tracking-tight">
                  YOUR SHOPPING BAG IS EMPTY
                </h3>

                <p className="mt-2 text-[13px] font-sans text-[#666666] max-w-[280px] leading-relaxed">
                  Explore our 7 clinical formulations engineered for visible cellular renewal.
                </p>

                <button
                  type="button"
                  onClick={handleExplore}
                  className="mt-6 px-6 py-3 bg-[#000000] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>EXPLORE PRODUCTS</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              /* POPULATED CART ITEMS */
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 bg-white border border-[#E5E0D8] rounded-none flex items-start gap-3.5 hover:border-[#000000] transition-colors"
                  >
                    {/* Product Image Thumbnail */}
                    <div
                      onClick={() => handleItemClick(item.productId)}
                      className="w-20 h-20 min-w-[80px] max-w-[80px] min-h-[80px] max-h-[80px] bg-[#F4F2ED] border border-[#EAE6DF] shrink-0 overflow-hidden cursor-pointer rounded-none"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>

                    {/* Product Metadata & Quantity Controls */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-sans font-bold tracking-[0.14em] uppercase text-[#FF5A1F] truncate block">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-[#888888] hover:text-[#FF5A1F] transition-colors p-0.5 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h4
                          onClick={() => handleItemClick(item.productId)}
                          className="font-['Syne',sans-serif] text-[14px] font-bold uppercase text-[#111111] hover:text-[#FF5A1F] transition-colors truncate cursor-pointer leading-snug mt-0.5"
                        >
                          {item.name}
                        </h4>

                        {item.size && (
                          <span className="text-[11px] font-sans text-[#777777] block mt-0.5">
                            {item.size}
                          </span>
                        )}
                      </div>

                      {/* Price and Quantity Selector */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#F2EFE9]">
                        <span className="text-[14px] font-bold font-sans text-[#111111]">
                          {item.price}
                        </span>

                        {/* Quantity (+ / -) Selector */}
                        <div className="flex items-center border border-[#DDD8D0] bg-[#FAFAF8] rounded-none">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center text-[#111111] hover:bg-[#000000] hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus size={11} strokeWidth={2} />
                          </button>

                          <span className="w-8 text-center text-[12px] font-bold font-sans text-[#111111]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 flex items-center justify-center text-[#111111] hover:bg-[#000000] hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus size={11} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* DRAWER FOOTER: SUBTOTAL, CHECKOUT & CONTINUE SHOPPING     */}
          {/* ======================================================== */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#E5E0D8] shrink-0 space-y-3">
              {/* Subtotal Row */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-sans font-bold tracking-[0.16em] uppercase text-[#777777] block">
                    SUBTOTAL
                  </span>
                  <span className="text-[10px] font-sans text-[#888888]">
                    Complimentary clinical delivery across India
                  </span>
                </div>
                <span className="font-['Syne',sans-serif] text-[20px] font-bold text-[#111111]">
                  {formattedSubtotal}
                </span>
              </div>

              {/* Notice if checkout clicked */}
              {checkoutNotice && (
                <div className="p-2.5 bg-[#FAF9F7] border border-[#DDD8D0] text-[11px] font-sans text-[#111111] leading-relaxed animate-fadeIn">
                  <div className="flex items-start gap-1.5">
                    <Sparkles size={12} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                    <span>{checkoutNotice}</span>
                  </div>
                </div>
              )}

              {/* Prominent CHECKOUT -> Button (Bold Black, Hover Orange) */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#000000] hover:bg-[#FF5A1F] active:scale-[0.99] text-white text-[12px] font-sans font-bold tracking-[0.18em] uppercase rounded-none flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <span>CHECKOUT</span>
                <ArrowRight size={14} />
              </button>

              {/* CONTINUE SHOPPING Button */}
              <button
                type="button"
                onClick={handleContinueShopping}
                className="w-full py-2 text-center text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#111111] hover:text-[#FF5A1F] transition-colors cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>

              {/* Trust Badge */}
              <div className="pt-2 border-t border-[#F0EBE3] flex items-center justify-center gap-1.5 text-[10px] font-sans text-[#888888]">
                <ShieldCheck size={11} className="text-[#FF5A1F]" />
                <span>100% Authentic MYRKLS Formulations</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyrklsCartDrawer;
