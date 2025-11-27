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

  // Group foods
  const { mainMeals, curries, gravies, others } = useMemo(() => {
    const groups = { mainMeals: [], curries: [], gravies: [], others: [] };
    foods.forEach(f => {
      // Check both food_type and category, normalize to lowercase
      const type = (f.food_type || f.category || '').toLowerCase();

      // More flexible matching
      if (type.includes('main') || type.includes('rice') || type.includes('biryani') || type.includes('fried') || type.includes('kottu')) {
        groups.mainMeals.push(f);
      } else if (type.includes('curry')) {
        groups.curries.push(f);
      } else if (type.includes('gravy') || type.includes('sauce')) {
        groups.gravies.push(f);
      } else {
        groups.others.push(f);
      }
    });
    return groups;
  }, [foods]);

  // Calculate Total
  const totalPrice = useMemo(() => {
    let total = 0;
    if (selectedMain && selectedPortion) {
      // Main meal price based on portion
      total += parseFloat(selectedMain.prices?.[selectedPortion] || selectedMain.price || 0);
    }

    // Add curries/gravies
    let vegCurryCount = 0;
    const freeVegLimit = settings?.freeVegCurries || 0;
    const vegPrice = settings?.vegCurryPrice || 0;

    Object.entries(selectedCurries).forEach(([id, qty]) => {
      if (qty > 0) {
        const food = foods.find(f => f.id == id);
        if (food) {
          if (food.is_veg == 1) {
            vegCurryCount += qty;
          } else {
            // Non-veg curries always charged
            total += (parseFloat(food.price) || 0) * qty;
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
  }, [selectedMain, selectedPortion, selectedCurries, foods, settings]);

  const handlePlaceOrder = async () => {
    if (!selectedMain || !selectedPortion) {
      toast({ title: "Incomplete Selection", description: "Please select a main meal and portion.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const items = [];

      // Add Main Meal
      items.push({
        food_id: selectedMain.id,
        quantity: 1,
        price: parseFloat(selectedMain.prices?.[selectedPortion] || selectedMain.price || 0),
        portion: selectedPortion
      });

      // Add Curries/Gravies
      let vegCurriesToAdd = [];
      const freeVegLimit = settings?.freeVegCurries || 0;
      const vegPrice = settings?.vegCurryPrice || 0;

      Object.entries(selectedCurries).forEach(([id, qty]) => {
        if (qty > 0) {
          const food = foods.find(f => f.id == id);
          if (food) {
            if (food.is_veg == 1) {
              // Collect veg curries to handle quota later
              for (let i = 0; i < qty; i++) {
                vegCurriesToAdd.push({
                  food_id: food.id,
                  quantity: 1,
                  price: 0 // Placeholder, will update
                });
              }
            } else {
              // Non-veg: add directly
              items.push({
                food_id: food.id,
                quantity: qty,
                price: parseFloat(food.price) || 0
              });
            }
          }
        }
      });

      // Apply pricing to veg curries
      // Logic: First N are free, rest are charged
      // We can just set the price for the excess items
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
    setSelectedCurries(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + (increment ? 1 : -1));
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
                  selectedMain.portion_prices.map((pp) => (
                    <div key={pp.portion_name}>
                      <RadioGroupItem value={pp.portion_name} id={`portion-${pp.portion_name}`} className="peer sr-only" />
                      <Label
                        htmlFor={`portion-${pp.portion_name}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:text-orange-600 cursor-pointer"
                      >
                        <span className="font-semibold">{pp.portion_name}</span>
                        <span className="text-sm mt-1">Rs {parseFloat(pp.price).toFixed(2)}</span>
                      </Label>
                    </div>
                  ))
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
                    {group.items.map(food => (
                      <div
                        key={food.id}
                        onClick={() => {
                          const current = selectedCurries[food.id] || 0;
                          if (current > 0) {
                            // Deselect
                            setSelectedCurries(prev => {
                              const { [food.id]: _, ...rest } = prev;
                              return rest;
                            });
                          } else {
                            // Select (default qty 1)
                            setSelectedCurries(prev => ({ ...prev, [food.id]: 1 }));
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
                          <div className="text-sm text-gray-500">Rs {(parseFloat(food.price) || 0).toFixed(2)}</div>
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
                    ))}
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
