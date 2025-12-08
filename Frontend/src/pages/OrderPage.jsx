// src/pages/OrderPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
                // 1st piece: Portion Price
                items.push({
                  food_id: food.id,
                  quantity: 1,
                  price: primaryNonVegPortionPrice
                });
                // Extra pieces: Calculated by helper (if divisible)
                if (food.is_divisible == 1 && qty > 1) {
                  // We need to add the extra pieces as a separate item or just one item with total price?
                  // Usually better to separate for clarity, or aggregate.
                  // The helper returns the TOTAL price for the extra pieces.
                  // Let's add them as separate line items for clarity if possible, or just one entry.
                  // Existing logic separated them. Let's keep that pattern but use helper logic to be sure.

                  // Actually, the helper returns the TOTAL cost for the extra pieces.
                  // So if we have 2 extra pieces at 50 each, helper returns 100.
                  // We should add an item with quantity (qty-1) and price (food.price).

                  items.push({
                    food_id: food.id,
                    quantity: qty - 1,
                    price: parseFloat(food.price) || 0
                  });
                }
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
    <div className="min-h-screen p-4 bg-gray-50">
      <Helmet><title>Order from {store.storeName} - QuickMeal</title></Helmet>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/customer" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{store.storeName}</h1>
          <p className="text-gray-600">{store.storeAddress}</p>
          {settings?.activeMealTime && (
            <div className="mt-2 inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              Now Serving: {settings.activeMealTime}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* 1. Main Meal Selection */}
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Select Main Meal
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {mainMeals.map(food => (
                <div
                  key={food.id}
                  onClick={() => { setSelectedMain(food); setSelectedPortion(null); }}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedMain?.id === food.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{food.name}</h3>
                    {selectedMain?.id === food.id && <Check className="w-5 h-5 text-orange-600" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{food.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Portion Selection */}
          {selectedMain && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Select Portion
              </h2>
              <RadioGroup value={selectedPortion} onValueChange={setSelectedPortion} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedMain.portion_prices && selectedMain.portion_prices.length > 0 ? (
                  selectedMain.portion_prices.map((pp) => {
                    // Determine display price
                    let displayPrice = parseFloat(pp.price);
                    if (primaryNonVegCurry) {
                      // Use non-veg curry portion price if available
                      const nvPrice = primaryNonVegCurry.prices?.[pp.portion_name];
                      if (nvPrice !== undefined) {
                        displayPrice = parseFloat(nvPrice);
                      }
                    }

                    return (
                      <div key={pp.portion_name}>
                        <RadioGroupItem value={pp.portion_name} id={`portion-${pp.portion_name}`} className="peer sr-only" />
                        <Label
                          htmlFor={`portion-${pp.portion_name}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:text-orange-600 cursor-pointer"
                        >
                          <span className="font-semibold">{pp.portion_name}</span>
                          <span className="text-sm mt-1">Rs {displayPrice.toFixed(2)}</span>
                        </Label>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <RadioGroupItem value="Standard" id="portion-standard" className="peer sr-only" />
                    <Label
                      htmlFor="portion-standard"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:text-orange-600 cursor-pointer"
                    >
                      <span className="font-semibold">Standard</span>
                      <span className="text-sm mt-1">Rs {(parseFloat(selectedMain.price) || 0).toFixed(2)}</span>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </motion.section>
          )}

          {/* 3. Curries & Gravies */}
          <section className={`bg-white p-6 rounded-xl shadow-sm border transition-opacity ${!canSelectSides ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              Add Curries & Sides
              {settings?.freeVegCurries > 0 && (
                <span className="ml-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  First {settings.freeVegCurries} Veg Curries Free!
                </span>
              )}
            </h2>

            {!canSelectSides && (
              <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4 mr-2" />
                Please select a main meal and portion first.
              </div>
            )}

            <div className="space-y-6">
              {[
                { title: "Curries", items: curries },
                { title: "Gravies", items: gravies },
                { title: "Others", items: others }
              ].map(group => group.items.length > 0 && (
                <div key={group.title}>
                  <h3 className="font-semibold text-gray-700 mb-3">{group.title}</h3>
                  <div className="space-y-2">
                    {group.items.map(food => {
                      // Determine Price to Display
                      let priceDisplay = `Rs ${(parseFloat(food.price) || 0).toFixed(2)}`;

                      if (isGravy(food)) {
                        priceDisplay = "Free";
                      } else if (food.is_veg == 1) {
                        // Veg Curry
                        // Complex to show exact price because it depends on count.
                        // Just show standard price? Or "Free / Rs X"?
                        // Let's keep standard price for now.
                      } else {
                        // Non-Veg Curry
                        if (food.id === primaryNonVegCurry?.id) {
                          priceDisplay = <span className="text-orange-600 font-medium">Included in Meal Price</span>;
                        } else {
                          // Secondary
                          if (food.is_divisible == 1) {
                            // Own Price
                            priceDisplay = `Rs ${(parseFloat(food.price) || 0).toFixed(2)}`;
                          } else {
                            // Veg Curry Price
                            const vegPrice = parseFloat(settings?.vegCurryPrice || 0);
                            priceDisplay = `Rs ${vegPrice.toFixed(2)}`;
                          }
                        }
                      }

                      return (
                        <div
                          key={food.id}
                          onClick={() => {
                            const current = selectedCurries[food.id] || 0;
                            if (current > 0) {
                              // Deselect
                              toggleCurry(food.id, false);
                            } else {
                              // Select
                              toggleCurry(food.id, true);
                            }
                          }}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${selectedCurries[food.id] ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200 hover:bg-gray-50'
                            }`}
                        >
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {food.name}
                              {food.is_veg == 1 && <Badge variant="outline" className="text-green-600 border-green-200 text-[10px]">Veg</Badge>}
                            </div>
                            <div className="text-sm text-gray-500">
                              {priceDisplay}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedCurries[food.id] ? (
                              food.is_divisible == 1 ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="outline" size="icon" className="h-8 w-8 bg-white"
                                    onClick={(e) => { e.stopPropagation(); toggleCurry(food.id, false); }}
                                  >
                                    -
                                  </Button>
                                  <span className="w-6 text-center font-medium">{selectedCurries[food.id]}</span>
                                  <Button
                                    variant="outline" size="icon" className="h-8 w-8 bg-white"
                                    onClick={(e) => { e.stopPropagation(); toggleCurry(food.id, true); }}
                                  >
                                    +
                                  </Button>
                                </div>
                              ) : (
                                <Check className="w-5 h-5 text-orange-600" />
                              )
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                        </div>
                      )
                    })
                    }
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-orange-600">Rs {totalPrice.toFixed(2)}</p>
              </div>
              <Button
                onClick={handlePlaceOrder}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8"
                disabled={!canSelectSides || loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
          <div className="h-20"></div> {/* Spacer for fixed bottom bar */}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
