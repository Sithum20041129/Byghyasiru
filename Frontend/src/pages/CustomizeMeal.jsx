import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { calculateMealPrice } from "@/utils/pricingEngine";

const CustomizeMeal = () => {
  const { storeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [storeSettings, setStoreSettings] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState("small");
  const [selectedVegCurries, setSelectedVegCurries] = useState([]);
  const [selectedNonVegCurries, setSelectedNonVegCurries] = useState([]);
  const [extraPieces, setExtraPieces] = useState({});
  const [price, setPrice] = useState(0);

  // 🟠 Load store settings from localStorage
  useEffect(() => {
    const allSettings = JSON.parse(localStorage.getItem("quickmeal_store_settings") || "{}");
    if (allSettings[storeId]) {
      setStoreSettings(allSettings[storeId]);
    }
  }, [storeId]);

  // 🟠 Calculate price whenever selections change
  useEffect(() => {
    if (!storeSettings || !selectedMeal) return;
    const mealConfig = {
      mainMealId: selectedMeal.id,
      portionCategoryId: selectedPortion,
      vegCurries: selectedVegCurries,
      nonVegCurries: selectedNonVegCurries.map((c) => ({
        ...c,
        pieces: extraPieces[c.id] || 1
      }))
    };
    const finalPrice = calculateMealPrice(storeSettings, mealConfig);
    setPrice(finalPrice);
  }, [storeSettings, selectedMeal, selectedPortion, selectedVegCurries, selectedNonVegCurries, extraPieces]);

  const toggleVegCurry = (curry) => {
    setSelectedVegCurries((prev) =>
      prev.includes(curry.id)
        ? prev.filter((id) => id !== curry.id)
        : [...prev, curry.id]
    );
  };

  const toggleNonVegCurry = (curry) => {
    setSelectedNonVegCurries((prev) =>
      prev.find((c) => c.id === curry.id)
        ? prev.filter((c) => c.id !== curry.id)
        : [...prev, { id: curry.id, name: curry.name }]
    );
  };

  const addToCart = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to order." });
      navigate("/login");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("quickmeal_cart") || "[]");

    const orderItem = {
      id: Date.now(),
      storeId,
      mainMeal: selectedMeal,
      portion: selectedPortion,
      vegCurries: selectedVegCurries,
      nonVegCurries: selectedNonVegCurries.map((c) => ({
        ...c,
        pieces: extraPieces[c.id] || 1
      })),
      price,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("quickmeal_cart", JSON.stringify([...cart, orderItem]));

    toast({
      title: "Added to Cart",
      description: `${selectedMeal.name} has been added to your cart.`
    });

    navigate("/cart");
  };

  if (!storeSettings) {
    return <div className="p-6 text-center">Loading store settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Helmet>
        <title>Customize Your Meal - QuickMeal</title>
        <meta
          name="description"
          content="Build your perfect meal with curries and portion options."
        />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Customize Your Meal</h1>

        {/* 🟠 Choose Main Meal */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Main Meal</h2>
            <div className="flex flex-wrap gap-2">
              {storeSettings.mainMeals.map((meal) => (
                <Button
                  key={meal.id}
                  variant={selectedMeal?.id === meal.id ? "default" : "outline"}
                  onClick={() => setSelectedMeal(meal)}
                >
                  {meal.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 🟠 Portion Selection */}
        {selectedMeal && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">Choose Portion</h2>
              <div className="flex flex-wrap gap-2">
                {storeSettings.portionCategories.map((portion) => (
                  <Button
                    key={portion.id}
                    variant={selectedPortion === portion.id ? "default" : "outline"}
                    onClick={() => setSelectedPortion(portion.id)}
                  >
                    {portion.name} ({selectedMeal.portionPrices[portion.id]} Rs)
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 🟠 Veg Curries */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Veg Curries</h2>
            <div className="flex flex-wrap gap-2">
              {storeSettings.curries
                .filter((c) => c.type === "veg")
                .map((curry) => (
                  <Button
                    key={curry.id}
                    variant={selectedVegCurries.includes(curry.id) ? "default" : "outline"}
                    onClick={() => toggleVegCurry(curry)}
                  >
                    {curry.name}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 🟠 Non-Veg Curries */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Non-Veg Curries</h2>
            <div className="flex flex-col gap-3">
              {storeSettings.curries
                .filter((c) => c.type === "non-veg")
                .map((curry) => {
                  const selected = selectedNonVegCurries.find((c) => c.id === curry.id);
                  return (
                    <div key={curry.id} className="flex items-center gap-3">
                      <Button
                        variant={selected ? "default" : "outline"}
                        onClick={() => toggleNonVegCurry(curry)}
                      >
                        {curry.name}
                      </Button>
                      {selected && curry.divisible && (
                        <input
                          type="number"
                          min="1"
                          value={extraPieces[curry.id] || 1}
                          onChange={(e) =>
                            setExtraPieces((prev) => ({
                              ...prev,
                              [curry.id]: parseInt(e.target.value, 10)
                            }))
                          }
                          className="w-16 border rounded p-1"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* 🟠 Price + Add to Cart */}
        <div className="flex items-center justify-between p-4 bg-white shadow rounded">
          <span className="text-lg font-semibold">Total: Rs {price}</span>
          <Button onClick={addToCart} disabled={!selectedMeal}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeMeal;
