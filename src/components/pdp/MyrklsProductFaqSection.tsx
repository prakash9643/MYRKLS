import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export interface ProductFaqItem {
  question: string;
  answer: string;
}

export interface ProductFaqData {
  productId: string;
  productName: string;
  introText: string;
  faqs: ProductFaqItem[];
}

export const ALL_PRODUCT_FAQS: Record<string, ProductFaqData> = {
  incarnation: {
    productId: 'incarnation',
    productName: 'INCARNATION™',
    introText:
      'Essential guidance on gradual retinal introduction, night ritual steps, SPF pairing, and multi-active compatibility.',
    faqs: [
      {
        question: 'Is INCARNATION™ suitable for beginners?',
        answer:
          'Yes, but introduce retinal gradually. Start with two nights per week and increase as your skin tolerates it.',
      },
      {
        question: 'Can I use it every night?',
        answer:
          'You may gradually increase frequency if your skin tolerates it. Reduce use if irritation develops.',
      },
      {
        question: 'Should I use it in the morning or at night?',
        answer: 'Use it at night, followed by a gentle moisturizer.',
      },
      {
        question: 'Can I combine it with other active ingredients?',
        answer:
          'Avoid layering with other retinoids. Introduce potentially irritating exfoliating acids cautiously rather than using them in the same routine.',
      },
      {
        question: 'Do I need sunscreen?',
        answer: 'Yes. Apply broad-spectrum SPF 30+ every morning and reapply as needed.',
      },
    ],
  },
  vision: {
    productId: 'vision',
    productName: 'VISION™',
    introText:
      'Key details on multi-pathway pigment correction, day-to-night usage, active layering, and essential UV defense.',
    faqs: [
      {
        question: 'How soon will I notice a more even skin tone?',
        answer:
          'Skin tone and marks gradually appear more uniform with consistent morning and evening application over several weeks.',
      },
      {
        question: 'Can I layer VISION™ with Vitamin C or other active serums?',
        answer:
          'Yes. VISION™ uses non-acidic pigment-pathway actives that complement other treatments without barrier conflict.',
      },
      {
        question: 'Is this formula suitable for sensitive or easily irritated skin?',
        answer:
          'Yes. It is formulated without harsh chemical bleaches or aggressive exfoliating acids, ensuring gentle everyday comfort.',
      },
      {
        question: 'Should VISION™ be applied morning or night?',
        answer:
          'It can be used both morning and night. Apply 3–4 drops onto clean skin before applying thicker creams.',
      },
      {
        question: 'Do I still need daily sunscreen while using VISION™?',
        answer:
          'Yes. Broad-spectrum daytime SPF is essential to prevent UV radiation from triggering new dark spots and uneven tone.',
      },
    ],
  },
  rebirth: {
    productId: 'rebirth',
    productName: 'REBIRTH™',
    introText:
      'Everything you need to know about Korean biotech barrier recovery, post-procedure comfort, and skin calming.',
    faqs: [
      {
        question: 'What makes REBIRTH™ effective for barrier recovery?',
        answer:
          'It combines Korean bio-ferments with extremolyte Ectoin and biomimetic peptides to calm redness and replenish moisture.',
      },
      {
        question: 'Where does REBIRTH™ fit into my daily routine?',
        answer:
          'Apply 3–4 drops immediately after cleansing, morning and evening, before sealing in moisture with a cream.',
      },
      {
        question: 'Can I use it alongside retinoids or exfoliating treatments?',
        answer:
          'Yes. REBIRTH™ is ideal for buffering active routines and soothing transient dryness or irritation caused by treatments.',
      },
      {
        question: 'Will this serum feel sticky or heavy on oily skin?',
        answer:
          'No. It has a silky, fast-absorbing fluid texture that leaves a breathable, weightless finish with zero residue.',
      },
      {
        question: 'Is it safe for reactive and compromised skin barriers?',
        answer:
          'Yes. The formula is specifically engineered to respect reactive skin and support steady, calm barrier replenishment.',
      },
    ],
  },
  eternity: {
    productId: 'eternity',
    productName: 'ETERNITY™',
    introText:
      'Insights on longevity peptide synthesis, deep lipid barrier nourishment, day/night application, and texture wear.',
    faqs: [
      {
        question: 'How does ETERNITY™ differ from a standard moisturizer?',
        answer:
          'ETERNITY™ pairs European collagen peptides with a multi-ceramide lipid matrix to actively support firm, supple skin texture.',
      },
      {
        question: 'Can I wear ETERNITY™ during the day under makeup?',
        answer:
          'Yes. The cushion-melt formula absorbs smoothly without pilling, creating a refined, velvety base for daytime wear.',
      },
      {
        question: 'Can this cream be used on the neck and décolleté?',
        answer:
          'Yes. Gently massage upward across the jawline, neck, and upper chest to deliver rich peptide hydration.',
      },
      {
        question: 'Is ETERNITY™ heavy on combination or humid skin?',
        answer:
          'It provides deep moisture while maintaining an elegant, non-greasy finish that adapts comfortably across climates.',
      },
      {
        question: 'Can I layer ETERNITY™ over active treatment serums?',
        answer:
          'Yes. It serves as an ideal evening moisture lock to comfort skin after active serums like INCARNATION™ or VISION™.',
      },
    ],
  },
  restoration: {
    productId: 'restoration',
    productName: 'RESTORATION™',
    introText:
      'Understanding pigment-repair hydration, squalane lipid replenishment, daily layering, and skin radiance.',
    faqs: [
      {
        question: 'What is the primary focus of RESTORATION™?',
        answer:
          'It delivers dual-action care: replenishing barrier lipids with squalane while complementing uneven tone correction.',
      },
      {
        question: 'How often should I apply RESTORATION™?',
        answer:
          'Smooth evenly over clean face and neck twice daily, morning and evening, after your preferred treatment serum.',
      },
      {
        question: 'Does RESTORATION™ leave a white cast or shine?',
        answer:
          'No. It melts completely into skin with a natural, healthy hydration glow and no white residue.',
      },
      {
        question: 'Can I use RESTORATION™ during pregnancy?',
        answer:
          'While formulated without retinoids, we always recommend consulting your physician regarding any skincare during pregnancy.',
      },
      {
        question: 'Do I need to follow with morning sunscreen?',
        answer:
          'Yes. For any routine focused on clear, even tone, finishing with a broad-spectrum daily SPF is essential.',
      },
    ],
  },
  awakening: {
    productId: 'awakening',
    productName: 'AWAKENING™',
    introText:
      'Guidance on low-pH amino cleansing, effective makeup removal, eye safety, and everyday skin comfort.',
    faqs: [
      {
        question: 'Will AWAKENING™ strip or dry out my skin?',
        answer:
          'No. It is formulated at a low physiological pH (4.8–5.2) with gentle amino surfactants that clean without tightness.',
      },
      {
        question: 'Can it remove sunscreen and daily makeup?',
        answer:
          'Yes. It easily dissolves sunscreen and light daily makeup. For heavy, waterproof makeup, a double cleanse is suggested.',
      },
      {
        question: 'Can I use AWAKENING™ twice daily?',
        answer:
          'Yes. It is formulated to be gentle enough for both morning and evening cleansing rituals.',
      },
      {
        question: 'Is it safe around the eye area?',
        answer:
          'Avoid getting cleanser directly into the eyes. If contact occurs, rinse thoroughly with cool water.',
      },
      {
        question: 'How should AWAKENING™ be applied for best results?',
        answer:
          'Lather a coin-sized amount with lukewarm water on damp hands, gently massage onto skin for 30–60 seconds, and rinse.',
      },
    ],
  },
  sentinel: {
    productId: 'sentinel',
    productName: 'SENTINEL™',
    introText:
      'Information on certified broad-spectrum SPF 50+ UV defense, invisible aqua finish, reapplication, and skin compatibility.',
    faqs: [
      {
        question: 'Does SENTINEL™ leave a white cast on deeper skin tones?',
        answer:
          'No. The aqua fluid blends completely clear on all skin complexions with zero chalky residue or camera flashback.',
      },
      {
        question: 'Does it feel greasy or cause midday shine?',
        answer:
          'No. It absorbs into a sheer, breathable satin finish that feels weightless and controls midday surface greasiness.',
      },
      {
        question: 'How often should I reapply SENTINEL™?',
        answer:
          'Reapply at least every 2 hours when outdoors in direct sunlight, and immediately after swimming or heavy sweating.',
      },
      {
        question: 'Can SENTINEL™ be worn under foundation and makeup?',
        answer:
          'Yes. Its quick-absorbing aqua base acts as an excellent smoothing primer without pilling or clinging to dry patches.',
      },
      {
        question: 'Does this formula sting or irritate sensitive eyes?',
        answer:
          'It is formulated without synthetic fragrances and designed for comfortable, sting-free daily wear across the face.',
      },
    ],
  },
};

export interface MyrklsProductFaqSectionProps {
  productId?: string;
}

export const MyrklsProductFaqSection: React.FC<MyrklsProductFaqSectionProps> = ({
  productId = 'incarnation',
}) => {
  const normalizedKey = (productId || 'incarnation').toLowerCase();
  const data = ALL_PRODUCT_FAQS[normalizedKey] || ALL_PRODUCT_FAQS['incarnation'];

  // Accordion state: only one accordion answer open at a time (first item open by default)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="product-section-faq"
      aria-label={`${data.productName} Frequently Asked Questions`}
      className="relative w-full bg-[#FAF9F7] text-[#133429] py-16 sm:py-24 border-b border-[#DDD8D0] select-none"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: EYEBROW, HEADING & INTRO (STICKY ON DESKTOP) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            {/* Eyebrow */}
            <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2.5">
              05 / THE DETAILS
            </span>

            {/* Heading */}
            <h2 className="text-[32px] sm:text-[40px] lg:text-[44px] font-bold font-['Syne',sans-serif] tracking-tight text-[#133429] uppercase leading-[1.06]">
              GOOD QUESTIONS. CLEAR ANSWERS.
            </h2>

            {/* Introduction */}
            <p className="mt-4 sm:mt-5 text-[14.5px] sm:text-[15.5px] text-[#5A6660] font-sans leading-relaxed max-w-[460px]">
              {data.introText}
            </p>

            {/* Helpful Formulation Support Callout */}
            <div className="mt-8 pt-8 border-t border-[#E5E0D8] hidden lg:block">
              <span className="text-[10.5px] font-sans font-bold tracking-[0.16em] uppercase text-[#133429] block mb-1">
                FORMULATION ADVISORY //
              </span>
              <p className="text-[13px] text-[#6E7B74] font-sans leading-relaxed">
                Have an inquiry about regimen layering or ingredient tolerance? Our clinical concierges are available to assist.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: 5-QUESTION ACCORDION (1 OPEN AT A TIME)    */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 divide-y divide-[#E5E0D8] border-t border-b border-[#E5E0D8]">
            {data.faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="group transition-colors duration-150">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    className="w-full py-6 sm:py-7 flex items-center justify-between text-left gap-5 cursor-pointer focus:outline-none"
                  >
                    <span
                      className={`text-[16px] sm:text-[18px] font-bold font-['Syne',sans-serif] uppercase tracking-tight transition-colors duration-150 ${
                        isOpen ? 'text-[#FF5A1F]' : 'text-[#133429] group-hover:text-[#FF5A1F]'
                      }`}
                    >
                      {faq.question}
                    </span>

                    {/* Plus / Minus Icon Container (Sharp Corners, Thin Border) */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-none border flex items-center justify-center transition-colors duration-150 ${
                        isOpen
                          ? 'border-[#133429] bg-[#133429] text-white'
                          : 'border-[#DDD8D0] bg-white text-[#133429] group-hover:border-[#133429]'
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={14} strokeWidth={2.2} />
                      ) : (
                        <Plus size={14} strokeWidth={2.2} />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 sm:pb-7 pr-4 sm:pr-10">
                          <p className="text-[14px] sm:text-[15px] text-[#4A5550] font-sans leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default MyrklsProductFaqSection;
