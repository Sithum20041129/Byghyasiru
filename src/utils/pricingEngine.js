// src/utils/pricingEngine.js
export const calculateMealPrice = (meal, storeSettings) => {
  let total = 0;

  // --- 1. Main meal base price (per portion) ---
  const main = storeSettings?.mainMeals?.find((m) => m.id === meal.mainMeal);
  const portion = storeSettings?.portionCategories?.find(
    (p) => p.id === meal.portion
  );

  if (main?.available && portion) {
    const mainPrice = main.prices?.[portion.id] || 0;
    total += parseFloat(mainPrice);
  }

  // --- 2. Veg curries pricing ---
  const freeVeg = storeSettings?.defaultVegCount ?? 0;
  const extraVegPrice = storeSettings?.extraVegPrice ?? 0;
  const vegCount = meal.vegCurries?.length || 0;

  if (vegCount > freeVeg) {
    const extraCount = vegCount - freeVeg;
    total += extraCount * parseFloat(extraVegPrice);
  }

  // --- 3. Non-veg curries ---
  if (meal.nonVegCurries?.length) {
    meal.nonVegCurries.forEach((nv) => {
      const curry = storeSettings.curries?.find((c) => c.id === nv.id);
      const portion = storeSettings?.portionCategories?.find(
        (p) => p.id === meal.portion
      );

      if (curry && portion) {
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
