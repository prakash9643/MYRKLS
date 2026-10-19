import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, ShieldCheck, PenLine, X } from 'lucide-react';

export interface ProductReview {
  id: string;
  author: string;
  location: string;
  skinType: string;
  duration: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpfulCount: number;
  verified: boolean;
}

export interface ProductReviewSummary {
  rating: number;
  totalReviews: number;
  stats: { label: string; value: string }[];
  reviews: ProductReview[];
}

const PRODUCT_REVIEWS_MAP: Record<string, ProductReviewSummary> = {
  incarnation: {
    rating: 4.9,
    totalReviews: 184,
    stats: [
      { label: 'Smoother Texture', value: '98%' },
      { label: 'Visible Radiance', value: '94%' },
      { label: 'Zero Purging', value: '0%' },
    ],
    reviews: [
      {
        id: 'inc-rev-1',
        author: 'Dr. Ananya S.',
        location: 'Mumbai, IN',
        skinType: 'Reactive / Hyperpigmentation',
        duration: '6 Weeks Daily PM',
        rating: 5,
        title: 'Zero purging, 10× the radiance of standard retinol.',
        content:
          'Converted visibly faster than standard retinol with zero flaking or barrier disruption. My skin texture is uniformly glassy and calm.',
        date: '2 weeks ago',
        helpfulCount: 42,
        verified: true,
      },
      {
        id: 'inc-rev-2',
        author: 'Rohan M.',
        location: 'New Delhi, IN',
        skinType: 'Oily / Enlarged Pores',
        duration: '3 Weeks Protocol',
        rating: 5,
        title: 'Forehead congestion smoothed out completely.',
        content:
          'My recurring micro-texture vanished in three weeks. No redness, no burning—just refined pores and a healthy natural glow.',
        date: '3 weeks ago',
        helpfulCount: 28,
        verified: true,
      },
      {
        id: 'inc-rev-3',
        author: 'Meera T.',
        location: 'Bangalore, IN',
        skinType: 'Combination / Mature',
        duration: '8 Weeks Consistent Use',
        rating: 5,
        title: 'Holy grail night treatment.',
        content:
          'I have tried luxury retinoids that cost triple. This stabilized 0.1% retinaldehyde gave me the clearest, firmest skin of my life.',
        date: '1 month ago',
        helpfulCount: 35,
        verified: true,
      },
    ],
  },
  sentinel: {
    rating: 4.9,
    totalReviews: 216,
    stats: [
      { label: 'Zero White Cast', value: '99%' },
      { label: 'Feels Like Water', value: '97%' },
      { label: 'Zero Eye Stinging', value: '0%' },
    ],
    reviews: [
      {
        id: 'sen-rev-1',
        author: 'Marcus V.',
        location: 'Berlin, DE',
        skinType: 'Combination / Outdoor',
        duration: '4 Weeks Daily AM',
        rating: 5,
        title: 'Feels like pure water on bare skin.',
        content:
          'I cycle 4+ hours outdoors. Disappears in 10 seconds with zero white ghost cast, zero eye stinging, and zero greasy shine under sun.',
        date: '1 week ago',
        helpfulCount: 38,
        verified: true,
      },
      {
        id: 'sen-rev-2',
        author: 'Camille L.',
        location: 'Paris, FR',
        skinType: 'Mature / Sun-Stressed',
        duration: '7 Weeks Protocol',
        rating: 5,
        title: 'Layers flawlessly under makeup.',
        content:
          'No pilling, no oily breakthrough at 3 PM. Gives skin a satin lit-from-within finish that doubles as a primer.',
        date: '2 weeks ago',
        helpfulCount: 31,
        verified: true,
      },
      {
        id: 'sen-rev-3',
        author: 'Tanvi R.',
        location: 'Hyderabad, IN',
        skinType: 'Sensitive / Humid Climate',
        duration: '5 Weeks Use',
        rating: 5,
        title: 'Finally an SPF that does not cause breakouts.',
        content:
          'Every sunscreen broke me out in the summer heat. SENTINEL is completely weightless and leaves zero residue behind.',
        date: '1 month ago',
        helpfulCount: 26,
        verified: true,
      },
    ],
  },
  awakening: {
    rating: 4.8,
    totalReviews: 142,
    stats: [
      { label: 'No Stripped Tightness', value: '98%' },
      { label: 'Dissolves SPF & Residue', value: '95%' },
      { label: 'Preserved Moisture Barrier', value: '96%' },
    ],
    reviews: [
      {
        id: 'awk-rev-1',
        author: 'Elena R.',
        location: 'Milan, IT',
        skinType: 'Sensitive / Normal-to-Dry',
        duration: '5 Weeks Everyday',
        rating: 5,
        title: 'Purifies deeply without stripping the barrier.',
        content:
          'Most foaming cleansers leave skin tight like parchment paper. AWAKENING dissolves sunscreen while leaving a soft, pliant hydration veil.',
        date: '10 days ago',
        helpfulCount: 19,
        verified: true,
      },
      {
        id: 'awk-rev-2',
        author: 'Siddharth P.',
        location: 'Pune, IN',
        skinType: 'Combination / Pollution-Exposed',
        duration: '3 Weeks Protocol',
        rating: 5,
        title: 'The amino acid lather is exceptional.',
        content:
          'Dense, micro-bubbled lather that washes clean instantly. Skin feels calm, balanced, and completely refreshed without any film.',
        date: '3 weeks ago',
        helpfulCount: 22,
        verified: true,
      },
      {
        id: 'awk-rev-3',
        author: 'Zara B.',
        location: 'Dubai, UAE',
        skinType: 'Oily / Dehydrated',
        duration: '6 Weeks Use',
        rating: 5,
        title: 'Gentle daily reset for congested pores.',
        content:
          'Calms down overnight oiliness without disturbing my acid mantle. Green tea amino surfactant feels like pure silk on skin.',
        date: '1 month ago',
        helpfulCount: 15,
        verified: true,
      },
    ],
  },
  restoration: {
    rating: 4.9,
    totalReviews: 168,
    stats: [
      { label: 'Deep Lipid Plumping', value: '97%' },
      { label: 'Faded Pigment Marks', value: '94%' },
      { label: 'Zero Clogged Pores', value: '0%' },
    ],
    reviews: [
      {
        id: 'res-rev-1',
        author: 'Priya K.',
        location: 'Bangalore, IN',
        skinType: 'Dry / Compromised Lipid Barrier',
        duration: '8 Weeks Morning & Night',
        rating: 5,
        title: 'Melted away chronic dullness and dark patches.',
        content:
          'Within two weeks of pairing RESTORATION with my routine, stubborn melasma patches softened into an even, rested glow.',
        date: '2 weeks ago',
        helpfulCount: 29,
        verified: true,
      },
      {
        id: 'res-rev-2',
        author: 'Chloe D.',
        location: 'London, UK',
        skinType: 'Dry / Cold Weather',
        duration: '4 Weeks AM/PM',
        rating: 5,
        title: 'A cushion of pure comfort.',
        content:
          'Rich texture that melts immediately upon contact. My morning skin is plump, rested, and deeply nourished even through winter.',
        date: '3 weeks ago',
        helpfulCount: 24,
        verified: true,
      },
      {
        id: 'res-rev-3',
        author: 'Ankit S.',
        location: 'Jaipur, IN',
        skinType: 'Reactive / Flaky Zones',
        duration: '6 Weeks Use',
        rating: 5,
        title: 'Saved my peeling barrier.',
        content:
          'Eliminated all dry patches around my nose and chin within 5 days. Truly therapeutic repair without any greasy shine.',
        date: '1 month ago',
        helpfulCount: 31,
        verified: true,
      },
    ],
  },
  vision: {
    rating: 4.8,
    totalReviews: 134,
    stats: [
      { label: 'Faded Dark Spots', value: '96%' },
      { label: 'Uniform Tone Clarity', value: '98%' },
      { label: 'Accelerated Post-Blemish Recovery', value: '93%' },
    ],
    reviews: [
      {
        id: 'vis-rev-1',
        author: 'Sonia G.',
        location: 'Chennai, IN',
        skinType: 'PIH / Post-Acne Marks',
        duration: '4 Weeks Daily',
        rating: 5,
        title: 'PIH marks faded in under a month.',
        content:
          'The SymWhite 377 pathway is remarkably effective. Old acne scars that lingered for months have practically faded into skin.',
        date: '1 week ago',
        helpfulCount: 27,
        verified: true,
      },
      {
        id: 'vis-rev-2',
        author: 'Daniel K.',
        location: 'Toronto, CA',
        skinType: 'Sun Damaged / Uneven',
        duration: '6 Weeks AM Protocol',
        rating: 5,
        title: 'Gentle yet visibly potent.',
        content:
          'Causes zero irritation while visibly evening out persistent sun spots. Absorbs instantly with a weightless finish.',
        date: '3 weeks ago',
        helpfulCount: 21,
        verified: true,
      },
      {
        id: 'vis-rev-3',
        author: 'Aarti V.',
        location: 'Mumbai, IN',
        skinType: 'Dull / Combination',
        duration: '8 Weeks Daily',
        rating: 5,
        title: 'Luminous, unfiltered clarity.',
        content:
          'My daily foundation usage dropped by half because my natural skin tone is so even and radiant now.',
        date: '1 month ago',
        helpfulCount: 33,
        verified: true,
      },
    ],
  },
  rebirth: {
    rating: 4.9,
    totalReviews: 118,
    stats: [
      { label: 'Immediate Redness Relief', value: '99%' },
      { label: 'Strengthened Resilience', value: '97%' },
      { label: 'Zero Flare-Ups', value: '0%' },
    ],
    reviews: [
      {
        id: 'reb-rev-1',
        author: 'Maya L.',
        location: 'San Francisco, US',
        skinType: 'Reactive / Retinoid Dryness',
        duration: '3 Weeks Protocol',
        rating: 5,
        title: 'Instant tranquilizer for stressed skin.',
        content:
          'Ectoin is pure magic. Soothes retinoid dryness and environmental windburn within twenty minutes of application.',
        date: '2 weeks ago',
        helpfulCount: 25,
        verified: true,
      },
      {
        id: 'reb-rev-2',
        author: 'Vikram N.',
        location: 'Kolkata, IN',
        skinType: 'Over-Exfoliated / Burning',
        duration: '2 Weeks SOS',
        rating: 5,
        title: 'Healed my damaged barrier in 48 hours.',
        content:
          'Restored my burning, inflamed barrier completely. A must-have in every active routine to keep skin resilient.',
        date: '3 weeks ago',
        helpfulCount: 19,
        verified: true,
      },
      {
        id: 'reb-rev-3',
        author: 'Sophie M.',
        location: 'Lyon, FR',
        skinType: 'Sensitive / Rosacea-Prone',
        duration: '5 Weeks Use',
        rating: 5,
        title: 'Featherlight soothing shield.',
        content:
          'Absorbs like a serum, protects like a barrier balm. Completely neutralized my recurring cheek redness.',
        date: '1 month ago',
        helpfulCount: 22,
        verified: true,
      },
    ],
  },
  eternity: {
    rating: 4.9,
    totalReviews: 126,
    stats: [
      { label: 'Noticeably Firmer Skin', value: '96%' },
      { label: 'Softened Micro-Lines', value: '93%' },
      { label: 'Sustained Elasticity', value: '97%' },
    ],
    reviews: [
      {
        id: 'ete-rev-1',
        author: 'Beatrice H.',
        location: 'Geneva, CH',
        skinType: 'Mature / Loss of Elasticity',
        duration: '6 Weeks Daily',
        rating: 5,
        title: 'Sculpted resilience in a jar.',
        content:
          'French peptides and biomimetic collagen give an immediate tightening and plush bounce. Superior to Swiss creams at triple the price.',
        date: '1 week ago',
        helpfulCount: 29,
        verified: true,
      },
      {
        id: 'ete-rev-2',
        author: 'Rajeshwari D.',
        location: 'Ahmedabad, IN',
        skinType: 'Normal to Dry / Aging',
        duration: '6 Weeks Routine',
        rating: 5,
        title: 'My jawline and neck feel redefined.',
        content:
          'Crepey texture on my neck smoothed out in 6 weeks. Rich yet completely weightless upon application.',
        date: '2 weeks ago',
        helpfulCount: 21,
        verified: true,
      },
      {
        id: 'ete-rev-3',
        author: 'Lucia F.',
        location: 'Madrid, ES',
        skinType: 'Dehydrated / Fine Lines',
        duration: '8 Weeks Consistent Use',
        rating: 5,
        title: 'The ultimate longevity moisturizer.',
        content:
          'Keeps skin cushion-soft for 24 hours straight without feeling heavy under warm weather.',
        date: '1 month ago',
        helpfulCount: 34,
        verified: true,
      },
    ],
  },
};

