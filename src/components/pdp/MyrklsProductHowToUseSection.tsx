import React from 'react';

export interface RitualStep {
  number: string;
  title: string;
  instruction: string;
  image: string;
  fallbackImage?: string;
}

export interface ProductRitualData {
  productId: string;
  productName: string;
  bgImage: string;
  fallbackBgImage?: string;
  steps: RitualStep[];
  note?: string;
}

export const ALL_RITUAL_DATA: Record<string, ProductRitualData> = {
  vision: {
    productId: 'vision',
    productName: 'VISION™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/stock-skincare-texture.jpg',
    steps: [
      {
        number: '01',
        title: 'CLEANSE',
        instruction: 'Start with clean, dry skin.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'APPLY',
        instruction: 'Apply a few drops evenly to your face.',
        image: '/myrkls-ritual-step2-apply.jpg',
        fallbackImage: '/myrkls-ingredient-retinal.jpg',
      },
      {
        number: '03',
        title: 'MOISTURIZE',
        instruction: 'Follow with moisturizer and morning SPF.',
        image: '/myrkls-ritual-step3-protect.jpg',
        fallbackImage: '/myrkls-ingredient-panthenol.jpg',
      },
    ],
  },
  incarnation: {
    productId: 'incarnation',
    productName: 'INCARNATION™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/myrkls-sec4-incarnation-lab.webp',
    steps: [
      {
        number: '01',
        title: 'CLEANSE',
        instruction: 'Start with clean, completely dry skin.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'APPLY',
        instruction: 'Apply a thin layer at night, avoiding eyes and lips.',
        image: '/myrkls-ritual-step2-apply.jpg',
        fallbackImage: '/myrkls-ingredient-retinal.jpg',
      },
      {
        number: '03',
        title: 'MOISTURIZE',
        instruction: 'Follow with a gentle moisturizer.',
        image: '/myrkls-ritual-step3-protect.jpg',
        fallbackImage: '/myrkls-ingredient-panthenol.jpg',
      },
    ],
    note: 'Start 2 nights weekly and increase as tolerated. Use SPF 30+ every morning. Avoid other retinoids in the same routine and avoid use during pregnancy.',
  },
  rebirth: {
    productId: 'rebirth',
    productName: 'REBIRTH™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/myrkls-sec4-incarnation-lab.webp',
    steps: [
      {
        number: '01',
        title: 'CLEANSE',
        instruction: 'Gently cleanse your face.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'APPLY',
        instruction: 'Apply a few drops to clean skin.',
        image: '/myrkls-ritual-step2-apply.jpg',
        fallbackImage: '/myrkls-ingredient-ectoin.jpg',
      },
      {
        number: '03',
        title: 'MOISTURIZE',
        instruction: 'Follow with moisturizer.',
        image: '/myrkls-ritual-step3-protect.jpg',
        fallbackImage: '/myrkls-ingredient-panthenol.jpg',
      },
    ],
  },
  eternity: {
    productId: 'eternity',
    productName: 'ETERNITY™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/stock-skincare-texture.jpg',
    steps: [
      {
        number: '01',
        title: 'CLEANSE',
        instruction: 'Cleanse and apply your serum.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'NOURISH',
        instruction: 'Massage a small amount of cream onto face and neck.',
        image: '/myrkls-ritual-step3-protect.jpg',
        fallbackImage: '/myrkls-ingredient-collagen.jpg',
      },
      {
        number: '03',
        title: 'PROTECT',
        instruction: 'Finish with sunscreen during the day.',
        image: '/myrkls-prod-sentinel.jpg',
        fallbackImage: '/myrkls-ingredient-niacinamide.jpg',
      },
    ],
  },
  restoration: {
    productId: 'restoration',
    productName: 'RESTORATION™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/myrkls-prod-restoration-studio.webp',
    steps: [
      {
        number: '01',
        title: 'PREP',
        instruction: 'Cleanse and apply your serum.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'REPAIR',
        instruction: 'Smooth cream evenly over face and neck.',
        image: '/myrkls-ritual-step3-protect.jpg',
        fallbackImage: '/myrkls-ingredient-panthenol.jpg',
      },
      {
        number: '03',
        title: 'PROTECT',
        instruction: 'Follow with sunscreen in the morning.',
        image: '/myrkls-prod-sentinel.jpg',
        fallbackImage: '/myrkls-ingredient-niacinamide.jpg',
      },
    ],
  },
  awakening: {
    productId: 'awakening',
    productName: 'AWAKENING™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/myrkls-prod-awakening-dew.webp',
    steps: [
      {
        number: '01',
        title: 'WET',
        instruction: 'Wet your face with lukewarm water.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'CLEANSE',
        instruction: 'Gently massage cleanser onto damp skin.',
        image: '/myrkls-ingredient-niacinamide.jpg',
        fallbackImage: '/stock-laboratory-glass.jpg',
      },
      {
        number: '03',
        title: 'RINSE',
        instruction: 'Rinse thoroughly and pat dry.',
        image: '/myrkls-ingredient-ectoin.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
    ],
    note: 'Avoid the eye area. Start slowly if your skin is sensitive to exfoliating acids.',
  },
  sentinel: {
    productId: 'sentinel',
    productName: 'SENTINEL™',
    bgImage: '/myrkls-ritual-wide-bg.png',
    fallbackBgImage: '/myrkls-prod-sentinel.jpg',
    steps: [
      {
        number: '01',
        title: 'PREP',
        instruction: 'Complete your morning skincare routine.',
        image: '/myrkls-ritual-step1-cleanse.jpg',
        fallbackImage: '/stock-skincare-texture.jpg',
      },
      {
        number: '02',
        title: 'PROTECT',
        instruction: 'Apply sunscreen generously to face, neck and exposed skin.',
        image: '/myrkls-prod-sentinel.jpg',
        fallbackImage: '/myrkls-ritual-step3-protect.jpg',
      },
      {
        number: '03',
        title: 'REAPPLY',
        instruction: 'Reapply every 2 hours outdoors and after swimming or sweating.',
        image: '/myrkls-ritual-step2-apply.jpg',
        fallbackImage: '/myrkls-ingredient-niacinamide.jpg',
      },
    ],
  },
};

export interface MyrklsProductHowToUseSectionProps {
  productId?: string;
}

export const MyrklsProductHowToUseSection: React.FC<MyrklsProductHowToUseSectionProps> = ({
  productId = 'incarnation',
}) => {
  const normalizedKey = (productId || 'incarnation').toLowerCase();
  const data = ALL_RITUAL_DATA[normalizedKey] || ALL_RITUAL_DATA['incarnation'];

  return (
    <section
      id="product-section-ritual"
      aria-label={`How to Use - ${data.productName} The Ritual`}
      className="relative w-full bg-[#FAF9F7] text-[#133429] pt-14 sm:pt-20 pb-16 sm:pb-24 border-b border-[#DDD8D0] select-none"
    >
      {/* ======================================================== */}
      {/* 1. EYEBROW & HEADING (ABOVE THE BACKGROUND IMAGE)        */}
      {/* ======================================================== */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 mb-8 sm:mb-12">
        <div className="pb-6 sm:pb-8 border-b border-[#E5E0D8]">
          <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
            / HOW TO USE
          </span>
          <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold font-['Syne',sans-serif] tracking-tight text-[#133429] uppercase leading-[1.05]">
            THE RITUAL.
          </h2>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EDGE-TO-EDGE WIDE BACKGROUND IMAGE WITH OVERLAY CARDS */}
      {/* ======================================================== */}
      <div className="relative w-full overflow-hidden rounded-none border-y border-[#E0DBD2] bg-[#0E1A14] min-h-[680px] sm:min-h-[760px] lg:min-h-[820px] flex items-center">
        {/* Large, clean, wide background image - edge-to-edge full width */}
        <img
          src={data.bgImage}
          alt={`${data.productName} ritual backdrop`}
          onError={(e) => {
            const target = e.currentTarget;
            if (data.fallbackBgImage && target.src !== data.fallbackBgImage) {
              target.src = data.fallbackBgImage;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Atmospheric editorial tint for high legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-black/20 pointer-events-none" />

        {/* THREE PREMIER OVERLAY CARDS ON TOP OF BACKGROUND IMAGE */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-20 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {data.steps.map((step) => (
              <div
                key={step.number}
                className="bg-white/95 backdrop-blur-md border border-white/40 rounded-none overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-200 hover:bg-white"
              >
                {/* Card's Own Image: 1:1 Aspect Ratio */}
                <div className="relative w-full aspect-square bg-[#111111] overflow-hidden rounded-none border-b border-[#E5E0D8]">
                  <img
                    src={step.image}
                    alt={`${step.title} step`}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (step.fallbackImage && target.src !== step.fallbackImage) {
                        target.src = step.fallbackImage;
                      }
                    }}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Step Tag */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="bg-black/85 backdrop-blur-sm text-white text-[9.5px] font-sans font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-none">
                      STEP {step.number}
                    </span>
                  </div>
                </div>

                {/* Card Content: Title and Instruction */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    {/* Step Number & Category Label */}
                    <span className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-[#FF5A1F] block mb-1.5">
                      {step.number} // PROTOCOL
                    </span>

                    {/* Short Title */}
                    <h4 className="text-[18px] sm:text-[20px] font-bold font-['Syne',sans-serif] text-[#111111] uppercase tracking-tight">
                      {step.title}
                    </h4>

                    {/* Instruction */}
                    <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-[#4A5550] font-sans leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PRODUCT-SPECIFIC USAGE NOTE BELOW BACKGROUND IMAGE    */}
      {/* ======================================================== */}
      {data.note && (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 mt-8 sm:mt-10">
          <div className="p-4 sm:p-5 bg-white border border-[#E5E0D8] rounded-none flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 shadow-sm">
            <span className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase text-[#FF5A1F] shrink-0">
              USAGE NOTE //
            </span>
            <p className="text-[13px] sm:text-[13.5px] text-[#5A6660] leading-relaxed">
              {data.note}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyrklsProductHowToUseSection;
