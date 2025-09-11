// src/pages/OrderPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateMealPrice } from "@/utils/pricingEngine";

const createNewMeal = () => ({
  id: Date.now(),
  mainMeal: "",
  portion: "",
  vegCurries: [],
  nonVegCurries: [],
  gravies: [],
});

const OrderPage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [storeSettings, setStoreSettings] = useState(null);
  const [merchantConfig, setMerchantConfig] = useState(null);
  const [meals, setMeals] = useState([createNewMeal()]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  /** 🔹 Load merchant + settings from localStorage */
  const loadStore = useCallback(() => {
    const users = JSON.parse(localStorage.getItem("quickmeal_users") || "[]");
    const merchant = users.find(
      (u) => u.id === storeId && u.role === "merchant" && u.approved
    );

    if (!merchant) {
      toast({
        title: "Store Not Found",
        description: "The requested store could not be found",
        variant: "destructive",
      });
      navigate("/customer");
      return;
    }

    const settings = JSON.parse(
      localStorage.getItem("quickmeal_store_settings") || "{}"
    );
    const currentStoreSettings = settings[storeId];

    if (!currentStoreSettings?.isOpen || !currentStoreSettings?.acceptingOrders) {
      toast({
        title: "Store Unavailable",
        description: currentStoreSettings?.isOpen
          ? "Store is currently in busy hours"
          : "Store is currently closed",
        variant: "destructive",
      });
      navigate("/customer");
      return;
    }

    const merchantConfigData = JSON.parse(
      localStorage.getItem("merchantConfig") || "{}"
    );

    setStore(merchant);
    setStoreSettings(currentStoreSettings);
    setMerchantConfig(merchantConfigData);
  }, [storeId, navigate, toast]);

  /** 🔹 Redirect if not customer */
  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }
    loadStore();
  }, [user, navigate, loadStore]);

  /** 🔹 Update meal selections */
  const updateMeal = useCallback((index, updatedMealData) => {
    setMeals((currentMeals) => {
      const newMeals = [...currentMeals];
      newMeals[index] = { ...newMeals[index], ...updatedMealData };
      return newMeals;
    });
  }, []);

  /** 🔹 Calculate meal prices using useMemo to avoid render loop */
  const mealsWithTotals = useMemo(() => {
    if (!storeSettings || !merchantConfig) return meals.map(meal => ({ ...meal, total: 0 }));
    return meals.map((meal) => ({
      ...meal,
      total: calculateMealPrice(meal, { ...storeSettings, ...merchantConfig }),
    }));
  }, [meals, storeSettings, merchantConfig]);

  /** 🔹 Calculate order total using useMemo */
  const calculatedOrderTotal = useMemo(() => {
    return mealsWithTotals.reduce((sum, meal) => sum + meal.total, 0);
  }, [mealsWithTotals]);

  const addAnotherMeal = () => {
    setMeals((prev) => [...prev, createNewMeal()]);
  };

  const removeMeal = (index) => {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  };

  /** 🔹 Handle order submission */
  const handleSubmitOrder = async () => {
    for (const meal of mealsWithTotals) {
      if (!meal.mainMeal || !meal.portion) {
        toast({
          title: "Incomplete Order",
          description: "Please select main meal and portion for all meals.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const allOrders = JSON.parse(
        localStorage.getItem("quickmeal_orders") || "[]"
      );
      const orderNumber = `QM${Date.now().toString().slice(-6)}`;

      const newOrder = {
        id: Date.now().toString(),
        orderNumber,
        customerId: user.id,
        customerName: user.username,
        storeId: store.id,
        storeName: store.storeName,
        meals: mealsWithTotals,
        total: calculatedOrderTotal,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      allOrders.push(newOrder);
      localStorage.setItem("quickmeal_orders", JSON.stringify(allOrders));
      toast({
        title: "Order Placed!",
        description: `Your order #${orderNumber} has been submitted successfully`,
      });
      navigate(`/receipt/${newOrder.id}`);
    } catch {
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!store || !storeSettings || !merchantConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /** 🔹 Config values */
  const mainMeals = merchantConfig.mainMeals || merchantConfig.mains || [];
  const portions = merchantConfig.portions || [];
  const vegCurries = merchantConfig.curries?.filter((c) => c.type === "veg") || [];
  const nonVegCurries =
    merchantConfig.curries?.filter((c) => c.type === "nonveg") || [];
  const gravies = merchantConfig.gravies || [];

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Order from {store.storeName} - QuickMeal</title>
        <meta
          name="description"
          content={`Place your pre-order at ${store.storeName} and skip the queue.`}
        />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/customer"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">
              {store.storeName}
            </h1>
            <p className="text-gray-600">{store.storeAddress}</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Meals */}
          <div className="lg:col-span-2 space-y-6">
            {mealsWithTotals.map((meal, index) => (
              <div
                key={meal.id}
                className="p-4 border-2 border-dashed rounded-lg space-y-6 relative"
              >
                {meals.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeMeal(index)}
                  >
                    Remove Meal
                  </Button>
                )}

                <h2 className="text-2xl font-bold text-gray-700">
                  Meal #{index + 1}
                </h2>

                {/* Main Meals */}
                <div>
                  <h3 className="font-semibold">Main Meal</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {mainMeals.map((m) => (
                      <label key={m.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`mainMeal-${meal.id}`}
                          value={m.id}
                          checked={meal.mainMeal === m.id}
                          onChange={() => updateMeal(index, { mainMeal: m.id })}
                        />
                        <span>
                          {m.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Portions */}
                <div>
                  <h3 className="font-semibold">Portion Category</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {portions.map((p) => (
                      <label key={p.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`portion-${meal.id}`}
                          value={p.id}
                          checked={meal.portion === p.id}
                          onChange={() => updateMeal(index, { portion: p.id })}
                        />
                        <span>
                          {p.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Veg Curries */}
                <div>
                  <label className="block font-medium">Veg Curries</label>
                  <p className="text-sm text-gray-500">
                    First {merchantConfig?.defaultVegCount || 0} veg curries are
                    free. Extra curries cost ${merchantConfig?.extraVegPrice || 0}{" "}
                    each.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {vegCurries.map((curry) => (
                      <label key={curry.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={meal.vegCurries.includes(curry.id)}
                          onChange={() => {
                            const selected = meal.vegCurries.includes(curry.id);
                            const updated = selected
                              ? meal.vegCurries.filter((id) => id !== curry.id)
                              : [...meal.vegCurries, curry.id];
                            updateMeal(index, { vegCurries: updated });
                          }}
                        />
                        {curry.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Non-Veg Curries */}
                <div>
                  <label className="block font-medium">Non-Veg Curries</label>
                  <div className="space-y-2">
                    {nonVegCurries.map((curry) => {
                      const existing = meal.nonVegCurries.find(
                        (nv) => nv.id === curry.id
                      );
                      return (
                        <div key={curry.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!existing}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateMeal(index, {
                                  nonVegCurries: [
                                    ...meal.nonVegCurries,
                                    curry.divisible 
                                      ? { id: curry.id, pieces: 1 }
                                      : { id: curry.id },
                                  ],
                                });
                              } else {
                                updateMeal(index, {
                                  nonVegCurries: meal.nonVegCurries.filter(
                                    (nv) => nv.id !== curry.id
                                  ),
                                });
                              }
                            }}
                          />
                          <span>{curry.name}</span>
                          {existing && curry.divisible && (
                            <input
                              type="number"
                              min={1}
                              value={existing.pieces}
                              onChange={(e) => {
                                const updated = meal.nonVegCurries.map((nv) =>
                                  nv.id === curry.id
                                    ? {
                                        ...nv,
                                        pieces: parseInt(e.target.value || 1),
                                      }
                                    : nv
                                );
                                updateMeal(index, { nonVegCurries: updated });
                              }}
                              className="border rounded w-16 px-1"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gravies */}
                <div>
                  <label className="block font-medium">Gravies</label>
                  <div className="grid grid-cols-2 gap-2">
                    {gravies.map((gravy) => (
                      <label key={gravy.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={meal.gravies.includes(gravy.id)}
                          onChange={() => {
                            const selected = meal.gravies.includes(gravy.id);
                            const updated = selected
                              ? meal.gravies.filter((id) => id !== gravy.id)
                              : [...meal.gravies, gravy.id];
                            updateMeal(index, { gravies: updated });
                          }}
                        />
                        {gravy.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meal total */}
                <div className="text-right font-bold">
                  Total: ${meal.total.toFixed(2)}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addAnotherMeal}
              className="w-full py-6 text-lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Add Another Meal
            </Button>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="text-xl font-bold">Order Summary</h3>
              {mealsWithTotals.map((meal, i) => {
                const main = mainMeals.find((m) => m.id === meal.mainMeal);
                const portion = portions.find((p) => p.id === meal.portion);

                const vegNames = meal.vegCurries
                  .map(
                    (id) => merchantConfig.curries.find((c) => c.id === id)?.name
                  )
                  .filter(Boolean);

                const nonVegNames = meal.nonVegCurries
                  .map((nv) => {
                    const curry = merchantConfig.curries.find(
                      (c) => c.id === nv.id
                    );
                    if (!curry) return null;
                    if (curry.divisible) {
                      return `${curry.name} (${nv.pieces} pcs)`;
                    } else {
                      return nv.extraPieces && nv.extraPieces > 0
                        ? `${curry.name} (+${nv.extraPieces} extra)`
                        : curry.name;
                    }
                  })
                  .filter(Boolean);

                const gravyNames = meal.gravies
                  .map(
                    (id) =>
                      merchantConfig.gravies.find((g) => g.id === id)?.name
                  )
                  .filter(Boolean);

                return (
                  <div key={meal.id} className="border-b pb-2 mb-2">
                    <div className="font-medium">Meal #{i + 1}</div>
                    <div>
                      {main?.name || "No main"} ({portion?.name || "No portion"})
                    </div>
                    {vegNames.length > 0 && (
                      <div>Veg Curries: {vegNames.join(", ")}</div>
                    )}
                    {nonVegNames.length > 0 && (
                      <div>Non-Veg Curries: {nonVegNames.join(", ")}</div>
                    )}
                    {gravyNames.length > 0 && (
                      <div>Gravies: {gravyNames.join(", ")}</div>
                    )}
                    <div className="font-bold">
                      Total: ${meal.total.toFixed(2)}
                    </div>
                  </div>
                );
              })}

              <div className="text-lg font-bold">
                Order Total: ${calculatedOrderTotal.toFixed(2)}
              </div>
              <Button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full py-4 text-lg"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
