/**
 * MYRKLS Centralized Product Catalog & Science Data
 * Authoritative single source of truth for all 7 formulations
 */

import { MyrklsProductDetail, ProductHeroConfig, ProductCategory } from '../types';

export const ALL_MYRKLS_PRODUCTS: MyrklsProductDetail[] = [
  {
    id: 'vision',
    name: 'VISION™',
    categoryTitle: 'Multi-Pathway Pigment Corrector',
    category: 'SERUMS',
    categoryPill: 'CLINICAL SERUM · 30 mL',
    number: '01',
    size: '30 mL',
    targetPh: '5.0 – 5.5',
    price: '₹1,449',
    originalPrice: '₹1,799',
    savings: 'Save ₹350',
    discount: '19% OFF',
    rating: 4.9,
    reviews: 247,
    image: '/myrkls-prod-vision-dew.webp',
    consumerBenefit: 'Visibly fades persistent dark spots, marks & uneven pigmentation for a luminous, uniform complexion.',
    routineStep: 'Step 02 · Treatment Serum',
    bestFor: 'Uneven tone, dark spots & post-blemish marks',
    globalTechTag: 'GERMAN BIOTECH',
    globalTechOrigin: 'SymWhite® 377 — German Pigment Pathway Technology',
    systemSummary: 'Advanced multi-pathway tone-correction serum modulating cellular pigment synthesis and transfer pathways.',
    keyIngredients: [
      { name: 'Tranexamic Acid', percentage: '4.0%', role: 'Appearance of uneven pigmentation & post-blemish tone' },
      { name: 'Alpha-Arbutin', percentage: '2.0%', role: 'Tyrosinase-related pigment pathway regulation' },
      { name: 'SymWhite® 377 (Phenylethyl Resorcinol)', percentage: '0.30%', role: 'Targeted cellular tone-correction' },
      { name: 'Niacinamide', percentage: '4.0%', role: 'Epidermal barrier support & pigment transfer modulation' },
      { name: 'N-Acetyl Glucosamine', percentage: '2.0%', role: 'Skin conditioning & synergistic tone balance' },
      { name: 'Ectoin® Natural', percentage: '0.50%', role: 'Extremolyte cellular hydration & stress comfort' }
    ],
    additionalIngredients: ['Panthenol 1.0%', 'Biomimetic Hydrosol Complex'],
    primaryConcerns: ['Uneven skin tone', 'Appearance of dark spots', 'Post-blemish marks', 'Dull-looking skin'],
    scienceMechanism: 'Multi-pathway regulation addressing melanin synthesis, tyrosinase inhibition, and melanosome transfer without barrier compromise.',
    howToUse: 'Dispense 3–4 drops onto clean, damp skin morning and evening. Press gently into face and neck before moisturizing.'
  },
  {
    id: 'incarnation',
    name: 'INCARNATION™',
    categoryTitle: 'Retinal Longevity / Skin Renewal Serum',
    category: 'SERUMS',
    categoryPill: 'CLINICAL SERUM · 30 mL',
    number: '02',
    size: '30 mL',
    targetPh: '5.2 – 5.8',
    packagingNote: 'Opaque airless packaging',
    price: '₹1,499',
    originalPrice: '₹1,799',
    savings: 'Save ₹300',
    discount: '18% OFF',
    rating: 4.9,
    reviews: 318,
    image: '/myrkls-prod-incarnation-dew.webp',
    consumerBenefit: 'Encapsulated retinal and peptide synthesis accelerates renewal to visibly smooth fine lines & texture.',
    routineStep: 'Step 02 · Night Renewal Serum',
    bestFor: 'Fine lines, loss of elasticity & uneven texture',
    globalTechTag: 'FRENCH PEPTIDE & SWISS BIOTECH',
    globalTechOrigin: 'Matrixyl® 3000 — French Peptide Synthesis',
    systemSummary: 'Advanced retinal renewal with complementary European peptide and cellular skin-conditioning technologies.',
    keyIngredients: [
      { name: 'Stabilized Encapsulated Retinal', percentage: '0.10%', role: 'Direct vitamin A precursor for accelerated texture renewal' },
      { name: 'Matrixyl® 3000', percentage: '3.0%', role: 'European dual-peptide bio-complex targeting fine lines' },
      { name: 'Collagen Peptide Complex', percentage: '2.0%', role: 'Surface conditioning peptide matrix' },
      { name: 'Niacinamide', percentage: '3.0%', role: 'Epidermal lipid reinforcement & tone balance' },
      { name: 'Ectoin® Natural', percentage: '0.50%', role: 'Cellular moisture protection against retinoid fatigue' },
      { name: 'Panthenol', percentage: '2.0%', role: 'Skin soothing & moisture envelope support' }
    ],
    additionalIngredients: ['Beta-Glucan 0.30%', 'Multi-Molecular Hyaluronic Acid 0.20%'],
    primaryConcerns: ['Fine lines', 'Uneven texture', 'Visible signs of aging', 'Dullness'],
    scienceMechanism: 'Direct 1-step metabolic conversion from retinaldehyde to retinoic acid, minimizing sensitization while accelerating turnover.',
    howToUse: 'Smooth 2–3 pumps across clean face and neck in the evening. Follow with a barrier cream. Always use daily sunscreen.'
  },
  {
    id: 'rebirth',
    name: 'REBIRTH™',
    categoryTitle: 'Korean Biotech Recovery Serum',
    category: 'SERUMS',
    categoryPill: 'CLINICAL SERUM · 30 mL',
    number: '03',
    size: '30 mL',
    targetPh: '5.2 – 5.6',
    packagingNote: 'UV-protected amber packaging',
    price: '₹1,599',
    originalPrice: '₹1,899',
    savings: 'Save ₹300',
    discount: '16% OFF',
    rating: 4.8,
    reviews: 174,
    image: '/myrkls-prod-rebirth-dew.webp',
    consumerBenefit: 'Korean vegan PDRN biotech comforts compromised skin barriers, delivering deep bounce and recovery.',
    routineStep: 'Step 02 · Recovery Serum',
    bestFor: 'Barrier stress, redness, dryness & sensitivity',
    globalTechTag: 'SOUTH KOREAN BIOTECH',
    globalTechOrigin: 'Seoul Bio-Lab // Vegan PDRN & Plant Nanovesicles',
    systemSummary: 'Biotech-inspired skin recovery and deep conditioning serum formulated with plant-derived polydeoxyribonucleotides.',
    keyIngredients: [
      { name: 'Korean Vegan PDRN Complex', role: 'Plant-derived polydeoxyribonucleotide recovery active' },
      { name: 'Plant Nanovesicle Complex', role: 'Cosmetic bio-delivery & lipid conditioning' },
      { name: 'Adenosine', percentage: '0.10%', role: 'Anti-aging skin conditioning and smooth finish' },
      { name: 'Copper Tripeptide-1', role: 'Repair-oriented skin-conditioning peptide' },
      { name: 'Niacinamide', percentage: '3.0%', role: 'Micro-vascular conditioning & barrier reinforcement' },
      { name: 'Ectoin® Natural', percentage: '0.50%', role: 'Environmental stress shield & hydration binder' }
    ],
    additionalIngredients: ['Panthenol 2.0%', 'Beta-Glucan 0.30%', 'Multi-Molecular Hyaluronic Acid 0.20%'],
    primaryConcerns: ['Skin discomfort', 'Dryness', 'Compromised-feeling barrier', 'Visible signs of skin stress'],
    scienceMechanism: 'High-affinity bio-compatible nucleotides and peptide chaperones support cellular micro-environment and moisture recovery.',
    howToUse: 'Apply 3–4 drops morning and night onto cleansed skin. Gently pat until fully absorbed to calm and replenish.'
  },
  {
    id: 'eternity',
    name: 'ETERNITY™',
    categoryTitle: 'Advanced Longevity Cream',
    category: 'CREAMS',
    categoryPill: 'BARRIER CREAM · 50 g',
    number: '04',
    size: '50 g',
    targetPh: '5.2 – 5.6',
    price: '₹1,649',
    originalPrice: '₹1,999',
    savings: 'Save ₹350',
    discount: '17% OFF',
    rating: 4.9,
    reviews: 209,
    image: '/myrkls-prod-eternity-dew.webp',
    consumerBenefit: 'Rich bio-active longevity cream firming facial contours while replenishing essential barrier lipids.',
    routineStep: 'Step 03 · Barrier Moisturizer',
    bestFor: 'Loss of firmness, deep dryness & expression lines',
    globalTechTag: 'SWISS & INDIAN BIOTECH',
    globalTechOrigin: 'Neodermyl® Swiss Collagen Tech · Standardized Haritaki',
    systemSummary: 'Multi-technology longevity-focused skin cream combining Swiss bio-actives with standardized Indian botanicals.',
    keyIngredients: [
      { name: 'Neodermyl® Collagen Technology', role: 'Swiss collagen-focused cosmetic active' },
      { name: 'Matrixyl® Synthe’6™', percentage: '2.0%', role: 'French Matrikine peptide technology for visible density' },
      { name: 'Bakuchiol', percentage: '0.50%', role: 'Botanical retinol-mimetic texture refinement' },
      { name: 'Standardized Indian Haritaki', percentage: '1.0%', role: 'Standardized Terminalia chebula botanical antioxidant' },
      { name: 'Niacinamide', percentage: '5.0%', role: 'Endogenous ceramide synthesis reinforcement' },
      { name: 'Ectoin® Natural', percentage: '0.50%', role: 'Cellular moisture & membrane stabilization' }
    ],
    additionalIngredients: ['N-Acetyl Glucosamine 2.0%', 'Ceramide/Cholesterol/FFA 2.0%', 'Squalane 4.0%', 'Panthenol 2.0%'],
    primaryConcerns: ['Fine lines', 'Loss of supple appearance', 'Deep dryness', 'Uneven texture'],
    scienceMechanism: 'Dual peptide-botanical complex coupled with a 3:1:1 physiological lipid ratio reinforces the stratum corneum.',
    howToUse: 'Warm a pea-sized amount between fingertips and massage gently into face and neck using upward strokes.'
  },
  {
    id: 'restoration',
    name: 'RESTORATION™',
    categoryTitle: 'Plumping Pigment-Repair Cream',
    category: 'CREAMS',
    categoryPill: 'BARRIER CREAM · 50 g',
    number: '05',
    size: '50 g',
    targetPh: '5.2 – 5.6',
    price: '₹1,349',
    originalPrice: '₹1,599',
    savings: 'Save ₹250',
    discount: '16% OFF',
    rating: 4.7,
    reviews: 186,
    image: '/myrkls-prod-restoration-model.webp',
    consumerBenefit: 'Intensely hydrating cream delivering continuous moisture plumping and radiant skin clarity.',
    routineStep: 'Step 03 · Plumping Day Cream',
    bestFor: 'Dehydration, dullness & compromised barrier',
    globalTechTag: 'FRENCH & GERMAN TECH',
    globalTechOrigin: 'AQUAXYL™ French Hydration · SymWhite® 377 Germany',
    systemSummary: 'Hydration, plumping and even-tone support engineered into one high-affinity biomimetic lipid cream.',
    keyIngredients: [
      { name: 'AQUAXYL™', percentage: '3.0%', role: 'French 3D hydra-concept circulating moisture reservoirs' },
      { name: 'SymWhite® 377', percentage: '0.30%', role: 'Potent tyrosinase pathway modulator for clear tone' },
      { name: 'Niacinamide', percentage: '4.0%', role: 'Even skin tone & lipid organization reinforcement' },
      { name: 'N-Acetyl Glucosamine', percentage: '2.0%', role: 'Hyaluronic acid precursor & tone synergy' },
      { name: 'Ceramide / Cholesterol / FFA Complex', role: 'Essential intercellular lipid architecture' },
      { name: 'Squalane', percentage: '4.0%', role: 'Plant-derived biomimetic emollient' }
    ],
    additionalIngredients: ['Panthenol 1.5%', 'Beta-Glucan 0.30%', 'Multi-Molecular HA 0.20%', 'Shea Butter 1.5%'],
    primaryConcerns: ['Dehydration', 'Dryness', 'Uneven-looking tone', 'Barrier discomfort'],
    scienceMechanism: 'Circulates moisture through dermal aquaporins while stabilizing pigment pathways and rebuilding lipid barrier.',
    howToUse: 'Smooth generously over face and neck morning and evening as your daily moisturizing and plumping step.'
  },
  {
    id: 'awakening',
    name: 'AWAKENING™',
    categoryTitle: 'Performance Gel Cleanser',
    category: 'CLEANSERS',
    categoryPill: 'GEL CLEANSER · 150 mL',
    number: '06',
    size: '150 mL',
    targetPh: '4.8 – 5.2',
    price: '₹1,299',
    originalPrice: '₹1,499',
    savings: 'Save ₹200',
    discount: '15% OFF',
    rating: 4.8,
    reviews: 243,
    image: '/myrkls-prod-awakening-dew.webp',
    consumerBenefit: 'Gentle low-pH amino lather purifying pores & daily pollution while preserving skin moisture.',
    routineStep: 'Step 01 · Low-pH Cleanser',
    bestFor: 'Congested pores, excess sebum & daily cleansing',
    globalTechTag: 'SOUTH KOREAN BIO-FERMENT',
    globalTechOrigin: 'Korean Fermented Rice & Amino-Acid Micro-Lather',
    systemSummary: 'Refining low-pH gel cleanser with gentle PHA/BHA bio-exfoliation and a skin-conditioning support system.',
    keyIngredients: [
      { name: 'Sodium Cocoyl Glycinate', percentage: '5.0–6.0%', role: 'Gentle amino-acid primary surfactant' },
      { name: 'Disodium Cocoyl Glutamate', percentage: '3.0–4.0%', role: 'Secondary conditioning amino surfactant' },
      { name: 'Gluconolactone (PHA)', percentage: '3.0%', role: 'Next-gen gentle polyhydroxy acid exfoliation' },
      { name: 'Salicylic Acid (BHA)', percentage: '0.50%', role: 'Lipophilic pore-refining acid' },
      { name: 'N-Acetyl Glucosamine', percentage: '2.0%', role: 'Gentle texture conditioning & smoothness' },
      { name: 'Korean Fermented Rice', percentage: '1.0%', role: 'Nutrient-rich amino acid filtrate' }
    ],
    additionalIngredients: ['Niacinamide 2.0%', 'Ectoin® 0.30%', 'Panthenol 1.0%'],
    primaryConcerns: ['Excess surface oil', 'Congested-looking pores', 'Uneven texture', 'Daily gentle cleansing'],
    scienceMechanism: 'Low-pH amino-acid micellar matrix dissolves sebum and removes particulate pollutants without stripping natural skin barrier lipids.',
    howToUse: 'Work a small amount with water into a gentle lather. Massage onto damp skin for 60 seconds, then rinse with lukewarm water.'
  },
  {
    id: 'sentinel',
    name: 'SENTINEL™',
    categoryTitle: 'Advanced Aqua Sunscreen SPF 50+ PA++++',
    category: 'SUN PROTECTION',
    categoryPill: 'AQUA SUNSCREEN · 50 mL',
    number: '07',
    size: '50 mL',
    targetPh: '5.5 – 6.2',
    packagingNote: 'In-vivo tested · Broad Spectrum SPF 50+ PA++++',
    price: '₹1,399',
    originalPrice: '₹1,649',
    savings: 'Save ₹250',
    discount: '14% OFF',
    rating: 4.9,
    reviews: 289,
    image: '/myrkls-prod-sentinel-model.webp',
    consumerBenefit: 'Ultralight invisible fluid shield offering broad-spectrum SPF 50+ PA++++ photoprotection with zero cast.',
    routineStep: 'Step 04 · Morning Photoprotection',
    bestFor: 'Daily UV defense, photoaging & blue light shield',
    globalTechTag: 'EUROPEAN UV-FILTER MATRIX',
    globalTechOrigin: 'Basel Organic Photoprotection & Juveleven™ Peptide',
    systemSummary: 'Advanced high-protection aqua sunscreen designed for weightless daily wear with broad-spectrum photoprotection.',
    keyIngredients: [
      { name: 'Tinosorb® S Lite Aqua', percentage: '10.0%', role: 'Water-dispersible broad-spectrum UV filter' },
      { name: 'Tinosorb® S (BEMT)', percentage: '2.0%', role: 'High-photostability broad-spectrum filter' },
      { name: 'Uvinul® A Plus (DHHB)', percentage: '5.0%', role: 'Long-wave UVA photostable shield' },
      { name: 'Uvinul® T150 (EHT)', percentage: '3.0%', role: 'High-absorption UVB filter' },
      { name: 'Iscotrizinol (DBT)', percentage: '2.0%', role: 'Water-resistant UVB & UVA-II filter' },
      { name: 'Juveleven™ Peptide', percentage: '2.0%', role: 'Cellular longevity photoprotection peptide' }
    ],
    additionalIngredients: ['Ectoin® 0.50%', 'Advanced Film Former 1.2–1.5%', 'SPF Booster 1.0–1.5%'],
    primaryConcerns: ['Daily UV exposure', 'Photoaging prevention', 'Sun protection', 'Comfortable daily wear'],
    scienceMechanism: 'Micro-fine liquid suspension creates a continuous, flexible photo-protective film across skin topography with zero white cast or grease.',
    howToUse: 'Apply generously to face, neck and exposed areas 15 minutes before sun exposure. Reapply every 2 hours or after swimming/sweating.'
  }
];

