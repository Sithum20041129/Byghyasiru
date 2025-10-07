import React, { useEffect, useState } from "react";
import { useMerchantConfig } from "@/store/merchantConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

console.log("✅ PHP-INTEGRATED MenuPricing.jsx LOADED");

export default function MenuPricing() {
  const { menuItems, setMenuItems } = useMerchantConfig();
  const [loading, setLoading] = useState(false);
  const [portions, setPortions] = useState([]); // Loaded from store settings

  const [newFood, setNewFood] = useState({
    name: "",
    description: "",
    food_type: "",
    isVeg: false,
    isDivisible: false,
    extraPiecePrice: "",
    prices: {}, // { portionName: price }
  });

  // ✅ Fetch menu and portions on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, portionRes] = await Promise.all([
          fetch("/api/merchant/get_menu.php"),
          fetch("/api/merchant/get_portions.php"),
        ]);

        if (menuRes.ok) {
          const data = await menuRes.json();
          if (data.ok) {
            setMenuItems(data.foods || []);
          } else {
            toast.error("Failed to load menu: " + (data.error || "Unknown"));
          }
        }

        if (portionRes.ok) {
          const pdata = await portionRes.json();
          if (pdata.ok) {
            setPortions(pdata.portions || []);
          } else {
            toast.error("Failed to load portion categories.");
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading menu data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setMenuItems]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewFood((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handle portion price change
  const handlePriceChange = (portion, value) => {
    setNewFood((prev) => ({
      ...prev,
      prices: { ...prev.prices, [portion]: value },
    }));
  };

  // ✅ Add new food
  const handleAddFood = async () => {
    if (!newFood.name || !newFood.food_type) {
      toast.error("Please fill required fields (Name and Type).");
      return;
    }

    const payload = {
      name: newFood.name,
      description: newFood.description,
      food_type: newFood.food_type.toLowerCase().replace(" ", "_"),
      is_veg: newFood.isVeg,
      is_divisible: newFood.isDivisible,
      extra_piece_price: newFood.extraPiecePrice || null,
      prices: Object.entries(newFood.prices).map(([portion, price]) => ({
        portion,
        price: parseFloat(price),
      })),
    };

    try {
      setLoading(true);
      const res = await fetch("/api/merchant/add_food.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Add failed");

      toast.success("🍛 Food added successfully!");
      setNewFood({
        name: "",
        description: "",
        food_type: "",
        isVeg: false,
        isDivisible: false,
        extraPiecePrice: "",
        prices: {},
      });

      // Refresh menu
      const refreshed = await fetch("/api/merchant/get_menu.php");
      const freshData = await refreshed.json();
      if (freshData.ok) setMenuItems(freshData.foods);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add food item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete food item (future)
  const handleDelete = async (id) => {
    toast.error("Delete not implemented yet in backend.");
  };

  // 🧠 Show portions and price input conditions
  const showPortionPrices =
    newFood.food_type === "Main Meal" ||
    (newFood.food_type === "Curry" && !newFood.isVeg);

  const showExtraPiece =
    newFood.food_type === "Curry" &&
    !newFood.isVeg &&
    newFood.isDivisible;

  return (
    <div className="p-8 bg-white shadow-lg rounded-2xl space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">Menu & Pricing</h1>

      {/* 🧾 Add Food Section */}
      <section className="space-y-6 border-b pb-6">
        <h2 className="text-xl font-semibold">Add New Food</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <Label>Name *</Label>
            <Input
              name="name"
              value={newFood.name}
              onChange={handleChange}
              placeholder="Ex: Chicken Fried Rice"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Input
              name="description"
              value={newFood.description}
              onChange={handleChange}
              placeholder="Optional..."
            />
          </div>

          {/* Food Type */}
          <div>
            <Label>Food Type *</Label>
            <Select
              onValueChange={(val) =>
                setNewFood((prev) => ({ ...prev, food_type: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Meal">Main Meal</SelectItem>
                <SelectItem value="Curry">Curry</SelectItem>
                <SelectItem value="Gravy">Gravy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Curry options */}
          {newFood.food_type === "Curry" && (
            <>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={newFood.isVeg}
                  onCheckedChange={(checked) =>
                    setNewFood((prev) => ({ ...prev, isVeg: checked }))
                  }
                />
                <Label>Vegetarian Curry?</Label>
              </div>

              {!newFood.isVeg && (
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    checked={newFood.isDivisible}
                    onCheckedChange={(checked) =>
                      setNewFood((prev) => ({ ...prev, isDivisible: checked }))
                    }
                  />
                  <Label>Divisible?</Label>
                </div>
              )}
            </>
          )}

          {/* Portion Prices */}
          {showPortionPrices && portions.length > 0 && (
            <div className="col-span-2">
              <h3 className="font-semibold mt-4 mb-2">Portion Prices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portions.map((p) => (
                  <div key={p.id}>
                    <Label>{p.name}</Label>
                    <Input
                      type="number"
                      placeholder={`Price for ${p.name}`}
                      value={newFood.prices[p.name] || ""}
                      onChange={(e) =>
                        handlePriceChange(p.name, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra piece price */}
          {showExtraPiece && (
            <div>
              <Label>Extra Piece Price</Label>
              <Input
                type="number"
                name="extraPiecePrice"
                value={newFood.extraPiecePrice}
                onChange={handleChange}
                placeholder="Ex: 120"
              />
            </div>
          )}
        </div>

        <Button
          className="mt-6 w-full"
          onClick={handleAddFood}
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Food to Menu"}
        </Button>
      </section>

      {/* 🍱 Menu List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Current Menu</h2>
        {loading ? (
          <p className="text-gray-500">Loading menu...</p>
        ) : menuItems.length === 0 ? (
          <p className="text-gray-500">No food items added yet.</p>
        ) : (
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 border rounded-xl hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.food_type} •{" "}
                    {item.portion_prices?.length
                      ? `${item.portion_prices.length} portion(s)`
                      : "No portion prices"}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
