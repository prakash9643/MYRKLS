import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';

export interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  categoryBadge: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: string;
  fallbackImage: string;
}

export interface MyrklsProductSection3Props {
  onAddToCart?: (productId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: 'awakening',
    name: 'AWAKENING™',
    category: 'Performance Gel Cleanser',
    categoryBadge: 'GEL CLEANSER',
    price: '₹1,299',
    originalPrice: '₹1,499',
    discount: '15% OFF',
    image: '/myrkls-prod-awakening-dew.webp',
    fallbackImage: '/myrkls-prod-awakening-dew.jpg',
  },
  {
    id: 'restoration',
    name: 'RESTORATION™',
    category: 'Plumping Pigment-Repair Cream',
    categoryBadge: 'BARRIER CREAM',
    price: '₹1,349',
    originalPrice: '₹1,599',
    discount: '16% OFF',
    image: '/myrkls-prod-restoration-studio.webp',
    fallbackImage: '/myrkls-prod-restoration.png',
  },
  {
    id: 'sentinel',
    name: 'SENTINEL™',
    category: 'Advanced Aqua Sunscreen',
    categoryBadge: 'SUN PROTECTION',
    price: '₹1,399',
    originalPrice: '₹1,649',
    discount: '14% OFF',
    image: '/myrkls-prod-sentinel.jpg',
    fallbackImage: '/myrkls-sec6-sentinel-sunscreen.jpg',
  },
];

export const MyrklsProductSection3: React.FC<MyrklsProductSection3Props> = ({
  onAddToCart,
  onSelectProduct,
}) => {
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(productId);
    }
    setAddedId(productId);
    setTimeout(() => {
      setAddedId((curr) => (curr === productId ? null : curr));
    }, 1600);
  };

  const handleCardClick = (productId: string) => {
    if (onSelectProduct) {
      onSelectProduct(productId);
    } else {
      window.location.hash = `#product/${productId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="product-section-recommendations"
      aria-label="Recommended Products - Better Together"
      className="relative w-full bg-[#FAF9F7] text-[#133429] py-16 sm:py-24 border-b border-[#DDD8D0] select-none"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        {/* ======================================================== */}
        {/* 1. SECTION HEADING & SUBHEADING                          */}
        {/* ======================================================== */}
        <div className="pb-10 border-b border-[#E5E0D8]">
          <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold font-['Syne',sans-serif] tracking-tight text-[#133429] uppercase leading-[1.05]">
            BETTER TOGETHER.
          </h2>
          <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-[#5A6660] font-normal leading-relaxed">
            Smart additions to your skincare lineup.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. 3-COLUMN PRODUCT ROW (FAST D2C STYLE)                 */}
        {/* ======================================================== */}
        <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {RECOMMENDED_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleCardClick(prod.id)}
              className="group cursor-pointer bg-white border border-[#E5E0D8] rounded-none flex flex-col justify-between overflow-hidden transition-colors duration-150 hover:border-[#111111]"
            >
              {/* Product Image: Clean 1:1 Square Frame with Badges */}
              <div className="relative w-full aspect-square bg-[#F7F5F0] overflow-hidden rounded-none border-b border-[#E5E0D8]">
                <img
                  src={prod.image}
                  alt={prod.name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== prod.fallbackImage) {
                      target.src = prod.fallbackImage;
                    }
                  }}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />

                {/* Category Badge on Top-Left of Image */}
                <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                  <span className="bg-black/85 backdrop-blur-sm text-white text-[9.5px] font-sans font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-none">
                    {prod.categoryBadge}
                  </span>
                </div>

                {/* Discount Badge on Top-Right of Image */}
                <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                  <span className="bg-[#FF5A1F] text-white text-[10px] font-sans font-bold tracking-wider uppercase px-2.5 py-1 rounded-none shadow-sm">
                    {prod.discount}
                  </span>
                </div>
              </div>

              {/* Product Info & Action */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                <div>
                  {/* Short Category */}
                  <span className="text-[11px] font-sans font-semibold tracking-wider uppercase text-[#7A857E] block mb-1.5">
                    {prod.category}
                  </span>

                  {/* Product Name */}
                  <h3 className="text-[20px] sm:text-[22px] font-bold font-['Syne',sans-serif] text-[#111111] tracking-tight uppercase leading-snug">
                    {prod.name}
                  </h3>

                  {/* Price with Offer Price & Original M.R.P. */}
                  <div className="mt-2.5 flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-[19px] sm:text-[20px] font-bold text-[#111111] font-sans tracking-tight">
                      {prod.price}
                    </span>
                    <span className="text-[13.5px] text-[#8E9A92] line-through font-normal font-sans">
                      {prod.originalPrice}
                    </span>
                    <span className="text-[11px] font-bold text-[#FF5A1F] font-sans uppercase tracking-wider">
                      ({prod.discount})
                    </span>
                  </div>
                </div>

                {/* ADD TO BAG Button (Fast D2C Style, Working Cart, Zero Green) */}
                <div className="mt-6 pt-5 border-t border-[#F2EEE5]">
                  <button
                    type="button"
                    onClick={(e) => handleAdd(prod.id, e)}
                    className="w-full h-12 bg-[#111111] text-white hover:bg-[#FF5A1F] rounded-none font-sans font-bold text-[12px] tracking-[0.16em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150"
                  >
                    {addedId === prod.id ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>ADDED TO BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} strokeWidth={2} />
                        <span>ADD TO BAG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyrklsProductSection3;
