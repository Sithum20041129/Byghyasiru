// src/utils/pricingEngine.js

/**
 * Resolve portion data from meal and store settings
 */
const resolvePortion = (meal, storeSettings) => {
  const portionCategories = storeSettings?.portionCategories || storeSettings?.portions || [];
  return portionCategories.find((p) => p.id === meal.portion);
};

/**
 * Get price for a curry based on portion
 */
const priceForCurry = (curry, portionId) => {
  if (!curry || !curry.prices) return 0;
  return parseFloat(curry.prices[portionId] || 0);
};

/**
 * Select base non-veg curry using priority rules
 * Returns { baseCurry, basePrice, otherNonVeg }
 */
const pickBaseNonVeg = (nonVegCurries, storeSettings, portionId) => {
  if (!nonVegCurries?.length) return null;

  const curriesWithData = nonVegCurries.map(nv => {
    const curry = storeSettings.curries?.find(c => c.id === nv.id);
    return curry ? { ...nv, curry, price: priceForCurry(curry, portionId) } : null;
  }).filter(Boolean).filter(nv => nv.curry.available !== false);

  if (!curriesWithData.length) return null;

  // Split into divisible and non-divisible
  const nonDivisible = curriesWithData.filter(nv => !nv.curry.divisible);
  const divisible = curriesWithData.filter(nv => nv.curry.divisible);

  let baseCurry, basePrice, otherNonVeg;

  if (nonDivisible.length === 1 && divisible.length === 0) {
    // Single non-divisible curry
    baseCurry = nonDivisible[0];
    basePrice = baseCurry.price;
    otherNonVeg = [];
  } else if (nonDivisible.length >= 1) {
    // Multiple non-veg with at least one non-divisible: pick most expensive non-divisible
    baseCurry = nonDivisible.reduce((max, current) => 
      current.price > max.price ? current : max
    );
    basePrice = baseCurry.price;
    otherNonVeg = curriesWithData.filter(nv => nv.id !== baseCurry.id);
  } else {
    // All divisible: pick most expensive divisible as base
    baseCurry = divisible.reduce((max, current) => 
      current.price > max.price ? current : max
    );
    // For divisible curries, always charge the base portion price for the first serving
    // Only charge extra for pieces beyond the first serving
    const pieces = baseCurry.pieces || 1;
    const extraPieces = Math.max(0, pieces - 1); // Extra pieces beyond the first
    basePrice = baseCurry.price; // Base price for first serving
    if (extraPieces > 0) {
      basePrice += baseCurry.price * extraPieces; // Add cost for extra pieces
    }
    otherNonVeg = curriesWithData.filter(nv => nv.id !== baseCurry.id);
  }

  return { baseCurry, basePrice, otherNonVeg };
};

/**
 * Price additional non-veg curries (not the base)
 */
const priceOtherNonVeg = (otherNonVeg, storeSettings) => {
  let total = 0;
  const extraNonVegPrice = storeSettings?.extraNonVegAsExtraPrice ?? storeSettings?.extraVegPrice ?? 0;

  otherNonVeg.forEach(nv => {
    if (nv.curry.divisible) {
      // Divisible: charge per-piece for all selected pieces (no free pieces)
      total += nv.price * (nv.pieces || 1);
    } else {
      // Non-divisible: charge as "extra curry" + any extra pieces
      total += parseFloat(extraNonVegPrice);
      if (nv.extraPieces && nv.curry.extraPiecePrice) {
        total += parseFloat(nv.curry.extraPiecePrice) * nv.extraPieces;
      }
    }
  });

  return total;
};

/**
 * Price extra pieces for base non-veg curry
 */
const priceBaseNonVegExtras = (baseCurry) => {
  if (!baseCurry) return 0;
  
  if (baseCurry.curry.divisible) {
    // For divisible base curry, extra pieces are already handled in pickBaseNonVeg
    return 0;
  } else {
    // For non-divisible base curry, charge for extra pieces
    if (baseCurry.extraPieces && baseCurry.curry.extraPiecePrice) {
      return parseFloat(baseCurry.curry.extraPiecePrice) * baseCurry.extraPieces;
    }
  }
  
  return 0;
};

/**
 * Price veg curries (extra beyond free count)
 */
const priceVegExtras = (meal, storeSettings) => {
  const freeVeg = storeSettings?.defaultVegCount ?? storeSettings?.defaultVegCurries ?? 0;
  const extraVegPrice = storeSettings?.extraVegPrice ?? storeSettings?.vegCurryPrice ?? 0;
  const vegCount = meal.vegCurries?.length || 0;

  if (vegCount > freeVeg) {
    const extraCount = vegCount - freeVeg;
    return extraCount * parseFloat(extraVegPrice);
  }
  
  return 0;
};

/**
 * Calculate meal price with complex non-veg priority rules
 * @param {Object} meal - The meal configuration
 * @param {Object} storeSettings - Store settings and pricing config
 * @returns {number} Total meal price
 */
export const calculateMealPrice = (meal, storeSettings) => {
  let total = 0;

  // Resolve portion once
  const portion = resolvePortion(meal, storeSettings);
  if (!portion) return 0;
  
  const portionId = portion.id;
  const hasNonVeg = meal.nonVegCurries?.length > 0;

  // --- 1. Base price logic ---
  if (!hasNonVeg) {
    // No non-veg: use main meal price as base
    const mainMeals = storeSettings?.mainMeals || storeSettings?.mains || [];
    const main = mainMeals.find((m) => m.id === meal.mainMeal);
    
    if (main && main.available !== false) {
      const mainPrice = main.prices?.[portionId] || 0;
      total += parseFloat(mainPrice);
    }
  } else {
    // Has non-veg: ignore main meal price, use non-veg priority rules
    const baseResult = pickBaseNonVeg(meal.nonVegCurries, storeSettings, portionId);
    
    if (baseResult) {
      const { baseCurry, basePrice, otherNonVeg } = baseResult;
      
      // Add base non-veg price
      total += basePrice;
      
      // Add extra pieces for base non-veg curry
      total += priceBaseNonVegExtras(baseCurry);
      
      // Add other non-veg curries
      total += priceOtherNonVeg(otherNonVeg, storeSettings);
    }
  }

  // --- 2. Add veg curry extras ---
  total += priceVegExtras(meal, storeSettings);

  // --- 3. Gravies remain free ---
  
  return total;
};