export interface MyrklsProductReviewSectionProps {
  productId?: string;
}

export const MyrklsProductReviewSection: React.FC<MyrklsProductReviewSectionProps> = ({
  productId = 'incarnation',
}) => {
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Retrieve customized review data for this product, defaulting to incarnation
  const currentKey = productId.toLowerCase();
  const summary = PRODUCT_REVIEWS_MAP[currentKey] || PRODUCT_REVIEWS_MAP.incarnation;

  const toggleHelpful = (id: string) => {
    setHelpfulLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setNewAuthor('');
      setNewTitle('');
      setNewComment('');
      setNewRating(5);
    }, 1800);
  };

  return (
    <section
      id="product-section-reviews"
      aria-label="Verified Customer Reviews"
      className="relative w-full bg-[#FAF9F7] text-[#133429] py-14 sm:py-18 border-b border-[#DDD8D0] select-none"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        {/* ======================================================== */}
        {/* 1. COMPACT HEADER: EYEBROW, TITLE & RATING SCORE BAR     */}
        {/* ======================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D8]">
          {/* Left: Eyebrow & Title */}
          <div>
            <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#FF5A1F] block mb-2">
              07 / VERIFIED REVIEWS
            </span>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-bold font-['Syne',sans-serif] tracking-tight text-[#133429] uppercase leading-[1.08]">
              REAL VOICES. REAL SKIN.
            </h2>
          </div>

          {/* Right: Compact Rating Metrics & Write Review Action */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Score Pill */}
            <div className="flex items-center gap-3 bg-white border border-[#E5E0D8] px-4 py-2.5 rounded-none shadow-xs">
              <span className="text-[22px] font-bold font-['Syne',sans-serif] text-[#133429] leading-none">
                {summary.rating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-[#FF5A1F] text-[#FF5A1F]"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-sans text-[#7A8A82] tracking-wider uppercase mt-0.5 font-medium">
                  {summary.totalReviews} Verified Ratings
                </span>
              </div>
            </div>

            {/* Quick Clinical Outcome Pills */}
            <div className="hidden sm:flex items-center gap-2">
              {summary.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E0D8] px-3 py-2 rounded-none text-center"
                >
                  <span className="text-[13px] font-bold text-[#133429] block leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[9px] font-sans text-[#7A8A82] tracking-wider uppercase block mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Write a Review Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#133429] hover:bg-[#1E4D3D] active:scale-[0.99] text-white text-[11px] font-sans font-bold tracking-[0.14em] uppercase rounded-none transition-colors cursor-pointer shadow-xs"
            >
              <PenLine size={13} />
              <span>Write A Review</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. THREE COMPACT REVIEW CARDS (1 ROW ON DESKTOP)         */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-8">
          {summary.reviews.map((rev) => {
            const isLiked = helpfulLiked[rev.id];

            return (
              <div
                key={rev.id}
                className="bg-white border border-[#E5E0D8] p-5 sm:p-6 rounded-none flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#133429] transition-all duration-200"
              >
                {/* Card Top: Stars & Date */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className="fill-[#FF5A1F] text-[#FF5A1F]"
                        />
                      ))}
                    </div>
                    <span className="text-[10.5px] font-sans text-[#8C9B93]">
                      {rev.date}
                    </span>
                  </div>

                  {/* Review Title */}
                  <h3 className="font-['Syne',sans-serif] text-[15px] font-bold text-[#133429] leading-snug tracking-tight">
                    "{rev.title}"
                  </h3>

                  {/* Review Content */}
                  <p className="mt-2.5 text-[13px] font-sans text-[#4A5952] leading-relaxed line-clamp-3">
                    {rev.content}
                  </p>
                </div>

                {/* Card Bottom: Reviewer Profile & Helpful Action */}
                <div className="mt-5 pt-4 border-t border-[#F0EBE3] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-bold text-[#133429]">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-sans font-semibold text-[#133429] bg-[#E9EFEA] px-1.5 py-0.5 rounded-none">
                            <CheckCircle2 size={10} className="text-[#133429]" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-sans text-[#8C9B93] block mt-0.5">
                        {rev.skinType} • {rev.duration}
                      </span>
                    </div>
                  </div>

                  {/* Helpful Button */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => toggleHelpful(rev.id)}
                      className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isLiked
                          ? 'text-[#FF5A1F] font-bold'
                          : 'text-[#7A8A82] hover:text-[#133429]'
                      }`}
                    >
                      <ThumbsUp size={12} className={isLiked ? 'fill-[#FF5A1F]' : ''} />
                      <span>Helpful ({rev.helpfulCount + (isLiked ? 1 : 0)})</span>
                    </button>

                    <span className="text-[#8C9B93] text-[10.5px] flex items-center gap-1">
                      <ShieldCheck size={11} className="text-[#133429]" />
                      Authentic
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 3. SLIM TRUST FOOTER                                     */}
        {/* ======================================================== */}
        <div className="mt-8 pt-5 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-4 text-[11px] font-sans text-[#7A8A82]">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#133429]" />
              100% Real Customer Submissions
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#133429]" />
              Formulated Without Synthetic Fragrance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#133429]" />
              Clinical Tolerance Tested
            </span>
          </div>

          <span className="text-[10.5px] text-[#8C9B93]">
            Adherence protocols monitored over structured 4–8 week trials
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE WRITE REVIEW MODAL                        */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-[#133429] p-6 sm:p-7 shadow-2xl rounded-none">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close review modal"
              className="absolute top-4 right-4 text-[#7A8A82] hover:text-[#133429] cursor-pointer"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={36} className="text-[#133429] mx-auto mb-3" />
                <h4 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#133429] uppercase">
                  Thank You For Sharing!
                </h4>
                <p className="text-[13px] text-[#5A6660] mt-1 font-sans">
                  Your verified review has been submitted for publication.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <span className="text-[10px] font-sans font-bold tracking-[0.16em] uppercase text-[#FF5A1F] block mb-1">
                  CUSTOMER FEEDBACK
                </span>
                <h3 className="font-['Syne',sans-serif] text-[20px] font-bold text-[#133429] uppercase mb-4">
                  Write A Review
                </h3>

                {/* Rating selection */}
                <div className="mb-4">
                  <label className="block text-[11px] font-sans font-bold tracking-wider uppercase text-[#133429] mb-1.5">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          size={20}
                          className={
                            star <= newRating
                              ? 'fill-[#FF5A1F] text-[#FF5A1F]'
                              : 'text-[#DDD8D0]'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="block text-[11px] font-sans font-bold tracking-wider uppercase text-[#133429] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Priya M."
                    className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] focus:border-[#133429] focus:outline-none rounded-none"
                  />
                </div>

                {/* Headline */}
                <div className="mb-3">
                  <label className="block text-[11px] font-sans font-bold tracking-wider uppercase text-[#133429] mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Noticed visible glow in 2 weeks"
                    className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] focus:border-[#133429] focus:outline-none rounded-none"
                  />
                </div>

                {/* Content */}
                <div className="mb-5">
                  <label className="block text-[11px] font-sans font-bold tracking-wider uppercase text-[#133429] mb-1">
                    Review Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share how this formulation performed for your skin type..."
                    className="w-full px-3 py-2 text-[13px] border border-[#DDD8D0] focus:border-[#133429] focus:outline-none rounded-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#133429] hover:bg-[#1E4D3D] text-white text-[11px] font-sans font-bold tracking-[0.16em] uppercase rounded-none cursor-pointer transition-colors"
                >
                  Submit Verified Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MyrklsProductReviewSection;
