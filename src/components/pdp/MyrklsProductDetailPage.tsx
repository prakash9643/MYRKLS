import React, { useState, useMemo } from 'react';
import { MyrklsHeader } from '../MyrklsHeader';
import { MyrklsFooter } from '../MyrklsFooter';
import { MyrklsProductHeroSection } from './MyrklsProductHeroSection';
import { MyrklsProductSection2 } from './MyrklsProductSection2';
import { MyrklsProductSection3 } from './MyrklsProductSection3';
import { MyrklsProductHowToUseSection } from './MyrklsProductHowToUseSection';
import { MyrklsProductFaqSection } from './MyrklsProductFaqSection';
import { MyrklsProductReelsSection } from './MyrklsProductReelsSection';
import { MyrklsProductReviewSection } from './MyrklsProductReviewSection';
import { useCart } from '../../context/MyrklsCartContext';
import { ALL_MYRKLS_PRODUCTS, getProductById } from '../../data/products';
import type { MyrklsProductDetail } from '../../types';

export interface MyrklsProductDetailPageProps {
  productId?: string;
  onBackToHome?: () => void;
  onNavigateViewAll?: () => void;
  onNavigateProduct?: (productId: string) => void;
  onNavigateAccount?: () => void;
  onNavigateCheckout?: () => void;
  onAddToCart?: (productId: string, size?: string) => void;
}

export const MyrklsProductDetailPage: React.FC<MyrklsProductDetailPageProps> = ({
  productId = 'incarnation',
  onBackToHome,
  onNavigateViewAll,
  onNavigateProduct,
  onNavigateAccount,
  onNavigateCheckout,
  onAddToCart,
}) => {
  const [cartCount, setCartCount] = useState(0);

  // Retrieve matching product from Master Product Knowledge Base (defaults to INCARNATION™)
  const product: MyrklsProductDetail = useMemo(() => {
    return getProductById(productId) || ALL_MYRKLS_PRODUCTS[1]; // default to INCARNATION
  }, [productId]);

  const { addToCart } = useCart();

  const handleAddToCart = (pId: string, size?: string) => {
    addToCart(pId, size);
    setCartCount((c) => c + 1);
    if (onAddToCart) {
      onAddToCart(pId, size);
    }
  };

  const handleProceedToSec2 = () => {
    // Smooth scroll down to upcoming Section 2 area or alert
    const sec2 = document.getElementById('product-section-2');
    if (sec2) {
      sec2.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#FAF9F7] text-[#133429] flex flex-col justify-between selection:bg-[#133429] selection:text-white">
      {/* 1. Official MYRKLS Global Header */}
      <MyrklsHeader
        cartCount={cartCount}
        onNavigateHome={onBackToHome}
        onNavigateViewAll={onNavigateViewAll}
        onNavigateProduct={onNavigateProduct}
        onNavigateAccount={onNavigateAccount}
      />

      {/* 2. Main Product Content Stage */}
      <main className="flex-1 w-full">
        {/* ======================================================== */}
        {/* SECTION 1: MASTER HERO SHOWCASE & FORMULATION COMMERCE   */}
        {/* ======================================================== */}
        <MyrklsProductHeroSection
          product={product}
          onBackToCollection={onNavigateViewAll}
          onBackToHome={onBackToHome}
          onAddToCart={handleAddToCart}
          onNavigateCheckout={onNavigateCheckout}
          onProceedToSec2={handleProceedToSec2}
        />

        {/* ======================================================== */}
        {/* SECTION: RECOMMENDED PRODUCTS — BETTER TOGETHER          */}
        {/* ======================================================== */}
        <MyrklsProductSection3
          onAddToCart={(pId) => handleAddToCart(pId)}
        />

        {/* ======================================================== */}
        {/* SECTION: FORMULATION PHILOSOPHY — GLOBAL ACTIVE SCIENCE   */}
        {/* ======================================================== */}
        <MyrklsProductSection2
          product={product}
          onAddToCart={(pId) => handleAddToCart(pId)}
        />

        {/* ======================================================== */}
        {/* SECTION 04: HOW TO USE — THE RITUAL                      */}
        {/* ======================================================== */}
        <MyrklsProductHowToUseSection productId={product.id} />

        {/* ======================================================== */}
        {/* SECTION 05: FAQ — GOOD QUESTIONS. CLEAR ANSWERS.         */}
        {/* ======================================================== */}
        <MyrklsProductFaqSection productId={product.id} />

        {/* ======================================================== */}
        {/* SECTION 06: SHOP THE REELS — SEE IT IN ACTION            */}
        {/* ======================================================== */}
        <MyrklsProductReelsSection
          productId={product.id}
          onNavigateProduct={onNavigateProduct}
        />

        {/* ======================================================== */}
        {/* SECTION 07: VERIFIED REVIEWS — REAL VOICES IN SMALL      */}
        {/* ======================================================== */}
        <MyrklsProductReviewSection productId={product.id} />
      </main>

      {/* 3. Official MYRKLS Global Footer */}
      <MyrklsFooter onNavigateViewAll={onNavigateViewAll} />
    </div>
  );
};

export default MyrklsProductDetailPage;
