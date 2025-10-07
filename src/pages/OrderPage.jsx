// src/pages/OrderPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderPage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [settings, setSettings] = useState(null);
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  /** 🔹 Load store & foods */
  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/store/get.php?id=${encodeURIComponent(storeId)}`);
      const data = await res.json();

      console.log("API response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed with status ${res.status}`);
      }

      setStore(data.store);
      setSettings(data.settings || {});
      setFoods(data.foods || []);

      if (data.settings && (!data.settings.isOpen || !data.settings.acceptingOrders)) {
        toast({
          title: "Store Unavailable",
          description: !data.settings.isOpen
            ? "Store is closed right now."
            : "Store is not accepting orders.",
          variant: "destructive",
        });
        navigate("/customer");
      }
    } catch (err) {
      console.error("Store load error:", err);
      toast({
        title: "Error Loading Store",
        description: err.message,
        variant: "destructive",
      });
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

  /** 🔹 Cart helpers */
  const setQty = (foodId, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      const q = Math.max(0, Math.floor(Number(qty) || 0));
      if (q <= 0) delete next[foodId];
      else next[foodId] = q;
      return next;
    });
  };

  const inc = (id) => setQty(id, (cart[id] || 0) + 1);
  const dec = (id) => setQty(id, (cart[id] || 0) - 1);

  /** 🔹 Order summary */
  const selectedItems = useMemo(() => {
    return foods
      .map((f) => {
        const id = f.id;
        const qty = cart[id] || 0;
        return {
          food_id: id,
          name: f.name,
          price: parseFloat(f.price) || 0,
          qty,
        };
      })
      .filter((it) => it.qty > 0);
  }, [foods, cart]);

  const total = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * it.price, 0),
    [selectedItems]
  );

  /** 🔹 Place order */
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items",
        description: "Please select at least one item",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          merchant_id: store.id,
          items: selectedItems.map((it) => ({
            food_id: it.food_id,
            quantity: it.qty,
            price: it.price,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Order failed");
      }

      toast({
        title: "Order Placed!",
        description: `Your order #${json.order_number} was successful`,
      });

      navigate(`/receipt/${json.order_id}`);
    } catch (err) {
      console.error("Order error:", err);
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !store) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <Helmet>
        <title>Order from {store.storeName} - QuickMeal</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/customer"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold">{store.storeName}</h1>
            <p className="text-gray-600">{store.storeAddress}</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-3">Menu</h2>
              {foods.length === 0 ? (
                <div className="text-sm text-gray-500">No menu items available.</div>
              ) : (
                <div className="space-y-3">
                  {foods.map((f) => {
                    const qty = cart[f.id] || 0;
                    const price = parseFloat(f.price) || 0;
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between border rounded p-3"
                      >
                        <div>
                          <div className="font-medium">{f.name}</div>
                          {f.description && (
                            <div className="text-sm text-gray-500">{f.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-700 mr-3">
                            Rs {price.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => dec(f.id)}
                              className="px-2 py-1 rounded border"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => setQty(f.id, Number(e.target.value || 0))}
                              className="w-16 text-center border rounded px-1 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => inc(f.id)}
                              className="px-2 py-1 rounded border"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              {selectedItems.length === 0 ? (
                <div className="text-sm text-gray-500">No items selected</div>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((it) => (
                    <div key={it.food_id} className="flex justify-between">
                      <div className="text-sm">
                        {it.name} × {it.qty}
                      </div>
                      <div className="text-sm font-medium">
                        Rs {(it.qty * it.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <div>Total</div>
                    <div>Rs {((total) || 0).toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handlePlaceOrder}
              className="w-full py-3"
              disabled={loading || !settings?.acceptingOrders}
            >
              {loading ? "Placing order…" : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
