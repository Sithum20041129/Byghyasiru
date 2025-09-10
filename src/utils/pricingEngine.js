// src/utils/pricingEngine.js
export const calculateMealPrice = (meal, storeSettings) => {
  let total = 0;

  // --- 1. Main meal base price (per portion) ---
  // Look for mainMeals first, then fall back to mains
  const mainMeals = storeSettings?.mainMeals || storeSettings?.mains || [];
  const main = mainMeals.find((m) => m.id === meal.mainMeal);
  
  // Look for portionCategories first, then fall back to portions
  const portionCategories = storeSettings?.portionCategories || storeSettings?.portions || [];
  const portion = portionCategories.find((p) => p.id === meal.portion);

  if (main && portion && main.available !== false) {
    const mainPrice = main.prices?.[portion.id] || 0;
    total += parseFloat(mainPrice);
  }

  // --- 2. Veg curries pricing ---
  // Handle different property names for defaultVegCount
  const freeVeg = storeSettings?.defaultVegCount ?? storeSettings?.defaultVegCurries ?? 0;
  const extraVegPrice = storeSettings?.extraVegPrice ?? storeSettings?.vegCurryPrice ?? 0;
  const vegCount = meal.vegCurries?.length || 0;

  if (vegCount > freeVeg) {
    const extraCount = vegCount - freeVeg;
    total += extraCount * parseFloat(extraVegPrice);
  }

  // --- 3. Non-veg curries ---
  if (meal.nonVegCurries?.length) {
    meal.nonVegCurries.forEach((nv) => {
      const curry = storeSettings.curries?.find((c) => c.id === nv.id);
      const portion = portionCategories.find((p) => p.id === meal.portion);

      if (curry && portion && curry.available !== false) {
        const portionId = portion.id;

        if (curry.divisible) {
          const basePrice = curry.prices?.[portionId] || 0;
          total += parseFloat(basePrice) * (nv.pieces || 1);

          // extra piece → single price (not per portion)
          if (nv.extraPieces && curry.extraPiecePrice) {
            total += parseFloat(curry.extraPiecePrice) * nv.extraPieces;
          }
        } else {
          const basePrice = curry.prices?.[portionId] || 0;
          total += parseFloat(basePrice);
        }
      }
    });
  }

  // --- 4. Gravies → free (selection only) ---
  return total;
};
