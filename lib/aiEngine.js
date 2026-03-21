// AI Skin Analysis Engine (Simulation)
// Input: File (image) + lifestyleData object
// Output: Full analysis report JSON with root causes + improvement plan

import { SKIN_ISSUES } from '@/data/skinIssues';
import { INGREDIENTS_MAP } from '@/data/ingredients';
import { getProductsForIssues } from '@/data/products';

// Seeded pseudo-random for deterministic-per-image output
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function getRandInRange(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pickSeverity(rand, weights = { low: 0.4, medium: 0.4, high: 0.2 }) {
  const r = rand();
  if (r < weights.low) return 'low';
  if (r < weights.low + weights.medium) return 'medium';
  return 'high';
}

/* ════════════════════════════════════════════
   ROOT CAUSE ANALYSIS (from lifestyle data)
   ════════════════════════════════════════════ */
function analyzeRootCauses(lifestyle = {}) {
  const causes = [];

  // Sleep
  const sleepScore = { '<5h': 25, '5-6h': 55, '6-8h': 80, '8h+': 95 }[lifestyle.sleep] || 70;
  causes.push({
    id: 'sleep',
    label: 'Sleep Quality',
    icon: '😴',
    score: sleepScore,
    value: lifestyle.sleep || 'Unknown',
    impact: sleepScore < 50 ? 'high' : sleepScore < 70 ? 'medium' : 'low',
    description: sleepScore < 50
      ? 'Severe sleep deficit accelerates skin aging and inflammation. Your skin repairs itself during deep sleep — prioritize 7+ hours.'
      : sleepScore < 70
      ? 'Moderate sleep could be improved. Skin cell turnover peaks between 11PM–2AM.'
      : 'Good sleep habits support healthy skin cell renewal.',
  });

  // Hydration
  const waterScore = { '<1L': 20, '1-2L': 50, '2-3L': 80, '3L+': 95 }[lifestyle.water] || 65;
  causes.push({
    id: 'hydration',
    label: 'Hydration',
    icon: '💧',
    score: waterScore,
    value: lifestyle.water || 'Unknown',
    impact: waterScore < 50 ? 'high' : waterScore < 70 ? 'medium' : 'low',
    description: waterScore < 50
      ? 'Low water intake directly causes dull, dehydrated skin. Aim for 2–3L daily.'
      : waterScore < 70
      ? 'Decent hydration, but increasing to 2.5L+ can improve skin plumpness and glow.'
      : 'Excellent hydration habits — your skin benefits from consistent moisture.',
  });

  // Diet
  const dietScore = { 'high_sugar': 25, 'junk_heavy': 30, 'balanced': 85, 'high_protein': 75 }[lifestyle.diet] || 60;
  causes.push({
    id: 'diet',
    label: 'Diet & Nutrition',
    icon: '🍽',
    score: dietScore,
    value: lifestyle.diet?.replace('_', ' ') || 'Unknown',
    impact: dietScore < 50 ? 'high' : dietScore < 70 ? 'medium' : 'low',
    description: dietScore < 50
      ? 'High sugar and processed food trigger inflammation, acne, and premature aging. Consider reducing sugar and increasing omega-3 rich foods.'
      : dietScore < 70
      ? 'Your diet is adequate but could benefit from more antioxidant-rich fruits and vegetables.'
      : 'Great dietary habits — whole foods and balanced nutrition support clear skin.',
  });

  // Stress
  if (lifestyle.stress) {
    const stressScore = { 'low': 90, 'medium': 55, 'high': 20 }[lifestyle.stress] || 60;
    causes.push({
      id: 'stress',
      label: 'Stress Level',
      icon: '🧠',
      score: stressScore,
      value: lifestyle.stress,
      impact: stressScore < 50 ? 'high' : stressScore < 70 ? 'medium' : 'low',
      description: stressScore < 50
        ? 'High cortisol from chronic stress triggers breakouts, accelerates aging, and weakens skin barrier. Consider mindfulness or exercise.'
        : stressScore < 70
        ? 'Moderate stress — try to incorporate regular breaks and relaxation techniques.'
        : 'Low stress levels are great for maintaining healthy, clear skin.',
    });
  }

  // Sun exposure
  if (lifestyle.sunExposure) {
    const sunScore = { 'low': 85, 'medium': 55, 'high': 25 }[lifestyle.sunExposure] || 60;
    causes.push({
      id: 'sun',
      label: 'Sun Exposure',
      icon: '☀️',
      score: sunScore,
      value: lifestyle.sunExposure,
      impact: sunScore < 50 ? 'high' : sunScore < 70 ? 'medium' : 'low',
      description: sunScore < 50
        ? 'High UV exposure is the #1 cause of premature aging and hyperpigmentation. Sunscreen SPF 50+ is critical daily.'
        : sunScore < 70
        ? 'Moderate sun exposure — ensure consistent SPF 30+ application, especially midday.'
        : 'Good sun protection habits help prevent photoaging.',
    });
  }

  return causes;
}

/* ════════════════════════════════════════════
   IMPROVEMENT PLAN GENERATOR
   ════════════════════════════════════════════ */
function generateImprovementPlan(detectedIssues, rootCauses) {
  const highImpactCauses = rootCauses.filter(c => c.impact === 'high');
  const mediumImpactCauses = rootCauses.filter(c => c.impact === 'medium');

  const weekFour = [];
  const weekEight = [];

  // Based on issues
  if (detectedIssues.some(i => i.id === 'acne')) {
    weekFour.push('Reduced active breakouts by 40–60%');
    weekEight.push('Clearer skin with fewer recurring breakouts');
  }
  if (detectedIssues.some(i => i.id === 'dark_spots')) {
    weekFour.push('Early fading of surface-level pigmentation');
    weekEight.push('Visibly lighter dark spots and more even tone');
  }
  if (detectedIssues.some(i => i.id === 'oiliness')) {
    weekFour.push('Better oil control throughout the day');
    weekEight.push('Balanced sebum production with a natural glow');
  }
  if (detectedIssues.some(i => i.id === 'dryness')) {
    weekFour.push('Improved hydration and less flaking');
    weekEight.push('Stronger moisture barrier and plumper skin');
  }
  if (detectedIssues.some(i => i.id === 'under_eye')) {
    weekFour.push('Reduced puffiness under eyes');
    weekEight.push('Brighter under-eye area with less discoloration');
  }

  // Based on lifestyle fixes
  if (highImpactCauses.length > 0) {
    weekFour.push(`Improved ${highImpactCauses.map(c => c.label.toLowerCase()).join(' & ')} will start showing on skin`);
  }
  if (weekFour.length === 0) weekFour.push('Skin maintains its great condition');
  if (weekEight.length === 0) weekEight.push('Continued improvement with consistent routine');

  weekEight.push('Expected score improvement: +8 to +15 points');

  return { weekFour, weekEight };
}

/* ════════════════════════════════════════════
   ROUTINE GENERATOR
   ════════════════════════════════════════════ */
function generateRoutine(detectedIssueIds) {
  const hasAcne      = detectedIssueIds.includes('acne');
  const hasDry       = detectedIssueIds.includes('dryness');
  const hasOily      = detectedIssueIds.includes('oiliness');
  const hasDarkSpots = detectedIssueIds.includes('dark_spots');
  const hasAging     = detectedIssueIds.includes('wrinkles');
  const hasRedness   = detectedIssueIds.includes('redness');

  const am = [
    {
      step: 1, label: 'Cleanser',
      product: hasAcne ? 'Gentle BHA Cleanser (Salicylic Acid 0.5%)' : 'Gentle Hydrating Cleanser',
      tip: 'Use lukewarm water. Massage for 30 seconds.',
    },
    ...(hasDarkSpots ? [{
      step: 2, label: 'Vitamin C Serum',
      product: 'Vitamin C 10% Serum',
      tip: 'Apply on clean, dry skin. Wait 2 minutes before next step.',
    }] : []),
    {
      step: hasDarkSpots ? 3 : 2, label: 'Treatment Serum',
      product: hasOily ? 'Niacinamide 10% + Zinc' : hasRedness ? 'Azelaic Acid 10%' : 'Hyaluronic Acid 2%',
      tip: 'Apply 2–3 drops, press gently into skin.',
    },
    {
      step: hasDarkSpots ? 4 : 3, label: 'Moisturiser',
      product: hasDry ? 'Ceramide-Rich Moisturiser' : hasOily ? 'Lightweight Oil-Free Moisturiser' : 'Balanced Moisturiser',
      tip: 'Apply while skin is still slightly damp for better absorption.',
    },
    {
      step: hasDarkSpots ? 5 : 4, label: 'SPF 50+ Sunscreen',
      product: 'Broad-Spectrum Mineral SPF 50+',
      tip: 'Non-negotiable. Apply generously 15 min before sun exposure. Reapply every 2 hrs.',
    },
  ];

  const pm = [
    {
      step: 1, label: 'Cleanser',
      product: 'Gentle Cleanser (Double-cleanse if wearing SPF/makeup)',
      tip: 'Oil cleanser first to remove SPF, then water-based cleanser.',
    },
    {
      step: 2, label: 'Treatment',
      product: hasAging
        ? 'Granactive Retinoid 2% (start 2x/week, build up)'
        : hasAcne
        ? 'BHA Exfoliant (2–3x/week) or Niacinamide daily'
        : 'Niacinamide Serum',
      tip: 'Apply actives on dry skin for controlled absorption.',
    },
    {
      step: 3, label: 'Moisturiser + Repair',
      product: hasDry ? 'Rich Night Cream with Ceramides' : 'Lightweight Gel Moisturiser',
      tip: 'PM moisturiser can be richer than AM. Skin repairs most during sleep.',
    },
    ...(detectedIssueIds.includes('under_eye') ? [{
      step: 4, label: 'Eye Serum',
      product: 'Caffeine Solution 5% or Peptide Eye Serum',
      tip: 'Tap gently with ring finger. Never tug the delicate eye area.',
    }] : []),
  ];

  return { am, pm };
}

/* ════════════════════════════════════════════
   MAIN ENGINE FUNCTION
   ════════════════════════════════════════════ */
export async function analyzeImage(file, lifestyleData = {}) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2800));

  const seed = Math.round((file.size + file.name.length * 137) % 99999) || 42;
  const rand = seededRandom(seed);

  // ── Detect issues ──
  const allIssues = SKIN_ISSUES;
  const detectedIssues = [];

  // Lifestyle modifiers — certain lifestyles increase likelihood of certain issues
  const lifestyleModifiers = {};
  if (lifestyleData.diet === 'high_sugar' || lifestyleData.diet === 'junk_heavy') {
    lifestyleModifiers.acne = 0.3;
    lifestyleModifiers.oiliness = 0.2;
  }
  if (lifestyleData.sleep === '<5h') {
    lifestyleModifiers.under_eye = 0.35;
    lifestyleModifiers.dryness = 0.15;
  }
  if (lifestyleData.water === '<1L') {
    lifestyleModifiers.dryness = (lifestyleModifiers.dryness || 0) + 0.3;
  }
  if (lifestyleData.stress === 'high') {
    lifestyleModifiers.acne = (lifestyleModifiers.acne || 0) + 0.2;
    lifestyleModifiers.redness = 0.2;
  }

  for (const issue of allIssues) {
    const extraChance = lifestyleModifiers[issue.id] || 0;
    const detected = rand() > (0.25 - extraChance);
    if (!detected) continue;

    const commonIssues = ['acne', 'dark_spots', 'oiliness', 'pores'];
    const extraLikely = commonIssues.includes(issue.id);
    if (!extraLikely && rand() > (0.6 + extraChance)) continue;

    const severityWeights = {
      low:    extraLikely ? 0.3 : 0.5,
      medium: 0.4,
      high:   extraLikely ? 0.3 : 0.1,
    };

    // Lifestyle can push severity higher
    if (extraChance > 0.2) {
      severityWeights.high += 0.15;
      severityWeights.low -= 0.15;
    }

    const severity = pickSeverity(rand, severityWeights);
    const confidence = getRandInRange(rand, 72, 96);

    detectedIssues.push({
      ...issue,
      detected: true,
      severity,
      confidence,
      affectedPercent: getRandInRange(rand, 5, severity === 'high' ? 60 : 35),
    });
  }

  // ── Compute Face Health Score ──
  const totalPenalty = detectedIssues.reduce((acc, issue) => {
    const multiplier = { low: 2, medium: 5, high: 10 }[issue.severity];
    return acc + multiplier;
  }, 0);

  // Lifestyle bonus/penalty on score
  let lifestyleAdjust = 0;
  if (lifestyleData.sleep === '8h+') lifestyleAdjust += 3;
  if (lifestyleData.sleep === '<5h') lifestyleAdjust -= 4;
  if (lifestyleData.water === '3L+') lifestyleAdjust += 2;
  if (lifestyleData.water === '<1L') lifestyleAdjust -= 3;
  if (lifestyleData.diet === 'balanced') lifestyleAdjust += 3;
  if (lifestyleData.diet === 'junk_heavy') lifestyleAdjust -= 4;

  const rawScore = 100 - totalPenalty + lifestyleAdjust;
  const score = Math.max(18, Math.min(98, rawScore + getRandInRange(rand, -3, 3)));

  // ── Skin type ──
  const hasAcne = detectedIssues.some(i => i.id === 'acne');
  const hasOily = detectedIssues.some(i => i.id === 'oiliness');
  const hasDry  = detectedIssues.some(i => i.id === 'dryness');
  let skinType  = lifestyleData.skinType
    ? lifestyleData.skinType.charAt(0).toUpperCase() + lifestyleData.skinType.slice(1)
    : 'Normal';
  if (hasOily && hasAcne)    skinType = 'Oily, Acne-Prone';
  else if (hasOily)          skinType = 'Oily';
  else if (hasDry)           skinType = 'Dry / Dehydrated';
  else if (hasOily && hasDry) skinType = 'Combination';

  // ── Root Causes ──
  const rootCauses = analyzeRootCauses(lifestyleData);

  // ── Improvement Plan ──
  const improvementPlan = generateImprovementPlan(detectedIssues, rootCauses);

  // ── Ingredient & Product Recommendations ──
  const detectedIssueIds = detectedIssues.map(i => i.id);
  const ingredients = {};
  for (const id of detectedIssueIds) {
    ingredients[id] = INGREDIENTS_MAP[id] || [];
  }
  const products = getProductsForIssues(detectedIssueIds, 6);

  // ── Routine ──
  const routine = generateRoutine(detectedIssueIds);

  // ── Score label ──
  let scoreLabel = 'Excellent';
  let scoreDesc  = 'Your skin is in great condition. Maintain your routine!';
  if      (score < 40) { scoreLabel = 'Needs Attention'; scoreDesc = 'Your skin needs a consistent targeted routine. Start simple.'; }
  else if (score < 60) { scoreLabel = 'Fair';            scoreDesc = 'Moderate concerns detected. A focused routine will show results in 4–8 weeks.'; }
  else if (score < 75) { scoreLabel = 'Good';            scoreDesc = 'Good skin health with room for improvement. Keep up with your routine!'; }
  else if (score < 90) { scoreLabel = 'Great';           scoreDesc = 'Great skin! Minor areas to address. You\'re doing well!'; }

  // ── Data points count ──
  const lifestylePoints = Object.keys(lifestyleData).length;
  const scanPoints = detectedIssues.length * 3; // 3 data points per issue (zone, severity, confidence)
  const totalDataPoints = lifestylePoints + scanPoints + 4; // +4 for image metrics

  return {
    score,
    scoreLabel,
    scoreDesc,
    skinType,
    detectedIssues,
    rootCauses,
    improvementPlan,
    ingredients,
    products,
    routine,
    analyzedAt: new Date().toISOString(),
    issueCount: detectedIssues.length,
    totalDataPoints,
    aiConfidence: getRandInRange(rand, 82, 96),
    lifestyleData,
  };
}