export const PRODUCT_HERO_CONFIGS: Record<string, ProductHeroConfig> = {
  vision: {
    category: 'PIGMENT CORRECTING SERUM',
    name: 'VISION™',
    shortDescription:
      'A high-performance brightening serum engineered to visibly fade persistent dark spots, reduce the look of uneven pigmentation, and restore luminous skin clarity.',
    sizeLabel: '1 BOTTLE — 30 mL',
    ingredients: [
      { name: 'Tranexamic Acid', percentage: '4%', role: 'Helps visibly fade persistent discoloration and post-blemish marks.' },
      { name: 'Alpha-Arbutin', percentage: '2%', role: 'Targets the appearance of dark spots and promotes an even tone.' },
      { name: 'SymWhite® 377', percentage: '0.30%', role: 'High-potency antioxidant that visibly improves skin clarity.' },
      { name: 'Niacinamide', percentage: '4%', role: 'Supports a more uniform skin tone and strengthens the moisture barrier.' },
      { name: 'N-Acetyl Glucosamine', percentage: '2%', role: 'Complements tone correction and boosts gentle surface radiance.' },
      { name: 'Ectoin®', percentage: '0.5%', role: 'Delivers cellular hydration and shields against daily environmental stress.' },
    ],
    bestFor: ['Dark Spots', 'Uneven Tone', 'Pigmentation', 'Radiance'],
  },
  incarnation: {
    category: 'RETINAL SKIN RENEWAL SERUM',
    name: 'INCARNATION™',
    shortDescription:
      'Your nighttime essential for smoother-looking, renewed skin. Powered by stabilized retinal and advanced peptides to target fine lines and improve uneven texture.',
    sizeLabel: '1 BOTTLE — 30 mL',
    ingredients: [
      { name: 'Stabilized Retinal', percentage: '0.10%', role: 'Direct vitamin A precursor that accelerates surface cell renewal.' },
      { name: 'Matrixyl® 3000', percentage: '3%', role: 'Dual-peptide complex that visibly softens fine lines and wrinkles.' },
      { name: 'Collagen Peptide Complex', percentage: '2%', role: 'Supports skin firmness, bounce, and a smoother appearance.' },
      { name: 'Niacinamide', percentage: '3%', role: 'Helps maintain skin barrier comfort and promotes an even skin tone.' },
      { name: 'Ectoin®', percentage: '0.5%', role: 'Soothes the skin envelope and protects against retinoid dryness.' },
      { name: 'Panthenol', percentage: '2%', role: 'Pro-Vitamin B5 that comforts skin and reinforces deep hydration.' },
    ],
    bestFor: ['Fine Lines', 'Wrinkles', 'Skin Firmness', 'Uneven Texture'],
  },
  rebirth: {
    category: 'SKIN RECOVERY SERUM',
    name: 'REBIRTH™',
    shortDescription:
      'An intensive recovery serum formulated with plant-derived bio-actives and peptides to soothe skin discomfort, replenish moisture, and support a resilient barrier.',
    sizeLabel: '1 BOTTLE — 30 mL',
    ingredients: [
      { name: 'Vegan PDRN Complex', role: 'Plant-derived nucleotides that support deep skin recovery and comfort.' },
      { name: 'Plant Nanovesicle Complex', role: 'Enhances bio-delivery of essential moisture and skin conditioning.' },
      { name: 'Adenosine', percentage: '0.10%', role: 'Helps smooth the appearance of skin while conditioning fatigued skin.' },
      { name: 'Copper Tripeptide-1', role: 'High-purity peptide that promotes skin resilience and visible bounce.' },
      { name: 'Niacinamide', percentage: '3%', role: 'Reinforces barrier lipids and calms surface sensitivity.' },
      { name: 'Ectoin®', percentage: '0.5%', role: 'Extremolyte cellular hydration that shields against daily environmental stress.' },
    ],
    bestFor: ['Skin Conditioning', 'Hydration', 'Barrier Support', 'Skin Comfort'],
  },
  eternity: {
    category: 'ADVANCED LONGEVITY CREAM',
    name: 'ETERNITY™',
    shortDescription:
      'A rich, peptide-powered longevity moisturizer designed to support skin firmness, visibly soften expression lines, and replenish essential barrier lipids.',
    sizeLabel: '1 JAR — 50 G',
    ingredients: [
      { name: 'Neodermyl®', role: 'High-efficacy bio-complex that supports firmer, more supple-looking skin.' },
      { name: 'Matrixyl® Synthe’6™', percentage: '2%', role: 'Advanced Matrikine peptide technology targeting visible expression lines.' },
      { name: 'Bakuchiol', percentage: '0.50%', role: 'Gentle plant-derived retinol alternative that refines uneven skin texture.' },
      { name: 'Haritaki Extract', percentage: '1%', role: 'Standardized botanical antioxidant supporting long-term skin vitality.' },
      { name: 'Niacinamide', percentage: '5%', role: 'Strengthens natural barrier ceramides and supports skin elasticity.' },
      { name: 'Ceramide Complex', role: 'Replenishes intercellular lipids to lock in moisture and prevent dryness.' },
    ],
    bestFor: ['Fine Lines', 'Skin Firmness', 'Uneven Texture', 'Barrier Support'],
  },
  restoration: {
    category: 'PLUMPING + PIGMENT-REPAIR CREAM',
    name: 'RESTORATION™',
    shortDescription:
      'A deeply hydrating moisturizer designed to visibly plump skin, improve the look of uneven tone and support a stronger-feeling skin barrier.',
    sizeLabel: '1 JAR — 50 G',
    ingredients: [
      { name: 'AQUAXYL™', percentage: '3%', role: 'Helps support long-lasting hydration and a plumper skin feel.' },
      { name: 'SymWhite® 377', percentage: '0.30%', role: 'Targets the appearance of uneven tone and dark spots.' },
      { name: 'Niacinamide', percentage: '4%', role: 'Supports a more even-looking complexion and skin barrier.' },
      { name: 'N-Acetyl Glucosamine', percentage: '2%', role: "Complements the formula's tone-care and skin-conditioning approach." },
      { name: 'Ceramide Complex', role: 'Replenishes essential barrier lipids for smooth, supple skin.' },
      { name: 'Squalane', percentage: '4%', role: 'Plant-derived biomimetic emollient that seals in moisture without heaviness.' },
    ],
    bestFor: ['Hydration', 'Plumping', 'Uneven Tone', 'Dryness'],
  },
  awakening: {
    category: 'PERFORMANCE GEL CLEANSER',
    name: 'AWAKENING™',
    shortDescription:
      "A gentle low-pH foaming cleanser that purifies pores and sweeps away impurities while maintaining your skin's natural moisture barrier.",
    sizeLabel: '1 BOTTLE — 150 mL',
    ingredients: [
      { name: 'Gluconolactone (PHA)', percentage: '3%', role: 'Next-generation polyhydroxy acid that gently refines skin texture.' },
      { name: 'Salicylic Acid (BHA)', percentage: '0.50%', role: 'Lipophilic beta hydroxy acid that clears excess oil and clarifies pores.' },
      { name: 'N-Acetyl Glucosamine', percentage: '2%', role: 'Supports skin surface conditioning and smoothness.' },
      { name: 'Niacinamide', percentage: '2%', role: 'Helps balance sebum and calms the skin barrier while cleansing.' },
      { name: 'Fermented Rice', percentage: '1%', role: 'Nutrient-dense bio-ferment that boosts hydration and skin freshness.' },
      { name: 'Ectoin®', role: 'Extremolyte hydrator that protects skin from post-wash dryness.' },
    ],
    bestFor: ['Daily Cleansing', 'Excess Oil', 'Rough Texture', 'Skin Freshness'],
  },
  sentinel: {
    category: 'ADVANCED AQUA SUNSCREEN SPF 50+ PA++++',
    name: 'SENTINEL™',
    shortDescription:
      'An ultralight, invisible fluid sunscreen delivering broad-spectrum SPF 50+ PA++++ photoprotection with zero white cast and skin-soothing comfort.',
    sizeLabel: '1 BOTTLE — 50 mL',
    ingredients: [
      { name: 'Tinosorb® S Lite Aqua', percentage: '10%', role: 'Water-dispersible broad-spectrum UV filter for lightweight application.' },
      { name: 'Tinosorb® S', percentage: '2%', role: 'High-photostability filter protecting against UVA and UVB rays.' },
      { name: 'Uvinul® A Plus', percentage: '5%', role: 'Photostable organic filter providing comprehensive long-wave UVA defense.' },
      { name: 'Uvinul® T 150', percentage: '3%', role: 'High-efficiency UVB absorber shielding against sunburn and surface damage.' },
      { name: 'Iscotrizinol', percentage: '2%', role: 'Water-resistant filter providing durable broad-spectrum photoprotection.' },
      { name: 'Ectoin®', role: 'Cellular extremolyte hydrator that defends against environmental and UV stress.' },
    ],
    bestFor: ['Daily UV Protection', 'Lightweight Wear', 'Skin Comfort', 'Photoaging Defense'],
  },
};

export const PRODUCT_KEYWORDS_MAP: Record<string, string[]> = {
  incarnation: [
    'retinal', 'retinaldehyde', 'retinol', 'vitamin a', 'anti-aging',
    'fine lines', 'wrinkles', 'texture', 'renewal', 'firming',
    'matrixyl', 'peptides', 'collagen', 'night serum', 'niacinamide',
    'ectoin', 'purging', 'aging', 'youth', 'glass skin'
  ],
  sentinel: [
    'sunscreen', 'sun screen', 'spf', 'spf 50', 'spf50',
    'uv', 'uva', 'uvb', 'pa++++', 'pa+++', 'aqua',
    'sun protection', 'broad spectrum', 'sunblock', 'blue light',
    'lightweight', 'no white cast', 'invisible', 'day cream', 'water fluid'
  ],
  awakening: [
    'cleanser', 'face wash', 'facewash', 'gel', 'amino acid',
    'amino', 'green tea', 'purifying', 'low ph', 'foam',
    'foaming', 'wash', 'cleanse', 'pores', 'makeup remover', 'daily reset'
  ],
  restoration: [
    'cream', 'moisturizer', 'barrier', 'repair', 'pigment',
    'melasma', 'dark spots', 'squalane', 'ceramides', 'ceramide',
    'lipid', 'dry skin', 'flaky', 'nourishing', 'plumping', 'hydration'
  ],
  vision: [
    'dark spots', 'dark spot', 'pigment', 'pigmentation', 'hyperpigmentation',
    'symwhite', 'symwhite 377', 'brightening', 'even tone', 'clarity',
    'pih', 'blemish marks', 'tranexamic acid', 'alpha arbutin', 'serum', 'glow'
  ],
  rebirth: [
    'barrier', 'recovery', 'soothing', 'calm', 'ectoin',
    'redness', 'rosacea', 'sensitive', 'inflamed', 'burning',
    'irritation', 'serum', 'extremolyte', 'relief'
  ],
  eternity: [
    'peptide', 'peptides', 'firming', 'collagen', 'elasticity',
    'anti-aging', 'tightening', 'wrinkles', 'lifting', 'cream',
    'moisturizer', 'bounce', 'mature', 'longevity'
  ],
};

export const SUGGESTED_SEARCHES = [
  'Retinal',
  'Sunscreen',
  'Cleanser',
  'Barrier',
  'Dark Spots',
  'Peptides',
];

export function getProductById(id: string): MyrklsProductDetail | undefined {
  if (!id) return undefined;
  const cleanId = id.toLowerCase().trim();
  return ALL_MYRKLS_PRODUCTS.find((p) => p.id.toLowerCase() === cleanId);
}

export function getProductHeroConfig(id: string): ProductHeroConfig | undefined {
  if (!id) return undefined;
  const cleanId = id.toLowerCase().trim();
  return PRODUCT_HERO_CONFIGS[cleanId];
}

export function getFeaturedProducts(): MyrklsProductDetail[] {
  return ALL_MYRKLS_PRODUCTS.slice(0, 6);
}

export function getProductsByCategory(category: ProductCategory | string): MyrklsProductDetail[] {
  const cat = category.toUpperCase().trim();
  return ALL_MYRKLS_PRODUCTS.filter((p) => p.category.toUpperCase() === cat);
}
