export const INGREDIENTS_MAP = {
  acne: [
    {
      name: 'Salicylic Acid (BHA)',
      concentration: '0.5–2%',
      mechanism: 'Oil-soluble exfoliant that penetrates pores to dissolve sebum and dead skin cells.',
      note: 'Best used in cleansers or spot treatments. Can cause dryness — moisturise after.',
      icon: '🧪',
    },
    {
      name: 'Niacinamide',
      concentration: '5–10%',
      mechanism: 'Reduces sebum production, minimises pores, and soothes post-acne redness.',
      note: 'Extremely well-tolerated. Safe for daily AM/PM use.',
      icon: '🧬',
    },
    {
      name: 'Benzoyl Peroxide',
      concentration: '2.5–5%',
      mechanism: 'Kills acne-causing bacteria (C. acnes) and helps unclog pores.',
      note: 'Use a low %. Can bleach fabric — rinse thoroughly.',
      icon: '⚗️',
    },
    {
      name: 'Tea Tree Oil',
      concentration: '5%',
      mechanism: 'Natural antibacterial with anti-inflammatory properties for mild acne.',
      note: 'Always dilute before applying. Do not use neat on skin.',
      icon: '🌿',
    },
  ],

  dark_spots: [
    {
      name: 'Vitamin C (Ascorbic Acid)',
      concentration: '10–20%',
      mechanism: 'Inhibits melanin synthesis and neutralises free radicals causing pigmentation.',
      note: 'Use in AM. Store away from light to prevent oxidation.',
      icon: '🍋',
    },
    {
      name: 'Alpha Arbutin',
      concentration: '2%',
      mechanism: 'Blocks tyrosinase enzyme that produces melanin. Brightens dark spots gently.',
      note: 'Safer alternative to hydroquinone. Highly effective for Indian skin tones.',
      icon: '🧪',
    },
    {
      name: 'Kojic Acid',
      concentration: '1–2%',
      mechanism: 'Naturally derived melanin inhibitor. Also has mild antimicrobial properties.',
      note: 'May cause sensitivity. Use SPF mandatory.',
      icon: '🌾',
    },
    {
      name: 'Tranexamic Acid',
      concentration: '2–5%',
      mechanism: 'Reduces melanin transfer. Very effective for melasma and stubborn spots.',
      note: 'A rising star ingredient particularly effective for South Asian skin.',
      icon: '🔬',
    },
  ],

  under_eye: [
    {
      name: 'Caffeine',
      concentration: '2–5%',
      mechanism: 'Constricts blood vessels reducing dark appearance and puffiness under the eyes.',
      note: 'Apply with gentle tapping motion. Works best in AM.',
      icon: '☕',
    },
    {
      name: 'Retinol',
      concentration: '0.025–0.05%',
      mechanism: 'Boosts collagen production and thickens the thin under-eye skin over time.',
      note: 'Start at very low % for under eyes. Use only PM and with SPF next AM.',
      icon: '💊',
    },
    {
      name: 'Peptides (Matrixyl)',
      concentration: 'As per formula',
      mechanism: 'Signal proteins that stimulate collagen and elastin for firmer under-eye skin.',
      note: 'Safe for daily use. Often combined with hyaluronic acid.',
      icon: '🧬',
    },
  ],

  wrinkles: [
    {
      name: 'Retinol',
      concentration: '0.025–1%',
      mechanism: 'Gold standard anti-aging: boosts cell turnover, collagen synthesis, and skin renewal.',
      note: 'Start low and go slow. Always use SPF. Avoid during pregnancy.',
      icon: '💊',
    },
    {
      name: 'Peptides',
      concentration: 'Varies',
      mechanism: 'Amino acid chains that signal skin to produce more collagen and elastin.',
      note: 'Very gentle. Ideal for anti-aging beginners or retinol-sensitive users.',
      icon: '🧬',
    },
    {
      name: 'Hyaluronic Acid',
      concentration: '1–2%',
      mechanism: 'Draws water into the skin, plumping fine lines and improving skin texture.',
      note: 'Apply on damp skin for maximum hydration effect.',
      icon: '💧',
    },
    {
      name: 'SPF 30–50+',
      concentration: 'Broad Spectrum',
      mechanism: 'The single most important anti-aging ingredient — prevents UV-induced collagen breakdown.',
      note: 'Non-negotiable. Use every single morning, indoors or outdoors.',
      icon: '☀️',
    },
  ],

  oiliness: [
    {
      name: 'Niacinamide',
      concentration: '5–10%',
      mechanism: 'Regulates sebum production and tightens the appearance of pores.',
      note: 'Perfect base for oily skin routines. Layer under moisturiser.',
      icon: '🧬',
    },
    {
      name: 'Zinc PCA',
      concentration: '0.5–2%',
      mechanism: 'Regulates oil production and has antimicrobial properties.',
      note: 'Often combined with niacinamide for maximum sebum control.',
      icon: '⚗️',
    },
    {
      name: 'Salicylic Acid (BHA)',
      concentration: '0.5–1%',
      mechanism: 'Keeps pores clear of excess oil build-up preventing shine and blackheads.',
      note: 'Light toner format ideal for oily skin types.',
      icon: '🧪',
    },
  ],

  dryness: [
    {
      name: 'Hyaluronic Acid',
      concentration: '1–2%',
      mechanism: 'Humectant — holds 1000x its weight in water, deeply hydrates all skin layers.',
      note: 'Apply to damp skin, seal with moisturiser for best results.',
      icon: '💧',
    },
    {
      name: 'Ceramides',
      concentration: '1–3%',
      mechanism: 'Restores and strengthens the skin barrier, preventing trans-epidermal water loss.',
      note: 'Core ingredient for dehydrated or barrier-compromised skin.',
      icon: '🛡️',
    },
    {
      name: 'Glycerin',
      concentration: '5–15%',
      mechanism: 'Powerful, gentle humectant that attracts moisture from the environment into skin.',
      note: 'Found in most moisturisers. Safe for all skin types.',
      icon: '💦',
    },
    {
      name: 'Squalane',
      concentration: '5–100%',
      mechanism: 'Lightweight emollient that mimics skin\'s natural sebum without clogging pores.',
      note: 'Ideal final step to lock in hydration. Works for all skin types.',
      icon: '🫧',
    },
  ],

  redness: [
    {
      name: 'Azelaic Acid',
      concentration: '10–20%',
      mechanism: 'Calms rosacea, reduces redness, has antibacterial and anti-inflammatory properties.',
      note: 'One of the best ingredients for skin of colour and sensitive, reactive skin.',
      icon: '🧪',
    },
    {
      name: 'Centella Asiatica (Cica)',
      concentration: 'Varies',
      mechanism: 'Potent anti-inflammatory and wound-healing ingredient. Speeds up post-breakout recovery.',
      note: 'Also known as Tiger Grass. Widely used in Korean skincare.',
      icon: '🌿',
    },
    {
      name: 'Niacinamide',
      concentration: '5%',
      mechanism: 'Anti-inflammatory properties reduce redness and soothe sensitised skin.',
      note: 'Gentle and versatile. Pairs well with most actives.',
      icon: '🧬',
    },
  ],

  pores: [
    {
      name: 'Niacinamide',
      concentration: '10%',
      mechanism: 'Visibly reduces pore size by regulating sebum and tightening pore walls over time.',
      note: 'High % (10%) most effective for pore minimisation.',
      icon: '🧬',
    },
    {
      name: 'Retinol',
      concentration: '0.1–0.5%',
      mechanism: 'Promotes cell turnover keeping pores clear and refining skin texture.',
      note: 'Consistent PM use over 12 weeks shows notable pore size reduction.',
      icon: '💊',
    },
    {
      name: 'AHAs (Glycolic/Lactic Acid)',
      concentration: '5–10%',
      mechanism: 'Exfoliate dead skin cells that clog pores and expand pore appearance.',
      note: 'Use 2–3x per week max. Always follow with SPF.',
      icon: '🧪',
    },
  ],
  texture: [
    {
      name: 'Glycolic Acid (AHA)',
      concentration: '5–10%',
      mechanism: 'Exfoliates the surface skin layer to smooth rough patches and fade texture.',
      note: 'Can increase sun sensitivity. Always use SPF.',
      icon: '🧪'
    },
    {
      name: 'Lactic Acid (AHA)',
      concentration: '5–10%',
      mechanism: 'A gentler AHA that exfoliates surface texture while drawing moisture into the skin.',
      note: 'Ideal for sensitive skin struggling with texture.',
      icon: '🥛'
    }
  ],

  lips: [
    {
      name: 'Lanolin',
      concentration: '100%',
      mechanism: 'Ultra-rich occlusive that mimics human skin lipids to heal severe chapping.',
      note: 'Not vegan, but highly effective for barrier repair.',
      icon: '🐑'
    },
    {
      name: 'Petrolatum',
      concentration: '30–100%',
      mechanism: 'Seals in moisture better than almost any other ingredient.',
      note: 'Use as an overnight slugging mask for lips.',
      icon: '🛡️'
    }
  ]
};
