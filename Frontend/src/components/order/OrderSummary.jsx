import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const OrderSummary = ({
  meals,
  orderTotal,
  mealTypes,
  extraOptions,
  loading,
  onSubmit,
  isOrderValid,
  storeSettings, // ✅ Pass in merchant's store settings
}) => {
  const hasMeals = meals.some((meal) => meal.mealType);

  // ✅ Read free count + extra price from store settings
  const freeVegCount = storeSettings?.defaultVegCount || 0;
  const extraVegPrice = storeSettings?.extraVegPrice || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="sticky top-4"
    >
      <Card className="order-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasMeals && (
            <p className="text-gray-500 text-center">
              Your cart is empty. Select a meal to get started.
            </p>
          )}

          {hasMeals && (
            <div className="space-y-4">
              {meals.map((meal, index) => {
                if (!meal.mealType) return null;
                const selectedMeal = mealTypes.find(
                  (m) => m.value === meal.mealType
                );
                const filledCurries = meal.curries.filter((c) => c);
                const extraCurriesCount = Math.max(
                  0,
                  filledCurries.length - freeVegCount
                );

                return (
                  <div key={meal.id} className="border-b pb-3 mb-3">
                    <h4 className="font-bold text-md mb-2">
                      Meal #{index + 1}: {selectedMeal.label}
                    </h4>

                    <div className="flex justify-between font-semibold">
                      <span>Base Price</span>
                      <span>${selectedMeal.basePrice.toFixed(2)}</span>
                    </div>

                    {extraCurriesCount > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>
                          Extra Veg Curries ({extraCurriesCount} × $
                          {extraVegPrice})
                        </span>
                        <span>
                          ${(extraCurriesCount * extraVegPrice).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Object.entries(meal.extras).map(([extraType, quantity]) => {
                      if (quantity === 0) return null;
                      const extra = extraOptions.find(
                        (e) => e.value === extraType
                      );
                      return (
                        <div
                          key={extraType}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {extra?.label} x{quantity}
                          </span>
                          <span>
                            ${(extra?.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}

                    <div className="flex justify-between font-semibold text-sm mt-1">
                      <span>Subtotal</span>
                      <span>${meal.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-orange-600">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={onSubmit}
            disabled={!isOrderValid || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderSummary;
