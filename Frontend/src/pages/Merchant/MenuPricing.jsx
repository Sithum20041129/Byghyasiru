// src/pages/Merchant/MenuPricing.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Reusable Food Card
const FoodCard = ({ food, onEdit, onDelete, onToggleAvailability, display }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-xl transition">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-bold">{food.name}</h3>
        {food.food_type === "curry" && food.is_veg == 1 && <Badge className="mt-2" variant="success">VEG</Badge>}
        {food.food_type === "curry" && food.is_veg == 0 && <Badge className="mt-2" variant="destructive">NON-VEG</Badge>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
      </div>
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Switch
          id={`availability-${food.id}`}
          checked={food.is_available == 1}
          onCheckedChange={(checked) => onToggleAvailability(food, checked)}
        />
        <Label htmlFor={`availability-${food.id}`} className="cursor-pointer">
          {food.is_available == 1 ? "Available" : "Unavailable"}
        </Label>
      </div>
    </div>
    <div className="pt-4 border-t">
      {display}
    </div>
  </div >
);

// Updated Food Form - Fixed Checkbox & Extra Piece Logic
const FoodForm = ({ food, portions, onSave, onClose }) => {
  const isEdit = !!food?.id;
  const isMainMeal = food?.food_type === "main_meal";
  const isGravy = food?.food_type === "gravy";
  const isCurry = food?.food_type === "curry" || (!isEdit && !isMainMeal && !isGravy);

  // Form state
  const [name, setName] = useState(food?.name || "");

  // For curry: determine initial veg/non-veg
  const initialIsVeg = isEdit
    ? (food?.is_veg == 1 ? "veg" : "nonveg")
    : "veg";
  const [isVeg, setIsVeg] = useState(initialIsVeg);

  // For non-veg: is_divisible (can sell extra pieces)
  const initialDivisible = isEdit && food?.is_veg == 0 ? food?.is_divisible == 1 : false;
  const [isDivisible, setIsDivisible] = useState(initialDivisible);

  const parsedPrices = typeof food?.prices === 'string'
    ? JSON.parse(food.prices)
    : (food?.prices || {});

  const [prices, setPrices] = useState(() => {
    const initialPrices = {};
    portions.forEach(p => {
      initialPrices[p.name] = parsedPrices[p.name] || "";
    });
    return initialPrices;
  });

  const [extraPiecePrice, setExtraPiecePrice] = useState(food?.extra_piece_price || "");

  const handlePriceChange = (portion, value) => {
    setPrices(p => ({ ...p, [portion]: value }));
  };

  const handleSave = () => {
    const baseData = {
      name: name.trim(),
      food_type: food?.food_type || "curry",
    };

    if (isMainMeal) {
      onSave({
        ...baseData,
        prices,
      });
    } else if (isCurry) {
      onSave({
        ...baseData,
        is_veg: isVeg === "veg" ? 1 : 0,
        is_divisible: isVeg === "nonveg" && isDivisible ? 1 : 0,
        prices: isVeg === "nonveg" ? prices : {},
        extra_piece_price: isVeg === "nonveg" && isDivisible ? extraPiecePrice : "",
      });
    } else if (isGravy) {
      onSave(baseData);
    }
  };

  // Only allow "Can sell extra pieces" for non-veg curries
  const showPortionPrices = isCurry && isVeg === "nonveg";
  const showExtraPieceOption = showPortionPrices;

  return (
    <div className="space-y-6">
      <div>
        <Label>Name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" autoFocus />
      </div>

      {/* Curry Type Selection - Only when adding new curry */}
      {isCurry && !isEdit && (
        <div>
          <Label>Curry Type *</Label>
          <RadioGroup value={isVeg} onValueChange={setIsVeg}>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="veg" />
                <Label htmlFor="veg" className="cursor-pointer font-medium">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nonveg" id="nonveg" />
                <Label htmlFor="nonveg" className="cursor-pointer font-medium">Non-Vegetarian</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Show badge when editing curry */}
      {isCurry && isEdit && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <Badge variant={food.is_veg == 1 ? "success" : "destructive"} className="text-lg">
            {food.is_veg == 1 ? "Vegetarian" : "Non-Vegetarian"}
          </Badge>
        </div>
      )}

      {/* Portion Prices - Only for Non-Veg Curries & Main Meals */}
      {(showPortionPrices || isMainMeal) && (
        <div className="space-y-4 pt-4 border-t">
          <Label className="text-lg font-medium">Portion Prices (₹)</Label>
          {portions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No portions configured in Store Settings.</p>
          ) : (
            portions.map(portion => (
              <div key={portion.id} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">{portion.name}:</span>
                <Input
                  type="number"
                  value={prices[portion.name] || ""}
                  onChange={e => handlePriceChange(portion.name, e.target.value)}
                  placeholder="0"
                  className="w-32"
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Can Sell Extra Pieces - Only for Non-Veg Curries */}
      {showExtraPieceOption && (
        <div className="flex items-center space-x-3 pt-4">
          <Checkbox
            id="divisible"
            checked={isDivisible}
            onChange={(checked) => setIsDivisible(checked)}
          />
          <Label htmlFor="divisible" className="cursor-pointer font-normal">
            Can sell extra pieces
          </Label>
        </div>
      )}

      {/* Extra Piece Price Field */}
      {showExtraPieceOption && isDivisible && (
        <div className="ml-8 -mt-2">
          <Label>Extra Piece Price (₹)</Label>
          <Input
            type="number"
            value={extraPiecePrice}
            onChange={e => setExtraPiecePrice(e.target.value)}
            placeholder="e.g. 50"
            className="w-32"
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {isEdit ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
};

const MenuPricing = () => {
  const [foods, setFoods] = useState([]);
  const [portions, setPortions] = useState([]);
  const [vegCurryPrice, setVegCurryPrice] = useState("");
  const [freeVegCurriesCount, setFreeVegCurriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deletingFood, setDeletingFood] = useState(null);

  // Global veg curry price
  const loadMenu = async () => {
    setLoading(true);
    try {
      const [menuRes, portionsRes, settingsRes] = await Promise.all([
        fetch("/api/merchant/get_menu.php", { credentials: "include" }),
        fetch("/api/merchant/get_portions.php", { credentials: "include" }),
        fetch("/api/merchant/get_settings.php", { credentials: "include" })
      ]);

      const menuData = await menuRes.json();
      const portionsData = await portionsRes.json();
      const settingsData = await settingsRes.json();

      if (menuData.ok) setFoods(menuData.foods || []);
      if (portionsData.ok) setPortions(portionsData.portions || []);
      if (settingsData.ok) {
        setVegCurryPrice(settingsData.veg_curry_price || "");
        setFreeVegCurriesCount(settingsData.free_veg_curries_count || 0);
      }
    } catch (err) {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMenu(); }, []);

  const handleSave = async (formData, isEdit) => {
    const payload = {
      ...formData,
      meal_time: 'all', // Universal meal time
    };

    if (!isEdit) {
      payload.food_type = editingFood?.food_type || "curry";
    } else {
      payload.id = editingFood.id;
    }

    const endpoint = isEdit ? "/api/merchant/update_food.php" : "/api/merchant/add_food.php";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(isEdit ? "Updated!" : "Added!");
        setIsModalOpen(false);
        setEditingFood(null);
        loadMenu();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch("/api/merchant/delete_food.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deletingFood.id })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Deleted!");
        loadMenu();
      } else toast.error(data.error || "Delete failed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Delete failed: " + err.message);
    }
    finally { setDeletingFood(null); }
  };

  const sections = {
    main_meal: foods.filter(f => f.food_type === "main_meal"),
    curry: foods.filter(f => f.food_type === "curry"),
    gravy: foods.filter(f => f.food_type === "gravy")
  };

  const saveCurrySettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/merchant/settings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          veg_curry_price: vegCurryPrice,
          free_veg_curries_count: freeVegCurriesCount
        })
      });
      const data = await res.json();
      if (data.ok) toast.success("Settings saved!");
      else toast.error(data.error || "Save failed");
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleAvailability = async (food, isAvailable) => {
    // Optimistic update
    setFoods(prev => prev.map(f =>
      f.id === food.id ? { ...f, is_available: isAvailable ? 1 : 0 } : f
    ));

    try {
      const res = await fetch("/api/merchant/update_food_availability.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: food.id, is_available: isAvailable })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status} ${res.statusText}. Response: ${text.substring(0, 100)}...`);
      }

      const data = await res.json();

      if (!data.ok) {
        // Revert on failure
        setFoods(prev => prev.map(f =>
          f.id === food.id ? { ...f, is_available: !isAvailable ? 1 : 0 } : f
        ));
        toast.error(data.error || "Failed to update availability");
      }
    } catch (err) {
      console.error("Toggle availability error:", err);
      // Revert on error
      setFoods(prev => prev.map(f =>
        f.id === food.id ? { ...f, is_available: !isAvailable ? 1 : 0 } : f
      ));
      toast.error("Network error");
    }
  };

  const renderPriceDisplay = (food) => {
    if (food.food_type === "gravy") {
      return <Badge variant="outline" className="text-lg font-medium">FREE</Badge>;
    }
    if (food.food_type === "curry" && food.is_veg == 1) {
      return <Badge variant="secondary" className="text-lg">₹{vegCurryPrice} (All Veg Curries)</Badge>;
    }
    if (food.food_type === "curry" && food.is_divisible == 1) {
      return (
        <div className="text-sm space-y-1">
          {portions.map(p => food.prices?.[p.name] && (
            <div key={p.id}>{p.name}: ₹{food.prices[p.name]}</div>
          ))}
          <div className="text-green-600 font-semibold">Extra Piece: ₹{food.extra_piece_price}</div>
        </div>
      );
    }
    return (
      <div className="text-sm space-y-1">
        {portions.map(p => food.prices?.[p.name] && (
          <div key={p.id}>{p.name}: ₹{food.prices[p.name]}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Menu & Pricing</h1>
        <div className="flex items-center gap-4">
          {/* Meal time selection removed for universal menu */}
        </div>
      </div>

      {loading ? (
        <p className="text-center py-20 text-gray-500">Loading your menu...</p>
      ) : (
        <div className="space-y-12">

          {/* MAIN MEALS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Main Meals</h2>
              <Button onClick={() => { setEditingFood({ food_type: "main_meal" }); setIsModalOpen(true); }}>
                Add Main Meal
              </Button>
            </div>
            <div className="grid gap-5">
              {sections.main_meal.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-500">No main meals yet</div>
              ) : (
                sections.main_meal.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={renderPriceDisplay(food)}
                  />
                ))
              )}
            </div>
          </div>

          {/* CURRIES */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Curries</h2>
              <Button onClick={() => { setEditingFood({ food_type: "curry" }); setIsModalOpen(true); }}>
                Add Curry
              </Button>
            </div>

            {/* Curries Section */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">All Vegetarian Curries</h2>
                    <p className="text-sm text-gray-500">Set the global price and free allowance for veg curries</p>
                  </div>
                  <Button
                    onClick={saveCurrySettings}
                    disabled={savingSettings}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {savingSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Global Veg Curry Price (₹)</Label>
                    <Input
                      type="number"
                      value={vegCurryPrice}
                      onChange={(e) => setVegCurryPrice(e.target.value)}
                      className="mt-1"
                      placeholder="e.g. 80"
                    />
                  </div>
                  <div>
                    <Label>Free Veg Curries with Main Meal</Label>
                    <Input
                      type="number"
                      value={freeVegCurriesCount}
                      onChange={(e) => setFreeVegCurriesCount(e.target.value)}
                      className="mt-1"
                      placeholder="e.g. 3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of veg curries included for free</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {sections.curry.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-500">No curries yet</div>
              ) : (
                sections.curry.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={renderPriceDisplay(food)}
                  />
                ))
              )}
            </div>
          </div>

          {/* GRAVIES */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gravies</h2>
              <Button onClick={() => { setEditingFood({ food_type: "gravy" }); setIsModalOpen(true); }}>
                Add Gravy
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-blue-700">All Gravies are FREE</p>
              <p className="text-blue-600 mt-2">Included with every meal</p>
            </div>

            <div className="grid gap-5">
              {sections.gravy.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl text-gray-500">No gravies yet</div>
              ) : (
                sections.gravy.map(food => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => { setEditingFood(food); setIsModalOpen(true); }}
                    onDelete={() => setDeletingFood(food)}
                    onToggleAvailability={toggleAvailability}
                    display={<Badge variant="outline" className="text-lg">FREE</Badge>}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFood?.id ? "Edit" : "Add"}{" "}
              {editingFood?.food_type === "main_meal" ? "Main Meal" :
                editingFood?.food_type === "curry" ? "Curry" : "Gravy"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingFood?.id ? "update" : "add"} a food item.
            </DialogDescription>
          </DialogHeader>
          <FoodForm
            food={editingFood}
            portions={portions}
            onSave={(data) => handleSave(data, !!editingFood?.id)}
            onClose={() => { setIsModalOpen(false); setEditingFood(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingFood} onOpenChange={() => setDeletingFood(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingFood?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuPricing;