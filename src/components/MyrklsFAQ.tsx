import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FAQItem {
  id: string;
  number: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '01',
    number: '01',
    question: 'What makes MYRKLS different?',
    answer:
      'We believe great skincare goes beyond a single hero ingredient. MYRKLS brings together advanced active technologies, global ingredient innovation and thoughtful formulation science—designed to work together with purpose.',
  },
  {
    id: '02',
    number: '02',
    question: 'What is Advanced Global Skin Science?',
    answer:
      'It is our formulation methodology of sourcing the world’s most potent, clinically validated technologies from premier biotechnology hubs—from European peptide synthesis and Swiss longevity research to Korean nanovesicle encapsulation and Indian standardized botanicals—unifying them into precision biocompatible delivery systems.',
  },
  {
    id: '03',
    number: '03',
    question: 'Are MYRKLS products suitable for all skin types?',
    answer:
      'Yes. Every formula is designed within skin-native physiological pH (5.0–5.5), non-comedogenic, and engineered to respect the lipid barrier. Our active technologies use liposomal encapsulation to deliver clinical efficacy without erythema, irritation, or sensitization across sensitive, dry, combination, and oily skin.',
  },
  {
    id: '04',
    number: '04',
    question: 'How do I choose the right MYRKLS product?',
    answer:
      'Our portfolio is engineered around targeted biological cellular pathways: INCARNATION™ Retinal Longevity Serum for cellular turnover and collagen architecture; SENTINEL™ Aqua Sunscreen for broad-spectrum SPF 50+ PA++++ photo-defence; and our active intelligence serums for multi-pathway tone correction and barrier restoration. You can select based on your primary skin objective or follow our curated daily ritual protocols.',
  },
  {
    id: '05',
    number: '05',
    question: 'What makes INCARNATION™ Retinal Serum special?',
    answer:
      'INCARNATION™ is formulated with 0.1% pure bio-retinaldehyde—the direct metabolic precursor to retinoic acid. It converts up to 10× faster than traditional retinol while bypassing standard skin irritation through stabilized liposomal delivery, stimulating rapid neo-collagenesis, epidermal density, and structural renewal.',
  },
  {
    id: '06',
    number: '06',
    question: 'Is SENTINEL™ sunscreen clinically tested?',
    answer:
      'Yes. SENTINEL™ has undergone rigorous in-vivo clinical testing to confirm certified SPF 50+ UVB protection and PA++++ critical broad-spectrum UVA defence. Its lightweight aqua-gel matrix absorbs with zero white cast, zero greasy residue, and an elegant second-skin breathable finish.',
  },
  {
    id: '07',
    number: '07',
    question: 'Can I combine multiple MYRKLS products?',
    answer:
      'Absolutely. MYRKLS formulas are intentionally molecularly architected to layer harmoniously without pilling, receptor saturation, or pH disruption. For optimal efficacy, apply lightest watery textures first, followed by active serums, targeted treatments, and finish with barrier creams or SENTINEL™ during AM rituals.',
  },
  {
    id: '08',
    number: '08',
    question: 'How long does skincare take to show results?',
    answer:
      'While hydration, surface barrier smoothing, and radical comfort are noticeable immediately upon application, deep cellular renewal aligns with biological skin turnover cycles (~28 days). Noticeable improvements in skin texture, clarity, firmness, and radiance typically manifest within 2 to 4 weeks of consistent twice-daily adherence.',
  },
];

export const MyrklsFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="good-to-know"
      aria-label="Frequently Asked Questions - Good to Know"
      className="w-full bg-[#FAF9F7] text-[#111111] rounded-none select-none border-t border-[#E8E5E0] pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-10 lg:pb-12 px-6 sm:px-10 lg:px-16 xl:px-24 mt-16 md:mt-24 lg:mt-28"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* ======================================================== */}
        {/* TOP HEADER: HEADING & SUBTITLE ALIGNED LEFT AT THE TOP    */}
        {/* ======================================================== */}
        <div className="text-left max-w-[800px] mb-14 sm:mb-20">
          
          {/* Tagline */}
          <div className="mb-4">
            <span className="text-[11.5px] sm:text-[12px] font-sans tracking-[0.16em] text-[#FF5A1F] uppercase font-bold">
              GOOD TO KNOW
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-[38px] sm:text-[50px] lg:text-[62px] font-medium tracking-[-0.03em] leading-[1.05] text-[#133429] uppercase">
            CURIOUS? GOOD.
          </h2>

          {/* Subtitle */}
          <p className="text-[16px] sm:text-[18px] text-[#4F6357] font-normal leading-relaxed mt-3 sm:mt-4">
            Good skincare starts with better questions.
          </p>
        </div>

        {/* ======================================================== */}
        {/* FAQ ACCORDION: STARTS BELOW HEADING, FULL-WIDTH ROWS     */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.id}
                className="group w-full transition-colors duration-300"
              >
                {/* Thin horizontal line: on hover / on open changes to orange */}
                <div
                  className={`w-full h-[1px] transition-colors duration-300 ${
                    isOpen
                      ? 'bg-[#FF5A1F]'
                      : 'bg-[#E8E5E0] group-hover:bg-[#FF5A1F]'
                  }`}
                />

                {/* Question Row (Full Width, Left-aligned Question, Right-aligned Icon) */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-6 sm:py-7 flex items-center justify-between gap-6 cursor-pointer focus:outline-none rounded-none"
                >
                  {/* Left-Aligned Question Text with Numbering */}
                  <span
                    className={`text-[17px] sm:text-[19px] lg:text-[21px] font-medium tracking-tight transition-colors duration-300 flex items-baseline gap-3 ${
                      isOpen
                        ? 'text-[#133429]'
                        : 'text-[#1A2E22] group-hover:text-[#FF5A1F]'
                    }`}
                  >
                    <span className="font-sans text-[14px] sm:text-[15px] text-[#777777] font-bold tracking-wider group-hover:text-[#FF5A1F] transition-colors">
                      {item.number}.
                    </span>
                    <span>{item.question}</span>
                  </span>

                  {/* Right-Aligned Plus/Minus Icon (Strictly rounded-none) */}
                  <div
                    className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-none border flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'border-[#FF5A1F] bg-[#FF5A1F] text-white shadow-sm'
                        : 'border-[#DDD8D0] text-[#1A2E22] group-hover:border-[#FF5A1F] group-hover:text-[#FF5A1F]'
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-center"
                    >
                      <Plus size={18} strokeWidth={2} />
                    </motion.div>
                  </div>
                </button>

                {/* Expandable Left-Aligned Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`answer-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 sm:pb-9 pt-1 pl-8 sm:pl-10 pr-6 lg:pr-24">
                        <p className="text-[15px] sm:text-[16.5px] leading-[1.75] text-[#4F6357] font-normal max-w-[940px]">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Bottom closing border line */}
          <div className="w-full h-[1px] bg-[#E8E5E0]" />
        </div>

      </div>
    </section>
  );
};

export default MyrklsFAQ;
