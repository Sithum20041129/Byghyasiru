// src/pages/OrderPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const OrderPage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [settings, setSettings] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selection State
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [selectedCurries, setSelectedCurries] = useState({}); // { foodId: qty }

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  /** 🔹 Load store & foods */
  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/store/get.php?id=${encodeURIComponent(storeId)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed with status ${res.status}`);
      }

      console.log("OrderPage: Store data loaded", data); // DEBUG
      setStore(data.store);
      setSettings(data.settings || {});
      setFoods(data.foods || []);

      if (data.settings && (!data.settings.isOpen || !data.settings.acceptingOrders)) {
        console.warn("OrderPage: Store unavailable", data.settings); // DEBUG
        toast({
          title: "Store Unavailable",
          description: !data.settings.isOpen ? "Store is closed." : "Not accepting orders.",
          variant: "destructive",
        });
        navigate("/customer");
      }
    } catch (err) {
      console.error("OrderPage: Error loading store", err); // DEBUG
      toast({ title: "Error", description: err.message, variant: "destructive" });
      navigate("/customer");
    } finally {
      setLoading(false);
    }
  }, [storeId, toast, navigate]);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/login");
      return;
    }
    loadStore();
  }, [user, loadStore, navigate]);

  // Helper to identify gravies
  const isGravy = useCallback((food) => {
    if (!food) return false;
    const type = (food.food_type || '').toLowerCase();
    const category = (food.category || '').toLowerCase();
    return type.includes('gravy') || type.includes('sauce') || category.includes('gravy') || category.includes('sauce');
  }, []);

  // Group foods
  const { mainMeals, curries, gravies, others } = useMemo(() => {
    const groups = { mainMeals: [], curries: [], gravies: [], others: [] };
    foods.forEach(f => {
      // Check both food_type and category, normalize to lowercase
      const type = (f.food_type || '').toLowerCase();
      const category = (f.category || '').toLowerCase();

      // Helper to check if either field contains a keyword
      const isType = (keyword) => type.includes(keyword) || category.includes(keyword);

      // More flexible matching
      if (isType('main') || isType('rice') || isType('biryani') || isType('fried') || isType('kottu')) {
        groups.mainMeals.push(f);
      } else if (isType('gravy') || isType('sauce')) {
        // Check gravies BEFORE curries to ensure they are categorized correctly
        groups.gravies.push(f);
      } else if (isType('curry')) {
        groups.curries.push(f);
      } else {
        groups.others.push(f);
      }
    });
    return groups;
  }, [foods]);

  // 🔹 Identify Primary Non-Veg Curry (Most Expensive)
  const primaryNonVegCurry = useMemo(() => {
    if (!selectedPortion) return null;

    const nonVegFoods = Object.keys(selectedCurries)
      .map(id => foods.find(f => f.id == id))
      .filter(f => f && f.is_veg == 0 && !isGravy(f) && selectedCurries[f.id] > 0);

    if (nonVegFoods.length === 0) return null;

    // Sort by portion price (descending)
    // If portion price is missing, fallback to base price
    return nonVegFoods.sort((a, b) => {
      const priceA = parseFloat(a.prices?.[selectedPortion] || a.price || 0);
      const priceB = parseFloat(b.prices?.[selectedPortion] || b.price || 0);
      return priceB - priceA;
    })[0];
  }, [selectedCurries, foods, selectedPortion, isGravy]);

  // 🔹 Pricing Helper Function
  const calculateItemPrice = useCallback((food, qty, isPrimary, settings) => {
    if (!food || qty <= 0) return 0;
    const vegPrice = parseFloat(settings?.vegCurryPrice || 0);

    // DEBUG LOG
    console.log(`Pricing Debug [${food.name}]:`, {
      qty,
      isPrimary,
      isDivisible: food.is_divisible,
      price: food.price,
      extraPrice: food.extra_piece_price,
      vegPrice
    });

    if (isGravy(food)) return 0; // Gravies are free

    if (food.is_veg == 1) {
      return 0;
    }

    // Non-Veg Logic
    if (isPrimary) {
      // Primary Curry
      // 1st piece: Covered by Portion Price
      // Extra pieces: Charged at OWN price (or extra_piece_price) if divisible
      if (food.is_divisible == 1 && qty > 1) {
        const extraPrice = parseFloat(food.extra_piece_price || food.price || 0);
        return (qty - 1) * extraPrice;
      }
      return 0;
    } else {
      // Secondary Curry
      if (food.is_divisible == 1) {
        // Divisible: Charged at OWN price (or extra_piece_price)
        const itemPrice = parseFloat(food.extra_piece_price || food.price || 0);
        return qty * itemPrice;
      } else {
        // Non-Divisible: Charged at VEG CURRY price
        return qty * vegPrice;
      }
    }
  }, [isGravy]);

  // Calculate Total
  const totalPrice = useMemo(() => {
    let total = 0;
    const vegPrice = parseFloat(settings?.vegCurryPrice || 0);

    // 1. Calculate Base Meal Price
    if (selectedMain && selectedPortion) {
      if (primaryNonVegCurry) {
        // If Non-Veg Curry selected: Use PRIMARY curry's portion price
        const portionPrice = primaryNonVegCurry.prices?.[selectedPortion];
        total += parseFloat(portionPrice || primaryNonVegCurry.price || 0);
      } else {
        // Vegetarian: Use Main Meal portion price
        total += parseFloat(selectedMain.prices?.[selectedPortion] || selectedMain.price || 0);
      }
    }

    // 2. Add OTHER curries/gravies
    let vegCurryCount = 0;
    const freeVegLimit = settings?.freeVegCurries || 0;

    Object.entries(selectedCurries).forEach(([id, qty]) => {
      if (qty > 0) {
        const food = foods.find(f => f.id == id);
        if (food) {
          if (isGravy(food)) {
            // Gravies are free
          } else if (food.is_veg == 1) {
            vegCurryCount += qty;
          } else {
            // Non-Veg Curries
            const isPrimary = food.id === primaryNonVegCurry?.id;
            total += calculateItemPrice(food, qty, isPrimary, settings);
          }
        }
      }
    });

    // Calculate veg curry cost
    if (vegCurryCount > freeVegLimit) {
      const chargeableVeg = vegCurryCount - freeVegLimit;
      total += chargeableVeg * vegPrice;
    }

    return total;
  }, [selectedMain, selectedPortion, selectedCurries, foods, settings, primaryNonVegCurry, isGravy, calculateItemPrice]);

  const handlePlaceOrder = async () => {
    if (!selectedMain || !selectedPortion) {
      toast({ title: "Incomplete Selection", description: "Please select a main meal and portion.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const items = [];
      const vegPrice = parseFloat(settings?.vegCurryPrice || 0);

      // Determine Base Prices
      let mainMealPrice = 0;
      let primaryNonVegPortionPrice = 0;

      if (primaryNonVegCurry) {
        // Main meal is free/cancelled out
        mainMealPrice = 0;
        // Primary Non-Veg Curry takes the portion price
        primaryNonVegPortionPrice = parseFloat(primaryNonVegCurry.prices?.[selectedPortion] || primaryNonVegCurry.price || 0);
      } else {
        // Standard Vegetarian Pricing
        mainMealPrice = parseFloat(selectedMain.prices?.[selectedPortion] || selectedMain.price || 0);
      }

      // Add Main Meal
      items.push({
        food_id: selectedMain.id,
        quantity: 1,
        price: mainMealPrice,
        portion: selectedPortion
      });

      // Add Curries/Gravies
      let vegCurriesToAdd = [];
      const freeVegLimit = settings?.freeVegCurries || 0;

      Object.entries(selectedCurries).forEach(([id, qty]) => {
        if (qty > 0) {
          const food = foods.find(f => f.id == id);
          if (food) {
            if (isGravy(food)) {
              // Gravies are free
              items.push({
                food_id: food.id,
                quantity: qty,
                price: 0
              });
            } else if (food.is_veg == 1) {
              // Collect veg curries to handle quota later
              for (let i = 0; i < qty; i++) {
                vegCurriesToAdd.push({
                  food_id: food.id,
                  quantity: 1,
                  price: 0 // Placeholder, will update
                });
              }
            } else {
              // Non-Veg Curries
              const isPrimary = food.id === primaryNonVegCurry?.id;

              if (isPrimary) {
                // Primary Curry
                // Consolidated Logic: Merge Portion Price + Extra Pieces into ONE line item
                // Total Price = PortionPrice + (ExtraQty * ExtraUnitPrice)
                // Unit Price sent to DB = Total Price / Total Qty

                let totalPrimaryCost = primaryNonVegPortionPrice;
                let extraCost = 0;

                if (food.is_divisible == 1 && qty > 1) {
                  const extraUnitCost = parseFloat(food.extra_piece_price || food.price) || 0;
                  extraCost = (qty - 1) * extraUnitCost;
                }

                const finalTotalCost = totalPrimaryCost + extraCost;
                const finalUnitPrice = finalTotalCost / qty;

                items.push({
                  food_id: food.id,
                  quantity: qty,
                  price: finalUnitPrice
                });
              } else {
                // Secondary Curry
                // We can use the helper to determine the unit price effectively.
                // Helper returns TOTAL price for the qty.
                // So unit price = Total / qty.

                const totalForSecondary = calculateItemPrice(food, qty, false, settings);
                const unitPrice = totalForSecondary / qty;

                items.push({
                  food_id: food.id,
                  quantity: qty,
                  price: unitPrice
                });
              }
            }
          }
        }
      });

      // Apply pricing to veg curries
      // Logic: First N are free, rest are charged
      vegCurriesToAdd.forEach((item, index) => {
        if (index >= freeVegLimit) {
          item.price = vegPrice;
        } else {
          item.price = 0;
        }
        items.push(item);
      });

      const res = await fetch("/api/orders/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          merchant_id: store.id,
          items: items,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Order failed");

      toast({ title: "Order Placed!", description: `Order #${json.order_number} successful` });
      navigate(`/receipt/${json.order_id}`);
    } catch (err) {
      toast({ title: "Order Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleCurry = (id, increment) => {
    const food = foods.find(f => f.id === id);
    if (!food) return;

    setSelectedCurries(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + (increment ? 1 : -1));

      // If non-divisible, max is 1
      if (food.is_divisible == 0 && next > 1) return prev;

      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  if (loading && !store) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!store) return <div className="min-h-screen flex items-center justify-center">Store not found</div>;

  const canSelectSides = selectedMain && selectedPortion;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Helmet><title>Order from {store.storeName} - QuickMeal</title></Helmet>

      {/* Header Banner */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/customer" className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{store.storeName}</h1>
            <p className="text-xs text-gray-500">{store.storeAddress}</p>
          </div>
          <div className="w-10"></div> {/* Spacer balance */}
        </div>
        {settings?.activeMealTime && (
          <div className="bg-orange-50 border-t border-orange-100 py-1.5 text-center">
            <span className="text-xs font-medium text-orange-700 uppercase tracking-wider">
              Now Serving: {settings.activeMealTime}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* 1. Main Meal Selection */}
        <section>
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold mr-3 shadow-md border-2 border-white ring-2 ring-orange-100">1</div>
            <h2 className="text-2xl font-bold text-gray-800">Choose Your Meal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainMeals.map(food => (
              <motion.div
                key={food.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedMain(food); setSelectedPortion(null); }}
                className={`relative cursor-pointer rounded-xl border-2 p-5 shadow-sm transition-all duration-200 overflow-hidden ${selectedMain?.id === food.id
                  ? 'border-orange-500 bg-white ring-4 ring-orange-100 shadow-md'
                  : 'border-transparent bg-white hover:shadow-md'
                  }`}
              >
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${selectedMain?.id === food.id ? 'text-orange-700' : 'text-gray-900'}`}>{food.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{food.description || "Refueling and delicious."}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMain?.id === food.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200'
                    }`}>
                    {selectedMain?.id === food.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
                {selectedMain?.id === food.id && (
                  <div className="absolute inset-0 bg-orange-50 opacity-20 pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2. Portion Selection */}
        <AnimatePresence mode="wait">
          {selectedMain && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold mr-3 shadow-md border-2 border-white ring-2 ring-orange-100">2</div>
                <h2 className="text-2xl font-bold text-gray-800">Select Portion</h2>
              </div>

              <RadioGroup value={selectedPortion} onValueChange={setSelectedPortion} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedMain.portion_prices && selectedMain.portion_prices.length > 0 ? (
                  selectedMain.portion_prices.map((pp) => {
                    let displayPrice = parseFloat(pp.price);
                    if (primaryNonVegCurry) {
                      const nvPrice = primaryNonVegCurry.prices?.[pp.portion_name];
                      if (nvPrice !== undefined) displayPrice = parseFloat(nvPrice);
                    }

                    return (
                      <div key={pp.portion_name}>
                        <RadioGroupItem value={pp.portion_name} id={`portion-${pp.portion_name}`} className="peer sr-only" />
                        <Label
                          htmlFor={`portion-${pp.portion_name}`}
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-100 bg-white p-4 h-full hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 peer-data-[state=checked]:shadow-md relative overflow-hidden group"
                        >
                          <span className="font-bold text-gray-700 group-hover:text-orange-700 peer-data-[state=checked]:text-orange-700">{pp.portion_name}</span>
                          <span className="text-sm font-medium text-gray-500 mt-2 group-hover:text-orange-600 peer-data-[state=checked]:text-orange-600">Rs {displayPrice.toFixed(2)}</span>
                          <div className="absolute top-2 right-2 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity">
                            <Check className="w-4 h-4 text-orange-600" />
                          </div>
                        </Label>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <RadioGroupItem value="Standard" id="portion-standard" className="peer sr-only" />
                    <Label
                      htmlFor="portion-standard"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-100 bg-white p-4 hover:border-orange-200 hover:bg-orange-50 transition-all cursor-pointer peer-data-[state=checked]:border-orange-600 peer-data-[state=checked]:bg-orange-50 peer-data-[state=checked]:shadow-md"
                    >
                      <span className="font-bold text-gray-700">Standard</span>
                      <span className="text-sm font-medium text-gray-500 mt-2">Rs {(parseFloat(selectedMain.price) || 0).toFixed(2)}</span>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 3. Curries & Gravies */}
        <section className={`transition-all duration-500 ${!canSelectSides ? 'opacity-40 grayscale pointer-events-none filter blur-[1px]' : 'opacity-100'}`}>
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold mr-3 shadow-md border-2 border-white ring-2 ring-orange-100">3</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">Customize Your Plate</h2>
              {settings?.freeVegCurries > 0 && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  ✨ First {settings.freeVegCurries} Veg Curries are FREE
                </p>
              )}
            </div>
          </div>

          {!canSelectSides && (
            <div className="text-center py-8 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 mb-8">
              <p className="text-gray-500 font-medium">Select a main meal and portion to unlock add-ons</p>
            </div>
          )}

          <div className="space-y-8">
            {[
              { title: "Curries", items: curries, icon: "🥘" },
              { title: "Gravies & Sauces", items: gravies, icon: "🥣" },
              { title: "Extras", items: others, icon: "🥤" }
            ].map(group => group.items.length > 0 && (
              <div key={group.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                  <span className="mr-2 text-xl">{group.icon}</span> {group.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map(food => {
                    let priceDisplay = `Rs ${(parseFloat(food.price) || 0).toFixed(0)}`;
                    let isFree = false;
                    let isIncluded = false;

                    if (isGravy(food)) {
                      priceDisplay = "FREE";
                      isFree = true;
                    } else if (food.id === primaryNonVegCurry?.id) {
                      priceDisplay = "Included";
                      isIncluded = true;
                    } else if (food.is_veg == 0 && food.is_divisible == 0) {
                      const vegPrice = parseFloat(settings?.vegCurryPrice || 0);
                      priceDisplay = `Rs ${vegPrice.toFixed(0)}`;
                    }

                    const isSelected = selectedCurries[food.id] > 0;

                    return (
                      <motion.div
                        key={food.id}
                        layout
                        onClick={() => !isSelected && toggleCurry(food.id, true)}
                        className={`relative border rounded-xl overflow-hidden transition-all ${isSelected
                          ? 'border-orange-500 bg-orange-50/50 shadow-md ring-1 ring-orange-200'
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                          }`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800 pr-2 leading-tight">
                              {food.name}
                            </div>
                            {food.is_veg == 1 && (
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" title="Vegetarian" />
                            )}
                          </div>

                          <div className="flex items-end justify-between mt-2">
                            <div className={`text-sm font-medium ${isFree ? 'text-green-600' : isIncluded ? 'text-orange-600' : 'text-gray-500'}`}>
                              {priceDisplay}
                            </div>

                            {isSelected ? (
                              <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 shadow-sm border border-gray-200" onClick={(e) => e.stopPropagation()}>
                                {food.is_divisible == 1 ? (
                                  <>
                                    <button
                                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                                      onClick={(e) => { e.stopPropagation(); toggleCurry(food.id, false); }}
                                    >
                                      -
                                    </button>
                                    <span className="w-5 text-center font-bold text-gray-800 text-sm">{selectedCurries[food.id]}</span>
                                    <button
                                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                                      onClick={(e) => { e.stopPropagation(); toggleCurry(food.id, true); }}
                                    >
                                      +
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="w-7 h-7 flex items-center justify-center text-orange-600 bg-orange-50 rounded-md"
                                    onClick={(e) => { e.stopPropagation(); toggleCurry(food.id, false); }}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-orange-500">
                                <span className="text-xl leading-none">+</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Modern Floating Bottom Bar */}
      <AnimatePresence>
        {canSelectSides && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-3xl mx-auto bg-gray-900/90 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 pl-6 flex items-center justify-between border border-gray-800">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Estimated Total</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-numeric">Rs {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                size="lg"
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-orange-900/20 transition-all transform active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Order Now <ArrowLeft className="w-4 h-4 rotate-180" />
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OrderPage;
